#!/usr/bin/env node
import http from 'node:http';
import fs from 'node:fs';
import { exec } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanPorts, isDefaultHidden } from './src/scanner.js';
import { createEnricher } from './src/enricher.js';
import { renderDashboard } from './src/ui.js';
import { initPreferences } from './src/preferences.js';
import { fetchExternalFavicon } from './src/favicon.js';
import { SCAN_INTERVAL_MS } from './src/constants.js';
import { checkForUpdate } from './src/update-check.js';

const PORT = parseInt(process.argv[2] || process.env.PORT || '2999', 10);
const DATA_DIR = process.env.HARBOUR_DATA_DIR || path.join(process.cwd(), 'data');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, 'public');
const CURRENT_VERSION = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')).version;

let updateInfo = null;

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

let latestServices = [];
const enricher = createEnricher();

async function runScan() {
  try {
    const services = await scanPorts();
    latestServices = await enricher.enrichServices(services);

    // Seed default-hidden list on first run
    const { hidden } = await prefs.getPreferences();
    if (hidden.length === 0 && latestServices.length > 0) {
      const ownPort = server.address()?.port || PORT;
      const defaultHidden = latestServices
        .filter(e => isDefaultHidden(e.port, ownPort))
        .map(e => ({ port: e.port, name: e.name }));
      if (defaultHidden.length > 0) {
        await prefs.setHidden(defaultHidden);
      }
    }
  } catch {
    // keep previous results on failure
  }
}

/* ---- HTTP helpers ---- */

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString()));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

async function readJsonBody(req, res) {
  try {
    return await readBody(req);
  } catch {
    sendJson(res, 400, { error: 'Invalid JSON' });
    return null;
  }
}

const prefs = await initPreferences(DATA_DIR);

/* ---- Route handlers ---- */

const VALID_THEMES = ['system', 'light', 'dark'];

async function handlePreferences(req, res) {
  if (req.method === 'GET') {
    return sendJson(res, 200, await prefs.getPreferences());
  }

  const body = await readJsonBody(req, res);
  if (body === null) return;

  if (req.url === '/api/preferences/hidden' || req.url === '/api/preferences/pinned') {
    if (!Array.isArray(body)) return sendJson(res, 400, { error: 'Body must be an array' });
    const setter = req.url.endsWith('/hidden') ? prefs.setHidden : prefs.setPinned;
    try { await setter(body); } catch { return sendJson(res, 500, { error: 'Failed to save preferences' }); }
    return sendJson(res, 200, { ok: true });
  }

  if (req.url === '/api/preferences/theme') {
    if (!VALID_THEMES.includes(body)) return sendJson(res, 400, { error: 'Theme must be "system", "light", or "dark"' });
    try { await prefs.setTheme(body); } catch { return sendJson(res, 500, { error: 'Failed to save preferences' }); }
    return sendJson(res, 200, { ok: true });
  }
}

async function handleBookmarks(req, res) {
  const idMatch = req.url.match(/^\/api\/bookmarks\/([^/]+)$/);

  if (req.method === 'GET' && req.url === '/api/bookmarks') {
    return sendJson(res, 200, await prefs.getBookmarks());
  }

  if (req.method === 'POST' && req.url === '/api/bookmarks') {
    const body = await readJsonBody(req, res);
    if (body === null) return;
    let bookmark;
    try {
      bookmark = await prefs.addBookmark(body);
    } catch (err) {
      if (err.message === 'url and name are required') return sendJson(res, 400, { error: err.message });
      return sendJson(res, 500, { error: 'Failed to save bookmark' });
    }
    if (!bookmark.icon && bookmark.url) {
      try {
        const icon = await fetchExternalFavicon(bookmark.url);
        if (icon) bookmark = await prefs.updateBookmark(bookmark.id, { icon });
      } catch { /* best-effort */ }
    }
    return sendJson(res, 201, bookmark);
  }

  if (req.method === 'PUT' && idMatch) {
    const body = await readJsonBody(req, res);
    if (body === null) return;
    let updated = await prefs.updateBookmark(idMatch[1], body);
    if (!updated) return sendJson(res, 404, { error: 'Bookmark not found' });
    if (body.url && !body.icon) {
      try {
        const icon = await fetchExternalFavicon(body.url);
        if (icon) updated = await prefs.updateBookmark(idMatch[1], { icon });
      } catch { /* best-effort */ }
    }
    return sendJson(res, 200, updated);
  }

  if (req.method === 'DELETE' && idMatch) {
    const deleted = await prefs.deleteBookmark(idMatch[1]);
    if (!deleted) return sendJson(res, 404, { error: 'Bookmark not found' });
    return sendJson(res, 200, { ok: true });
  }
}

/* ---- Server ---- */

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderDashboard({ hostname: os.hostname(), ip: getLocalIP(), version: CURRENT_VERSION }));
    return;
  }

  if (req.method === 'GET' && req.url === '/api/services') {
    return sendJson(res, 200, latestServices);
  }

  if (req.method === 'GET' && req.url === '/api/tiles') {
    const services = latestServices.map((s) => ({ ...s, type: 'service' }));
    let bookmarks;
    try {
      bookmarks = (await prefs.getBookmarks()).map((b) => ({ ...b, type: 'bookmark' }));
    } catch {
      bookmarks = [];
    }
    return sendJson(res, 200, [...services, ...bookmarks]);
  }

  if (req.method === 'GET' && req.url === '/api/version') {
    return sendJson(res, 200, updateInfo || { current: CURRENT_VERSION, latest: null, updateAvailable: false, command: null });
  }

  if (req.url.startsWith('/api/preferences')) {
    return handlePreferences(req, res);
  }

  if (req.url.startsWith('/api/bookmarks')) {
    return handleBookmarks(req, res);
  }

  if (req.method === 'GET' && req.url.startsWith('/public/')) {
    const filename = path.basename(req.url);
    const filePath = path.join(PUBLIC_DIR, filename);
    try {
      const data = fs.readFileSync(filePath);
      const ext = path.extname(filename).toLowerCase();
      const contentType = ext === '.png' ? 'image/png' : 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=86400' });
      res.end(data);
      return;
    } catch {
      // fall through to 404
    }
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

let scanTimer = null;

const onListening = async () => {
  const actualPort = server.address().port;
  const localIP = getLocalIP();
  const hostname = os.hostname();
  const url = `http://${localIP}:${actualPort}`;
  if (actualPort !== PORT) {
    console.log(`Port ${PORT} in use — fell back to ${actualPort}`);
  }
  console.log(`Harbour running on ${url}`);
  console.log(`Hostname: ${hostname}`);
  console.log('Press Enter to open in browser...');

  const openInBrowser = () => {
    const cmd = process.platform === 'darwin' ? 'open'
      : process.platform === 'win32' ? 'start'
      : 'xdg-open';
    exec(`${cmd} ${url}`);
  };

  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false);
    process.stdin.resume();
    process.stdin.once('data', () => {
      openInBrowser();
      process.stdin.pause();
    });
    process.stdin.unref();
  }
  await runScan();
  scanTimer = setInterval(runScan, SCAN_INTERVAL_MS);

  checkForUpdate(CURRENT_VERSION).then(result => {
    if (result) {
      updateInfo = result;
      if (result.updateAvailable) {
        console.log(`Update available: ${result.current} \u2192 ${result.latest} \u2014 run ${result.command} to update`);
      }
    }
  }).catch(() => {});
};

function shutdown() {
  if (scanTimer) clearInterval(scanTimer);
  server.closeAllConnections();
  server.close();
  prefs.close().then(
    () => process.exit(0),
    () => process.exit(1)
  );
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

server.listen(PORT, '0.0.0.0', onListening);
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`Port ${PORT} is in use, trying a random available port...`);
    server.listen(0, '0.0.0.0', onListening);
  } else {
    throw err;
  }
});

export { server, prefs };
