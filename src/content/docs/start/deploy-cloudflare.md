---
title: Deploy to Cloudflare Pages
description: Deploy Agentflow directly from GitHub using Cloudflare Pages' native Git integration.
---

Agentflow is a **fully static Astro + Starlight** site. Cloudflare Pages installs dependencies, runs the build, and serves `dist/` itself. You do **not** need GitHub Actions, Wrangler, a Cloudflare API token, or an Astro SSR adapter.

## Connect GitHub directly to Cloudflare Pages

1. Open the [Cloudflare dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create application** → **Pages**.
2. Choose **Import an existing Git repository** (or **Connect to Git**), authorize GitHub if prompted, then select [howlil/agentflow](https://github.com/howlil/agentflow).
3. Configure the project:

| Setting | Value |
| --- | --- |
| Framework preset | Astro |
| Production branch | `master` |
| Root directory | `/` (repository root) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js version | Read from `.node-version` (`22.23.3`) |

4. Click **Save and Deploy**.

When the build finishes, Cloudflare Pages shows the project URL (a `*.pages.dev` address). The project name determines that subdomain, so do not assume it will be `agentflow.pages.dev` until Cloudflare confirms it.

## Every subsequent change

```text
Push to master
    ↓
Cloudflare Pages Git integration
    ↓
npm install from package-lock.json
    ↓
npm run build
  └→ prebuild: generate canonical skill references
    ↓
Upload static dist/
    ↓
Serve on *.pages.dev or custom domain
```

Cloudflare Pages handles deployments automatically. Other branches and pull requests can receive preview deployments if enabled in Pages project settings.

## Local verification

```bash
npm ci
npm test
npm run build
```

The generated pages and search index are emitted to `dist/`. No server-side runtime is required.

## Troubleshooting

- **Build fails on Node:** confirm the Pages build environment honors `.node-version` (or set `NODE_VERSION=22.23.3` in Pages settings).
- **Wrong page or missing guides:** verify output directory is exactly `dist` and the project is built from repository root.
- **404 on homepage:** ensure `dist/index.html` is generated; Starlight also produces `404.html`.
- **Custom domain:** open the Pages project → **Custom domains**, and attach the domain there.
- **Existing Cloudflare Worker:** it is not the same as a Pages project. Create or select a **Pages** project with Git integration instead.

For this static project, do not add `wrangler.jsonc`, `@astrojs/cloudflare`, a deployment workflow, or GitHub Actions secrets unless the hosting model explicitly changes.
