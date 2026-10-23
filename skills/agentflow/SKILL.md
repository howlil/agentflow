---
name: agentflow
description: Route coding and SDLC tasks to the smallest relevant set of engineering skills by identifying unresolved product, architecture, UI, implementation, verification, security, operations, review, or delegation decisions. Use for task routing, cross-domain engineering audits, and explicit $agentflow orchestration. Skip unnecessary specialist steps for deterministic edits.
---

# Agentflow — Engineering Decision Router

Agentflow routes by **unresolved decision**, not by a mandatory SDLC pipeline. It is a portable skill, not an agent runtime.

## 1. Establish intent and context

1. Respect explicit specialist invocations, such as `$code-review`. Do not override a named skill with an arbitrary workflow.
2. Inspect the relevant code, behavior, tests and documentation; establish facts before selecting specialists.
3. Where available, respect the target project's `AGENTS.md`, `.agents/product.md`, and `.agents/engineering.md`. Never create or overwrite these files merely because Agentflow is installed.
4. If the requested task is deterministic and its implementation is clear, work directly without another skill.

## 2. Ownership router

| Unknown decision | Skill |
| --- | --- |
| Observable product behavior and scope | `product-design` |
| System responsibilities, state, boundaries, and guarantees | `engineering-design` |
| User interface states and interactions | `design-graph` |
| Concrete implementation of an established contract | `design-thinking` |
| Faithful correctness and failure-mode verification | `test-engineering` |
| Production observability, recovery, and incident response | `production-ops` |
| Existing-code correctness and maintainability | `code-review` |
| Trust, authorization, and exposure risks | `security-review` |
| Bounded independent delegation and dependency graph | `graph-protocol` |
| Visualizing an already-understood execution graph | `call-graph-output` |

Use the **smallest relevant subset**. Before following a specialist's workflow, load its canonical `SKILL.md` if accessible. Installing only this router does not automatically install the specialist skills. If a specialist is unavailable, do not invent its full instructions.

## 3. Build the decision graph

```text
user intent + existing evidence
       |
  unknown decisions?
    /          \
   no          yes
   |            |
act directly   select minimal specialist set
                 |
            bounded result/evidence
                 |
             hand off only for new uncertainty
                 |
              verify outcome
```

- Sequential specialists require real dependency edges, not arbitrary ceremony.
- Parallel delegation requires independent owners, bounded contracts, and actual host support.
- Do not equate design documents with implemented code, diagrams with tests, or plans with completion.
- Keep responsibilities within the specialist that owns the decision. Never silently change the user's goal.
- Use available tools to implement and verify requested changes. State unrun checks explicitly.

## 4. Response contract

For complex tasks, briefly describe the decision, selected specialist(s), artifact/evidence, and verification outcome. For simple tasks, omit routing narration.

The host decides the invocation syntax: `$agentflow`, slash commands, and automatic skill selection are **not** portable guarantees. Never assume shell/network access, universal plugin semantics, or a specific AI vendor.
