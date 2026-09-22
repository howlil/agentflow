---
name: design-thinking
description: Turn an engineering contract or local implementation request into a concrete implementation graph covering domain shapes, success flow, execution semantics, expected failures, contextual capabilities, trust boundaries, runtime policies, resource lifetimes, targeted verification, and code. Use when deciding how a known system contract becomes implementation. Do not own product behavior, system architecture, code review, security review, production operations, or non-trivial test strategy. Use Effect-specific A/E/R, Layer, Stream, Scope, and API conventions only when the repository actually uses Effect or the task explicitly requests Effect-style modeling; inspect the installed Effect version before generating version-specific code.
---

# Design Thinking

Design Thinking turns a known engineering contract into an implementation graph.

```text
X → Implementation Graph → Program<A, E, R>
│                              │     │  │  │
│                              │     │  │  └─ contextual capabilities (§5)
│                              │     │  └──── expected failures        (§4)
│                              │     └─────── successful values/flow  (§2)
│                              │
│                              └─ Effect<A, E, R> when Effect is used
│
└─ engineering contract or local implementation task
```

```text
§1  Shapes        domain records, IDs, variants, errors
§2  A             successful transformation / call graph
§3  Execution     cardinality, ordering, concurrency, interruption
§4  E / Cause     expected failures, defects, interruption, recovery ownership
§5  R             contextual capabilities and provisioning
§6  Boundaries    decode external ingress; encode external egress
§7  Policies      retry, timeout, caching, tracing, limits, recovery
§8  Scope         resource and child-work lifetime
§9  Verification  smallest faithful proof
§10 Effect        project graph onto the installed Effect version when applicable
§11 Code          implementation paths should trace back to the graph
```

Read the engineering contract or local task. Model only the implementation semantics that matter. Then write code whose consequential paths can be explained by that graph.

Do not redesign the product or system architecture here.

## 1. Name the shapes

Define the values that actually move through the implementation.

Typical shapes:

- **Records** — domain values with meaningful fields.
- **IDs** — identifiers when identity matters.
- **Variants** — explicit alternatives or states.
- **Errors** — expected failure values when callers can meaningfully handle them.
- **Commands / events** — when behavior is driven by requests or emitted facts.

Use stronger types when they remove real ambiguity or invalid states.

Do not require every ID to be branded, every primitive to become a wrapper, or every internal structure to become a named domain type.

Prefer the simplest representation that preserves the important invariant.

Example:

```text
BookingRequest
Booking
RoomId
BookingStatus = Pending | Confirmed | Cancelled
BookingConflict
```

The shapes are the nouns. The graph is the behavior between them.

## 2. Think A first: successful flow

Map the successful transformation before error handling.

```text
Input
  ↓
F1
  ↓
F2
  ↓
F3
  ↓
Output
```

For each node ask:

```text
What value comes in?
What value comes out?
What state changes?
What external effect occurs?
```

The happy path should remain easy to read even after failure and runtime policy are added.

Do not force every operation into a service or abstraction. A local function can stay a local function when that is where the behavior belongs.

If the system contract already defines responsibility boundaries, preserve them unless implementation evidence shows a real contradiction that must go back to `engineering-design`.

## 3. Model execution semantics separately

Cardinality, execution ordering, concurrency, and freshness are different concerns.

### Cardinality

Ask whether the computation produces:

```text
one result
or
incremental / many results over time
```

A collection returned once is still a one-shot result:

```text
Program<ReadonlyArray<User>, ...>
```

It does not automatically require a stream.

Use streaming only when incremental consumption, continuous emission, backpressure, or long-lived flow is actually part of the behavior.

### Ordering

Mark edges where order matters:

```text
A
↓
B
↓
C
```

Do not parallelize steps merely because they can technically run concurrently.

Example:

```text
reserveStock
    ↓
chargePayment
```

may require ordering because the state transition semantics depend on it.

### Concurrency

When independent work may overlap, mark the intended execution explicitly:

```text
fetchProfile ──┐
               ├─ parallel → composeUser
fetchSettings ─┘
```

Possible execution forms include:

```text
sequential
parallel
bounded concurrency
race
background / forked
```

For concurrent work ask:

```text
What may run at the same time?
What ordering must still hold?
What shared state exists?
What happens if one branch fails?
What happens if the parent is cancelled/interrupted?
```

### Freshness / caching

Caching is a policy axis, not cardinality.

When caching matters define only the semantics required:

```text
always recompute
memoized
TTL
explicit invalidation
deduplicate concurrent lookups
```

Do not add caching because a result is "time-bounded" unless the product/system contract actually permits stale data and benefits from reuse.

## 4. Model failure correctly: E, defects, interruption

Do not treat retry, fallback, and `die` as equivalent kinds of failure.

Model outcomes as:

```text
Node
 ↓
Outcome
 ├─ Success A
 │
 ├─ Expected failure E
 │    ├─ propagate
 │    ├─ map
 │    ├─ recover
 │    ├─ retry
 │    └─ fallback
 │
 ├─ Defect
 │    └─ unexpected/programmer/runtime failure
 │
 └─ Interruption
      └─ cancellation + finalization semantics
```

### Expected failure

Use `E` for failures that are part of the program's expected contract and can be reasoned about by callers.

Examples:

```text
BookingConflict
NotFound
PermissionDenied
RateLimited
ValidationError
```

For each expected failure decide who semantically owns the policy:

```text
operation itself
caller
service boundary
transport boundary
```

Handle it at the narrowest boundary that actually owns the recovery policy.

Example:

```text
loadCache(id)
  └─ CacheMiss
       ↓ local recovery
     loadDatabase(id)
```

This local recovery is clearer than forcing every error to an outermost handler.

### Defect

A defect is not just another `E` strategy.

Examples:

```text
impossible invariant
unexpected null from trusted code
bug in implementation
unrecoverable runtime assumption
```

Normally allow defects to propagate to the runtime/appropriate boundary unless there is a deliberate containment policy.

Do not convert every defect into a domain error merely to make the type look complete.

### Interruption

When work can be cancelled/interrupted, reason about:

```text
what may stop
what must finish
what must be cleaned up
what state may already have changed
what child work inherits cancellation
```

Interruption semantics matter especially around concurrency and resources.

### Error translation

Translate low-level failures where abstraction ownership changes.

Example:

```text
SqlError
  ↓ repository boundary
DatabaseError
  ↓ service boundary
BookingFailure
  ↓ transport boundary
API error
```

Do not leak implementation-specific failures through boundaries that should hide them.

## 5. Model R as contextual capability, not every dependency

`R` represents capabilities required from context to execute the computation.

Good candidates:

```text
UserRepository
Clock
EmailSender
Config
PaymentGateway
FileSystem
```

Not every value belongs in `R`.

Use ordinary arguments for request/local data:

```text
findUser(userId)
```

`userId` is data, not a contextual service.

Distinguish:

```text
request/local data
→ function arguments

stable substitutable capability
→ R / contextual service

dependency required only to construct a service
→ satisfy during construction / Layer
```

Do not leak service-construction dependencies into every consumer merely because the implementation happens to need them internally.

Use dependency injection only where substitution, lifecycle, configuration, or boundary ownership makes it useful.

Do not create one service interface per function.

## 6. Decode at every external trust transition

Every external ingress is a trust boundary.

Examples:

```text
HTTP request
message queue payload
third-party response
environment/config
file contents
database data crossing a separately trusted boundary
CLI input
webhook
```

Model:

```text
unknown / external
        ↓
decode / parse / validate
        ↓
domain representation
```

Inside that validated boundary, do not repeatedly parse the same value without a new trust transition.

But decoding proves only the constraints represented by the decoder/schema.

It does not automatically prove:

```text
authorization
ownership
freshness
business invariants
cross-record consistency
transaction safety
```

Those belong to their actual semantic owners.

At external egress, encode to the external contract when needed:

```text
domain value
    ↓
encode / serialize
    ↓
external representation
```

Reuse one schema only when the semantics are genuinely the same.

Do not force:

```text
transport representation
persistence representation
domain representation
```

to share one schema merely to avoid duplication.

When the repository uses Effect Schema, use the installed version's decode/encode APIs.

## 7. Compose runtime policies as real semantics

Runtime policies include:

```text
retry
timeout
recovery/fallback
caching
logging
tracing
rate/concurrency limits
scheduling
```

These are not decoration.

They can change:

```text
A
E
R
control flow
number of executions
timing
cancellation behavior
resource usage
```

Keep policies visually separate from the core domain flow when that improves readability, but model their semantic effect.

### Retry safety

Never derive:

```text
network timeout
→ retry
```

automatically.

First ask:

```text
Can the operation be repeated safely?
```

Model:

```text
retry candidate
    ↓
repeat-safe / idempotent?
    ├─ yes → define retry policy
    └─ no  → define one of:
             idempotency key
             deduplication
             status reconciliation
             uncertain-result handling
             no automatic retry
```

Example:

```text
chargePayment
  ↓ response timeout
```

Blind retry may double-charge unless the operation has a safe repeat strategy.

### Timeouts

Timeouts are semantic choices.

Ask:

```text
What happens to the underlying work after the caller times out?
Can it still commit?
Can the caller retry?
How is an uncertain result reconciled?
```

Do not treat timeout as equivalent to "operation did not happen."

### Caching

If caching changes freshness or consistency, make that visible in the graph.

### Logging/tracing

Instrumentation should observe the implementation without becoming the implementation's domain control flow unless the contract actually depends on it.

## 8. Scope resources and child work

For resources such as:

```text
database connections
file handles
sockets
streams
child processes
temporary resources
subscriptions
```

model:

```text
acquire
  ↓
owner scope
  ↓
use
  ↓
child work / fibers
  ↓
release/finalization
```

The implementation must make resource lifetime explicit enough that cleanup follows the intended owner lifecycle.

When Effect is used, scoped resource combinators and `Scope` should represent that lifetime according to the installed version.

Do not state resource cleanup as a generic "type guarantee." The guarantee comes from using the runtime's scoped acquisition/finalization semantics correctly.

For forked/background work ask:

```text
Does it belong to the parent's scope?
Should interruption cancel it?
Can it outlive the request?
Who owns cleanup?
```

Unowned background work is a lifecycle bug waiting to happen.

## 9. Choose the smallest faithful verification

Verification is part of implementation, but not every test problem belongs here.

For obvious cases:

```text
pure business rule
→ targeted unit test

simple bug
→ direct regression test

existing integration pattern clearly proves it
→ use that pattern
```

Use `test-engineering` when testing itself requires design:

```text
transaction semantics
concurrency/race
migration compatibility
async/queue semantics
failure/recovery
complex integration boundary
flaky/brittle suite
```

### Substitute R only when fidelity is preserved

A fake dependency is useful when the property under test lives above that boundary.

Examples:

```text
business decision
→ fake repository may be sufficient

time-based retry policy
→ controllable/test clock may be sufficient
```

Use the real dependency when correctness belongs to that dependency's semantics:

```text
SQL uniqueness
→ real DB

transaction isolation
→ real DB + concurrency

filesystem semantics
→ real filesystem boundary

HTTP serialization
→ real integration boundary

migration behavior
→ real migration against representative schema/data
```

Do not claim that swapping `R` proves the whole graph correct.

It proves only the behavior whose semantics are preserved by that substitution.

Core rule:

```text
Choose the smallest test
that faithfully proves
the actual risk.
```

## 10. Project to Effect only when Effect is actually used

The graph model is language/framework-neutral.

Use Effect-specific projection only when:

```text
the repository uses Effect
or
the task explicitly requests Effect-style implementation
```

Before writing Effect API-specific code:

```text
inspect package.json / lockfile
        ↓
identify installed Effect version
        ↓
use matching repository APIs/docs/patterns
```

Do not write APIs from another Effect version.

### A / E / R projection

When applicable:

```text
A
→ success value/data flow

E
→ expected typed failure

R
→ contextual capabilities required to run
```

Defects and interruption are not simply extra variants of `E`; reason about the runtime/Cause model appropriate to the installed version.

### `Effect.gen`

Use `Effect.gen` when it makes sequential success flow clearer.

Do not impose:

```text
gen body = all A
outer pipe = all E
```

as a correctness invariant.

Better rule:

```text
Keep the happy path visually dominant.

Handle an expected failure at the narrowest boundary
that owns its recovery policy.
```

Examples:

```text
uniform recovery for the whole workflow
→ outer composition may be appropriate

operation-specific fallback
→ local handling around that operation

boundary error translation
→ handle at the boundary

caller-owned failure
→ propagate in E
```

### `.pipe()`

`.pipe()` is composition syntax, not proof that the graph is unchanged.

Combinators inside a pipe may alter:

```text
A
E
R
execution count
timing
concurrency
cancellation
resource behavior
```

Use `.pipe()` where it improves composition/readability, while reasoning about the real semantics of each combinator.

### `Layer`

Use Layer/provisioning to satisfy contextual capabilities and service-construction dependencies where appropriate.

Do not expose construction dependencies in service interfaces when they can be discharged during provisioning.

### `Stream`

Use Stream for incremental/multi-emission computations when its semantics are actually needed.

Do not convert every collection or paginated result into Stream by default.

## 11. Write code that traces to the graph

The graph is a model, not an absolute source of truth.

Every consequential implementation path should trace back to it.

Consequential means behavior such as:

```text
data transformation
state transition
dependency
expected failure
recovery policy
concurrency/ordering
trust boundary
resource lifetime
external effect
```

If code introduces consequential behavior that the graph cannot explain:

```text
either the implementation is wrong
or the graph is incomplete
```

Update the correct side.

Do not force minor syntax, helper extraction, or incidental language detail into the graph.

The graph exists to make important semantics explicit, not to mirror every line of code.

---

## Relationship to other skills

### `product-design`

Owns:

```text
what product behavior is required
```

Design Thinking does not reopen product scope during implementation.

### `engineering-design`

Owns:

```text
system responsibilities
state ownership
boundaries/contracts
system guarantees
architectural decisions
```

Design Thinking consumes that contract and decides how the local software graph implements it.

If implementation reveals an architectural contradiction, return the issue to `engineering-design`.

### `design-graph`

Use when implementation includes non-trivial interface interaction/state.

`design-graph` owns surface/move/void/attention modeling.

Design Thinking owns the software/runtime behavior behind that interface.

### `test-engineering`

Design Thinking owns obvious targeted verification.

`test-engineering` owns verification when the proof boundary or environment itself requires design.

### `security-review`

Design Thinking implements known security controls.

`security-review` determines whether changed trust/authority/data paths violate a security property.

### `code-review`

Design Thinking is forward reasoning:

```text
intent / engineering contract
→ implementation graph
→ code
```

Code Review is reverse reasoning:

```text
code / diff
→ actual graph
→ compare with intent
```

Do not use Design Thinking as a substitute for post-implementation review.

### `production-ops`

Production Ops owns runtime health, observability, incident response, and recovery requirements.

Design Thinking implements application-level changes required by those operational properties.

---

## Proportionality

Depth follows implementation risk.

```text
tiny local change
→ inspect → change → targeted verification

normal behavior change
→ shapes + success flow + expected failure + dependencies

state / boundary / concurrency / resource change
→ model the affected execution graph explicitly

complex/high-risk implementation
→ use the full method
```

Do not force all sections onto every change.

Use only the parts that can change correctness or maintainability.

---

## The Pipeline

```text
ENGINEERING CONTRACT / LOCAL TASK
        ↓
"What values exist?"
        → define only meaningful shapes

        ↓
"What successful transformation must happen?"
        → draw A: implementation/call graph

        ↓
"What ordering, cardinality, concurrency, or interruption matters?"
        → execution semantics

        ↓
"What expected failures exist?"
"What defects/interruption matter?"
        → E / runtime failure model

        ↓
"What contextual capabilities are required?"
        → R / provisioning

        ↓
"Where does external data cross trust boundaries?"
        → decode ingress / encode egress

        ↓
"What runtime policies change semantics?"
        → retry / timeout / cache / recovery / limits

        ↓
"What resources or child work have lifetimes?"
        → scope / finalization

        ↓
"What is the smallest faithful proof?"
        → targeted verification
        → test-engineering only if proof itself is non-trivial

        ↓
"Does this repo actually use Effect?"
        ├─ no  → preserve language-native implementation
        └─ yes → inspect installed version and project graph to Effect

        ↓
CODE
```

**Every consequential implementation path should trace to the graph. If code introduces behavior, dependency, failure, concurrency, boundary, or lifetime semantics that the graph cannot explain, either the implementation or the graph is incomplete.**