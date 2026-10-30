---
title: Choose a skill
description: Route from the decision that is unclear, not from a memorized skill name.
---

Start with the [agentflow router](/skills/agentflow/) when you want help selecting skills. The router does not impose a mandatory workflow. If the relevant decision is already known, use the specialist table directly.

Start with one question:

> **What decision is blocking correct progress right now?**

| Unresolved decision | Use |
| --- | --- |
| What should the product observably do? | [product-design](/skills/product-design/) |
| What must the system own or guarantee? | [engineering-design](/skills/engineering-design/) |
| How should the interface expose the behavior? | [design-graph](/skills/design-graph/) |
| How should the known contract become code? | [design-thinking](/skills/design-thinking/) |
| How can this behavior be proven faithfully? | [test-engineering](/skills/test-engineering/) |
| How do we version, publish/deploy, and recover this release safely? | [release-engineering](/skills/release-engineering/) |
| Is this implementation correct and maintainable? | [code-review](/skills/code-review/) |
| Did trust, authority, or sensitive data become unsafe? | [code-review](/skills/code-review/) |

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
