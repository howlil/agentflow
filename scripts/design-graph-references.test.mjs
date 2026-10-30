import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const referenceDir = join(root, 'skills/design-graph/references');
const read = (path) => readFile(join(root, path), 'utf8');

// The design-graph references are the only place in the catalog where craft
// values live. They stay small, cited, and free of runtime dependencies so the
// skill remains portable instructions rather than a pipeline.
const EXPENSIVE = [/\.mjs\b/i, /\.webp\b/i, /\.mp4\b/i, /playwright/i, /ffmpeg/i, /screenshot/i];

test('every design-graph reference is cited by the skill', async () => {
  const skill = await read('skills/design-graph/SKILL.md');
  const files = (await readdir(referenceDir)).filter((name) => name.endsWith('.md')).sort();
  assert.deepEqual(files, ['craft.md', 'direction.md', 'signs.md', 'tokens.md', 'visuals.md']);
  for (const name of files) {
    assert.ok(skill.includes('references/' + name), 'SKILL.md does not cite references/' + name);
  }
});

test('references keep attribution and a readable budget', async () => {
  for (const name of await readdir(referenceDir)) {
    const body = await readFile(join(referenceDir, name), 'utf8');
    assert.match(body, /CC BY 4\.0/, name + ' lost its CC BY 4.0 attribution');
    assert.match(body, /Damir Sokolovsky/, name + ' lost its author credit');
    assert.match(body, /CREDITS\.md/, name + ' must point at CREDITS.md');
    assert.ok(body.split('\n').length <= 140, name + ' exceeds the craft reference budget');
  }
});

test('references stay craft guidance, not a runtime or a second policy', async () => {
  for (const name of await readdir(referenceDir)) {
    const body = await readFile(join(referenceDir, name), 'utf8');
    for (const pattern of EXPENSIVE) {
      assert.doesNotMatch(body, pattern, name + ' reintroduces an executable or asset dependency');
    }
  }
  const craft = await read('skills/design-graph/references/craft.md');
  assert.ok(craft.includes('design-thinking'), 'craft.md must defer implementation to design-thinking');
  assert.match(craft, /§6/, 'craft.md must defer interaction semantics to §6');
  assert.doesNotMatch(craft, /^## IDs$/m, 'craft.md must not restate the ID contract');
});

test('the credits file records the license boundary', async () => {
  const credits = await read('CREDITS.md');
  for (const trace of ['unslop', 'Damir Sokolovsky', 'CC BY 4.0', 'heydamir']) {
    assert.ok(credits.includes(trace), 'CREDITS.md is missing ' + trace);
  }
  for (const name of ['direction.md', 'craft.md', 'signs.md', 'tokens.md', 'visuals.md']) {
    assert.ok(credits.includes(name), 'CREDITS.md does not list ' + name);
  }
});
