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

## Out of scope

CI does not authenticate and run real hosted AI sessions, validate every host discovery option, or guarantee activation. Portable skill updates are user-initiated. Native host auto-updates vary. `$agentflow` or slash invocation syntax is **not guaranteed** across every agent.

Choose **one route per host**, native or portable.
