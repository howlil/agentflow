# Agentflow — Repository Rules

## Product
Agentflow helps engineers route a concrete task to the smallest useful reasoning skill.
The homepage, skill chooser, human guides, and generated runtime references form one user journey.
A skill is a decision tool, not a mandatory lifecycle stage.

## Ownership
- `skills/<name>/SKILL.md`: canonical instructions and runtime metadata.
- `scripts/generate-skills.mjs`: validate canonical packages and generate metadata/reference docs.
- `src/content/docs/skills/`: human-facing usage, examples, and when-not-to-use boundaries.
- `src/content/docs/start/` and `recipes/`: discovery and composition.
- `src/components/`: presentation and interaction only.
- Astro/Starlight: static routing, rendering and search. Cloudflare: static asset delivery.
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
