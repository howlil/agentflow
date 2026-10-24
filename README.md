# Agentflow

<img src="public/favicon.svg" width="56" height="56" alt="Agentflow routing mark" />

**Better judgment for AI agents.**

Portable engineering skills for AI coding agents. Agentflow helps an agent choose the right reasoning for the decision at hand—without forcing every task through a rigid workflow.

**The right skill for every engineering decision.**

[![Skills ecosystem](https://skills.sh/b/howlil/agentflow)](https://skills.sh/howlil/agentflow)
[![CI](https://github.com/howlil/agentflow/actions/workflows/ci.yml/badge.svg)](https://github.com/howlil/agentflow/actions/workflows/ci.yml)

## Install in 60 seconds

Agentflow uses the independent [skills CLI](https://github.com/vercel-labs/skills) for portable installation. Node.js 22.20+ is required for the tested `skills@1.7.4`.

```bash
# Explore all eleven skills before installing
npx skills@1.7.4 add howlil/agentflow --list

# Globally install for Codex; select all eleven interactively
npx skills@1.7.4 add howlil/agentflow -g -a codex

# Or install only the router in your current project
npx skills@1.7.4 add howlil/agentflow --skill agentflow -a codex --copy --yes
```

**One router + ten specialists.** The router does not bundle or auto-install its specialists. Select all eleven if you want full routing coverage. Use only **one installation route per AI host**: portable skills or the [native Claude Code / Codex plugin](src/content/docs/start/native-plugins.md).

## How Agentflow works

```text
Engineering task
      |
      v
Which decision is unresolved?
      |
      +-- none --> proceed directly
      |
      +-- yes ---> agentflow (router)
                       |
                       v
                 relevant specialist(s)
                       |
                       v
                 bounded guidance
                       |
                       v
                 verify the outcome
```

The `agentflow` router is useful when the next engineering decision is unclear or multiple disciplines overlap. It examines the task and suggests the smallest relevant specialist set. It **does not run a separate orchestration service**, change your project steering files, or automatically invoke every skill.

### Example: fix a race condition

A task such as “Prevent two workers from creating the same booking” may need:

- `engineering-design` to define the concurrency and ownership guarantees, if unclear.
- `design-thinking` to implement an established contract, if the implementation path is unresolved.
- `test-engineering` to prove the concurrency behavior and failure cases.

If the design and tests are already clear, the agent should not invoke those skills just to follow a sequence.

## The skill system

| Skill | Decision it owns |
| --- | --- |
| **`agentflow`** | Which engineering skill is relevant now? |
| `product-design` | What observable product behavior is required? |
| `engineering-design` | What boundaries and system guarantees are needed? |
| `design-graph` | How should interface states and interactions work? |
| `design-thinking` | How does an established contract become implementation? |
| `test-engineering` | How do we verify correctness and failure modes? |
| `code-review` | Is the implementation sound and maintainable? |
| `security-review` | Are trust boundaries and sensitive data protected? |
| `production-ops` | How is production observed and recovered? |
| `graph-protocol` | When does bounded delegation help? |
| `call-graph-output` | How do we communicate an existing execution graph? |

[Explore the skill guides](src/content/docs/start/choose-a-skill.md). Every skill's canonical runtime instructions live in `skills/<name>/SKILL.md`.

## Built for your coding agent

Agentflow is a **portable skill library**, not a new agent runtime. The same canonical source supports several coding hosts through the upstream skills installer. Native plugins are also available for Claude Code and Codex.

Portable skills require user-initiated updates; file installation does not imply automatic host activation or automatic updates.

```bash
npx skills@1.7.4 check
npx skills@1.7.4 update -g
npx skills@1.7.4 remove -g howlil/agentflow
```

An upstream installer may temporarily download or clone the GitHub repository for skill discovery, but installs only the selected skill directories.

## Source-of-truth model

```text
skills/*/SKILL.md
    ├─ skills CLI → selected agent skill directories
    ├─ Claude/Codex marketplaces → host-managed plugins
    └─ build generator → metadata, references and llms.txt
```

Guides and examples explain how to use the skills; they do not replace the canonical runtime source.

## Documentation

- [Install & distribution](src/content/docs/start/distribution.md)
- [Choose a skill](src/content/docs/start/choose-a-skill.md)
- [Quickstart](src/content/docs/start/quickstart.md)
- [Cross-agent compatibility](src/content/docs/start/cross-agent-compatibility.md)
- [Releases and rollback](src/content/docs/start/release-and-rollback.md)
- [Brand voice and visual system](BRAND.md)

## Development

```bash
npm ci
npm run plugins:check
npm test
npm run build
```

The private root `package.json` is used for the Astro/Starlight website and native plugin validation; **no Agentflow-specific npm CLI is published from this repository**. Static documentation deploys to Cloudflare.

### Migrating from the discontinued npm wrapper

```bash
npm uninstall -g @howlil/agentflow-cli
```

This removes the old global executable without deleting already-installed skill files. npm registry package ownership and historical versions are managed separately.

MIT licensed. [Canonical GitHub repository](https://github.com/howlil/agentflow).
