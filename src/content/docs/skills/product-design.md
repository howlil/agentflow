---
title: Product Design
description: Turn unclear product intent into a minimal, testable behavior contract.
---

`product-design` owns:

> **What must the product observably enable and guarantee?**

## Use when

- the user problem is unclear
- a feature idea needs refinement
- behavior or scope is changing
- acceptance outcome is ambiguous

## Don't use when

The product behavior is already explicit and the unresolved question is architecture, interface mechanics, or implementation.

## Model

```text
actor + trigger
   ↓
job / outcome
   ↓
observable behavior
   ↓
meaningful breaks
   ↓
constraints
   ↓
smallest complete scope
   ↓
acceptance proof
```

## Input → output

```text
raw idea / product change / constraints
            ↓
       product-design
            ↓
job + behavior graph + scope + proof
```

## Try it

```text
Use $product-design to define recurring-task behavior.
Keep the scope to the smallest complete user loop.
```

## Common handoff

```text
product-design
  → design-graph when interface structure becomes non-trivial
  → engineering-design when system guarantees need architecture
```
