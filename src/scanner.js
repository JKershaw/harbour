import { execFile } from 'node:child_process';
import { EXEC_TIMEOUT_MS, NETSTAT_TIMEOUT_MS } from './constants.js';

export const MIN_PORT = 1024;
export const EXCLUDED_PORTS = new Set([5432, 3306, 6379, 27017, 53, 631]);

/**
 * Extract a port number from an address string like "127.0.0.1:3000",
 * "*:3000", "[::1]:3000", or "[::]:3000".
 * @returns {number} port number, or NaN if parsing fails
 */
export function parsePort(address) {
  const lastColon = address.lastIndexOf(':');
  if (lastColon === -1) return NaN;
  return parseInt(address.slice(lastColon + 1), 10);
}

/**
 * Deduplicate services by port, keeping the first occurrence.
 * @param {Array<{port: number}>} services
 * @returns {Array<{port: number}>}
 */
function deduplicateByPort(services) {
  const seen = new Map();
  for (const service of services) {
    if (!seen.has(service.port)) seen.set(service.port, service);
  }
  return Array.from(seen.values());
}

/**
 * Parse lsof output into an array of {port, pid, process} service objects.
 * Deduplicates ports that appear on multiple interfaces (IPv4 + IPv6).
 */
export function parseLsofOutput(stdout) {
  if (!stdout) return [];

  const lines = stdout.trim().split('\n');
  // Skip header line
  const dataLines = lines.slice(1);
  const services = [];

  for (const line of dataLines) {
    const tokens = line.trim().split(/\s+/);
    if (tokens.length < 9) continue;

    const process = tokens[0];
    const pid = parseInt(tokens[1], 10);
    const name = tokens[tokens.length - 1] === '(LISTEN)'
      ? tokens[tokens.length - 2]
      : tokens[tokens.length - 1];

    const port = parsePort(name);
    if (Number.isNaN(port)) continue;

    services.push({ port, pid, process });
  }

  return deduplicateByPort(services);
}

/**
 * Parse netstat -ano -p TCP output into an array of {port, pid} service objects.
 * Deduplicates ports that appear on multiple interfaces (IPv4 + IPv6).
 */
export function parseNetstatOutput(stdout) {
  if (!stdout) return [];

  const lines = stdout.trim().split('\n');
  const services = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('TCP')) continue;
    if (!trimmed.includes('LISTENING')) continue;

    const tokens = trimmed.split(/\s+/);
    if (tokens.length < 5) continue;

    const localAddr = tokens[1];
    const pid = parseInt(tokens[tokens.length - 1], 10);
    if (Number.isNaN(pid)) continue;

    const port = parsePort(localAddr);
    if (Number.isNaN(port)) continue;

    services.push({ port, pid });
  }

  return deduplicateByPort(services);
}

/**
 * Parse a single line of tasklist /FO CSV /NH output into a process name.
 * Example: "node.exe","5678","Console","1","45,032 K" → "node"
 */
export function parseTasklistCsv(csvLine) {
  if (!csvLine || !csvLine.startsWith('"')) return 'unknown';

  const firstComma = csvLine.indexOf('","');
  if (firstComma === -1) return 'unknown';

  const name = csvLine.slice(1, firstComma);
  return name.endsWith('.exe') ? name.slice(0, -4) : name;
}

/**
 * Resolve PIDs to process names using tasklist.
 * Processes PIDs in batches to avoid spawning hundreds of concurrent
 * tasklist processes on busy CI machines.
 * Returns services enriched with a process field.
 */
export async function resolveProcessNames(services) {
  const uniquePids = [...new Set(services.map((s) => s.pid))];

  const pidToName = new Map();
  const BATCH_SIZE = 8;
  for (let i = 0; i < uniquePids.length; i += BATCH_SIZE) {
    const batch = uniquePids.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(
        (pid) =>
          new Promise((resolve) => {
            const child = execFile(
              'tasklist',
              ['/FI', `PID eq ${pid}`, '/FO', 'CSV', '/NH'],
              { timeout: EXEC_TIMEOUT_MS },
              (err, stdout) => {
                pidToName.set(pid, err ? 'unknown' : parseTasklistCsv(stdout.trim()));
                resolve();
              },
            );
            child.on('error', () => {
              pidToName.set(pid, 'unknown');
              resolve();
            });
          }),
      ),
    );
  }

  return services.map((s) => ({ ...s, process: pidToName.get(s.pid) || 'unknown' }));
}

/**
 * Returns true if a port should be hidden by default (system ports,
 * known infrastructure ports, or Harbour's own port).
 */
export function isDefaultHidden(port, ownPort) {
  return port < MIN_PORT || EXCLUDED_PORTS.has(port) || port === ownPort;
}

/**
 * Windows: execute netstat + tasklist and return deduplicated service objects.
 */
async function scanPortsWindows() {
  try {
    const stdout = await new Promise((resolve, reject) => {
      execFile('netstat', ['-ano', '-p', 'TCP'], { timeout: NETSTAT_TIMEOUT_MS }, (err, stdout) => {
        if (err) { reject(err); return; }
        resolve(stdout);
      });
    });

    const services = parseNetstatOutput(stdout);
    return await resolveProcessNames(services);
  } catch {
    console.error('harbour: port scan failed');
    return [];
  }
}

/**
 * Execute platform-specific scan and return deduplicated service objects.
 */
export async function scanPorts() {
  if (process.platform === 'win32') return scanPortsWindows();

  try {
    const stdout = await new Promise((resolve, reject) => {
      execFile('lsof', ['-i', '-n', '-P', '-sTCP:LISTEN'], (err, stdout) => {
        if (err) {
          // lsof returns exit code 1 when no matches — treat as empty
          if (err.code === 1 || err.killed === false) {
            resolve('');
            return;
          }
          reject(err);
          return;
        }
        resolve(stdout);
      });
    });

    return parseLsofOutput(stdout);
  } catch {
    console.error('harbour: port scan failed');
    return [];
  }
}
