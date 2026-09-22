---
title: Security Review
description: Inspect changed trust, authority, sensitive-data, and abuse paths.
---

`security-review` owns:

> **Did this change create an unsafe trust, authority, or sensitive-data path?**

## Use when

- authentication or authorization changes
- new trust boundaries appear
- sensitive data is stored, transmitted, or exposed differently
- user-controlled input reaches a privileged capability
- a security property or abuse path needs independent review

## Don't use when

A security-sensitive subsystem did not change and there is no concrete security question.

## Model

```text
asset / authority
    ↓
trust boundary
    ↓
attacker-controlled input or capability
    ↓
possible violation
    ↓
required security property
    ↓
evidence / mitigation
```

## Try it

```text
Use $security-review on the new admin booking endpoint,
focusing on authorization and cross-tenant data access.
```
