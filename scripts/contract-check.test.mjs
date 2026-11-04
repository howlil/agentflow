import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectContracts } from './contract-check.mjs';

test('documents relationships but never claims that checks executed', () => {
  const r = inspectContracts(
    '- B1: book\n- X1: conflict\n- P1 (B1, X1): prevent duplicates\n',
    '## Verification\n- PF1 (P1): concurrent database test\n'
  );
  assert.equal(r.status, 'DOCUMENTED');
  assert.equal(r.behaviorCount, 2);
  assert.equal(r.acceptanceCount, 1);
  assert.equal(r.findings.length, 0);
  assert.match(r.limitation, /not that tests ran/);
});
test('missing acceptance relationship is reported', () => {
  const r = inspectContracts('B1: first\nB2: second\nP1 (B1): proof\n', 'PF1 (P1): check\n');
  assert.equal(r.status, 'MISSING');
  assert.deepEqual(r.findings.filter(x => x.code === 'MISSING').map(x => x.id), ['B2']);
});
test('missing PF link remains unverified', () => {
  const r = inspectContracts('B1: save\nP1 (B1): assertion\n', '## Verification\n');
  assert.equal(r.status, 'UNVERIFIED');
  assert.equal(r.findings[0].code, 'UNVERIFIED');
});
test('dangling and duplicate declarations are reported', () => {
  const r = inspectContracts('B1: foo\nB1: repeated\nP1 (B1, X99): proof\n', 'PF1 (P77): check\n');
  assert.equal(r.status, 'MISSING');
  assert.ok(r.findings.some(x => x.code === 'DUPLICATE'));
  assert.ok(r.findings.some(x => x.code === 'DANGLING' && x.detail.includes('X99')));
  assert.ok(r.findings.some(x => x.code === 'DANGLING' && x.detail.includes('P77')));
});
test('unstructured memory reports unknown rather than covered', () => {
  const r = inspectContracts('## Behavior\nWrite booking.\n', '## Verification\nrun tests\n');
  assert.equal(r.status, 'UNKNOWN');
});
test('code-fenced examples are ignored', () => {
  const fence = String.fromCharCode(96).repeat(3);
  const r = inspectContracts(
    '## Examples\n' + fence + 'text\nB1: demo\nP1 (B1): demo\n' + fence + '\nB2: real\nP2 (B2): actual\n',
    'PF2 (P2): checked\n'
  );
  assert.equal(r.status, 'DOCUMENTED');
  assert.equal(r.behaviorCount, 1);
});
