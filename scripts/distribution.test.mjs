import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { EXPECTED, parseFrontmatter } from './generate-skills.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const specialists = EXPECTED.filter((name) => name !== 'agentflow');

test('all canonical skill packages are discoverable from skills/<name>/SKILL.md', async () => {
  const rootSkills = join(root, 'skills');
  const directories = (await readdir(rootSkills, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  assert.deepEqual(directories, [...EXPECTED].sort());
  for (const name of EXPECTED) {
    const path = join(rootSkills, name, 'SKILL.md');
    const parsed = parseFrontmatter(await readFile(path, 'utf8'), path);
    assert.equal(parsed.name, name);
    assert.ok(parsed.body.trim());
  }
});

test('router references specialists and stays host-neutral', async () => {
  const router = await readFile(join(root, 'skills/agentflow/SKILL.md'), 'utf8');
  for (const name of specialists) {
    assert.ok(router.includes(name), 'Missing specialist ' + name);
  }
  assert.doesNotMatch(router, /~\/(?:\.claude|\.codex)|(?:\.claude|\.codex)\/skills\//);
});

test('every skill guide links to its generated runtime reference', async () => {
  for (const name of EXPECTED) {
    const guide = await readFile(join(root, 'src/content/docs/skills', name + '.md'), 'utf8');
    assert.ok(guide.includes('/reference/' + name + '/'), 'Missing reference: ' + name);
  }
});

test('distribution guide documents portable lifecycle and limitations', async () => {
  const guide = await readFile(join(root, 'src/content/docs/start/install.md'), 'utf8');
  for (const command of [
    'add howlil/agentflow --list', 'add howlil/agentflow -g',
    'skills@latest check', 'skills@latest update -g', 'skills@latest remove -g howlil/agentflow'
  ]) {
    assert.ok(guide.includes(command), 'Missing lifecycle command ' + command);
  }
  assert.match(guide, /not automatic/i);
  assert.match(guide, /vary by AI agent/i);
});

test('upgrade guide covers every route, migration, and deprecation', async () => {
  const guide = await readFile(join(root, 'src/content/docs/start/upgrade-and-migration.md'), 'utf8');
  for (const trace of [
    'npx skills@latest check',
    'npx skills@latest update -g',
    'npx skills@latest list -g',
    'production-ops',
    'release-engineering',
    'security-review',
    'graph-protocol',
    'call-graph-output',
    'Native plugins',
    'ChatGPT Web',
    'Deprecation policy'
  ]) assert.ok(guide.includes(trace), 'upgrade guide missing: ' + trace);
  const config = await readFile(join(root, 'astro.config.mjs'), 'utf8');
  assert.ok(config.includes("'start/upgrade-and-migration'"), 'sidebar must expose the upgrade guide');
  const readme = await readFile(join(root, 'README.md'), 'utf8');
  assert.ok(readme.includes('upgrade-and-migration'), 'README must link the upgrade guide');
  const contributing = await readFile(join(root, 'CONTRIBUTING.md'), 'utf8');
  assert.match(contributing, /keep the old one for at least one minor release/i);
  const changelog = await readFile(join(root, 'CHANGELOG.md'), 'utf8');
  assert.match(changelog, /## Unreleased/);
  assert.match(changelog, /upgrade and migration/);
});

test('distribution matrix and verification are documented', async () => {
  const guide = await readFile(join(root, 'src/content/docs/start/distribution.md'), 'utf8');
  for (const trace of ['Host matrix', 'Verify your install', '~/.agents/skills/', '~/.claude/skills/']) {
    assert.ok(guide.includes(trace), 'distribution guide missing: ' + trace);
  }
  const upgrade = await readFile(join(root, 'src/content/docs/start/install.md'), 'utf8');
  assert.ok(upgrade.includes('/start/upgrade-and-migration/'), 'install guide must link the upgrade page');
});
