---
title: Build a feature
description: Compose skills for a feature without turning them into a mandatory pipeline.
---

Suppose the request is:

```text
"Add recurring tasks."
```

Do not automatically run every skill.

## Route the unknowns

```text
Is product behavior unclear?
  → yes: product-design

Are ownership / contracts / consistency unclear?
  → yes: engineering-design

Is the user-facing state/flow non-trivial?
  → yes: design-graph

Is the implementation path non-trivial?
  → yes: design-thinking

Is faithful proof itself non-trivial?
  → yes: test-engineering
```

If the existing system already has a scheduling abstraction and the product rules are explicit, skip product and architecture redesign. Use only the remaining relevant skills.
