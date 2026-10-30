---
title: Redesign a UI flow
description: Separate product behavior from interface behavior during redesign work.
---

## Behavior is unchanged

```text
existing product contract (J1, B#, X#, P#)
       ↓
design-graph
       ↓
U / M / ST / V / N
       ↓
design-thinking
```

The product contract does not move. Only the interface graph changes, plus whatever implementation follows from it.

## Behavior is changing

If the redesign changes what the user can accomplish:

```text
product-design
       ↓
updated B# / X# / P#
       ↓
design-graph
       ↓
interface projection
```

Do not hide a product change inside a UI redesign.

## Gates that still apply

- Every `X#` needs a rendered `V` the person can recover from; an error state designed as a toast is not enough if recovery needs a decision.
- Every `ST` has one owner: server, URL, form, ui-local, derived, or workflow. A state with two owners is a defect.
- Addressable surfaces need a route; focus returns somewhere valid after every move.
- `UG` still applies: tokens only, accessibility, task success. Update `.agents/DESIGN.md` only when a durable rule changed.

## Add engineering only when needed

A visual or layout change does not automatically require `engineering-design`. Use it only if state ownership, public contracts, persistence, consistency, permissions, or integrations change.

## Proof

A redesign is proven at the interface level: the `P#` still completes, the `V` states are reachable, and keyboard-only operation still works. Browser E2E is admitted only for a critical journey whose failure cannot be proven lower.
