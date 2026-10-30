---
title: Cross-agent compatibility
description: Tested five-host portable skill installation and limitations.
---

Agentflow delegates distribution to upstream `skills@1.7.4`, never a second package manager.

| Host | `--agent` | Project path | Global path | Native route |
| --- | --- | --- | --- | --- |
| Claude Code | `claude-code` | `.claude/skills/` | `~/.claude/skills/` | Yes |
| Codex | `codex` | `.agents/skills/` | `~/.agents/skills/` | Yes |
| Gemini CLI | `gemini-cli` | `.agents/skills/` | `~/.agents/skills/` | No Agentflow marketplace |
| Cursor | `cursor` | `.agents/skills/` | `~/.agents/skills/` | No Agentflow marketplace |
| OpenCode | `opencode` | `.agents/skills/` | `~/.agents/skills/` | No Agentflow marketplace |

These are the observed paths for the pinned installer, not the only paths supported by those hosts. Alternative locations include `~/.codex/skills/`, `~/.gemini/skills/`, `~/.cursor/skills/`, and `~/.config/opencode/skills/`.

## Testable lifecycle

```bash
npx skills@1.7.4 add howlil/agentflow --list
npx skills@1.7.4 add howlil/agentflow --agent codex
npx skills@1.7.4 add howlil/agentflow --global --agent gemini-cli
npx skills@1.7.4 check
npx skills@1.7.4 update -g
```

Select all eight when you require the router and seven specialists. Router-only installation cannot load unavailable specialist instructions.

CI tests the current checkout for each listed agent ID with a temporary HOME and project. It checks install/list/remove, canonical byte equality, and preservation of unrelated skills and `AGENTS.md`. Native Claude and Codex marketplace metadata are tested separately.

## Tested versions

| Component | Tested value |
| --- | --- |
| Portable installer | `skills@1.7.4` |
| Node.js | 22.23.4 in CI (minimum 22.20 for the installer) |
| Host agent IDs | `claude-code`, `codex`, `gemini-cli`, `cursor`, `opencode` |
| Catalog | the current release tag; eight skills |
| Native manifests | Claude and Codex plugin validation |
| ChatGPT package | extracted ZIP revalidation, not portal acceptance |

A host version outside this list may still work. It is simply not what CI proves.

## Pinning and reproducibility

Installing from `master` follows a moving target. For a reproducible setup:

```bash
# Pin only when your installer version documents ref support
npx skills@1.7.4 add howlil/agentflow@v0.8.0 -g -a codex

# Otherwise record the commit you installed and reinstall from it
npx skills@1.7.4 list -g
```

- Record the installer version, the catalog tag or commit, and the host version in your project notes.
- Verify with `npx skills@1.7.4 list -g`: `agentflow` plus seven specialists, with no removed names.
- Updates are never automatic for portable copies. Run `check`, then `update -g`, and follow [upgrade and migration](/start/upgrade-and-migration/) when names changed.
- Native plugins refresh by host policy and usually need a plugin version bump; ChatGPT plugin updates are manual.

## Out of scope

CI does not authenticate and run real hosted AI sessions, validate every host discovery option, or guarantee activation. Portable skill updates are user-initiated. Native host auto-updates vary. `$agentflow` or slash invocation syntax is **not guaranteed** across every agent.

Choose **one route per host**, native or portable.
