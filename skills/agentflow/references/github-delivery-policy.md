# GitHub Delivery Policy

Use only when ChatGPT is making or assessing real GitHub engineering changes and the relevant connector/tool is authorized. This is a *workflow discipline*, not a grant of permission, shell access, CI execution, or an automatic release agent. Discover the target repository's actual default branch; do not assume main or master.

## Work-item alignment and intake (nontrivial work only)
Before making a new Issue, branch or PR, recover the **latest** repository state: actual default branch/HEAD, `AGENTS.md` and relevant contracts, open related Issues/PRs, active delivery target or Milestone (if one exists), parent/child relationships, blockers and any accepted scope decisions. Search by the observable outcome and affected contracts, not only the user's wording or an Issue number supplied from memory.

Use this decision sequence:
1. **Same outcome already active?** Continue its Issue and existing branch/PR. Do not clone work because another ChatGPT conversation was opened, a check failed or a task was retried.
2. **New independently verifiable outcome?** Link it to the approved parent/Milestone when available; otherwise record the delivery target in the Issue without fabricating a GitHub Milestone. Define the required result, preserved invariants, exclusions, dependent work, and proof before opening a scoped branch.
3. **Only a small deterministic change or read-only investigation?** Act directly within repo permissions; do not force tracking ceremony. Respect branch protection even for trivial writes.
4. **Large outcome?** Split only along independently verifiable results or real dependencies, not files, skills, AI workers or chat sessions. One short-lived implementation branch and one PR per coherent slice is the default.

A Milestone groups desired outcomes; an Issue owns one requirement/evidence ledger; a branch isolates an implementation; a PR is its integration/review boundary; a Git commit and CI run are revision-specific evidence. Use GitHub-native parent/sub-issues and blocked-by relations when available. When the host cannot read or write those relationships, put real Issue links in the contract and mark relationship verification unavailable; do not claim a native GitHub link was made.

## Cross-chat concurrency and contract drift
A new conversation must rehydrate from GitHub, never from chat memory alone. For each relevant active Issue/PR, inspect its current contract, resume pointer, HEAD SHA, accepted changes, dependencies, and actual affected paths/interfaces. Map relevant edges as **data**, **decision**, **ordering**, or **write-conflict** (use `graph-protocol` when coordination materially benefits). Independent work may progress separately; required upstream decisions or overlapping mutable contracts must be serialized, partitioned, or given one accountable owner.

Before writing or merging:
- Compare proposed files, public interfaces, schema/state ownership, and invariants with other active PRs and latest default-branch changes. A lack of textual merge conflict does **not** imply product or contract compatibility.
- Re-read the branch HEAD and changed files; use an available blob SHA or expected-HEAD lease. If an Issue update has no conditional write API, acknowledge that its read/edit/write is **not atomic**; re-read immediately before the write, inspect after, and reconcile if another writer intervened. Labels, assignees and free-text ownership are advisory, not distributed locks.
- If approved product scope, architecture contracts, milestone intent or upstream dependencies changed, stop the affected implementation path, record the decision/deviation in the **same** Issue, and adjust only the affected requirement(s), dependency edges and tests. Do not silently reinterpret the original acceptance or overwrite concurrent work.
- After any merged upstream change, reassess the downstream PR against latest base, rerun the faithful affected checks, and attach evidence to the correct checked revision (HEAD or test merge commit as applicable).
- Persist one exact next-action pointer and blockers in the Issue. The Issue requirement evidence ledger remains the only authoritative per-requirement status source; never duplicate it in PR text, Milestone descriptions or chat summaries.

GitHub metadata and skill instructions coordinate user-initiated execution; without a transactional lease and host-level acceptance they do not guarantee conflict freedom, automatic synchronization, or unattended work.

## Before changing Git
1. Fetch the latest relevant Issue, existing PR, active branch, HEAD SHA, and repo-specific guidance. Reuse the same work item for a follow-up or "next".
2. If no branch/PR is necessary for a trivial read-only task, do not create one. For a coherent nontrivial change, normally use one short-lived branch and one reviewable PR; split only independent outcomes or real conflicting ownership.
3. Do not create branches by agent, file, test, reasoning stage, or retry. Do not recreate a PR after a failed check; fix that same PR.
4. Respect real write permissions, protected branch/ruleset requirements, and user approval for merge/release or destructive actions.

## Commit, update and integration
- Commit a logical outcome, not every edit, skill invocation, or test iteration. If multi-file atomic tree/commit operations are available, use them with a fresh base and a guarded ref update; otherwise be transparent when writes create separate commits.
- Prevent stale updates by re-reading the file/blob or HEAD and using an available optimistic lease. On mismatch, inspect changes and reconcile; never overwrite unknown concurrent work to "make progress".
- Intermediate commits can be useful, but prefer a clean reviewed history at integration. Squash merge if appropriate and allowed; never force-push shared branch history merely to hide noise.
- Inspect the final diff against all required behavior and exclude unrelated changes. A green workflow for an older SHA does not validate a newer HEAD.
- Do not auto-merge, tag, or release because a PR exists or CI turns green. Honor actual repository authorization, release gates and user intent. Clean up completed branches only when safe.

## CI and verification economics
- Verify the smallest *faithful* behavior first, then repo-required gates. For docs-only changes, prefer doc checks; for public distribution/manifest changes, perform compatibility/package checks; run critical integration/E2E only when the changed risk requires it.
- Do not add tests just for coverage or run multiple test layers that prove the same property without a different failure mode. Flaky tests must be investigated rather than retried until green.
- Before optimizing a workflow, measure actual runtime, queue delay, repeated superseded runs, failure patterns and required checks. If the whole test suite is already cheap, prefer it to elaborate path-selection logic.
- Cancel superseded PR runs only where cancellation is safe. Never cancel a non-idempotent publish/deploy solely to reduce CI minutes. Keep a stable required gate that checks the truly needed verification and does not treat skipped work as passed.
- Never rely on skip-CI directives or path exclusions that leave required checks pending or bypass required safety evidence. Keep standard GitHub CI deterministic; in GitHub-only mode it must not invoke external AI coding workers.
- Attribute evidence to the exact tested commit SHA, platform and environment. Distinguish SUCCESS, FAILURE, SKIPPED and UNRUN.

## Verified release
Ship the reviewed source/artifact that was actually verified, with versioning, migration/recovery, signing, and runtime smoke checks only where the product requires them. A successful build or upload is not proof of an installed, working release. Leave target-platform acceptance as unverified if not observed. Do not start releases as a side effect of an ordinary coding iteration.
