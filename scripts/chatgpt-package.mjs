import { lstat, readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXPECTED, parseFrontmatter } from './generate-skills.mjs';

const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function required(value, max, field) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) {
    throw new Error('Invalid ChatGPT ' + field + ' (required, <= ' + max + ' chars)');
  }
  return value;
}

function optionalUrl(value, field, max = 1024) {
  if (value === undefined) return;
  required(value, max, field);
  let parsed;
  try { parsed = new URL(value); } catch { throw new Error('Invalid ChatGPT ' + field + ': HTTPS URL required'); }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
    throw new Error('Invalid ChatGPT ' + field + ': public HTTPS URL required');
  }
}

function luminance(color) {
  const channels = color.match(/[a-f0-9]{2}/gi).map(hex => parseInt(hex, 16) / 255);
  const [r, g, b] = channels.map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

async function regularFile(path) {
  const info = await lstat(path);
  if (!info.isFile() || info.isSymbolicLink()) throw new Error('ChatGPT package requires a regular file: ' + path);
  return readFile(path, 'utf8');
}

async function cleanTree(path) {
  const stat = await lstat(path);
  if (stat.isSymbolicLink() || (!stat.isDirectory() && !stat.isFile())) {
    throw new Error('ChatGPT package cannot contain symlinks or special files: ' + path);
  }
  if (stat.isDirectory()) {
    for (const name of await readdir(path)) await cleanTree(join(path, name));
  }
}

function assetPath(path) {
  if (typeof path !== 'string' || !/^\.\/assets\/[a-zA-Z0-9_-]+\.(svg|png|webp)$/.test(path)) {
    throw new Error('Invalid ChatGPT asset path: ' + String(path));
  }
  return path.slice(2);
}

async function imageFile(root, path) {
  const safePath = assetPath(path);
  const full = join(root, safePath);
  const bytes = await regularFile(full);
  if (safePath.endsWith('.svg')) {
    const square = bytes.match(/viewBox=["']0 0 (\d+) (\d+)["']/);
    if (!square || Number(square[1]) < 48 || square[1] !== square[2]) {
      throw new Error('ChatGPT SVG icon must have a square viewBox at least 48 units: ' + path);
    }
    if (/<(?:script|foreignObject)\b|on(?:load|error)\s*=|(?:xlink:)?href\s*=/i.test(bytes)) {
      throw new Error('ChatGPT SVG asset contains unsupported active or external content: ' + path);
    }
  }
}

export async function validateChatGPTPackage({ root = process.cwd(), strictRoot = false } = {}) {
  const portable = JSON.parse(await regularFile(join(root, 'plugin.json')));
  if (portable.$schema !== 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json' ||
      !NAME.test(portable.name || '') || portable.name.length > 64 ||
      !SEMVER.test(portable.version || '')) {
    throw new Error('Invalid portable ChatGPT plugin identity, schema or semantic version');
  }
  required(portable.description, 4000, 'root description');
  if (portable.author !== undefined) {
    required(portable.author?.name, 120, 'author.name');
    optionalUrl(portable.author.url, 'author.url', 2048);
  }
  optionalUrl(portable.homepage, 'homepage', 2048);
  const extension = portable.extensions?.['com.openai'];
  const ui = extension?.interface;
  if (!ui || typeof ui !== 'object') throw new Error('Missing ChatGPT interface metadata');
  required(ui.displayName, 30, 'displayName');
  required(ui.shortDescription, 30, 'shortDescription');
  required(ui.longDescription, 4000, 'longDescription');
  required(ui.developerName, 80, 'developerName');
  required(ui.category, 80, 'category');
  for (const key of ['websiteURL', 'supportURL', 'privacyPolicyURL', 'termsOfServiceURL']) {
    optionalUrl(ui[key], key);
  }
  if (ui.capabilities !== undefined &&
      (!Array.isArray(ui.capabilities) || ui.capabilities.length > 20 ||
       ui.capabilities.some(c => typeof c !== 'string' || !c.trim() || c.length > 120))) {
    throw new Error('Invalid ChatGPT capabilities');
  }
  if (ui.defaultPrompt !== undefined) {
    const prompts = Array.isArray(ui.defaultPrompt) ? ui.defaultPrompt : [ui.defaultPrompt];
    if (!prompts.length || prompts.length > 3 ||
        prompts.some(p => typeof p !== 'string' || !p.trim() || p.length > 128 || /@[\w-]+/.test(p)) ||
        new Set(prompts.map(p => p.trim().toLowerCase())).size !== prompts.length) {
      throw new Error('Invalid ChatGPT starter prompts');
    }
  }
  for (const [key, against] of [['brandColor', 'FFFFFF'], ['brandColorDark', '212121']]) {
    if (ui[key] === undefined) continue;
    if (typeof ui[key] !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(ui[key]) ||
        contrast(ui[key].slice(1), against) < 2) {
      throw new Error('Invalid ChatGPT ' + key + ': color must meet 2:1 contrast');
    }
  }
  for (const key of ['logo', 'composerIcon']) {
    if (!ui[key]) throw new Error('Missing ChatGPT ' + key + ' icon');
    await imageFile(root, ui[key]);
  }
  for (const key of ['logoDark', 'composerIconDark']) {
    if (ui[key] !== undefined) await imageFile(root, ui[key]);
  }
  if (ui.screenshots !== undefined) {
    if (!Array.isArray(ui.screenshots)) throw new Error('Invalid ChatGPT screenshots');
    for (const item of ui.screenshots) await imageFile(root, item);
  }
  if (extension.onboardingSkill !== undefined) {
    const path = extension.onboardingSkill;
    if (typeof path !== 'string' || !/^\.\/skills\/[a-z0-9-]+\/SKILL\.md$/.test(path)) {
      throw new Error('Invalid ChatGPT onboardingSkill path');
    }
    await regularFile(join(root, path.slice(2)));
  }
  if (extension.apps !== undefined || extension.hooks !== undefined || portable.apps !== undefined ||
      portable.mcpServers !== undefined) {
    throw new Error('ChatGPT public skills-only package must not include app mappings or lifecycle hooks');
  }
  const entries = await readdir(root);
  if (entries.includes('mcp.json') || entries.includes('.app.json') || entries.includes('hooks')) {
    throw new Error('ChatGPT public skills-only package must not contain MCP, app or hooks files');
  }
  if (strictRoot) {
    const allowed = ['plugin.json', 'skills', 'assets'];
    const extras = entries.filter(name => !allowed.includes(name));
    if (extras.length || allowed.some(name => !entries.includes(name))) {
      throw new Error('ChatGPT submission archive has unexpected or missing root entries: ' + extras.join(', '));
    }
    await cleanTree(join(root, 'assets'));
    await cleanTree(join(root, 'skills'));
  }
  const directories = (await readdir(join(root, 'skills'), { withFileTypes: true }));
  if (directories.some(d => !d.isDirectory()) ||
      JSON.stringify(directories.map(d => d.name).sort()) !== JSON.stringify([...EXPECTED].sort())) {
    throw new Error('ChatGPT skills bundle differs from canonical skill set');
  }
  for (const name of EXPECTED) {
    const path = join(root, 'skills', name, 'SKILL.md');
    const parsed = parseFrontmatter(await regularFile(path), path);
    if (parsed.name !== name) throw new Error('ChatGPT skill directory/frontmatter mismatch: ' + name);
  }
  return { version: portable.version, count: EXPECTED.length };
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  if (process.argv[2] !== '--check' || process.argv.length > 4) {
    throw new Error('Usage: node scripts/chatgpt-package.mjs --check [extracted-archive-root]');
  }
  const root = process.argv[3] ? resolve(process.argv[3]) : process.cwd();
  const result = await validateChatGPTPackage({ root, strictRoot: Boolean(process.argv[3]) });
  console.log('Validated ChatGPT skills-only package: v' + result.version + ', ' + result.count + ' canonical skills');
}
