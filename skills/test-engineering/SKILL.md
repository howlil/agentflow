---
name: test-engineering
description: Turn a meaningful software behavior, invariant, failure mode, or regression risk into the smallest reliable executable proof at the boundary where correctness actually lives. Use when testing itself requires design: choosing unit vs integration vs contract vs concurrency vs E2E boundaries, reproducing races or async failures, proving transaction or migration behavior, designing failure/recovery tests, fixing flaky or brittle suites, or building a focused regression strategy. Do not invoke for obvious local tests that design-thinking can write directly. Do not maximize coverage, generate one test per function/file, mock the semantics being proven, or require TDD/test-pyramid quotas.
---

# Test Engineering

Testing exists to reduce uncertainty about meaningful behavior.

```text
R → Graph → Proof<P, B, O>
│              │      │  │  │
│              │      │  │  └─ observable outcome / invariant (§6)
│              │      │  └──── faithful test boundary           (§3)
│              │      └─────── property that must be proven     (§2)
│              │
│              └─ nodes = setup, stimulus, system boundary, observations
│
└─ behavior / invariant / failure / regression risk
```

```text
§1  Gate         testing itself must require design
§2  P            property, invariant, or regression to prove
§3  B            smallest faithful boundary where correctness lives
§4  Setup        deterministic state and controlled dependencies
§5  Exercise     stimulate the real behavior, including failures/races
§6  O            observe outcome, state, side effect, or invariant
§7  Doubles      isolate boundaries; never fake the semantics under proof
§8  Regression   reproduce the bug at the lowest useful faithful boundary
§9  Suite        reliability, speed, brittleness, and architecture
§10 Handoff      tests are executable proof; no testing ceremony artifact
```

Read the behavior or risk. Decide exactly what must be proven. Find where that correctness actually lives. Use the smallest test that still exercises those semantics faithfully.

If a test does not materially increase confidence in a behavior, invariant, boundary, or failure mode, do not create it.

## 1. Applicability gate

`test-engineering` is a specialist capability, not a mandatory stage.

Do not invoke it when the verification is obvious:

```text
simple deterministic business rule
→ write a unit test directly

simple bug with an obvious reproduction
→ write the regression test directly

existing local test pattern clearly fits
→ follow it directly

mechanical/refactor-only change
→ run targeted existing verification
```

Invoke `test-engineering` when testing itself has a design question, for example:

```text
Which boundary should prove this behavior?

Unit, integration, contract, concurrency, or E2E?

How do we reproduce this race?

How do we prove transaction atomicity?

How do we verify retry / idempotency?

How do we test async or queue semantics?

How do we verify backward-compatible migration?

How do we inject a realistic dependency failure?

How do we prove backup/restore or recovery behavior?

Why is this suite flaky, slow, brittle, or expensive to maintain?
```

Routing rule:

```text
obvious verification
→ implement directly

verification itself is complex or high-risk
→ test-engineering
```

Testing is continuous feedback during implementation, not a phase after "dev complete."

## 2. Define P: what exactly must be proven?

Start from behavior and risk, not from files or functions.

Ask:

```text
What can be wrong?
What property would distinguish correct from incorrect?
What observable evidence would prove it?
```

Good proof targets include:

```text
business rule
calculation
parser/validator semantics
state transition
permission decision
invariant
public/API contract
transaction atomicity
concurrency outcome
idempotency
ordering
retry semantics
migration compatibility
failure/recovery behavior
critical user journey
bug regression
```

Examples:

```text
P1:
two overlapping active bookings for the same room/time
must never both commit

P2:
a retried payment command must not create a second charge

P3:
records written by schema version N+1
must still be readable by version N during rollout
```

Do not define the proof as:

```text
"method X was called"
"mock Y received argument Z"
"line 42 executed"
"coverage increased"
```

unless that call/line is itself part of a real external contract.

Test behavior, not implementation structure.

## 3. Choose B: the smallest faithful boundary

Ask:

```text
Where does correctness actually live?
```

Then choose the smallest boundary that still contains those semantics.

### Unit

Use when correctness is local and does not depend on real infrastructure semantics.

Strong candidates:

```text
business rules
calculations
parsers
validators
state machines
permission/policy decisions
error mapping
retry decisions
pure transformations
algorithmic logic
```

Example:

```text
requested slot + existing slots
        ↓
overlap policy
        ↓
allowed / denied
```

A unit test is valuable because the rule itself is local.

### Integration

Use when correctness depends on a real boundary or infrastructure semantics:

```text
SQL constraint
transaction
locking/isolation
ORM mapping
filesystem behavior
serialization
request pipeline
real dependency protocol
database migration
```

Do not replace the semantics under proof with mocks.

If the risk is:

```text
"only one concurrent booking may commit"
```

the faithful boundary may require:

```text
real concurrent execution
+
real transaction/storage boundary
```

A mocked `transaction()` call does not prove atomicity.

### Contract

Use when the primary risk is compatibility between independently evolving producer/consumer boundaries.

Examples:

```text
API request/response shape
event schema
consumer/provider expectation
backward/forward compatibility
```

Contract tests do not replace integration tests when runtime infrastructure semantics are the thing at risk.

### Concurrency

Use when the property only exists under overlapping execution.

Model the race explicitly:

```text
start A
start B
synchronize at critical point
release both
        ↓
observe committed results
        ↓
assert invariant
```

Avoid "concurrency tests" that merely call the same function twice sequentially.

### E2E / Critical User Journey

Use when the property depends on the whole user-visible journey:

```text
signup → verify → login
booking → pay → confirmation
edit → save → refresh → persisted state
```

Keep E2E count small and focused on critical journeys and failures that cannot be proven faithfully lower in the stack.

### Specialized

Use specialized tests only when the risk demands them:

```text
load / stress
fault injection
property-based
fuzz
compatibility
restore/recovery
browser/network lifecycle
```

Do not force them onto ordinary feature work.

### Boundary rule

```text
Choose the smallest test
that faithfully proves
the actual risk.
```

"Smallest" without "faithful" creates false confidence.

"Faithful" without "smallest" creates slow, brittle suites.

## 4. Build deterministic setup

A test must control the preconditions needed for the proof.

Define:

```text
initial state
test data
clock/time
randomness
identity
configuration
dependency behavior
resource lifecycle
concurrency coordination
```

Control only what affects the property.

Prefer:

```text
ephemeral data
isolated namespaces/databases
explicit clocks
seeded randomness
deterministic synchronization
known dependency fixtures
```

Avoid:

```text
shared mutable test state
arbitrary sleeps
dependency on test execution order
production data assumptions
uncontrolled wall clock
network timing as synchronization
```

If the test cannot reproduce its own starting state, it is not reliable evidence.

## 5. Exercise the real behavior

Stimulate the system through the boundary that owns the property.

Examples:

```text
domain function
API
database transaction
event consumer
worker
browser
restore procedure
```

Do not reach into private helpers merely because they are easy to call.

For failure testing, inject the failure at the real dependency boundary:

```text
payment provider timeout
database serialization failure
lost response after successful commit
duplicate message delivery
worker restart
partial migration state
```

Do not simulate a failure in a way that bypasses the code path being validated.

For async systems, define completion from the behavior, not a sleep:

```text
wait until observable state reaches X
or
until bounded deadline expires
```

## 6. Observe O: assert the property, not the choreography

Assert on the smallest set of outputs that proves P.

Possible evidence:

```text
return value
public response
persisted state
event emitted
event not duplicated
state transition
invariant
external side effect
durable work
visible user outcome
recovered data
```

Example:

```text
two concurrent booking attempts
        ↓
assert:
- exactly one succeeds
- exactly one is rejected/retried as designed
- one valid booking exists
- overlap invariant still holds
```

Avoid assertions such as:

```text
internal helper called once
exact private method ordering
every mock interaction
incidental JSON field ordering
exact UI text when wording is irrelevant
```

A refactor that preserves behavior should not break the test.

## 7. Use doubles without invalidating the proof

Rule:

```text
Mock a boundary to isolate behavior.

Do not mock the thing whose semantics
you are trying to prove.
```

Good:

```text
testing payment failure handling
→ payment provider double can produce timeout/decline
```

Bad:

```text
testing database transaction atomicity
→ mock database transaction
```

Bad:

```text
testing serialization compatibility
→ bypass the real serializer with hand-built objects
```

Choose among:

```text
fake
stub
mock
real dependency
ephemeral dependency
```

based on the semantic fidelity required by P.

Prefer state/result assertions over interaction assertions.

Use mocks for interaction contracts only when the interaction itself is the behavior.

## 8. Regression rule

For a real bug:

```text
Bug
 ↓
Can it be reproduced automatically
at a useful faithful boundary?
 ↓
yes
→ create the smallest regression proof
→ then fix / verify the fix
```

The test should fail for the original defect and pass for the corrected behavior.

Choose the boundary where the bug actually exists.

Example:

```text
server commits completion
but response is lost
        ↓
client refresh shows completed state
        ↓
UI must not report false failure
```

If that behavior can be proven at service/integration level, do not require browser E2E.

If the defect only emerges from browser/network lifecycle, use E2E.

Do not write a regression test that merely repeats the implementation logic and therefore could share the same bug.

## 9. Special proof patterns

### Transactions and concurrency

When correctness depends on isolation, locking, constraints, or atomicity:

```text
real storage semantics
+
overlapping execution
+
final invariant
```

Do not infer race safety from unit tests.

Test expected conflict/retry outcomes when the storage model can legitimately abort concurrent work.

### Idempotency / retries

Model at least:

```text
first delivery
duplicate delivery
retry after known failure
retry after uncertain outcome
```

Assert on the final external effect:

```text
one charge
one booking
one durable job
```

not merely on handler return values.

### Async / queue systems

Consider only semantics that matter:

```text
at-least-once delivery
duplicate message
ordering
poison message
retry/dead-letter behavior
crash between effect and acknowledgement
backlog recovery
```

Test the property promised by the system; do not attempt to prove delivery guarantees the underlying broker does not provide.

### Migrations / compatibility

When old and new versions may coexist, test the actual compatibility window:

```text
old schema/data
  ↓ migrate/expand
old reader + new writer?
new reader + old writer?
  ↓
contract still valid
  ↓ contract/cleanup
```

Only test coexistence directions that the release strategy actually requires.

Use real migration scripts against representative schema/data where migration semantics are the risk.

### Failure / recovery

When the system claims it can recover:

```text
establish valid state
→ induce relevant failure
→ execute recovery path
→ assert state/invariants
→ re-run critical behavior
```

A recovery command exiting `0` is not proof of recovery.

### Security properties

`security-review` owns which attack/trust property matters.

`test-engineering` owns the executable proof when testing that property is non-trivial.

Example:

```text
security-review:
tenant A must never read tenant B data

test-engineering:
design the faithful API/DB proof for that isolation property
```

Do not independently invent a full security test matrix.

## 10. No coverage theater

Coverage is execution evidence, not correctness evidence.

Do not do:

```text
coverage = 74%
→ generate tests until 90%
```

Use coverage only as a diagnostic clue:

```text
important behavior appears unexercised
        ↓
inspect whether a meaningful proof is missing
```

Do not optimize line, branch, or mutation score without tying the added test back to behavior/risk.

A high-coverage suite can still fail to prove the important thing.

A low-coverage subsystem can still be adequately protected if most code is wiring and the meaningful behaviors are proven.

## 11. Treat flaky and brittle tests as defects

A useful automated test should provide a trustworthy signal.

If the same code can randomly produce pass/fail, the test is not reliable evidence.

When diagnosing flakiness, inspect:

```text
test setup/data
ordering dependence
shared state
clock/time
randomness
async synchronization
resource cleanup
test runner/framework
SUT nondeterminism
OS/network/external dependency
```

Do not normalize:

```text
"rerun until green"
"known flaky"
"ignore intermittent failure"
```

Short-term quarantine may protect the signal of the main suite, but it must not become permanent acceptance.

Brittleness is different from flakiness:

```text
flaky
→ same behavior, inconsistent result

brittle
→ harmless implementation change breaks the test
```

For brittle tests, reduce knowledge of implementation details and assert on stable behavior.

## 12. Keep feedback proportional and fast

Fast feedback matters, but test fidelity comes first.

Structure the suite so the most relevant cheap proofs run earliest:

```text
local targeted test
    ↓
broader integration / contract
    ↓
critical E2E / specialist suite
```

Do not run every expensive suite for every local edit when dependency analysis or CI stages can select them safely.

Do not split tests merely to hit a timing quota.

As a practical suite-health signal, automated developer/CI feedback should normally remain in minutes, not become a long stabilization phase. If the default suite becomes slow enough that developers avoid running it, its architecture needs work.

Separate expensive specialist suites when necessary:

```text
load
long-running compatibility
chaos/fault
large E2E
recovery drills
```

but ensure they run at the release/risk point where their evidence is needed.

## 13. Improve test architecture only when it pays

Use `test-engineering` for suite-level problems when they create real engineering cost:

```text
flakiness
slow feedback
duplicated setup
brittle selectors/contracts
unrepresentative mocks
hard-to-create test data
unclear test ownership
expensive environment boot
tests that cannot reproduce production bugs
```

Prefer fixing the test boundary or system testability over adding more helpers around a bad design.

Examples:

```text
hard-to-test time logic
→ explicit clock boundary

massive mock graph
→ component owns too many dependencies

every UI change breaks E2E
→ assertions/selectors coupled to presentation details

DB bug only tested with mocks
→ add focused real-DB integration boundary
```

Do not introduce a testing framework/abstraction unless it removes repeated complexity or enables a proof that was previously unreliable.

## 14. Relationship to other skills

### `design-thinking`

`design-thinking` owns obvious verification while implementing:

```text
design
→ implement
→ obvious targeted proof
```

Hand off to `test-engineering` only when verification itself requires non-trivial boundary, environment, concurrency, failure, or suite design.

`test-engineering` may return a test design that `design-thinking` implements with the production change.

### `code-review`

`code-review` asks:

```text
Does the implementation have meaningful risk?
Is the existing verification faithful and sufficient?
```

If the missing/incorrect verification is non-trivial:

```text
code-review
→ test-engineering
```

`test-engineering` does not duplicate structural review.

### `engineering-design`

Engineering Design owns system guarantees and invariants.

Test Engineering turns those guarantees into executable proof when the test strategy is non-obvious.

If a guarantee cannot be tested without violating boundaries or massive mocking, that can reveal an engineering-design/testability problem.

### `security-review`

Security Review identifies security properties and attack paths.

Test Engineering designs reliable executable proof for those properties when needed.

### `production-ops`

Production Ops owns what operational recovery/health must be proven.

Test Engineering can design complex recovery tests:

```text
backup
→ isolated restore
→ integrity checks
→ application smoke
```

only when that proof is non-trivial.

### `release-engineering`

Release Engineering decides which already-defined proofs become release gates and where they run.

Test Engineering designs the proof itself.

Do not put CI/CD orchestration in this skill.

## 15. Output and persistence

The primary output is executable tests and the minimum supporting fixtures/helpers needed to make those tests reliable.

Do not create:

```text
.agents/tests.md
TEST_PLAN.md
QA_PLAN.md
coverage-goal.md
```

by default.

The tests are the durable executable proof.

If a test strategy introduces a consequential architecture decision, such as a new system boundary solely to make critical behavior testable, feed that back to `engineering-design` rather than hiding the decision in test code.

For an analysis-only request, output:

```text
Property
→ risk to prove

Boundary
→ why this is the smallest faithful test level

Setup
→ required deterministic state/dependencies

Exercise
→ action/failure/concurrency schedule

Assertions
→ observable evidence

Gaps
→ only material limitations
```

For an implementation task:

```text
design proof
→ implement test
→ run it
→ confirm it can fail for the intended defect/property
→ run relevant surrounding tests
```

Do not report a test as proof merely because it passes once.

---

## Proportionality

Depth follows testing complexity and risk.

```text
tiny deterministic logic
→ direct unit/regression test; no specialist skill

normal feature
→ targeted unit/integration tests using existing patterns

boundary/state/failure-sensitive feature
→ test-engineering on affected proof graph

concurrency/migration/async/recovery/complex regression
→ specialist test design + faithful environment

large or unhealthy suite
→ test architecture analysis only where feedback/reliability cost justifies it
```

Do not maximize test count.

Maximize:

```text
confidence gained
────────────────
cost + brittleness + runtime
```

subject to the proof still being faithful.

---

## The Pipeline

```text
BEHAVIOR / RISK
  → "What exactly can be wrong?"
      → define P: property/invariant/regression

  → "Where does that correctness actually live?"
      → choose B: smallest faithful boundary

  → "What state and dependencies must be controlled?"
      → deterministic setup

  → "How do we exercise the real behavior?"
      → stimulate success/failure/race/compatibility path

  → "What observable outcome proves correctness?"
      → define O: result/state/invariant/side effect

  → "Am I mocking the semantics I am trying to prove?"
      → replace with real/ephemeral dependency when necessary

  → "Can this fail deterministically for the bug/property?"
      → validate test efficacy

  → "Does it remain useful after harmless refactors?"
      → remove implementation-detail coupling

  → EXECUTABLE PROOF
      → run at the cheapest lifecycle point where it preserves confidence
```

**Choose the smallest test that faithfully proves the actual risk.**