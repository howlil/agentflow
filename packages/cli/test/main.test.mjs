import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  buildDelegation, parseArgs, readConfig, run, supportsNode, CONFIG_NAME,
} from '../src/main.mjs';

function capture() {
  const output = [], errors = [], calls = [];
  return {
    output, errors, calls,
    out: value => output.push(value),
    err: value => errors.push(value),
    runner: async (cmd, args, options) => { calls.push({ cmd, args, options }); return 0; },
    nodeVersion: '22.23.3',
  };
}

async function sandbox(fn) {
  const cwd = await mkdtemp(join(tmpdir(), 'agentflow-cli-'));
  try { await fn(cwd); } finally { await rm(cwd, { recursive: true, force: true }); }
}

test('parser permits known selectors but rejects unsafe values and conflicting scopes', () => {
  const parsed = parseArgs(['install', '-g', '-a', 'codex', '-s', 'design-thinking', '-y']);
  assert.equal(parsed.global, true);
  assert.deepEqual(parsed.agents, ['codex']);
  assert.deepEqual(parsed.skills, ['design-thinking']);
  for (const args of [
    ['install', '-a', 'codex;whoami'],
    ['install', '--skill', 'X'],
    ['uninstall', '--all'],
    ['install', '--global', '--project'],
    ['install', '--check'],
    ['doctor', '--yes'],
    ['install', '--source', 'other/repo'],
    ['install', '--skill', 'agentflow', '--skill', 'agentflow'],
  ]) assert.throws(() => parseArgs(args));
});

test('init creates only its own project config and is idempotent', async () => {
  await sandbox(async cwd => {
    const ctx = { ...capture(), cwd };
    assert.equal(await run(['init', '--agent', 'codex'], ctx), 0);
    assert.deepEqual(await readConfig(cwd), {
      schemaVersion: 1, source: 'howlil/agentflow', agent: 'codex',
    });
    assert.equal(await run(['init', '--agent', 'codex'], ctx), 0);
    assert.equal(await run(['init', '--agent', 'claude-code'], ctx), 2);
    assert.match(ctx.errors.join('\n'), /refusing to overwrite/);
    await assert.rejects(readFile(join(cwd, 'AGENTS.md')));
  });
});

test('init dry run does not create config or call upstream', async () => {
  await sandbox(async cwd => {
    const ctx = { ...capture(), cwd };
    assert.equal(await run(['init', '--dry-run'], ctx), 0);
    assert.equal(await readConfig(cwd), null);
    assert.equal(ctx.calls.length, 0);
  });
});

test('existing invalid configuration is never overwritten', async () => {
  await sandbox(async cwd => {
    await writeFile(join(cwd, CONFIG_NAME), '{ broken json');
    const ctx = { ...capture(), cwd };
    assert.equal(await run(['init'], ctx), 2);
    assert.equal(await readFile(join(cwd, CONFIG_NAME), 'utf8'), '{ broken json');
  });
});

test('install forwards a pinned, argument-separated command and config default agent', async () => {
  await sandbox(async cwd => {
    const ctx = { ...capture(), cwd };
    assert.equal(await run(['init', '--agent', 'codex'], ctx), 0);
    assert.equal(await run(['install', '-g', '--skill', 'design-thinking', '--copy', '--yes'], ctx), 0);
    assert.deepEqual(ctx.calls[0].args, [
      '--yes', 'skills@1.7.4', 'add', 'howlil/agentflow', '-g', '-a', 'codex',
      '--skill', 'design-thinking', '--copy', '-y',
    ]);
    assert.equal(ctx.calls[0].options.cwd, cwd);
  });
});

test('status and scope never rewrite config', async () => {
  await sandbox(async cwd => {
    const ctx = { ...capture(), cwd };
    assert.equal(await run(['status', '--global', '--agent', 'claude-code'], ctx), 0);
    assert.deepEqual(ctx.calls[0].args,
      ['--yes', 'skills@1.7.4', 'list', '-g', '-a', 'claude-code']);
    assert.equal(await readConfig(cwd), null);
  });
});

test('update without skill is safely rejected, check stays read-only', async () => {
  await sandbox(async cwd => {
    const ctx = { ...capture(), cwd };
    await writeFile(join(cwd, 'skills-lock.json'), JSON.stringify({
      version: 1, skills: { agentflow: { source: 'howlil/agentflow', sourceType: 'github', sourceUrl: 'https://github.com/howlil/agentflow' } },
    }));
    assert.equal(await run(['update'], ctx), 2);
    assert.equal(ctx.calls.length, 0);
    assert.equal(await run(['update', '--check'], ctx), 0);
    assert.deepEqual(ctx.calls[0].args, ['--yes', 'skills@1.7.4', 'check']);
    assert.equal(await run(['update', '--skill', 'agentflow', '--project', '-y'], ctx), 0);
    assert.deepEqual(ctx.calls[1].args,
      ['--yes', 'skills@1.7.4', 'update', 'agentflow', '-p', '-y']);
  });
});

test('uninstall defaults to repository source and never uses upstream --all', async () => {
  await sandbox(async cwd => {
    await writeFile(join(cwd, 'skills-lock.json'), JSON.stringify({
      version: 1, skills: {
        agentflow: { source: 'howlil/agentflow' },
        'code-review': { source: 'other-owner/toolbox' },
      },
    }));
    const ctx = { ...capture(), cwd };
    assert.equal(await run(['uninstall', '-p', '-a', 'codex'], ctx), 0);
    assert.deepEqual(ctx.calls[0].args,
      ['--yes', 'skills@1.7.4', 'remove', 'agentflow', '-a', 'codex']);
    assert.equal(await run(['uninstall', '-p', '-s', 'agentflow', '--dry-run'], ctx), 0);
    assert.equal(ctx.calls.length, 1);
  });
});

test('runner exit status is propagated without claiming success', async () => {
  await sandbox(async cwd => {
    const ctx = { ...capture(), cwd, runner: () => 17 };
    assert.equal(await run(['install', '-s', 'agentflow'], ctx), 17);
  });
});

test('doctor is offline and reports node/environment checks without calling installer', async () => {
  await sandbox(async cwd => {
    const ctx = { ...capture(), cwd, findExecutable: name => name === 'npx' || name === 'git' };
    assert.equal(await run(['doctor'], ctx), 0);
    assert.match(ctx.output.join('\n'), /not initialized/);
    assert.equal(ctx.calls.length, 0);
    const old = { ...ctx, nodeVersion: '20.19.0', output: [] };
    assert.equal(await run(['doctor'], old), 1);
    assert.ok(!supportsNode('22.19.0'));
    assert.ok(supportsNode('22.20.0'));
    assert.ok(supportsNode('24.0.0'));
  });
});

test('delegation never interpolates arbitrary shell commands', () => {
  assert.deepEqual(buildDelegation(parseArgs(['install', '-s', 'agentflow']), null).args,
    ['--yes', 'skills@1.7.4', 'add', 'howlil/agentflow', '--skill', 'agentflow']);
});
