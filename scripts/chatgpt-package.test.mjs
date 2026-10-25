import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateChatGPTPackage } from './chatgpt-package.mjs';

const repo = fileURLToPath(new URL('..', import.meta.url));
const version = JSON.parse(await readFile(join(repo, 'package.json'), 'utf8')).version;

async function fixture(run) {
  const root = await mkdtemp(join(tmpdir(), 'agentflow-chatgpt-package-'));
  for (const path of ['plugin.json', 'assets', 'skills']) {
    await cp(join(repo, path), join(root, path), { recursive: true });
  }
  try { await run(root); } finally { await rm(root, { recursive: true, force: true }); }
}

async function mutate(root, transform) {
  const file = join(root, 'plugin.json');
  const plugin = JSON.parse(await readFile(file, 'utf8'));
  transform(plugin);
  await writeFile(file, JSON.stringify(plugin, null, 2) + '\n');
}

test('an extracted archive validates without website or marketplace files', async () => {
  await fixture(async root => {
    assert.deepEqual((await readdir(root)).sort(), ['assets', 'plugin.json', 'skills']);
    assert.deepEqual(await validateChatGPTPackage({ root, strictRoot: true }), { version, count: 11 });
  });
});

test('archives with unexpected files or symlinks fail before distribution', async () => {
  await fixture(async root => {
    await writeFile(join(root, 'unexpected.json'), '{}');
    await assert.rejects(validateChatGPTPackage({ root, strictRoot: true }), /unexpected or missing root entries/);
  });
  await fixture(async root => {
    await symlink(join(root, 'plugin.json'), join(root, 'assets', 'linked.json'));
    await assert.rejects(validateChatGPTPackage({ root, strictRoot: true }), /symlinks or special files/);
  });
});

test('optional onboarding skill is allowed only when it points to a packaged skill', async () => {
  await fixture(async root => {
    await mutate(root, p => { p.extensions['com.openai'].onboardingSkill = './skills/agentflow/SKILL.md'; });
    assert.equal((await validateChatGPTPackage({ root, strictRoot: true })).count, 11);
    await mutate(root, p => { p.extensions['com.openai'].onboardingSkill = '../outside/SKILL.md'; });
    await assert.rejects(validateChatGPTPackage({ root, strictRoot: true }), /onboardingSkill path/);
  });
});

test('developer identity is not hardcoded to a single account name', async () => {
  await fixture(async root => {
    await mutate(root, p => { p.extensions['com.openai'].interface.developerName = 'Verified Engineering Studio'; });
    assert.equal((await validateChatGPTPackage({ root, strictRoot: true })).count, 11);
  });
});

test('invalid listing contrast and oversized descriptions are rejected', async () => {
  await fixture(async root => {
    await mutate(root, p => { p.extensions['com.openai'].interface.brandColor = '#FFFFFF'; });
    await assert.rejects(validateChatGPTPackage({ root, strictRoot: true }), /2:1 contrast/);
    await mutate(root, p => {
      p.extensions['com.openai'].interface.brandColor = '#0C0D10';
      p.extensions['com.openai'].interface.shortDescription = 'X'.repeat(31);
    });
    await assert.rejects(validateChatGPTPackage({ root, strictRoot: true }), /shortDescription/);
  });
});

test('rejects missing skill directories and ZIPs containing app configs', async () => {
  await fixture(async root => {
    await rm(join(root, 'skills', 'code-review'), { recursive: true });
    await assert.rejects(validateChatGPTPackage({ root, strictRoot: true }), /canonical skill set/);
  });
  await fixture(async root => {
    await writeFile(join(root, '.app.json'), '{}');
    await assert.rejects(validateChatGPTPackage({ root, strictRoot: true }), /MCP, app or hooks files/);
  });
});

test('rejects malformed icon path and missing packaged assets', async () => {
  await fixture(async root => {
    await mutate(root, p => { p.extensions['com.openai'].interface.logo = '../outside.svg'; });
    await assert.rejects(validateChatGPTPackage({ root, strictRoot: true }), /asset path/);
    await mutate(root, p => { p.extensions['com.openai'].interface.logo = './assets/missing.svg'; });
    await assert.rejects(validateChatGPTPackage({ root, strictRoot: true }), /ENOENT/);
  });
});
