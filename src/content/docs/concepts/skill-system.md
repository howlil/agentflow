---
title: Skill system
description: The product and engineering model behind Agentflow.
---

Agentflow is not primarily a catalog. It is a **routing product**.

## Product design

The user's job is not:

```text
learn ten internal skill names
```

It is:

```text
have a real engineering task
        ↓
identify what is unclear
        ↓
choose the smallest useful reasoning tool
        ↓
make progress with the right output
```

That changes the information architecture.

### Homepage

The homepage is goal-first. Skill names are secondary metadata.

### Skill pages

Every skill page answers:

```text
What decision does this skill own?
When should I use it?
When should I not use it?
What goes in?
What comes out?
What prompt can I try?
Where can it hand off?
```

### Recipes

Recipes show composition without inventing a mandatory lifecycle.

```text
task
  ↓
decision A → skill A
  ↓
decision B only if it exists → skill B
```

## Engineering design

The required responsibilities are content loading, docs navigation, search, presentation, build proof, and static delivery.

```text
MD/MDX
  ↓
Astro content
  ↓
Starlight
  ↓
Tailwind
  ↓
static dist/
  ↓
Cloudflare
```

No database, API service, CMS, queue, cache, authentication layer, or SSR runtime is justified by the current product contract.

## Source of truth

```text
SKILL.md
  → agent runtime behavior

human docs
  → discovery, usage, examples, composition
```

When canonical skill packages are added, docs should link to or derive stable metadata from those files instead of copying complete instructions.

## Why static Cloudflare hosting

```text
bad content/config
  ↓
build fails
  ↓
production remains on the previous valid artifact
```

Runtime stays small:

```text
request
  → Cloudflare edge
  → static asset
```
