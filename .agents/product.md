# Agentflow — Product direction

## Problem
Engineers should solve concrete engineering decisions without memorizing ten skill names or installing a redundant CLI. A reusable skill router should narrow uncertainty, not impose a mandatory SDLC pipeline.

## Journey
Task → identify unresolved decision → choose router or specialist → install via portable `skills` CLI (or native host marketplace) → use skill → check/update when needed.

## Distribution behavior
1. Homepage presents one standard portable installation route using `npx skills`.
2. User may select all eleven canonical skills (router + specialists) or only named specialists.
3. Native Claude/Codex plugins are a clear alternative, not a second required installation.
4. Portable copies do not auto-update. Native plugin behavior depends on host settings.
5. `@howlil/agentflow-cli` is retired and must not appear as a recommended installation prerequisite.

## Non-goals
No custom npm installer, second skill registry, backend, persistent orchestration agent, universal activation syntax, duplicated skill instructions, or automatic update guarantees.

## Acceptance
Current checkout discovers all eleven skills. Five-host portable installation tests verify accurate bytes and safe removal, while host-native manifests remain independently validated. Documentation explains the distinction between temporary source clone and installed selected skill folders.
