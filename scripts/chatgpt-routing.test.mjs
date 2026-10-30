import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXPECTED, parseFrontmatter } from './generate-skills.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = path => readFile(join(root, path), 'utf8');

test('ChatGPT bundle exposes one canonical router and seven specialist skills', async () => {
  const names = (await readdir(join(root, 'skills'), { withFileTypes: true }))
    .filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
  assert.deepEqual(names, [...EXPECTED].sort());
  assert.equal(names.length, 8);
  const router = await read('skills/agentflow/SKILL.md');
  for (const name of names) {
    const path = 'skills/' + name + '/SKILL.md';
    const content = await read(path);
    const metadata = parseFrontmatter(content, path);
    assert.equal(metadata.name, name);
    assert.match(metadata.description, /\buse\b|\bcarries\b/i, name + ' needs discovery guidance');
    assert.doesNotMatch(content, /\b(production-ops|dev-loop|graph-protocol|call-graph-output)\b/,
      name + ' references a removed or non-existent skill');
    if (name !== 'agentflow') {
      assert.ok(router.includes(String.fromCharCode(96) + name + String.fromCharCode(96)), name + ' not mapped by router');
    }
  }
});

test('CI workflow skill-count gates match EXPECTED canonical skill count', async () => {
  const ci = await read('.github/workflows/ci.yml');
  assert.ok(ci.includes('dist/llms.txt)" -eq ' + EXPECTED.length), 'ci.yml llms.txt count differs from EXPECTED');
  assert.ok(ci.includes('test "$count" -eq ' + EXPECTED.length), 'ci.yml ChatGPT ZIP skill count differs from EXPECTED');
});

test('specialists never depend on router-private reference files', async () => {
  const names = (await readdir(join(root, 'skills'), { withFileTypes: true }))
    .filter(entry => entry.isDirectory() && entry.name !== 'agentflow').map(entry => entry.name);
  for (const name of names) {
    const content = await read('skills/' + name + '/SKILL.md');
    const cited = [...content.matchAll(/references\/([a-z0-9-]+\.md)/g)].map(match => match[1]);
    if (!cited.length) continue;
    // A specialist may cite only files it ships, so the router's references
    // stay private and every installed specialist remains self-contained.
    const owned = (await readdir(join(root, 'skills', name, 'references'), { withFileTypes: true }))
      .filter(entry => entry.isFile()).map(entry => entry.name);
    for (const file of cited) {
      assert.ok(owned.includes(file), name + ' cites references/' + file + ' it does not ship');
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

test('ChatGPT Web + GitHub mode enforces lean PR/CI evidence and anti-bloat budgets', async () => {
  const router = await read('skills/agentflow/SKILL.md');
  const chatgptRef = await read('skills/agentflow/references/chatgpt-github.md');
  const cliRef = await read('skills/agentflow/references/cli.md');
  const testSkill = await read('skills/test-engineering/SKILL.md');
  const guide = await read('src/content/docs/recipes/run-code-from-chatgpt.md');
  for (const constraint of [
    'ChatGPT Web is the only AI executor',
    'Do not introduce an external Codex worker',
    'Not auto-verifiable:',
    'M1..M5',
    'zero new browser E2E',
    'Playwright'
  ]) assert.ok(router.includes(constraint), 'router missing: ' + constraint);
  for (const constraint of [
    'Reuse any open PR for the same outcome',
    'M1..M5',
    'Playwright',
    'A green run on an older SHA does not verify a newer HEAD',
    'stage map'
  ]) assert.ok(chatgptRef.includes(constraint), 'chatgpt-github.md missing: ' + constraint);
  assert.match(cliRef, /M1\.\.M5/);
  assert.match(cliRef, /Playwright/);
  assert.match(testSkill, /cheapest executable proof/i);
  assert.match(guide, /No external coding agent, OpenAI API key/);
  assert.match(guide, /M1\.\.M5/);
  assert.match(guide, /Playwright/);
  assert.match(guide, /source of truth/);
});

test('product, engineering, design, and repository contracts agree on eight skills and state ownership', async () => {
  const product = await read('.agents/product.md');
  const engineering = await read('.agents/engineering.md');
  const design = await read('.agents/DESIGN.md');
  const steering = await read('AGENTS.md');
  const guide = await read('src/content/docs/recipes/run-code-from-chatgpt.md');
  const web = await read('src/content/docs/start/chatgpt-web.md');

  for (const doc of [product, engineering, steering]) {
    assert.match(doc, /ChatGPT Web/);
    assert.match(doc, /GitHub/);
    assert.match(doc, /eight|seven specialist|seven specialists/i);
  }
  assert.match(design, /--af-ink/);
  assert.match(product, /No custom npm installer|@howlil\/agentflow-cli/);
  assert.match(engineering, /No external AI workers/);
  assert.match(steering, /Installing Agentflow does not grant GitHub access/);
  assert.match(guide, /older SHA/);
  assert.ok(!guide.includes(String.raw`\n\n`), 'guide must use real paragraph breaks');
  assert.match(web, /opt-in host workflow/);
  assert.doesNotMatch(web, /M3 routing acceptance matrix/);
});

test('router ships four focused mode/domain references without overlapping policies', async () => {
  const router = await read('skills/agentflow/SKILL.md');
  const names = [
    'cli.md',
    'chatgpt-github.md',
    'delegation.md',
    'ai-implementation.md'
  ];
  const folder = 'skills/agentflow/references/';
  const files = (await readdir(join(root, folder))).sort();
  assert.deepEqual(files, [...names].sort());
  for (const name of names) {
    assert.ok(router.includes('references/' + name), 'router does not route to ' + name);
    const body = await read(folder + name);
    assert.ok(body.startsWith('# '), 'reference requires a descriptive heading: ' + name);
    assert.ok(body.length > 300 && body.length < 9000, 'reference should be substantial but compact: ' + name);
  }
  assert.match(router, /Avoid loading all of them for every request/);
  assert.match(router, /Directly selected specialist skills may run without this router/);
  assert.match(await read(folder + 'cli.md'), /time-to-verified-outcome/);
  assert.match(await read(folder + 'chatgpt-github.md'), /older SHA/);
  const skillDirs = (await readdir(join(root, 'skills'), { withFileTypes: true })).filter(x => x.isDirectory());
  assert.equal(skillDirs.length, 8, 'reference files and factory loop must not become extra skills');
});

test('router preserves the chain contract instead of collapsing it', async () => {
  const router = await read('skills/agentflow/SKILL.md');
  for (const trace of [
    'IDs it owns',
    'Ready gate',
    'Chain and handoff',
    'never pass the gap downstream',
    'stage map',
    'Approve with Minor',
    'IMPLEMENTED',
    'PUBLISHED',
    'DEPLOYED',
    'RELEASED'
  ]) assert.ok(router.includes(trace), 'router must preserve the chain: ' + trace);
  assert.doesNotMatch(router, /\bMERGED\b/, 'merge is not a release state');
  assert.doesNotMatch(router, /TDD for deterministic behavior/i, 'TDD must stay optional');
});

test('skill references use canonical domain names', async () => {
  const skills = (await readdir(join(root, 'skills'), { withFileTypes: true }))
    .filter(entry => entry.isDirectory()).map(entry => entry.name);
  const files = skills.map(name => 'skills/' + name + '/SKILL.md');
  const docs = (await readdir(join(root, 'src/content/docs'), { recursive: true }))
    .filter(file => /\.mdx?$/.test(file))
    .map(file => join('src/content/docs', file));
  for (const file of [...files, ...docs]) {
    const content = await read(file);
    assert.doesNotMatch(content, /\b(test|release)-engineer\b/, file + ' must use the canonical domain name');
  }
});

test('references inherit the chain instead of restating their own policy', async () => {
  const folder = 'skills/agentflow/references/';
  const cli = await read(folder + 'cli.md');
  for (const trace of ['test-engineering', 'RK', 'PF', 'stage', 'code-review']) {
    assert.ok(cli.includes(trace), 'cli.md must defer to the chain: ' + trace);
  }
  assert.doesNotMatch(cli, /Proportionate proof/, 'cli.md must not own a parallel proof taxonomy');
  const chatgpt = await read(folder + 'chatgpt-github.md');
  for (const trace of ['first missing contract', 'verdict', 'Merge is not release', 'IMPLEMENTED', 'stage map']) {
    assert.ok(chatgpt.includes(trace), 'chatgpt-github.md missing: ' + trace);
  }
  const delegation = await read(folder + 'delegation.md');
  for (const trace of ['ready gate', 'PF', 'RK/PF']) {
    assert.ok(delegation.includes(trace), 'delegation.md missing: ' + trace);
  }
  const ai = await read(folder + 'ai-implementation.md');
  for (const trace of ['J1', 'stage', 'release-engineering']) {
    assert.ok(ai.includes(trace), 'ai-implementation.md missing: ' + trace);
  }
});

test('router bootstraps a project AGENTS.md without duplicating memory', async () => {
  const router = await read('skills/agentflow/SKILL.md');
  for (const rule of [
    'Create a root `AGENTS.md` only when it is missing',
    'Never overwrite an existing one',
    'Never duplicate product, architecture, design, or skill-catalog content',
    'Write `TBD` rather than inventing a command',
    '> skill default'
  ]) assert.ok(router.includes(rule), 'router missing AGENTS.md rule: ' + rule);
  const template = router.split('```markdown')[1]?.split('```')[0] ?? '';
  assert.ok(template.includes('## Commands'), 'AGENTS.md template needs commands');
  assert.ok(template.includes('## Verification gate'), 'AGENTS.md template needs a gate');
  assert.ok(template.includes('## Project memory'), 'AGENTS.md template needs memory pointers');
  assert.doesNotMatch(template, /product-design|engineering-design|design-graph|design-thinking|test-engineering|release-engineering|code-review/,
    'project AGENTS.md must not copy the skill catalog');
});

test('human skill guides mirror their runtime contract', async () => {
  const contracts = {
    'product-design': ['J1', 'X#', 'P#', 'A#', 'Ready gate'],
    'engineering-design': ['S#', 'G#', 'F#', 'DEC', 'DEP', 'R → S'],
    'design-graph': ['UG', 'V', 'ST', 'Ready gate', 'DESIGN.md'],
    'design-thinking': ['FL', 'CAP', 'PL', 'LF', 'VER', 'Ready gate'],
    'test-engineering': ['RK', 'PF', 'stage', 'Stage', 'Ready gate'],
    'code-review': ['RV', 'verdict', 'Approve', 'Ready gate'],
    'release-engineering': ['RL', 'lane', 'CHANGELOG', 'rollback', 'Ready gate'],
    'agentflow': ['handoff', 'verdict', 'AGENTS.md', 'ready gate']
  };
  for (const [name, tokens] of Object.entries(contracts)) {
    const page = await read('src/content/docs/skills/' + name + '.md');
    for (const token of tokens) assert.ok(page.includes(token), name + ' guide must mirror the contract: ' + token);
    assert.ok(page.length < 6000, name + ' guide should stay compact');
  }
  const recipe = await read('src/content/docs/recipes/build-a-feature.md');
  for (const trace of ['ready gate', 'release-engineering', 'J1']) {
    assert.ok(recipe.includes(trace), 'build-a-feature recipe missing: ' + trace);
  }
});
