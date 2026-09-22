---
title: Graph Protocol
description: Delegate bounded work when dependencies and parallelism make delegation worthwhile.
---

`graph-protocol` owns:

> **How should useful delegated work be split without losing dependency correctness or write ownership?**

## Use when

Delegation has a concrete advantage through independent work, specialization, context isolation, parallel execution, or separate verification.

## Don't use when

Task size alone is not a reason to delegate.

## Model

```text
outcome
  ↓
bounded nodes
  ↓
real dependencies
  ↓
parallelize independent nodes
  ↓
serialize overlapping decisions/writes
  ↓
primary agent verifies integration
```

## Try it

```text
Use $graph-protocol to split repository research,
implementation, and independent verification where they are actually independent.
```
