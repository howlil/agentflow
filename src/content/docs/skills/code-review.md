---
title: Code Review
description: Independently inspect concrete implementation risk and verification.
---

`code-review` owns:

> **Does this implementation introduce a meaningful correctness or maintainability risk?**

## Use when

- reviewing a diff or pull request
- validating a risky refactor
- checking whether implementation matches the intended contract
- checking whether verification is faithful and sufficient

## Don't use when

Do not use review as a substitute for making an unresolved product or architecture decision.

## Focus

```text
changed behavior
  ↓
implementation path
  ↓
invariants / failure paths
  ↓
verification evidence
  ↓
actionable findings
```

Prefer concrete, reproducible findings over stylistic preference.

## Try it

```text
Use $code-review on this diff.
Prioritize correctness blockers and missing faithful verification.
```
