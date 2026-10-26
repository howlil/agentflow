import test from 'node:test';
import assert from 'node:assert/strict';
import { checkAcceptance } from './acceptance-gate.mjs';

const sha = 'a'.repeat(40);
const old = 'b'.repeat(40);
const repo = 'howlil/agentflow';
const makeBody = (state = 'VERIFIED', phase = 'VERIFYING') => [
  '## Objective', 'Deliver accepted behavior.', '',
  '## Repository and baseline', '- Repository: ' + repo, '- Base branch and initial commit: master / ' + sha, '',
  '## Scope and invariants', 'Preserve correctness.', '',
  '## Research decision traceability',
  '| Decision | Approved conclusion and source | Disposition | Requirement ID(s) or rationale |',
  '| --- | --- | --- | --- |',
  '| DEC-001 | Approved decision from research.md | INCLUDE | AF-001 |', '',
  '## Acceptance contract', 'Evidence-bound contract.', '',
  '## Requirement evidence ledger',
  '| Requirement | Required behavior and observable acceptance | Failure / edge case | State | Code / PR evidence | Verification (method, SHA, result) |',
  '| --- | --- | --- | --- | --- | --- |',
  '| AF-001 | Correct behavior | Invalid input rejected | ' + state + ' | PR #36 | reviewed; sha=' + sha + '; PASS |', '',
  '## Resume pointer', '- Active PR and branch: master',
  '- Execution phase: ' + phase,
  '- Latest inspected HEAD SHA: ' + sha,
  '- CI evidence assessed for SHA: sha=' + sha + '; run=https://github.com/' + repo + '/actions/runs/42',
  '- Next requirement: ' + (state === 'VERIFIED' ? 'DONE' : 'AF-001'),
  '- Next concrete action: Confirm acceptance.', '- Open blockers: none'
].join('\n');
const run = { id:42, head_sha:sha, status:'completed', conclusion:'success', name:'CI', repository:{full_name:repo} };
const jobs = [{name:'verify',status:'completed',conclusion:'success'}];
const make = () => ({body:makeBody(),repository:repo,issueNumber:36,expectedSha:sha,branchSha:sha,run,jobs});
const reject = (input, pattern) => {
  const result = checkAcceptance(input);
  assert.equal(result.valid,false);
  assert.ok(result.diagnostics.some(e=>e.includes(pattern)),JSON.stringify(result.diagnostics));
};
test('verified Issue, CI run and verify job are eligible', () => {
  assert.equal(checkAcceptance(make()).valid,true);
  assert.equal(checkAcceptance({...make(),body:makeBody('VERIFIED','ACCEPTED')}).valid,true);
});
test('pending requirements, blockers and premature phase reject acceptance', () => {
  reject({...make(),body:makeBody('PENDING')},'Every requirement must be VERIFIED');
  reject({...make(),body:makeBody('VERIFIED','IMPLEMENTING')},'phase VERIFYING or ACCEPTED');
  reject({...make(),body:makeBody().replace('Open blockers: none','Open blockers: runtime proof missing')},'open blockers must be none');
});
test('stale, failed and forged GitHub evidence fail closed', () => {
  reject({...make(),branchSha:old},'Stale master');
  reject({...make(),run:{...run,head_sha:old}},'Observed CI must');
  reject({...make(),run:{...run,conclusion:'failure'}},'Observed CI must');
  reject({...make(),run:{...run,id:123}},'run ID does not match');
  reject({...make(),run:{...run,repository:{full_name:'other/repo'}}},'Observed CI must');
  reject({...make(),jobs:[]},'Required verify job');
  reject({...make(),body:makeBody().replace('howlil/agentflow/actions/runs/42','attacker/repo/actions/runs/42')},'link must belong');
});
