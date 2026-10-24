---
title: Agentflow CLI
description: Initialize, diagnose, inspect and manage portable Agentflow skills from one command.
---

Agentflow publishes a small, dependency-free Node.js CLI in `packages/cli`. It is intentionally **not** a second package manager: installer actions delegate to the upstream `skills@1.7.4` command. Node.js **22.20.0 or later** and `npx` are required. `doctor` is offline. Other operations can download the pinned upstream CLI.

## Install the CLI itself

Version `0.3.0` is available in the public npm registry. Install it with Node.js 22.20+:

```bash
npm install -g @howlil/agentflow-cli@0.3.0
agentflow --version
```

Or install from the repository's `master` checkout with `npm install -g ./packages/cli` when developing the CLI.

Alternatively, execute it without global installation using `node packages/cli/bin/agentflow.mjs` from the checkout.

The published package is [`@howlil/agentflow-cli`](https://www.npmjs.com/package/@howlil/agentflow-cli), which is distinct from other packages named `agentflow`.

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

On Windows, the CLI launches npm's `npx-cli.js` through the active `node.exe` with a separate argument array and no command shell. This avoids Node.js `DEP0190` without suppressing deprecation warnings. Standard Node distributions (including fnm installations bundled with npm) contain that entrypoint. If npm is not bundled and its entrypoint cannot be found, install/repair npm rather than enabling a shell fallback. The CLI does not modify PowerShell execution policy or require Administrator privileges.

## Install

```bash
agentflow install --agent codex --skill agentflow
agentflow install --global --agent claude-code --skill design-thinking
agentflow install --global --agent codex --skill code-review --copy
agentflow install --global --agent codex --skill agentflow --yes
```

If no skill selector is given, upstream `skills add howlil/agentflow` offers its native interactive selection. `--yes` must be explicit to suppress confirmation. Native Claude/Codex plugin installs and file-based installations should not be mixed for the same agent and skill.

### Install only the global router (Windows, Codex)

Installing the npm CLI makes the `agentflow` **command** available; it does **not** automatically install the `agentflow` **router skill**. If `agentflow status --global --agent codex` shows specialists but not `agentflow`, use:

```powershell
cd $HOME
agentflow install --global --agent codex --skill agentflow --copy --dry-run
agentflow install --global --agent codex --skill agentflow --copy --yes
agentflow status --global --agent codex
```

Only the named router is selected; other global skills remain untouched. Source ownership checks prevent overwriting a skill recorded as coming from a different repository. These commands operate on the **current machine**, not the GitHub checkout or a connected CI runner. Restart or refresh the host's skill discovery if the router is installed but not immediately offered as an invocation option.

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

The npm package and [GitHub v0.3.0 release](https://github.com/howlil/agentflow/releases/tag/v0.3.0) are public. CI verifies command execution on Windows, macOS and Linux. The dedicated post-release acceptance workflow additionally checks version-pinned GitHub skill files, the public npm executable and protected uninstall. Reinstall-based rollback requires a previous published tag; native host auto-updates remain outside this test. See [release and rollback](/start/release-and-rollback/).
