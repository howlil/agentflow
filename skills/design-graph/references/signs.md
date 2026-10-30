# Signs

Loaded from §9 of `design-graph`. This is how you find the tells the gate rejects: one line per finding, sign → fix, with where it lives. Use it to audit a surface that already renders, and as a self-check before a new surface is declared done.

These signs are craft defects, not interaction defects. Focus, announcements, pending and conflict behavior, and environment belong to §6, §7, and §10.

## Surfaces and color

- Purple-to-blue or violet-to-pink gradient on backgrounds, cards, buttons, or the active row → one neutral surface, accent only where it means something
- Gradient text in a heading, a figure, or the logo → solid text role color
- Colored glow, colored shadow, or a `drop-shadow` on an emoji → remove; depth from surface steps and hairlines
- Radial wash or blurred blob behind content → remove
- Neon or high-contrast colored border → hairline at 6–10% of the text color
- Five near-identical tints of one hue for text → three text roles from one ramp
- Every element highlighted, so nothing leads → one accent used once or twice per surface
- Glass card with a white inner highlight and a colored shadow → plain raised surface plus a hairline

## Type

- Heading at weight 700–900 → 400–500, hierarchy from size and color
- Uppercase label with wide tracking (`NAVIGATION`, `PAID THIS MONTH`) → sentence case
- Six sizes and four weights on one surface → a few sizes from one scale, two weights
- Mixed number formats (`$48,210` next to `$124,860.40`, or `07`) → one format, tabular figures
- Negative letter spacing on small text → zero, or slightly positive
- Italic for emphasis → color or weight

## Icons

- Emoji as nav icon, label decoration, or status (`🏠 📥 🚀 ⚠️`) → one line icon set, or nothing
- Emoji inside a count or pill (`18 👤`) → plain number
- Icons in several sizes and colors → one size, one stroke, text role color
- Icons nudged off the column → one icon box width in every row
- A sparkle for anything AI → remove, or a plain icon only where it explains something

## Spacing

- Arbitrary values (`mt-[13px]`, `ml-[7px]`, `h-[31px]`) → steps on the 4px scale
- Rows in one list with different heights or gaps → one height, one gap
- A group sitting closer to its neighbour than to its own items → smaller gaps inside groups
- Uneven padding inside sibling cards → one padding
- A big empty band above a section and cramped space below it → balanced rhythm
- A dense control area (sidebar, toolbar) that was never measured → measure gaps and alignment after the pass; this is where spacing breaks most often

## Copy

- Greeting headline (`Welcome back, Damir! 👋`) → the page or the period as the title
- Exclamation marks, and never `!!` → plain statement
- A change without its comparison (`+12%!!!`) → `+12% vs last month`
- Wordy placeholder (`Search anything...`) → `Search`
- Hype words (supercharge, seamless, unlock, magic, revolutionize) → what the thing actually does
- Trailing period on a label, button, or caption → none
- Fake data (`$123,456`, `[X]`) → plausible names and figures
- An unverifiable claim (`Loved by 10,000+ teams`) → confirm it, then make it quiet and specific, or remove it and list it in the report

## Components and data

- Glowing pill for a count, plan, or shortcut → quiet mono text or a keycap
- `PRO`, `New ✨`, `Beta 🚀` badge → remove, or one quiet text badge
- Every element a full pill → radius by size, and nested radius math
- Rainbow bars, glowing bars, pill-shaped bars, or uppercase day labels in a chart → muted grid, mono labels, one accent
- Every series in a shade of the accent, so nothing leads → neutral steps, accent on the one thing that matters
- Sparkline, tally, or mini bars added to a stat card → the label, the figure, and its comparison
- Equal cards side by side with the same content → one main data block, varied widths and kinds
- Logo as a gradient tile with a sparkle, a glossy orb, or a gradient wordmark → product name in the main family plus a simple flat mark

## Layout and heroes

- Pill badge above the headline (`✨ Introducing X 2.0`) → remove, or a quiet text link when it is real news
- Headline that fits any product (`Supercharge your workflow with AI`) → say what this product does for whom
- Shimmer or gradient on the headline → solid text
- Blobs, orbs, grids, or glowing lines behind the hero → plain background, or one real product visual
- Everything stacked and centered, with the picture below the buttons → asymmetric split, or text over a large product view
- Three or more actions, or chips and avatars stacked under the buttons → one primary and at most one secondary
- Avatar row, star row, or `Trusted by 10,000+ teams` without a source → ask if it is real, then quiet and specific, or gone
- Parallax, or elements floating on scroll → static layout
- Feature cards each with an emoji, a bold title, and a vague line → fewer features, concrete copy, line icons or none

## Visuals

- Glossy 3D blob, orb, liquid chrome, or nebula as the hero visual → the product itself, or one concrete visual from its world
- Robot, glowing brain, circuit line, or hologram for anything AI → remove, or show what the AI actually produces
- Text, fake buttons, or a fake logo baked into an image → real text in the page, a clean image without text
- Image with a hard edge and a different black than the page → matched background, or a mask at the edges
- A visual on every section → one visual where it helps, usually the hero only

## Motion

- `animate-pulse`, `animate-ping`, or a breathing glow on something that is not live → static
- `transition-all`, `hover:scale` on cards → named properties, a color or surface step on hover, a small scale down on press
- Bouncy spring or overshoot on ordinary UI → one ease-out curve
- Everything flying in from a different direction on load → one short fade and rise with a small stagger
- Animating width, height, top, or left → transform and opacity

## Template look

Not slop, but what a cleaned surface falls back to when nobody decided. Check for these after the passes:

- Pure grey page, default font, white text, and one old accent on a product whose world is warm or bright → a ramp tinted toward the world, an accent taken from it
- A headline that would still fit another product after swapping the name → say what this product does, with its own nouns
- A hero visual that is an empty box or a generic picture → a product preview in code, or one scene from the world
- The same layout, type, and palette for a different product → let the direction choose

---

Adapted from unslop by Damir Sokolovsky ([@heydamir](https://x.com/heydamir)), CC BY 4.0. See `CREDITS.md`.
