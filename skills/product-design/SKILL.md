---
name: product-design
description: Turn a raw idea, business request, client need, or change to an existing product into a minimal testable product contract (job, behavior, scope, constraints, proof) before any engineering design or code. Use this whenever the user describes an app, feature, workflow, side project, or business problem to build or change, asks what to build, how to scope an MVP, or to refine or review requirements, even if they never say "product" or "PRD". Output is `.agents/product.md`. Does not choose architecture or implementation; hands off to `design-graph` (only if UI structure needs modeling) and then `engineering-design`.
---

# Product Design

A product is a behavior graph from a real trigger to a useful outcome. Keep only what the outcome requires. If a behavior does not trace to J or P, cut it.

```text
Idea → Graph → Product<J, B, P>
                       │  │  └─ proof the outcome is reached   (§7)
                       │  └──── observable behavior            (§3)
                       └─────── job and desired outcome        (§2)

In:   raw idea | business request | change to existing product
Out:  .agents/product.md          (§10)
Next: design-graph (only if UI) → engineering-design
```

## IDs

Every node gets an ID. Downstream skills cite these instead of restating them.

```text
J1  job          B1..  behavior edge/state     X1..  break/failure
C1..  constraint   Q1..  quality bar            P1..  proof (cites the B/X/Q it covers)
A1..  assumption, tagged [blocking] or [non-blocking]
```

## 1. Context

Name only what changes a product decision.

- **Actor**: who is trying to get something done. No invented personas. For a personal project, the actor is the user.
- **Acceptor**: who decides it is done, if not the actor (client, stakeholder).
- **Trigger**: what causes the need now.
- **Current behavior**: how the job is done today.
- **Problem**: what blocks, slows, or complicates the outcome.
- **Evidence**: observed facts, user-provided facts, existing product behavior. Everything else is an assumption (A#).

If the input starts as a feature, back up to the job. Judge whether the feature is needed.

If the product already exists, read its current behavior first (repo, docs, UI) and treat that as evidence. Model only the changed subgraph plus the states it connects to.

**Ask or assume.** Ask only when the answer would change J, B, or scope, max 3 questions per round. Otherwise assume, record A#, and continue. An A# that would change J, B, or scope if wrong is `[blocking]`.

## 2. J: job and outcome

```text
J1: When <situation>, I want <motivation>, so I can <outcome>.
```

Describe the result, not the mechanism. The product may change; the job should not.

```text
Bad:  User needs an AI dashboard.
Good: J1: After a work session, I want to reconstruct where my computer time went, so I can report it without logging manually.
```

Add engagement, retention, automation, or AI as goals only if they are part of the actual problem or a stated constraint.

## 3. B: behavior graph

Draw the smallest successful path. Nodes are meaningful product states; edges are observable user or system moves.

```text
Need exists --user acts--> product responds --> new state --> ... --> J1 done
```

Each edge answers: what does the user do, what does the product do, what is true next. Describe behavior only. No database, API, queue, framework, component, or deployment terms.

## 4. X: material breaks

Add only breaks that change what the user experiences or what the product must guarantee.

```text
Action
 ├─ valid   → expected result
 ├─ invalid → recoverable state        (X1)
 └─ denied  → unavailable path         (X2)
```

Typical: missing input, nothing exists yet, permission denied, interrupted operation, conflicting action, result unavailable, destructive action needing confirmation. Skip theoretical cases that change nothing.

## 5. C and Q: constraints and quality bar

**C**: facts that narrow valid behavior (offline, data stays local, specific role, existing workflow, platform, legal/privacy). A preference is not a constraint.

**Q**: measurable quality targets (availability, latency, scale, data sensitivity, accessibility). Record only targets that are stated or marked as assumption. If a target would change the design and nothing is stated, ask (§1) or record `A#: Q undefined [blocking|non-blocking]`. Never invent numbers, market facts, user behavior, or business targets; research them or record them as assumptions.

## 6. Scope

Scope is the minimum graph from trigger to outcome with no broken path. For every capability or branch: does removing it prevent J1 from completing correctly? If no, cut or defer.

- Greenfield: the smallest coherent product loop.
- Existing product: only what is added, changed, or removed.
- Keep an Out item only when it prevents an obvious misunderstanding. No backlog in the contract.

## 7. P: proof

Every B, X, and Q needs observable proof, stated as what must be true, not how to build it.

```text
P1 (B1-B3): Given <state>, when <action>, then <observable outcome>.
P2 (X1):    Given <state>, when <invalid action>, then <recoverable state>.
P3 (Q1):    <measurable condition under stated load/conditions>.
```

Use product metrics only when measurement is part of the decision.

## 8. Ready gate

The contract is ready for `engineering-design` only if all hold:

- J1 is one sentence and names no mechanism.
- Every B and X has at least one P.
- No `[blocking]` assumption is open.
- Q is filled, or an A# states it is undefined.
- Out lists anything with real scope-creep risk.

If a check fails, fix the contract. Do not pass the gap downstream.

## 9. Handoff

- `engineering-design` consumes J, B, X, C, Q, Scope, P, and open A#.
- `design-graph` (only when interface structure needs explicit modeling) consumes J, B, C, P and owns surfaces, moves between them, content/void states, focus, and responsive behavior. If modeling it exposes a contradiction in B, fix B here.

## 10. Persist

Write or update `.agents/product.md`. No separate PRD, requirements, journey, or strategy docs unless asked.

If it exists: read it first, preserve valid decisions, update only the affected subgraph, remove contradictions the change creates, leave unrelated context alone. Edit in place and keep it near 150 lines by condensing, not by adding files.

```markdown
# Product

## Problem
Actor / Acceptor / Trigger / Problem:
J1: When ..., I want ..., so I can ...

## Behavior
B1 → B2 → B3 → J1 done
X1 (at B2): ...

## Constraints
C1: ...
Q1: ...

## Scope
In: ...
Out: ...

## Proof
P1 (B1-B3): Given ..., when ..., then ...

## Assumptions
A1 [blocking]: ...
```

Omit empty sections. This file is project memory, not a form to fill.