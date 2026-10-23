# Agentflow

Human-facing discovery guides and canonical runtime packages for eleven reusable software-engineering agent skills (the Agentflow router and ten specialists).

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

Updates are user-initiated. This is not a native plugin; each AI agent controls actual invocation syntax. See the [complete installation guide](src/content/docs/start/install.md), including specific skills, project removal, and compatibility limitations.

## Local development

```bash
npm ci
npm run dev
```

`predev` generates the canonical manifest and runtime reference pages.

Validate and build:

```bash
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
