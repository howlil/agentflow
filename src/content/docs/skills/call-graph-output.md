---
title: Call Graph Output
description: Render an already-understood execution or responsibility relationship clearly.
---

`call-graph-output` owns presentation, not design.

> **Would this known relationship be easier to understand as a graph?**

## Use when

- explaining an execution path
- documenting service/component relationships
- showing production vs test call paths
- rendering a responsibility or delegation trace

## Don't use when

Do not use the graph format to invent architecture or make decisions that have not been established.

## Example

```text
Production:

HTTP handler
  → BookingService.create
    → ConflictPolicy.check
    → BookingRepository.insert

Tests:

BookingService.create
  → real ConflictPolicy
  → test database repository
```
