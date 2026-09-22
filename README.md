# Agentflow

Human-facing documentation for a small set of reusable software-engineering agent skills.

The documentation is designed around one question:

> What decision is unclear in the task I am doing now?

From there, Agentflow routes to the smallest useful skill instead of treating skills as a mandatory lifecycle.

## Product model

```text
task
  ↓
unresolved decision
  ↓
smallest useful skill
  ↓
expected outcome
  ↓
handoff only when another decision becomes non-trivial
```

The docs expose this model through:

- **Start** — learn how automatic and explicit skill routing works.
- **Choose a skill** — map a real task to the decision that is unclear.
- **Skills** — reference pages with use-when, don't-use-when, inputs, outputs, examples, and handoffs.
- **Recipes** — show how multiple skills compose for real engineering work without becoming a fixed pipeline.
- **System** — records the product and engineering decisions behind this documentation product.

## Engineering model

```text
Markdown/MDX content
      ↓ build time
Astro + Starlight
      ↓
Tailwind CSS
      ↓
static HTML + Pagefind search
      ↓
Cloudflare Workers static assets
```

There is intentionally no database, CMS, API server, authentication layer, or SSR runtime in v1.

## Local development

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

Deploy to Cloudflare:

```bash
npx wrangler login
npm run deploy
```

## Source of truth

Runtime skill instructions should remain canonical in each skill's `SKILL.md`. Human documentation explains how to choose and use those skills; it should not become a second copy of the runtime contract.

## Repository

`master` is the production branch.
