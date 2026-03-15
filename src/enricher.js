/**
 * @module enricher — Enrichment orchestrator with PID-keyed caching.
 * Adds name, description, stack, icon, and cwd to service objects.
 */

import { readFile as fsReadFile, readdir as fsReaddir } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { resolveAllCwds as defaultResolveAllCwds } from './metadata/cwd.js';
import { resolveAllArgv as defaultResolveAllArgv, identifyFromArgv, extractBundleName } from './metadata/argv.js';
import {
  parseReadme,
  parsePackageJson,
  parsePyprojectToml,
  parseCargoToml,
  parseGoMod,
  parseGitConfig,
  titleCase,
  detectStack,
} from './metadata/parsers.js';
import { STACK_ICONS } from './icons.js';
import { fetchFavicon as defaultFetchFavicon } from './favicon.js';

/**
 * Name sources in priority order. Each returns { name, description } and
 * optionally { pkg } for package.json.
 */
const NAME_SOURCES = [
  { file: 'README.md', parse: parseReadme, keepCase: true },
  { file: 'package.json', parse: parsePackageJson },
  { file: 'pyproject.toml', parse: parsePyprojectToml },
  { file: 'Cargo.toml', parse: parseCargoToml },
  { file: 'go.mod', parse: parseGoMod, keepCase: true },
];

/** Icon file names to look for in project root (priority order). */
const PROJECT_ICON_FILES = ['icon.svg', 'icon.png', 'logo.svg', 'logo.png'];

/**
 * Create an enricher instance with optional dependency injection for testing.
 * @param {object} [deps] — optional overrides for I/O functions
 * @returns {{ enrichServices: (services: object[]) => Promise<object[]> }}
 */
export function createEnricher(deps = {}) {
  const resolveAllCwds = deps.resolveAllCwds ?? defaultResolveAllCwds;
  const resolveAllArgv = deps.resolveAllArgv ?? defaultResolveAllArgv;
  const readFile = deps.readFile ?? ((path) => fsReadFile(path, 'utf-8'));
  const readFileRaw = deps.readFileRaw ?? ((path) => fsReadFile(path));
  const readdir = deps.readdir ?? ((path) => fsReaddir(path));
  const fetchFavicon = deps.fetchFavicon ?? defaultFetchFavicon;

  /** @type {Map<number, object>} PID → enriched metadata */
  const cache = new Map();

  /**
   * Try to read a file, returning its content or null on failure.
   */
  async function tryReadFile(filePath) {
    try { return await readFile(filePath); } catch { return null; }
  }

  /**
   * Enrich a single service given its cwd and argv.
   */
  async function enrichOne(service, cwd, argv) {
    let name = null;
    let description = null;
    let stack = [];
    let icon = null;

    if (cwd) {
      let files;
      try { files = await readdir(cwd); } catch { files = []; }

      // --- Step 1: Resolve name and description from project files ---
      // Also captures package.json for stack detection (it's always read
      // when present because we need its dependencies).
      let pkgJson = null;
      const readCache = {};

      for (const source of NAME_SOURCES) {
        if (!files.includes(source.file)) continue;
        // Skip if we already have both name and description,
        // unless it's package.json (needed for deps).
        if (name && description && source.file !== 'package.json') continue;

        const content = await tryReadFile(join(cwd, source.file));
        if (!content) continue;
        readCache[source.file] = content;

        const parsed = source.parse(content);
        if (!name && parsed.name) {
          name = source.keepCase ? parsed.name : titleCase(parsed.name);
        }
        if (!description && parsed.description) {
          description = parsed.description;
        }
        if (source.file === 'package.json' && parsed.pkg) {
          pkgJson = parsed.pkg;
        }
      }

      // Fallback name: .git/config repo name
      if (!name && files.includes('.git')) {
        const content = await tryReadFile(join(cwd, '.git', 'config'));
        if (content) {
          const parsed = parseGitConfig(content);
          if (parsed.name) name = titleCase(parsed.name);
        }
      }

      // --- Step 2: Detect technology stack ---
      const fileContents = {};
      for (const fileName of ['requirements.txt', 'pyproject.toml']) {
        if (fileName in readCache) {
          fileContents[fileName] = readCache[fileName];
        } else if (files.includes(fileName)) {
          const content = await tryReadFile(join(cwd, fileName));
          if (content) fileContents[fileName] = content;
        }
      }

      const pkgDeps = pkgJson
        ? { ...pkgJson.dependencies, ...pkgJson.devDependencies }
        : {};
      stack = detectStack(pkgDeps, files, fileContents);

      // --- Step 3: Resolve icon (favicon → project file → stack logo) ---
      icon = await fetchFavicon(service.port);

      if (!icon) {
        for (const f of PROJECT_ICON_FILES) {
          if (!files.includes(f)) continue;
          try {
            const buf = await readFileRaw(join(cwd, f));
            const ext = f.endsWith('.svg') ? 'svg+xml' : 'png';
            icon = `data:image/${ext};base64,${buf.toString('base64')}`;
            break;
          } catch { /* try next */ }
        }
      }

      if (!icon) {
        const match = stack.find(s => STACK_ICONS[s]);
        if (match) icon = STACK_ICONS[match];
      }
    } else {
      // No cwd — try favicon only
      icon = await fetchFavicon(service.port);
    }

    // --- Step 4: Argv-based name fallbacks ---
    if (!name && argv) {
      name = identifyFromArgv(argv) || extractBundleName(argv);
    }
    if (!name) {
      name = cwd ? titleCase(basename(cwd)) : `Port ${service.port}`;
    }

    return { name, description, stack, cwd, icon };
  }

  /**
   * Enrich an array of services with metadata.
   * Uses PID-keyed caching: evicts PIDs that disappear, computes for new PIDs.
   */
  async function enrichServices(services) {
    if (!services || services.length === 0) return [];

    const currentPids = new Set(services.map(s => s.pid));

    // Evict cached services for PIDs no longer present
    for (const pid of cache.keys()) {
      if (!currentPids.has(pid)) cache.delete(pid);
    }

    // Find new PIDs that need enrichment
    const newPids = services.filter(s => !cache.has(s.pid)).map(s => s.pid);

    if (newPids.length > 0) {
      // Resolve cwds and argv for new PIDs in parallel
      let cwdMap = new Map();
      let argvMap = new Map();
      const [cwdResult, argvResult] = await Promise.allSettled([
        resolveAllCwds(newPids),
        resolveAllArgv(newPids),
      ]);
      if (cwdResult.status === 'fulfilled') cwdMap = cwdResult.value;
      if (argvResult.status === 'fulfilled') argvMap = argvResult.value;

      // Enrich new PIDs and cache results
      await Promise.all(
        services
          .filter(s => !cache.has(s.pid))
          .map(async (service) => {
            const cwd = cwdMap.get(service.pid) ?? null;
            const argv = argvMap.get(service.pid) ?? null;
            cache.set(service.pid, await enrichOne(service, cwd, argv));
          }),
      );
    }

    // Merge cached metadata into services
    return services.map(service => ({ ...service, ...cache.get(service.pid) }));
  }

  return { enrichServices };
}
