---
title: ChatGPT Web plugin
description: Package, validate, and submit the canonical Agentflow skills as a ChatGPT skills-only plugin.
---

# Agentflow on ChatGPT Web

Agentflow is one engineering decision router plus seven specialist skills. ChatGPT loads these instructions through a **skills-only plugin**, not an MCP backend. This route does not introduce a new installer or runtime. The canonical source remains `skills/<name>/SKILL.md`.

## Prepare the package

```bash
bun install --frozen-lockfile
bun run plugins:check
bun run test
bun run build
```

The GitHub CI `verify` job creates an `agentflow-chatgpt-package` artifact containing the submission ZIP after checks pass. It **extracts and revalidates the exact ZIP** using `node scripts/chatgpt-package.mjs --check <extracted-directory>` and rejects unexpected archive roots, missing or invalid skills, unsafe asset paths, invalid listing metadata, and bundled MCP/app/hooks files. The archive root contains only `.codex-plugin/plugin.json`, `skills/`, and `assets/`. Do not upload the full GitHub source archive or legacy root manifest. Download the artifact from the successful workflow, then upload the inner ZIP in the [ChatGPT plugin developer portal](https://chatgpt.com/plugins).

For a tagged release, the verified `agentflow-chatgpt-vX.Y.Z.zip` is also attached directly to [Agentflow GitHub Releases](https://github.com/howlil/agentflow/releases). Publishing that artifact does not mean the ChatGPT plugin has been installed, approved, or listed publicly.

The official `.codex-plugin/plugin.json` contains a top-level `interface` listing and explicit `skills: "./skills/"` declaration. `assets/agentflow.svg` provides both icons. The legacy root `plugin.json` remains for portable compatibility with validated listing parity, but is **excluded** from the ChatGPT ZIP.

## Optional GitHub-backed engineering workflow

With a separately connected and authorized GitHub integration, ChatGPT Web can use Agentflow guidance to inspect code, make supported GitHub changes, and ship verified slices via PRs and existing CI. ChatGPT is the only AI executor in this mode; GitHub Actions runs ordinary deterministic tests, never a separate coding model. See [Code from ChatGPT Web using GitHub](/recipes/run-code-from-chatgpt/).

This is an **opt-in host workflow**, not an additional Agentflow service, permission grant, or evidence of hands-free execution.

## Operating contract

Installing Agentflow does not grant GitHub, shell, commit, or deployment access. The router:

1. Identifies the unresolved decision and selects only necessary specialist(s), or acts directly for deterministic edits.
2. Loads the selected specialist's canonical instructions where available; never invents a missing skill's instructions.
3. Keeps durable target-project memory strictly in `.agents/product.md`, `.agents/engineering.md`, and `.agents/DESIGN.md`, edited in place.
4. Enforces the budget: reuses existing CI gates within the stage map (`ci`, `release`, `nightly`), proves acceptance with automated assertions per P# plus one manual pass at release, and avoids ledgers or extra report files.
5. Distinguishes proposed code, observed diffs, executed CI on the exact SHA, and completed merges.

Use the host's plugin chooser or mention mechanism to activate Agentflow. Neither `$agentflow` nor slash commands are guaranteed in ChatGPT Web, and ChatGPT may select an individual specialist directly without invoking the router first.

## Release and submission

A reviewed release updates `package.json`, `bun.lock`, native manifests, `RELEASE_VERSION`, and `CHANGELOG.md` together. Repository Node tests validate packaging and static contracts; portal scanning, real ChatGPT session checks, and directory review remain separate publisher steps.

Official references: [Package plugins](https://developers.openai.com/plugins/build/plugins), [Build skills](https://developers.openai.com/plugins/build/skills), [Submit](https://developers.openai.com/plugins/deploy/submission).
