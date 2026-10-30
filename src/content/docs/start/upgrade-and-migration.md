---
title: Upgrade and migration
description: Move an existing installation to the current skill set, including renames and removals.
---

Agentflow ships portable instructions, so an upgrade is a file and manifest change, not a runtime migration. What you must do depends on the route you installed.

## 1. Identify your route

```text
Portable project install   → .agents/skills/ or .claude/skills/ with a project lockfile
Portable global install    → ~/.agents/skills/ or ~/.claude/skills/
Native Claude/Codex plugin → managed by the host's plugin cache
ChatGPT Web plugin         → installed through the ChatGPT plugin surface
```

Portable installs are updated by you. Native plugins refresh through the host. ChatGPT plugin updates are manual. A merged commit or a GitHub Release never updates an installed copy by itself.

## 2. Portable installs

```bash
# See whether an update exists (exit 1 when any skill is outdated)
npx skills@latest check

# Update global installs (and project installs with -p)
npx skills@latest update -g
```

The installer warns when a skill was deleted upstream and offers to remove the local copy. Accept it, then install the current set if the catalog changed:

```bash
npx skills@latest remove -g <old-skill-name>
npx skills@latest add howlil/agentflow -g -a codex -y --skill '*'
```

A rename may be handled as a relocation or may appear as one removal plus one addition. Check `npx skills@latest list -g` afterwards.

## 3. Migration for this catalog

The catalog moved from eleven skills to eight: one router plus seven specialists.

| Old name | Status | What to do |
| --- | --- | --- |
| `production-ops` | replaced | Remove it and install the current set; release strategy, rollout, and recovery now live in `release-engineering`. Daily operations and incident command are outside the catalog |
| `security-review` | removed | Remove it; trust, authorization, and release-integrity risks are reviewed by `code-review` |
| `graph-protocol` | removed | Remove it; delegation policy lives in the router's `references/delegation.md` |
| `call-graph-output` | removed | Remove it; render a compact graph inline when it helps |

If you installed the router alone, updating does not add the specialists. Install all eight when you want the router to load them.

## 4. Native plugins

Native plugins are cached by version, so a new release must bump the plugin version before the host can see new content.

```bash
# Claude Code
claude plugin marketplace update agentflow
claude plugin update agentflow@agentflow

# Codex
codex plugin marketplace upgrade agentflow
# reinstall only if the host reports the plugin as not installed
codex plugin add agentflow@agentflow
```

Do not run a native plugin and a portable copy of the same skill on one host.

## 5. ChatGPT Web

Download the ZIP attached to the current GitHub Release, validate it, and submit it again through the ChatGPT plugin surface. The installed plugin keeps whatever version it had until that submission is accepted. A release artifact is not an installed update.

## 6. Verify

```bash
npx skills@latest list -g
```

Expected: `agentflow` plus seven specialists, and none of `production-ops`, `security-review`, `graph-protocol`, or `call-graph-output`.

If a stale skill survives, remove it by name. If two routes are installed on one host, remove one; a duplicate copy is a support problem, not a fallback.

## 7. Pin or roll back

Install from a tag or commit only when your installer version supports that ref syntax; otherwise record the commit you installed and reinstall from it. Hosts and marketplaces may cache by version, so a rollback usually means installing the previous version and restarting the host session.

## Deprecation policy

A rename or removal is a breaking change for installed copies:

1. add the new name and keep the old one for at least one minor release, pointing to the replacement;
2. note the change in `CHANGELOG.md` with a migration line;
3. remove the old name only in a release that documents the removal;
4. never reuse a published name for different content.

Report an installation problem through [Issues](https://github.com/howlil/agentflow/issues) with host, route, and `npx skills@latest list -g` output.
