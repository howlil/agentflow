# GitHub Delivery Policy

Use only when ChatGPT is making or assessing real GitHub engineering changes and the relevant connector/tool is authorized. This is a *workflow discipline*, not a grant of permission, shell access, CI execution, or an automatic release agent. Discover the target repository's actual default branch; do not assume main or master.

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
