# Agentflow — Design preferences

## Direction
Calm, high-contrast, editorial-technical interface for developers. Neutral dark ink and warm ivory dominate; muted violet is a scarce routing accent, never a full background or glowing AI gradient.

Interior docs pages (Start/Skills/Reference/Recipes/System) share this identity: ink dark theme, warm ivory light theme, Instrument Serif page title over Geist prose. Both themes are first-class; the page follows the person's system preference. Starlight features (sidebar, search, TOC) stay functional; only the palette, type, and surfaces are ours.

## Tokens
Canonical source: `BRAND.md` and `src/styles/global.css`.
- `--af-ink`: `#0C0D10` (dark hero and mark background)
- `--af-surface`: `#16171D` (secondary dark surfaces)
- `--af-ivory`: `#F6F4EF` (primary foreground and active route)
- `--af-muted`: `#B9BAC7` (supporting copy)
- `--af-accent`: `#9B8BDE` (secondary route and subtle emphasis)
- Fonts: `Instrument Serif` (display headline), `Geist` (UI/body), `Geist Mono` (commands and labels)

## Components & Patterns
- Canonical routed-node mark lives in `public/favicon.svg`; `src/assets/brand-mark.svg`, `public/social-preview.svg`, and `public/og.png` are generated via `bun run brand:assets`.
- Homepage is goal-first (`LandingHero.astro` + `SkillGrid.astro`), separating the single router card from the seven specialist cards using generated canonical metadata.
- Landing hero is an asymmetric split: copy column left (left-aligned text), decision-dispatch console right (`DispatchConsole.astro`); stacks to copy-then-console under 940px. The console is an illustrative transcript of real commands and real skill names only — the canonical installer string comes from `start/install.md`, never invented.
- Flat cards with crisp borders, pill primary/secondary CTAs, and zero heavy drop shadows or stock AI illustrations.
- Landing post-hero sections live in `LandingSections.astro` (serif h2 at section scale, 5.5rem vertical rhythm, closing pill-row). Decision-flow diagrams render as styled components in the console language (`RoutingFlow.astro`), never as fenced code blocks — diagrams get no copy affordances, and diagram copy stays verbatim from the product behavior it illustrates.
- Product truthful boundary copy (“installing the router alone does not install the specialists”, no auto-update or autonomous-run claims) stands on every route it appears on, styled or not.
- Docs interior theming lives in `src/styles/global.css` as `--sl-color-*` ramps (ivory light block keyed to `[data-theme='light']`, ink dark in `:root`) plus a bottom Expressive Code override block; Starlight's EC defaults load after custom CSS, so those overrides are written one specificity step above the generated selectors — keep that shape when touching them.
- Fenced code blocks render as ink slabs (`#16171D`) with a hairline border and 8px radius in both themes, with the dark shiki token palette; they are the product object (SKILL.md text), not a themed widget.

## Deliberate exceptions
Recorded so a later craft pass does not remove them as generic tells:
- Mono uppercase eyebrows (`01 / Start here`, `02 / Specialists`) carry the numbered catalog sequence.
- Pill primary/secondary CTAs, flat bordered cards, no drop shadows.
- The ASCII wave field loops on the homepage hero only, as the backdrop layer of that surface's single moment; the dispatch console reveals once on load in front of it (lines fade/rise, caret blinks 3 times, then rests). Both are paused or pinned static under `prefers-reduced-motion`. No other looping animation exists.
- Serif (Instrument Serif) page titles in the docs reading surface, at Starlight's doc title size; body text stays Geist. Named headings use weight 500, not bold.

## States & Accessibility
- Visible `:focus-visible` outlines on interactive links and cards.
- Respect `prefers-reduced-motion` on animated backgrounds (`AsciiWaves.astro`) and transitions.
- Mobile header keeps `Install` and `Explore skills` reachable and preserves an `aria-label` on the GitHub link when text collapses.
