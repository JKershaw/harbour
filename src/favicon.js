/**
 * @module favicon — Fetch favicons from localhost and external services.
 * Returns base64 data URIs or null on failure.
 */

import http from 'node:http';
import https from 'node:https';
import { FAVICON_TIMEOUT_MS, FAVICON_MAX_BYTES } from './constants.js';

const TIMEOUT_MS = FAVICON_TIMEOUT_MS;
const MAX_BYTES = FAVICON_MAX_BYTES;
const HEADERS = {
  'User-Agent': 'Harbour/1.0 (service-discovery)',
  'X-Harbour-Request': 'favicon',
};

/**
 * Handle an HTTP response: collect body (respecting MAX_BYTES) or drain for HEAD.
 */
function handleResponse(method, res, settle) {
  if (method === 'HEAD') {
    res.resume();
    settle({ statusCode: res.statusCode, headers: res.headers, body: Buffer.alloc(0) });
    return;
  }

  const chunks = [];
  let totalBytes = 0;
  res.on('data', (chunk) => {
    totalBytes += chunk.length;
    if (totalBytes > MAX_BYTES) {
      res.destroy();
      settle(null);
      return;
    }
    chunks.push(chunk);
  });
  res.on('end', () => {
    settle({ statusCode: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) });
  });
  res.on('error', () => settle(null));
}

/**
 * Make an HTTP request to localhost and return the response.
 */
function request(method, port, path) {
  return new Promise((resolve) => {
    let settled = false;
    const settle = (value) => { if (!settled) { settled = true; resolve(value); } };

    const req = http.request(
      { hostname: '127.0.0.1', port, path, method, headers: HEADERS, timeout: TIMEOUT_MS },
      (res) => handleResponse(method, res, settle),
    );

    req.on('timeout', () => { req.destroy(); settle(null); });
    req.on('error', () => settle(null));
    req.end();
  });
}

/**
 * Make an HTTP/HTTPS request to an external URL and return the response.
 * Follows at most one redirect (301/302).
 */
function externalRequest(method, urlString, _depth = 0) {
  return new Promise((resolve) => {
    let parsed;
    try {
      parsed = new URL(urlString);
    } catch {
      resolve(null);
      return;
    }

    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      resolve(null);
      return;
    }

    const mod = parsed.protocol === 'https:' ? https : http;
    let settled = false;
    const settle = (value) => { if (!settled) { settled = true; resolve(value); } };

    const req = mod.request(
      urlString,
      { method, headers: HEADERS, timeout: TIMEOUT_MS },
      (res) => {
        if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
          res.resume();
          if (_depth >= 1) { settle(null); return; }
          externalRequest(method, res.headers.location, _depth + 1).then(settle);
          return;
        }
        handleResponse(method, res, settle);
      },
    );

    req.on('timeout', () => { req.destroy(); settle(null); });
    req.on('error', () => settle(null));
    req.end();
  });
}

/**
 * Parse an <link rel="icon"> href from HTML content.
 * @param {string} html
 * @returns {string | null}
 */
export function parseLinkIcon(html) {
  const match = html.match(/<link[^>]+rel\s*=\s*["'](?:shortcut\s+)?icon["'][^>]*>/i);
  if (!match) return null;
  const hrefMatch = match[0].match(/href\s*=\s*["']([^"']+)["']/i);
  return hrefMatch ? hrefMatch[1] : null;
}

/**
 * Convert a response body to a base64 data URI.
 * @returns {string | null}
 */
function toDataUri(res, fallbackMime) {
  if (!res || res.statusCode !== 200 || res.body.length === 0 || res.body.length > MAX_BYTES) return null;
  const mime = (res.headers['content-type'] || fallbackMime || '').split(';')[0];
  if (!mime.startsWith('image/')) return null;
  return `data:${mime};base64,${res.body.toString('base64')}`;
}

/**
 * Fetch a favicon from a localhost service.
 * Strategy: try /favicon.ico (HEAD then GET), then parse HTML for <link rel="icon">.
 * @param {number} port
 * @param {object} [deps] — optional dependency injection for testing
 * @returns {Promise<string | null>}
 */
export async function fetchFavicon(port, deps = {}) {
  const doRequest = deps.request ?? request;
  const doHead = (path) => doRequest('HEAD', port, path);
  const doGet = (path) => doRequest('GET', port, path);

  // 1. Try /favicon.ico via HEAD to check if it's an image
  const head = await doHead('/favicon.ico');
  if (head && head.statusCode === 200) {
    const ct = head.headers['content-type'] || '';
    if (ct.startsWith('image/')) {
      const get = await doGet('/favicon.ico');
      const uri = toDataUri(get, ct);
      if (uri) return uri;
    }
  }

  // 2. Parse HTML for <link rel="icon">
  const htmlRes = await doGet('/');
  if (!htmlRes || htmlRes.statusCode !== 200) return null;

  const html = htmlRes.body.toString('utf-8').slice(0, 8192);
  const iconHref = parseLinkIcon(html);
  if (!iconHref) return null;

  // Return inline data URIs directly
  if (iconHref.startsWith('data:image/')) return iconHref;

  // Only fetch localhost-relative paths (reject external URLs)
  if (iconHref.startsWith('http://') || iconHref.startsWith('https://') || iconHref.startsWith('//')) {
    return null;
  }

  const resolved = iconHref.startsWith('/') ? iconHref : `/${iconHref}`;
  const iconRes = await doGet(resolved);
  return toDataUri(iconRes);
}

/**
 * Fetch a favicon from an external URL.
 * @param {string} url
 * @param {object} [deps] — optional dependency injection for testing
 * @returns {Promise<string | null>}
 */
export async function fetchExternalFavicon(url, deps = {}) {
  const doRequest = deps.externalRequest ?? externalRequest;

  let origin;
  try {
    origin = new URL(url).origin;
  } catch {
    return null;
  }

  const toUrl = (path) => path.startsWith('http://') || path.startsWith('https://') ? path : `${origin}${path}`;
  const doHead = (path) => doRequest('HEAD', toUrl(path));
  const doGet = (path) => doRequest('GET', toUrl(path));

  // 1. Try /favicon.ico via HEAD to check if it's an image
  const head = await doHead('/favicon.ico');
  if (head && head.statusCode === 200) {
    const ct = head.headers['content-type'] || '';
    if (ct.startsWith('image/')) {
      const get = await doGet('/favicon.ico');
      const uri = toDataUri(get, ct);
      if (uri) return uri;
    }
  }

  // 2. Parse HTML for <link rel="icon">
  const htmlRes = await doGet('/');
  if (!htmlRes || htmlRes.statusCode !== 200) return null;

  const html = htmlRes.body.toString('utf-8').slice(0, 8192);
  const iconHref = parseLinkIcon(html);
  if (!iconHref) return null;

  // Return inline data URIs directly
  if (iconHref.startsWith('data:image/')) return iconHref;

  // Resolve the href against the origin
  let resolved;
  try {
    resolved = new URL(iconHref, origin).href;
  } catch {
    return null;
  }

  const iconRes = await doGet(resolved);
  return toDataUri(iconRes);
}
