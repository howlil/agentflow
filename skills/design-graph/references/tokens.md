# Tokens

Loaded from §9 and §11 of `design-graph`. These are **starting values, not a house style**. When `.agents/DESIGN.md` or the code already has a working system, keep its values and fix only how they are used. Otherwise take a starting point, move it toward the direction in `direction.md`, and record the result in DESIGN.md as a durable decision (an A# first time, a token afterwards).

A surface that uses these values with no direction is the template look this skill rejects.

## Spacing

```text
4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128
```

- Inside a control: 4–12
- Between related items (rows in a list): 2–8
- Between groups (a label and its list, two cards): 12–24
- Between sections: 32–64; landing sections 80–128
- Row heights: 32 compact, 36 default, 40–44 touch
- Hero: 96–128 from navigation to headline on desktop, 48–64 on mobile

## App layout

- Sidebar 240–280, page padding 24–32, content fluid and capped near 1440–1600.
- Top bar or page header 56–64 tall.
- Navigation rows 32–36, gap 2–4, section label 24 above and 8 below.
- Stat cards in a row share one height, three or four per row on desktop, numbers only.
- The main chart spans at least two thirds of the content width and is 280–360 tall. A second data block next to it is a list or a table, narrower, never another chart of the same size.

## Neutral ramps

Very low saturation, so no surface reads as a color on its own. Warm suits paper, wood, food, craft, and anything human. Ink suits night, sky, water, and anything technical. Graphite is the near-grey fallback for app surfaces. Tint your own the same way if the world asks for it.

### Dark

| Role | Graphite | Warm | Ink |
| --- | --- | --- | --- |
| Deepest surface (sidebar) | `#0f0f10` | `#12110f` | `#07080d` |
| Page background | `#141415` | `#161513` | `#0b0d14` |
| Card | `#19191b` | `#1c1a18` | `#11141c` |
| Raised (active row, input) | `#232325` | `#262421` | `#1a1e28` |
| Primary text | `#ededed` | `#efe9de` | `#eef0f5` |
| Secondary text | `#a1a1a6` | `#aaa398` | `#a3a9b8` |
| Muted text and icons | `#85858b` | `#8a847a` | `#7a8296` |

### Light

| Role | Graphite | Warm | Ink |
| --- | --- | --- | --- |
| Page background | `#fafafa` | `#f7f4ee` | `#f5f7fa` |
| Card | `#ffffff` | `#fdfbf7` | `#ffffff` |
| Raised (active row, input) | `#f4f4f5` | `#efe9df` | `#eceff4` |
| Primary text | `#171717` | `#1f1b16` | `#111827` |
| Secondary text | `#525252` | `#5e554a` | `#4b5565` |
| Muted text and icons | `#737373` | `#7b7266` | `#6b7487` |

Hairlines are the primary text color at 8% opacity. Muted text is for meta and captions only and still reaches near 4.5:1 on its surface; body text uses primary or secondary.

Semantic color, toned to sit inside any ramp: positive `#4cc38a` on dark and `#16a34a` on light, negative `#e5484d` on dark and `#dc2626` on light.

## Accent

- Keep a real brand color. A violet-to-blue glow gradient is not a brand color.
- Without one, take it from the world: warm worlds suit amber, coral, or ember orange; cool worlds suit cobalt, teal, or clear sky blue; natural worlds suit moss or sage. Avoid the purple-to-blue family unless the brand really is purple.
- Text on the accent reaches 4.5:1; darken it or use dark text when it does not.
- The accent covers a few percent of the surface: the primary action, the selection, one key figure.

## Buttons

- Hero buttons 44–48 tall, navigation buttons 32–36, with 16–20 of side padding.
- Primary on dark: an off-white from the ramp with dark text, or the accent. Primary on light: the primary text color as a fill with white text, or the accent.
- Secondary: the raised surface with a hairline and primary text.
- A soft top highlight (`inset 0 1px 0 rgba(255,255,255,0.12)`) gives depth on dark buttons without a glow.

## Type families

Choose by the character in the direction. All are free, and a partner can come from any row.

| Character | Interface family | Optional partner |
| --- | --- | --- |
| Precise, technical, calm | Geist, Inter, IBM Plex Sans | Geist Mono, IBM Plex Mono, JetBrains Mono for figures and meta |
| Warm, friendly, human | Instrument Sans, DM Sans, Figtree | Instrument Serif or Newsreader for the hero headline only |
| Editorial, literary, crafted | Inter or Instrument Sans | Newsreader, Instrument Serif, Fraunces for headlines |
| Playful, bold | Space Grotesk, Bricolage Grotesque | a mono for small labels |

A display serif belongs to large headlines only, never to labels or buttons.

## Type scale

| Use | Size | Line height | Weight |
| --- | --- | --- | --- |
| Small labels, meta, counts | 12 | 16 | 400, mono welcome |
| Secondary text, captions | 13–14 | 20 | 400 |
| Body, nav items | 14–15 | 20–22 | 400–500 |
| Logo wordmark | 16–18 | 1 | 500–600 |
| Hero subhead | 18–20 | 28–30 | 400, secondary color, at most 36rem wide |
| Card figures | 28–32 | 1 | 500, tabular |
| Page title | 28–36 | 1.15 | 400–500 |
| Hero headline | 56–72 desktop, 36–44 mobile | 1.02–1.08 | 400–500 |

Letter spacing is 0 below 16px, slightly positive (0.01em) is fine for small muted text, and display text may go to -0.02em from 40px and -0.03em from 56px.

## Radius

| Element | Radius |
| --- | --- |
| Keycap, tag, small button | 4–6 |
| Row, input, button | 8–10 |
| Card | 12–16 |
| Panel or window | 14–20 |

Nested radius: inner equals outer minus padding, never below 4. A 16px card with 8px padding holds items at 8.

## Icons

lucide, 16 or 18px, stroke 1.5, colored by the muted or secondary text role, 8–10px gap to the label.

## Depth

- Dark: surface steps plus a hairline; an active row may carry `inset 0 1px 0 rgba(255,255,255,0.12)`.
- Light: `0 1px 2px rgba(0,0,0,0.05)` for small things, `0 8px 24px rgba(0,0,0,0.06)` for floating ones.

## Motion

One easing curve for the whole surface, `cubic-bezier(0.22, 1, 0.36, 1)`.

| Use | Duration |
| --- | --- |
| Hover, press, toggles | 120–180ms |
| Menus, popovers, tooltips | 160–220ms |
| Entrances, sheets, layout changes | 300–500ms |
| Stagger between items | 40–60ms, at most six items |

Rise distance on enter: 6–12px. Press scale: 0.97–0.98. Transition color, background, border, opacity, and transform only. Reduced motion is §7.

---

Adapted from unslop by Damir Sokolovsky ([@heydamir](https://x.com/heydamir)), CC BY 4.0. See `CREDITS.md`.
