---
title: Design Graph
description: Turn known product behavior into an explicit interface graph.
---

`design-graph` owns:

> **How is required product behavior exposed through an interface people can navigate and operate?**

## Use when

A screen, form, dashboard, editor, navigation structure, or interactive component needs explicit surfaces, moves, rendered states, prerequisites, focus, accessibility, or responsive behavior.

## Don't use when

Do not redefine product scope or infer backend architecture from UI convention.

## Model

```text
product behavior
      ↓
surfaces
  + user/system moves
  + rendered variants
  + prerequisites
  + interaction semantics
  + environment projection
```

## Try it

```text
Use $design-graph to model the recurring-task editor,
including empty, pending, invalid, and conflict states.
```

Implementation-specific data and execution flow belong to `design-thinking`. If the interface reveals contradictory product behavior, return to `product-design`.
