---
title: Deploy to Cloudflare
description: Deploy the pre-rendered Agentflow documentation through Cloudflare Workers Static Assets.
---

Agentflow builds into static HTML, CSS, and JavaScript in `dist/`. It deploys as a **Cloudflare Worker with Static Assets**, not a Cloudflare Pages project or an Astro SSR Worker. No database or Astro Cloudflare adapter is required.

## One-time GitHub setup

1. In the [Cloudflare dashboard](https://dash.cloudflare.com/), copy the **Account ID** for the account that will host Agentflow.
2. Create an API token with the **Edit Cloudflare Workers** permission, scoped only to that account. Do not use a Global API Key.
3. Open [Agentflow repository Actions secrets](https://github.com/howlil/agentflow/settings/secrets/actions) and add these two *repository secrets*:

| Secret | Value |
| --- | --- |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID |
| `CLOUDFLARE_API_TOKEN` | Scoped Cloudflare API token |

4. In [GitHub Actions](https://github.com/howlil/agentflow/actions), select **CI** → **Run workflow** → branch `master`. This executes the first authenticated deployment.

Do not commit account credentials or store API tokens in `wrangler.jsonc`. If the secrets are absent, an ordinary push will skip publishing with a notice. A manually triggered deployment without the secrets will fail with a clear error.

## Continuous deployment

Every push to `master` runs:

```text
npm ci → npm test → Astro build → route checks → Wrangler dry-run
   → verified build artifact → Cloudflare deploy
```

Pull requests run build and validation only; they do not deploy. Production deployment runs **only after a successful build**, using the same verified `dist/` artifact rather than building the site again.

After publishing, the **Publish Workers Static Assets** step prints the deployment URL. If workers.dev is enabled for the account, the Worker can be reached through its `*.workers.dev` address. To use a custom domain, configure it under the Worker in Cloudflare → **Settings → Domains & Routes**.

## Deploy from your computer

```bash
npm ci
npm test
npm run build
npx wrangler deploy --dry-run
npx wrangler login
npm run deploy
```

`npm run deploy` builds the site and publishes static assets using the `agentflow` Worker defined in `wrangler.jsonc`. Local deployment requires Wrangler login or valid Cloudflare API credentials.

## Routing and troubleshooting

- **Trailing slashes:** URLs such as `/skills/design-graph/` map to the generated `index.html`.
- **Missing pages:** Cloudflare returns the generated `404.html` with HTTP 404 instead of sending all unknown paths to the homepage.
- **Deployment skipped:** configure both GitHub Actions secrets, then manually rerun **CI** or push another commit to `master`.
- **Authentication denied:** verify Account ID, token scope, and **Edit Cloudflare Workers** permissions.
- **Green build, no site:** check the separate **Deploy to Cloudflare** job for a skip notice or deployment failure.
- **Competing deployments:** avoid enabling a second Cloudflare dashboard Git integration that publishes to this same Worker.

Only add `astrojs/cloudflare` if Agentflow later needs on-demand/server-side rendering.
