---
title: Engineering Design
description: Turn required behavior into the smallest system contract that can guarantee it.
---

`engineering-design` owns:

> **What must the system own, connect, and guarantee for the behavior to remain correct?**

## Use when

- state ownership changes
- system boundaries or public contracts change
- consistency or concurrency rules change
- storage or migration strategy changes
- an external integration is introduced
- production guarantees require architecture
- a greenfield system needs its responsibility graph

## Don't use when

The change fits cleanly inside existing ownership and contracts, and only implementation details remain.

## Model

```text
required behavior
      ↓
responsibilities
      ↓
state ownership + invariants
      ↓
boundaries + contracts
      ↓
critical runtime flows
      ↓
material guarantees
      ↓
smallest architecture decisions
```

Technology is chosen **after** responsibilities and guarantees are understood.

## Input → output

```text
product contract + existing system + constraints
                     ↓
             engineering-design
                     ↓
responsibility graph + state ownership + contracts
+ critical flows + guarantees + consequential decisions
```

## Try it

```text
Use $engineering-design to decide how recurring tasks should be
owned, persisted, scheduled, and kept consistent with existing tasks.
```

## Common handoff

```text
engineering-design
  → design-thinking for implementation
  → test-engineering if proof is non-trivial
```
