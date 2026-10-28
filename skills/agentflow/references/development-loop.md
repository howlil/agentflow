# Development loop

Use for a nontrivial implementation slice. The coordinating host owns transitions; these instructions do not launch workers or enforce checks automatically. Keep one outcome contract and reuse existing task/PR evidence. No new ledger file is required.

## Inputs and ownership
Record the required outcome, preserved invariants, allowed scope, risk, acceptance proof, and current revision. Resolve assumptions that would change correctness before implementing. Existing project contracts and user authorization take precedence.

| Responsibility | Owner |
| --- | --- |
| Production code and obvious regression tests | design-thinking |
| Non-obvious proof boundary, fixtures, failure/concurrency schedule | test-engineering |
| Actual diff, reachable consequence, severity and finding disposition | code-review |
| Scope, transitions, integration and completion | coordinating host |

One writer owns each mutable scope at a time. A testing specialist may supply a proof contract for the implementer. Direct specialist activation remains valid; use its local safeguards without requiring the router to be installed.

## Transitions
1. Define the smallest complete slice and its proof. For a reproducible bug, establish a failing regression before the fix when feasible. Never require elaborate tests for a mechanical change.
2. Implement and run cheap faithful checks continuously. Invoke test-engineering only when proof design is unresolved.
3. Classify failure as product defect, faulty proof, environment failure, or ambiguous contract. Preserve the failing evidence and change the actual cause. Do not treat every red test as a product bug.
4. After applicable proof passes, review the actual diff against the complete slice contract. Give the reviewer the contract, revision, diff and observed evidence; do not supply a desired verdict. Separate review is useful for high risk when supported and authorized. Same-agent review is self-review, not independent verification.
5. For an evidenced blocking finding, return to implementation; add a faithful regression when useful, rerun affected checks, and re-review the changed graph. For an incorrect product or architecture contract, return to its owner before changing acceptance.
6. Run the required integration/release gates on the final candidate. Stop on a real blocker with a precise next action. Do not merge or deploy beyond existing authorization.

## Evidence validity
Tie a result to source revision or working-tree digest, relevant configuration, dependency versions, test environment and command. Never copy an old green result onto a new SHA. After code, tests, configuration, dependencies, model/prompt/data, or base contracts change, mark impacted evidence stale. Unaffected evidence may be retained with an explicit applicability rationale, not relabeled as a new run. Required repository gates must assess the final HEAD or test-merge candidate as the platform requires.

Record run, failed, skipped, unavailable and not-applicable distinctly. A skip is acceptable only when the property does not apply and repository policy permits it. Missing required evidence remains unverified.

## Repair limits and integrity
- Fix the root cause within scope. Never weaken assertions, disable checks, bless snapshots, or remove requirements just to obtain green status. Change expected behavior only through the owning contract and authorized scope.
- Investigate flaky results; rerun-until-green is not acceptance. A justified quarantine needs an owner, expiry/repair action and alternative proof for any blocked critical property.
- Default to two consecutive repair attempts without new evidence or reduced uncertainty, then stop repeating the approach: diagnose again, change the hypothesis, narrow the slice, or report BLOCKED. This is a no-progress limit, not a maximum number of productive fixes or permission to accept defects.
- Deduplicate findings. Close each as fixed with proof, disproved with evidence, or explicitly deferred by an authorized owner with consequence recorded. Critical/Major blockers stay blocking unless repository policy and the authorized owner explicitly accept the risk.
- Do not restart completed stages or add unrelated polish after acceptance is evidenced.

## Exit
Claim VERIFIED only when in-scope acceptance and preserved invariants have current, faithful evidence and no unresolved blocker. Report IMPLEMENTED, VERIFIED, RELEASE-READY and DEPLOYED separately. Release-ready additionally requires applicable release and operational readiness proof; deployed additionally requires observed target rollout and health evidence. Plans, generated documents and green structural tests do not establish behavioral or customer acceptance.
