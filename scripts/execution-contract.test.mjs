import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { validateExecutionContract } from './execution-contract.mjs';

const SHA = 'a'.repeat(40);
const OLD = 'b'.repeat(40);
const good = (state = 'PENDING', verification = 'UNRUN') => [
  '## Objective', 'Deliver observable behavior X.', '',
  '## Repository and baseline', '- Repository: org/repo', '- Base branch and initial commit: main / ' + SHA, '',
  '## Scope and invariants', 'Preserve behavior Y; implement X.', '',
  '## Research decision traceability',
  '| Decision | Approved conclusion and source | Disposition | Requirement ID(s) or rationale |',
  '| --- | --- | --- | --- |',
  '| DEC-001 | Approved choice, source: design-notes.md | INCLUDE | AF-001 |', '',
  '## Acceptance contract', 'The requirement ledger is authoritative.', '',
  '## Requirement evidence ledger',
  '| Requirement | Required behavior and observable acceptance | Failure / edge case | State | Code / PR evidence | Verification (method, SHA, result) |',
  '| --- | --- | --- | --- | --- | --- |',
  '| AF-001 | X returns the expected result | Invalid input is rejected | ' + state + ' | ' + (state === 'PENDING' ? 'UNRECORDED' : 'PR #22') + ' | ' + verification + ' |', '',
  '## Resume pointer',
  '- Active PR and branch: #22 / feat/x',
  '- Latest inspected HEAD SHA: ' + SHA,
  '- CI evidence assessed for SHA: UNRUN',
  '- Next requirement: ' + (state === 'VERIFIED' ? 'DONE' : 'AF-001'),
  '- Next concrete action: Inspect X and update evidence.',
  '- Open blockers: ' + (state === 'BLOCKED' ? 'Integration test failing on invalid input.' : 'none')
].join('\n');

const invalid = (body, expected) => assert.ok(
  validateExecutionContract(body).diagnostics.some(text => text.includes(expected)),
  'expected diagnostic ' + expected + ' in ' + JSON.stringify(validateExecutionContract(body).diagnostics)
);

test('M2 contract accepts a complete pending requirement without claiming test success', () => {
  const result = validateExecutionContract(good());
  assert.equal(result.valid, true, result.diagnostics.join('; '));
  assert.deepEqual(result.requirements, [{ id: 'AF-001', state: 'PENDING' }]);
});

test('M2 detects duplicate requirement IDs and stale CI evidence', () => {
  const duplicated = good().replace('\n## Resume pointer', '\n| AF-001 | Duplicate behavior | Invalid input | PENDING | UNRECORDED | UNRUN |\n\n## Resume pointer');
  invalid(duplicated, 'Duplicate requirement ID');
  invalid(good().replace('CI evidence assessed for SHA: UNRUN', 'CI evidence assessed for SHA: sha=' + OLD + ' / run 13'), 'CI evidence is stale');
});

test('M2 research decisions must map to actual requirements or document exclusion', () => {
  invalid(good().replace('| INCLUDE | AF-001 |', '| INCLUDE | AF-999 |'), 'Unresolved requirement AF-999');
  const duplicateDecision = good().replace(
    '| DEC-001 | Approved choice, source: design-notes.md | INCLUDE | AF-001 |',
    '| DEC-100 | Approved choice, source: design-notes.md | INCLUDE | AF-001 |\n' +
    '| DEC-100 | Another approved conclusion | INCLUDE | AF-001 |'
  );
  invalid(duplicateDecision, 'Duplicate research decision: DEC-100');
  invalid(good().replace('| INCLUDE | AF-001 |', '| EXCLUDE | - |'), 'Missing approved exclusion');
  const excluded = good().replace('| INCLUDE | AF-001 |', '| EXCLUDE | Reason: request explicitly removed after review |');
  assert.equal(validateExecutionContract(excluded).valid, true);
  const na = good().replace(
    /\| Decision \| Approved conclusion and source \| Disposition \| Requirement ID\(s\) or rationale \|\n\| --- \| --- \| --- \| --- \|\n\| DEC-001 \| Approved choice, source: design-notes\.md \| INCLUDE \| AF-001 \|/,
    'N/A: no approved research decisions'
  );
  assert.equal(validateExecutionContract(na).valid, true);
});

test('M2 forbids unsupported VERIFIED assertions and stale requirement evidence', () => {
  invalid(good('VERIFIED', 'UNRUN'), 'VERIFIED without observed verification');
  invalid(good('VERIFIED', 'review PASS; sha=' + OLD), 'VERIFIED evidence must match assessed HEAD');
  const pass = good('VERIFIED', 'Review of PR #22; sha=' + SHA + '; PASS');
  assert.equal(validateExecutionContract(pass).valid, true);
});

test('M2 resume pointer must reference an unfinished requirement and blockers must be explicit', () => {
  invalid(good().replace('Next requirement: AF-001', 'Next requirement: AF-999'), 'Resume pointer');
  invalid(good('BLOCKED', 'Missing database runner.').replace('Open blockers: Integration test failing on invalid input.', 'Open blockers: none'), 'BLOCKED requirement');
});

test('M2 new issue template is intentionally invalid until the user supplies actual decisions and evidence', async () => {
  const path = fileURLToPath(new URL('../.github/ISSUE_TEMPLATE/agentflow-execution.md', import.meta.url));
  const template = await readFile(path, 'utf8');
  assert.equal(validateExecutionContract(template).valid, false);
  assert.match(template, /Research decision traceability/);
  assert.match(template, /single authoritative record/);
});

test('M2 optional execution phase rejects premature ACCEPTED claims', () => {
  const pending = good().replace('Next requirement: AF-001', 'Execution phase: ACCEPTED\n- Next requirement: AF-001');
  invalid(pending, 'ACCEPTED requires all requirements VERIFIED');
  invalid(pending.replace('ACCEPTED', 'UNKNOWN'), 'Invalid execution phase');
  const passed = good('VERIFIED', 'Review; sha=' + SHA + '; PASS')
    .replace('Next requirement: DONE', 'Execution phase: ACCEPTED\n- Next requirement: DONE')
    .replace('CI evidence assessed for SHA: UNRUN', 'CI evidence assessed for SHA: sha=' + SHA + '; run=https://github.com/org/repo/actions/runs/123');
  assert.equal(validateExecutionContract(passed).valid, true, validateExecutionContract(passed).diagnostics.join('; '));
  invalid(passed.replace('Open blockers: none', 'Open blockers: pending'), 'ACCEPTED cannot have open blockers');
  invalid(passed.replace('run=https://github.com/org/repo/actions/runs/123', 'UNRUN'), 'ACCEPTED requires a HEAD SHA');
});

test('M2 Markdown tables support escaped pipes in content without losing columns', () => {
  const body = good()
    .replace('X returns the expected result', 'Accept A \\| B and return the expected result')
    .replace('Approved choice, source: design-notes.md', 'Approved A \\| B, source: design-notes.md');
  const result = validateExecutionContract(body);
  assert.equal(result.valid, true, result.diagnostics.join('; '));
});

test('M2 even-numbered backslashes do not escape a column delimiter', () => {
  const body = good().replace('X returns the expected result', 'A \\\\| B is a separate column');
  invalid(body, 'Invalid column count in Requirement evidence ledger');
});

test('M2 duplicate operational fields in the Resume pointer fail closed', () => {
  const duplicated = good().replace('- Next requirement: AF-001',
    '- Next requirement: AF-001\n- Next requirement: DONE');
  invalid(duplicated, 'Duplicate Resume pointer field: Next requirement');
});

test('M2 ignores fields outside Resume pointer', () => {
  const body = good().replace('## Resume pointer',
    '- Latest inspected HEAD SHA: ' + OLD + '\n\n## Resume pointer');
  assert.equal(validateExecutionContract(body).valid, true);
});

test('M2 rejects duplicate authoritative sections and repository identities', () => {
  invalid(good() + '\n\n## Resume pointer\n- Next requirement: DONE', 'Duplicate authoritative section: Resume pointer');
  invalid(good().replace('Repository: org/repo', 'Repository: org/repo\n- Repository: attacker/repo'),
    'Repository and baseline must have exactly one Repository field');
  invalid(good().replace('Repository: org/repo', 'Repository: INVALID'), 'Invalid repository identity');
});
