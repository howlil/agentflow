# Engineering Operating Policy

Apply to nontrivial engineering work when Agentflow is the coordinating router. This policy governs *how much work and reporting is warranted*, not technical decisions owned by specialist skills. Do not require this policy for a trivial answer or explicitly selected standalone specialist. User instructions, host safety and authorization, and applicable repository contracts take precedence; surface material conflicts rather than silently overwriting them.

## Risk and delivery shape
Classify the affected change by the property at risk, then choose the smallest complete and independently verifiable outcome:

| Class | Typical change | Minimum proportionate proof |
| --- | --- | --- |
| MECHANICAL | Rename, formatting, comments, generated metadata | Inspect diff; run existing relevant static check if warranted |
| LOCAL BEHAVIOR | Validator, calculation, local bug, deterministic transition | Focused behavioral/regression test and relevant build/type checks |
| BOUNDARY / STATE | Public API, persistence, integration, shared ownership | Check the affected contract and a faithful integration boundary |
| HIGH RISK | Authentication, payments, destructive migration, concurrency, security | Explicit invariant, affected failure/recovery proof, appropriate independent review |

Risk escalates when actual impact warrants it; neither number of files nor size of prompt alone demands a specialist, test type, or architectural ceremony. Choose a specialist only for a real unresolved decision. Simple obvious tests can be written directly. A critical journey may need E2E, but never add one by default when a smaller test faithfully proves the risk.

## Small shippable changes
- Aim for one coherent user- or system-observable outcome; do not mix unrelated cleanup, refactor, release, or dependency upgrades with feature work.
- Avoid creating intermediate architecture, plans, documents, abstractions, or agents unless a current constraint requires them.
- Prefer the existing project patterns and authoritative state owners; architecture and test specialists retain ownership of domain decisions.
- Review the actual changed diff before declaring success. A file edit is not a verified outcome; preserve the required behavior, invariants, and failure semantics.
- Finish when required acceptance is evidenced, blockers are resolved, and the relevant integration/release gate is satisfied. Do not extend a slice merely to raise coverage, add tests, polish unrelated code, or use another skill.

## Fast feedback and stop rule
During implementation, verify the *affected* behavior with the cheapest faithful check. Run broader checks when changed boundaries or repository policy demand them. Do not accept flaky reruns as proof. Before adding extra work, ask: "Which current requirement, realistic defect, invariant, or maintenance cost justifies it?" If none, stop. Actual verification commands and platform checks must be recorded as run, failed, skipped, or unavailable; do not infer execution.

## Response preference
For coding and operational follow-ups, prefer a compact outcome-first answer:
- **Result:** changed behavior and real repository artifact.
- **Evidence:** actual diff/commit/PR and tests bound to the assessed revision; say UNRUN when not executed.
- **Remaining:** only unresolved blockers or acceptance.
- **Next:** one concrete continuation step when relevant.

Use deeper explanation when the user asks for research, design, rationale, or a complete audit. Do not turn the four fields into empty headings or add repetitive milestone narratives. Report IMPLEMENTED, VERIFIED, MERGED and RELEASED as distinct states; do not claim a later state without evidence.

## Measurement without gaming
Optimize **time-to-verified-outcome** with correctness as a guardrail. When GitHub evidence exists, consider PR cycle time, CI critical-path time, stale/irrelevant job-minutes, escaped requirements, regressions, and rework. Establish a real baseline before targets; commit count, test count, agent count and coverage percentage are not productivity outcomes. Record measured data as data, not estimated performance.
