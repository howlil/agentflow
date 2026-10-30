import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXPECTED, parseFrontmatter } from './generate-skills.mjs';
import { validateChatGPTPackage } from './chatgpt-package.mjs';

export const VERSIONED_MANIFESTS = ['plugin.json', '.claude-plugin/plugin.json', '.codex-plugin/plugin.json'];
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

async function readJson(root, path) {
  return JSON.parse(await readFile(join(root, path), 'utf8'));
}

export async function syncPluginVersions({ root = process.cwd(), write = false } = {}) {
  const pkg = await readJson(root, 'package.json');
  if (!SEMVER.test(pkg.version)) throw new Error('package.json version must be semantic versioning');

  // bun.lock (text) is the canonical lockfile. It does not duplicate the root
  // version, so version parity is enforced across package.json and the native
  // manifests below; `bun install --frozen-lockfile` protects lock drift in CI.
  await readFile(join(root, 'bun.lock'), 'utf8');

  for (const path of VERSIONED_MANIFESTS) {
    const content = await readJson(root, path);
    if (content.name !== 'agentflow') throw new Error(path + ' must declare plugin name agentflow');
    if (content.version !== pkg.version) {
      if (!write) {
        throw new Error(path + ' version ' + content.version + ' differs from package.json ' + pkg.version +
          '; run bun run plugins:sync');
      }
      content.version = pkg.version;
      await writeFile(join(root, path), JSON.stringify(content, null, 2) + '\n');
    }
  }
  return pkg.version;
}

export async function validatePluginDistribution({ root = process.cwd() } = {}) {
  const version = await syncPluginVersions({ root });
  const portable = await readJson(root, 'plugin.json');
  const claude = await readJson(root, '.claude-plugin/plugin.json');
  const codex = await readJson(root, '.codex-plugin/plugin.json');
  const claudeMarket = await readJson(root, '.claude-plugin/marketplace.json');
  const codexMarket = await readJson(root, '.agents/plugins/marketplace.json');

  if (portable.$schema !== 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json') {
    throw new Error('Portable manifest must use Agent Plugins 1.0 schema');
  }
  if (!portable.description || !claude.description || !codex.description || portable.license !== 'MIT') {
    throw new Error('Plugin metadata must include descriptions and MIT license');
  }

  // Validate the canonical ChatGPT manifest before checking legacy listing parity.
  const chatgpt = await validateChatGPTPackage({ root });
  if (codex.name !== portable.name || codex.version !== version || codex.description !== portable.description ||
      JSON.stringify(codex.interface) !== JSON.stringify(portable.extensions?.['com.openai']?.interface)) {
    throw new Error('ChatGPT canonical manifest differs from portable root listing identity or metadata');
  }
  if (chatgpt.version !== version) throw new Error('ChatGPT version differs from root package.json');

  if (claudeMarket.name !== 'agentflow' || claudeMarket.plugins?.length !== 1 ||
      claudeMarket.plugins[0]?.name !== claude.name ||
      claudeMarket.plugins[0]?.source !== './') {
    throw new Error('Claude marketplace must reference this root plugin exactly once');
  }
  if (codexMarket.name !== 'agentflow' || codexMarket.plugins?.length !== 1 ||
      codexMarket.plugins[0]?.name !== codex.name ||
      codexMarket.plugins[0]?.source?.source !== 'local' ||
      codexMarket.plugins[0]?.source?.path !== './' ||
      codexMarket.plugins[0]?.policy?.installation !== 'AVAILABLE' ||
      codexMarket.plugins[0]?.policy?.authentication !== 'ON_INSTALL') {
    throw new Error('Codex marketplace must reference root portable plugin exactly once');
  }

  // No copied skill packages: both plugin hosts must discover the same root skills.
  const directories = (await readdir(join(root, 'skills'), { withFileTypes: true }))
    .filter(item => item.isDirectory()).map(item => item.name).sort();
  if (JSON.stringify(directories) !== JSON.stringify([...EXPECTED].sort())) {
    throw new Error('Native plugin skill set differs from canonical EXPECTED packages');
  }
  for (const name of EXPECTED) {
    const path = join(root, 'skills', name, 'SKILL.md');
    const parsed = parseFrontmatter(await readFile(path, 'utf8'), path);
    if (parsed.name !== name) throw new Error('Skill name mismatch: ' + name);
  }
  return { version, count: directories.length };
}

const invokedDirectly = process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  const args = process.argv.slice(2);
  if (args.length !== 1 || !['--check', '--write'].includes(args[0])) {
    throw new Error('Usage: node scripts/plugin-manifests.mjs --check|--write');
  }
  if (args[0] === '--write') {
    const version = await syncPluginVersions({ write: true });
    console.log('Synchronized native plugin manifests to v' + version);
  } else {
    const { version, count } = await validatePluginDistribution();
    console.log('Validated both marketplaces, v' + version + ', ' + count + ' canonical skills.');
  }
}
