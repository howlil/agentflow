---
title: Release and rollback
description: Canonical GitHub skills and native plugins, without an npm package release.
---

Agentflow ships portable `SKILL.md` files from GitHub and optional Claude/Codex native plugin manifests. The root `package.json` is private and exists only for static website tooling and native plugin metadata validation. The independent Agentflow npm CLI package is discontinued.

## Publish

1. Review and merge source to `master`.
2. Bump version in `package.json` and `package-lock.json` for new native plugin releases.
3. Run `npm run plugins:sync`, `npm run plugins:check`, `npm test` and `npm run build`.
4. Create an immutable matching `vX.Y.Z` tag on the reviewed master commit, or dispatch `Publish Agentflow Release` on master.
5. The workflow checks version and ancestry, then creates only a **GitHub Release**. No workflow publishes npm packages.

GitHub tags provide reviewable fixed snapshots. The ordinary `npx skills add howlil/agentflow` flow follows whichever branch/ref the upstream installer resolves; do not claim default installs are immutable or tag-pinned.

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
