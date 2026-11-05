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

test('each P# requires its own PF# even when multiple P# cover one B#', () => {
  const r = inspectContracts(
    'B1: book\nP1 (B1): regular path\nP2 (B1): concurrent safety\n',
    'PF1 (P1): normal test\n'
  );
  assert.equal(r.status, 'UNVERIFIED');
  assert.ok(r.findings.some(f => f.id === 'P2' && f.code === 'UNVERIFIED'));
});

test('canonical B1-B3 ranges cover intermediate behaviors', () => {
  const r = inspectContracts(
    'B1: start\nB2: submit\nB3: saved\nP1 (B1-B3): journey\n',
    'PF1 (P1): journey proof\n'
  );
  assert.equal(r.status, 'DOCUMENTED');
  assert.equal(r.findings.length, 0);
});

test('canonical B# path declarations are recognized and not double-counted', () => {
  const r = inspectContracts(
    'B1 → B2 → B3 → J1 done\nB2: submit\nP1 (B1-B3): journey\n',
    'PF1 (P1): journey proof\n'
  );
  assert.equal(r.status, 'DOCUMENTED');
  assert.equal(r.behaviorCount, 3);
  assert.ok(!r.findings.some(f => f.code === 'DUPLICATE'));
});

test('known behavior with no P# reports MISSING, not UNKNOWN', () => {
  const r = inspectContracts('B1: user creates booking\n', '## Verification\n');
  assert.equal(r.status, 'MISSING');
  assert.ok(r.findings.some(f => f.id === 'B1' && f.code === 'MISSING'));
});

test('prose mentions do not count as explicit P# / PF# references', () => {
  const r = inspectContracts(
    'B1: one\nB2: two\nP1 (B1): mention B2 in explanation\n',
    'PF1 (P1): mentions P2 in explanation\n'
  );
  assert.equal(r.status, 'MISSING');
  assert.deepEqual(r.findings.filter(f => f.code === 'MISSING').map(f => f.id), ['B2']);
});

test('reversed or huge B# ranges fail closed rather than silently misreporting coverage', () => {
  assert.throws(
    () => inspectContracts('B1: one\nP1 (B3-B1): invalid\n', ''),
    /Invalid or oversized contract ID range/
  );
  assert.throws(
    () => inspectContracts('B1: one\nP1 (B1-B99999): invalid\n', ''),
    /Invalid or oversized contract ID range/
  );
});
