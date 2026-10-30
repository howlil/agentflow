---
title: Product Design
description: Turn unclear product intent into a minimal, testable behavior contract.
---

`product-design` owns:

> **What must the product observably enable and guarantee?**

## Input and output

```text
In:   raw idea / business request / change to an existing product
Out:  .agents/product.md  (J1, B#, X#, C#, Q#, P#, A#)
Next: design-graph (only if interface structure matters) → engineering-design
```

## Use when

- the user problem, job, or scope is unclear
- a feature needs refinement before architecture
- behavior, breaks, or constraints are changing
- the proof of a product outcome is unclear

## Don't use when

Behavior is already explicit and the unresolved question is architecture, interface mechanics, or implementation.

## Model

```text
J1  job and desired outcome
B#  observable behavior edges/states
X#  material breaks the person can hit
C#  constraints that narrow valid behavior
Q#  measurable quality targets
P#  proof: which B/X/Q it covers
A#  assumption, tagged [blocking] or [non-blocking]
```

Ask only when the answer changes J1, B, or scope. Otherwise assume, record `A#`, continue.

## Ready gate

All must hold before `engineering-design`:

- J1 is one sentence and names no mechanism;
- every B# and X# has at least one P#;
- no `[blocking]` A# is open;
- Q is filled, or an A# says it is undefined;
- Out lists anything with real scope-creep risk.

## Try it

```text
Use $product-design to turn "recurring tasks" into a product contract.
Name the job, the observable behavior, the breaks, and the proof.
Do not choose architecture.
```

[Read the complete `product-design` instructions](/reference/product-design/).
