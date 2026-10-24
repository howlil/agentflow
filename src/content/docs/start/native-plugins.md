---
title: Native plugins
description: Install and manage Agentflow through Claude Code and Codex marketplaces.
---

Agentflow bundles **one router and ten specialist skills** from a single canonical root. Both plugin manifests use the positioning **“Better judgment for AI agents.”** Native plugins are managed subscriptions: use **either** a native marketplace install **or** the editable [skills.sh installation](/start/install/) for a given agent, not both.

The native marketplace manifests are included in the public default branch and immutable versioned GitHub releases. Managed refresh still depends on each client's configuration.

## Claude Code

The GitHub repository is a Claude plugin marketplace at `.claude-plugin/marketplace.json`. The package is at the repository root and uses `.claude-plugin/plugin.json` plus the canonical `skills/` directory.

From the public repository:

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

Add the public repository as a tracked Codex marketplace:

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

To uninstall the native plugin and manage the marketplace separately:

```bash
codex plugin remove agentflow@agentflow
codex plugin list  # catalog entry remains visible as "not installed"

codex plugin marketplace upgrade agentflow
codex plugin marketplace remove agentflow
```

Removing a marketplace does **not** automatically mean every previously installed plugin was uninstalled. Verify `not installed` in `codex plugin list` before removing the catalog. The repository cannot force client-side updates or installation policies.

## Editable skills for other coding agents

Keep using [skills.sh](/start/install/), e.g. `npx skills@latest add howlil/agentflow -g`. These copies/symlinks have different lifecycle semantics and are not managed by Claude or Codex plugin marketplaces.

## Versioning and publishing

The private root `package.json` owns native plugin release metadata and website versioning; it does not publish a CLI. Native metadata is checked against it. Update the source package version and its lockfile, then synchronize native manifests:

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

## Brand metadata and native releases

The Claude and Codex manifests share one product name and description. Changing these fields in the repository does not itself publish to official directories or refresh installed plugin caches; a native update still requires a reviewed release with a new matching version. The visual assets (logo and social card) belong to the website/GitHub presentation, not to host marketplace API fields unless those schemas explicitly support them.
