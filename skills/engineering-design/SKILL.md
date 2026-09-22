---
name: engineering-design
description: Turn a product contract or architecture-changing request into a minimal system contract by modeling required responsibilities, state ownership, boundaries and contracts, critical runtime flows, quality guarantees, and consequential architectural decisions before implementation. Use for greenfield system architecture, non-trivial feature architecture, cross-module refactors, storage or data-ownership changes, protocol changes, concurrency or consistency changes, external integrations, and production-sensitive system changes. Read .agents/product.md and the existing codebase when present. Do not design function-level code or implementation details; hand those to design-thinking. Record ADRs only for consequential decisions with real alternatives or significant long-term consequences.
---

# Engineering Design

A system is not a stack diagram. It is a graph of responsibilities that preserves required product behavior under real constraints.

```text
B → Graph → System<R, S, G>
│              │      │  │  │
│              │      │  │  └─ guarantees the system must preserve (§6)
│              │      │  └──── state and source-of-truth ownership (§3)
│              │      └─────── responsibilities required by behavior (§2)
│              │
│              └─ nodes = responsibility owners, edges = contracts/data flow
│
└─ required product behavior + constraints
```

```text
§1  Context      product behavior, current system, facts, constraints
§2  R            responsibilities required to produce the behavior
§3  S            state ownership, lifecycle, invariants
§4  Boundary     contracts, trust boundaries, external dependencies
§5  Flow         critical runtime paths and ordering
§6  G            correctness and material quality guarantees
§7  Decisions    smallest architecture choices that satisfy the guarantees
§8  ADR          preserve only consequential decisions
§9  Proof        trace behavior through the system and challenge real risks
§10 Contract     persist the result in .agents/engineering.md
```

Read the required behavior. Inspect the system that already exists. Derive the smallest architecture that can guarantee the behavior. If a component, boundary, technology, or abstraction does not trace to a requirement or guarantee, remove it.

## 1. Establish the engineering context

Start from facts, not architecture preferences.

When present, read:

```text
.agents/product.md
existing source code
schemas and migrations
public contracts
runtime/deployment configuration
relevant existing decisions
```

Extract only what changes the engineering decision:

- **Required behavior** — what the product must observably do.
- **Existing system** — the current responsibilities, owners, state, and boundaries affected by the change.
- **Constraints** — facts that limit valid designs: platform, compatibility, privacy, latency, availability, regulatory, resource, or operational constraints.
- **Assumptions** — unresolved facts that materially affect the design.

For an existing system, reconstruct only the affected current subgraph. Do not redesign the repository from scratch because a local feature changed.

For greenfield work, start from the smallest system boundary that can satisfy the product contract.

Do not treat preferences as constraints. Do not invent scale, latency targets, availability targets, traffic shape, failure rates, or infrastructure requirements.

## 2. Derive R: responsibilities before components

For each required product behavior, ask:

```text
What must the system be responsible for
so this behavior can be guaranteed?
```

Example:

```text
Behavior:
user completes a booking without overlapping an existing booking

        ↓ requires

Responsibilities:
accept booking intent
authorize the actor
detect conflicting schedule
commit the booking atomically
return the resulting booking state
```

Responsibilities are capabilities of the system, not technology choices.

Do not begin with:

```text
microservice
REST API
Kafka
Redis
PostgreSQL
Kubernetes
repository pattern
```

Group responsibilities into an owner only when they need a stable boundary or share the same state and invariants.

Prefer the existing owner when it can satisfy the responsibility without violating its boundary.

Split responsibilities only when there is a concrete reason such as:

```text
different state ownership
different lifecycle
different trust boundary
independent scaling requirement
independent failure domain
separate external contract
materially different change cadence
```

A new component is a cost. It needs a reason.

## 3. Assign S: state ownership and invariants

For every mutable piece of state that matters to the behavior, name one authoritative owner.

```text
State
  ↓ owned by
Responsibility / system boundary
  ↓ preserves
Invariant
```

Determine only what is necessary:

- **Source of truth** — where authoritative state lives.
- **Lifecycle** — how the state is created, changed, and retired.
- **Invariant** — what must never become false.
- **Derived state** — what may be recomputed or copied.
- **Concurrent writers** — whether more than one actor/process can change it at the same time.

Example:

```text
Booking
  ↓ source of truth
Booking store
  ↓ invariant
No two active bookings overlap for the same room and time
```

Do not choose a database because "the app needs a database." Choose a storage or consistency mechanism only when state semantics require it.

When concurrency matters, define the required outcome:

```text
two writes race
  ↓
what result is valid?
```

Then let that requirement drive locking, optimistic concurrency, transactions, idempotency, serialization, or another mechanism later.

Do not force distributed-systems concerns onto state that is local and single-writer.

## 4. Define boundaries and contracts

A boundary exists when two independently meaningful parts of the system need an explicit agreement.

For every necessary boundary, define the minimum contract:

```text
caller / producer
    ↓
input or event
    ↓
callee / consumer
    ↓
observable result / state change
```

Capture semantics that affect correctness:

```text
ownership
validation/trust boundary
authorization boundary
ordering
idempotency
compatibility
transaction boundary
sync vs async
failure visible to the caller
```

Only include a property when it changes the design.

If two responsibilities do not need an independent contract, do not split them merely to make the architecture look layered.

Treat external systems and untrusted inputs as explicit boundaries.

When sensitive data, permissions, secrets, tenant isolation, or untrusted integrations cross the graph, identify the trust boundary and the security property the design must preserve. Do not create a full threat-model exercise unless the security risk requires it.

## 5. Trace critical runtime flows

Architecture is not proven by a static box diagram.

Trace the few runtime paths where ordering, ownership, or failure semantics matter.

```text
Trigger
  ↓
Boundary
  ↓
Responsibility
  ↓
State transition
  ↓
External effect
  ↓
Observable result
```

Start with the main success path.

Then add only materially different paths such as:

```text
concurrent update
dependency unavailable
partial write
retry after uncertain result
permission failure
process restart
compatibility transition
```

Use a sequence/dynamic diagram when ordering is the question.

Use a structure/responsibility graph when ownership is the question.

Use a deployment view only when runtime topology, failure domains, or placement changes the architecture.

Do not generate every C4 level. Use the smallest view that resolves the design question.

## 6. Define G: guarantees that actually constrain architecture

Start with correctness:

```text
What must remain true even when the system is under pressure?
```

Then consider other qualities only when they can change the architecture:

- **Reliability** — recovery, retries, durability, availability.
- **Security** — access, trust boundaries, sensitive data, abuse paths.
- **Performance** — latency, throughput, resource limits.
- **Scalability** — growth that changes ownership, partitioning, or coordination.
- **Operability** — ability to detect, diagnose, and recover from important failures.
- **Compatibility** — old clients, schemas, data, or versions that must coexist.
- **Cost** — when resource cost materially constrains the design.

These are requirements, not mandatory document sections.

Turn vague qualities into concrete scenarios when the evidence exists.

Bad:

```text
must be scalable
must be fast
must be highly available
```

Better:

```text
a worker restart must not lose an accepted job

two concurrent booking attempts for the same slot
must not both commit

an old client must continue reading records
written during the migration
```

Do not invent numeric targets. If a number is required to choose the architecture and is unknown, mark it as an assumption that must be resolved.

Operational requirements belong here when they affect system design. CI/CD mechanics, rollout automation, and release pipeline implementation belong to release engineering.

## 7. Make the smallest architectural decisions

Choose architecture only after responsibilities, ownership, boundaries, flows, and guarantees are understood.

Decision flow:

```text
Requirement / guarantee
        ↓
Decision driver
        ↓
Viable alternatives
        ↓
Smallest choice that satisfies the driver
        ↓
Consequences
```

Prefer:

```text
existing mechanism
        over
new mechanism

single process
        over
distributed coordination

direct call
        over
queue/event bus

authoritative state
        over
duplicated state

simple transaction
        over
custom consistency protocol
```

unless the requirements force the more complex option.

Technology is an implementation of a system property, not the starting point of architecture.

When a proposed technology does not solve a requirement in the graph, remove it.

## 8. Record ADRs only when the decision deserves memory

Do not create an ADR for every choice.

Create one when the decision is consequential, for example when it:

```text
is expensive to reverse
changes a system boundary
changes the source of truth
changes a public/internal protocol
changes the consistency or concurrency model
changes a security boundary
changes deployment topology or failure domains
is cross-cutting across multiple parts of the system
has real alternatives with meaningful trade-offs
```

Do not create ADRs for:

```text
folder names
minor library choices
local refactors
naming
obvious implementation details
style preferences
```

Store consequential decisions under:

```text
.agents/decisions/
```

Use the smallest useful ADR:

```markdown
# <Decision>

Status: accepted

## Context
What engineering problem forces a decision?

## Decision
What was chosen?

## Why
Why does this satisfy the actual drivers better than the meaningful alternatives?

## Consequences
What becomes easier, harder, constrained, or newly required?
```

If a decision changes, supersede the old record rather than silently rewriting its history.

The main engineering contract should reference the decision; it should not duplicate the full rationale.

## 9. Prove the system graph before implementation

Walk from product behavior to system behavior.

For each required product path, verify:

```text
Product behavior
   ↓
responsibility exists
   ↓
state owner is known
   ↓
boundary/contract is defined where needed
   ↓
critical flow reaches the required result
   ↓
relevant invariant/guarantee still holds
```

Challenge the graph with the risks that can actually break it:

```text
concurrent action
dependency failure
restart
duplicate delivery
partial completion
unauthorized access
schema/version transition
load or resource pressure
```

Use only scenarios relevant to the change.

The graph has a design gap when:

```text
required behavior has no responsibility path
mutable state has ambiguous ownership
two boundaries disagree on contract semantics
a critical failure has no valid resulting state
a quality requirement has no architectural mechanism
a component exists without tracing to a requirement or guarantee
```

Resolve those gaps before adding more architecture.

Unknowns that do not block the architecture can remain explicit assumptions. Unknowns that determine the architecture must be researched, measured, prototyped, or decided before pretending the design is settled.

## 10. Persist the system contract

When working in a project, write or update:

```text
.agents/engineering.md
```

Do not create separate architecture, system-design, database-design, API-design, scalability, reliability, or implementation-plan documents by default.

If `.agents/engineering.md` already exists:

1. read it first;
2. inspect the implementation that represents the current system;
3. preserve still-valid system decisions;
4. update only the affected subgraph;
5. remove contradictions created by the new design;
6. do not rewrite unrelated architecture.

Use the smallest structure that makes the system contract unambiguous:

```markdown
# Engineering

## System
<responsibility/boundary graph>

## Responsibilities
- ...

## State & Invariants
- ...

## Contracts
- ...

## Critical Flows
<only flows where ordering/failure matters>

## Guarantees
- ...

## Decisions
- <ADR link or concise decision when no ADR is needed>

## Assumptions / Risks
- ... only unresolved items that materially affect implementation
```

Omit empty or irrelevant sections.

For an existing architecture change, include a compact current → target view only when the transition itself matters.

Migration and backward compatibility belong in the relevant state, contract, flow, or guarantee section; do not create a migration section by ritual.

The artifact is a system contract and project memory, not a form to complete.

## Handoff to Design Thinking

Engineering Design stops at the system boundary.

Pass to `design-thinking`:

```text
required behavior
+
responsibility graph
+
state ownership and invariants
+
contracts and trust boundaries
+
critical runtime flows
+
material guarantees
+
accepted architectural decisions
```

`design-thinking` owns the implementation graph:

```text
domain shapes
function/call graph
expected errors
runtime dependencies
input parsing
cross-cutting behavior
resource lifecycle
test substitution
code
```

Do not duplicate those concerns here unless a system-level decision depends on them.

---

## Proportionality

Do not force this skill onto every code change.

```text
tiny/local implementation change
→ design-thinking / targeted implementation only

feature inside existing boundaries
→ affected engineering subgraph only

new state owner / boundary / integration / consistency rule
→ engineering-design

greenfield or architecture-changing work
→ full engineering-design method
```

The amount of design follows architectural risk, not line count.

---

## The Pipeline

```text
INPUT
  → "What product behavior and constraints must the system guarantee?"
      → read product contract; establish engineering context

  → "What already exists?"
      → reconstruct only the affected current subgraph

  → "What responsibilities are required?"
      → derive R without choosing technology

  → "Who owns each meaningful state and invariant?"
      → define S and source of truth

  → "Where are explicit agreements required?"
      → define boundaries and contracts

  → "Which runtime paths determine correctness?"
      → trace critical flows

  → "What must remain true under relevant failure/load/security conditions?"
      → define G: material guarantees

  → "What architecture choice is actually forced by those properties?"
      → make the smallest viable decisions

  → "Will this decision matter months later?"
      → ADR only when consequential

  → "Can every required behavior traverse the graph without a gap?"
      → prove the system contract

  → .agents/engineering.md
      → hand the system contract to design-thinking
```

**If an architectural element does not trace to required behavior, state ownership, a boundary, or a guarantee, it does not belong in the system.**