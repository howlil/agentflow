import { validateExecutionContract } from './execution-contract.mjs';

export function checkAcceptance({ body, repository, issueNumber, expectedSha, branchSha, run, jobs }) {
  const structural = validateExecutionContract(body);
  const errors = [...structural.diagnostics];
  const field = name => body.match(new RegExp('^- ' + name + ':\\s*(.+)$', 'm'))?.[1]?.trim() || '';
  const phase = field('Execution phase');
  const cited = field('CI evidence assessed for SHA');
  const runRef = cited.match(/\brun=https:\/\/github\.com\/([^/\s]+\/[^/\s]+)\/actions\/runs\/(\d+)\b/);
  const id = runRef ? Number(runRef[2]) : null;

  if (!/^[\w.-]+\/[\w.-]+$/.test(repository || '') || !Number.isSafeInteger(issueNumber) || issueNumber < 1) {
    errors.push('Invalid repository or Issue number');
  }
  if (!/^[0-9a-f]{40}$/i.test(expectedSha || '') || field('Latest inspected HEAD SHA') !== expectedSha ||
      branchSha !== expectedSha) errors.push('Stale master/Issue HEAD SHA');
  if (!['VERIFYING', 'ACCEPTED'].includes(phase)) errors.push('Acceptance needs phase VERIFYING or ACCEPTED');
  if (structural.requirements.length === 0 || structural.requirements.some(x => x.state !== 'VERIFIED')) {
    errors.push('Every requirement must be VERIFIED');
  }
  if (field('Next requirement') !== 'DONE' || field('Open blockers').toLowerCase() !== 'none') {
    errors.push('Next requirement must be DONE and open blockers must be none');
  }
  if (!cited.includes('sha=' + expectedSha)) errors.push('CI evidence SHA is stale');
  if (!runRef || runRef[1] !== repository || !Number.isSafeInteger(id)) errors.push('CI run link must belong to the repository');
  if (!run || run.id !== id) errors.push('Observed run ID does not match cited CI run');
  if (!run || run.head_sha !== expectedSha || run.conclusion !== 'success' ||
      run.status !== 'completed' || run.repository?.full_name !== repository || run.name !== 'CI') {
    errors.push('Observed CI must be completed SUCCESS for this SHA, workflow and repository');
  }
  if (!Array.isArray(jobs) || !jobs.some(j => j.name === 'verify' && j.status === 'completed' && j.conclusion === 'success')) {
    errors.push('Required verify job must actually have passed');
  }
  return { valid: errors.length === 0, diagnostics: errors };
}
