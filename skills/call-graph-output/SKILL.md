---
name: call-graph-output
description: Render already-understood call paths, runtime flows, architecture relationships, or orchestration DAGs as compact plain-text graphs when a graph materially improves human understanding. Use for architecture explanations, execution traces, implementation summaries, review evidence, or delegated-work DAGs. Preserve the semantics supplied by the owning skill; do not invent architecture, dependencies, workers, edge types, or verification requirements. Do not emit a graph for every change. Prefer outcome/responsibility labels over filenames, show Production/Tests only when they materially differ, and compare planned vs actual graphs by contract/outcome rather than demanding structural equality.
---

# Call Graph Output

`call-graph-output` is an **output convention**, not a reasoning workflow.

It renders a graph that another skill or analysis has already established.

```text
reasoning / implementation / orchestration
                ↓
          known relationships
                ↓
        call-graph-output
                ↓
      compact human-readable graph
```

It does not decide:

```text
what product behavior should exist
what architecture should exist
how implementation should be designed
whether work should be delegated
what dependencies exist
what testing strategy is correct
whether a security issue exists
```

Those decisions belong to the relevant domain skill.

## 1. Use a graph only when it helps

Use this skill when the user benefits from seeing:

```text
call hierarchy
runtime path
responsibility/dependency flow
branch and join
production vs test substitution
planned vs implemented execution
delegated execution DAG
integration path
failure/recovery path
```

Do not emit a graph merely because code changed.

For a trivial local change:

```text
function renamed
small conditional changed
CSS adjusted
single obvious test added
```

plain prose is usually better.

Core rule:

```text
Use the graph when relationships are easier to understand
than they would be in prose.
```

## 2. Preserve semantics; do not invent them

The graph must come from established evidence:

```text
code
diff
engineering contract
design-thinking graph
graph-protocol DAG
test topology
runtime trace
review finding
```

Do not infer extra nodes or edges just to make the diagram look complete.

If the source only proves:

```text
Handler
→ Service
→ Repository
```

do not add:

```text
Cache
Queue
EventBus
```

because they would be architecturally plausible.

A rendering skill must never create architecture by presentation.

## 3. Choose the graph shape that matches the question

### Linear call path

Use for a mostly sequential path:

```text
HTTP request
  → BookingHandler
    → BookingService
      → BookingRepository
        → PostgreSQL
```

### Branch

Use when one node fans out:

```text
CreateOrder
  ├→ Inventory.reserve
  ├→ Payment.authorize
  └→ Audit.record
```

Do not imply concurrency merely because the graph branches.

If execution semantics matter, label them explicitly.

### Parallel / join

Use only when parallelism is established:

```text
LoadDashboard
  ├─parallel→ loadProfile
  └─parallel→ loadActivity
                 │
                 └────────┐
loadProfile ───────────────┤
                           ↓
                    composeDashboard
```

Prefer a simpler representation when exact join topology is not important.

### Execution DAG

For orchestration, render contracted outcomes and typed edges:

```text
Define booking invariant
  ─decision→ Implement persistence guarantee
  ─data────→ Design concurrency proof

Implement persistence guarantee
  ─data────→ Integrate booking flow

Design concurrency proof
  ─data────→ Integrate booking flow

Integrate booking flow
  → Final verification
```

Do not revert to wave barriers if the actual orchestration uses dependency readiness.

### Conflict

When scheduling conflict matters:

```text
Refactor UserService
  ─write-conflict─ Add UserService feature
```

A conflict edge means:

```text
not safe to mutate concurrently
```

It does not necessarily mean one node consumes the other's output.

## 4. Use explicit edge labels when semantics matter

Default arrow:

```text
A → B
```

means only:

```text
A leads to / calls / passes control or output to B
```

When the distinction matters, use labels such as:

```text
A ─data──────→ B
A ─order─────→ B
A ─decision──→ B
A ─parallel──→ B
A ─retry─────→ B
A ─fallback──→ B
A ─write-conflict─ B
```

Do not over-label every edge.

Label only when an unlabeled arrow would hide an important semantic distinction.

## 5. Name nodes by responsibility or outcome

Prefer:

```text
Validate booking request
Reserve room atomically
Persist booking
Emit confirmation
```

over:

```text
booking.ts
service.ts
repo.ts
line 84
```

Prefer component/service names when they are the actual architectural vocabulary:

```text
BookingHandler
BookingService
BookingRepository
PostgreSQL
```

Use filenames only when the file itself is relevant to the explanation, such as:

```text
migration file
workflow file
configuration file
```

For orchestration graphs, nodes should normally be **contracted outcomes**, not worker names:

Bad:

```text
Agent A
→ Agent B
→ Agent C
```

Better:

```text
Implement backend contract
→ Integrate UI behavior
→ Verify end-to-end flow
```

Worker identity may be shown secondarily when it matters.

## 6. Production and Tests are conditional sections

Do not always emit both.

Use separate sections only when the dependency/call graph materially differs.

Example:

Production:

```text
HTTP handler
  → OrderService
    → PaymentClient
    → OrderRepository
      → PostgreSQL
```

Tests:

```text
HTTP handler
  → OrderService
    → FakePaymentClient
    → MemoryOrderRepository
```

If production and tests share the same meaningful graph, show one graph and mention the substitution in prose if needed.

Do not imply that a fake proves semantics that belong to a real dependency.

Example:

```text
business rule test
→ FakeRepository may be representative

transaction isolation proof
→ real PostgreSQL boundary required
```

That proof decision belongs to `test-engineering`; this skill only renders it.

## 7. Planned vs implemented graphs are not required to be identical

When comparing expected and actual implementation, render both only when the comparison materially helps.

Example:

Expected contract:

```text
Booking request
  → enforce no-overlap invariant
  → persist one valid booking
```

Implemented:

```text
Booking request
  → BookingRepository.create
    → PostgreSQL exclusion/unique constraint
```

These graphs are structurally different but may be contract-equivalent.

Do not annotate:

```text
Mismatch
```

merely because internal nodes differ.

Use the owning review/orchestration skill to establish whether:

```text
required outcome changed
constraint was violated
dependency contract broke
scope materially drifted
verification failed
```

Only then visualize the meaningful difference.

Core rule:

```text
contract equivalence
≠
structural equality
```

## 8. Surface deviations explicitly when relevant

For delegated or adaptive work, a worker may legitimately discover a different implementation path.

When that discovery matters to the reader, show it concisely:

```text
Delegated outcome
  → Idempotent webhook handling

Discovery
  → Existing unique event ID already provides dedup boundary

Implemented
  → WebhookHandler
      → EventRepository.insertUnique
        → duplicate event → no-op
```

Do not print a full orchestration retrospective.

Show only deviations that affect:

```text
contract
architecture
dependency
scope
verification
integration
```

## 9. Integration is a first-class graph when it matters

Independent local results do not prove integrated behavior.

When multiple outputs meet, show the join:

```text
Backend contract ─────┐
                      ├→ Integration
UI behavior ──────────┘
                           ↓
                    Final verification
```

Or:

```text
Persistence guarantee
        ─┐
         ├→ Booking integration
UI completion behavior
        ─┘
              ↓
       E2E verification
```

Do not imply:

```text
backend green
+
frontend green
=
feature green
```

unless integration itself was actually verified.

## 10. Render evidence separately from execution

Do not mix test commands into the main call graph unless verification is itself part of the execution being explained.

Preferred:

Execution:

```text
BookingHandler
  → BookingService
    → BookingRepository
      → PostgreSQL
```

Verification:

```text
Concurrent integration test
  → two overlapping requests
    → one commit
    → one rejected/conflicted
    → no-overlap invariant preserved
```

For delegated work:

```text
Outcome node
  ↓
local verification
  ↓
integration
  ↓
final verification
```

Use verification/evidence labels only when the user needs to see how the result was proven.

## 11. Keep failure paths proportional

Show failure/recovery branches when they are central to the explanation.

Example:

```text
CompleteTask
  → submit completion
    ├→ response received
    │   → mark success
    │
    └→ response lost
        → refresh task
          ├→ completed
          │   → treat as success
          └→ still active
              → show failure
```

Do not enumerate every theoretical exception.

Only render failure paths already established as meaningful by the owning reasoning/review skill.

## 12. Formatting rules

Default format:

```text
plain-text graph
inside a `text` code block
```

Prefer:

```text
→
├→
└→
│
─data→
─order→
─decision→
─parallel→
─write-conflict─
```

Keep indentation consistent.

Use concise node names.

Avoid:

```text
Mermaid
Graphviz
ASCII boxes around every node
decorative borders
emoji
long prose inside nodes
```

unless the user explicitly asks for another format.

A graph should be scannable in a few seconds.

## 13. Relationship to other skills

### `design-thinking`

Supplies implementation/runtime relationships.

```text
design-thinking
→ implementation graph
→ call-graph-output
```

Call Graph Output does not perform implementation reasoning.

### `engineering-design`

Supplies responsibilities, boundaries, contracts, and critical flows.

```text
engineering-design
→ system graph
→ call-graph-output
```

### `design-graph`

Already owns interface graph reasoning.

Use `call-graph-output` only when a compact text rendering of that relationship is useful.

Do not replace richer interface reasoning with a generic call graph.

### `graph-protocol`

Supplies the adaptive execution DAG.

```text
graph-protocol
→ contracted nodes
→ typed edges
→ integration/final verification
→ call-graph-output
```

Call Graph Output may render:

```text
data dependencies
ordering dependencies
decision dependencies
write conflicts
integration joins
```

but must not invent them.

### `code-review`

May supply expected vs actual implementation paths or a concrete failure path.

Call Graph Output renders that evidence when visualization helps explain a finding.

### `test-engineering`

May supply a test topology or proof path.

Call Graph Output renders it without deciding whether that proof is faithful.

## 14. Proportionality

Use the smallest graph that answers the question.

```text
one simple call chain
→ linear graph

one meaningful branch
→ branch graph

multiple dependent outcomes
→ compact DAG

production/test differ materially
→ separate Production / Tests

planned/actual differ materially
→ separate Expected / Actual

integration is the risk
→ show integration join
```

Do not show every layer of the repository.

Do not reproduce a whole architecture when one critical path is the point.

---

## Output Pipeline

```text
KNOWN RELATIONSHIPS
        ↓
"What question should the graph make obvious?"
        ↓
choose:
call path / branch / DAG / comparison / integration
        ↓
"Which nodes materially matter?"
        ↓
use responsibility/outcome labels
        ↓
"Do edge semantics matter?"
        ↓
label only important data/order/decision/conflict edges
        ↓
"Do environments differ?"
        ↓
Production / Tests only when materially different
        ↓
"Is there a meaningful deviation or integration proof?"
        ↓
show only if relevant
        ↓
PLAIN-TEXT GRAPH
```

**Render the relationships that are already known. Do not let the output format become a second architecture or orchestration method.**