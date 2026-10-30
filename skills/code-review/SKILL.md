---
name: code-review
description: Review a code change (diff, pull request, commit, patch, or finished implementation) by reconstructing what the code actually does and comparing it to intended behavior, system contracts, and the quality gates of this skill chain, then give a merge verdict with evidence-backed findings. Covers correctness, state and concurrency, boundaries and contracts, security (auth, input, secrets, dependencies, error handling), performance and reliability, maintainability, test adequacy, and conformance to engineering-design, design-thinking, and test-engineering outputs. Use this whenever the user asks to review, audit, inspect, check, or approve code or a PR, says "cek kode", "udah bener belum", or is about to merge or deploy, and run it after implementation and before merge in this chain. Reports only actionable findings; no style nits. Does not redesign the product or architecture, or repeat implementation planning.
---

# Code Review

A review compares the behavior a change is supposed to create with the behavior the code actually creates, and decides whether it may merge. In this chain it is also the enforcement point: gates, contracts, and recorded debt are checked here.

```text
In:   diff/PR + design-thinking implementation note (expected graph)
      + .agents/engineering.md (F, D, DEC, G, contracts, ## Verification) + .agents/product.md (P#)
      + test-engineering PF/RK + design-graph U, ST, UG (UI changes)
Out:  verdict + findings (RV#) in the PR or task; no file under .agents/
Next: release-engineering

Gates → Intent → Actual graph → Compare → Conformance → Risk → Verdict
```

If a finding cannot be traced from changed code to a concrete consequence, it is not a finding.

## IDs

```text
RV  finding; cites the violated upstream ID (F#, G#, P#, DEC, D#, contract, PF, UG)
```

## 1. Gates first, then reviewability

**Gates.** Confirm the mechanical gates are green: build, typecheck, lint, tests at stage `pr`, F# rules, CQ gate, secret scan, dependency verification. If any is red, return the change without deep review. Spend review effort only on what machines cannot check: intent, architectural fit, and risk.

**Reviewability.** If the change is above roughly 400 changed lines that a human must understand (exclude lockfiles and generated code), or mixes refactoring with behavior change, ask for a split or review it per subgraph. The 400-line ceiling is a soft calibration from one team's study, not a law. A change too large to grasp is a defect in the change.

## 2. Intent

Establish what the change must do, from artifacts, not from the author's narrative:

- the design-thinking implementation note (the expected graph: T, O, FL, CAP, PL, LF, VER);
- upstream contracts: P#, X#, R#, S#, K, G#, F#, DEC, compat rule;
- the task or issue.

Extract expected behavior, behavior that must be preserved, constraints, and scope. With no explicit contract, infer from the task, tests, public contracts, and surrounding code, and mark the inference as uncertain. Do not reopen product decisions unless the requirement cannot be satisfied.

## 3. Actual graph

Default to the diff. Start from changed files, added or removed behavior, public contracts, state and data, dependencies, trust boundaries, failure handling, and tests. Follow only the edges needed to understand impact (callers and callees, state writers and readers, contract producers and consumers). Do not audit unrelated legacy code; a pre-existing issue the change did not cause or worsen is not a blocking finding. A requested baseline audit with no diff needs an explicit subsystem scope first.

Reconstruct the changed behavior:

```text
trigger → validation/authorization → owner → state read → decision → state write / external effect → result
```

Track data flow, transitions, source of truth, transaction boundaries, concurrent writers, dependency direction, resource lifetime, error propagation, retry and duplicate behavior, compatibility path. The code is the source of truth for what happens; comments, tests, and docs only describe intent. For UI changes use the interface boundary (move → state transition → rendered state → next move); invoke `design-graph` only if the change cannot be reviewed without its graph.

## 4. Compare

Compare expected vs actual graph: behavior, ownership, invariant, boundary and dependency direction, failure semantics. Typical mismatches:

```text
required path missing · unexpected path reachable · invalid state combination
check and write split across a race window · auth on one path but not another
error swallowed or mistranslated · retry duplicates a non-idempotent effect
transaction does not cover the invariant · new dependency reverses a boundary
derived state becomes authoritative · migration breaks old readers or writers
cleanup no longer follows resource lifetime
```

A different implementation from the sketch is not a finding unless it breaks a required property or worsens code health. Prefer the existing codebase pattern; do not require a rewrite because another design is cleaner in theory. Complexity beyond what the problem needs now (speculative generality, unneeded abstraction, layer, config, dependency, or parallel path) is a finding only if it makes correctness hard to establish or violates an F# rule; otherwise Minor.

## 5. Chain conformance

One short pass. Each failure is a finding that names the violated ID.

| Check | Source |
|---|---|
| Every F# violation is covered by a D# or DEC | engineering-design |
| No unrecorded shortcut (D#) | engineering-design |
| Contract and compat rule kept (N-1/N+1, expand → migrate → contract); rollback safe | engineering-design |
| Signals for G measurement points are actually emitted; a new remote call has a timeout | engineering-design, design-thinking |
| CQ gate and AI-code gate satisfied (dependencies exist, are pinned, and are justified) | design-thinking |
| PF matches the RK tier of the change; no E2E without admission; no heavy suite at `iter` | test-engineering |
| Touched P# are still satisfied; UG met for UI changes | product-design, design-graph |

## 6. Risk

Review in this order, and only what the change can affect.

1. **Correctness**: wrong condition, missing transition, stale value, boundary case, wrong fallback, lost or duplicated operation, partial update, wrong error mapping, invalid ordering.
2. **State and concurrency** (if state or parallel paths are involved): race, lost update, check-then-act gap, non-atomic invariant, duplicate delivery, non-idempotent retry, lock ordering, stale derived state.
3. **Boundaries and contracts**: input validation, authorization, API/event/schema compatibility, dependency direction, transaction and source-of-truth ownership, external integration semantics.
4. **Security**, triggered by what the diff touches. Automated SAST and dependency scans run in the gates; the reviewer covers business logic and authorization.

| Diff touches | Check |
|---|---|
| auth, session | authorization on the server for every path, resource ownership, fail-closed |
| user-controlled input | allowlist validation at the boundary, parameterized queries, no command built by string concatenation |
| new or updated dependency | exists in the official registry, justified, maintained, pinned, no known CVE |
| secrets, config | no secret in code, logs, or errors; env files not committed |
| error handling | fails safely, generic message outward, every exception handled at its boundary |
| tenant or sensitive data | isolation between tenants, no leak through logs or errors |

Broken access control and supply-chain and exception-handling failures are the categories most worth tracing. Client-side checks are never an authorization control.

5. **Performance and reliability** (only if the path is affected): unbounded loop or query, N+1 or repeated remote call, blocking work on a hot path, unbounded memory, retry storm, missing timeout, lost durability or recovery. Do not speculate about scale the system does not have.
6. **Maintainability**, only with a concrete cost: one responsibility with two owners, a duplicated business rule, an abstraction that hides behavior, coupling that makes change unsafe, a dead path left active after replacement. DRY, SOLID, KISS, YAGNI, and patterns are not findings by themselves; use them only to explain a concrete problem.
7. **Tests as evidence**: a regression test for a fixed bug; a test that cannot fail; mocks that bypass the changed behavior; assertions on implementation instead of contract; snapshots that bless unintended behavior; missing integration or concurrency proof where the bug lives only there. Do not demand tests for trivial mechanical changes or chase coverage percentage.

Depth follows the RK tier and risk, not diff size: a five-line transaction change can deserve more than a thousand-line rename.

## 7. Severity and verdict

| Severity | Meaning | Blocks |
|---|---|---|
| Critical | data loss or corruption, authorization bypass, secret or sensitive-data exposure, major outage, irreversible destructive behavior, system-wide invariant violation | yes |
| Major | wrong user-visible behavior, broken invariant, race or consistency bug, important regression, contract incompatibility, material resource leak, meaningful security weakness, a structure that makes a future defect likely | yes |
| Minor | real but local: narrow edge case, localized maintainability regression, missing narrow defensive handling, low-blast-radius test gap | no |

No `Nit` findings by default; formatting and naming are the linter's job. Severity comes from impact, not preference.

**Verdict:**

```text
Approve                 no actionable findings
Approve with Minor      only Minor findings; they do not block
Block                   any Critical or Major finding, or a failed gate or conformance check
```

Block only for those reasons, never for polish. If the change is correct, understandable, tested enough for its risk, and does not degrade system health, approve it. Under time pressure a change that definitely improves code health should not wait for perfection.

## 8. Evidence and independence

Every finding needs location, actual behavior, a concrete failure scenario, and the smallest direction that removes the cause. Evidence can be a code path, state transition, contract mismatch, existing test, targeted test, build or type result, or a reproduction. When a risky suspicion is cheap to verify, run the smallest targeted check; if it falsifies the suspicion, delete the finding. Do not turn the review into a full QA pass.

Independence rules, because author and reviewer are often the same kind of model:

- Tests written in the same change are not the only evidence that behavior is correct. Judge behavior against P# and contracts, since generated tests tend to assert what the code does, including its bugs.
- Review from artifacts (contract, diff, implementation note), not from the author's reasoning or summary. Prefer a fresh context for the review.
- Verify risky behavior with an independent runtime check, not the agent's explanation.
- If no contract or spec exists, record it as a limitation instead of reviewing implementation in a vacuum.

## 9. Output

Findings first, ordered by severity, same-root-cause findings merged. Then the verdict.

```text
RV1 [Major] file:line — title | violates: F2 | confidence: verified | likely | needs-check
Actual: what this code does
Impact: concrete scenario that fails
Fix:    smallest direction that removes the cause
```

Optionally add `Verified` (targeted checks actually run) and `Residual risk` (only material areas not verifiable). With nothing actionable, say `No actionable findings.` and name only meaningful limitations. Do not manufacture feedback to look thorough. Do not write a review file under `.agents/`; consequential decisions go to `engineering.md` `## Decisions`.

**Review-only vs remediation.** An explicit review request inspects and reports without changing code. If asked to review and fix, or the review is an internal stage of an implementation task: fix the root cause, verify with a targeted check, re-review the affected graph, and do not broaden beyond the findings.

## 10. Metrics

| Indicator | Default | Note |
|---|---|---|
| Change size (changed lines, no generated) | ≤ 400 soft; ≤ 200 ideal | leading indicator of review quality |
| Time to first review | ≤ 1 business day | human teams; for agent pipelines measure the wait |
| Review cycle time, rework rounds | trending down | part of lead time |
| Escaped defects from reviewed changes | trending down | the outcome that matters |
| Bypass rate (merged without review) | near 0 | rises with AI-assisted throughput |
| F# violations without D# or DEC | 0 | chain-specific gate |
| Finding precision (accepted ÷ total) | rising | own heuristic, not an industry standard |

Not metrics: comment count, nit count, approval speed, lines read per hour as a target. They reward activity or rubber-stamping. Size and cycle-time benchmarks come from limited studies; treat them as calibration.

## Handoff

`release-engineering` consumes the verdict, the conformance results, compat and migration findings, and unresolved Residual risk. A missing non-trivial proof returns to `test-engineering`; an architectural contradiction returns to `engineering-design`; a requirement conflict returns to `product-design`.