import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { EXPECTED, formatDiscoveryIndex, generateSkills } from './generate-skills.mjs';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');

test('agent discovery index links to the canonical source without copy-pasting the skill runtime', () => {
  const result = formatDiscoveryIndex([
    { name: 'agentflow', description: 'Choose the correct engineering skill.', sourcePath: 'skills/agentflow/SKILL.md' },
    { name: 'code-review', description: 'Review  changes in context.', sourcePath: 'skills/code-review/SKILL.md' },
  ]);
  assert.match(result, /^# Agentflow\n/);
  assert.match(result, /## Canonical Skills/);
  assert.match(result, /raw\.githubusercontent\.com\/howlil\/agentflow\/master\/skills\/agentflow\/SKILL\.md/);
  assert.match(result, /## Get Started/);
  assert.equal((result.match(/^- \[agentflow\]/gm) || []).length, 1);
  assert.equal((result.match(/^- \[code-review\]/gm) || []).length, 1);
  assert.doesNotMatch(result, /data:|javascript:/);
});

test('generated static llms index updates when canonical SKILL description changes', async () => {
  const base = await mkdtemp(join(tmpdir(), 'agentflow-discovery-'));
  try {
    const skill = join(base, 'skills', 'example');
    const guide = join(base, 'src', 'content', 'docs', 'skills');
    await mkdir(skill, { recursive: true });
    await mkdir(guide, { recursive: true });
    await writeFile(join(guide, 'example.md'), '[Canonical](/reference/example/)\n');
    const path = join(skill, 'SKILL.md');
    const source = description => `---\nname: example\ndescription: "${description}"\n---\n\n# Example\n\nInstructions.\n`;
    await writeFile(path, source('Initial routing description'));
    assert.equal(await generateSkills({ root: base, expected: ['example'] }), 1);
    let output = await readFile(join(base, 'public', 'llms.txt'), 'utf8');
    assert.match(output, /Initial routing description/);
    await writeFile(path, source('Updated routing description'));
    await generateSkills({ root: base, expected: ['example'] });
    output = await readFile(join(base, 'public', 'llms.txt'), 'utf8');
    assert.match(output, /Updated routing description/);
    assert.doesNotMatch(output, /Initial routing description/);
  } finally {
    await rm(base, { recursive: true, force: true });
  }
});

test('entry points put one-route installation and specialists before internal architecture', async () => {
  const readme = await read('README.md');
  const guide = await read('src/content/docs/start/distribution.md');
  const home = await read('src/content/docs/index.mdx');
  const hero = await read('src/components/landing/LandingHero.astro');
  const config = await read('astro.config.mjs');
  assert.ok(readme.indexOf('## Install in 60 seconds') < readme.indexOf('## Source-of-truth model'));
  assert.match(readme, /npx skills@1.7.4 add howlil/agentflow --list/);
  assert.match(readme, /skills.sh/b/howlil/agentflow/);
  assert.match(readme, /@howlil/agentflow-cli@0.3.0/);
  assert.match(guide, /Choose an installation route/);
  assert.match(guide, /router alone|router **does not install/i);
  assert.match(guide, /one installation route per AI host/i);
  assert.match(home, //start/distribution//);
  assert.match(hero, /href="/start/distribution/"/);
  assert.match(config, /'start/distribution'/);
});

test('source of truth is still the eleven canonical skills, no copied runtime content committed', async () => {
  assert.equal(EXPECTED.length, 11);
  const ignore = await read('.gitignore');
  assert.match(ignore, /public/llms.txt/);
  const script = await read('scripts/generate-skills.mjs');
  assert.match(script, /formatDiscoveryIndex(outputs.map/);
});
