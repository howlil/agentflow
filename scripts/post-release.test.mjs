import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = file => readFile(new URL(file, root), 'utf8');

test('release acceptance automatically follows successful publishing but can be invoked manually', async () => {
  const workflow = await read('.github/workflows/remote-acceptance.yml');
  assert.match(workflow, /workflow_run:/);
  assert.match(workflow, /workflows: \['Publish Agentflow Release'\]/);
  assert.match(workflow, /types: \[completed\]/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /workflow_run\.conclusion == 'success'/);
  assert.match(workflow, /head_repository\.full_name == github\.repository/);
  assert.match(workflow, /SOURCE_COMMIT/);
  assert.match(workflow, /EXPECTED_RELEASE_SHA/);
  assert.match(workflow, /bash \.github\/scripts\/remote-acceptance\.sh/);
  assert.doesNotMatch(workflow, /NPM_KEY|contents: write|id-token: write/);
});

test('post-release script checks exact tag, published npm command and protected lifecycle', async () => {
  const script = await read('.github/scripts/remote-acceptance.sh');
  for (const invariant of [
    'gh release view', 'merge-base --is-ancestor', 'EXPECTED_RELEASE_SHA',
    'npm view', 'npm install', 'node_modules/.bin/agentflow',
    'cmp ', 'skills@', 'uninstall --project --agent codex',
    'PREVIOUS_REF', 'trap ',
  ]) {
    assert.ok(script.includes(invariant), 'Missing remote acceptance invariant: ' + invariant);
  }
  assert.doesNotMatch(script, /npm publish|gh release create|git push|--all/);
});

test('CI runs independent public v0.3.0 acceptance on fresh PRs', async () => {
  const workflow = await read('.github/workflows/ci.yml');
  assert.match(workflow, /published-release-smoke:/);
  assert.match(workflow, /remote-acceptance\.sh v0\.3\.0/);
  assert.match(workflow, /fetch-depth: 0/);
});

test('published CLI docs have no stale unpublished or branch-only instructions', async () => {
  for (const path of [
    'README.md',
    'packages/cli/README.md',
    'src/content/docs/start/cli.md',
    'src/content/docs/start/native-plugins.md',
    'src/content/docs/start/release-and-rollback.md',
  ]) {
    const doc = await read(path);
    assert.doesNotMatch(doc, /not yet published|not been published|has not yet been published|after M2 merges|checkout feat\/m3-agentflow-cli/i, path);
  }
  const cli = await read('src/content/docs/start/cli.md');
  assert.match(cli, /npm install -g @howlil\/agentflow-cli@0\.3\.0/);
});
