---
title: Native plugins
description: Install and manage Agentflow through Claude Code and Codex marketplaces.
---

Agentflow bundles **one root set of eleven canonical skills** for two native plugin hosts. Native plugins are managed subscriptions: use **either** a native marketplace install **or** the editable [skills.sh installation](/start/install/) for a given agent, not both.

All native routes below require the M2 manifests to be present on the selected Git ref. If M2 has not reached the default branch, inspect or test a local checkout of the M2 branch instead of assuming that the commands from the default branch will install this release.

## Claude Code

The GitHub repository is a Claude plugin marketplace at `.claude-plugin/marketplace.json`. The package is at the repository root and uses `.claude-plugin/plugin.json` plus the canonical `skills/` directory.

After M2 merges into the public default branch:

```bash
claude plugin marketplace add howlil/agentflow
claude plugin install agentflow@agentflow
claude plugin list
```

Within Claude Code, invoke a bundled skill by its plugin-qualified command, for example `/agentflow:agentflow` or `/agentflow:code-review`. The model may also discover relevant skills automatically; skill invocation still follows host behavior.

To refresh manually or uninstall:

```bash
claude plugin marketplace update agentflow
claude plugin update agentflow@agentflow
claude plugin uninstall agentflow@agentflow
```

Claude Code has optional automatic plugin updates; whether they run depends on the user's configuration and the marketplace/source. **Bumping the native plugin version is required to distribute new content** when the plugin version is the update cache key. A commit alone with an unchanged version must not be called a new release.

Validate the package and marketplace locally with Claude's official CLI:

```bash
claude plugin validate .
claude plugin validate . --strict
```

## Codex / ChatGPT desktop

Codex discovers the [portable Agent Plugins](https://developers.openai.com/plugins/build/plugins) `plugin.json` in this repository root. The curated source is `.agents/plugins/marketplace.json`.

After M2 merges, add the GitHub repository as a tracked Codex marketplace:

```bash
codex plugin marketplace add howlil/agentflow
codex plugin marketplace list
```

Install with the Codex CLI (verified in CI):

```bash
codex plugin add agentflow@agentflow
codex plugin list
```

Alternatively, in a supported Codex or ChatGPT desktop client, open the Plugins Directory and install **agentflow** from the **Agentflow Engineering** source.

To refresh or remove marketplace configuration:

```bash
codex plugin marketplace upgrade agentflow
codex plugin marketplace remove agentflow
```

Removing a marketplace does **not** automatically mean every previously installed plugin was uninstalled; use the host's plugin management UI to manage the individual plugin. The repository itself cannot force client-side updates or installation policies.

## Editable skills for other coding agents

Keep using [skills.sh](/start/install/), e.g. `npx skills@latest add howlil/agentflow -g`. These copies/symlinks have different lifecycle semantics and are not managed by Claude or Codex plugin marketplaces.

## Versioning and publishing

`package.json` owns the released version; native metadata is checked against it. Update the source package version and its lockfile, then synchronize native manifests:

```bash
npm version patch --no-git-tag-version
npm run plugins:sync
npm run plugins:check
npm test
npm run build
```

Review the diff and merge in the normal order. Once the release commit is on `master`, create and push the matching `vX.Y.Z` tag:

```bash
git checkout master
git pull --ff-only
git tag vX.Y.Z
git push origin vX.Y.Z
```

The GitHub Release workflow checks that the tag equals the package version, is reachable from `master`, and passes the test/build suite before publishing release notes. Only tag an already-reviewed commit, and never reuse or force-update release tags.

**Publishing a GitHub release is not publication into Anthropic's official plugin directory or OpenAI's public Plugins Directory.** Those require separate review/submission. Managed updates depend on each installed client's marketplace configuration and refresh policy.
