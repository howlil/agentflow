---
title: Agentflow execution MVP
description: GitHub issue contracts and an opt-in coding worker
---

# Run Agentflow coding requests

This M0-M1 implementation keeps Agentflow's eleven skills unchanged. It adds an opt-in GitHub Actions reference workflow scoped to the agentflow repository, not a new MCP service.

## Setup

- Merge the reviewed runner into the default branch.
- Configure two GitHub Actions secrets: `OPENAI_API_KEY` for Codex and `AGENTFLOW_BOT_TOKEN` for publishing draft pull requests. The latter needs Contents and Pull requests write permission, scoped to this repository. API usage is billed separately.
- Enable GitHub Actions pull request creation and add the issue label `agentflow:run`.
- Create an open GitHub issue authored by the repository owner using the Agentflow execution issue template, with distinct requirement IDs and acceptance criteria.
- Apply the label in a separate action or manually dispatch the workflow using the issue number.

ChatGPT's GitHub connector can create and label issues. It cannot currently dispatch this workflow directly. If its issue author appears as an integration bot instead of the repository owner, validation refuses execution; create an owner-authored issue using GitHub UI instead.

## What happens

The workflow validates the issue contract and owner, executes Codex in a restricted workspace, runs the repository's fixed Node test and build commands, and captures a candidate patch. A separate publisher verifies protected-file exclusions and opens a draft PR. No generated code runs in the publishing job.

A draft PR is **not** proof that every requirement is satisfied. Independently review acceptance evidence and target-platform behavior before merging. Workflows may fail without correct secrets or permissions.

M2 evidence tracking, M3 durable run state, and M4 custom MCP orchestration remain future work.
