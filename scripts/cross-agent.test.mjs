import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');
const ids = ['claude-code', 'codex', 'gemini-cli', 'cursor', 'opencode'];

test('CI covers five agent IDs using upstream installer only', async () => {
  const workflow = await read('.github/workflows/ci.yml');
  const script = await read('.github/scripts/cross-agent-candidate.sh');
  assert.match(workflow, /cross-agent-compatibility:/);
  assert.match(workflow, /agent: \[claude-code, codex, gemini-cli, cursor, opencode\]/);
  assert.match(workflow, /cross-agent-candidate.sh/);
  for (const name of ids) assert.ok(script.includes(name));
  assert.match(script, /skills@1\.7\.4 add/);
  assert.match(script, /skills@1\.7\.4 remove/);
  assert.doesNotMatch(script, /packages\/cli|npm pack|npm publish|agentflow install/);
});
test('tests isolate project/global state and preserve unrelated files', async () => {
  const script = await read('.github/scripts/cross-agent-candidate.sh');
  for (const token of ['mktemp -d','export HOME=', 'trap ', 'cmp ', 'AGENTS.md','unrelated/SKILL.md','--global', '--skill agentflow']) {
    assert.ok(script.includes(token), 'Missing ' + token);
  }
});
test('guide describes the matrix and its limitations', async () => {
  const guide = await read('src/content/docs/start/cross-agent-compatibility.md');
  for (const name of ids) assert.ok(guide.includes(name));
  for (const token of ['.claude/skills/', '.agents/skills/', '~/.gemini/skills/', '~/.cursor/skills/', '~/.config/opencode/skills/']) assert.ok(guide.includes(token));
  assert.match(guide, /Out of scope/);
  assert.match(guide, /not guaranteed/i);
});
