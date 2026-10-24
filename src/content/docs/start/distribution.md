---
title: Distribution & discovery
description: Choose the right Agentflow installation path in under one minute.
---

Agentflow contains **11 portable engineering skills**: the `agentflow` router and 10 specialists. Choose **one installation route per AI host**. The three routes below distribute the same canonical `skills/<name>/SKILL.md` content; the npm CLI is only a thin adapter to the upstream installer.

## Choose an installation route

| Goal | Recommended route | Who manages updates? |
| --- | --- | --- |
| Preview or install individual skills for Claude Code, Codex, Gemini CLI, Cursor or OpenCode | Portable `skills@1.7.4` | You, using `skills check` and `skills update` |
| Install as a native Claude Code or Codex plugin | [Native marketplace](/start/native-plugins/) | The respective AI host |
| Prefer a single `agentflow` command with safe project bootstrap and source-scoped uninstall | [npm CLI](/start/cli/) | npm for the CLI; pinned skills manager for the skills |

**Do not install both the native plugin and portable skill files for the same agent.** The available `$skill` or slash command invocation syntax differs by host.

## Fastest path: preview and install one skill

Node.js 22.20.0 or later is required.

```bash
# Preview the router and 10 specialist skills without installing
npx skills@1.7.4 add howlil/agentflow --list

# Install the router in the current project for Codex
npx skills@1.7.4 add howlil/agentflow --skill agentflow --agent codex --copy --yes

# Inspect the project installation
npx skills@1.7.4 list --agent codex
```

The router **does not install the ten specialists automatically**. Install a specialist as needed, for example:

```bash
npx skills@1.7.4 add howlil/agentflow --skill code-review --agent codex --copy --yes
```

For global installation add `--global`. Use a supported agent identifier such as `claude-code`, `gemini-cli`, `cursor`, or `opencode` instead of `codex`. See the [tested compatibility matrix](/start/cross-agent-compatibility/) for project/global locations.

## Prefer the npm CLI?

```bash
npm install -g @howlil/agentflow-cli@0.3.0
agentflow --version
agentflow doctor
agentflow install --project --agent codex --skill agentflow --copy --yes
agentflow status --project --agent codex
```

The published CLI is `@howlil/agentflow-cli`, not the unrelated npm package named `agentflow`. Updates to installed skills are **user-initiated**; consult [CLI lifecycle and ownership rules](/start/cli/) before using `update` or `uninstall`.

## Need to choose a specialist?

Start with the [decision-to-skill table](/start/choose-a-skill/) rather than memorizing package names. A sample routing request:

> Use Agentflow to decide which engineering skill owns the unresolved design decision in this feature. Select the smallest relevant subset and explain why.

If you already know which skill to use, open its [human guide](/skills/agentflow/) or [canonical skill reference](/reference/agentflow/).

## Indexing and discoverability

- [GitHub repository](https://github.com/howlil/agentflow): canonical source and reviewable skill files
- [npm package](https://www.npmjs.com/package/@howlil/agentflow-cli): public versioned command-line adapter
- [skills.sh directory](https://skills.sh/): ecosystem-wide browsing and install usage telemetry
- `/llms.txt`: build-generated, lightweight agent-readable index linking to canonical `SKILL.md` files and public documentation

The `llms.txt` file is an optional discovery convention, **not** a guarantee that a model, search engine, or plugin directory will index Agentflow. External official marketplaces, GitHub topics, and third-party listings each have their own ownership or approval process. See [release & rollback](/start/release-and-rollback/) for the current published version.
