---
title: Code from ChatGPT Web using GitHub
description: ChatGPT-only engineering execution with GitHub Issues, code changes, PRs, and existing CI.
---

# ChatGPT Web is the AI executor

**No external coding agent, OpenAI API key, custom MCP server, or Agentflow backend is required.**
Agentflow is a skills-only engineering decision router. ChatGPT Web uses the GitHub connector the user has authorized to read actual repository files, make scoped code changes, and create/update Issues and PRs. GitHub is the durable engineering record. GitHub Actions may run existing tests, builds, or linters, but it does **not** invoke another AI model.

This is a host-dependent workflow: if ChatGPT's current GitHub integration does not expose a specific operation, that operation is unavailable until the user provides an alternative authorized capability. The plugin cannot grant the host additional permissions, shell access, or unlimited repository context.

## Start one engineering task

1. Identify the repository, current base branch, and relevant steering files (`AGENTS.md`, `.agents/product.md`, and `.agents/engineering.md` when they exist).
2. Inspect the relevant implementation and tests. Reuse an existing Issue/PR when the task continues earlier work.
3. Convert approved research into the execution contract format in `.github/ISSUE_TEMPLATE/agentflow-execution.md` when that template exists in the target repository. This is an optional repository template, not a guaranteed file on every branch. Use stable requirement IDs, explicit acceptance checks, failure cases, constraints, and out-of-scope decisions.
4. For nontrivial or multi-turn work, record the contract in a GitHub Issue or linked repository specification. Reuse an existing relevant Issue, branch, and PR before creating new ones; create a scoped branch only when the change merits review. Trivial/read-only work does not need extra Git ceremony. Split large work into bounded changes without losing the parent requirements.
5. Implement by calling the authorized GitHub read/write tools from ChatGPT Web. Read before editing; for concurrent changes re-read the latest target state instead of overwriting another person's work. A remote file change is not proof that the code compiles.
6. Review the complete PR diff against every in-scope requirement, checking changed behavior, regressions, and preserved invariants. Use the smallest relevant Agentflow specialist skills; a fixed, mandatory skill chain is not required.
7. Read **actual** CI statuses/logs for the **commit under review** from GitHub. Do not treat a green result on an older SHA as proof of the latest changes. Record evidence for each requirement, including explicitly unrun tests. Merge or release only after applicable gates and user approval.


## Coordinate multiple chats and features without duplicating work

For a nontrivial request, distinguish the following before creating GitHub objects:

| Object | Owns | Create when |
| --- | --- | --- |
| Milestone or parent Issue | Delivery target, outcome boundaries and exit criteria | Multiple independent outcomes share an approved target; use a plain target when native Milestones are unavailable |
| Issue | One outcome contract, dependencies, requirement evidence ledger and resume pointer | The work needs continuation, tracking or coordination |
| Branch | Temporary isolated implementation of that outcome | Actual changes need a reviewable boundary |
| PR | The bounded integration and review diff for the Issue | Code is ready for collaborative verification, including draft changes |
| CI | Evidence for specific properties at an exact revision | Existing relevant checks must run, with additional checks only for actual risks |
| Release | Approved distribution of verified source/artifact | A separate release decision exists |

**Before opening any new Issue/branch/PR:** search open and relevant recently completed work for the same observable result, check the actual default branch and steering files, inspect the current parent/Milestone and approved exclusions, compare the active PRs' overlapping file and interface scope, and identify blocking issue links. A new chat is not a reason for a new work item. Keep Issue and PR links current. Do not infer GitHub-native dependency or Milestone links from plain text.

**Choose integration order based on dependencies, not chat identity.** An upstream API/schema decision before its consumer is a data or decision edge. Two PRs editing one shared persistence boundary are a potential write-conflict edge even if Git reports no textual conflict. Serialize, repartition, or give one owner to that shared change. Independent, nonconflicting outcomes can proceed in parallel. `graph-protocol` may model those edges; it is not a job scheduler or a background AI worker.

**Before each remote write:** refresh the affected blob or branch HEAD, re-read the current Issue body and relevant PR diff, and compare approved requirements to the current state. If optimistic concurrency is unavailable on the Issue write operation, admit this limitation and read back after updating; never describe advisory assignees or labels as a lock. On conflicting changes, pause the affected edit and reconcile rather than overwriting. Before merge, compare against current base, re-evaluate impacted contracts and verify that the required checks refer to the revision GitHub actually evaluates.

**When the product or milestone scope drifts:** record an explicit decision under the existing Issue's Decisions and deviations, update its requirements/evidence only with authorization, and flag dependent PRs for revalidation. No independent second status checklist is maintained in the Milestone, PR body or conversation.

### Example: two ChatGPT conversations, one repository

- Chat A owns Issue #A for payment idempotency and its active PR. Chat B asks to implement webhook retries.
- Chat B first checks the open Issue/PR inventory. If retry semantics already belong to Issue #A, it continues that work. Otherwise it creates a distinct Issue only when the retry outcome is independently verifiable.
- If webhook retry relies on idempotency behavior changed in PR A, mark an upstream dependency and wait for compatible integration. If there is no shared dependency or write conflict, proceed separately.
- When either chat resumes, it re-reads GitHub. A previous chat's “done” message is never completion evidence.

### Lean CI and merge policy

Keep one stable required verification status that **fails when relevant validation fails**; do not make a skipped workflow appear to satisfy a required gate. Use the smallest faithful tests for the changed risk, and run additional integration, platform or release checks only when justified. Measure actual workflow duration, queue wait, repeated runs, and failure classes **before** removing jobs or introducing a complex path classifier. A check green for an older SHA is stale, and a successfully compiled Windows program is not proof of real desktop behavior. GitHub administrator-managed rulesets and native Milestone/dependency features must be confirmed, not assumed from a Markdown policy.

## Compile research into acceptance without dropping decisions

For nontrivial implementation work, identify **approved actionable research conclusions**, not every brainstormed alternative. In the Issue template's research decision table, assign one stable `DEC-###` for each approved conclusion, record its real source, and assign exactly one disposition:
- `INCLUDE` → link one or more existing `AF-###` requirement IDs.
- `EXCLUDE` → provide the actual reason and authorization.
- `DEFER` → provide the reason and continuation location where applicable.
- If no approved research existed, explicitly record `N/A: no approved research decisions` rather than fabricating a decision.

Each requirement has exactly one row in the authoritative **Requirement evidence ledger**: observable acceptance, meaningful failure case, state, changed code, and verification method/commit/result. Do not maintain an independent checked checklist. Before editing code, compare the research decision inventory to this ledger and ensure every included decision points to an actual requirement. Research source availability, ambiguities and scope conflicts remain explicit, not silently rewritten.

### Reconcile from GitHub at each continuation

1. Find the existing relevant Issue and PR (or linked specification), then fetch the *current* Issue body, PR diff and branch HEAD, not just a previous chat summary.
2. Check actual changes against each still-in-scope acceptance criterion; avoid a duplicate branch/PR or a new requirement ID for the same work.
3. For each code change, inspect the affected files and record the actual commit/PR. Read GitHub Actions results for the **same assessed HEAD**; a pass on an older SHA is stale.
4. Only move a requirement to `VERIFIED` if its observable criterion is satisfied by credible inspected evidence. Otherwise keep `PENDING`, `IMPLEMENTED_UNVERIFIED` or `BLOCKED` and identify the precise missing proof.
5. Update the **same** Issue evidence ledger and resume pointer. Re-read the remote Issue before writing to avoid silent overwrites. If the GitHub connector does not support conditional Issue updates, acknowledge the concurrency limitation and do not claim an atomic merge.
6. Record the next unmet requirement and exact action, so "next" can resume from remote state without inventing progress. Mark `DONE` only when every in-scope requirement is verified and external release/approval gates are separately satisfied.

The Agentflow repository includes a **structural validator** at `scripts/execution-contract.mjs`, covered by ordinary repository unit tests. This script checks table shape, IDs, included-decision linkage, incomplete claims and stale-SHA references **only on text that is supplied to it**; it is not automatically run against Issues in other repositories. It cannot confirm that approved research is complete, GitHub jobs actually passed, or a feature behaves correctly. ChatGPT must inspect those sources using authorized host tools. A valid table is not acceptance evidence.

## Resume a task when the user says "next"

The issue contract and PR are the source of truth, not an assistant's recollection. Locate the active Issue and its latest `Resume pointer`; fetch the branch head, changed files, CI results, and requirement ledger. Start from the first pending or blocked item. Do not create another issue or duplicate PR merely because the conversation changed. Update the Issue's `Resume pointer` and evidence ledger after each bounded edit.

The issue's requirement evidence ledger is the **single source of truth** for requirement state, observable acceptance, code changes and verification. Do not create a second checklist with independent status. A requirement ID is unique within its Issue. When changing approved scope, record the decision rather than silently rewriting acceptance criteria.

States in the issue's requirement ledger:

| State | Meaning |
| --- | --- |
| `PENDING` | No implementation evidence recorded |
| `IMPLEMENTED_UNVERIFIED` | A code change is present but the acceptance proof is incomplete |
| `VERIFIED` | Actual code and required test/runtime evidence satisfy the acceptance criterion |
| `BLOCKED` | A known failure or unavailable mandatory check prevents completion |

When test execution is not available through GitHub's existing CI, leave `Verification: UNRUN` and never infer a pass. For a Windows-specific feature, Linux CI passing cannot substitute for Windows runtime acceptance. For a multi-file change use commit/PR links and compare their concrete diffs; do not assert a transactional commit if the host only wrote files sequentially.

## Opt-in deterministic acceptance gate

After all required Issue requirements have trustworthy evidence, mark them `VERIFIED`, set `Execution phase: VERIFYING`, `Next requirement: DONE`, and `Open blockers: none`, then record the current **master** SHA and an actual successful CI run as `sha=<40-hex>; run=https://github.com/owner/repo/actions/runs/<id>`. Structural validation cannot prove that a CI run passed, a research requirement was complete, or that real host acceptance occurred.

The **Agentflow Issue Acceptance** GitHub Actions workflow is invoked manually with an Issue number. It accepts only actual successful CI runs from a `push` to `master`, with the same repository, commit SHA, run ID and required `verify` job; a passing PR run cannot substitute for master CI. It reads GitHub with minimal read-only permissions and fails if the Issue is malformed, a requirement remains unverified, the master SHA changed, the cited CI run failed or belongs to another revision, or the required `verify` job did not succeed. It does **not** close Issues, alter branches, deploy anything or approve releases. Only mark the acceptance gate verified after its actual GitHub workflow has succeeded.

**This is an opt-in evidence check, not mandatory branch protection.** Other repositories do not gain it automatically from installing Agentflow; target repositories need their own verification and administrator-managed required checks/rulesets where necessary. Do not advertise `ACCEPTED` solely because the workflow file exists. Host-installed plugin E2E and semantic completeness still need independent review.

## Host responsibilities

- **ChatGPT Web:** select Agentflow skills, inspect code, reason, author changes, maintain the issue ledger, inspect PRs and evidence.
- **GitHub:** source code, issue/PR persistence, branch history, authorization, and ordinary CI execution.
- **Human user:** authorize repository writes, approve risky operations and releases, and perform required acceptance that the connected tools cannot execute.

The existing GitHub plugin can perform many code/issue/PR operations, but direct GitHub Projects/Milestones CRUD and arbitrary shell access may not be available. Do not suggest that Agentflow silently supplies those tools.

## Acceptance scenarios

1. A new task creates one issue with unique requirement IDs and at least one acceptance check per requirement.
2. A subsequent "next" resumes the same issue/PR and cites its current branch and most recent inspected commit.
3. CI passing while required acceptance evidence is missing produces `IMPLEMENTED_UNVERIFIED`, not `VERIFIED`.
4. GitHub write/CI tools being unavailable produces an explicit blocker rather than fictional logs or a claim of deployment.
5. A user forbidding external executors never causes an API-key request, Codex GitHub Action, or autonomous worker creation.

These are manual host-level acceptance scenarios; documentation alone does not prove that a ChatGPT host performed them. Test the installed plugin and connected GitHub integration before claiming full end-to-end compatibility.
