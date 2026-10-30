---
name: test-engineering
description: 'Decide whether, what, where, when, and how much to test, then produce the cheapest executable proof that faithfully covers a real risk at the stage where its evidence is needed. Covers risk-based test selection, unit vs integration vs contract vs concurrency vs E2E boundaries, test stage map (per-iteration vs PR vs merge vs release vs nightly), manual and acceptance testing, regression, flaky and slow suites, CI test budget, and test-quality metrics. Use this whenever the user or a task involves tests, "tes", unit/integration/E2E, QA, regression, coverage, flaky tests, a slow or bloated CI, acceptance or UAT, or asks what needs testing, even for small changes: the 3-question triage in §1 runs on every change and usually ends in one line. Reads .agents/product.md, .agents/engineering.md, design-thinking output. Does not maximize coverage, write one test per function, or require pyramid quotas or TDD. Pipeline mechanics belong to release-engineering.'
---

# Test Engineer

Testing exists to reduce uncertainty about behavior that matters, at the lowest cost that still tells the truth. A test is a cost (write, run, maintain, debug); admit it only when it earns that cost. Heavy proof runs at the stage where its evidence is needed, never on every iteration.

```text
In:   P#, X# (product) · G# priority, F#, Challenge (engineering) · FL#, PL#, VER (design-thinking) · UG (design-graph) · the diff
Out:  tests + stage map lines in .agents/engineering.md (## Verification)
Next: code-review

Triage → Risk → Admission → Proof → Stage → Execute → Efficacy → Metrics
```

## IDs

```text
RK  risk entry (tier)        PF  proof; cites P#, X#, G#, FL#, PL#, F#, or UG
```

Boundary and stage are attributes of a PF. VER (design-thinking) is an obvious proof; PF is one designed here. A# keeps its upstream meaning.

## 1. Triage (every change; stop at the first match)

```text
Q1  Does the change touch a P#, G#, FL#, or a boundary?          no  → run existing tests, stop
Q2  Does an existing proof already fail if this breaks?          yes → reuse it, stop
Q3  What is the cheapest boundary that is still faithful?        → write it, stage = iter
Race, migration, recovery, async/queue semantics, or a flaky suite → full method (§2 onward)
```

## 2. Risk (RK)

Risk = likelihood × impact. Use the inputs the chain already provides.

- **Impact**: G priority (H/M/L), Q, X (money, data loss, security, SLO).
- **Likelihood**: change size, novelty, complexity (CQ), concurrency or migration involved, history of escaped defects.

| Tier | Proof depth | Boundary | Stage |
|---|---|---|---|
| Critical | invariant proven faithfully | real integration; E2E only if browser or cross-system wiring is the risk | `pr` + `release` |
| Important | unit + integration at the changed boundary | as needed | `pr` |
| Routine | existing tests or one unit | cheapest | `iter` |

No quotas. The suite's shape is a result of risk and cost, not a target ratio. A risk that tests cannot fix (architectural) goes back to `engineering-design`.

## 3. Admission

A new test must answer: which specific failure does it catch; why no existing or cheaper test catches it; what that failure costs. No answer, no test.

**E2E admission**: only for a critical journey (a P# marked critical) whose failure depends on a real browser or real cross-system wiring; one per journey; adding one means removing or merging another; never introduce a browser test harness unless the user asks for it. Ordinary CRUD, forms, validation, local UI state, and API features are proven at unit, component, route-handler, or database-integration level.

## 4. Proof (PF) and boundary

Start from the property, not the file: what can be wrong, what distinguishes correct from incorrect, what observable evidence proves it. Test behavior, not implementation ("method called", "line executed", "coverage rose" are not proofs).

Choose the cheapest boundary that still contains the semantics at risk:

| Boundary | Use when | Not when |
|---|---|---|
| Unit | rule is local: business rules, calculations, parsers, validators, state machines, policy decisions, error mapping | correctness depends on infrastructure semantics |
| Integration | SQL constraints, transactions, locking, ORM mapping, filesystem, serialization, request pipeline, migrations | a fake would prove the same thing |
| Contract | independently evolving producer and consumer (API shape, event schema, compat) | runtime infrastructure semantics are the risk |
| Concurrency | the property exists only under overlap: real parallel execution + real storage + final invariant | calling a function twice in sequence |
| E2E | §3 | anything a lower level proves faithfully |
| Specialized (load, fault injection, property-based, fuzz, restore) | G or Q demands it | ordinary feature work |

"Smallest" without "faithful" gives false confidence; "faithful" without "smallest" gives a slow, brittle suite.

## 5. Stage (when it runs)

| Stage | Trigger | Budget | Runs |
|---|---|---|---|
| `iter` | every local change | seconds | typecheck, lint, unit tests of the changed behavior. **No integration, no E2E, no manual** |
| `pr` | each PR | ≤ 10 min (lint/type ≤ 2, unit ≤ 5) | build, unit, integration on changed boundaries, contract if a contract changed, F# and CQ gates |
| `merge` | main | ≤ 15 min | full unit + integration, migration test, small smoke E2E |
| `release` | once, at release candidate or when the feature set is complete | none | critical-journey E2E, compat N-1/N+1 on representative data, restore drill, load if a G requires it, a11y and performance lab (UG), manual exploratory + acceptance (once) |
| `post` | after deploy | minutes | smoke and synthetic checks (mechanics belong to release-engineering) |
| `nightly` | schedule | any | cross-browser matrix, long compat, mutation spot-check, load, flaky detection |

**Stage test**: if this fails, must today's PR not merge? Yes → `pr`. No → `merge` or `nightly`. Path or impact selection is allowed only if the full suite still runs on `merge` and `nightly`.

**Manual and acceptance**: manual is for exploration and human judgment (visual, UX), run once at `release`, scoped to the critical P# list. Stable, repeatable, high-impact flows are automated instead. Manual acceptance per iteration is not allowed.

## 6. Execute

- **Setup**: control only what affects the property: initial state, clock, randomness, identity, config, dependency behavior, concurrency coordination. Prefer ephemeral data, isolated databases, explicit clocks, seeded randomness. No shared mutable state, arbitrary sleeps, order dependence, or production data.
- **Exercise**: stimulate through the boundary that owns the property, not private helpers. Inject failures at the real dependency boundary (provider timeout, serialization failure, lost response after commit, duplicate delivery, restart). For async, wait on observable state with a bounded deadline, never a sleep.
- **Observe**: assert the smallest set of outputs that proves the property: return value, public response, persisted state, event emitted or not duplicated, invariant, external effect, recovered data. A harmless refactor must not break the test.
- **Doubles**: mock a boundary to isolate behavior, never the semantics under proof (no mocked `transaction()` to prove atomicity, no hand-built objects to bypass the serializer under test). Prefer state assertions over interaction assertions.
- **Regression**: reproduce the bug automatically at the lowest faithful boundary, confirm it fails for the original defect, then fix. Do not repeat the implementation's own logic in the test.

## 7. Patterns

| Risk | Proof shape |
|---|---|
| Transaction, isolation, constraint | real storage + overlapping execution + final invariant; expect legitimate abort and retry outcomes |
| Idempotency, retry | first delivery, duplicate, retry after known failure, retry after uncertain outcome; assert the external effect (one charge, one booking) |
| Async, queue | only promised semantics: at-least-once, duplicate, ordering, poison message, dead-letter, crash between effect and ack |
| Migration, compat | the real compat window from the contract (old reader/new writer, new reader/old writer) using real migration scripts on representative data |
| Failure, recovery | valid state → induce failure → run recovery → assert invariants → re-run critical behavior; exit code 0 is not proof |
| Security property | `code-review` names the property; design the faithful proof here (e.g. tenant isolation at API + DB) |

## 8. Efficacy

- Every critical PF must be able to fail: deliberately break the implementation and watch it fail.
- Mutation testing only on critical logic, nightly (it is far slower than normal tests); use the trend, not an absolute number.
- Coverage is a diagnostic clue ("important behavior unexercised?"), never a target. No tests generated to raise a percentage.
- **Flaky is a defect.** Diagnose setup, order dependence, shared state, clock, randomness, async sync, cleanup, runner, SUT nondeterminism, environment. "Rerun until green" is not allowed. Quarantine needs an owner and an expiry; an expired quarantine means fix or delete.
- **Brittle** (a harmless change breaks it): remove implementation coupling and assert stable behavior.

## 9. CI contract

This skill owns the stage map and budgets. `release-engineering` implements them with these limits:

- one workflow per trigger (PR, main/release, nightly), not one per tool; no duplicate triggers (push and PR running the same thing);
- path filters with the full-run safety net from §5;
- `concurrency` cancel-in-progress, dependency cache keyed on the lockfile, a timeout on every job;
- matrix only when a risk demands it (a curated subset on `pr`, the full matrix on `merge` or `nightly`);
- every job names the gate it guards; a job that guards no gate is deleted.

Heavy suites that cannot meet a budget move to a later stage. They are not dropped, and they do not block iteration.

## 10. Metrics

| Indicator | Default | Note |
|---|---|---|
| PR feedback time | ≤ 10 min core; lint/type ≤ 2; unit ≤ 5 | CI duration is part of lead time |
| Flaky rate | < 2% (warn 2–5%, critical > 5%) | practitioner heuristic |
| Defect escape rate | < 5–10% | heuristic; count once there are real users |
| E2E count and duration | each E2E maps to one critical journey | watch share of pipeline time |
| Mutation score (critical logic only) | trend, no universal number | expensive; nightly |
| Failure signal-to-noise | real bugs vs flaky or environment failures, rising | trust in the suite |
| Change fail rate, rework rate (DORA) | rough elite benchmark ≈ 5% fail rate | only with routine deploys; owned by release-engineering |

Read DORA throughput and instability together; speed bought with rising rework is not progress. Small or personal projects need three: PR feedback time, flaky count, escaped defects. **Not targets**: coverage percentage, test count, automation rate. They measure activity, not outcomes.

## 11. Done and persist

Done only if all hold:

- every P#, `H` G#, and critical FL# has a PF with tier and stage;
- no new E2E without admission; no heavy suite at stage `iter`;
- every critical PF was shown able to fail;
- the stage map lines are recorded;
- no `[blocking]` A# is open.

Persist as lines in `.agents/engineering.md` `## Verification` (≤ 12 lines, no TEST_PLAN, QA_PLAN, or coverage files):

```text
PF1 (P2,G1) [critical] | integration, real DB + concurrent | stage: pr      | cmd: <command>
PF2 (P1)    [critical] | E2E journey: checkout              | stage: release | cmd: <command>
```

For analysis-only requests output: property → risk tier → boundary and why → setup → exercise → assertions → material gaps. Do not call a test proof because it passed once.

## Handoff

`code-review` checks that PF coverage matches the changed risk and that no gate was bypassed; a missing non-trivial proof comes back here. `release-engineering` implements the stage map, budgets, and `release`/`post` stages, and owns DORA tracking. A guarantee that cannot be tested without heavy mocking is a testability signal for `engineering-design`.