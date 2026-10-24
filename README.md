# Agentflow

[![Skills ecosystem](https://skills.sh/b/howlil/agentflow)](https://skills.sh/)
[![npm](https://img.shields.io/npm/v/@howlil/agentflow-cli)](https://www.npmjs.com/package/@howlil/agentflow-cli)
[![CI](https://github.com/howlil/agentflow/actions/workflows/ci.yml/badge.svg)](https://github.com/howlil/agentflow/actions/workflows/ci.yml)

**Portable software-engineering skills for AI coding agents.** Use the `agentflow` router to select the smallest useful specialist for an unresolved product, design, implementation, testing, security, or production decision. Eleven canonical skills work through a portable installer; optional native plugin routes exist for Claude Code and Codex.

## Install in 60 seconds

Requires **Node.js 22.20+**. First preview the skill catalog without installing anything:

```bash
npx skills@1.7.4 add howlil/agentflow --list
```

Then choose **one installation route per AI host**:

| I want to... | Command |
| --- | --- |
| Install the router in this project for Codex | `npx skills@1.7.4 add howlil/agentflow --skill agentflow --agent codex --copy --yes` |
| Install the published Agentflow CLI | `npm install -g @howlil/agentflow-cli@0.3.0` |
| Install through Claude Code's native marketplace | `claude plugin marketplace add howlil/agentflow` |
| Add a Codex native marketplace | `codex plugin marketplace add howlil/agentflow` |

Installing only the router **does not install the ten specialist skills**. The native marketplace commands require their respective host clients, and are not the same as file-based installation. For Gemini CLI, Cursor and OpenCode, use portable installation with the supported `--agent` ID.

**Start here:** [Choose an installation route](src/content/docs/start/distribution.md) · [Find the right skill](src/content/docs/start/choose-a-skill.md) · [Five-agent compatibility](src/content/docs/start/cross-agent-compatibility.md) · [Published v0.3.0](https://github.com/howlil/agentflow/releases/tag/v0.3.0)

The system is designed around one question:

> What decision is unclear in the task I am doing now?

## Source-of-truth model

```text
skills/*/SKILL.md
      ↓ canonical runtime behavior
build-time generator
      ├→ canonical skill metadata
      └→ full runtime reference pages

human guides
      ↓ discovery / examples / composition

all content
      ↓
Astro + Starlight + Tailwind
      ↓
static Cloudflare deployment
```

Do not manually copy runtime descriptions or full skill instructions into human docs. Edit the relevant `skills/<name>/SKILL.md`, then run the build.

## User journey

```text
Homepage → Choose a skill → Human usage guide → Generated runtime reference
```

A task can require zero, one, or several skills. Routing is based on the unresolved engineering decision, not a required pipeline.

## Install, update, and remove Agentflow

Use the external [skills CLI](https://github.com/vercel-labs/skills/blob/main/docs/commands.md) (Node.js 22.20+). It discovers the portable `skills/<name>/SKILL.md` packages. Choose an agent and scope when prompted.

```bash
# Preview available skills (no install)
npx skills@latest add howlil/agentflow --list

# Interactive project or global installation
npx skills@latest add howlil/agentflow
npx skills@latest add howlil/agentflow -g

# Check and update installed skills
npx skills@latest check
npx skills@latest update -g

# Remove this repository's global skills
npx skills@latest remove -g howlil/agentflow
```

Updates through `skills.sh` are user-initiated. Native Claude/Codex marketplace distribution is also available; each host controls plugin refresh and invocation semantics. See the [complete installation guide](src/content/docs/start/install.md), including specific skills, project removal, and compatibility limitations.

## Native plugins (Claude Code and Codex)

**Choose one installation route per agent:** native managed plugin **or** editable `skills.sh` files. Native plugins bundle the same eleven canonical skills, with no generated copies.

```bash
# Claude Code (public repository marketplace)
claude plugin marketplace add howlil/agentflow
claude plugin install agentflow@agentflow

# Codex / ChatGPT desktop marketplace
codex plugin marketplace add howlil/agentflow
```

On supported Codex/ChatGPT desktop clients, install **Agentflow** from the plugin directory's **Agentflow Engineering** marketplace. Native plugin refreshing depends on host configuration. For versioning and uninstall instructions, see the [native plugin guide](src/content/docs/start/native-plugins.md).

Plugin version source: `package.json`. After a version bump, run:

```bash
npm run plugins:sync
npm run plugins:check
```

## Cross-agent distribution

Project and global file-based Agent Skills installation is tested with `claude-code`, `codex`, `gemini-cli`, `cursor`, and `opencode` using a pinned upstream installer and the public v0.3.0 npm CLI. Each agent's host discovery and native invocation remain separate capabilities. See the [cross-agent compatibility matrix](src/content/docs/start/cross-agent-compatibility.md).

## Agentflow CLI (published on npm)

A thin, separate Node.js executable lives under `packages/cli`. The CLI delegates portable skill lifecycle to pinned `skills@1.7.4`, adds safe project bootstrap and offline diagnosis, and never overwrites steering files.

```bash
# Install the published CLI (Node.js >=22.20.0)
npm install -g @howlil/agentflow-cli@0.3.0
agentflow --version
agentflow init --agent codex
agentflow doctor
agentflow install --global --agent codex --skill agentflow
agentflow status --global
agentflow update --check
agentflow update --skill agentflow --global
agentflow uninstall --global --agent codex
```

Bare `agentflow update` is deliberately rejected because the upstream bare update is not restricted to this source. Read the [CLI documentation](src/content/docs/start/cli.md) for supported flags, dry runs, and configuration safety.

## Release and rollback (M4)

**Automated npm package release:** after a reviewed `master` commit, open **Actions → Publish Agentflow Release → Run workflow**, select `master`, and enter the newly reviewed package version (for example `v0.3.1` after bumping its manifests). The pipeline validates CI, publishes `@howlil/agentflow-cli` using repository secret `NPM_KEY`, then creates the Git tag and GitHub Release. A pushed matching `v*` tag also triggers publishing. The first public release, [v0.3.0](https://github.com/howlil/agentflow/releases/tag/v0.3.0), is already published on npm. Future versions require a new version bump, reviewed code, and valid npm publishing credentials.


The CLI verifies installed skill source ownership before update and uninstall; mutations require explicit global/project scope. Versioned releases check tag ancestry and metadata before creating GitHub release notes. The npm publish job uses the `NPM_KEY` repository secret; if its credentials are invalid or the npm scope is not owned, the release fails without creating a GitHub Release.

Published release acceptance is now an automated post-release workflow and is also available on demand. It checks the real npm CLI, immutable skill content, and source-protected uninstall; rollback verification requires an earlier published tag. See [release and rollback](src/content/docs/start/release-and-rollback.md).

## Local development

```bash
npm ci
npm run dev
```

`predev` generates the canonical manifest and runtime reference pages.

Validate and build:

```bash
npm run plugins:check
npm test
npm run build
```

## Deploy to Cloudflare

Connect [howlil/agentflow](https://github.com/howlil/agentflow) to **Cloudflare Pages** using its native GitHub integration.

- Production branch: `master`
- Framework preset: **Astro**
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: repository root

Cloudflare Pages can install, build, and publish the site on each push without custom CI/CD. If your Cloudflare project runs `npx wrangler deploy`, it is **Workers Builds**, not Pages. The checked-in `wrangler.jsonc` supports that existing Worker as static assets without adding the Astro SSR adapter. See the [deployment guide](src/content/docs/start/deploy-cloudflare.md).

## Hosting

The site is fully pre-rendered. Astro/Starlight generates `dist/` (including the search index); Cloudflare Pages (or Workers Static Assets) serves the static output. No database, CMS, API server, or SSR runtime is required.

## Repository

`master` is the production branch. Portable distribution is validated with tests and builds in CI. Licensed under [MIT](LICENSE).
