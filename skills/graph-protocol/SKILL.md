---
name: graph-protocol
description: Orchestrate delegated engineering work as an adaptive execution DAG of contracted outcomes, dependencies, conflicts, evidence, and integration. Use when delegation materially helps through specialization, independent parallel work, context isolation, or separate verification. Do not delegate merely because a task is medium/large or because multiple agents are available. Nodes are outcome contracts, not files. The coordinator owns scheduling, conflict avoidance, replanning, integration, and final verification; worker output is untrusted until supported by evidence.
---

# Graph Protocol

Graph Protocol is orchestration only.

It decides:

```text
who does what
what depends on what
what may run in parallel
what context crosses each edge
how worker claims are verified
when the graph must be replanned
how outputs are integrated
```

It does **not** decide:

```text
product behavior
system architecture
UI design
test strategy
security solution
release strategy
```

Those belong to the relevant domain skills.

```text
Task → DAG<Node<I, O, V>>
                │  │  │
                │  │  └─ verification / evidence
                │  └──── output contract
                └─────── required inputs
```

```text
I = required inputs + upstream contracts + constraints
O = contracted outcome
V = local verification and evidence

node = delegated unit of outcome
edge = dependency, ordering, decision flow, or write conflict
```

A delegated node is successful when it produces the required outcome with evidence, not when its internal implementation matches a preconceived structure.

## 1. Decide whether delegation is worth it

Do not infer delegation from task size.

Before spawning anyone ask:

```text
Would delegation materially help?

specialized expertise?
independent parallel work?
large context that can be isolated?
separate verification useful?
```

Decision:

```text
no
→ solve directly

yes
→ graph-protocol
```

Core rule:

```text
Do not delegate work whose coordination cost
is greater than doing it directly.
```

A large task may still be best handled by one agent.

A small task may justify delegation if it needs a specialized review or isolated verification.

Do not create workers to make the process look parallel.

## 2. Define nodes as contracted outcomes

A node is not:

```text
edit booking.service.ts
update frontend
change schema
```

A node is an outcome with a clear contract.

```text
Node
├─ objective
├─ required inputs
├─ upstream contracts
├─ constraints
├─ allowed scope
├─ expected output
└─ verification
```

Example:

```text
Node A

Objective:
Guarantee concurrent booking requests cannot both reserve the same slot.

Inputs:
- engineering contract
- current booking persistence implementation

Constraints:
- preserve existing public booking behavior
- no unrelated schema redesign

Allowed scope:
- booking persistence / transaction path

Output:
- implementation preserving the no-overlap invariant

Verification:
- faithful concurrent integration test
```

Files and modules are implementation details discovered while executing the node.

One node has one accountable owner.

That owner may consume specialist output from other nodes or workers.

Do not interpret ownership as "one worker must personally do every subproblem inside this node."

## 3. Build the execution DAG

The DAG is the orchestration truth.

Do not use global waves as mandatory execution barriers.

```text
A ──→ C
B ──→ D
```

If A finishes first and C's own requirements are satisfied, C may start without waiting for B.

Readiness:

```text
ready(node) =
  all required predecessors completed
  AND required decisions available
  AND no conflicting writer is active
```

Waves may be shown for human readability:

```text
wave 1: A, B
wave 2: C, D
```

but:

```text
DAG = execution truth
waves = optional scheduling view
```

## 4. Type the edges

"No data dependency" does not imply safe parallel execution.

Use the smallest edge vocabulary that explains scheduling.

### Data dependency

Output of A is required by B.

```text
A ─data→ B
```

Example:

```text
schema decision
→ service implementation
```

### Ordering dependency

A must happen before B even if B does not consume A's output directly.

```text
A ─order→ B
```

Example:

```text
migration expand
→ compatibility cleanup
```

### Decision dependency

B cannot proceed until A resolves a consequential choice.

```text
A ─decision→ B
```

Example:

```text
choose source of truth
→ implement synchronization
```

### Write conflict

A and B may be logically independent but cannot safely mutate overlapping state/code at the same time.

```text
A ─write-conflict─ B
```

Example:

```text
A → refactor UserService
B → add UserService feature
```

Serialize, repartition, or assign one accountable owner.

Do not create fake parallelism over overlapping mutable scope.

## 5. Give workers only the context they need

A worker contract should contain:

```text
WHY / objective
required inputs
relevant upstream contracts
constraints
allowed scope
output contract
verification
```

Pass a domain skill or method only when it is actually relevant.

Do not preload every worker with:

```text
product-design
engineering-design
design-thinking
design-graph
security-review
test-engineering
...
```

unless the node genuinely needs them.

Examples:

Testing worker:

```text
engineering invariant
+
implementation under test
+
risk to prove
```

Security worker:

```text
changed trust boundary
+
required security property
+
affected code/config
```

Implementation worker:

```text
engineering contract
+
local implementation scope
+
relevant verification
```

The coordinator is responsible for making upstream contracts explicit enough that the worker does not need to reconstruct the entire project.

## 6. Worker output is an untrusted claim until verified

Delegation boundary:

```text
coordinator
   ↓ contract
worker
   ↓ evidence
coordinator verifies
```

Do not accept:

```text
Done.
Implemented.
All good.
```

as proof.

Preferred worker return:

```text
Changed:
- ...

Decisions:
- ...

Verification:
- <command/check> → <result>

Deviations:
- ...

Blocked:
- ...
```

A worker does not need to return a full "implemented graph" unless that graph materially helps integration.

The coordinator should inspect the actual changed artifact/diff/result when possible.

Evidence may include:

```text
diff
test result
build/typecheck result
reproduction
query/result
screenshot when UI evidence is relevant
measured output
security path proof
```

Never trust worker output merely because the worker is specialized.

## 7. Compare contract equivalence, not structural equality

A worker may discover a better existing mechanism or a different implementation path.

That is not automatically a failure.

Compare:

```text
delegated contract
        vs
implemented behavior
```

Check:

```text
required outcome preserved?
constraints preserved?
upstream/downstream contracts satisfied?
allowed scope materially exceeded?
verification passes?
new consequential decision reported?
```

Do not require:

```text
same internal nodes
same function decomposition
same implementation graph
```

unless structural form itself was part of the contract.

Core rule:

```text
contract equivalence
≠
structural equality
```

## 8. Surface deviations and replan

Coding creates discoveries.

The execution graph is allowed to change.

Typical discoveries:

```text
requested approach is impossible
existing assumption is false
hidden dependency appears
write conflict appears
better existing mechanism already exists
security issue changes the plan
architecture contradiction appears
tool/environment limitation blocks the node
```

Protocol:

```text
discovery
   ↓
Does it invalidate the delegated contract
or downstream assumptions?
   │
   ├─ no
   │   → continue
   │   → report deviation
   │
   └─ yes
       → stop affected work
       → preserve evidence
       → coordinator replans affected DAG
```

Do not force a worker to finish an obsolete plan.

Coordinator actions may include:

```text
redirect
cancel
retry
reassign
split node
merge nodes
serialize conflicting work
change dependencies
escalate to a domain skill
```

Replan only the affected subgraph when possible.

Do not rebuild the whole graph for a local discovery.

## 9. Model orchestration failures explicitly

Failure does not automatically mean "the coordinator wrote a bad prompt."

Useful failure classes:

```text
Planning
├─ wrong decomposition
└─ hidden dependency

Context
├─ missing input
└─ ambiguous contract

Execution
├─ implementation failure
└─ local verification failure

Coordination
├─ write conflict
└─ incompatible outputs

Environment
├─ tool failure
└─ unavailable dependency

Discovery
└─ invalidated assumption
```

Possible responses:

```text
retry
redirect
reassign
replan
serialize
escalate
abort
```

Choose based on the cause.

Examples:

```text
tool transiently unavailable
→ retry may be correct

two workers edit the same state owner
→ serialize/repartition

architecture assumption invalid
→ replan / engineering-design

worker lacks required product context
→ provide missing contract or merge work back to coordinator
```

Do not blame the worker by default.

Do not blame the coordinator by default.

Classify the actual orchestration failure.

## 10. Use a concrete worker lifecycle

Worker lifecycle:

```text
planned
  ↓
ready
  ↓
running
  ├─ completed
  ├─ blocked
  ├─ failed
  └─ cancelled
```

Coordinator may:

```text
start
cancel
redirect
retry
reassign
```

A running worker does not have permanent ownership over the orchestration plan.

If new evidence invalidates the task, the coordinator should stop or redirect it.

Do not wait at a global gate merely because another unrelated worker is still running.

## 11. Make integration a first-class node

Parallel local success does not prove global success.

Example:

```text
        ┌→ Backend ──┐
Contract            Integration → Final verification
        └→ UI ───────┘
```

The coordinator owns:

```text
cross-node contract consistency
merge/integration order
conflict resolution
integration behavior
final verification
```

Integration may itself be represented as a node:

```text
Node I

Inputs:
- backend output
- UI output
- shared contract

Outcome:
end-to-end feature behaves according to the contract

Verification:
- targeted integration / E2E proof
```

Do not assume:

```text
backend green
+
frontend green
=
feature green
```

The integration edge must be proven.

## 12. Preserve domain ownership

Graph Protocol orchestrates domain skills; it does not replace them.

```text
                       graph-protocol
                    orchestration only
                           │
       ┌───────────────────┼────────────────────┐
       ▼                   ▼                    ▼
engineering-design   security-review     test-engineering
       │                   │                    │
       └───────────────────┼────────────────────┘
                           ▼
                        integrate
```

Other examples:

```text
product-design
→ defines product behavior

engineering-design
→ defines system contract

design-thinking
→ implementation reasoning

design-graph
→ interface reasoning

code-review
→ implementation review

security-review
→ security property review

test-engineering
→ non-trivial executable proof

release-engineering
→ release mechanics

production-ops
→ runtime health/recovery
```

Graph Protocol decides:

```text
which capability is needed
which node owns the work
what context it receives
what it depends on
when it may run
how its result is integrated
```

It does not determine the domain answer itself.

## 13. Keep delegation proportional

Use no graph ceremony when direct execution is clearer.

```text
single coherent change
+
no specialist need
+
no useful parallelism
→ solve directly
```

Use a small DAG when there are a few real dependencies.

Use a larger graph only when the task actually contains separable outcomes.

Avoid decomposition such as:

```text
worker A → inspect file
worker B → edit file
worker C → run test
```

when one worker can do the coherent task more cheaply and with better context.

Good delegation tends to isolate:

```text
different domains
independent implementation paths
specialist review
expensive isolated research
independent verification
```

Bad delegation tends to split one tightly coupled reasoning chain into handoffs.

## 14. Final proof belongs to the coordinator

Worker-local verification is necessary but not sufficient.

Final flow:

```text
worker produces output
        ↓
local evidence
        ↓
coordinator verifies claim
        ↓
integrate outputs
        ↓
cross-node verification
        ↓
final result
```

Before finishing, the coordinator checks:

```text
all required node outcomes exist?
all consequential deviations resolved?
all dependencies satisfied?
no unresolved write conflicts?
cross-node contracts consistent?
integration verified?
remaining risk stated?
```

Do not produce a long orchestration retrospective by default.

Report only information needed to understand:

```text
what changed
what was verified
what materially deviated
what remains blocked/risky
```

---

## The Protocol Pipeline

```text
TASK
  ↓
"Should this even be delegated?"
  → delegation-value gate
  → direct execution if coordination is not worth it

  ↓
"What outcomes can be isolated?"
  → define contracted nodes

  ↓
"What does each node consume and produce?"
  → define I / O / V

  ↓
"What dependencies, ordering, decisions, or conflicts exist?"
  → build execution DAG

  ↓
"What nodes are ready now?"
  → all predecessors satisfied
  → no conflicting writer active

  ↓
run independent work as soon as it becomes ready

  ↓
worker verifies local result
  ↓
collect changes + decisions + evidence + deviations

  ↓
"Did discovery invalidate this node or downstream assumptions?"
  ├─ yes → stop affected work → replan affected DAG
  └─ no  → continue

  ↓
integrate dependent outputs

  ↓
cross-node / end-to-end verification

  ↓
FINAL RESULT
```

**Every delegated node must produce its required outcome with evidence. If implementation materially deviates from the delegated contract, surface the deviation and re-evaluate the affected graph before integration.**