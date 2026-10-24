---
title: Cross-agent compatibility
description: Tested installation routes and platform-specific skill discovery for five coding agents.
---

Agentflow follows the portable [Agent Skills](https://agentskills.io/specification) layout and delegates file distribution to the pinned `skills@1.7.4` manager. A single canonical `SKILL.md` source is used across supported hosts. For an editable installation, pick one host ID and choose project or global scope explicitly.

## Supported installation targets

| Host | `--agent` ID | Project location | Global location | Native marketplace alternative |
| --- | --- | --- | --- | --- |
| Claude Code | `claude-code` | `.claude/skills/` | `~/.claude/skills/` | [Yes](/start/native-plugins/) |
| Codex | `codex` | `.agents/skills/` | `~/.agents/skills/` | [Yes](/start/native-plugins/) |
| Gemini CLI | `gemini-cli` | `.agents/skills/` | `~/.agents/skills/` | No native Agentflow marketplace integration |
| Cursor | `cursor` | `.agents/skills/` | `~/.agents/skills/` | No native Agentflow marketplace integration |
| OpenCode | `opencode` | `.agents/skills/` | `~/.agents/skills/` | No native Agentflow marketplace integration |

The **global column describes the materialized path observed from the pinned `skills@1.7.4` installer**, not every directory a host is able to read. For Codex, Gemini CLI, Cursor, and OpenCode, the installer uses the shared `~/.agents/skills/` location. These hosts also expose alternative agent-specific directories (respectively `~/.codex/skills/`, `~/.gemini/skills/`, `~/.cursor/skills/`, and `~/.config/opencode/skills/`). The portable CLI's project/global paths are managed by upstream `skills@1.7.4`; Agentflow must not maintain another independent copy of its lock or installers. Host discovery paths may change in later upstream releases. The matrix CI tests the exact installer version and the publicly published Agentflow npm CLI.

## Install

Requires Node.js 22.20 or newer. Choose an agent identifier from the table:

```bash
npm install -g @howlil/agentflow-cli@0.3.0

# Project-local installation
agentflow install --project --agent gemini-cli --skill agentflow --copy --yes

# Global installation
agentflow install --global --agent cursor --skill agentflow --copy --yes

# Inspect the selected scope
agentflow status --project --agent gemini-cli
agentflow status --global --agent cursor
```

For other hosts replace `gemini-cli` or `cursor` with `claude-code`, `codex`, or `opencode`. The installed skill can be removed with the same explicit scope and agent:

```bash
agentflow uninstall --project --agent gemini-cli --skill agentflow --yes
agentflow uninstall --global --agent cursor --skill agentflow --yes
```

**Do not install both the native Claude/Codex plugin and the portable copy for the same host.** File-based installation is user-initiated and does not guarantee automatic refresh.

## How hosts discover skills

- **Claude Code:** reads `.claude/skills/` and its home-directory equivalent. Native plugin installation is an independent option with its own lifecycle.
- **Codex:** portable skills can live under `.agents/skills/` in a project and `~/.codex/skills/` for global setup; the native plugin marketplace is a separate route.
- **Gemini CLI:** discovers workspace skills under `.agents/skills/` or `.gemini/skills/`, and user skills under `~/.gemini/skills/`. See [Gemini CLI's skills guide](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/using-agent-skills.md).
- **Cursor:** discovers `.agents/skills/` and `.cursor/skills/`; personal skills may need synchronization for remote/cloud agents. See [Cursor Agent Skills](https://cursor.com/docs/skills).
- **OpenCode:** discovers `.agents/skills/`, `.opencode/skills/` and selected compatibility directories. Agent skills are exposed via its skill-loading tool. See [OpenCode skills](https://opencode.ai/docs/skills).

The `$agentflow` syntax is **not guaranteed** to invoke the router in every host; use the host's documented skill selection or request that it load the `agentflow` skill.

## What M6 verifies

GitHub Actions runs a five-agent compatibility matrix on Ubuntu against **the current PR/`master` checkout**: it packs the local CLI, installs canonical skills from the same checkout using `skills@1.7.4`, and verifies their content. A **separate stable-release smoke test** installs the public `@howlil/agentflow-cli@0.3.0` and skill from the immutable `v0.3.0` Git tag. The candidate test uses upstream `skills add/remove` directly because the CLI intentionally installs only from its canonical GitHub source; source-ownership checks are covered by CLI unit tests and the published-release smoke. Each job uses a fresh temporary home and project, then verifies:

1. Project-scope install, discovery/list, the expected skill path and byte-for-byte canonical `SKILL.md`.
2. Source-owned uninstall without deleting an unrelated skill or overwriting `AGENTS.md`.
3. Global-scope install/list/uninstall in an isolated `HOME`, using host-specific paths.
4. The published npm executable's real CLI interface.

Existing CI separately validates native Claude/Codex plugin metadata and marketplace install/uninstall, and checks the CLI on Linux, Windows and macOS.

**Out of scope:** running real interactive AI model sessions, testing logged-in host apps, proving client-specific implicit invocation, cloud synchronization, managed auto-updates, or approving third-party marketplace listings. These require host-specific acceptance rather than file-system compatibility tests.
