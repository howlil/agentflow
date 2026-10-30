# Direction

Loaded from §9 of `design-graph`. Read it after surfaces and moves are mapped (§2–§3) and before any visual choice or gate verdict. Direction is a decision derived from what the product does for whom, never from what is trending.

## Two entry modes

```text
build   new surface, nothing rendered yet  → derive direction, then compose
clean   a surface already renders          → audit with signs.md, then decide how much it needs
```

A clean run keeps features, content, and section order. Fixing is not redesigning.

## How much to change, in clean mode

- **Many signs** across color, type, icons, and copy: write the direction, then run the full craft order in `craft.md`.
- **A few signs left** on a mostly designed surface (polish): create no new direction. Take it from the existing brand, fix only what the audit found, and keep palette, type, and layout. Bigger ideas go into the report as suggestions, not changes.
- **No signs**: say so plainly, offer at most two or three refinements with exact values, apply them only if the person agrees, and stop. Never change a good surface to make it different.

## Five lines

Write these five lines before composing. Proceed without separate approval when the direction follows the existing product contract, brand, and DESIGN.md. Ask for a decision only when an unresolved choice would materially change product behavior, scope, or established visual identity. Do not require per-surface visual sign-off. If the direction changes materially, revisit only the affected design decisions and passes.

- **Product**: what it does and for whom, in one plain sentence.
- **Character**: two or three concrete words, like `calm, exact, a little warm`. `clean`, `modern`, `sleek`, `minimal`, `premium` are banned: they describe every template.
- **World**: the place or material the product belongs to. A notes app sits near paper and ink, a monitoring tool near instruments and night shifts, a travel product near maps and window light. The world sets the neutral tint, the accent, and the visual.
- **Moments**: one or two places where the surface gets rich color, material, and detail, chosen from what the product shows: a real object, a chart where each color means a series, a scene the copy already promises.
- **Signature**: one small detail only this product would have, used consistently. One, not five.

Examples in this file show shape only. Derive yours from the product in front of you even when an example happens to fit.

## Where it lives

`Product`, `Character`, and `World` are durable: write them into `.agents/DESIGN.md ## Direction` once and reuse them for every surface. `Moments` and `Signature` are per surface and stay in the task or PR (a new signature is a durable change: record it in DESIGN.md).

A surface that keeps re-deriving its direction is a surface that will drift.

## Existing brand

Keep a real logo, color, or typeface and build the direction around it. A hue-to-hue gradient, sparkles, or glow are not brand because they sit in the logo, unless the person says they are.

## Gate

Direction passes when all hold:

- the five lines are written and Character contains no banned word;
- every Moment is something this product actually shows, not decoration;
- the Signature appears in one place, not on every element;
- swapping the product name would break the surface: the copy, the moment, and the signature belong to this product only.

If it fails, revise the direction. Do not repair it in the code.

---

Adapted from unslop by Damir Sokolovsky ([@heydamir](https://x.com/heydamir)), CC BY 4.0. See `CREDITS.md`.
