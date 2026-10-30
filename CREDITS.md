# Credits

Agentflow source is MIT licensed (see `LICENSE`), with one exception described here.

## Adapted material: unslop

The following files adapt [unslop](https://github.com/heydamir/unslop) by Damir Sokolovsky ([@heydamir](https://x.com/heydamir)), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/):

- `skills/design-graph/references/direction.md`
- `skills/design-graph/references/craft.md`
- `skills/design-graph/references/signs.md`
- `skills/design-graph/references/tokens.md`
- `skills/design-graph/references/visuals.md`

They are revised for Agentflow's graph-first contract: the direction is durable project memory rather than a per-run decision, the passes defer focus, announcements, reduced motion, and environment to `design-graph` §6/§7, and every file drops unslop's scripts, story-video pipeline, image-asset references, and code-effect recipes. Each adapted file keeps its attribution line.

These five files remain **CC BY 4.0**, not MIT. They may be copied and adapted with attribution; the MIT grant in `LICENSE` does not relicense them.

## Not adapted

unslop's executable parts are intentionally absent: `scripts/snapshot.mjs`, the story-video renderer, and the bundled reference screenshots. Agentflow skills are portable instructions, not an orchestration runtime, so a visual treatment, a screenshot, or a video pipeline cannot be a dependency of a skill.
