import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { EXPECTED, formatDiscoveryIndex, generateSkills } from './generate-skills.mjs';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');

test('agent discovery index has canonical links, not copies of runtime instructions', () => {
  const result = formatDiscoveryIndex([
    { name: 'agentflow', description: 'Choose the correct engineering skill.', sourcePath: 'skills/agentflow/SKILL.md' },
    { name: 'code-review', description: 'Review changes in context.', sourcePath: 'skills/code-review/SKILL.md' },
  ]);
  assert.ok(result.startsWith('# Agentflow\n'));
  assert.ok(result.includes('## Canonical Skills'));
  assert.ok(result.includes('raw.githubusercontent.com/howlil/agentflow/master/skills/agentflow/SKILL.md'));
  assert.ok(result.includes('## Get Started'));
  assert.equal(result.split('- [agentflow]').length - 1, 1);
  assert.equal(result.split('- [code-review]').length - 1, 1);
  assert.ok(!result.includes('javascript:'));
});

test('generated static discovery index tracks changes to canonical skill descriptions', async () => {
  const base = await mkdtemp(join(tmpdir(), 'agentflow-discovery-'));
  try {
    const skill = join(base, 'skills', 'example');
    const guide = join(base, 'src', 'content', 'docs', 'skills');
    await mkdir(skill, { recursive: true });
    await mkdir(guide, { recursive: true });
    await writeFile(join(guide, 'example.md'), '[Canonical](/reference/example/)\n');
    const path = join(skill, 'SKILL.md');
    const source = description => [
      '---', 'name: example', 'description: ' + JSON.stringify(description), '---',
      '', '# Example', '', 'Instructions.', '',
    ].join('\n');
    await writeFile(path, source('Initial routing description'));
    assert.equal(await generateSkills({ root: base, expected: ['example'] }), 1);
    let output = await readFile(join(base, 'public', 'llms.txt'), 'utf8');
    assert.ok(output.includes('Initial routing description'));
    await writeFile(path, source('Updated routing description'));
    await generateSkills({ root: base, expected: ['example'] });
    output = await readFile(join(base, 'public', 'llms.txt'), 'utf8');
    assert.ok(output.includes('Updated routing description'));
    assert.ok(!output.includes('Initial routing description'));
  } finally {
    await rm(base, { recursive: true, force: true });
  }
});

test('README, hero, documentation and sidebar prioritize installation routes', async () => {
  const readme = await read('README.md');
  const guide = await read('src/content/docs/start/distribution.md');
  const home = await read('src/content/docs/index.mdx');
  const hero = await read('src/components/landing/LandingHero.astro');
  const config = await read('astro.config.mjs');
  assert.ok(readme.indexOf('## Install in 60 seconds') < readme.indexOf('## Source-of-truth model'));
  assert.ok(readme.includes('npx skills@1.7.4 add howlil/agentflow --list'));
  assert.ok(readme.includes('skills.sh/b/howlil/agentflow'));
  assert.ok(readme.includes('@howlil/agentflow-cli@0.3.0'));
  assert.ok(guide.includes('Choose an installation route'));
  assert.ok(guide.includes('does not install'));
  assert.ok(guide.includes('one installation route per AI host'));
  assert.ok(home.includes('/start/distribution/'));
  assert.ok(hero.includes('href="/start/distribution/"'));
  assert.ok(config.includes("'start/distribution'"));
});

test('canonical runtime count is unchanged and generated discovery output is ignored in Git', async () => {
  assert.equal(EXPECTED.length, 11);
  assert.ok((await read('.gitignore')).includes('public/llms.txt'));
  assert.ok((await read('scripts/generate-skills.mjs')).includes('formatDiscoveryIndex(outputs.map'));
});
