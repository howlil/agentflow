# Visuals

Loaded from §9 and the Visuals pass in `craft.md`. This decides whether a surface gets a visual at all, and what it is. It never adds a build step: a visual is content of the surface, not a pipeline.

Decide in this order:

1. **Does this surface need a visual?** Dashboards, settings, lists, and most app surfaces do not. A landing hero, an empty state, onboarding, and a marketing moment usually do.
2. **Can the product itself be the visual?** Take this first. Build a preview in code of what the copy already promises: one week with a booked slot, one diff with a comment, one card holding a streak. Use the project's own components when they exist, otherwise careful markup in the palette, with plausible data and real-looking names. Prefer the one moment that proves the headline over the whole app.
3. **Only then a generated image**, and only when the person has a generation tool available. Show the prompt, model, and size before running it, since generation can cost money. Run once and judge against the one-sentence subject before changing the prompt rather than rerolling.
4. **Write the subject as one sentence** before generating or building anything: what it is, and why it belongs to this product. If it does not fit in one sentence, the idea is not clear yet.

Examples below show the shape of an answer only. Do not reuse their subject; derive yours from the product in front of you.

## Which style fits

Keep one style for the whole surface.

- **Painted scene**: one subject in a calm field, open space left for the text. Warm, hopeful, human products.
- **Cinematic photograph of one object**: a single real thing in simple dramatic light. Calm, serious, trustworthy products.
- **Soft stylized 3D**: one small scene with matte materials and gentle light. Playful or friendly products.
- **Product object render**: a real-looking object from the product, studio-lit with true materials, used as a Moment inside the interface.
- **Light and optics**: one physical phenomenon on a dark field. Technical or data products.
- **Engraving or print**: monochrome ink on a soft tinted page, with matching type and palette. Products with heritage, craft, or an editorial voice.

What fails: decorative abstractions (blobs, orbs, nebulas, chrome liquid, floating cubes, neon circuits, holograms, robots, rockets, crystals); a print style applied to one image while the rest of the surface is a plain modern interface; several subjects or a busy collage; asking a model for film or paper grain, which bakes in a fine checker pattern.

## Composition

- A scene behind a hero is wide, its subject on one side, calm empty space where the headline goes, and the lower fifth calm too if a product view rises over it.
- Text sits on space the image left for it, not on a busy passage. If the layout is a split, center the text block against the visual so neither side leaves a dead corner.
- An object placed into the interface overlaps an edge a little, rotated slightly, with a soft shadow in the ramp's darkest color, so it reads as sitting in the same space as the rest.
- Everything inside one visual tells the same story: if a list shows invoice INV-0142 for a client, a device beside it shows that client, number, and amount.

## On the page

- Match the image edges to the page background. When they cannot match, fade them with a mask or an overlay in the page color; a hard rectangle on a different black is a sign of slop (`signs.md`).
- Give the image fixed dimensions or an aspect ratio and load a hero image with high priority, so the CLS and LCP targets in §9 stay reachable.
- A real `alt` that says what is shown, or empty when the image is purely decorative.
- One slow motion that fits the subject at most. No parallax.
- An asset lives in the project's own assets, not a temporary URL.

## When there is no tool

Say so before the Visuals pass rather than shipping filler. Build what code can carry (the product preview, an object with real materials), leave an empty slot of the exact size and radius for the rest (a plain surface step with no text inside), and put the prompt in the report so the visual can be produced later. A labeled placeholder or a grey box with a caption never ships.

---

Adapted from unslop by Damir Sokolovsky ([@heydamir](https://x.com/heydamir)), CC BY 4.0. See `CREDITS.md`.
