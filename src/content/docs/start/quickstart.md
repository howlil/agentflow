---
title: Quickstart
description: Learn the three ways Agentflow skills are selected and composed.
---

Agentflow is designed so you do **not** need to memorize ten skills before doing useful work.

## 1. Describe the task

Default mode:

```text
"Fix the race condition in booking creation."
```

The agent should inspect the task and route only the unresolved decisions.

```text
known product behavior
      ↓
implementation concurrency is unclear
      ↓
design-thinking

faithful race reproduction is non-trivial
      ↓
test-engineering
```

The second skill appears only because verification became its own design problem.

## 2. Request a skill explicitly

```text
Use $design-graph to redesign the editor flow.
```

An explicit request selects that lens, but the skill must still respect its boundary.

## 3. Compose skills explicitly

```text
Use $product-design to define recurring-task behavior,
then $design-graph for the interface.
```

```text
product-design
  → owns observable product behavior

design-graph
  → owns how that behavior is exposed in the interface
```

It does **not** mean every task must run through a fixed pipeline.

## When no skill is needed

```text
rename a label
fix an obvious typo
small deterministic refactor
simple regression with an established test pattern
```

If the decision is already obvious, work directly. Skills exist to reduce uncertainty, not add ceremony.
