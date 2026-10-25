# Agentflow — Product direction

## Problem
Engineers should solve concrete engineering decisions without memorizing ten skill names or installing a redundant CLI. In ChatGPT Web, engineering work across conversations can also lose its approved requirements, implementation context, and verification state. Agentflow should reduce this friction without imposing a mandatory SDLC pipeline.

## Product and modes
Agentflow consists of one portable engineering decision router and ten specialist skills. The **portable skill mode** works in supported coding hosts without GitHub access.

An **optional ChatGPT Web + GitHub-only mode** guides the host through inspecting repository evidence, recording the approved contract, editing code with authorized GitHub tools, reviewing changes, reading existing CI results, and resuming unfinished work from GitHub Issues/PRs. ChatGPT Web is the only AI executor in this mode; GitHub is the repository, execution ledger, and ordinary CI provider. The skill cannot supply missing host permissions or run work unattended.

## Journeys
- Portable: task → determine unresolved decision → select router or specialist → use host-provided tools if available → report grounded evidence.
- ChatGPT + GitHub (non-trivial work): inspect repo and existing work → recover/record a bounded contract in an Issue or linked specification → use the existing relevant branch/PR where possible → implement/review with ChatGPT GitHub tools → read CI evidence for the current commit → persist verification gaps and next action. Simple tasks may proceed directly without Issue, branch, or PR ceremony.

## Distribution behavior
1. Homepage presents one standard portable installation route using `npx skills`.
2. User may select all eleven canonical skills (router + specialists) or only named specialists.
3. Native Claude/Codex plugins are a clear alternative, not a second required installation.
4. Portable copies do not auto-update. Native plugin behavior depends on host settings.
5. `@howlil/agentflow-cli` is retired and must not appear as a recommended installation prerequisite.
6. ChatGPT skills-only plugin packaging is a separate host distribution; installation alone does not connect GitHub or grant write access.

## Evidence and state
GitHub owns code, commits, PRs, issue-backed work contracts, and actual CI observations when authorized. A green check on an older commit does not verify the latest code. Research notes or checklists alone never prove implementation. Missing tests, missing connector operations, and unverified host behavior must be reported rather than inferred.

## Non-goals
No custom npm installer, second skill registry, backend, API-key-driven external AI worker, persistent orchestration agent, autonomous background execution, universal activation syntax, duplicated skill instructions, automatic host-update guarantees, or mandatory GitHub setup for portable skill users.

## Acceptance
The current checkout discovers all eleven canonical skills; five-host portable installation tests verify accurate bytes and safe removal, and host-native manifests remain independently validated. ChatGPT mode documents the trust and execution boundaries and preserves requirements and verification state without inventing access. Static checks verify instruction consistency; **real ChatGPT-hosted execution, cross-conversation resume, and publication require separate manual host acceptance**.