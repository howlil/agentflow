# Agentflow brand guidelines

> **Better judgment for AI agents.**

These are the messaging guidelines for the Agentflow website, README, developer documentation and announcements. **The product's canonical skill instructions remain in `skills/`; branding must never redefine technical capability.**

## Positioning

| Item | Canonical language |
| --- | --- |
| Name | Agentflow |
| Category | Engineering Skills for AI Agents |
| Primary tagline | Better judgment for AI agents. |
| Supporting line | The right skill for every engineering decision. |
| Short description | Portable engineering skills for AI coding agents. |
| One-sentence pitch | Agentflow helps coding agents choose the smallest relevant set of engineering skills for the decision at hand. |

## Product truth

Agentflow has **one routing skill** (`agentflow`) and **ten specialist skills**. It is a portable collection of `SKILL.md` instructions. The router helps select a skill when engineering decisions are unclear, and specialist skills provide bounded guidance. When the next step is deterministic, the agent should act directly.

Agentflow is **not** a workflow automation service, multi-agent runtime, custom package manager, autonomous coding guarantee, or mandatory SDLC pipeline. Installing only the router does not install the specialists. Host activation, slash commands, updates and plugin refresh policies vary.

## Messaging hierarchy

### Homepage hero

- Eyebrow: Agentic engineering skills
- Headline: Better judgment for AI agents.
- Supporting line: The right skill for every engineering decision. One router and ten specialists help coding agents focus on the reasoning a task needs.
- Primary action: Install Agentflow
- Secondary action: Explore skills

### Developer-facing copy

- Start with the decision, not the skill name.
- One router. Ten specialists.
- Only the reasoning the task needs.
- Portable by design.

### What to avoid

- "The agent automatically implements your entire software lifecycle."
- "Works identically in every agent."
- "Installs all specialists when you install the router."
- "Auto-updates across all clients."
- "Replaces your agent runtime."

Do not imply measured performance, error reduction, cost savings, or security improvements without evidence.

## Verbal identity

- **Tone:** calm, clear, precise, developer-first.
- **Preferred terms:** engineering decision, focused skills, decision routing, router, specialist, portable.
- **Avoid:** autonomous swarm, universal intelligence, zero-error coding, guaranteed outcomes, flow automation.
- Prefer concrete examples and scoped technical claims over generic AI hype.

## Visual identity — single source of truth

The active visual identity is defined by the M2 token table below. Do not revive the old blue accents, placeholder letter-A favicon, heavy shadows, or inconsistent card styles. The logo must be sourced from `public/favicon.svg`, including documentation and social sharing use.

## Brand architecture

```text
Agentflow                 master brand
  agentflow               routing skill
  product-design          specialist
  engineering-design      specialist
  design-graph            specialist
  design-thinking         specialist
  test-engineering        specialist
  code-review             specialist
  security-review         specialist
  production-ops          specialist
  graph-protocol          specialist
  call-graph-output       specialist
```

Keep the specialist names unchanged in the UI, source folders, installation instructions and runtime references.

## Release and distribution language

The public GitHub repository is the canonical skill source. The skills.sh ecosystem and external `skills` CLI are the default distribution path. Claude Code and Codex native plugins are optional **alternatives**; they do not need to be installed alongside portable skills. Do not describe skills.sh as a private immutable Agentflow registry or describe npm website build tooling as an Agentflow CLI.

## Visual identity — M2

### Mark: one input, two routes, one chosen path

The canonical mark lives in [`public/favicon.svg`](public/favicon.svg), a flat 64×64 rounded-square glyph. The left node is an incoming engineering decision; the two curved routes represent eligible specialist paths. The upper route uses warm white for the active choice, while the lower route is muted violet. It is **not** a workflow engine or literal `A` logotype.

This small-scale SVG is also used for the landing header and is copied into Starlight's logo asset at build time. The same geometry is embedded into the social card using `scripts/build-brand-assets.mjs`. Do not manually duplicate the glyph or embed external fonts inside it.

### Design tokens

| Token | Value | Usage |
| --- | --- | --- |
| `--af-ink` | `#0C0D10` | Dark hero and glyph background |
| `--af-surface` | `#16171D` | Secondary dark surfaces |
| `--af-ivory` | `#F6F4EF` | Primary text and bright route |
| `--af-muted` | `#B9BAC7` | Secondary descriptions |
| `--af-accent` | `#9B8BDE` | Secondary route / scarce emphasis |
| `--af-font-ui` | Geist → system sans | Body and navigation |
| `--af-font-mono` | Geist Mono → system mono | Commands and metadata |
| `--af-font-display` | Instrument Serif → Georgia | Editorial hero headline |

Keep a flat, high-contrast composition with quiet technical motion and rounded controls. **Do not add gradients, shadows or glowing robot artwork to the logo.** The neutral palette should dominate; violet is a signal rather than a background color.

### Assets and social sharing

- `public/favicon.svg`: canonical icon source, hand-editable.
- `src/assets/brand-mark.svg`: generated Starlight logo copy. Never edit manually.
- `public/social-card.template.svg`: source for 1200×630 social design. Placeholder is filled from the canonical SVG.
- `public/social-preview.svg`, `public/og.png`: generated outputs. Do not commit or hand-edit.
- `npm run brand:assets`: produces the vectors and PNG; it also runs as part of dev/build.

The website exposes `og:image` and `twitter:image` **only when `PUBLIC_SITE_URL` is configured with the actual canonical production origin**. This avoids publishing incorrect social URLs for temporary deploys. After deployment, verify live metadata, favicon rendering at 16/32 px, and social card appearance in platform debuggers; CI proves file generation, not social crawler ingestion.

## Product consistency — M3

### Documentation components

The homepage and Starlight documentation share the same routed-node mark. The skills catalog shows **one router** distinctly from the **ten specialists**, using guide metadata generated from canonical `SKILL.md` sources. Do not duplicate skill descriptions or manually maintain a parallel list in UI components. Cards use responsive layouts, visible keyboard focus, no drop shadows, and theme-aware neutral/violet tokens.

The mobile landing header keeps **Install** and **Explore skills** visible; the GitHub icon has an accessible label when its visible text is hidden.

### Marketplace identity

Keep all distribution identifiers exactly `agentflow` and maintain identical description across the root Agent Plugin manifest and Claude plugin + marketplace metadata:

> Better judgment for AI agents. One decision router and ten portable engineering specialist skills.

Codex marketplace display name is `Agentflow`. Its category and install policies remain host-owned. A metadata revision on the default branch **is not** an official marketplace listing or released native plugin version. The next release requires a separately reviewed version bump and immutable tag.

### GitHub repository presentation

The README uses the canonical mark and positioning. The repository **About description, topics and social-preview image are GitHub settings**, not files implicitly modified by the PR. After merging, an authorized owner can apply:

- Description: `Portable engineering skills for AI coding agents.`
- Topics: `agent-skills`, `ai-coding`, `software-engineering`, `code-review`, `developer-tools`
- Social preview: upload the generated `public/og.png` from a verified build (1200×630)
- Website: enter only the verified, deployed Agentflow domain.

Check external directory listing descriptions separately; repository metadata and GitHub README do not force third-party registries to re-index.
