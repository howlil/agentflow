---
title: Agentflow CLI
description: Initialize, diagnose, inspect and manage portable Agentflow skills from one command.
---

M3 introduces a small, dependency-free Node.js CLI in `packages/cli`. It is intentionally **not** a second package manager: installer actions delegate to the upstream `skills@1.7.4` command. Node.js **22.20.0 or later** and `npx` are required. `doctor` is offline. Other operations can download the pinned upstream CLI.

## Install the CLI itself

This package has not yet been published to npm. For now, from a local checkout of the M3 branch:

```bash
git clone https://github.com/howlil/agentflow.git
cd agentflow
git checkout feat/m3-agentflow-cli
npm install -g ./packages/cli
agentflow --version
```

Alternatively, execute it without global installation using `node packages/cli/bin/agentflow.mjs` from the checkout.

The intended package name for a later publish is `@howlil/agentflow-cli`. Do not confuse it with other npm packages named `agentflow`.

## Initialize a project safely

```bash
cd my-project
agentflow init --agent codex
agentflow init --agent codex  # idempotent
agentflow init --agent claude-code  # refuses to overwrite existing config
```

The only file written is `.agentflow.json`, e.g.:

```json
{
  "schemaVersion": 1,
  "source": "howlil/agentflow",
  "agent": "codex"
}
```

`init` never writes `AGENTS.md`, existing `.agents/product.md`, `.agents/engineering.md`, or any installed skill; it does **not** implicitly install skills. The file is created exclusively. On conflicts, manually reconcile the file rather than losing existing settings.

## Diagnose and inspect

```bash
agentflow doctor
agentflow status --project
agentflow status --global
```

`doctor` checks Node version, the presence of `npx`, optional Git/known AI binaries and local config, with no network or filesystem mutations. `status` delegates to the upstream `skills list`, which may fetch the pinned CLI on first invocation. The default agent comes from project config unless overridden explicitly.

## Install

```bash
agentflow install --agent codex --skill agentflow
agentflow install --global --agent claude-code --skill design-thinking
agentflow install --global --agent codex --skill code-review --copy
agentflow install --global --agent codex --skill agentflow --yes
```

If no skill selector is given, upstream `skills add howlil/agentflow` offers its native interactive selection. `--yes` must be explicit to suppress confirmation. Native Claude/Codex plugin installs and file-based installations should not be mixed for the same agent and skill.

## Update

```bash
agentflow update --check
agentflow update --skill agentflow --global
agentflow update --skill code-review --project --yes
```

`agentflow update` without a skill name is intentionally rejected. Updates and uninstalls now require explicit `--global` or `--project`, and Agentflow verifies source ownership against the upstream lockfile before executing. `--check` remains read-only and can show updates from other sources.

## Uninstall

```bash
agentflow uninstall --global --agent codex
agentflow uninstall --skill agentflow --project
agentflow uninstall --global --agent codex --skill design-thinking --yes
```

Before destructive actions, Agentflow reads the upstream project/global lockfile and verifies each selected skill belongs to `howlil/agentflow`. Without `--skill`, it chooses only names owned by Agentflow. A collision, invalid lock, or missing ownership record fails closed. No `--all` option is available.

## Dry run

```bash
agentflow install --global --skill agentflow --dry-run
agentflow uninstall --global --skill agentflow --dry-run
agentflow init --agent codex --dry-run
```

Dry-run displays what would be executed or written and makes no change. Paths and selectors are arguments, never arbitrary shell expressions.

## Release boundaries

Until the CLI package is explicitly published, a registry install such as `npm install -g @howlil/agentflow-cli` must not be presented as available. Node tests and packaging acceptance run in GitHub Actions. Remote tagged update/rollback is a separate release gate. See [release and rollback](/start/release-and-rollback/).
