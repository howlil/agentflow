---
name: product-design
description: Turn raw app or feature ideas, or changes to an existing product, into a minimal testable product contract by modeling the user problem, job, observable behavior, scope, constraints, edge cases, and proof before engineering design or implementation. Use for greenfield product definition, feature brainstorming or refinement, and product-level review. Do not choose technical architecture or implementation; use design-graph only when interface surfaces or interaction need explicit modeling.
---

# Product Design

A product is not a feature list. It is a behavior graph that moves a person from a real trigger or problem to a useful outcome.

```text
X → Graph → Product<J, B, P>
│              │      │  │  │
│              │      │  │  └─ proof that the outcome is reached (§7)
│              │      │  └──── observable product behavior       (§3)
│              │      └─────── job / outcome the user needs      (§2)
│              │
│              └─ nodes = meaningful states, edges = user/system moves
│
└─ the context: who is trying to do what, when, and why
```

```text
§1  Context      actor, trigger, current behavior, problem
§2  J            job and desired outcome
§3  B            happy path as observable behavior graph
§4  Breaks       meaningful edge and failure states
§5  Constraints  facts that limit the product behavior
§6  Scope        smallest behavior that closes the job
§7  P            acceptance traces and outcome proof
§8  Interface    hand interaction detail to design-graph when needed
§9  Contract     persist the result in .agents/product.md
```

Read the problem. Draw the behavior that gets the user to the outcome. Keep only what the outcome requires. If a behavior does not trace to the job or its proof, cut it.

## 1. Establish the context

Name only what changes the product decision.

- **Actor** — the person or role trying to get something done. Do not invent a persona.
- **Trigger** — what causes the need now.
- **Current behavior** — how the job is done today, if known.
- **Problem** — what prevents, slows, or complicates the desired outcome.
- **Evidence** — observed facts, research, existing product behavior, or user-provided facts.

Separate evidence from assumptions. If something is plausible but unverified, mark it as an assumption instead of turning it into product truth.

If the input starts with a proposed feature, back up until the underlying job and problem are clear enough to judge whether the feature is necessary.

## 2. Define J: the job and outcome

Ask what the actor is actually trying to accomplish.

```text
Trigger
  ↓
Job
  ↓
Desired outcome
```

Write the job in terms of the result the user wants, not the mechanism the product might use.

Bad:

```text
User needs an AI dashboard.
```

Better:

```text
After a work session, the user needs to reconstruct where their computer time went without manually logging every activity.
```

The product may change. The job should remain meaningful.

Do not add goals such as engagement, retention, virality, automation, or AI unless they are part of the actual problem or constraints.

## 3. Think B first

Map the smallest successful product behavior before thinking about screens or architecture.

```text
State
  ↓ user action
System response
  ↓
Next state
  ↓
Outcome
```

Example shape:

```text
Need exists
  ↓ user starts
Product accepts intent
  ↓
Product performs the required behavior
  ↓
User sees or receives the result
  ↓
Job completed
```

Nodes are meaningful product states. Edges are observable user or system moves.

For each edge, be able to answer:

```text
What does the user do?
What does the product do in response?
What becomes true next?
```

Describe behavior, not implementation.

Do not introduce:

```text
database
API
service
queue
cache
framework
component tree
deployment
```

Those belong to engineering design or implementation.

If the product already exists, model only the changed subgraph plus the existing states it connects to. Do not redesign the whole product for a local feature.

## 4. Mark where the product behavior breaks

Add only edge cases that materially change what the user experiences or what the product must guarantee.

Typical examples:

```text
required input missing
invalid action
nothing exists yet
permission denied
operation interrupted
conflicting action
result unavailable
destructive action needs confirmation
```

Model them on the same graph:

```text
Action
 ├─ valid   → expected result
 ├─ invalid → recoverable state
 └─ denied  → unavailable path
```

Do not enumerate theoretical edge cases by ritual. If an edge case would not change product behavior or engineering requirements, leave it out.

## 5. Apply real constraints

Constraints are facts that narrow valid product behavior.

Examples:

```text
must work offline
must keep data local
must support a specific role
must preserve an existing workflow
must fit a platform restriction
must meet a legal or privacy requirement
```

Do not turn preferences into constraints.

Do not invent market facts, user behavior, scale, business targets, or success metrics. When a claim materially affects the design and is not established, either research it or record it as an assumption.

## 6. Cut to the smallest complete scope

Scope is the minimum graph that takes the user from trigger to outcome without a broken path.

For every capability or branch ask:

```text
Does removing this prevent the job from being completed correctly?
```

If no, remove or defer it.

Keep a non-goal only when it prevents an obvious misunderstanding or scope expansion. Do not build a backlog inside the product contract.

For greenfield work, define the smallest coherent product loop.

For an existing product, define only the behavior being added, changed, or removed.

## 7. Define P: prove the product behavior

Every important path needs observable proof.

Prefer acceptance traces:

```text
Given <meaningful starting state>
When <user action or trigger>
Then <observable product outcome>
```

or a compact graph:

```text
Trigger → Action → Product response → Result
```

Proof should describe what must be true, not how engineers must implement it.

Use product metrics only when measurement is part of the decision. Do not invent numeric targets to make the document look complete.

A product contract is ready for engineering when the core job, behavior, material breaks, scope, and proof can be understood without guessing the intended experience.

## 8. Hand interface detail to Design Graph

When the behavior is human-facing and surface or interaction structure matters, use `design-graph`.

Pass it:

```text
Job
+
Behavior graph
+
Constraints
+
Product proof
```

`design-graph` owns:

```text
surfaces
moves between surfaces
content and void states
interaction boundaries
attention/focus behavior
responsive surface behavior
```

Product Design owns what the product must enable and guarantee. Design Graph owns how that behavior is expressed through the interface.

Do not duplicate Design Graph inside this skill.

If interface modeling exposes a contradiction in the product behavior, fix the product graph rather than hiding the mismatch in the UI.

## 9. Persist the product contract

When working in a project, write or update:

```text
.agents/product.md
```

Do not create separate PRD, requirements, scope, journey, or product-strategy documents unless the task explicitly requires them.

If `.agents/product.md` already exists:

1. read it first;
2. preserve still-valid product decisions;
3. update only the affected subgraph;
4. remove contradictions created by the new decision;
5. do not rewrite unrelated product context.

Use the smallest structure that makes the contract unambiguous:

```markdown
# Product

## Problem
Actor:
Trigger:
Problem:
Desired outcome:

## Behavior
<product behavior graph>

## Constraints
- ...

## Scope
In:
- ...

Out:
- ...

## Proof
- Given ..., when ..., then ...

## Assumptions
- ... only unresolved assumptions that matter
```

Omit empty or irrelevant sections. The artifact is project memory, not a form to complete.

---

## The Pipeline

```text
INPUT
  → "Who is trying to do what, and what triggers it?"
      → establish context; separate evidence from assumptions

  → "What outcome are they actually trying to reach?"
      → define J: job and desired outcome

  → "What is the smallest successful observable behavior?"
      → draw B: product behavior graph

  → "Where can that behavior meaningfully break?"
      → annotate only material edge/failure states

  → "What facts constrain valid behavior?"
      → apply real constraints

  → "What can be removed without breaking the job?"
      → cut to the smallest complete scope

  → "What observable result proves this works?"
      → define P: acceptance traces / outcome proof

  → "Does interaction structure need explicit modeling?"
      → invoke design-graph only when needed

  → .agents/product.md
      → the product contract IS the graph projected into project context
```

**If a behavior does not trace to the job or its proof, it does not belong in the product.**