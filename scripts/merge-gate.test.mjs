import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { mergeGateDiagnostics } from './merge-gate.mjs';

const allowed = { classify: 'success', verify: 'success', portableRequired: 'true', portable: 'success' };
const errors = fields => mergeGateDiagnostics({ ...allowed, ...fields });

test('distribution changes require verify plus all portable checks', () => {
  assert.deepEqual(errors({}), []);
  for (const outcome of ['failure', 'cancelled', 'skipped', 'neutral', '']) {
    assert.match(errors({ portable: outcome }).join('; '), /Required portable matrix must succeed/);
  }
});

test('non-distribution changes accept a genuinely skipped portable matrix', () => {
  assert.deepEqual(errors({ portableRequired: 'false', portable: 'skipped' }), []);
  for (const outcome of ['failure', 'cancelled', 'success', 'neutral', '']) {
    assert.match(errors({ portableRequired: 'false', portable: outcome }).join('; '), /Non-required portable matrix must be skipped/);
  }
});

test('classification and verify failures never turn green', () => {
  for (const outcome of ['failure', 'cancelled', 'skipped', '']) {
    assert.match(errors({ classify: outcome }).join('; '), /Scope classification must succeed/);
    assert.match(errors({ verify: outcome }).join('; '), /Required verify job must succeed/);
  }
});

test('missing or malformed classification fails closed', () => {
  for (const portableRequired of ['', 'unknown', 'TRUE']) {
    assert.match(errors({ portableRequired }).join('; '), /Invalid portable_required/);
  }
});

test('CI always runs one stable merge-gate after all three dependencies', async () => {
  const workflow = await readFile(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');
  assert.match(workflow, /  merge-gate:\n    name: merge-gate\n    needs: \[classify, verify, cross-agent-compatibility\]\n    if: \$\{\{ always\(\) \}\}/);
  for (const name of ['CLASSIFY_RESULT', 'VERIFY_RESULT', 'PORTABLE_REQUIRED', 'PORTABLE_RESULT']) {
    assert.ok(workflow.includes(name + ':'), name + ' is not wired');
  }
  assert.match(workflow, /run: node scripts\/merge-gate\.mjs/);
});
