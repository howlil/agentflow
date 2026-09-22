---
name: code-review
description: Review an existing code change, pull request, commit, or implementation by reconstructing what the changed code actually does and finding concrete mismatches against intended behavior, system contracts, invariants, and codebase structure. Use after implementation or when explicitly asked to review, audit, inspect, or assess code. Default to diff-based review when a change set exists; inspect surrounding code only as needed to understand impact. Report only actionable findings with evidence and consequence. Do not redesign the product, repeat implementation planning, or emit style/nit feedback that automated tooling or existing conventions can handle.
---

# Code Review

A review is not a checklist. It is a comparison between the behavior the change is supposed to preserve and the behavior the code actually creates.

```text
Δ → Graph → Review<M, I, E>
│              │      │  │  │
│              │      │  │  └─ evidence in code / runtime path (§7)
│              │      │  └──── impact if the mismatch is real   (§6)
│              │      └─────── meaningful mismatch / risk       (§5)
│              │
│              └─ nodes = changed responsibilities/state,
│                 edges = calls, data flow, state transitions,
│                         dependencies, and trust boundaries
│
└─ the change: diff, PR, commit, patch, or implemented feature
```

```text
§1  Intent       what the change is supposed to accomplish
§2  Delta        what actually changed and what it can affect
§3  Actual       reconstruct changed behavior/state/dependency graph
§4  Compare      expected contract vs actual implementation
§5  Risk         correctness and maintainability risks that matter
§6  Impact       concrete failure or long-term consequence
§7  Evidence     prove every finding from code or targeted verification
§8  Tests        assess whether changed behavior is actually protected
§9  Output       findings first; no nits by default
```

Read the intent. Read the diff. Reconstruct the changed graph. Report only issues that can be tied to a concrete behavior, invariant, boundary, dependency, compatibility, security, or maintainability consequence.

If you cannot explain what can go wrong, do not report it as a finding.

## 1. Establish intent before judging code

Understand what the change is trying to do.

Use the smallest relevant context available:

```text
task / issue / user request
.agents/product.md
.agents/engineering.md
relevant ADRs
existing tests
change description
```

Do not assume the diff itself fully describes intent.

Extract:

- **Expected behavior** — what should become true.
- **Preserved behavior** — what must not regress.
- **System constraints** — boundaries, ownership, invariants, compatibility, or operational properties the change must respect.
- **Review scope** — changed files plus the surrounding code required to understand their impact.

If no explicit design contract exists, infer intent from the task, tests, public contracts, and surrounding implementation. Mark uncertain interpretations as uncertain rather than inventing requirements.

Do not reopen product decisions during code review unless the implementation cannot satisfy the stated requirement.

## 2. Review the delta, not the repository by ritual

Default to diff-based review when a change set exists.

Start with:

```text
changed files
added / removed behavior
changed public contracts
changed state/data
changed dependencies
changed trust or authorization boundaries
changed failure handling
changed tests
```

Then follow only the edges needed to understand those changes.

```text
changed node
   ↓ callers / callees
state owner
   ↓ writers / readers
contract
   ↓ producers / consumers
```

Inspect surrounding code when the local diff is insufficient.

Do not turn a PR review into a baseline audit of unrelated legacy code.

If you discover a pre-existing issue that is not caused or materially worsened by the change, do not report it as a blocking finding. Mention it separately only when it is necessary to understand the changed behavior.

For a requested baseline audit with no diff, establish explicit subsystem scope first and review that graph instead.

## 3. Reconstruct the actual graph

Read the code as behavior, not as isolated lines.

Reconstruct only what changed:

```text
Input / trigger
    ↓
validation / authorization
    ↓
responsibility owner
    ↓
state read
    ↓
decision / transition
    ↓
state write / external effect
    ↓
observable result
```

Track when relevant:

```text
data flow
state transitions
source of truth
transaction boundaries
concurrent writers
dependency direction
resource lifecycle
trust boundaries
error propagation
retry / duplicate behavior
compatibility path
```

The code is the source of truth for the actual graph.

Comments, task descriptions, tests, and design docs describe intent; they do not override what the implementation actually does.

For UI changes, use the same idea at the interface boundary:

```text
user move
  ↓
state transition
  ↓
rendered state
  ↓
next available move
```

Do not duplicate a full `design-graph` review unless the task specifically asks for interface design review.

## 4. Compare actual implementation against the contract

Compare:

```text
expected behavior
        vs
actual behavior

expected ownership
        vs
actual ownership

expected invariant
        vs
actual transition

expected boundary
        vs
actual dependency

expected failure semantics
        vs
actual failure semantics
```

Typical mismatch shapes:

```text
required path is missing
unexpected path is reachable
state can enter an invalid combination
check and write are separated across a race window
authorization exists on one path but not another
error is swallowed or translated incorrectly
retry can duplicate a non-idempotent effect
transaction boundary does not cover the invariant
new dependency reverses an intended boundary
cached/derived state can become authoritative accidentally
migration breaks old readers or writers
cleanup no longer follows resource lifetime
```

A different implementation is not a problem merely because it differs from the design sketch. Report it only when it breaks a required property or creates a concrete code-health regression.

## 5. Find risks that matter

Review in this order:

### Correctness

Can the changed code produce the wrong observable result?

Look especially at:

```text
wrong condition
missing state transition
stale value
off-by-one / boundary case
incorrect fallback
lost or duplicated operation
partial update
wrong error mapping
invalid ordering
```

### State and concurrency

Only when state or multiple execution paths are involved:

```text
race condition
lost update
check-then-act gap
non-atomic invariant
duplicate delivery
non-idempotent retry
deadlock / lock ordering
stale derived state
```

### Boundaries and contracts

When the change crosses a meaningful boundary:

```text
input validation
authorization
API/event/schema compatibility
dependency direction
transaction ownership
source-of-truth ownership
external integration semantics
```

### Security

Security review is risk-triggered, not a generic checklist.

Trace changed trust boundaries when the diff touches:

```text
authentication
authorization
user-controlled input
file/path access
secrets
tenant/user isolation
network/external integrations
sensitive data
cryptography
```

Look for concrete control bypass or data-flow problems.

For deep security analysis, hand off to a dedicated security-review capability when available. Code Review should identify the changed security risk; it should not recreate an entire threat-model framework.

### Performance and reliability

Review only when the changed path can materially affect them.

Examples:

```text
new unbounded loop/query
N+1 or repeated remote call
blocking work added to hot path
unbounded memory/resource growth
retry storm
missing timeout at a new remote boundary
loss of durability or recovery behavior
```

Do not speculate about scale that the system does not have.

### Maintainability

Only report maintainability findings that have a concrete cost.

Examples:

```text
same responsibility now has two owners
business rule duplicated across paths
new abstraction hides rather than simplifies behavior
dependency direction creates coupling that will make changes unsafe
dead branch or legacy path remains active after replacement
code complexity prevents a reviewer from establishing correctness
```

Do not report taste.

`DRY`, `SOLID`, `KISS`, `YAGNI`, design patterns, or clean-code rules are not findings by themselves. Use them only when they explain a concrete problem in this code.

## 6. Assign severity from impact, not preference

Use three severities:

### Critical

The change can cause a severe production or security outcome such as:

```text
data loss/corruption
authorization bypass
secret or sensitive-data exposure
major outage
irreversible destructive behavior
system-wide invariant violation
```

Use Critical sparingly.

### Major

A concrete issue that can cause:

```text
wrong user-visible behavior
broken invariant
race / consistency bug
important regression
contract incompatibility
resource leak with material impact
meaningful security weakness
high-probability future defect caused by the new structure
```

This normally blocks acceptance.

### Minor

A real but limited issue whose impact is local and non-catastrophic:

```text
small correctness edge case
localized maintainability regression
missing narrow defensive handling
test gap for changed behavior with low blast radius
```

Do not emit `Nit` findings by default.

Formatting, import order, naming preferences, mechanical style, and issues fully handled by formatter/linter/typechecker should not consume review output unless they cause a real semantic problem.

## 7. Require evidence for every finding

A finding must contain four things:

```text
Location
  ↓
Actual behavior
  ↓
Failure scenario / consequence
  ↓
Why the proposed direction fixes the cause
```

Minimum standard:

```text
[Severity] file:line — concise title

Actual:
<what this code does>

Impact:
<concrete scenario that fails>

Fix:
<smallest direction that removes the cause>
```

When useful, add a compact path:

```text
Request
  → Handler
  → checkConflict
  → Service
  → insert
```

Evidence can come from:

```text
code path
state transition
contract mismatch
existing test behavior
targeted test
type/build result
reproduction
```

Do not claim runtime failure merely because code "looks suspicious."

When a suspected issue is cheap to verify, run the smallest targeted check that can confirm or falsify it.

If verification falsifies the suspicion, remove the finding.

Do not turn review into a full QA pass. Verification exists to support or falsify findings.

## 8. Review tests as evidence, not coverage theater

Ask:

```text
What changed?
What can now fail?
Does a test protect that behavior or invariant?
```

Good tests should prove the changed contract at the lowest useful level.

Look for:

```text
missing regression for the bug being fixed
test that cannot fail when implementation is wrong
mocking that bypasses the changed behavior
assertions on implementation detail instead of contract
missing concurrency/integration coverage where the bug exists only there
updated snapshots that merely bless unintended behavior
```

Do not demand tests for trivial mechanical changes.

Do not maximize test count or coverage percentage.

A test gap is a finding only when it leaves meaningful changed behavior unprotected or makes the implementation impossible to verify safely.

## 9. Prefer simplification over speculative redesign

Ask whether the change solves the intended problem with less machinery.

Look for unnecessary:

```text
abstraction
layer
configuration
generic framework
new dependency
duplicate model
parallel implementation path
future-proofing
```

But do not request a rewrite merely because another design is cleaner in theory.

Prefer the existing codebase pattern when it satisfies the requirement.

A review should improve code health without requiring perfection.

If the change is correct, understandable, tested enough for its risk, and does not degrade system health, do not block it for optional polish.

## 10. Output findings, not a review essay

Lead with findings ordered by severity.

Example:

```text
Critical
- [file:line] ...

Major
- [file:line] ...

Minor
- [file:line] ...
```

For each finding, include the smallest evidence needed to understand and act on it.

After findings, optionally include:

```text
Verified
- targeted checks actually run

Residual risk
- only material areas that could not be verified
```

If no actionable finding exists, say so directly:

```text
No actionable findings.
```

Then mention only meaningful verification limitations, if any.

Do not manufacture feedback so the review looks thorough.

Do not write `.agents/code-review.md`. Review output belongs to the PR/task/review context, while permanent architectural decisions belong in `.agents/engineering.md` or ADRs.

## Review-only vs remediation

Default behavior for an explicit review request:

```text
inspect
→ report findings
→ do not modify code
```

If the parent task explicitly asks to review **and fix**, or the review is an internal stage of an implementation task:

```text
inspect
→ finding
→ fix root cause
→ targeted verification
→ re-review affected graph
```

Do not silently broaden the implementation beyond findings.

---

## Proportionality

Depth follows risk, not diff size.

```text
tiny mechanical change
→ confirm intent + inspect diff + automated checks if relevant

normal behavior change
→ reconstruct changed graph + compare contract + inspect tests

state / boundary / concurrency / migration / auth change
→ deeper affected-subgraph review + targeted verification

large cross-system change
→ review by subgraph/domain; use graph-protocol if delegation helps
```

A five-line transaction change can deserve more scrutiny than a thousand-line mechanical rename.

---

## Relationship to other skills

### `design-thinking`

```text
design-thinking:
intent → expected implementation graph → code

code-review:
code/diff → actual graph → compare against intent
```

Do not redo implementation design unless a finding demonstrates that the current design cannot satisfy the contract.

### `engineering-design`

Use `.agents/engineering.md` and ADRs as intended system constraints when they exist.

Code Review verifies whether implementation preserves those responsibilities, ownership rules, boundaries, contracts, and guarantees.

It does not create a new architecture unless remediation requires revisiting a broken design.

### `design-graph`

Use when a UI change cannot be reviewed correctly without reconstructing the interaction/surface graph.

Do not invoke it for non-interface code.

### `graph-protocol`

Use only when a large review is naturally decomposable into independent domains or subgraphs.

The main reviewer remains responsible for integrating cross-boundary findings and removing duplicates.

---

## The Pipeline

```text
CHANGE
  → "What is this supposed to accomplish?"
      → establish intent and relevant contracts

  → "What actually changed?"
      → scope the delta and affected edges

  → "What behavior/state/dependency graph does the code now create?"
      → reconstruct the actual graph

  → "Where does actual differ from required?"
      → identify concrete mismatches

  → "What can go wrong because of that mismatch?"
      → establish impact and severity

  → "Can I prove this from code or a targeted check?"
      → require evidence; falsify weak suspicions

  → "Are changed behaviors protected by meaningful tests?"
      → assess verification gaps

  → "Is any new complexity actually required?"
      → reject unnecessary machinery, not stylistic differences

  → FINDINGS
      → actionable, evidence-backed, severity-ordered
```

**If you cannot trace a finding from changed code to a concrete consequence, it is not a finding.**