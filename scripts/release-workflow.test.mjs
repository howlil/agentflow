import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = async path => readFile(new URL(path, root), 'utf8');

test('release workflow supports matching version tags and manual master releases', async () => {
  const workflow = await read('.github/workflows/release.yml');
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /tags:\s*\n\s*-\s*'v\[0-9\]\*'/);
  assert.match(workflow, /test "\$GITHUB_REF" = refs\/heads\/master/);
  assert.match(workflow, /git merge-base --is-ancestor "\$GITHUB_SHA" origin\/master/);
  assert.match(workflow, /test "\$ROOT_VERSION" = "\$CLI_VERSION"/);
  assert.match(workflow, /npm run plugins:check/);
  assert.match(workflow, /npm test/);
  assert.match(workflow, /npm run build/);
});

test('npm publish uses the supplied NPM_KEY secret only in publish job', async () => {
  const workflow = await read('.github/workflows/release.yml');
  assert.equal(workflow.match(/secrets\.NPM_KEY/g)?.length, 1);
  assert.match(workflow, /NODE_AUTH_TOKEN:\s*\$\{\{ secrets\.NPM_KEY \}\}/);
  assert.match(workflow, /npm publish --access public/);
  assert.doesNotMatch(workflow, /AGENTFLOW_NPM_PUBLISH_ENABLED/);
  assert.match(workflow, /npm whoami.*registry/);
  assert.match(workflow, /permissions:\s*\n\s*contents: read/);
  assert.doesNotMatch(workflow, /id-token:\s*write/);
});

test('npm registry preflight and dependent GitHub release refuse mismatched releases', async () => {
  const workflow = await read('.github/workflows/release.yml');
  assert.match(workflow, /dist\.integrity/);
  assert.match(workflow, /REGISTERED_INTEGRITY.*LOCAL_INTEGRITY/);
  assert.match(workflow, /Version exists on npm, but package contents differ/);
  assert.match(workflow, /needs: \[verify, publish-npm\]/);
  assert.match(workflow, /gh release create/);
});

test('standalone CLI distribution is scoped, public and version-aligned with repository', async () => {
  const rootPkg = JSON.parse(await read('package.json'));
  const cli = JSON.parse(await read('packages/cli/package.json'));
  assert.equal(rootPkg.private, true);
  assert.equal(cli.name, '@howlil/agentflow-cli');
  assert.equal(cli.publishConfig.access, 'public');
  assert.equal(cli.version, rootPkg.version);
  assert.equal(cli.bin.agentflow, './bin/agentflow.mjs');
  assert.deepEqual(cli.files, ['bin/', 'src/', 'README.md', 'LICENSE']);
});
