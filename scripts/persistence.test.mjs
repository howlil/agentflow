import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (path) => readFile(join(root, path), 'utf8');
const ALLOWED = new Set(['product.md', 'engineering.md', 'DESIGN.md']);

async function markdownFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await markdownFiles(path));
    else if (entry.name.endsWith('.md')) out.push(path);
  }
  return out;
}

test('skills persist project memory only in the three .agents files', async () => {
  const violations = [];
  for (const file of await markdownFiles(join(root, 'skills'))) {
    const body = (await readFile(file, 'utf8')).replaceAll(
      '.agents/{product,engineering,DESIGN}.md',
      '.agents/product.md, .agents/engineering.md, .agents/DESIGN.md'
    );
    for (const match of body.matchAll(/\.agents\/([A-Za-z0-9_.\-/]+)/g)) {
      const target = match[1].replace(/[.,;:)]+$/, '');
      if (!ALLOWED.has(target)) violations.push(relative(root, file) + ' → .agents/' + target);
    }
  }
  assert.deepEqual(violations, [], 'unexpected .agents paths:\n' + violations.join('\n'));
});

test('repository .agents directory keeps exactly the three markdown memory files', async () => {
  const mdFiles = (await readdir(join(root, '.agents'), { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name)
    .sort();
  assert.deepEqual(mdFiles, [...ALLOWED].sort());
});

test('router owns the persistence contract, output budgets, and new-project init', async () => {
  const router = await read('skills/agentflow/SKILL.md');
  for (const file of ALLOWED) assert.ok(router.includes('.agents/' + file), 'router missing .agents/' + file);
  assert.match(router, /New project or explicit init/);
  assert.match(router, /Edit in place/i);
  assert.match(router, /Budget \(both modes\)/);
  assert.match(router, /at most three workflows/);
  assert.match(router, /manual exploratory and acceptance pass/i);
});

test('each memory file has one writing specialist', async () => {
  assert.match(await read('skills/product-design/SKILL.md'), /\.agents\/product\.md/);
  assert.match(await read('skills/engineering-design/SKILL.md'), /\.agents\/engineering\.md/);
  assert.match(await read('skills/design-graph/SKILL.md'), /\.agents\/DESIGN\.md/);
});
