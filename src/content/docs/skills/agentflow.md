---
title: Agentflow router
description: Route unresolved decisions to the chain, keep three files of memory, and bootstrap AGENTS.md.
---

Use Agentflow when the next engineering decision is unclear, multiple disciplines overlap, or you want one slice carried from contract to verdict without ceremony.

**Do not use** the router to add overhead to a deterministic edit or to override an explicitly selected specialist skill.

## What it owns

- **Dispatch & routing:** skips specialists for deterministic edits; selects only the specialist whose decision is unresolved.
- **Chain and handoff:** carries IDs forward (`J/B/X/P` → `R/S/K` → `U/M/ST` → `T/O/FL` → `RK/PF` → `RV` → `RL`) and returns a failed ready gate to its owner instead of passing the gap downstream.
- **Project memory:** keeps `.agents/product.md`, `.agents/engineering.md`, and `.agents/DESIGN.md` edited in place, read selectively by the IDs needed.
- **Project instructions:** creates a root `AGENTS.md` with durable operating rules (commands, verification gate, boundaries) only when it is missing, and points to `.agents/` instead of duplicating it.
- **Factory loop:** enters at the first missing contract, then implements, proves at the right stage, reviews with gates and a verdict, and treats release as a separate decision.
- **Budget:** keeps CI to the stage map (`ci`, `release`, `nightly`), proves acceptance with automated assertions plus one manual pass at release, and blocks ledger or report sprawl.

## Router table

| Unknown decision | Skill | Ready gate |
|---|---|---|
| Product behavior and scope | `product-design` | every B#/X# has a P# |
| Responsibilities, state, structure, guarantees | `engineering-design` | every B#/X# has R→S→flow |
| Interface, interaction, design memory | `design-graph` | every X# has a recoverable V |
| Implementation, failure, policy, lifetime | `design-thinking` | every O/FL/PL traces upstream |
| Proof and stage map | `test-engineering` | every P#/`H` G# has a PF with stage |
| Diff correctness and verdict | `code-review` | gates green, verdict Approve |
| Release decision and recovery | `release-engineering` | verdict clear, stage `merge` green |

## Example

```text
Use agentflow to fix the race condition in booking creation.
Inspect the code and .agents/engineering.md, route only the unresolved
decisions, prove the fix with a targeted test, and give me the verdict.
```

The router consults canonical specialist instructions when installed and accessible. Installing only the router does not install its seven specialists.

Read the [install guide](/start/install/) to install globally or in one project.

**Canonical runtime reference:** [agentflow](/reference/agentflow/)
