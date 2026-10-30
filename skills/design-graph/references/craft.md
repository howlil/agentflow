# Craft order

Loaded from §9 of `design-graph`. Fix in this order and finish one pass across the whole surface before starting the next:

```text
1 spacing → 2 color → 3 icons → 4 copy → 5 type → 6 layout → 7 details → 8 visuals → 9 motion
```

Spacing comes first because every other value reads differently once the rhythm is right. Copy comes before type and layout because the length of a headline decides its size and where it sits. Visuals and motion come last because they have to fit a surface that already works without them.

When nearly every line changes, keep this order in the plan and then write the surface in one go, as long as every pass is applied.

Values (spacing steps, ramps, type scale, radius, durations) are in `tokens.md`; the direction that overrides them is in `direction.md`; finding the defects is in `signs.md`.

## 1. Spacing

- Everything sits on a 4px grid: margins, paddings, gaps, fixed heights are multiples of 4. A 2px step is allowed for a nudge inside a small control, and an odd value stays only when it is what exactly centers something.
- Same thing, same size: rows in one list share one height and one gap, cards in a row share one padding.
- Space shows grouping: space inside a group is smaller than space between groups.
- Things line up: icons in one column, labels starting on one line, numbers right-aligned in one column. No stray translate, no one-off margin.
- Density follows role: compact panels around 16, cards 20–24, page edges 24–32. Navigation is the densest part: rows 32–36 with 2–4 between them, and a section label 24 above its group and 8 below.
- Replace one-off values (`mt-[13px]`, `py-[11px]`) with steps from the scale.

## 2. Color

- Build from one neutral ramp tinted toward the world. Background, raised surfaces, borders, and text all come from it.
- App and dashboard surfaces stay near-grey whatever the world is: people look at them for hours and the content carries the color. A background that reads as a hue has gone too far. Landing surfaces may tint further.
- Three text roles: primary, secondary, muted. Not ten near-identical tints.
- One accent, used rarely: the primary action, the selection, the one figure that matters.
- Inside a Moment, color may be rich (several hues in a chart, real materials, an image with its own light) as long as each color means something.
- Text on the accent reaches 4.5:1. Accent used as ink on a light surface needs a darker shade of itself.
- Remove hue gradients on surfaces, gradient text, colored glows and shadows, radial washes, and neon borders. A gradient is allowed only as a small tone shift inside one neutral.
- Borders are hairlines at 6–10% of the text color. On dark, depth comes from surface steps and a top highlight; on light, shadows are neutral and small.
- Semantic color carries meaning only, toned down to sit inside the ramp.

## 3. Icons

- An emoji used as an icon or as label decoration becomes a line icon from one set: the set the project already has, otherwise lucide.
- One size and one stroke everywhere, 16 or 18px at 1.5.
- Icons take the color of their text role, usually secondary or muted. They never get their own colors.
- The icon box has the same width in every row and one fixed gap to the label (8 or 10), so labels align.
- Drop icons that add nothing. A category that needs color gets a small status dot.

## 4. Copy

- The headline says what the product does for whom, in words that could not fit another product. Use the facts already on the surface; invent none.
- No exclamation marks. No greeting headline: the title names the context (the page, the period), not the visitor.
- Short labels: `Search`, not `Search anything...`. A change says what it compares to: `+12% vs last month`, `3 fewer vs last month`.
- Short strings end without a period. Only paragraphs of several sentences keep theirs.
- No hype words (supercharge, seamless, unlock, magic, revolutionize), and no `AI-powered` on everything.
- An unverifiable claim becomes quiet and specific if the person confirms it is true, and is removed (and reported) if not.
- Mock data looks real: plausible names and figures, never `[X]` or `123,456`.
- This pass applies the §9 copy gate: one name per action for the whole flow, errors that say what went wrong and how to fix it, empty states that point to the next action.

## 5. Type

- One interface family chosen for the character, plus at most one partner: a mono for figures and meta, or a display face for large headlines only.
- A few sizes from the scale and two weights (400, 500; 600 only for rare emphasis). Hierarchy comes from size and color, not weight.
- Sentence case everywhere; uppercase tracked labels become sentence case.
- No negative letter spacing below 16px, and no italic for emphasis.
- Numbers use tabular figures and one format across the surface. Existing tabular figures must not be re-set to proportional by a font swap.

## 6. Layout

- Keep the sections and their order. Inside a section, alignment and proportion may change when that makes the surface clearer.
- Compose the first screen as a whole: no dead band, no hero that stops short. If the content is shorter, center it or let the product view run past the bottom edge so the surface invites a scroll.
- Apps keep app proportions: the shell fills the viewport, a sidebar of 240–280, fluid content capped near 1440–1600, and a page as long as its content. Never shrink an app into a narrow centered column.
- Stacked and centered is the template default: keep it only for a short hero with no visual. Otherwise split asymmetrically, or put the text over a large product view.
- Long headlines align left. Centered text works for one or two short lines.
- One primary action and at most one secondary action next to it; everything else leaves the hero. Navigation stays quiet: logo, the existing links, one action, and log in as a text link rather than a second button.
- On small screens everything stacks in reading order, a dense preview simplifies (fewer rows and columns) instead of being zoomed out, and nothing drops below 11px.
- Which surfaces exist, what collapses, and where navigation edges go is §2 and §7. This pass only composes what the graph already requires.

## 7. Details

- Nested radius: inner equals outer minus the padding between them, never below 4. Controls 8–10, cards 12–16, panels 14–20. Not everything is a pill.
- Counts and meta become quiet text, often mono and muted, instead of glowing pills. Shortcuts become small keycaps.
- Charts sit on a muted grid with muted mono labels: one accent on the thing that matters, neutral steps for the rest. No rainbow inside one series, no glowing bars, no uppercase day labels.
- Charts have hierarchy like text: one main chart is clearly the biggest thing, and anything else showing data is smaller and different in kind (a ranked list with thin bars, a short table), never a second chart of the same size.
- The chart type follows the data: a trend is a line, a comparison is bars, a share is one stacked bar or a list, a single goal is a progress bar.
- Stat cards are a label, a big figure, and a change with its comparison. No sparklines, tallies, or filler icons.
- Vary sizes so the grid has rhythm. Equal cards with equal content read as a template.
- The active state is a surface step plus a hairline, not a gradient with a glow. Hover and focus exist and stay inside the palette; keyboard focus stays visible (§6).
- The logo is the product name in the main family plus a simple flat mark. No gradient wordmark, no sparkle tile, no glossy orb.
- The Signature from the direction appears where it belongs and nowhere else.

## 8. Visuals

- Decorative filler goes: blobs, orbs, nebulas, floating cubes, glowing grids, holograms, robots.
- Dashboards and app surfaces almost never need a generated image. Their Moments come from the product: a chart drawn with care, real content, a live status, an object built in code with real materials.
- A landing hero gets a visual that shows something true: a product preview in code, or one scene from the world.
- Empty states, onboarding, and marketing moments are the other places an image earns its keep. Read `visuals.md` before choosing or generating one.
- Never ship a labeled placeholder. When the visual cannot be produced, leave an empty slot of the correct size (a plain surface step, no text) and put the prompt in the report.

## 9. Motion

- Remove motion that loops for no reason: pulse and ping on things that are not live, shimmer on headings, breathing glows, floating elements, parallax.
- Remove `transition-all`, bouncy springs, `hover:scale` on cards, and anything that moves more than a few pixels on hover.
- Keep motion that explains something: a hover is a quick color or surface change, a press is a small scale down, a menu fades and rises from where it opens, a changed number tweens.
- Transition color, background, border, opacity, and transform, named individually. Never animate width, height, top, left, margins, or large blurs.
- One easing curve and a few durations across the surface. At most one entrance on load, with a small stagger.
- Focus movement, announcements, pending and conflict behavior, and reduced motion are §6, §7, §10, and `design-thinking` owns implementation. This pass decides only whether motion earns its place.

---

Adapted from unslop by Damir Sokolovsky ([@heydamir](https://x.com/heydamir)), CC BY 4.0. See `CREDITS.md`.
