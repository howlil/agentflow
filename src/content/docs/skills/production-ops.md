---
title: Production Ops
description: Model runtime health, actionable events, response, and recovery.
---

`production-ops` owns:

> **How do we know production is healthy, and how do we recover when it is not?**

## Use when

- a service is entering production
- runtime health signals change materially
- monitoring or alerting needs design
- incident response is active
- restore/recovery behavior needs proof
- capacity or operational toil is the problem

## Don't use when

Do not run an operations review for every code change.

## Model

```text
runtime
  ↓
health evidence
  ↓
actionable event
  ↓
safe response
  ↓
recovery
  ↓
recovery verification
```

## Try it

```text
Use $production-ops to define health signals and recovery
for the booking service after the new database dependency.
```
