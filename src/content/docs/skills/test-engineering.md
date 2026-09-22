---
title: Test Engineering
description: Design faithful executable proof when testing itself is non-trivial.
---

`test-engineering` owns:

> **What is the smallest faithful proof of this meaningful behavior or invariant?**

## Use when

- unit vs integration vs E2E boundary is unclear
- a race must be reproduced
- transaction atomicity matters
- retry or idempotency semantics matter
- migration compatibility must be proven
- async delivery or recovery behavior is hard to test
- the suite is flaky, slow, brittle, or unrepresentative

## Don't use when

An obvious unit test or regression test already proves the behavior faithfully. Write it directly.

## Model

```text
meaningful risk
   ↓
observable invariant
   ↓
faithful boundary/environment
   ↓
controlled stimulus
   ↓
assertion that proves the invariant
```

## Try it

```text
Use $test-engineering to design a race test proving that
two concurrent bookings cannot both commit.
```
