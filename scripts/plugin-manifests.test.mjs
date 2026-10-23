import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncPluginVersions, validatePluginDistribution } from './plugin-manifests.mjs';

const repo = fileURLToPath(new URL('..', import.meta.url));

async function fixture(run) {
  const root = await mkdtemp(join(tmpdir(), 'agentflow-plugin-test-'));
  for (const folder of ['.claude-plugin', '.agents/plugins', 'skills', 'packages/cli']) {
    await mkdir(join(root, folder), { recursive: true });
  }
  const paths = ['package.json', 'package-lock.json', 'plugin.json',
    '.claude-plugin/plugin.json', '.claude-plugin/marketplace.json',
    '.agents/plugins/marketplace.json', 'packages/cli/package.json'];
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
  assert.equal(result.count, 11);
  assert.equal(result.version, '0.3.0');
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
    assert.deepEqual(await validatePluginDistribution({ root }), { version: '0.3.0', count: 11 });
  });
});

test('package-lock drift blocks version publishing even when manifests match', async () => {
  await fixture(async root => {
    const path = join(root, 'package-lock.json');
    const lock = JSON.parse(await readFile(path, 'utf8'));
    lock.packages[''].version = '9.9.9';
    await writeFile(path, JSON.stringify(lock));
    await assert.rejects(syncPluginVersions({ root, write: true }), /package-lock root version differs/);
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

test('CLI manifest version drift is checked and synchronized from root package', async () => {
  await fixture(async root => {
    const path = join(root, 'packages/cli/package.json');
    const original = JSON.parse(await readFile(path, 'utf8'));
    await writeFile(path, JSON.stringify({ ...original, version: '0.2.0' }));
    await assert.rejects(validatePluginDistribution({ root }), /CLI package version .* differs/);
    await syncPluginVersions({ root, write: true });
    assert.deepEqual(JSON.parse(await readFile(path, 'utf8')), original);
  });
});
