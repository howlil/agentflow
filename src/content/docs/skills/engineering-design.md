---
title: Engineering Design
description: Turn required behavior into the smallest system contract that can guarantee it.
---

`engineering-design` owns:

> **What must the system own, connect, and guarantee for the behavior to remain correct?**

## Input and output

```text
In:   .agents/product.md (J1, B#, X#, C#, Q#, A#) + the existing code
Out:  .agents/engineering.md  (R, S, K, G, F, DEC, D, DEP)
Next: design-thinking
```

## Use when

- state ownership, boundaries, or public contracts change
- consistency, concurrency, storage, or migration rules change
- an external integration is introduced
- availability or latency targets constrain the architecture
- a greenfield system needs its responsibility graph

## Don't use when

The change fits existing ownership and contracts; function-level code belongs to `design-thinking`, tests to `test-engineering`, pipelines to `release-engineering`.

## Model

```text
R    responsibility (written as a capability, not a technology)
S#   state, single owner, invariant, concurrent writers, RPO
K    module and layer structure, public entry points
G#   guarantee as a scenario with SLI, target, and measurement point
F#   fitness rule enforced in CI
DEC  decision with driver, alternative, and consequence
D#   deliberate debt with a trigger to pay
DEP  external dependency with failure behavior and exit cost
```

Default: modular monolith with dependencies pointing toward Logic. Split only with a concrete driver.

## Ready gate

All must hold before `design-thinking`:

- every B# and X# has a path R → S → flow;
- every mutable state has exactly one owner;
- every Q has a G#, or an A# says it is undefined;
- every `H` guarantee has a measurement point and a Challenge row;
- every important boundary has an F# or a stated reason it does not;
- no `[blocking]` A# is open, and no component lacks a trace to R or G.

## Try it

```text
Use $engineering-design to decide how a booking slot stays unique
under concurrent writes. Give me R, S with one owner, the contract,
the fitness rule, and the guarantee with its SLI.
```

[Read the complete `engineering-design` instructions](/reference/engineering-design/).
