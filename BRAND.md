# Agentflow brand guidelines

> **Better judgment for AI agents.**

These are the messaging guidelines for the Agentflow website, README, developer documentation and announcements. **The product's canonical skill instructions remain in `skills/`; branding must never redefine technical capability.**

## Positioning

| Item | Canonical language |
| --- | --- |
| Name | Agentflow |
| Category | Engineering Skills for AI Agents |
| Primary tagline | Better judgment for AI agents. |
| Supporting line | The right skill for every engineering decision. |
| Short description | Portable engineering skills for AI coding agents. |
| One-sentence pitch | Agentflow helps coding agents choose the smallest relevant set of engineering skills for the decision at hand. |

## Product truth

Agentflow has **one routing skill** (`agentflow`) and **ten specialist skills**. It is a portable collection of `SKILL.md` instructions. The router helps select a skill when engineering decisions are unclear, and specialist skills provide bounded guidance. When the next step is deterministic, the agent should act directly.

Agentflow is **not** a workflow automation service, multi-agent runtime, custom package manager, autonomous coding guarantee, or mandatory SDLC pipeline. Installing only the router does not install the specialists. Host activation, slash commands, updates and plugin refresh policies vary.

## Messaging hierarchy

### Homepage hero

- Eyebrow: Agentic engineering skills
- Headline: Better judgment for AI agents.
- Supporting line: The right skill for every engineering decision. One router and ten specialists help coding agents focus on the reasoning a task needs.
- Primary action: Install Agentflow
- Secondary action: Explore skills

### Developer-facing copy

- Start with the decision, not the skill name.
- One router. Ten specialists.
- Only the reasoning the task needs.
- Portable by design.

### What to avoid

- "The agent automatically implements your entire software lifecycle."
- "Works identically in every agent."
- "Installs all specialists when you install the router."
- "Auto-updates across all clients."
- "Replaces your agent runtime."

Do not imply measured performance, error reduction, cost savings, or security improvements without evidence.

## Verbal identity

- **Tone:** calm, clear, precise, developer-first.
- **Preferred terms:** engineering decision, focused skills, decision routing, router, specialist, portable.
- **Avoid:** autonomous swarm, universal intelligence, zero-error coding, guaranteed outcomes, flow automation.
- Prefer concrete examples and scoped technical claims over generic AI hype.

## Visual identity (existing website baseline)

Current implementation uses a near-black homepage (`#08090a`), off-white text (`#f7f6f2`), Geist for body/interface text, Geist Mono for small technical labels, and Instrument Serif for the large editorial hero. These are the **current implementation tokens**, not an irreversible design mandate.

Use one dominant message, quiet technical decoration, generous whitespace, accessible contrast, and consistent capsule CTAs. A future logo or color redesign should be treated as a separate reviewed design change; do not attach a generic robot, brain or chip symbol to imply functionality not present.

## Brand architecture

```text
Agentflow                 master brand
  agentflow               routing skill
  product-design          specialist
  engineering-design      specialist
  design-graph            specialist
  design-thinking         specialist
  test-engineering        specialist
  code-review             specialist
  security-review         specialist
  production-ops          specialist
  graph-protocol          specialist
  call-graph-output       specialist
```

Keep the specialist names unchanged in the UI, source folders, installation instructions and runtime references.

## Release and distribution language

The public GitHub repository is the canonical skill source. The skills.sh ecosystem and external `skills` CLI are the default distribution path. Claude Code and Codex native plugins are optional **alternatives**; they do not need to be installed alongside portable skills. Do not describe skills.sh as a private immutable Agentflow registry or describe npm website build tooling as an Agentflow CLI.
