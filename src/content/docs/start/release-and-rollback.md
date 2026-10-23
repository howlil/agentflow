---
title: Release and rollback
description: Verified public releases, tagged installer acceptance, and safe rollback.
---

## Published distribution

**Current published release: [v0.3.0](https://github.com/howlil/agentflow/releases/tag/v0.3.0).** The public npm package is [`@howlil/agentflow-cli`](https://www.npmjs.com/package/@howlil/agentflow-cli).

```bash
npm install -g @howlil/agentflow-cli@0.3.0
agentflow --version
agentflow doctor
agentflow install --global --agent codex --skill agentflow
```

The canonical runtime source is `skills/<name>/SKILL.md`; native Claude and Codex plugin manifests point to the same repository skills. npm distributes the thin CLI only, not a separate skills runtime.

## Before making a new release

The version is owned by root `package.json` and must match `packages/cli/package.json`, the package lockfile, and both native plugin manifests.

```bash
npm version patch --no-git-tag-version
npm run plugins:sync
npm run plugins:check
npm test
npm run build
npm pack --dry-run ./packages/cli
```

Commit the synchronized version/lockfile changes, submit a PR, and merge **only after CI passes**. Then open **Actions → Publish Agentflow Release → Run workflow**, select `master`, and enter the matching *new* tag (e.g. `v0.3.1` once that version is reviewed). Alternatively push a matching new immutable `vX.Y.Z` tag. **Never reuse `v0.3.0` for new source changes.**

`release.yml` checks that the requested tag/version matches the reviewed commit on `master`; it verifies the native metadata, tests and npm tarball, checks public npm artifact integrity, publishes new versions using the scoped `NPM_KEY` secret, and creates GitHub Release only after npm success. A previously published identical package is not republished; differing bytes fail the release.

The initial publish may require npm registry processing before the package appears publicly. A successful `npm publish` followed by public-registry `E404` does **not by itself** establish that owner approval is pending. Check `npm stage list` and the authenticated version lifecycle endpoint before taking any action. Do not retry publishing an already staged version: npm may reject it with `E409`. Never expose `NPM_KEY` in logs.

## Post-release acceptance (M5)

[Remote Skill Release Acceptance](https://github.com/howlil/agentflow/actions/workflows/remote-acceptance.yml) now supports two entry points:

- **Automatic**: a successful `Publish Agentflow Release` workflow triggers the `workflow_run` acceptance job. The job resolves the release tag from the completed workflow commit and checks that the published GitHub tag matches it.
- **Manual**: in the Actions tab select `Remote Skill Release Acceptance → Run workflow`, enter a published `release_ref` such as `v0.3.0`, and optionally a different, earlier published `previous_ref`.

The acceptance runs in a disposable workspace and checks:

1. The exact version exists in the public npm registry; installing that npm package provides the executable `agentflow` command with the expected version.
2. The requested immutable Git tag exists in `master` history and has a published GitHub Release, never just a branch or draft.
3. The pinned `skills@1.7.4` installer can install the canonical `agentflow` skill from `howlil/agentflow#<tag>`. Installed `SKILL.md` bytes must match the *tagged* GitHub source.
4. The published CLI can uninstall the installed project skill with source-ownership checks, leaving no skill file behind.
5. If `previous_ref` is supplied, it additionally installs that earlier published release, replaces it with the target release, then reinstalls the earlier version to test **tag-to-tag downgrade by reinstall**.

The first published release `v0.3.0` has no earlier published Agentflow tag in this repository; skip `previous_ref` until a later release exists. This workflow does **not** establish automated in-place updates in Claude Code, Codex, or any other host; managed client refresh is separately owned by those applications.

CI also includes a pinned `v0.3.0` public-release smoke test to prove the first npm release and skill installation are functional without a new tag or npm publication.

## Recovery

If a new release is bad, do not rewrite Git tags, unpublish an in-use npm version, or push files into another repository's steering configuration.

For portable files, use a known-good immutable tag and select a deliberate agent/scope:

```bash
npx skills@1.7.4 add 'howlil/agentflow#v0.3.0' --skill agentflow --agent codex --copy
```

When replacing an installed skill, verify the lockfile source owner before uninstalling; the Agentflow CLI refuses to delete skills owned by other repositories. To recover the npm CLI itself, install an explicitly versioned public package, e.g. `npm install -g @howlil/agentflow-cli@0.3.0`. Native plugin host rollback may require a separate client-specific action or a new reviewed patch release.

## Scope limits

- Tests are run on Linux, macOS, and Windows for CLI portability. Automated tagged release acceptance currently runs on GitHub-hosted Ubuntu.
- Host-managed background updates, third-party marketplace listing approvals and desktop acceptance remain distinct from this milestone.
- The root Astro docs app is not an npm package; publishing the CLI does not redeploy a runtime server.
- Prefer token-free npm Trusted Publishing / OIDC in a future release-hardening milestone. The existing `NPM_KEY` publishing path remains in place for this maintenance-only milestone.
