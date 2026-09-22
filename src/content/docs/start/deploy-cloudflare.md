---
title: Deploy to Cloudflare
description: Build Agentflow as static Astro output and serve it through Cloudflare Workers Static Assets.
---

Agentflow is intentionally static. There is no need for the Astro Cloudflare SSR adapter.

## Local build

```bash
npm install
npm run build
```

Astro writes the production site to `dist/`.

## Authenticate Wrangler

```bash
npx wrangler login
```

## Deploy

```bash
npm run deploy
```

The repository's `wrangler.jsonc` points Cloudflare at `./dist`.

## Git-based production later

For continuous deployment, connect the repository to Cloudflare and use:

```text
Production branch: master
Build command: npm run build
Deploy command: npx wrangler deploy
```

Keep Cloudflare credentials in the platform/CI secret store. Do not commit account IDs, API tokens, or production secrets.

## When to add the Cloudflare adapter

Only add `@astrojs/cloudflare` if Agentflow gains real on-demand/server-side behavior.

```text
current product
→ fully pre-rendered
→ static assets only

future server-side requirement
→ evaluate adapter then
```
