# Engineering

## System

```text
skills/*/SKILL.md
        ↓ canonical runtime source
scripts/generate-skills.mjs
        ├→ src/generated/skills.json
        └→ generated runtime reference pages
                     ↓
human MD/MDX guides + generated metadata/reference
                     ↓
Astro content collections
                     ↓
Starlight + Pagefind
                     ↓
Tailwind v4
                     ↓
static dist/
                     ↓
Cloudflare Workers Static Assets
```

## Responsibilities

- `skills/*/SKILL.md` owns canonical runtime skill behavior and routing descriptions.
- `scripts/generate-skills.mjs` validates the ten-skill set, enforces directory/frontmatter identity, generates canonical metadata, and projects runtime reference pages.
- Human Markdown/MDX owns usage guidance, examples, recipes, and product explanation.
- Astro owns static build and content loading.
- Starlight owns documentation navigation, layout, accessibility baseline, code rendering, and search integration.
- Tailwind owns project-specific presentation.
- Cloudflare Workers Static Assets owns delivery of `dist/`.
- GitHub Actions proves that `master` still generates artifacts and builds.

## State & Invariants

- Runtime behavior has one repository source of truth: `skills/<name>/SKILL.md`.
- A skill directory name must equal its frontmatter `name`.
- Exactly the intended ten skill packages must exist unless the product/system contract changes deliberately.
- Canonical `name` and `description` shown by the homepage are generated.
- Runtime reference pages are generated from canonical `SKILL.md`; they are not edited by hand.
- Human guides may teach or summarize a skill but must not silently redefine runtime behavior.
- There is no mutable runtime application state or database.

## Critical Flows

### Change a skill

```text
edit skills/<name>/SKILL.md
  ↓
npm run build
  ↓
validate package identity/set
  ↓
regenerate metadata + runtime reference
  ↓
Astro/Starlight build
```

### Publish

```text
commit to master
  → CI
  → generate skill artifacts
  → Astro build
  → dist/
  → Cloudflare
```

## Guarantees

- Metadata/reference drift is prevented structurally by generation.
- Missing, unexpected, or misnamed skill packages fail before the site builds.
- Content/config errors fail at build time instead of creating a partially broken runtime.
- Search/navigation require no application backend.
- Cloudflare delivery stays static until a real server-side requirement appears.

## Decisions

### Canonical runtime packages in-repo

The ten `SKILL.md` files under `skills/` are authoritative for agent behavior.

### Generated metadata and runtime reference

Do not manually duplicate runtime descriptions or complete skill instructions in human docs. Generate those projections on every dev/build run.

### Human guides stay separate

Generated reference optimizes fidelity. Human guides optimize discovery and usage. They intentionally solve different jobs.

### Astro + Starlight + Tailwind + Cloudflare

The site remains documentation-first, build-time generated, and statically delivered. No backend capability currently traces to a product requirement.
