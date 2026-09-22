---
title: Design Thinking
description: Turn a known engineering contract into a focused implementation model.
---

`design-thinking` owns:

> **How should this known behavior and system contract become code?**

## Use when

Implementation reasoning is non-trivial around data shapes, execution order, errors, dependencies, trust boundaries, concurrency, runtime policy, or resource lifecycle.

## Don't use when

Do not reopen settled product or architecture decisions without evidence that they are contradictory or impossible.

## Model

```text
known contract
   ↓
domain/data shapes
   ↓
execution graph
   ↓
errors + dependencies
   ↓
runtime boundaries
   ↓
implementation
   ↓
targeted proof
```

## Try it

```text
Use $design-thinking to implement recurring-task expansion
against the existing scheduling contract.
```

If verification becomes a separate hard problem, hand it to `test-engineering`.
