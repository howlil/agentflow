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

## Trusted Publishing / OIDC migration (M8)

**State after M8:** the workflow supports npm Trusted Publishing, but the default remains the existing `NPM_KEY` token until the package owner completes the external trust setup. M8 itself does **not** republish `v0.3.0`, change the npm package version, or assert that an OIDC publication already succeeded.

### 1. Establish package trust in npm (maintainer action)

Open [npm package settings](https://www.npmjs.com/package/@howlil/agentflow-cli) as an authorized maintainer, navigate to **Trusted Publishers**, and add **GitHub Actions** with:

| npm setting | Exact value |
| --- | --- |
| Organization or user | `howlil` |
| Repository | `agentflow` |
| Workflow filename | `release.yml` |
| Environment | Leave blank (the publish job does not use an environment) |
| Allowed action | **Allow `npm publish`** (not only `npm stage publish`) |

npm requires the repository identity in the package's `repository.url` to match GitHub, a GitHub-hosted runner, Node >=22.14 and npm >=11.5.1. The OIDC job uses Node 24 and npm 11. `workflow_dispatch` initiated by another workflow may affect the identity that npm verifies; for the **first** OIDC release, prefer directly running `Publish Agentflow Release` from GitHub Actions or using a reviewed tag, rather than the separate `Request Agentflow Release` dispatch wrapper. Verify the exact trusted publisher identity when an OIDC release fails.

Because this repository was initially released through a token, the npm owner must configure trust on the **existing** `@howlil/agentflow-cli` package. This configuration cannot be added merely by committing a YAML file. See the [official npm trusted publishing guidance](https://docs.npmjs.com/trusted-publishers/).

### 2. Opt into OIDC only after the npm trust relationship exists

In **GitHub → Settings → Secrets and variables → Actions → Variables**, create the repository variable `AGENTFLOW_NPM_AUTH_MODE` and set its value to `oidc`. The supported modes are:

- **Unset or `token`:** existing token-based publish job is selected, with `NPM_KEY`; it does not receive `id-token: write`.
- **`oidc`:** only the token-free OIDC job runs, receiving `id-token: write` and `contents: read`. No `NPM_KEY`, `NODE_AUTH_TOKEN`, or `npm whoami` is provided to its steps.
- **Any other value:** no publisher is selected. The GitHub Release cannot succeed; this fails closed.

Both publishing paths compare the local npm tarball integrity with any existing public npm version and reject mismatched contents. npm versions are immutable. Under OIDC, the absence of a public registry entry cannot distinguish pending staging from a not-yet-published package: if `npm publish` returns `E409` or registry propagation is delayed, inspect package lifecycle/staging before retrying. OIDC itself cannot approve pending stages.

### 3. Verify the next new release, then retire the static secret

After making a separate reviewed version bump (e.g. `v0.3.1`) and publishing it through the configured OIDC job:

1. Confirm the npm version is publicly installable and that **Remote Skill Release Acceptance** passes.
2. Inspect npm package provenance or attestation metadata for that new version in the npm registry. npm automatically attaches provenance when a public npm package is published by OIDC from a public GitHub repository; earlier `v0.3.0` publication does **not** retroactively acquire that provenance.
3. Verify `AGENTFLOW_NPM_AUTH_MODE` remains `oidc`, then **revoke the old `NPM_KEY` token on npmjs.com and remove the GitHub secret**.
4. In a separate reviewed change, remove the obsolete token-only job and secret-based diagnostic workflow. Do not perform this cleanup before a successful OIDC publication.

The automatic `workflow_run` acceptance still follows a successful release job, regardless of which authentication mode published the version.

## Dependency maintenance and vulnerability visibility

[Dependabot](https://docs.github.com/en/code-security/dependabot) checks npm and GitHub Actions references weekly, with bounded PR limits and grouped minor/patch updates. Updates remain subject to CI and review and must not be merged automatically. The [Dependency Security Audit](https://github.com/howlil/agentflow/actions/workflows/dependency-audit.yml) runs every Monday at **09:15 Asia/Jakarta** and can be invoked manually; it installs the exact lockfile with lifecycle scripts disabled and fails on high or critical npm production dependency advisories.

This audit flags known npm advisories; it is not a substitute for host acceptance, license review, vulnerability triage, or dependency provenance verification. The regular CI still runs `npm ci`, tests and build. No dependency versions are changed in M8.

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
- M8 adds opt-in npm Trusted Publishing/OIDC, Dependabot and a scheduled read-only vulnerability audit. OIDC activation still requires explicit npm owner setup, and the legacy `NPM_KEY` path remains the default until that setup is completed.
