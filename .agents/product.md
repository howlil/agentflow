# Product

## Problem

Actor: software engineer using a small library of reusable agent skills.

Trigger: they have a concrete engineering task but are unsure which skill is relevant, whether a skill is needed at all, or how multiple skills should compose.

Problem: a flat list of skill names forces users to memorize internal taxonomy. Copying full `SKILL.md` files into documentation also creates duplication and drift.

Desired outcome: the user can move from a real task to the smallest useful skill, understand how to invoke it, see the expected output, and know when another skill becomes relevant.

## Behavior

```text
real task
  ↓
identify the unresolved decision
  ↓
route to the smallest useful skill
  ↓
show use / don't-use boundary
  ↓
show example invocation + expected outcome
  ↓
handoff only if another decision becomes non-trivial
```

Three supported modes:

```text
describe task
  → automatic routing

explicit skill request
  → use that skill

explicit composition
  → combine only the relevant responsibilities
```

## Constraints

- Skills are decision tools, not mandatory lifecycle stages.
- `SKILL.md` remains the runtime source of truth when skill packages are added to this repository.
- Human docs explain discovery, usage, examples, and composition; they should not copy the entire runtime contract.
- The documentation must be easy to scan and work well as a static site.
- Hosting target is Cloudflare.
- Styling uses Tailwind CSS.

## Scope

In:
- goal-first homepage
- quickstart
- choose-a-skill router
- one usage page for each of the 10 skills
- real multi-skill recipes
- product/system rationale
- Cloudflare deployment instructions

Out:
- user accounts
- comments
- CMS
- analytics dashboard
- runtime skill execution
- agent orchestration service

## Proof

- Given a user wants to define unclear feature behavior, when they use the router, then they can identify `product-design` without reading all ten skill pages.
- Given a user has a simple local change, when they read the routing model, then the docs make clear that no specialist skill may be necessary.
- Given a task spans UI behavior and implementation behavior, when the user opens a recipe, then responsibilities are separated rather than presented as a mandatory pipeline.
- Given a runtime skill changes later, the human docs can link to or summarize that source without requiring a copied full `SKILL.md`.
