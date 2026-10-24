import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const ids = ['claude-code', 'codex', 'gemini-cli', 'cursor', 'opencode'];

test('matrix covers five agent IDs without requiring host credentials', async () => {
  const workflow = await read('.github/workflows/ci.yml');
  const script = await read('.github/scripts/cross-agent-candidate.sh');
  assert.match(workflow, /cross-agent-compatibility:/);
  assert.match(workflow, /agent: \[claude-code, codex, gemini-cli, cursor, opencode\]/);
  assert.match(workflow, /bash \.github\/scripts\/cross-agent-candidate\.sh/);
  for (const agent of ids) assert.ok(script.includes(agent + ')'), 'Missing case for ' + agent);
  assert.doesNotMatch(script, /gh auth login|npm publish|git push|\.npmrc/);
});

test('acceptance isolates HOME and protects unrelated skills and AGENTS.md', async () => {
  const script = await read('.github/scripts/cross-agent-acceptance.sh');
  for (const guard of [
    'mktemp -d', 'export HOME=', 'trap ',
    'npm pack', 'skills/agentflow/SKILL.md',
    'init --agent', '--skill agentflow --agent', '--skill agentflow --global --agent',
    'remove agentflow --agent', 'remove agentflow --global --agent',
    'cmp ', 'unrelated/SKILL.md', 'AGENTS.md',
  ]) assert.ok(script.includes(guard), 'Missing invariant ' + guard);
});

test('guide documents five hosts and warns about model-session limitations', async () => {
  const guide = await read('src/content/docs/start/cross-agent-compatibility.md');
  for (const id of ids) assert.ok(guide.includes(id), 'Missing agent ' + id);
  for (const location of [
    '.claude/skills/', '.agents/skills/',
    '~/.gemini/skills/', '~/.cursor/skills/', '~/.config/opencode/skills/',
  ]) assert.ok(guide.includes(location), 'Missing location ' + location);
  assert.match(guide, /Out of scope/);
  assert.match(guide, /not guaranteed/i);
  const config = await read('astro.config.mjs');
  assert.match(config, /'start\/cross-agent-compatibility'/);
  assert.doesNotMatch(await read('.github/scripts/cross-agent-candidate.sh'), /RELEASE='v0\.3\.0'|VERSION='0\.3\.0'/);
  assert.match(await read('.github/workflows/ci.yml'), /published-release-smoke:/);
});
