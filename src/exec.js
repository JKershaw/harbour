/** @module exec — Shared child_process utilities. */

import { execFile } from 'node:child_process';
import { EXEC_TIMEOUT_MS } from './constants.js';

export function execFilePromise(cmd, args) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { timeout: EXEC_TIMEOUT_MS }, (err, stdout) => {
      if (err) return reject(err);
      resolve(stdout);
    });
  });
}
