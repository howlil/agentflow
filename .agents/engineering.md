# Engineering

## System

```text
Markdown / MDX docs
        ↓
Astro content collections
        ↓
Starlight
  ├─ navigation
  ├─ page structure
  └─ Pagefind search
        ↓
Tailwind v4 presentation
        ↓
Astro static build
        ↓
dist/
        ↓
Cloudflare Workers Static Assets
```

## Responsibilities

- Astro owns static build and content loading.
- Starlight owns documentation navigation, layout, accessibility baseline, code rendering, and search integration.
- Tailwind owns project-specific presentation utilities and custom documentation components.
- Markdown/MDX owns human-authored guides, recipes, and skill usage pages.
- Cloudflare Workers Static Assets owns delivery of the generated `dist/` output.
- GitHub Actions proves that `master` still builds.

## State & Invariants

- Documentation content is repository state; there is no mutable runtime application state.
- The production artifact is generated entirely from the committed repository.
- No database or server-side runtime is required for v1.
- Runtime `SKILL.md` files, when introduced, remain canonical for agent behavior.
- Human documentation must not silently become a second runtime contract.

## Contracts

```text
content files
  → Astro/Starlight content schema
  → static routes

Tailwind classes
  → build-time CSS
  → generated assets

npm run build
  → dist/

wrangler deploy
  → Cloudflare static deployment
```

## Critical Flows

### Read documentation

```text
request
  → Cloudflare edge
  → immutable static asset
  → browser
```

### Publish documentation

```text
commit to master
  → CI build proof
  → Astro build
  → dist/
  → Wrangler / Cloudflare build
  → static deployment
```

## Guarantees

- A content or dependency error fails at build time instead of creating a partially broken runtime.
- Search and navigation work without an application backend.
- Static delivery keeps runtime failure surface small.
- Tailwind does not require a client-side framework.
- Cloudflare deployment does not require the Astro Cloudflare adapter while all pages remain pre-rendered.

## Decisions

### Astro + Starlight

The product is documentation-first. Starlight already owns the generic docs shell, so Agentflow only builds the task router and skill-specific presentation.

### Tailwind v4

Use `@tailwindcss/vite` with Starlight's Tailwind compatibility package. Avoid a custom CSS framework or React component system for a mostly static docs product.

### Cloudflare Workers Static Assets

Deploy the generated `dist/` directly with Wrangler. Do not add SSR or `@astrojs/cloudflare` until a real server-side behavior requires it.

### No backend

Database, CMS, auth, API server, queues, and caches do not trace to a v1 requirement, so they are intentionally absent.

## Assumptions / Risks

- Actual runtime skill packages are not yet stored in this repository. Current pages document routing/usage boundaries and should later link directly to canonical `SKILL.md` files.
- Cloudflare credentials and production domain are intentionally not committed.
