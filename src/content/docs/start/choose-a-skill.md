---
title: Choose a skill
description: Route from the decision that is unclear, not from a memorized skill name.
---

Start with one question:

> **What decision is blocking correct progress right now?**

| Unresolved decision | Use |
| --- | --- |
| What should the product observably do? | [product-design](/skills/product-design/) |
| What must the system own or guarantee? | [engineering-design](/skills/engineering-design/) |
| How should the interface expose the behavior? | [design-graph](/skills/design-graph/) |
| How should the known contract become code? | [design-thinking](/skills/design-thinking/) |
| How can this behavior be proven faithfully? | [test-engineering](/skills/test-engineering/) |
| How do we know production is healthy and recover it? | [production-ops](/skills/production-ops/) |
| Is this implementation correct and maintainable? | [code-review](/skills/code-review/) |
| Did trust, authority, or sensitive data become unsafe? | [security-review](/skills/security-review/) |
| Would bounded delegation materially improve the work? | [graph-protocol](/skills/graph-protocol/) |
| Is a known relationship easier to understand visually? | [call-graph-output](/skills/call-graph-output/) |

## The important boundary

Do not translate:

```text
large task
→ use every skill
```

Translate:

```text
large task
→ identify independent unresolved decisions
→ use only the skills that own those decisions
```

### Example: new collaborative editor

```text
behavior unclear
→ product-design

ownership + consistency unclear
→ engineering-design

conflict states in UI unclear
→ design-graph

implementation path unclear
→ design-thinking

race/consistency proof unclear
→ test-engineering
```

If product behavior was already decided, skip `product-design`. If the existing architecture already gives clear ownership and contracts, skip `engineering-design`.
