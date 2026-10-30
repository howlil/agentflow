---
title: Design Graph
description: Turn known product behavior into an explicit interface graph and a frontend that passes quality gates.
---

`design-graph` owns:

> **How is required product behavior exposed through an interface people can navigate and operate?**

## Input and output

```text
In:   .agents/product.md (J1, B#, X#, P#, Q#)
      + .agents/engineering.md (Structure, F#) + .agents/DESIGN.md
Out:  interface graph in the task or PR (U, M, ST, V, N, UG)
      + .agents/DESIGN.md (durable rules only, near 100 lines)
Next: design-thinking
```

## Use when

A screen, form, dashboard, editor, navigation structure, or interactive component needs explicit surfaces, moves, rendered states, prerequisites, focus, accessibility, or responsive behavior.

## Don't use when

Do not redefine product scope, infer backend architecture from UI convention, or decide code-level patterns.

## Model

```text
U    surface (route if addressable)
M    move, citing the B# it serves
ST   state entry with exactly one owner: server | url | form | ui-local | derived | workflow
V    rendered variant: empty, loading, error, denied, pending, conflict, …
N    prerequisite to enter or use a surface or move
UG   UI gate: tokens, anti-generic tells, accessibility, task success
```

Every X# needs a V the person can recover from. UI visibility is never authorization; the trusted boundary enforces it.

## Ready gate

All must hold before `design-thinking`:

- every B# has an M, and every M reaches a U;
- every X# has a recoverable V;
- every ST has one owner, and every addressable surface has a route;
- the plan passes the tell checklist and specificity test;
- UG is filled, or an A# says it is undefined;
- `.agents/DESIGN.md` exists or is created in this task;
- no `[blocking]` A# is open.

## Try it

```text
Use $design-graph to model the recurring-task editor:
surfaces, moves, state owners, empty/pending/conflict variants,
and the design tokens you will add to .agents/DESIGN.md.
```

[Read the complete `design-graph` instructions](/reference/design-graph/).
