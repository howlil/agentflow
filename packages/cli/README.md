# Agentflow CLI

A dependency-free Node CLI front end to portable Agentflow skills.

This package is prepared for a future npm publish, but has **not** been published yet. Install from a cloned repository:

```bash
npm install -g ./packages/cli
agentflow --help
agentflow doctor
agentflow init --agent codex
agentflow install --global --agent codex --skill agentflow
agentflow status --global
agentflow update --check
agentflow uninstall --global --agent codex --skill agentflow
```

The CLI delegates installation, update and removal to pinned upstream `skills@1.7.4` through `npx`; these operations may require internet access. Update/uninstall require explicit scope and verifiable `howlil/agentflow` ownership from the upstream lockfile, failing closed on ambiguity. Global/project state belongs to the upstream skills manager. `init` creates only `.agentflow.json` using exclusive file creation, never rewrites `AGENTS.md`.

`--dry-run` is available on every mutating command. `--yes` must be explicitly requested to disable prompts. Do not install both native plugins and the same skills.sh package for a given AI host.

`agentflow status` delegates to `skills list`, and `doctor` runs without network access. See the [release and rollback runbook](../../src/content/docs/start/release-and-rollback.md) for tagged recovery and opt-in npm OIDC publication.