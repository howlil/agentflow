import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncPluginVersions, validatePluginDistribution } from './plugin-manifests.mjs';

const repo = fileURLToPath(new URL('..', import.meta.url));
const packageVersion = JSON.parse(await readFile(join(repo, 'package.json'), 'utf8')).version;

async function fixture(run) {
  const root = await mkdtemp(join(tmpdir(), 'agentflow-plugin-test-'));
  for (const folder of ['.claude-plugin', '.codex-plugin', '.agents/plugins', 'skills', 'assets']) {
    await mkdir(join(root, folder), { recursive: true });
  }
  const paths = ['package.json', 'bun.lock', 'plugin.json', '.codex-plugin/plugin.json',
    '.claude-plugin/plugin.json', '.claude-plugin/marketplace.json',
    '.agents/plugins/marketplace.json', 'assets/agentflow.svg'];
  for (const path of paths) {
    await writeFile(join(root, path), await readFile(join(repo, path)));
  }
  const { EXPECTED } = await import('./generate-skills.mjs');
  for (const name of EXPECTED) {
    await mkdir(join(root, 'skills', name), { recursive: true });
    await writeFile(join(root, 'skills', name, 'SKILL.md'),
      '---\nname: ' + name + '\ndescription: Test package\n---\n\nTest instructions.\n');
  }
  try { await run(root); } finally { await rm(root, { recursive: true, force: true }); }
}

test('current manifests have one plugin identity and canonical skill source', async () => {
  const result = await validatePluginDistribution({ root: repo });
  assert.equal(result.count, 8);
  assert.equal(result.version, packageVersion);
});

test('version drift is detected and can be synchronized without modifying other fields', async () => {
  await fixture(async root => {
    const path = join(root, '.claude-plugin/plugin.json');
    const original = JSON.parse(await readFile(path, 'utf8'));
    const outdated = { ...original, version: '0.1.0' };
    await writeFile(path, JSON.stringify(outdated, null, 2) + '\n');
    await assert.rejects(syncPluginVersions({ root }), /version .* differs/);
    await syncPluginVersions({ root, write: true });
    assert.deepEqual(JSON.parse(await readFile(path, 'utf8')), original);
    assert.deepEqual(await validatePluginDistribution({ root }), { version: packageVersion, count: 8 });
  });
});

test('missing canonical lockfile blocks version publishing even when manifests match', async () => {
  await fixture(async root => {
    await rm(join(root, 'bun.lock'), { force: true });
    await assert.rejects(syncPluginVersions({ root, write: true }), /ENOENT|bun\.lock/);
  });
});

test('reject a marketplace that points outside the canonical root', async () => {
  await fixture(async root => {
    const path = join(root, '.agents/plugins/marketplace.json');
    const manifest = JSON.parse(await readFile(path, 'utf8'));
    manifest.plugins[0].source.path = './copied-skills';
    await writeFile(path, JSON.stringify(manifest));
    await assert.rejects(validatePluginDistribution({ root }), /Codex marketplace must reference root/);
  });
});

test('reject a Claude marketplace whose entry name diverges from the plugin identity', async () => {
  await fixture(async root => {
    const path = join(root, '.claude-plugin/marketplace.json');
    const manifest = JSON.parse(await readFile(path, 'utf8'));
    manifest.plugins[0].name = 'something-else';
    await writeFile(path, JSON.stringify(manifest));
    await assert.rejects(validatePluginDistribution({ root }), /Claude marketplace must reference/);
  });
});


test('reject a ChatGPT listing icon missing from the portable bundle', async () => {
  await fixture(async root => {
    const path = join(root, '.codex-plugin/plugin.json');
    const plugin = JSON.parse(await readFile(path, 'utf8'));
    plugin.interface.logo = './assets/missing.svg';
    await writeFile(path, JSON.stringify(plugin));
    await assert.rejects(validatePluginDistribution({ root }), /ENOENT/);
  });
});

test('reject host-mention starter prompts and misleading MCP declarations', async () => {
  await fixture(async root => {
    const path = join(root, '.codex-plugin/plugin.json');
    const plugin = JSON.parse(await readFile(path, 'utf8'));
    plugin.interface.defaultPrompt = ['@Agentflow review code'];
    await writeFile(path, JSON.stringify(plugin));
    await assert.rejects(validatePluginDistribution({ root }), /starter prompts/);
    plugin.interface.defaultPrompt = ['Review this code'];
    plugin.apps = './.app.json';
    await writeFile(path, JSON.stringify(plugin));
    await assert.rejects(validatePluginDistribution({ root }), /skills-only package/);
  });
});

test('reject ChatGPT directory descriptions longer than submission limits', async () => {
  await fixture(async root => {
    const path = join(root, '.codex-plugin/plugin.json');
    const plugin = JSON.parse(await readFile(path, 'utf8'));
    plugin.interface.shortDescription = 'A'.repeat(31);
    await writeFile(path, JSON.stringify(plugin));
    await assert.rejects(validatePluginDistribution({ root }), /shortDescription/);
  });
});

test('reject canonical manifest listing drift', async () => {
  await fixture(async root => {
    const path = join(root, '.codex-plugin/plugin.json');
    const plugin = JSON.parse(await readFile(path, 'utf8'));
    plugin.interface.displayName = 'Another Name';
    await writeFile(path, JSON.stringify(plugin));
    await assert.rejects(validatePluginDistribution({ root }), /canonical manifest differs/);
  });
});
