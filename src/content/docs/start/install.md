---
title: Install Agentflow
description: Discover, install, update, and remove Agentflow skills in project or global scope.
---

Agentflow publishes portable [Agent Skills](https://agentskills.io/specification) at `skills/<name>/SKILL.md`. Install them with the independent [skills CLI](https://github.com/vercel-labs/skills/blob/main/docs/commands.md), which requires Node.js 22.20 or later.

## Discover available skills

```bash
npx skills@latest add howlil/agentflow --list
```

This previews the router and ten specialists without installing anything.

## Project installation

Run in the target project directory, then select the desired skills and AI agent:

```bash
npx skills@latest add howlil/agentflow
```

## Global installation

```bash
npx skills@latest add howlil/agentflow -g
```

Global installations are usable across projects by the chosen agent. For explicit agent selection, specify a supported identifier such as `-a codex` or `-a claude-code`:

```bash
npx skills@latest add howlil/agentflow --skill agentflow -g
npx skills@latest add howlil/agentflow --skill design-thinking -g
```

Installing the router alone does not install its specialists. Avoid duplicate global and project installations unless intentional.

## Inspect and update

```bash
npx skills@latest list
npx skills@latest list -g
npx skills@latest check
npx skills@latest update       # choose scope
npx skills@latest update -g    # global
npx skills@latest update -p    # project
```

Updates are **not automatic**. The update command updates previously installed skills; re-run `add` when you want to select newly introduced skill names.

## Uninstall

```bash
npx skills@latest remove howlil/agentflow
npx skills@latest remove -g howlil/agentflow
npx skills@latest remove -g agentflow
```

Choose the correct project or global scope and confirm the removal selection. Do not use `--all` unless you also intend to delete unrelated installed skills.

## Compatibility boundaries

- `skills.sh` provides file-based installation; M1 does not include a native Claude, Codex, or Copilot plugin marketplace.
- Skill activation syntax, symlink support, and automatic discovery vary by AI agent. `$agentflow` is not guaranteed to be a native command on every platform.
- The router does not modify the target repository's `AGENTS.md` or other steering files.
- Verify the installed skill with `npx skills@latest list` or `list -g`, then test invocation in the target agent. Cross-agent runtime acceptance must be tested per host.
