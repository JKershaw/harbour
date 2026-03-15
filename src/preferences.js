/**
 * @module preferences — Server-side preference persistence using mangodb.
 * Stores hide/pin preferences on disk so they survive restarts and
 * are shared across browsers.
 */

import { MangoClient } from '@jkershaw/mangodb';
import crypto from 'node:crypto';
import path from 'node:path';

/**
 * Prepend `https://` when the input has no scheme.
 * @param {*} url
 * @returns {*} normalised URL string, or the original value if falsy/non-string
 */
export function normalizeUrl(url) {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim();
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) return trimmed;
  return 'https://' + trimmed;
}

const DOC_ID = 'user-preferences';
const DB_NAME = 'harbour';
const COLLECTION = 'preferences';

/**
 * Initialise the preferences store.
 * @param {string} dataDir — path to the mangodb data directory
 * @returns {Promise<{
 *   getPreferences: () => Promise<{ hidden: Array, pinned: Array }>,
 *   setHidden: (apps: Array) => Promise<void>,
 *   setPinned: (apps: Array) => Promise<void>,
 *   close: () => Promise<void>
 * }>}
 */
export async function initPreferences(dataDir) {
  const client = new MangoClient(path.resolve(dataDir));
  await client.connect();

  const db = client.db(DB_NAME);
  const col = db.collection(COLLECTION);

  async function getPreferences() {
    const doc = await col.findOne({ _id: DOC_ID });
    if (!doc) return { hidden: [], pinned: [], theme: 'system' };
    return { hidden: doc.hidden || [], pinned: doc.pinned || [], theme: doc.theme || 'system' };
  }

  async function setHidden(services) {
    await col.updateOne(
      { _id: DOC_ID },
      { $set: { hidden: services } },
      { upsert: true }
    );
  }

  async function setPinned(services) {
    await col.updateOne(
      { _id: DOC_ID },
      { $set: { pinned: services } },
      { upsert: true }
    );
  }

  async function setTheme(theme) {
    await col.updateOne(
      { _id: DOC_ID },
      { $set: { theme } },
      { upsert: true }
    );
  }

  async function getBookmarks() {
    const doc = await col.findOne({ _id: DOC_ID });
    return doc?.bookmarks || [];
  }

  async function addBookmark({ url, name, icon, groupId, order } = {}) {
    if (!url || !name) {
      throw new Error('url and name are required');
    }
    const bookmark = {
      id: `bm_${crypto.randomUUID()}`,
      url: normalizeUrl(url),
      name,
      icon: icon ?? null,
      groupId: groupId ?? null,
      order: order ?? 0,
    };
    const doc = await col.findOne({ _id: DOC_ID });
    const bookmarks = doc?.bookmarks || [];
    bookmarks.push(bookmark);
    await col.updateOne(
      { _id: DOC_ID },
      { $set: { bookmarks } },
      { upsert: true }
    );
    return bookmark;
  }

  async function updateBookmark(id, updates) {
    const doc = await col.findOne({ _id: DOC_ID });
    const bookmarks = doc?.bookmarks || [];
    const index = bookmarks.findIndex((b) => b.id === id);
    if (index === -1) return null;
    const { url, name, icon, groupId, order } = updates;
    const allowed = Object.fromEntries(
      Object.entries({ url: normalizeUrl(url), name, icon, groupId, order })
        .filter(([, v]) => v !== undefined)
    );
    const updated = { ...bookmarks[index], ...allowed };
    bookmarks[index] = updated;
    await col.updateOne(
      { _id: DOC_ID },
      { $set: { bookmarks } },
      { upsert: true }
    );
    return updated;
  }

  async function deleteBookmark(id) {
    const doc = await col.findOne({ _id: DOC_ID });
    const bookmarks = doc?.bookmarks || [];
    const filtered = bookmarks.filter((b) => b.id !== id);
    if (filtered.length === bookmarks.length) return false;
    await col.updateOne(
      { _id: DOC_ID },
      { $set: { bookmarks: filtered } },
      { upsert: true }
    );
    return true;
  }

  async function close() {
    await client.close();
  }

  return {
    getPreferences, setHidden, setPinned, setTheme,
    getBookmarks, addBookmark, updateBookmark, deleteBookmark,
    close,
  };
}
