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
Cloudflare Pages / Workers Static Assets
```

## Responsibilities

- `skills/*/SKILL.md` owns canonical runtime skill behavior and routing descriptions.
- `skills/agentflow/SKILL.md` selects specialists; it does not provide its own runtime.
- The external `skills` CLI owns file-based global/project installation, update, and removal in M1.
- `scripts/generate-skills.mjs` validates the eleven-skill set and required Agent Skills flat-scalar metadata limits, enforces directory/frontmatter identity, generates canonical metadata, and projects runtime reference pages.
- Human Markdown/MDX owns usage guidance, examples, recipes, and product explanation.
- Astro owns static build and content loading.
- Starlight owns documentation navigation, layout, accessibility baseline, code rendering, and search integration.
- Tailwind owns project-specific presentation.
- Cloudflare Pages owns static publishing when using a Pages Git integration.
- The existing Workers Builds project uses `wrangler.jsonc` to publish `dist/` as static assets. No Worker source entrypoint, Astro SSR adapter, or custom GitHub Actions deployment is required.

## State & Invariants

- Runtime behavior has one repository source of truth: `skills/<name>/SKILL.md`.
- A skill directory name must equal its frontmatter `name`.
- Exactly the intended eleven skill packages (agentflow router plus ten specialists) must exist unless the product/system contract changes deliberately.
- Canonical `name` and `description` shown by the homepage are generated.
- Runtime reference pages are generated from canonical `SKILL.md`; they are not edited by hand.
- Human guides may teach or summarize a skill but must not silently redefine runtime behavior.
- There is no mutable runtime application state or database.
- Distribution uses the canonical `skills/<name>/SKILL.md` layout rather than vendor-specific copies.
- File installation does not guarantee auto-updates or identical invocation syntax across hosts.
- Native marketplace catalogs point at repository root and never embed copied skill text.
- Both plugin manifests must retain package identity `agentflow` and package version.

## Critical Flows

### Native plugin release

```text
npm version patch --no-git-tag-version
 → npm run plugins:sync
 → npm run plugins:check
 → npm test + npm run build
 → review + merge to master
 → git tag vX.Y.Z
 → release workflow verifies version + master ancestry
 → GitHub Release
 → host marketplace update depends on client configuration
```

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
  → Cloudflare Pages or Workers Builds native Git integration
  → npm run build (includes skill artifact generation)
  → static dist/
  → Cloudflare static hosting
```

## Guarantees

- Metadata/reference drift is prevented structurally by generation.
- Missing, unexpected, or misnamed skill packages fail before the site builds.
- Content/config errors fail at build time instead of creating a partially broken runtime.
- Search/navigation require no application backend.
- Cloudflare Pages or Workers Static Assets serves the same static files until a real server-side requirement appears.

## Decisions

### Release automation (NPM_KEY)

`.github/workflows/release.yml` verifies a tag or manual version against the current `master` and root/CLI/native package parity, tests/builds/packs, and checks public npm registry tarball integrity before publishing. Only `publish-npm` receives `secrets.NPM_KEY` as `NODE_AUTH_TOKEN`; only after npm success can `github-release` generate the release/tag. Registry versions with mismatched tarball integrity cause hard failures; reruns with identical content are idempotent. Tag creation on workflow_dispatch via GitHub token does not retrigger tag events. Keep token authentication isolated, and prioritize moving to OIDC before npm retires direct publishing via bypass-2FA tokens in January 2027.

### M4 release acceptance and source ownership

`packages/cli/src/ownership.mjs` validates installed source identity from official project `skills-lock.json` or global `$XDG_STATE_HOME/skills/.skill-lock.json` / `~/.agents/.skill-lock.json` before mutations. Unknown owners fail closed, and source-scoped uninstall expands to concrete owned names. Update/uninstall require explicit scope. Dry-run invokes no installer and makes no filesystem writes.

The release workflow validates `vX.Y.Z` tag version and `master` ancestry, creates GitHub Release, and optionally publishes the CLI through npm OIDC. npm publication is gated by the explicit `AGENTFLOW_NPM_PUBLISH_ENABLED` variable and npm trusted publisher setup. Remote tagged installation, upgrade, and rollback acceptance remains manual until the public tags exist. Never claim it passed before execution.

### M3 thin command-line adapter

`packages/cli` is a separate publishable Node.js package with a `bin/agentflow.mjs` entry and no runtime dependencies. `src/main.mjs` owns argument validation, optional `.agentflow.json` bootstrap, offline diagnosis, and version-pinned subprocess delegation to `skills@1.7.4`. `init` uses exclusive create and never rewrites project steering files. No per-agent installation state is reimplemented: `status` and lifecycle are delegated to the upstream installer.

Bare update is rejected because `skills update` without a selector can update unrelated sources. An update-by-name must be reviewed for collisions; `uninstall` with no skill selector uses the exact repository source. `--dry-run` is side-effect-free. CLI binary version must match root/native package version. Registry publication and cross-platform real-host testing remain release gates.

### M2 native plugin adapters and versioning

The canonical `skills/` root is shared by the Claude Code plugin manifest, the portable Agent Plugins manifest, and both marketplace catalogs. Host manifests are metadata adapters, not copied runtime skill sources.

`package.json` owns the semantic version. `scripts/plugin-manifests.mjs --check` enforces version parity with the lockfile and both native manifests, same plugin identity, path containment at root, and exactly eleven canonical skills. `--write` synchronizes manifest versions only. Tag-triggered releases verify `vX.Y.Z` against package version and require an ancestor of `master` before publishing a GitHub Release.

Managed updates depend on host configurations. A public GitHub release does not imply third-party official directory submission or automatic client refresh.

### M1 installer-managed portable distribution

Use the canonical Agent Skills layout with the upstream skills CLI for install/update/remove. Native plugin manifests and an Agentflow-specific CLI are separate milestones.

### Canonical runtime packages in-repo

The eleven `SKILL.md` files under `skills/` are authoritative for agent behavior.

### Generated metadata and runtime reference

Do not manually duplicate runtime descriptions or complete skill instructions in human docs. Generate those projections on every dev/build run.

### Human guides stay separate

Generated reference optimizes fidelity. Human guides optimize discovery and usage. They intentionally solve different jobs.

### Astro + Starlight + Tailwind + Cloudflare

The site remains documentation-first, build-time generated, and statically delivered. No backend capability currently traces to a product requirement.
