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

## Resume a task when the user says "next"

The issue contract and PR are the source of truth, not an assistant's recollection. Locate the active Issue and its latest `Resume pointer`; fetch the branch head, changed files, CI results, and requirement ledger. Start from the first pending or blocked item. Do not create another issue or duplicate PR merely because the conversation changed. Update the Issue's `Resume pointer` and evidence ledger after each bounded edit.

States in the issue's requirement ledger:

| State | Meaning |
| --- | --- |
| `PENDING` | No implementation evidence recorded |
| `IMPLEMENTED_UNVERIFIED` | A code change is present but the acceptance proof is incomplete |
| `VERIFIED` | Actual code and required test/runtime evidence satisfy the acceptance criterion |
| `BLOCKED` | A known failure or unavailable mandatory check prevents completion |

When test execution is not available through GitHub's existing CI, leave `Verification: UNRUN` and never infer a pass. For a Windows-specific feature, Linux CI passing cannot substitute for Windows runtime acceptance. For a multi-file change use commit/PR links and compare their concrete diffs; do not assert a transactional commit if the host only wrote files sequentially.

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
