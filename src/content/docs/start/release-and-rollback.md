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

## npm trusted publishing

The CLI package is `@howlil/agentflow-cli`, independent of the documentation application and the upstream `skills` package. It is **not yet published to npm**.

The npm release job is **opt-in and disabled by default**. To enable it:

1. Claim and bootstrap the package using an authorized, interactive npm account if it does not yet exist on npm. Trusted publisher configuration requires an existing package.
2. Under the package's npm settings, configure a **GitHub Actions trusted publisher** for owner `howlil`, repository `agentflow`, filename `release.yml`. Allow `npm publish`; enable 2FA as required.
3. Confirm the scope, package name, repository URL and workflow identity match. npm requires modern npm CLI and GitHub-hosted Actions for OIDC.
4. Set the GitHub Actions repository variable `AGENTFLOW_NPM_PUBLISH_ENABLED` to the literal string `true` **before a subsequent reviewed release tag**. Without it, the publish job is skipped. This variable is not a credential.
5. Verify the published npm package and provenance after the release. Never store a general-purpose `NPM_TOKEN` in the workflow. Do not force-release `v0.3.0` again after bootstrapping that version.

The first npm publication and initial trusted publisher setup require account-level authorization and are not done by these source changes. GitHub Release and npm publishing are separate jobs.

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
- npm publishing requires registry-owner action and is intentionally disabled until separately authorized.
