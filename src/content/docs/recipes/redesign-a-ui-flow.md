---
title: Redesign a UI flow
description: Separate product behavior from interface behavior during redesign work.
---

## Behavior is unchanged

```text
existing product contract
       ↓
design-graph
       ↓
new surface / move / state model
       ↓
implementation
```

## Behavior is changing

If the redesign changes what the user can accomplish:

```text
product-design
       ↓
updated observable behavior
       ↓
design-graph
       ↓
interface projection
```

Do not hide a product change inside a UI redesign.

## Add engineering only when needed

A visual/layout change does not automatically require `engineering-design`. Use it only if state ownership, public contracts, persistence, consistency, permissions, or integrations change.
