# Agentflow — Design preferences

## Direction
Calm, high-contrast, editorial-technical interface for developers. Neutral dark ink and warm ivory dominate; muted violet is a scarce routing accent, never a full background or glowing AI gradient.

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
- Homepage is goal-first (`LandingHero.astro` + `SkillGrid.astro`), separating the single router card from the eight specialist cards using generated canonical metadata.
- Flat cards with crisp borders, pill primary/secondary CTAs, and zero heavy drop shadows or stock AI illustrations.

## States & Accessibility
- Visible `:focus-visible` outlines on interactive links and cards.
- Respect `prefers-reduced-motion` on animated backgrounds (`AsciiWaves.astro`) and transitions.
- Mobile header keeps `Install` and `Explore skills` reachable and preserves an `aria-label` on the GitHub link when text collapses.
