# Agentflow

Human-facing documentation and canonical runtime packages for ten reusable software-engineering agent skills.

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

## Local development

```bash
npm install
npm run dev
```

`predev` generates the canonical manifest and runtime reference pages.

Build:

```bash
npm run build
```

Deploy to Cloudflare:

```bash
npx wrangler login
npm run deploy
```

## Hosting

The site is fully pre-rendered. `wrangler.jsonc` serves `./dist` through Cloudflare Workers Static Assets. No database, CMS, API server, or SSR runtime is required.

## Repository

`master` is the production branch.
