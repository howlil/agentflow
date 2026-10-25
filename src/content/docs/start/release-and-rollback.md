---
title: Release and rollback
description: Canonical GitHub skills and native plugins, without an npm package release.
---

Agentflow ships portable `SKILL.md` files from GitHub and optional Claude/Codex native plugin manifests. The root `package.json` is private and exists only for static website tooling and native plugin metadata validation. The independent Agentflow npm CLI package is discontinued.

## Publish

1. Prepare a reviewed release PR updating `package.json`, `package-lock.json`, the two native plugin manifests, `CHANGELOG.md`, and the one-line `RELEASE_VERSION` request (for example `v0.4.0`).
2. Run `npm ci`, `npm run plugins:check`, `npm test` and `npm run build`; CI verifies all five portable hosts and both native manifests.
3. Merge that PR into `master` **only after checks pass**. A change to `RELEASE_VERSION` triggers the protected `Publish Agentflow Release` workflow, which checks tag/version equality, changelog entry and reviewed master ancestry.
4. After the workflow passes, the release job creates the immutable `vX.Y.Z` GitHub tag/Release and copies only that version's section from `CHANGELOG.md` into release notes. If the Release already exists, it exits without replacing it.
5. Alternatively, manually dispatch the same workflow on `master` with the matching version, or push a matching annotated tag. All routes run the same checks. No workflow publishes npm packages.

The release workflow also generates, extracts and validates the packaged ChatGPT skills-only ZIP, then attaches the same artifact to its GitHub Release. The asset is for manual developer testing and submission and is **not** an official directory listing or proof of host skill activation.

Never change `RELEASE_VERSION` without a deliberate approved release. Changing it is the publication trigger. On failures, inspect the workflow logs and do **not** claim a release exists until the GitHub Release can be fetched.

GitHub tags provide reviewable fixed snapshots. [Latest releases](https://github.com/howlil/agentflow/releases) and [changelog](https://github.com/howlil/agentflow/blob/master/CHANGELOG.md) are separate from third-party indexing. The ordinary `npx skills add howlil/agentflow` flow follows whichever branch/ref the upstream installer resolves; do not claim default installs are immutable or tag-pinned.

## Update and rollback

```bash
npx skills@1.7.4 check
npx skills@1.7.4 update -g
npx skills@1.7.4 remove -g howlil/agentflow
```

For reproducibility or rollback, use a known immutable Git ref **only when the chosen upstream installer supports and documents the ref syntax**. Native plugins follow host version/refresh policies and may not auto-refresh merely because GitHub has a release.

## npm wrapper retirement

`@howlil/agentflow-cli` is no longer built or published by this repository. Removing its source and workflows does **not** delete public npm registry versions. The npm package owner must separately unpublish or deprecate it under npm policy and revoke retired publishing credentials.

Existing users may uninstall the local wrapper with `npm uninstall -g @howlil/agentflow-cli`; installed skills remain managed by `npx skills`.
