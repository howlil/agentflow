# Agentflow

**Better judgment for AI agents.**

Agentflow is an open-source engineering skill library: **one decision router and ten focused specialists** for product behavior, architecture, UI, implementation, testing, review, security, and operations. It helps an AI coding host choose the reasoning a task actually needs rather than forcing every change through a fixed pipeline.

[![CI](https://github.com/howlil/agentflow/actions/workflows/ci.yml/badge.svg)](https://github.com/howlil/agentflow/actions/workflows/ci.yml) [![Skills ecosystem](https://skills.sh/b/howlil/agentflow)](https://skills.sh/howlil/agentflow)

## Install and use

For portable coding hosts, use the independent [skills CLI](https://github.com/vercel-labs/skills). The tested version is `skills@1.7.4` with Node.js 22.20+.

```bash
# See the eleven available skills
npx skills@1.7.4 add howlil/agentflow --list

# Install for Codex; select the router and specialists interactively
npx skills@1.7.4 add howlil/agentflow -g -a codex
```

Then ask your coding host:

> Use Agentflow to review the race condition in booking creation. Inspect the affected code, identify any unresolved design or verification decisions, and use only the relevant skills.

The host must have the repository/files and tools needed for the requested action. A skill is **instructional guidance**, not a separate code-executing agent. Installing only `agentflow` does not automatically install its ten specialists.

For other hosts and install modes: [installation guide](src/content/docs/start/install.md), [five-host compatibility](src/content/docs/start/cross-agent-compatibility.md), and [native Claude/Codex plugins](src/content/docs/start/native-plugins.md). Use one installation method per host; portable copies are updated manually.

## What it does

```text
Engineering task
   → inspect available evidence
   → identify unresolved decision
   → select the smallest useful specialist set
   → implement/review with host tools, when authorized
   → verify the actual result
```

A simple rename does not need a design workflow. A concurrency bug may need implementation reasoning and a targeted concurrency test; those are selected only when they resolve a real uncertainty.

[Browse all eleven skills and their responsibilities](src/content/docs/start/choose-a-skill.md).

## ChatGPT Web + GitHub (optional)

Agentflow also has a **skills-only ChatGPT plugin package**. An authorized GitHub connection can let ChatGPT inspect repository code, edit files, work with Issues/PRs and read existing CI. **ChatGPT remains the AI executor; GitHub stores code and work state.** No separate model worker or OpenAI API key is required for this in-chat mode.

The repository's CI produces a candidate plugin ZIP. A passing package check or GitHub Release does **not** mean that a new ChatGPT plugin version was installed, approved, or published in the directory. Availability and tool permissions depend on the host and account.

[ChatGPT package/acceptance](src/content/docs/start/chatgpt-web.md) · [GitHub-only engineering workflow](src/content/docs/recipes/run-code-from-chatgpt.md)

## Contribute and get help

- [Contributing](CONTRIBUTING.md) — focused patches, local checks and review expectations
- [Support](SUPPORT.md) — installation issues, usage questions and bug reports
- [Security policy](SECURITY.md) — reporting vulnerabilities without disclosing details publicly
- [Code of conduct](CODE_OF_CONDUCT.md) — participation and moderation expectations
- [Release notes](CHANGELOG.md) · [GitHub Releases](https://github.com/howlil/agentflow/releases)

## Development

```bash
npm ci
npm run plugins:check
npm test
npm run build
```

The root `package.json` is **private** and is used for the documentation site, plugin metadata and validation—not a new Agentflow npm installer. Canonical skill instructions live in `skills/<name>/SKILL.md`. See [distribution](src/content/docs/start/distribution.md) and [release process](src/content/docs/start/release-and-rollback.md).

Agentflow is licensed under the [MIT License](LICENSE).
