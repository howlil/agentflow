---
title: Release Engineering
description: Decide whether to release, pick a version and lane, and carry the verified change out with a way back.
---

`release-engineering` owns:

> **Should this ship now, as which version and lane, and how do we recover if it is wrong?**

## Input and output

```text
In:   code-review verdict · test-engineering PF at stage release + stage map
      · engineering.md (G#, compat, F#, D#, ## Release) · product.md (distribution scope)
Out:  version + tag or artifact identity + CHANGELOG section + release evidence
      + durable policy in .agents/engineering.md (## Release)
Next: project operations (outside this catalog)
```

## Use when

Releasing, publishing, deploying, tagging, bumping a version, cutting a beta or rc, writing a changelog, setting up release CI, or rolling back — including "naikin versi" or "rilis".

## Don't use when

The question is daily monitoring, on-call, incident command, or capacity planning. A merge alone is not a release.

## Model

```text
RL   a release: version, lane, source SHA, artifact identity
```

| Decision | Rule |
|---|---|
| Release or not | a merge is not a release; batch changes and ship when gates are green |
| Version | SemVer for a declared public API; otherwise SHA or build identity |
| Lane | `alpha` (skip by default), `beta` for risky/minor+major, `rc` optional, stable after validation |
| Changelog | one `CHANGELOG.md`; breaking changes first with migration steps |
| Pipeline | at most `ci`, `release`, `nightly`; build once, promote the same artifact |
| Recovery | rollback, roll-forward, or restore — decided before shipping |

Rolling back code does not undo data writes, notifications, or a published package. Prefer expand → migrate → verify → contract for stateful changes.

## Ready gate

All must hold before shipping:

- verdict is Approve or Approve with Minor, with no open Critical or Major;
- stage `merge` is green and stage `release` PF pass;
- the compat rule and the recovery path are decided;
- signals and burn-rate alerts exist for `H` guarantees, and the error budget is not exhausted;
- version, lane, and CHANGELOG section are ready, and authorization exists;
- no `[blocking]` A# is open.

## Try it

```text
Use $release-engineering to ship this booking change.
The new column must become required without breaking older versions.
Decide the lane, the changelog entry, the rollout order, and the way back.
```

[Read the complete `release-engineering` instructions](/reference/release-engineering/).
