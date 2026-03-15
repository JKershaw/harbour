/** @module constants — Shared configuration constants. */

/** Timeout for short child-process commands (ps, wmic, lsof per-PID). */
export const EXEC_TIMEOUT_MS = 5000;

/** Timeout for Windows netstat scan (slower than lsof). */
export const NETSTAT_TIMEOUT_MS = 10_000;

/** Timeout for HTTP favicon requests. */
export const FAVICON_TIMEOUT_MS = 2000;

/** Maximum favicon response body size (bytes). */
export const FAVICON_MAX_BYTES = 64 * 1024;

/** Interval between port scan cycles (ms). */
export const SCAN_INTERVAL_MS = 5000;

/** Timeout for npm registry update check. */
export const UPDATE_CHECK_TIMEOUT_MS = 3000;
