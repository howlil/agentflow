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
  assert.equal(workflow.match(/secrets\.NPM_KEY/g)?.length, 2);
  assert.match(workflow, /NODE_AUTH_TOKEN:\s*\$\{\{ secrets\.NPM_KEY \}\}/);
  assert.match(workflow, /npm publish --access public/);
  assert.doesNotMatch(workflow, /AGENTFLOW_NPM_PUBLISH_ENABLED/);
  assert.match(workflow, /npm whoami.*registry/);
  assert.match(workflow, /permissions:\s*\n\s*contents: read/);
  assert.match(workflow, /AGENTFLOW_NPM_AUTH_MODE == 'token'/);
});

test('npm registry preflight and dependent GitHub release refuse mismatched releases', async () => {
  const workflow = await read('.github/workflows/release.yml');
  assert.match(workflow, /dist\.integrity/);
  assert.match(workflow, /REGISTERED_INTEGRITY.*LOCAL_INTEGRITY/);
  assert.match(workflow, /Version exists on npm, but package contents differ/);
  assert.match(workflow, /needs: \\[verify, publish-npm, publish-npm-oidc\\]/);
  assert.match(workflow, /needs\\.publish-npm-oidc\\.result == 'success'/);
  assert.match(workflow, /needs\\.publish-npm\\.result == 'success'/);
  assert.match(workflow, /gh release create/);
});

test('accepted npm stage is detected before any duplicate publish attempt', async () => {
  const workflow = await read('.github/workflows/release.yml');
  assert.match(workflow, /npm stage list '@howlil\/agentflow-cli'/);
  assert.match(workflow, /Version \$PACKAGE_VERSION is STAGED/);
  assert.match(workflow, /refusing to republish blindly/);
  assert.match(workflow, /A maintainer must approve it with 2FA/);
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

test('master release request dispatches only explicit versioned release intent', async () => {
  const workflow = await read('.github/workflows/request-release.yml');
  const request = JSON.parse(await read('.github/release-request.json'));
  const pkg = JSON.parse(await read('package.json'));
  assert.equal(request.package, '@howlil/agentflow-cli');
  assert.equal(request.version, pkg.version);
  assert.match(workflow, /branches: \[master\]/);
  assert.match(workflow, /'\.github\/release-request\.json'/);
  assert.match(workflow, /actions: write/);
  assert.match(workflow, /release: request v\$VERSION/);
  assert.match(workflow, /gh workflow run release\.yml/);
  assert.match(workflow, /--ref master --raw-field "version=\$RELEASE_TAG"/);
  assert.doesNotMatch(workflow, /secrets\.NPM_KEY/);
});

test('OIDC publishing is explicitly selected and completely isolated from legacy NPM_KEY', async () => {
  const workflow = await read('.github/workflows/release.yml');
  const oidc = workflow.slice(workflow.indexOf('  publish-npm-oidc:'), workflow.indexOf('  github-release:'));
  const token = workflow.slice(workflow.indexOf('  publish-npm:'), workflow.indexOf('  publish-npm-oidc:'));
  assert.match(oidc, /AGENTFLOW_NPM_AUTH_MODE == 'oidc'/);
  assert.match(oidc, /id-token: write/);
  assert.match(oidc, /npm publish --access public/);
  assert.match(oidc, /dist\\.integrity/);
  assert.match(oidc, /Existing npm version has different bytes/);
  assert.match(oidc, /ACTIONS_ID_TOKEN_REQUEST_URL/);
  assert.doesNotMatch(oidc, /NPM_KEY|NODE_AUTH_TOKEN|npm whoami/);
  assert.doesNotMatch(token, /id-token: write/);
  assert.match(token, /AGENTFLOW_NPM_AUTH_MODE == ''/);
  assert.match(token, /NODE_AUTH_TOKEN/);
});

test('dependency checks are bounded, read-only and detect high-severity issues', async () => {
  const dependabot = await read('.github/dependabot.yml');
  const audit = await read('.github/workflows/dependency-audit.yml');
  assert.match(dependabot, /package-ecosystem: npm/);
  assert.match(dependabot, /package-ecosystem: github-actions/);
  assert.match(dependabot, /open-pull-requests-limit:/);
  assert.match(audit, /workflow_dispatch:/);
  assert.match(audit, /schedule:/);
  assert.match(audit, /npm audit --omit=dev --audit-level=high/);
  assert.doesNotMatch(audit, /NPM_KEY|id-token: write|contents: write|npm publish/);
});
