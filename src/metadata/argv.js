/** @module argv — Resolve PIDs to command-line arguments and identify tools. */

import { readFile } from 'node:fs/promises';
import { execFilePromise } from '../exec.js';


/**
 * Patterns to identify known tools/frameworks from command-line arguments.
 * Each entry has a `pattern` (RegExp) and a `label` (display name).
 */
export const TOOL_PATTERNS = [
  { pattern: /\bnext(?:[\s\0]|$)/, label: 'Next' },
  { pattern: /\bnuxt(?:[\s\0]|$)/, label: 'Nuxt' },
  { pattern: /\bvite(?:[\s\0]|$)|\/vite$/, label: 'Vite' },
  { pattern: /\bwebpack(?:[\s\0]|$)/, label: 'Webpack' },
  { pattern: /\breact-scripts(?:[\s\0]|$)/, label: 'React Scripts' },
  { pattern: /\btsx(?:[\s\0]|$)/, label: 'Tsx' },
  { pattern: /\bts-node(?:[\s\0]|$)/, label: 'Ts Node' },
  { pattern: /manage\.py\s+runserver/, label: 'Django' },
  { pattern: /\bflask(?:[\s\0]|$)/, label: 'Flask' },
  { pattern: /\buvicorn(?:[\s\0]|$)/, label: 'Uvicorn' },
  { pattern: /\bgunicorn(?:[\s\0]|$)/, label: 'Gunicorn' },
  { pattern: /\brails(?:[\s\0]|$)/, label: 'Rails' },
  { pattern: /\bgo\s+run\b/, label: 'Go' },
  { pattern: /\bcargo(?:[\s\0]|$)/, label: 'Cargo' },
];

/**
 * Extract the macOS bundle name from an executable path in argv.
 * Matches .app bundles (e.g. /Applications/Docker.app/Contents/MacOS/...)
 * and .framework bundles (e.g. /System/Library/.../ReplicatorCore.framework/...).
 * Prefers .app over .framework when both appear.
 * @param {string|null} argvString — raw cmdline string
 * @returns {string|null} bundle display name, or null
 */
export function extractBundleName(argvString) {
  if (!argvString) return null;
  const match = argvString.match(/\/([^/]+)\.app\//) || argvString.match(/\/([^/]+)\.framework\//);
  return match ? match[1] : null;
}

/**
 * Identify a tool/framework from a command-line argument string.
 * @param {string|null} argvString — raw cmdline (may contain null bytes from /proc)
 * @returns {string|null} human-readable tool label, or null
 */
export function identifyFromArgv(argvString) {
  if (!argvString) return null;

  for (const { pattern, label } of TOOL_PATTERNS) {
    if (pattern.test(argvString)) return label;
  }

  return null;
}

/**
 * Resolve the command-line arguments for a single PID.
 * Returns null on any failure (never throws).
 * @param {number} pid
 * @returns {Promise<string|null>}
 */
export async function resolveArgv(pid) {
  if (process.platform === 'linux') {
    try {
      const buf = await readFile(`/proc/${pid}/cmdline`);
      const raw = buf.toString();
      return raw || null;
    } catch {
      return null;
    }
  }

  if (process.platform === 'darwin') {
    try {
      const stdout = await execFilePromise('ps', ['-ww', '-p', String(pid), '-o', 'args=']);
      return stdout.trim() || null;
    } catch {
      return null;
    }
  }

  if (process.platform === 'win32') {
    try {
      const stdout = await execFilePromise('wmic', [
        'process', 'where', `ProcessId=${pid}`, 'get', 'CommandLine', '/value',
      ]);
      const match = stdout.match(/CommandLine=(.+)/);
      return match ? match[1].trim() : null;
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Resolve command-line arguments for multiple PIDs.
 * @param {number[]} pids
 * @returns {Promise<Map<number, string>>} pid → argv string
 */
export async function resolveAllArgv(pids) {
  if (!pids || pids.length === 0) return new Map();

  const results = await Promise.all(
    pids.map(async (pid) => {
      const argv = await resolveArgv(pid);
      return argv ? [pid, argv] : null;
    }),
  );

  return new Map(results.filter(Boolean));
}

