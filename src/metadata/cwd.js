/** @module cwd — Resolve PIDs to working directories (platform-specific). */

import { execFile } from 'node:child_process';
import { readlink } from 'node:fs/promises';
import { execFilePromise } from '../exec.js';
import { EXEC_TIMEOUT_MS } from '../constants.js';

/**
 * Parse macOS lsof -Fn output for cwd entries.
 * Format: lines prefixed with 'p' (PID) and 'n' (name/path).
 * @param {string|null|undefined} stdout
 * @returns {Map<number, string>} pid → cwd path
 */
export function parseLsofCwdOutput(stdout) {
  const result = new Map();
  if (!stdout) return result;

  let currentPid = null;
  for (const line of stdout.split('\n')) {
    if (!line) continue;
    if (line.startsWith('p')) {
      const parsed = parseInt(line.slice(1), 10);
      currentPid = Number.isNaN(parsed) ? null : parsed;
    } else if (line.startsWith('n') && currentPid !== null) {
      result.set(currentPid, line.slice(1));
    }
  }
  return result;
}

/**
 * Resolve the working directory for a single PID.
 * Returns null on any failure (never throws).
 * @param {number} pid
 * @returns {Promise<string|null>}
 */
export async function resolveCwd(pid) {
  if (process.platform === 'linux') {
    try {
      return await readlink(`/proc/${pid}/cwd`);
    } catch {
      return null;
    }
  }

  if (process.platform === 'darwin') {
    try {
      const stdout = await execFilePromise('lsof', ['-p', String(pid), '-a', '-d', 'cwd', '-Fn']);
      const map = parseLsofCwdOutput(stdout);
      return map.get(pid) ?? null;
    } catch {
      return null;
    }
  }

  if (process.platform === 'win32') {
    try {
      // wmic doesn't expose cwd directly; use PowerShell as primary approach
      const stdout = await execFilePromise('powershell', [
        '-NoProfile', '-Command',
        `(Get-Process -Id ${pid}).Path | Split-Path -Parent`,
      ]);
      const cwd = stdout.trim();
      return cwd || null;
    } catch {
      // Fallback to wmic ExecutablePath (gives install dir, not working dir)
      try {
        const stdout = await execFilePromise('wmic', [
          'process', 'where', `ProcessId=${pid}`, 'get', 'ExecutablePath', '/value',
        ]);
        const match = stdout.match(/ExecutablePath=(.+)/);
        if (match) {
          const exePath = match[1].trim();
          const lastSep = Math.max(exePath.lastIndexOf('\\'), exePath.lastIndexOf('/'));
          return lastSep > 0 ? exePath.slice(0, lastSep) : null;
        }
      } catch {
        // Both approaches failed
      }
      return null;
    }
  }

  return null;
}

/**
 * Resolve working directories for multiple PIDs.
 * Linux: parallel readlink calls.
 * macOS: single lsof call for all PIDs.
 * Windows: sequential wmic calls.
 * @param {number[]} pids
 * @returns {Promise<Map<number, string>>} pid → cwd path
 */
export async function resolveAllCwds(pids) {
  if (!pids || pids.length === 0) return new Map();

  if (process.platform === 'linux') {
    const entries = await Promise.all(
      pids.map(async (pid) => {
        try {
          const cwd = await readlink(`/proc/${pid}/cwd`);
          return [pid, cwd];
        } catch {
          return null;
        }
      }),
    );
    return new Map(entries.filter(Boolean));
  }

  if (process.platform === 'darwin') {
    // lsof exits non-zero when any PID is invalid, but still outputs
    // valid results on stdout. Use execFile directly to access stdout
    // regardless of exit code.
    try {
      const stdout = await new Promise((resolve, reject) => {
        execFile('lsof', ['-p', pids.map(String).join(','), '-a', '-d', 'cwd', '-Fn'],
          { timeout: EXEC_TIMEOUT_MS },
          (err, stdout) => {
            if (err && !stdout) return reject(err);
            resolve(stdout);
          },
        );
      });
      return parseLsofCwdOutput(stdout);
    } catch {
      return new Map();
    }
  }

  if (process.platform === 'win32') {
    const result = new Map();
    for (const pid of pids) {
      const cwd = await resolveCwd(pid);
      if (cwd) result.set(pid, cwd);
    }
    return result;
  }

  return new Map();
}

