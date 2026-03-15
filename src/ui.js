/**
 * @module ui — Dashboard HTML template.
 * Returns a complete HTML string with embedded CSS and JavaScript for the
 * service discovery dashboard.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { STACK_COLORS } from './metadata/parsers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSS = readFileSync(join(__dirname, 'dashboard.css'), 'utf8');

/**
 * Render the dashboard HTML page.
 * @param {{ hostname: string, ip: string }} opts
 * @returns {string} Complete HTML document string
 */
export function renderDashboard({ hostname, ip, version }) {
  const stackColorJSON = JSON.stringify(STACK_COLORS);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Harbour</title>
  <link rel="icon" type="image/png" sizes="32x32" href="data:image/png;base64,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">
  <style>${CSS}</style>
  <script>
    (function() {
      var t = localStorage.getItem('harbour-theme');
      if (t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t);
    })();
  </script>
</head>
<body>
  <header>
    <div class="header-left">
      <img src="/public/logo.png" alt="Harbour" width="20" height="20" class="logo-icon logo-dark">
      <img src="/public/logo-white.png" alt="Harbour" width="20" height="20" class="logo-icon logo-light">
      <span class="logo">Harbour</span>
    </div>
    <div class="header-right">
      <span class="status-dot" aria-label="Scanning status"></span>
      <button id="settings-btn" class="settings-btn" aria-label="Settings" title="Settings">&#9881;</button>
    </div>
  </header>
  <div id="update-banner" class="update-banner" style="display:none">
    <span id="update-banner-text"></span>
    <button id="update-banner-dismiss" class="update-banner-dismiss">&times;</button>
  </div>
  <div id="settings-backdrop" class="settings-backdrop"></div>
  <div id="settings-panel" class="settings-panel">
    <div class="settings-header">
      <span class="settings-title">Settings</span>
      <button id="settings-close" class="settings-close" aria-label="Close settings">&times;</button>
    </div>
    <div class="settings-section">
      <span class="settings-section-label">Device</span>
      <span class="host-info">${hostname} &middot; ${ip}</span>
    </div>
    <div class="settings-section">
      <span class="settings-section-label">Overview</span>
      <span id="service-count">0 services</span>
    </div>
    <div class="settings-section">
      <span class="settings-section-label">Bookmarks</span>
      <button id="add-bookmark-btn" class="add-bookmark-btn" aria-label="Add bookmark" title="Add bookmark">+ Add Bookmark</button>
    </div>
    <div class="settings-section">
      <span class="settings-section-label">Appearance</span>
      <div class="theme-picker" id="theme-picker">
        <button type="button" class="theme-option" data-theme="light">Light</button>
        <button type="button" class="theme-option active" data-theme="system">System</button>
        <button type="button" class="theme-option" data-theme="dark">Dark</button>
      </div>
    </div>
    <div class="settings-section">
      <span class="settings-section-label">Version</span>
      <span id="version-info" class="host-info">${version}</span>
    </div>
    <div class="settings-section">
      <span class="settings-section-label">Visibility</span>
      <div id="visibility-list" class="visibility-list"></div>
    </div>
  </div>
  <div id="info-backdrop" class="info-backdrop"></div>
  <div id="info-panel" class="info-panel">
    <div class="settings-header">
      <span class="settings-title" id="info-panel-title">Info</span>
      <button id="info-close" class="settings-close" aria-label="Close info">&times;</button>
    </div>
    <div id="info-panel-content" class="info-panel-content"></div>
  </div>
  <main id="main"></main>
  <div id="bookmark-modal" class="bookmark-modal">
    <div class="bookmark-form-container">
      <h2 class="bookmark-form-title" id="bookmark-form-title">Add Bookmark</h2>
      <form id="bookmark-form" autocomplete="off">
        <div class="bookmark-form-field">
          <label for="bookmark-url">URL</label>
          <input type="text" id="bookmark-url" name="url" placeholder="example.com" required>
        </div>
        <div class="bookmark-form-field">
          <label for="bookmark-name">Name</label>
          <input type="text" id="bookmark-name" name="name" placeholder="My Bookmark" required>
        </div>
        <div class="bookmark-form-field">
          <label for="bookmark-icon">Icon URL (optional)</label>
          <input type="text" id="bookmark-icon" name="icon" placeholder="https://example.com/icon.png">
        </div>
        <div class="bookmark-form-error" id="bookmark-form-error"></div>
        <div class="bookmark-form-actions">
          <button type="button" class="btn-cancel" id="bookmark-cancel">Cancel</button>
          <button type="submit" class="btn-submit" id="bookmark-submit">Add Bookmark</button>
        </div>
      </form>
    </div>
  </div>
  <script>
    (function () {
      const STACK_COLORS = ${stackColorJSON};
      const DEFAULT_COLOR = '#888888';
      const BASE_INTERVAL = 3000;
      const MAX_INTERVAL = 30000;
      let interval = BASE_INTERVAL;
      let prevMap = new Map();
      let timer = null;

      // Preference state — synced from server on each poll, written optimistically
      let cachedTheme = localStorage.getItem('harbour-theme') || 'system';
      let writing = false;

      function applyTheme(theme) {
        cachedTheme = theme;
        if (theme === 'light' || theme === 'dark') {
          document.documentElement.setAttribute('data-theme', theme);
          localStorage.setItem('harbour-theme', theme);
        } else {
          document.documentElement.removeAttribute('data-theme');
          localStorage.removeItem('harbour-theme');
        }
        var btns = document.querySelectorAll('.theme-option');
        btns.forEach(function (btn) {
          btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
        });
      }

      function putJson(endpoint, data) {
        writing = true;
        fetch(endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).then(function () { writing = false; }, function () { writing = false; });
      }

      function setThemePreference(theme) {
        applyTheme(theme);
        putJson('/api/preferences/theme', theme);
      }

      function tileKey(tile) {
        return tile.type === 'bookmark' ? tile.id : String(tile.port);
      }

      function prefEntryKey(entry) {
        const key = entry.id != null ? entry.id : String(entry.port);
        return key + ':' + entry.name;
      }

      function toPrefEntry(tile) {
        return tile.type === 'bookmark'
          ? { id: tile.id, name: tile.name }
          : { port: tile.port, name: tile.name || 'Unknown' };
      }

      function normalizeUrl(url) {
        if (!url || typeof url !== 'string') return url;
        var trimmed = url.trim();
        if (trimmed.includes('://')) return trimmed;
        return 'https://' + trimmed;
      }

      function safeHref(url) {
        try {
          const parsed = new URL(url);
          if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return url;
        } catch (e) {}
        return '#';
      }

      // Preference list manager for hidden/pinned lists
      function createPrefList(endpoint) {
        let items = [];
        return {
          get: function () { return items; },
          sync: function (arr) { items = arr; },
          add: function (tile) {
            var entry = toPrefEntry(tile);
            var key = prefEntryKey(entry);
            if (!items.some(function (x) { return prefEntryKey(x) === key; })) {
              items = items.concat([entry]);
              putJson(endpoint, items);
            }
          },
          remove: function (tile) {
            var key = prefEntryKey(toPrefEntry(tile));
            items = items.filter(function (x) { return prefEntryKey(x) !== key; });
            putJson(endpoint, items);
          }
        };
      }

      const hidden = createPrefList('/api/preferences/hidden');
      const pinned = createPrefList('/api/preferences/pinned');

      async function syncPreferences() {
        if (writing) return;
        try {
          const res = await fetch('/api/preferences');
          if (res.ok) {
            const data = await res.json();
            hidden.sync(data.hidden || []);
            pinned.sync(data.pinned || []);
            if (data.theme && data.theme !== cachedTheme) {
              applyTheme(data.theme);
            }
          }
        } catch (e) {}
      }

      const main = document.getElementById('main');
      const countEl = document.getElementById('service-count');
      const visListEl = document.getElementById('visibility-list');

      function getAccent(service) {
        if (service.stack && service.stack.length > 0) {
          for (const s of service.stack) {
            if (STACK_COLORS[s]) return STACK_COLORS[s];
          }
        }
        if (service.type === 'bookmark') {
          let hash = 0;
          for (let i = 0; i < (service.url || '').length; i++) {
            hash = ((hash << 5) - hash) + service.url.charCodeAt(i);
            hash |= 0;
          }
          return 'hsl(' + (Math.abs(hash) % 360) + ', 50%, 55%)';
        }
        const hue = (service.port * 137) % 360;
        return 'hsl(' + hue + ', 50%, 55%)';
      }

      function getInitial(service) {
        return (service.name || 'S').charAt(0).toUpperCase();
      }

      function getDomain(url) {
        try { return new URL(url).hostname; } catch (e) { return url; }
      }

      function createCard(service, isPinned) {
        const accent = getAccent(service);
        const isBookmark = service.type === 'bookmark';
        const a = document.createElement('a');
        a.className = 'card card-enter' + (isPinned ? ' card-pinned' : '');
        a.href = isBookmark ? safeHref(service.url) : 'http://localhost:' + service.port;
        a.target = '_blank';
        a.rel = 'noopener';
        a.dataset.tileId = tileKey(service);
        a.style.setProperty('--accent', accent);

        const pills = (service.stack || [])
          .map(function (s) { return '<span class="pill">' + s + '</span>'; })
          .join('');

        const actionBtn = '<button class="card-hide" title="Hide this app" aria-label="Hide">&times;</button>';

        const pinBtn = '<button class="card-pin" title="' + (isPinned ? 'Unpin this app' : 'Pin this app') + '" aria-label="' + (isPinned ? 'Unpin' : 'Pin') + '">' + (isPinned ? '&#9733;' : '&#9734;') + '</button>';

        const editBtn = isBookmark
          ? '<button class="card-edit" title="Edit bookmark" aria-label="Edit">&#9998;</button>'
          : '';

        const deleteBtn = isBookmark
          ? '<button class="card-delete" title="Delete bookmark" aria-label="Delete">&times;</button>'
          : '';

        const infoBtn = '<button class="card-info" title="View info" aria-label="Info">&#9432;</button>';

        const iconHtml = service.icon
          ? '<img class="card-icon-img" src="' + service.icon + '" alt="">'
          : '<div class="card-icon" style="background:' + accent + '">' + getInitial(service) + '</div>';

        const footerLabel = isBookmark
          ? escapeHtml(getDomain(service.url))
          : ':' + service.port;

        a.innerHTML =
          actionBtn +
          pinBtn +
          editBtn +
          deleteBtn +
          infoBtn +
          '<div class="card-header">' +
            iconHtml +
            '<span class="card-name">' + escapeHtml(service.name || 'Unknown') + '</span>' +
          '</div>' +
          (service.description ? '<div class="card-desc">' + escapeHtml(service.description) + '</div>' : '') +
          '<div class="card-footer">' +
            '<span class="card-port">' + footerLabel + '</span>' +
            '<div class="stack-pills">' + pills + '</div>' +
          '</div>';

        // If icon image fails to load, fall back to generated initial
        const iconImg = a.querySelector('.card-icon-img');
        if (iconImg) {
          iconImg.addEventListener('error', function () {
            const fallback = document.createElement('div');
            fallback.className = 'card-icon';
            fallback.style.background = accent;
            fallback.textContent = getInitial(service);
            iconImg.replaceWith(fallback);
          });
        }

        a.querySelector('.card-hide').addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          hidden.add(service);
          poll();
        });
        a.querySelector('.card-pin').addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          if (isPinned) {
            pinned.remove(service);
          } else {
            pinned.add(service);
          }
          poll();
        });

        if (isBookmark) {
          a.querySelector('.card-edit').addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            openBookmarkModal(service);
          });
          a.querySelector('.card-delete').addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (!confirm('Delete bookmark "' + (service.name || 'Unknown') + '"?')) return;
            fetch('/api/bookmarks/' + encodeURIComponent(service.id), { method: 'DELETE' })
              .then(function () { poll(); })
              .catch(function () { poll(); });
          });
        }

        a.querySelector('.card-info').addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          openInfoPanel(service);
        });

        return a;
      }

      function escapeHtml(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
      }

      function renderEmpty() {
        main.innerHTML =
          '<div class="empty-state">' +
            '<div class="empty-state-icon">&#9875;</div>' +
            '<div class="empty-state-text">No services or bookmarks &mdash; start a local server or add a bookmark.</div>' +
          '</div>';
      }

      function patch(tiles) {
        const hiddenList = hidden.get();
        const hiddenSet = new Set(hiddenList.map(function (h) { return prefEntryKey(h); }));
        const pinnedList = pinned.get();
        const pinnedSet = new Set(pinnedList.map(function (p) { return prefEntryKey(p); }));

        function tilePrefKey(t) {
          return tileKey(t) + ':' + (t.name || 'Unknown');
        }

        const visibleUnordered = tiles.filter(function (s) {
          return !hiddenSet.has(tilePrefKey(s));
        });
        const hiddenTiles = tiles.filter(function (s) {
          return hiddenSet.has(tilePrefKey(s));
        });

        // Sort pinned tiles to top
        const pinnedVisible = visibleUnordered.filter(function (s) {
          return pinnedSet.has(tilePrefKey(s));
        });
        const unpinnedVisible = visibleUnordered.filter(function (s) {
          return !pinnedSet.has(tilePrefKey(s));
        });
        const visibleTiles = pinnedVisible.concat(unpinnedVisible);

        const displayTiles = visibleTiles;
        const newMap = new Map();
        displayTiles.forEach(function (s) { newMap.set(tileKey(s), s); });

        const serviceCount = visibleTiles.filter(function (t) { return t.type === 'service'; }).length;
        const bookmarkCount = visibleTiles.filter(function (t) { return t.type === 'bookmark'; }).length;
        const countParts = [];
        if (serviceCount > 0) countParts.push(serviceCount + ' service' + (serviceCount !== 1 ? 's' : ''));
        if (bookmarkCount > 0) countParts.push(bookmarkCount + ' bookmark' + (bookmarkCount !== 1 ? 's' : ''));
        countEl.textContent = countParts.join(', ') || '0 services';

        if (displayTiles.length === 0) {
          if (prevMap.size !== 0 || !main.firstChild) renderEmpty();
          prevMap = newMap;
          buildVisibilityList(tiles, hiddenSet, tilePrefKey);
          return;
        }

        // If transitioning from empty state, clear it
        if (prevMap.size === 0 && main.querySelector('.empty-state')) {
          main.innerHTML = '';
        }

        // Ensure grid container
        let grid = main.querySelector('.grid');
        if (!grid) {
          grid = document.createElement('div');
          grid.className = 'grid';
          main.innerHTML = '';
          main.appendChild(grid);
        }

        // Remove cards for tiles no longer present
        prevMap.forEach(function (_, key) {
          if (!newMap.has(key)) {
            const card = grid.querySelector('[data-tile-id="' + key + '"]');
            if (card) card.remove();
          }
        });

        // Add or update cards, then reorder to match displayTiles order
        displayTiles.forEach(function (tile, i) {
          const key = tileKey(tile);
          const isPinned = pinnedSet.has(tilePrefKey(tile));
          let existing = grid.querySelector('[data-tile-id="' + key + '"]');
          if (existing) {
            const wasPinned = existing.classList.contains('card-pinned');
            if (wasPinned !== isPinned) {
              const newCard = createCard(tile, isPinned);
              existing.replaceWith(newCard);
              existing = grid.querySelector('[data-tile-id="' + key + '"]');
            } else {
              const prev = prevMap.get(key);
              if (!prev || JSON.stringify(prev) !== JSON.stringify(tile)) {
                const newCard = createCard(tile, isPinned);
                existing.replaceWith(newCard);
                existing = grid.querySelector('[data-tile-id="' + key + '"]');
              }
            }
            // Only move if position changed to avoid re-triggering animations
            if (grid.children[i] !== existing) {
              grid.insertBefore(existing, grid.children[i] || null);
            }
          } else {
            grid.insertBefore(createCard(tile, isPinned), grid.children[i] || null);
          }
        });

        prevMap = newMap;
        buildVisibilityList(tiles, hiddenSet, tilePrefKey);
      }

      function buildVisibilityList(allTiles, hiddenSet, tilePrefKey) {
        const scrollTop = visListEl.scrollTop;
        visListEl.innerHTML = '';

        const hiddenFirst = allTiles.slice().sort(function (a, b) {
          const aHidden = hiddenSet.has(tilePrefKey(a)) ? 0 : 1;
          const bHidden = hiddenSet.has(tilePrefKey(b)) ? 0 : 1;
          return aHidden - bHidden;
        });

        hiddenFirst.forEach(function (tile) {
          const isHidden = hiddenSet.has(tilePrefKey(tile));
          const isBookmark = tile.type === 'bookmark';
          const row = document.createElement('div');
          row.className = 'visibility-row' + (isHidden ? ' is-hidden' : '');

          const info = document.createElement('div');
          info.className = 'visibility-info';

          const name = document.createElement('span');
          name.className = 'visibility-name';
          name.textContent = tile.name || 'Unknown';

          const port = document.createElement('span');
          port.className = 'visibility-port';
          port.textContent = isBookmark ? getDomain(tile.url) : ':' + tile.port;

          info.appendChild(name);
          info.appendChild(port);

          const toggle = document.createElement('label');
          toggle.className = 'visibility-toggle';

          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.checked = !isHidden;
          checkbox.addEventListener('change', function () {
            if (checkbox.checked) {
              hidden.remove(tile);
            } else {
              hidden.add(tile);
            }
            poll();
          });

          const slider = document.createElement('span');
          slider.className = 'visibility-slider';

          toggle.appendChild(checkbox);
          toggle.appendChild(slider);

          row.appendChild(info);
          row.appendChild(toggle);
          visListEl.appendChild(row);
        });

        visListEl.scrollTop = scrollTop;
      }

      async function poll() {
        try {
          await syncPreferences();
          const res = await fetch('/api/tiles');
          if (!res.ok) throw new Error(res.status);
          const data = await res.json();
          patch(data);
          interval = BASE_INTERVAL;
        } catch (e) {
          interval = Math.min(interval * 2, MAX_INTERVAL);
        }
        schedule();
      }

      function schedule() {
        clearTimeout(timer);
        timer = setTimeout(poll, interval);
      }

      // Info panel
      const infoPanel = document.getElementById('info-panel');
      const infoBackdrop = document.getElementById('info-backdrop');
      const infoPanelTitle = document.getElementById('info-panel-title');
      const infoPanelContent = document.getElementById('info-panel-content');

      function infoRow(label, value, mono) {
        if (!value && value !== 0) return '';
        return '<div class="info-field">' +
          '<span class="info-field-label">' + escapeHtml(label) + '</span>' +
          '<span class="info-field-value' + (mono ? ' mono' : '') + '">' + escapeHtml(String(value)) + '</span>' +
          '</div>';
      }

      function openInfoPanel(tile) {
        closeSettings();
        var isBookmark = tile.type === 'bookmark';
        infoPanelTitle.textContent = tile.name || 'Info';

        var iconHtml = '';
        if (tile.icon) {
          iconHtml = '<div class="info-field"><img class="info-field-icon" src="' + escapeHtml(tile.icon) + '" alt=""></div>';
        }

        var content = iconHtml;
        content += infoRow('Name', tile.name);

        if (isBookmark) {
          content += infoRow('URL', tile.url, true);
          content += infoRow('Group', tile.group);
          content += infoRow('Order', tile.order);
        } else {
          content += infoRow('Port', tile.port, true);
          content += infoRow('PID', tile.pid, true);
          content += infoRow('Process', tile.process, true);
          content += infoRow('Working Directory', tile.cwd, true);
          content += infoRow('Description', tile.description);
          if (tile.stack && tile.stack.length > 0) {
            content += '<div class="info-field">' +
              '<span class="info-field-label">Stack</span>' +
              '<div class="stack-pills">' +
              tile.stack.map(function (s) { return '<span class="pill">' + escapeHtml(s) + '</span>'; }).join('') +
              '</div></div>';
          }
        }

        infoPanelContent.innerHTML = content;
        infoPanel.classList.add('open');
        infoBackdrop.classList.add('open');
      }

      function closeInfoPanel() {
        infoPanel.classList.remove('open');
        infoBackdrop.classList.remove('open');
      }

      document.getElementById('info-close').addEventListener('click', closeInfoPanel);
      infoBackdrop.addEventListener('click', closeInfoPanel);

      // Bookmark modal
      const modalEl = document.getElementById('bookmark-modal');
      const formEl = document.getElementById('bookmark-form');
      const formTitleEl = document.getElementById('bookmark-form-title');
      const formErrorEl = document.getElementById('bookmark-form-error');
      const submitBtn = document.getElementById('bookmark-submit');
      const urlInput = document.getElementById('bookmark-url');
      const nameInput = document.getElementById('bookmark-name');
      const iconInput = document.getElementById('bookmark-icon');
      let editingBookmark = null;

      function openBookmarkModal(bookmark) {
        closeInfoPanel();
        editingBookmark = bookmark || null;
        formEl.reset();
        formErrorEl.textContent = '';
        submitBtn.disabled = false;
        if (editingBookmark) {
          formTitleEl.textContent = 'Edit Bookmark';
          submitBtn.textContent = 'Save';
          urlInput.value = editingBookmark.url || '';
          nameInput.value = editingBookmark.name || '';
          iconInput.value = editingBookmark.icon || '';
        } else {
          formTitleEl.textContent = 'Add Bookmark';
          submitBtn.textContent = 'Add Bookmark';
        }
        modalEl.classList.add('open');
        urlInput.focus();
      }

      function closeBookmarkModal() {
        modalEl.classList.remove('open');
        editingBookmark = null;
        formEl.reset();
        formErrorEl.textContent = '';
      }

      // Settings panel
      const settingsPanel = document.getElementById('settings-panel');
      const settingsBackdrop = document.getElementById('settings-backdrop');

      function openSettings() {
        closeInfoPanel();
        settingsPanel.classList.add('open');
        settingsBackdrop.classList.add('open');
      }

      function closeSettings() {
        settingsPanel.classList.remove('open');
        settingsBackdrop.classList.remove('open');
      }

      document.getElementById('settings-btn').addEventListener('click', openSettings);
      document.getElementById('settings-close').addEventListener('click', closeSettings);
      settingsBackdrop.addEventListener('click', closeSettings);

      document.getElementById('theme-picker').addEventListener('click', function (e) {
        var btn = e.target.closest('.theme-option');
        if (btn) setThemePreference(btn.getAttribute('data-theme'));
      });

      // Apply theme from cache on load (server sync may update it)
      applyTheme(cachedTheme);

      document.getElementById('add-bookmark-btn').addEventListener('click', function () {
        closeSettings();
        openBookmarkModal(null);
      });

      document.getElementById('bookmark-cancel').addEventListener('click', function () {
        closeBookmarkModal();
      });

      modalEl.addEventListener('click', function (e) {
        if (e.target === modalEl) closeBookmarkModal();
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          if (modalEl.classList.contains('open')) {
            closeBookmarkModal();
          } else if (infoPanel.classList.contains('open')) {
            closeInfoPanel();
          } else if (settingsPanel.classList.contains('open')) {
            closeSettings();
          }
        }
      });

      formEl.addEventListener('submit', async function (e) {
        e.preventDefault();
        formErrorEl.textContent = '';
        const url = urlInput.value.trim();
        const name = nameInput.value.trim();
        const icon = iconInput.value.trim();
        if (!url || !name) {
          formErrorEl.textContent = 'URL and Name are required.';
          return;
        }
        submitBtn.disabled = true;
        const body = { url: normalizeUrl(url), name };
        if (icon) body.icon = icon;
        try {
          let res;
          if (editingBookmark) {
            res = await fetch('/api/bookmarks/' + encodeURIComponent(editingBookmark.id), {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body)
            });
          } else {
            res = await fetch('/api/bookmarks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body)
            });
          }
          if (!res.ok) {
            const data = await res.json().catch(function () { return {}; });
            formErrorEl.textContent = data.error || 'Something went wrong.';
            submitBtn.disabled = false;
            return;
          }
          closeBookmarkModal();
          poll();
        } catch (err) {
          formErrorEl.textContent = 'Network error. Please try again.';
          submitBtn.disabled = false;
        }
      });

      // Update check
      let updateDismissed = false;
      function checkUpdate() {
        fetch('/api/version').then(function (r) { return r.json(); }).then(function (data) {
          if (data && data.updateAvailable) {
            var bannerText = document.getElementById('update-banner-text');
            bannerText.textContent = 'Update available: ' + data.current + ' \u2192 ' + data.latest;
            if (!updateDismissed) {
              document.getElementById('update-banner').style.display = '';
            }
            var versionInfo = document.getElementById('version-info');
            versionInfo.textContent = data.current + ' (latest: ' + data.latest + ')';
          }
        }).catch(function () {});
      }
      document.getElementById('update-banner-dismiss').addEventListener('click', function () {
        updateDismissed = true;
        document.getElementById('update-banner').style.display = 'none';
      });
      checkUpdate();
      setTimeout(checkUpdate, 60000);

      // Visibility API: pause polling when tab is hidden
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
          clearTimeout(timer);
        } else {
          poll();
        }
      });

      // Initial load
      poll();
    })();
  </script>
</body>
</html>`;
}
