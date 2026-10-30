---
name: engineering-design
description: 'Turn a product contract (.agents/product.md) or an architecture-changing request into a minimal, enforceable system contract: responsibilities, state ownership, codebase structure (modules, layers, dependency direction), boundaries and contracts, critical flows, quality guarantees and SLOs, failure and threat analysis, and consequential decisions, before implementation. Use this whenever the user plans or changes system architecture, codebase structure, module or layer boundaries, data ownership or storage, APIs or protocols, external integrations, concurrency or consistency, reliability or uptime targets, or migrations, or asks how to structure, scale, refactor, or pay down tech debt, even if they never say "architecture". Reads .agents/product.md and the existing code. Output is .agents/engineering.md. Does not design function-level code or code patterns (design-thinking), tests (test-engineering), or pipelines (release-engineering).'
---

# Engineering Design

A system is a graph of responsibilities that preserves required product behavior under real constraints. A boundary is not locked until a CI check enforces it. If an element does not trace to a requirement, state owner, boundary, or guarantee, remove it.

```text
In:   .agents/product.md (J, B, X, C, Q, A) + existing code
Out:  .agents/engineering.md
Next: design-thinking

B/X/Q → R → S → K → Flow → G → Challenge → DEC / F
```

## IDs

```text
R  responsibility   S  state        K  module      G  guarantee (cites Q#, B#)
F  fitness rule     DEC decision    D  tech debt   DEP external dependency
A  assumption (continues product.md numbering; tag [blocking] if it determines the architecture)
```

## 1. Context

Read `.agents/product.md`, source, schemas and migrations, public contracts, runtime config, and existing decisions. Extract only what changes the decision: required behavior, the affected part of the existing system, constraints, assumptions.

- Existing system: reconstruct only the affected subgraph. Greenfield: the smallest boundary that satisfies the product contract.
- Open `[blocking]` assumptions that determine the architecture are researched, measured, prototyped, or decided before the design is called settled.
- Never invent scale, latency, availability, traffic, or failure rates. Take them from Q or the user; otherwise record an A#.
- A preference is not a constraint.

Depth follows architectural risk, not line count:

```text
tiny/local change                          → design-thinking only
feature inside existing boundaries         → affected subgraph only
new state owner, boundary, integration,
  or consistency rule                      → this skill
greenfield / architecture-changing         → full method
```

## 2. R: responsibilities

For each B and X: what must the system be responsible for to guarantee it? Write capabilities, not technology (no Kafka, REST, Postgres, microservice at this stage).

Prefer the existing owner. Split only for a concrete reason: different state ownership, lifecycle, trust boundary, scaling need, failure domain, external contract, or change cadence. A new component is a cost and needs a reason.

## 3. S: state, ownership, invariants

Every mutable state that matters gets exactly one authoritative owner.

```text
S1: <state> | owner R# | invariant | concurrent writers
    | RPO <target | A#> | data: public|internal|PII|secret, retention <rule | A#>
```

For races, define the valid outcome first (two writes collide → what is correct?), then pick the mechanism (transaction, optimistic concurrency, idempotency, serialization). Do not impose distributed-systems concerns on local single-writer state. Derived state is recomputable; say which.

## 4. Structure

Default: **modular monolith**. Split into services only with a concrete driver (independent scaling, deployment, team ownership, or fault isolation), after boundaries are proven.

**Layers** (map to real folders in the project; omit Presentation for backend-only):

```text
Presentation → Controller → Logic ← Data
 (UI)           (transport)   (rules)  (persistence / external)
```

| Layer | Owns | Must not |
|---|---|---|
| Presentation | render, UI state | access Data, hold business rules |
| Controller | parse, validate, authorize, map, call Logic | business rules |
| Logic | use cases, domain rules, defines ports | import framework, HTTP, ORM, UI |
| Data | queries, I/O, mapping to domain shapes, implements Logic's ports | business rules |

Dependencies point toward Logic. Logic never imports Data; Data implements interfaces Logic owns.

**Modules** (K1..): named after domain concepts, never "utils" or "helpers". Each has one public entry; internals are private; each owns its data. Cross-module access goes through the public entry or an event, never another module's tables.

**Conventions**: detect first. Follow what the codebase already does; for greenfield adopt the ecosystem's official style guide and enforce it with the linter/formatter. This skill decides only structural conventions: folder layout, module names, public entry points, layer suffixes if used. Do not write a long rule list.

**Patterns**: decide system-level patterns here (layering, ports and adapters, modular monolith), and only when the pattern removes a named force (e.g. an external dependency must be swappable or mockable). Code-level patterns belong to `design-thinking`. No preventive patterns.

## 5. Boundaries and contracts

A boundary exists when two independently meaningful parts need an explicit agreement. Define the minimum contract:

```text
caller → input/event → callee → observable result / state change
```

Include only properties that change the design: ownership, validation and trust boundary, authorization, ordering, idempotency, transaction boundary, sync vs async, caller-visible failure.

**Compatibility rule** (any contract or state change):

```text
code N must work with schema/contract N-1 and N+1 during rollout
breaking change → expand → migrate → contract, each in a separate release
rollback = previous code runs on the new schema
```

**Dependency register** (one line per external dependency):

```text
DEP1: <dep> | build|buy|reuse | behavior when it fails | availability bound | exit cost (lock-in)
```

Default for small teams: managed and boring over novel. Treat external systems and untrusted input as explicit boundaries.

## 6. Flows

Trace only the paths where ordering, ownership, or failure semantics matter: the main success path, then materially different ones (concurrent update, dependency down, partial write, retry after uncertain result, restart, version transition).

```text
Trigger → Boundary → Responsibility → State transition → External effect → Result
```

Use a sequence view when ordering is the question, a responsibility graph when ownership is, and a deployment view only when topology or failure domains change the design.

**First slice** (greenfield): the first traced flow is the thinnest vertical slice crossing every main boundary (entry → Logic → Data → deployed). Build and deploy it before other features, so the architecture is validated end to end early.

## 7. G: guarantees

Start with correctness (what must stay true under pressure), then add reliability, security, performance, scalability, operability, compatibility, or cost only when they can change the architecture. Write each as a scenario:

```text
G1 (Q1, B2) [H|M|L]: when <stimulus> under <condition>, the system <response>,
                     measured by <SLI> ≥ <target> / <window>, measured at <point>
```

- Priority = importance × risk. Only `H` guarantees go through §8.
- Targets come from Q or the user. If absent, A# `[blocking]`. Do not invent numbers.
- Every availability or latency G needs an SLI and a **measurement point**, otherwise the SLO is unverifiable. Exclude expected client errors (4xx) from availability.
- **Bound check**: an availability target must not exceed the product of its critical dependencies' availability (DEP#).
- Start the SLO at what is achievable and tighten later.
- Scalability is a Q, not an assumption. Design the seams (clear state ownership, stateless processes, module boundaries), not the capacity.
- Recovery: durable states carry RPO (§3); each service with an availability G carries an RTO.
- Alert rules, dashboards, and rollout belong to `release-engineering`; this skill defines what must be emitted and measured.

## 8. Challenge

For each `H` guarantee, on its critical flow, ask "what breaks this design?" Fill one table per flow:

```text
Flow | Failure / threat | Blast radius | Containment | Detection signal | Recovery
```

Cover only what applies: dependency failure, restart, duplicate delivery, partial completion, load, unauthorized access, cross-tenant leakage, secret exposure, version transition. For security, do a lightweight threat model at each trust boundary crossed by sensitive data, permissions, or secrets; go deeper only when the risk is high.

Design gap when any holds: a behavior has no R path; a mutable state has no single owner; two boundaries disagree on semantics; a critical failure has no valid resulting state; a quality requirement has no mechanism; a component traces to nothing. Fix gaps before adding architecture.

Also record the top 3 **risks** and **trade-offs** (a decision that helps one quality at the cost of another).

## 9. Decisions and debt

```text
Requirement/guarantee → driver → viable alternatives → smallest choice → consequences
```

Prefer existing over new, single process over distributed, direct call over queue, authoritative over duplicated state, simple transaction over custom consistency protocol, unless a requirement forces otherwise. Technology implements a property; it is never the starting point.

```text
DEC1 [one-way | two-way]: chose A over B. Driver: G#. Trade-off: <what is given up>. Revisit if: <trigger>.
```

- `two-way` (cheap to reverse): decide fast, one line.
- `one-way`: needs a real alternative, trade-off, and revisit trigger.
- Record only consequential decisions: expensive to reverse; changes a boundary, source of truth, protocol, consistency or concurrency model, security boundary, or failure domain; or cross-cutting with real alternatives. Not folder names, minor libraries, naming, or local refactors.
- Replace an entry in place when it changes; git keeps history.

**Debt** is a shortcut taken on purpose. Zero debt is not the goal; unrecorded debt is the failure.

```text
D1: <shortcut> | why now | trigger to pay | owner
```

A violation of an F# rule is allowed only through a D# or a DEC.

## 10. Fitness rules

Boundaries in prose do not hold. Encode them as checks that run in CI.

```text
F1: Logic imports nothing from Data/Controller/Presentation   | ci | enforce
F2: modules are imported only through their public entry      | ci | enforce
F3: no dependency cycles between modules                      | ci | warn → enforce
F4: no cross-module table access                              | ci | enforce
```

Per rule: intent, signal, tool, pass condition, cadence, mode, exception path (→ D#). Use the project's existing tool (dependency-cruiser for JS/TS, ArchUnit for Java, import-linter for Python, arch-go for Go); add a dependency only when the boundary matters and the cost is explicit. For legacy code roll out `measure → warn → enforce`, and do not add a gate that blocks delivery without a migration path. Small projects need only F1 and F2.

Scope: F# covers structure. Behavior tests belong to `test-engineering`, pipeline execution to `release-engineering`, diff checks against F# and D# to `code-review`.

## 11. Ready gate

Ready for `design-thinking` only if all hold:

- every B and X from product.md has a path R → S → flow;
- every mutable state has one owner;
- every Q has a G, or an A# says it is undefined;
- every `H` guarantee has a measurement point and a Challenge table;
- every important boundary has an F# or a stated reason it does not;
- no `[blocking]` A# is open;
- no component lacks a trace to R or G.

If a check fails, fix the contract. Do not pass the gap downstream.

## 12. Persist

Write or update `.agents/engineering.md`. No separate architecture, database, API, scalability, or migration documents by default.

If it exists: read it first, inspect the code that represents the current system, preserve valid decisions, update only the affected subgraph, remove contradictions the change creates. Edit in place, keep it near 150 lines by condensing. Migration and compatibility go in the relevant contract, state, or flow entry, not in a section by ritual.

```markdown
# Engineering

## System
<graph of K and R; edges are contracts>

## Structure
Layers → folders; K1.. with public entry; conventions

## Responsibilities
R1 (B1,B2): ...

## State
S1: ...

## Contracts
K1→K2: ... compat: ...
DEP1: ...

## Flows
<critical flows; first slice marked>

## Guarantees
G1 (Q1,B2) [H]: ...

## Challenge
<table per H flow>

## Decisions
DEC1 [one-way]: ...

## Fitness
F1: ...

## Debt
D1: ...

## Verification
- <command> proves <boundary>        (maintained by test-engineering)

## Release
- <durable distribution, compatibility, recovery context>  (maintained by release-engineering)

## Assumptions / Risks
A4 [blocking]: ...
Risks / Trade-offs: top 3
```

Omit empty sections. The file is a system contract and project memory, not a form to fill.

## Handoff

`design-thinking` consumes K, R, S, contracts and compat rules, flows, G, F, DEC, D. It owns code shapes, call graph, expected errors, resource lifecycle, and code-level patterns. If a code-level need contradicts a decision here, fix the decision here.