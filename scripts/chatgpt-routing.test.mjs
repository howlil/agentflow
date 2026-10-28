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

test('M0 execution issue keeps one authoritative acceptance ledger', async () => {
  const template = await read('.github/ISSUE_TEMPLATE/agentflow-execution.md');
  assert.match(template, /single authoritative record/);
  assert.match(template, /Requirement evidence ledger/);
  assert.match(template, /Verification \(method, SHA, result\)/);
  assert.match(template, /IMPLEMENTED_UNVERIFIED/);
  const requirementRows = template.split('\n').filter(line => /^\| AF-[0-9]+ \|/.test(line));
  assert.equal(requirementRows.length, 1, 'template should illustrate one requirement row');
  assert.doesNotMatch(template, /^- \[[ xX]\] \*\*AF-[0-9]+/m, 'no duplicate checkbox requirement list');
});

test('router local references resolve and can evolve without a fixed filename inventory', async () => {
  const router = await read('skills/agentflow/SKILL.md');
  const refs = [...new Set(router.match(/references\/[a-z-]+\.md/g))];
  assert.ok(refs.length > 0);
  for (const ref of refs) assert.ok((await read('skills/agentflow/' + ref)).trim());
});
