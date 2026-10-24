import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
test('release requires matching tag, reviewed master, tests and native manifests', async () => {
  const text = await read('.github/workflows/release.yml');
  for (const key of ['workflow_dispatch:', 'git merge-base --is-ancestor', 'ROOT_VERSION', 'npm run plugins:check', 'npm test', 'npm run build', 'gh release create']) assert.ok(text.includes(key), 'Missing ' + key);
  assert.match(text, /contents: write/);
  assert.match(text, /refs\/heads\/master/);
  assert.doesNotMatch(text, /npm publish|publish-npm|NPM_KEY|NODE_AUTH_TOKEN|id-token: write/);
});
test('root remains private, and no publishable Agentflow CLI exists', async () => {
  const pkg = JSON.parse(await read('package.json'));
  assert.equal(pkg.private, true);
  assert.doesNotMatch(JSON.stringify(pkg.scripts), /packages\/cli|cli:test/);
  const workflows = await readdir(new URL('../.github/workflows/', import.meta.url));
  assert.ok(!workflows.includes('npm-stage-status.yml'));
  assert.ok(!workflows.includes('request-release.yml'));
  await assert.rejects(read('packages/cli/package.json'), { code: 'ENOENT' });
});
test('dependency audit protects website tooling with no registry publication', async () => {
  const text = await read('.github/workflows/dependency-audit.yml');
  assert.match(text, /npm audit --omit=dev --audit-level=high/);
  assert.doesNotMatch(text, /npm publish|NPM_KEY|contents: write/);
});
