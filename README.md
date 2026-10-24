# Agentflow

[![Skills ecosystem](https://skills.sh/b/howlil/agentflow)](https://skills.sh/howlil/agentflow)
[![CI](https://github.com/howlil/agentflow/actions/workflows/ci.yml/badge.svg)](https://github.com/howlil/agentflow/actions/workflows/ci.yml)

**Portable engineering decision skills for AI coding agents.** One router and ten specialists. No custom installer or required SDLC pipeline.

## Install in 60 seconds

Install through the independent [skills CLI](https://github.com/vercel-labs/skills) (Node.js 22.20+). It may temporarily fetch the whole GitHub source, but only selected skill directories are installed.

```bash
# Preview eleven skills
npx skills@1.7.4 add howlil/agentflow --list

# Install globally for Codex; interactively select all eleven skills
npx skills@1.7.4 add howlil/agentflow -g -a codex

# Or install only the router into the current project
npx skills@1.7.4 add howlil/agentflow --skill agentflow -a codex --copy --yes

# Inspect, update and remove installed skills
npx skills@1.7.4 check
npx skills@1.7.4 update -g
npx skills@1.7.4 remove -g howlil/agentflow
```

**Installing only the router does not install its ten specialists.** Select all eleven for complete routing. File-based updates are user-initiated, not automatic. Invocation syntax varies by host.

Native Claude Code and Codex marketplace plugins are an alternative. Choose **one route per host**: native plugin or portable skills. See [distribution](src/content/docs/start/distribution.md) and [native plugins](src/content/docs/start/native-plugins.md).

## Source-of-truth model

```text
skills/*/SKILL.md
    ├─ skills CLI → agent's selected skill directories
    ├─ Claude/Codex plugin marketplaces → host-managed skills
    └─ build-time generator → guides, metadata and llms.txt
```

The `agentflow` router selects the smallest relevant specialist set for an unresolved engineering decision. It is a skill, **not an executable agent runtime**.

## Distribution and lifecycle

- [Install and update](src/content/docs/start/install.md)
- [Cross-agent compatibility](src/content/docs/start/cross-agent-compatibility.md)
- [Choose a skill](src/content/docs/start/choose-a-skill.md)
- [Release and rollback](src/content/docs/start/release-and-rollback.md)

GitHub is the canonical source. [skills.sh](https://skills.sh/) provides ecosystem discovery and installer entry points, not immutable npm packages.

### Migrating from the retired npm CLI

The `@howlil/agentflow-cli` npm wrapper is discontinued. Existing skill installations are still managed with the independent `skills` CLI. Remove the old globally installed wrapper using:

```bash
npm uninstall -g @howlil/agentflow-cli
```

This removes only the wrapper executable, **not** installed skill files. It does not remove previously published package versions from the npm registry.

## Development

```bash
npm ci
npm run plugins:check
npm test
npm run build
```

The root `package.json` is private: npm is used to build and validate the Astro/Starlight **website**, not to publish an Agentflow CLI. The static website deploys to Cloudflare Pages or Workers Static Assets.

MIT license. [Repository](https://github.com/howlil/agentflow).
