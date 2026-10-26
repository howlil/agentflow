import { checkAcceptance } from './acceptance-gate.mjs';
import { parseResumePointer } from './execution-contract.mjs';

const repo = process.env.GITHUB_REPOSITORY || '';
const sha = process.env.GITHUB_SHA || '';
const issueNumber = Number(process.env.ISSUE_NUMBER);
const token = process.env.GITHUB_TOKEN || '';
async function github(path) {
  const response = await fetch('https://api.github.com' + path, {
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }
  });
  if (!response.ok) throw new Error('GitHub read failed: HTTP ' + response.status + ' at ' + path.split('?')[0]);
  return response.json();
}
async function main() {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo) || !/^[0-9a-f]{40}$/i.test(sha) ||
      !Number.isSafeInteger(issueNumber) || issueNumber < 1 || !token ||
      process.env.GITHUB_REF !== 'refs/heads/master') {
    throw new Error('Acceptance requires a read-only dispatch on master with valid credentials');
  }
  const [branch, issue] = await Promise.all([
    github('/repos/' + repo + '/branches/master'),
    github('/repos/' + repo + '/issues/' + issueNumber)
  ]);
  if (issue.pull_request) throw new Error('Acceptance ledger must be a GitHub Issue');
  if (branch.commit?.sha !== sha) throw new Error('Master changed after workflow start; retry on current HEAD');
  const cited = parseResumePointer(issue.body || '').fields['CI evidence assessed for SHA'] || '';
  const id = Number(cited.match(/\brun=https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/actions\/runs\/(\d+)\b/)?.[1]);
  if (!Number.isSafeInteger(id) || id < 1) throw new Error('Issue must cite a real CI run');
  const [run, page] = await Promise.all([
    github('/repos/' + repo + '/actions/runs/' + id),
    github('/repos/' + repo + '/actions/runs/' + id + '/jobs?per_page=100')
  ]);
  const [latestBranch, latestIssue] = await Promise.all([
    github('/repos/' + repo + '/branches/master'),
    github('/repos/' + repo + '/issues/' + issueNumber)
  ]);
  if (latestBranch.commit?.sha !== sha || latestIssue.body !== issue.body ||
      latestIssue.updated_at !== issue.updated_at) {
    throw new Error('Issue or master changed during acceptance read; retry with fresh state');
  }
  const result = checkAcceptance({ body: latestIssue.body || '', repository: repo, issueNumber,
    expectedSha: sha, branchSha: latestBranch.commit.sha, run, jobs: page.jobs });
  if (!result.valid) throw new Error('Acceptance rejected: ' + result.diagnostics.join('; '));
  console.log('Acceptance verified: Issue #' + issueNumber + ', SHA ' + sha + ', CI run ' + id);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
