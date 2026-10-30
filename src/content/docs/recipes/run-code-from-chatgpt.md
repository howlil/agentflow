---
title: Code from ChatGPT Web using GitHub
description: ChatGPT-only engineering execution with one PR per slice, existing CI as evidence, and .agents/ as durable memory.
---

# ChatGPT Web is the AI executor

**No external coding agent, OpenAI API key, custom MCP server, or Agentflow backend is required.**
Agentflow is a skills-only router. ChatGPT Web uses the GitHub connector the user authorized to read files, edit code, and open or update PRs. GitHub Actions runs the repository's existing tests and builds; it never invokes another AI model.

If ChatGPT's GitHub integration does not expose an operation, that operation is unavailable. The plugin cannot grant extra permissions, shell access, or unlimited context.

## Where state lives

| Thing | Source of truth |
| --- | --- |
| Product, architecture, design preferences | `.agents/product.md`, `.agents/engineering.md`, `.agents/DESIGN.md` |
| Work in progress | The open PR for that outcome (description kept current) |
| Proof | CI result for the PR's exact head SHA |
| Multi-session tracking (optional) | A 3-section Issue: Goal · Acceptance · Next |

Chat history is helpful but never the source of truth. A green run on an older SHA does not verify newer code.

## One task

1. **Recover.** Read the relevant `.agents/` file, the open PR for the same outcome, its head SHA, and its latest CI. If the user says "next", continue that PR.
2. **Do.** Reuse the existing branch/PR, or open one branch and one PR for one coherent slice. Trivial or read-only work needs no branch, PR, or Issue.
3. **Prove.** Add automated tests to the existing test command so current CI runs them.
4. **Report** in the PR description: behavior changed, tests added and their PF stage, `CI green @<sha>` / `red @<sha>: <check>` / `not run`, and `Next:` if work remains.
5. **Verify the verdict.** Run `code-review` gates first, then the verdict; a `Block` returns to implement and is reported on the PR.
6. **Merge** only with user approval and an Approve verdict. Merge is not release: `release-engineering` decides the version, lane, changelog, and recovery path.

## What Agentflow will not generate

To keep shipping fast, the router forbids these unless you ask for them explicitly:

- multi-milestone roadmaps (`M1..M5`) or layer-only PR splits for a single feature;
- Playwright/browser E2E tests or new browser test runners for ordinary features that unit/integration tests can prove;
- new CI workflows beyond the stage map (`ci`, `release`, `nightly`), or a job when an existing gate can run the check;
- CI that validates Issues, ledgers, acceptance tables, or doc formatting;
- per-iteration manual QA scripts or acceptance checklists (one manual exploratory and acceptance pass at `release` is allowed);
- plans, summaries, reports, extra ADR files, or `.agents/` files beyond the three above.

When a behavior truly cannot be automated, the PR gets one line: `Not auto-verifiable: <what> — <why>`.

## Host responsibilities

- **ChatGPT Web:** select skills, inspect code, author changes, keep the PR description current, read CI.
- **GitHub:** code, PRs, optional Issues, authorization, ordinary CI.
- **You:** authorize writes, approve merges and releases.
