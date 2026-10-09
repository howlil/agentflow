---
title: Deploy to Cloudflare
description: Deploy Agentflow from GitHub as a static site without Astro SSR.
---

Agentflow is fully pre-rendered by Astro/Starlight. The build output is `dist/`. There is no need for the `@astrojs/cloudflare` adapter or a Worker JavaScript entry point.

## Which Cloudflare project do I have?

**Cloudflare Pages:** The build runs `npm run build`, and Pages publishes `dist/` automatically. There is no deploy command.

**Cloudflare Workers Builds:** The build runs `npm run build`, followed by `npx wrangler deploy`. This is the same hosting family as `howlil-app` (Workers Static Assets), but Agentflow has no Worker API.

If your logs include **"Executing user deploy command: npx wrangler deploy"**, you are using **Workers Builds**, not Pages. For this existing project, the root `wrangler.jsonc` prevents Wrangler from trying to reconfigure Astro and adding an unnecessary SSR adapter.

## Option A — keep the existing Worker (matches howlil-app)

In the Cloudflare dashboard, open the **agentflow** Worker → **Settings → Build** and use:

| Setting | Value |
| --- | --- |
| Git repository | `howlil/agentflow` |
| Production branch | `master` |
| Root directory | Repository root |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Node version | `22.23.3` (see `.node-version`) |

The repository already contains:

```json
{
  "name": "agentflow",
  "compatibility_date": "2026-10-09",
  "assets": {
    "directory": "./dist",
    "html_handling": "auto-trailing-slash",
    "not_found_handling": "404-page"
  }
}
```

The build/deployment path becomes:

```text
Push to master
  → Workers Builds
  → npm run build
    → generate 10 skill references
    → Astro + Starlight produce dist/
  → wrangler deploy
    → upload dist/ as static assets
```

No custom GitHub Actions CI/CD or Cloudflare API token in the repository is required.

## Option B — use an actual Cloudflare Pages project

If you specifically want Cloudflare **Pages**, create a **Pages** project using **Import an existing Git repository** from [Cloudflare Dashboard](https://dash.cloudflare.com/) and select [howlil/agentflow](https://github.com/howlil/agentflow).

| Setting | Value |
| --- | --- |
| Framework | Astro |
| Production branch | `master` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | Repository root |
| Deploy command | **None** (Pages handles publishing) |

Pages deploys to a `*.pages.dev` address and handles preview builds. The `wrangler.jsonc` is for Workers Builds; Pages should not invoke `npx wrangler deploy`. Creating a Pages project is a Cloudflare dashboard action; changing repository files does not convert an existing Worker into Pages.

## Verify locally

```bash
npm ci
npm test
npm run build
```

Ensure `dist/index.html`, `dist/404.html`, and skill/reference HTML pages exist.

## Troubleshooting

- **`npx wrangler deploy` tries `astro add cloudflare`:** The build is running Workers Builds without a recognized Wrangler config. Check the root directory, branch, and committed `wrangler.jsonc`.
- **`@bruits/satteri-wasm32-wasi` unresolved:** This was caused by the unwanted auto-configuration and second Astro build. Do not add a WASM package just to suppress this symptom.
- **Worker name mismatch:** The Worker name in Cloudflare must be `agentflow`, matching `wrangler.jsonc`.
- **Expected Pages but see a deploy command:** You created/connected a Worker, not a Pages project. Choose Option B.
- **Missing documentation routes:** Verify `dist/` contains static HTML; do not configure a single-page-app fallback for Starlight.
