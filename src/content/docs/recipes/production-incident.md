---
title: Production incident
description: Stabilize production first, then route the underlying engineering uncertainty.
---

For an active incident:

```text
detect
  → assess impact
  → stabilize
  → mitigate
  → verify recovery
```

Use [production-ops](/skills/production-ops/) for that path.

After stabilization:

```text
implementation defect?
→ design-thinking / code-review

trust or authorization issue?
→ security-review

race / transaction / recovery proof is hard?
→ test-engineering

system ownership or guarantee is wrong?
→ engineering-design
```

Do not delay mitigation while users are still affected.
