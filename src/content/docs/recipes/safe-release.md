---
title: Release a verified change safely
description: Match the release strategy to the actual distribution target, compatibility risk, and recovery path.
---

Use [release-engineering](/skills/release-engineering/) when the missing decision is how a verified change reaches its users safely.

1. Inspect the exact candidate revision, existing test evidence, current release, distribution target, and pipeline.
2. Choose the simplest supported release path. Packages need packaging/version checks; services may need rollout and migration sequencing.
3. Define a credible rollback or roll-forward direction before publishing or deploying. Code rollback does not undo data writes.
4. Reuse existing CI and promote the verified artifact where supported. Respect user approval and host permissions.
5. Verify the released version and affected critical behavior at the target boundary. Report missing evidence explicitly.

For a database change, preserve compatibility while old and new versions coexist. Expand, backfill, verify, and contract only when the actual migration risk requires that sequence.

Persist durable release rules in `.agents/engineering.md` under `## Release`, with commands under `## Verification`. Do not generate separate release-plan documents or progress logs.

This is not a general incident-response recipe. Use the project's operational procedures for daily production health and incidents unrelated to a release.
