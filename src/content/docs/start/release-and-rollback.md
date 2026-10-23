---
title: Release and rollback
description: Safe publishing, compatibility acceptance and downgrade process for Agentflow.
---

## Release topology

The source of truth is `skills/<name>/SKILL.md`. M1 adds universal skills; M2 adds Claude/Codex native plugin catalogs; M3 adds the standalone Node.js CLI. M4 validates source ownership before destructive lifecycle commands, release packaging, and remote distribution acceptance.

**Merge order:** [M1 PR #5](https://github.com/howlil/agentflow/pull/5) → [M2 PR #6](https://github.com/howlil/agentflow/pull/6) → [M3 PR #7](https://github.com/howlil/agentflow/pull/7) → M4. Retarget stacked PRs to `master` after each base merges, rerun CI, and review the resulting diffs. Never merge a dependent PR directly onto `master` while its base is still unmerged.

## Prepare a release

The root package and native plugin/CLI manifests must share one version:

```bash
npm version patch --no-git-tag-version
npm run plugins:sync
npm run plugins:check
npm test
npm run build
npm pack --dry-run ./packages/cli
```

Review the source diff, check that `npm pack` contains only the CLI executable, implementation, readme, license and package manifest, then merge to `master`. M4 uses `0.3.0` as its initial target: do not bump again or publish until merged compatibility acceptance is complete.

After the final merge commit is on `master` and checks are green, create the *matching* immutable tag:

```bash
git checkout master
git pull --ff-only
git tag v0.3.0
git push origin v0.3.0
```

`release.yml` rejects a tag that is not reachable from `master` or does not equal `package.json` version. GitHub release notes are created only after verification.

## Automated npm publication with GitHub secret NPM_KEY

The CLI package is `@howlil/agentflow-cli`. GitHub Actions will publish it automatically when a reviewed version tag is pushed, or when the operator starts **Publish Agentflow Release** from the Actions tab using the matching version. There is no separate `AGENTFLOW_NPM_PUBLISH_ENABLED` variable.

Configure an npm **granular access token** in the repository Actions secret named exactly `NPM_KEY`. It must be authorized for the `@howlil` scope/package and have **Read and write (publish and stage)** access, **Bypass 2FA** for unattended direct publishing, and must not have expired. npm user identity must own the `@howlil` namespace. When package-level policy forbids access tokens, use npm trusted publishing (OIDC) instead; this token-based workflow cannot override npm security policies.

### One-click release (no terminal tag required)

1. Merge and verify reviewed code on `master`; update all manifests consistently with `npm run plugins:sync`.
2. In GitHub: **Actions → Publish Agentflow Release → Run workflow**. Select **master** and enter the matching version, e.g. `v0.3.0`.
3. The workflow verifies the commit is the latest `master`, validates root/CLI/plugin version parity, runs full tests and build, packs the CLI and checks the executable.
4. The workflow compares the package tarball integrity with any existing npm version. It publishes only if that version does not exist. It **refuses** to accept an existing version containing different bytes.
5. A successful npm publish is checked against the public registry. **Only then** the workflow creates a GitHub Release and version tag pointing at the verified commit.

You can still create and push the matching tag manually; the `push.tags` workflow path performs the same release validation and npm publication, then creates GitHub Release notes. Do not use both triggers for the same version concurrently. A `workflow_dispatch` tag created with `GITHUB_TOKEN` does not trigger a second workflow run.

The npm package is public (`--access public`) and includes only the standalone CLI. The root Astro site is private in npm terms and never published.

### Authentication limitations and future upgrade

The `NPM_KEY` token is used **only by the npm publish step** through the `NODE_AUTH_TOKEN` environment variable. No secret value is committed or displayed. The build/test jobs do not receive it. A missing/invalid token causes the npm publish step to fail without creating a GitHub Release.

Current npm policy requires a suitable granular token with bypass 2FA for CI direct publication. npm has announced a planned end to direct publication with bypass-2FA tokens in **January 2027**. Plan to migrate this job to **npm Trusted Publishing / OIDC**, which avoids static registry secrets. Under OIDC configure owner `howlil`, repo `agentflow`, workflow `release.yml`, with `id-token: write`; do not simultaneously rely on `NPM_KEY`. The initial npm package may need registry-owner setup to claim the desired name/scope.

## Manual remote acceptance

`remote-acceptance.yml` is an **on-demand** workflow on GitHub Actions; it cannot run until the workflow is on the default branch and a release tag exists.

From **Actions → Remote Skill Release Acceptance → Run workflow**, supply `release_ref` (e.g. `v0.3.0`). Optionally supply `previous_ref` to exercise older-version install, upgrade, and rollback. The job validates tag existence and master ancestry, then uses the pinned `skills@1.7.4` CLI to:

1. Install the previous version if provided, compare installed `SKILL.md` bytes with the tagged version.
2. Remove the old version, install the release tag, verify canonical skill file content.
3. If requested, remove the release and install the previous tagged version, byte-compare again.
4. Uninstall and verify that the skill file is absent.

This exercises version-specific *file distribution*, not managed plugin auto-update inside Claude or Codex applications. Complete a separate real-client acceptance test before claiming managed host auto-update.

## Recovery and rollback

**Project/global file skills:** install from an immutable, previously verified tag using the external installer:

```bash
npx skills@1.7.4 remove agentflow -a codex
npx skills@1.7.4 add 'howlil/agentflow#v0.2.0' --skill agentflow -a codex --copy
```

The version shown here is an *illustrative previous tag*, not a claim that `v0.2.0` currently exists. Use a tag returned by `git tag -l 'v*'` after release. Check source ownership and the installed `SKILL.md` content before removing any existing skill.

**Native plugins:** do not rewrite release tags or force-push history. Restore known-good skill content in a new reviewed patch release, bump the manifests, publish a new tag and refresh the host's marketplace. Availability of pinning and managed downgrade depends on the individual host.

**npm package:** npm versions are immutable. Recover by publishing a new patch with known-good behavior after review; do not unpublish a version other users might depend on.

## Limits and gates

- `agentflow update` or `uninstall` with unknown/foreign sources fails closed. These mutations require an explicit project/global scope. Ownership is read from the upstream `skills-lock.json` / global `.skill-lock.json`, and isn't asserted for manually copied skill folders lacking lock metadata.
- This check prevents known cross-source name collisions, but does not create transactional locking against other concurrent package managers.
- CLI packaging/unit/diagnostic tests run on Linux, Windows, macOS. Remote tagged installation and real desktop host activation remain post-merge release checks.
- npm publishing is enabled on version-tag and explicit release dispatch events, but requires a valid NPM_KEY and a released package version; initial namespace ownership and token privileges cannot be verified from repository source alone.
