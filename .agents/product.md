# Agentflow — Product direction

## Problem
Engineers want coding agents in both local CLIs and ChatGPT Web + GitHub to ship verified changes quickly without memorizing specialist names, maintaining bloated issue ledgers, or losing product, architecture, and design context across sessions.

## Product and modes
Agentflow consists of one portable code-factory router (`agentflow`) and seven specialist skills (`product-design`, `engineering-design`, `design-graph`, `design-thinking`, `test-engineering`, `release-engineering`, `code-review`).

- **CLI mode:** uses local shell and git to run the implement → test → diff-review → gate loop with fast local checks.
- **ChatGPT Web + GitHub mode (optional):** ChatGPT Web is the only AI executor; GitHub owns code, one PR per slice, optional 3-section multi-session Issues, and existing CI.
- **Project memory:** durable project context lives in exactly three compact, edited-in-place files: `.agents/product.md`, `.agents/engineering.md`, and `.agents/DESIGN.md`.

## Journeys
- Portable CLI: task → dispatch gate (act directly if deterministic, route unresolved decisions, or run the factory loop) → verify with existing repo commands → update affected `.agents/*` in place when durable decisions change.
- ChatGPT Web + GitHub: recover from `.agents/*`, active PR, and latest HEAD CI → edit on one reused branch/PR → prove via automated tests in existing CI → report status on the PR description → merge only with user approval.

## Distribution behavior
1. Homepage presents one standard portable installation route using `npx skills` (`skills@1.7.4`).
2. Users may select all nine canonical skills (router + eight specialists) or individual skills.
3. Native Claude/Codex plugins and the skills-only ChatGPT Web ZIP are alternate host distributions, not prerequisites.
4. `@howlil/agentflow-cli` remains retired. Installing skills never grants shell, GitHub, or write permissions.

## Non-goals
No custom npm installer, second registry, Agentflow backend, external AI coding worker, CI workflow bloat, manual QA checklist generation, extra `.agents/` files beyond the canonical three, or mandatory ceremony for trivial edits.

## Proof
- Checkout discovers all nine canonical skills, passes five-host portable lifecycle checks, and validates native Claude/Codex/ChatGPT manifests.
- Static tests enforce the three-file `.agents/` contract, the router chain and budget, and honest host/CI boundaries; real host sessions and marketplace publication remain manual host acceptance.
