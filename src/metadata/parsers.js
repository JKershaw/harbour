/** @module parsers — Pure parsing functions for project metadata and stack detection. */

const COMMON_ACRONYMS = new Set(['api', 'cli', 'url', 'http', 'css', 'html', 'sql', 'sdk', 'jwt', 'ui', 'ux', 'db', 'io', 'ai', 'ml']);

/**
 * Convert a kebab-case or snake_case string to Title Case.
 * Recognises common acronyms and uppercases them.
 * @param {string} str
 * @returns {string}
 */
export function titleCase(str) {
  if (!str) return '';
  return str
    .split(/[-_]+/)
    .map(word => {
      if (COMMON_ACRONYMS.has(word.toLowerCase())) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Extract the repo name from a git remote URL.
 * @param {string} url
 * @returns {string|null}
 */
export function repoNameFromUrl(url) {
  const parsed = parseGitRemoteUrl(url);
  return parsed ? parsed.repo : null;
}

/**
 * Parse a git remote URL (HTTPS or SSH) into { owner, repo, host }.
 * @param {string} url
 * @returns {{ owner: string, repo: string, host: string }|null}
 */
export function parseGitRemoteUrl(url) {
  if (!url) return null;

  // HTTPS: https://github.com/user/repo.git or https://gitlab.com/group/subgroup/repo.git
  const httpsMatch = url.match(/^https?:\/\/([^/]+)\/(.+?)\/([^/]+?)(?:\.git)?$/);
  if (httpsMatch) {
    return { owner: httpsMatch[2], repo: httpsMatch[3], host: httpsMatch[1] };
  }

  // SSH: git@github.com:user/repo.git or git@gitlab.com:group/subgroup/repo.git
  const sshMatch = url.match(/^git@([^:]+):(.+?)\/([^/]+?)(?:\.git)?$/);
  if (sshMatch) {
    return { owner: sshMatch[2], repo: sshMatch[3], host: sshMatch[1] };
  }

  return null;
}

/**
 * Parse a README markdown string into { name, description }.
 * Description is the first line of the first non-badge paragraph after the title.
 * @param {string} content
 * @returns {{ name: string|null, description: string|null }}
 */
export function parseReadme(content) {
  if (!content || !content.trim()) return { name: null, description: null };

  const lines = content.split('\n');
  let name = null;
  let descStartIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // ATX heading: # Title
    const atxMatch = line.match(/^#\s+(.+)$/);
    if (atxMatch) {
      name = atxMatch[1].trim();
      descStartIdx = i + 1;
      break;
    }

    // Setext heading: Title\n=====
    if (i + 1 < lines.length && /^=+\s*$/.test(lines[i + 1]) && line.trim()) {
      name = line.trim();
      descStartIdx = i + 2;
      break;
    }
  }

  // Find first non-empty, non-badge, non-heading paragraph after the title
  let description = null;
  const startIdx = descStartIdx >= 0 ? descStartIdx : 0;

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    // Skip badge lines (markdown images/links starting with [![ )
    if (line.startsWith('[![') || line.startsWith('![')) continue;
    // Stop at next heading
    if (line.startsWith('#')) break;
    if (i + 1 < lines.length && /^[=-]+\s*$/.test(lines[i + 1])) break;
    description = line;
    break;
  }

  return { name, description };
}

/**
 * Parse a package.json string into { name, description, pkg }.
 * The full parsed object is included as `pkg` for downstream consumers
 * (e.g. stack detection from dependencies).
 * @param {string} content
 * @returns {{ name: string|null, description: string|null, pkg: object|null }}
 */
export function parsePackageJson(content) {
  if (!content) return { name: null, description: null, pkg: null };
  try {
    const pkg = JSON.parse(content);
    return {
      name: pkg.name ?? null,
      description: pkg.description ?? null,
      pkg,
    };
  } catch {
    return { name: null, description: null, pkg: null };
  }
}

/**
 * Minimal section-aware TOML parser. Extracts key = "value" pairs within a target section.
 * Quotes must match (both single or both double). Escaped or embedded quotes are not supported.
 * @param {string} content
 * @param {string} section  e.g. "project" or "package"
 * @returns {{ name: string|null, description: string|null }}
 */
function parseTomlSection(content, section) {
  if (!content) return { name: null, description: null };

  const lines = content.split('\n');
  let inSection = false;
  let name = null;
  let description = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Check for section headers
    const sectionMatch = trimmed.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      inSection = sectionMatch[1].trim() === section;
      continue;
    }

    if (!inSection) continue;

    // Extract key = "value" or key = 'value' (quotes must match)
    const kvMatch = trimmed.match(/^(\w+)\s*=\s*(["'])(.*)(\2)$/);
    if (!kvMatch) continue;

    const [, key, , value] = kvMatch;
    if (key === 'name') name = value;
    if (key === 'description') description = value;
  }

  return { name, description };
}

/**
 * Parse pyproject.toml content — extracts name/description from [project].
 * @param {string} content
 * @returns {{ name: string|null, description: string|null }}
 */
export function parsePyprojectToml(content) {
  return parseTomlSection(content, 'project');
}

/**
 * Parse Cargo.toml content — extracts name/description from [package].
 * @param {string} content
 * @returns {{ name: string|null, description: string|null }}
 */
export function parseCargoToml(content) {
  return parseTomlSection(content, 'package');
}

/**
 * Parse go.mod content — extracts module path as name.
 * @param {string} content
 * @returns {{ name: string|null, description: string|null }}
 */
export function parseGoMod(content) {
  if (!content) return { name: null, description: null };
  const match = content.match(/^module\s+(\S+)/m);
  return { name: match ? match[1] : null, description: null };
}

/**
 * Parse a .git/config file and extract the repo name from [remote "origin"].
 * Targets the origin section specifically to avoid picking up URLs from other
 * remotes (e.g. upstream, fork).
 * @param {string} content
 * @returns {{ name: string|null, description: string|null }}
 */
export function parseGitConfig(content) {
  if (!content) return { name: null, description: null };

  const lines = content.split('\n');
  let inOrigin = false;
  for (const line of lines) {
    const trimmed = line.trim();
    const sectionMatch = trimmed.match(/^\[(.+)\]$/);
    if (sectionMatch) {
      inOrigin = sectionMatch[1].trim() === 'remote "origin"';
      continue;
    }
    if (!inOrigin) continue;
    const urlMatch = trimmed.match(/^url\s*=\s*(.+)/);
    if (urlMatch) {
      const repoName = repoNameFromUrl(urlMatch[1].trim());
      return { name: repoName ?? null, description: null };
    }
  }
  return { name: null, description: null };
}

/* ---- Stack detection ---- */

/** Dependency-based detections: package name → stack label */
const DEP_RULES = [
  { dep: 'next', label: 'Next.js' },
  { dep: 'nuxt', label: 'Nuxt' },
  { dep: 'react', label: 'React' },
  { dep: 'vue', label: 'Vue' },
  { dep: 'svelte', label: 'Svelte' },
  { dep: 'express', label: 'Express' },
  { dep: 'fastify', label: 'Fastify' },
  { dep: 'hono', label: 'Hono' },
  { dep: 'koa', label: 'Koa' },
  { dep: 'typescript', label: 'TypeScript' },
  { dep: 'tailwindcss', label: 'Tailwind' },
  { dep: 'vite', label: 'Vite' },
];

/** File-marker-based detections: file name → stack label */
const FILE_RULES = [
  { file: 'manage.py', label: 'Django' },
  { file: 'Cargo.toml', label: 'Rust' },
  { file: 'go.mod', label: 'Go' },
  { file: 'requirements.txt', label: 'Python' },
  { file: 'pyproject.toml', label: 'Python' },
  { file: 'Gemfile', label: 'Ruby' },
  { file: 'Dockerfile', label: 'Docker' },
  { file: 'docker-compose.yml', label: 'Docker' },
  { file: 'docker-compose.yaml', label: 'Docker' },
];

/** Content-based detections: check file contents for framework signatures */
const CONTENT_RULES = [
  { file: 'requirements.txt', pattern: /^fastapi\b/im, label: 'FastAPI' },
  { file: 'pyproject.toml', pattern: /\bfastapi\b/i, label: 'FastAPI' },
];

/** Badge color mapping: stack label → hex color */
export const STACK_COLORS = {
  'Next.js':    '#000000',
  'Nuxt':       '#00DC82',
  'React':      '#58C4DC',
  'Vue':        '#42B883',
  'Svelte':     '#FF3E00',
  'Express':    '#EEEEEE',
  'Fastify':    '#EEEEEE',
  'Hono':       '#FF5B11',
  'Koa':        '#EEEEEE',
  'TypeScript': '#3178C6',
  'Tailwind':   '#38BDF8',
  'Vite':       '#BD34FE',
  'Django':     '#44B78B',
  'FastAPI':    '#009688',
  'Rust':       '#DEA584',
  'Go':         '#00ADD8',
  'Python':     '#FFD343',
  'Ruby':       '#CC342D',
  'Docker':     '#2496ED',
};

const DEFAULT_COLOR = '#888888';

/**
 * Get the badge color for a stack label.
 * @param {string} label
 * @returns {string}
 */
export function getStackColor(label) {
  return STACK_COLORS[label] ?? DEFAULT_COLOR;
}

/**
 * Detect technology stack from package.json dependencies, file markers,
 * and file contents.
 * @param {Record<string, string>} deps
 * @param {string[]} files
 * @param {Record<string, string>} [fileContents]
 * @returns {string[]}
 */
export function detectStack(deps, files, fileContents = {}) {
  const labels = new Set();

  if (deps && typeof deps === 'object') {
    for (const rule of DEP_RULES) {
      if (rule.dep in deps) labels.add(rule.label);
    }
  }

  if (Array.isArray(files)) {
    for (const rule of FILE_RULES) {
      if (files.includes(rule.file)) labels.add(rule.label);
    }
  }

  if (fileContents && typeof fileContents === 'object') {
    for (const rule of CONTENT_RULES) {
      const content = fileContents[rule.file];
      if (content && rule.pattern.test(content)) labels.add(rule.label);
    }
  }

  return [...labels];
}
