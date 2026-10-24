---
title: Distribution & discovery
description: Portable skills by default; native host plugins as an alternative.
---

## Choose an installation route

| Goal | Route | Who updates? |
| --- | --- | --- |
| Install a chosen skill for Codex, Claude Code, Gemini CLI, Cursor or OpenCode | Portable `skills` CLI, surfaced on [skills.sh](https://skills.sh/) | User runs `skills check` and `skills update` |
| Install a host-managed bundle | [Native Claude/Codex plugin](/start/native-plugins/) | Host manages refresh according to client settings |

Use **one installation route per AI host**. Do not install the same skill as both a native plugin and an editable file copy on one host.

## Fastest path

Requires Node.js 22.20+ for tested `skills@1.7.4`.

```bash
npx skills@1.7.4 add howlil/agentflow --list
# Select all eleven skills interactively for router + specialists
npx skills@1.7.4 add howlil/agentflow -g -a codex
# Minimal router-only installation
npx skills@1.7.4 add howlil/agentflow --skill agentflow -a codex --copy --yes
```

Installing the router only **does not install** the ten specialists. Install all eleven when you need the router to load any relevant specialist.

## Update and remove

```bash
npx skills@1.7.4 check
npx skills@1.7.4 update -g
npx skills@1.7.4 remove -g howlil/agentflow
```

Updates are **not automatic** for portable copies. Read [installation lifecycle](/start/install/) and [host-specific paths](/start/cross-agent-compatibility/).

## Registry versus source

- [GitHub](https://github.com/howlil/agentflow) is the canonical reviewable skill source.
- [skills.sh](https://skills.sh/howlil/agentflow) is an ecosystem directory and install entry point, not an immutable npm package registry.
- [Agent Skills](https://agentskills.io/specification) defines the portable `SKILL.md` format.
- The generated `/llms.txt` index is optional discovery metadata, not an auto-update service.
- Native plugin manifests are kept in repository root.

The independent installer may temporarily clone source to inspect skills; only selected skill directories are installed. The retired `@howlil/agentflow-cli` package is not required and should not be used for new installations.
