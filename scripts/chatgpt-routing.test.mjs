import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXPECTED, parseFrontmatter } from './generate-skills.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = path => readFile(join(root, path), 'utf8');

test('ChatGPT bundle exposes one canonical router and ten specialist skills', async () => {
  const names = (await readdir(join(root, 'skills'), { withFileTypes: true }))
    .filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
  assert.deepEqual(names, [...EXPECTED].sort());
  assert.equal(names.length, 11);
  const router = await read('skills/agentflow/SKILL.md');
  for (const name of names) {
    const path = 'skills/' + name + '/SKILL.md';
    const metadata = parseFrontmatter(await read(path), path);
    assert.equal(metadata.name, name);
    assert.match(metadata.description, /\buse\b/i, name + ' needs discovery guidance');
    if (name !== 'agentflow') {
      assert.ok(router.includes(String.fromCharCode(96) + name + String.fromCharCode(96)), name + ' not mapped by router');
    }
  }
});

test('router rejects unsupported host execution claims', async () => {
  const router = await read('skills/agentflow/SKILL.md');
  for (const guardrail of [
    'Installing it does not grant',
    'Read only code or repository files actually supplied',
    'Never imply that guidance caused a commit',
    'Do not fabricate execution logs',
    'nor slash-command syntax is guaranteed',
    'Use the **smallest relevant subset**',
    'Respect explicit specialist invocations'
  ]) {
    assert.ok(router.includes(guardrail), 'missing routing guardrail: ' + guardrail);
  }
});
