# Product

## Problem

Actor: software engineer using a small library of reusable agent skills.

Trigger: they have a concrete engineering task but are unsure which skill is relevant, whether a skill is needed at all, or how multiple skills should compose.

Problem: a flat skill catalog forces users to memorize internal taxonomy. Copying runtime skill instructions into human docs creates duplication and drift.

Desired outcome: move from a real task to the smallest useful skill, understand how to invoke it, see the expected output, and inspect the canonical runtime reference when needed.

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
offer generated canonical runtime reference
  ↓
handoff only if another decision becomes non-trivial
```

## Constraints

- Skills are decision tools, not mandatory lifecycle stages.
- `skills/*/SKILL.md` is the runtime source of truth.
- Canonical metadata and full runtime reference are generated from `SKILL.md`, never manually copied.
- Human docs own discovery, usage, examples, and composition.
- The documentation is static, hosted on Cloudflare, and styled with Tailwind CSS.

## Scope

In:
- goal-first homepage
- quickstart and skill router
- one human usage page for each skill
- generated runtime reference for all ten canonical skills
- multi-skill recipes
- product/system rationale
- Cloudflare deployment instructions

Out:
- user accounts
- comments
- CMS
- analytics dashboard
- runtime skill execution service

## Proof

- A user can identify `product-design` from an unclear feature task without reading all ten skills.
- A simple local change can correctly result in no specialist skill.
- Multi-domain tasks show separate ownership rather than a mandatory pipeline.
- Changing a canonical skill description updates generated homepage metadata and runtime reference on the next build.
- Missing/unexpected/misnamed skill packages fail before deployment.
