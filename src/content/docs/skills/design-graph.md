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
UG   UI gate: direction, tokens, anti-generic tells, accessibility, task success
```

Every X# needs a V the person can recover from. UI visibility is never authorization; the trusted boundary enforces it.

## Direction

Two ways in, the same graph: **build** a new surface, or **clean** one that already renders (audit first, then decide how much it needs). A clean run keeps features, content, and section order.

Before composing, five written lines: **product**, **character**, **world**, **moments**, **signature**. `clean`, `modern`, `sleek`, `minimal`, and `premium` describe every template and are refused as character words. Product, character, and world are durable and live in `.agents/DESIGN.md ## Direction`; moments and signature are per surface.

## Craft order

Defects get fixed in one order, one pass across the whole surface at a time:

```text
spacing → color → icons → copy → type → layout → details → visuals → motion
```

Spacing first, because every other value reads differently once the rhythm is right. Copy before type and layout, because headline length decides its size and position. Visuals and motion last, because they must fit a surface that already works without them.

| Reference | Holds |
|---|---|
| `references/direction.md` | the five lines, both entry modes, how much to change |
| `references/craft.md` | the nine passes and what each one changes |
| `references/signs.md` | the audit: tell → fix, by group |
| `references/tokens.md` | starting spacing, ramps, type scale, radius, motion values |
| `references/visuals.md` | whether a surface needs a visual, and how it sits on the page |

These ship inside the skill directory. `references/tokens.md` is a starting point that the direction moves, never a default palette: using it without a direction reproduces the template look the gate rejects.

## Ready gate

All must hold before `design-thinking`:

- every B# has an M, and every M reaches a U;
- every X# has a recoverable V;
- every ST has one owner, and every addressable surface has a route;
- the plan passes the tell checklist and specificity test;
- the five direction lines are written and recorded in `.agents/DESIGN.md`;
- every tell the audit found is fixed or recorded as a non-blocking A#;
- UG is filled, or an A# says it is undefined;
- `.agents/DESIGN.md` exists or is created in this task;
- no `[blocking]` A# is open.

## Try it

```text
Use $design-graph to model the recurring-task editor:
surfaces, moves, state owners, empty/pending/conflict variants,
and the design tokens you will add to .agents/DESIGN.md.
```

```text
Use $design-graph on the existing settings screen:
audit what makes it read as AI-generated, decide how much it needs,
then fix it in craft order without changing its features or content.
```

[Read the complete `design-graph` instructions](/reference/design-graph/).
