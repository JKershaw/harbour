/**
 * @module update-check — Non-blocking check for newer versions on npm.
 */

import https from 'node:https';
import { UPDATE_CHECK_TIMEOUT_MS } from './constants.js';

/**
 * Compare two semver strings. Returns true if remote is strictly newer.
 * @param {string} current
 * @param {string} remote
 * @returns {boolean}
 */
export function isNewer(current, remote) {
  const a = current.split('.').map(Number);
  const b = remote.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (b[i] > a[i]) return true;
    if (b[i] < a[i]) return false;
  }
  return false;
}

/**
 * Fetch the latest version from the npm registry and compare.
 * Returns { current, latest, updateAvailable, command } or null on failure.
 * @param {string} currentVersion
 * @param {{ request?: Function }} [deps]
 * @returns {Promise<object | null>}
 */
export function checkForUpdate(currentVersion, deps = {}) {
  const doRequest = deps.request ?? https.request;

  return new Promise((resolve) => {
    let settled = false;
    const settle = (value) => { if (!settled) { settled = true; resolve(value); } };

    const req = doRequest(
      'https://registry.npmjs.org/@jkershaw/harbour/latest',
      { timeout: UPDATE_CHECK_TIMEOUT_MS },
      (res) => {
        if (res.statusCode !== 200) {
          res.on('data', () => {});
          res.on('end', () => settle(null));
          return;
        }

        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          try {
            const { version: latest } = JSON.parse(Buffer.concat(chunks).toString());
            settle({
              current: currentVersion,
              latest,
              updateAvailable: isNewer(currentVersion, latest),
              command: 'npx @jkershaw/harbour@latest',
            });
          } catch {
            settle(null);
          }
        });
        res.on('error', () => settle(null));
      },
    );

    req.on('error', () => settle(null));
    req.setTimeout(UPDATE_CHECK_TIMEOUT_MS, () => { req.destroy(); settle(null); });
    req.end();
  });
}
