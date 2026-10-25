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

test('GitHub-only ChatGPT execution has explicit persistence and evidence boundaries', async () => {
  const router = await read('skills/agentflow/SKILL.md');
  const guide = await read('src/content/docs/recipes/run-code-from-chatgpt.md');
  const template = await read('.github/ISSUE_TEMPLATE/agentflow-execution.md');
  for (const constraint of [
    'ChatGPT Web to be the only AI executor',
    'Do not introduce an external Codex worker',
    'IMPLEMENTED_UNVERIFIED',
    'Existing GitHub CI remains an allowed verification mechanism',
    'update the same GitHub issue/PR'
  ]) assert.ok(router.includes(constraint), 'router missing: ' + constraint);
  for (const required of ['Resume pointer', 'Requirement evidence ledger', 'Acceptance contract']) {
    assert.ok(template.includes(required), 'issue template missing: ' + required);
  }
  assert.match(guide, /No external coding agent, OpenAI API key/);
  assert.match(guide, /source of truth/);
});

test('M0 product, engineering and repository contracts agree on host and state ownership', async () => {
  const product = await read('.agents/product.md');
  const engineering = await read('.agents/engineering.md');
  const steering = await read('AGENTS.md');
  const router = await read('skills/agentflow/SKILL.md');
  const guide = await read('src/content/docs/recipes/run-code-from-chatgpt.md');
  const web = await read('src/content/docs/start/chatgpt-web.md');

  for (const doc of [product, engineering, steering]) {
    assert.match(doc, /ChatGPT Web/);
    assert.match(doc, /GitHub/);
    assert.match(doc, /eleven|ten specialist|ten specialists/i);
  }
  assert.match(product, /No custom npm installer/);
  assert.match(engineering, /No separate persistent worker/);
  assert.match(steering, /Installing Agentflow does not grant GitHub access/);
  assert.match(router, /Reuse the existing relevant branch\/PR/);
  assert.match(guide, /older SHA/);
  assert.ok(!guide.includes(String.raw`\n\n`), 'guide must use real paragraph breaks');
  assert.doesNotMatch(guide, /blob\/master\/\.github\/ISSUE_TEMPLATE\/agentflow-execution\.md/);
  assert.match(web, /opt-in host workflow/);
  assert.match(product, /manual host acceptance/);
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

test('M1 router ships three scoped policies without adding a specialist', async () => {
  const router = await read('skills/agentflow/SKILL.md');
  const names = [
    'engineering-operating-policy.md',
    'github-delivery-policy.md',
    'project-archetypes.md'
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
  assert.match(router, /Avoid loading all three for every request/);
  assert.match(router, /Directly selected specialist skills may run without this router/);
  assert.match(await read(folder + names[0]), /time-to-verified-outcome/);
  assert.match(await read(folder + names[1]), /older SHA/);
  assert.match(await read(folder + names[2]), /README/);
  const skillDirs = (await readdir(join(root, 'skills'), { withFileTypes: true })).filter(x => x.isDirectory());
  assert.equal(skillDirs.length, 11, 'reference files must not become new skills');
});
