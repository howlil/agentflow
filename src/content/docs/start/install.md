---
title: Install, update & remove
description: Manage Agentflow through the ecosystem skills installer.
---

Use the external [skills CLI](https://github.com/vercel-labs/skills/blob/main/docs/commands.md), tested with `skills@1.7.4` and Node.js 22.20+. The eight canonical skills live under `skills/<name>/SKILL.md`.

## Discover and install

```bash
npx skills@latest add howlil/agentflow --list
# Interactive project install: select all eight for router + specialists
npx skills@latest add howlil/agentflow
# Global install, selected host
npx skills@latest add howlil/agentflow -g -a codex
# Install one skill
npx skills@latest add howlil/agentflow --skill agentflow -a codex --copy --yes
```

Installing the router alone does not install its specialists. Installing from the project directory is local; `-g` applies globally. Supported host IDs include `codex`, `claude-code`, `gemini-cli`, `cursor`, and `opencode`.

## Inspect and update

```bash
npx skills@latest list
npx skills@latest list -g
npx skills@latest check
npx skills@latest update -g
npx skills@latest update -p
```

Updates are **not automatic**. The upstream installer owns the lockfiles, sources, and update semantics. Review installed source/scope before updating.

A renamed or removed skill is not replaced silently. Follow [upgrade and migration](/start/upgrade-and-migration/) for the removal and reinstall steps, including native plugin and ChatGPT routes.

## Remove

```bash
npx skills@latest remove -g howlil/agentflow
npx skills@latest remove howlil/agentflow
```

Do not choose `--all` unless unrelated skills must also be removed.

## Migration from retired npm wrapper

```bash
npm uninstall -g @howlil/agentflow-cli
```

This uninstalls the discontinued wrapper executable **without removing your installed skill files**. No `.agentflow.json` bootstrap is required. Use `npx skills` for all portable lifecycle operations.

## Limitations

The upstream installer may clone the GitHub repository temporarily to discover skill files. Host-specific materialization paths, symlinks, activation syntax, and refresh semantics vary by AI agent. Native marketplaces are a separate host-managed alternative and must not be installed alongside the same portable skill.
