import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getLockPath, isAgentflowSource, verifySkillOwnership } from '../src/ownership.mjs';
import { run } from '../src/main.mjs';

async function fixture(runTest) {
  const cwd = await mkdtemp(join(tmpdir(), 'agentflow-ownership-'));
  try { await runTest(cwd); } finally { await rm(cwd, { recursive: true, force: true }); }
}

async function putLock(cwd, skills, scope = 'project') {
  const env = { XDG_STATE_HOME: cwd };
  const file = getLockPath({ cwd, global: scope === 'global', env });
  if (scope === 'global') await mkdir(join(cwd, 'skills'), { recursive: true });
  await writeFile(file, JSON.stringify({ version: scope === 'global' ? 3 : 1, skills }));
  return { cwd, env };
}
const owned = { source: 'howlil/agentflow', sourceType: 'github',
  sourceUrl: 'https://github.com/howlil/agentflow' };
const foreign = { source: 'another/engineering-skills', sourceType: 'github',
  sourceUrl: 'https://github.com/another/engineering-skills' };

function context(cwd, env) {
  const calls = [], errors = [];
  return {
    cwd, env, home: cwd, nodeVersion: '22.23.3',
    calls, errors, out: () => {},
    err: message => errors.push(message),
    runner: async (_bin, args) => { calls.push(args); return 0; },
  };
}

test('source identity accepts canonical github repo only, never lookalike hosts', () => {
  for (const source of [
    'howlil/agentflow',
    'https://github.com/howlil/agentflow',
    'https://github.com/howlil/agentflow.git',
  ]) assert.equal(isAgentflowSource({ source }), true, source);
  for (const source of [
    'other/agentflow',
    'howlil/agentflow-other',
    'https://github.com.evil.test/howlil/agentflow',
    'https://github.com/howlil/agentflow-other',
    'https://github.com/another/engineering-skills',
    'file:///tmp/howlil/agentflow',
  ]) assert.equal(isAgentflowSource({ source }), false, source);
});

test('preflight rejects a foreign skill name on selective update and removal', async () => {
  await fixture(async cwd => {
    await putLock(cwd, { agentflow: owned, 'code-review': foreign });
    const ctx = context(cwd);
    assert.equal(await run(['update', '-p', '-s', 'code-review', '-y'], ctx), 1);
    assert.equal(await run(['uninstall', '-p', '-s', 'code-review', '-y'], ctx), 1);
    assert.equal(await run(['install', '-p', '-s', 'code-review', '-y'], ctx), 1);
    assert.equal(ctx.calls.length, 0);
    assert.match(ctx.errors.join('\n'), /another source/);
  });
});

test('preflight restricts default uninstall to owned names, even with other installed skills', async () => {
  await fixture(async cwd => {
    await putLock(cwd, { agentflow: owned, 'code-review': foreign, 'design-thinking': owned });
    const ctx = context(cwd);
    assert.equal(await run(['uninstall', '-p', '--yes'], ctx), 0);
    assert.deepEqual(ctx.calls[0], [
      '--yes', 'skills@1.7.4', 'remove', 'agentflow', 'design-thinking', '-y',
    ]);
    assert.equal(ctx.calls[0].includes('code-review'), false);
  });
});

test('global scope reads XDG skill lock rather than local project lock', async () => {
  await fixture(async cwd => {
    const { env } = await putLock(cwd, { agentflow: owned }, 'global');
    await putLock(cwd, { agentflow: foreign });
    const ctx = context(cwd, env);
    assert.equal(await run(['update', '-g', '-s', 'agentflow', '-y'], ctx), 0);
    assert.equal(ctx.calls.length, 1);
    assert.equal(await run(['uninstall', '-p', '-s', 'agentflow', '-y'], ctx), 1);
  });
});

test('missing, corrupted or unsupported locks cannot authorize mutating updates', async () => {
  await fixture(async cwd => {
    const ctx = context(cwd);
    assert.equal(await run(['update', '-p', '-s', 'agentflow', '--yes'], ctx), 1);
    await writeFile(join(cwd, 'skills-lock.json'), '{INVALID');
    assert.equal(await run(['uninstall', '-p', '-s', 'agentflow', '--yes'], ctx), 1);
    await writeFile(join(cwd, 'skills-lock.json'), JSON.stringify({ skills: [] }));
    assert.equal(await run(['update', '-p', '-s', 'agentflow', '--yes'], ctx), 1);
    assert.equal(ctx.calls.length, 0);
  });
});

test('explicit global/project scope required for update and uninstall', async () => {
  await fixture(async cwd => {
    const ctx = context(cwd);
    for (const args of [
      ['update', '-s', 'agentflow'],
      ['uninstall', '-s', 'agentflow'],
      ['uninstall', '--yes'],
      ['install', '--yes'],
    ]) assert.equal(await run(args, ctx), 2);
    assert.equal(ctx.calls.length, 0);
  });
});

test('dry-run has no changes and no network activity even without a lock', async () => {
  await fixture(async cwd => {
    const ctx = context(cwd);
    assert.equal(await run(['update', '-p', '-s', 'agentflow', '--dry-run'], ctx), 0);
    assert.equal(await run(['uninstall', '-p', '--dry-run'], ctx), 0);
    assert.equal(ctx.calls.length, 0);
    await assert.rejects(readFile(join(cwd, 'skills-lock.json')));
  });
});

test('lock verifier returns exact skill names without writing lock files', async () => {
  await fixture(async cwd => {
    const { env } = await putLock(cwd, { agentflow: owned, 'code-review': foreign });
    assert.deepEqual(await verifySkillOwnership({
      cwd, global: false, command: 'uninstall', skills: [], env,
    }), ['agentflow']);
  });
});
