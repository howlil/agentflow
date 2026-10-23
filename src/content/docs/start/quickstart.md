---
title: Quickstart
description: Learn the three ways Agentflow skills are selected and composed.
---

Agentflow provides a router and ten specialist skills so you do **not** need to memorize their names before doing useful work. [Install Agentflow](/start/install/) first.

## 1. Ask the router when the owning decision is unclear

```text
Use agentflow to select the smallest relevant set of engineering skills
for this task, based on the unresolved decisions.
```

Each AI agent controls its own invocation syntax. Installing the router alone does not install its specialists.

## 2. Describe the task

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

## 3. Request a skill explicitly

```text
Use $design-graph to redesign the editor flow.
```

An explicit request selects that lens, but the skill must still respect its boundary.

## 4. Compose skills explicitly

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
