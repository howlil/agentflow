# Agentflow — Repository Rules

## Product
Agentflow helps engineers route a concrete task to the smallest useful reasoning skill. The portable `agentflow` router selects among ten specialist skills.
The homepage, skill chooser, human guides, and generated runtime references form one user journey.
A skill is a decision tool, not a mandatory lifecycle stage.

## Ownership
- `skills/<name>/SKILL.md`: canonical instructions and runtime metadata.
- `scripts/generate-skills.mjs`: validate canonical packages and required Agent Skills metadata constraints, then generate metadata/reference docs plus the optional static `/llms.txt` discovery index, all from the same `SKILL.md` frontmatter.
- `src/content/docs/start/install.md`: document installer-managed project/global lifecycle.
- `src/content/docs/start/native-plugins.md`: native marketplace commands and host-specific update behavior.
- `plugin.json` and `.claude-plugin/plugin.json`: two native metadata adapters with identical package identity/version, not competing skill sources.
- `.claude-plugin/marketplace.json` and `.agents/plugins/marketplace.json`: native marketplace catalog adapters pointing to the repository root.
- `scripts/plugin-manifests.mjs`: validate manifest versions and native plugin roots; `package.json` owns the version.
- `scripts/distribution.test.mjs`: prove skill-layout, router coverage, and guide/lifecycle documentation contracts.
- `packages/cli/`: standalone, zero-runtime-dependency CLI. Only project bootstrap, offline diagnosis, and pinned delegation to external skills CLI are owned here; never implement another skill installer.
- `src/content/docs/start/cli.md`: CLI configuration, safety and lifecycle documentation.
- `src/content/docs/skills/`: human-facing usage, examples, and when-not-to-use boundaries.
- `src/content/docs/start/` and `recipes/`: discovery and composition.
- `src/components/`: presentation and interaction only.
- Astro/Starlight: static routing, rendering and search. Cloudflare Pages: native GitHub build and static delivery. Existing Cloudflare Workers Builds: `wrangler.jsonc` serves `dist/` as static assets. Neither path requires custom GitHub Actions; never add Astro SSR adapter for this static documentation site.
- `.agents/product.md` and `.agents/engineering.md`: authoritative product/system decisions.

Never create a competing skill manifest or hand-copy full runtime instructions into guides.
Use generated data for canonical skill identity; use human-guide frontmatter for display titles and summaries.
Keep new responsibilities in existing boundaries unless a real independent owner is necessary.

## Change flow
1. Identify the user's decision and the owning boundary.
2. Edit the smallest surface that owns it; update product/system contracts only when behavior or guarantees change.
3. For skill changes, edit `SKILL.md` first and let the generator project canonical references.
4. Run `npm test` and `npm run build`; verify homepage → chooser → guide → reference links when navigation changes.
5. Keep generated `src/generated/` and `src/content/docs/reference/` out of commits.

No backend, state store, new abstraction layer, or agent runtime without a concrete product need.
CLI `init` may exclusively create `.agentflow.json` but must not mutate target project `AGENTS.md` or `.agents/`. Update/uninstall require an explicit scope and verified Agentflow source ownership in the official project/global lockfile; missing or mismatched records fail closed. Bare `agentflow update` must never update unrelated repositories.
- `packages/cli/src/ownership.mjs` owns read-only source-identity checks; never implement an independent lockfile writer.
- `.github/workflows/release.yml` owns secure NPM_KEY publishing on matching version tags or operator-requested releases; publish success precedes tag/GitHub Release. Remote acceptance runs automatically after successful releases through workflow_run and remains available manually; it does not publish npm packages or rewrite release tags. Keep the nested CLI package version synchronized with root `package.json` and native plugin manifests.
Never duplicate canonical `skills/` into vendor-specific plugin directories. When bumping the version, update `package.json` and lockfile, run `npm run plugins:sync`, and verify `npm run plugins:check`. Native publication is independent from Cloudflare docs deployment.
Do not claim auto-update or universal invocation syntax from file-based installation. Do not write to other projects' steering files during M1.
