# ChatGPT Web + GitHub Execution

Use when ChatGPT Web is the only AI executor and works on a repository through an authorized GitHub connector. This is workflow discipline, not a grant of permission, shell access, CI execution, or unattended work. Discover the repository's actual default branch; do not assume main or master.

## Loop

```text
recover → first missing contract → do → prove → report → verdict → (user) merge
```

1. **Recover.** Every conversation starts from GitHub, never from chat memory: read the relevant `.agents/` file(s), the open PR for the same outcome (if any), its HEAD SHA, and the latest CI result for that SHA. If the user says "next", continue that PR.
2. **Enter at the first missing contract.** Load the specialist that owns the unresolved decision and carry its IDs forward; a failed ready gate returns upstream instead of being pushed into the PR.
3. **Do.** Default: ship one feature in one vertical branch/PR. Reuse any open PR for the same outcome. Do not split one feature into `M1..M5` milestones or layer-by-layer PRs (DB → API → UI → tests), and do not create branches or PRs per file, skill, retry, or failed check; fix the same PR. Trivial or read-only work needs no branch, PR, or Issue.
4. **Prove.** Add proofs at the stage the risk needs: unit, handler, component, or DB integration tests run in the existing test command, so existing CI covers `pr`. Default to zero new browser/Playwright E2E tests for ordinary features, and never install Playwright/Cypress or add browser-download CI steps unasked. Follow the router budget and `test-engineering` stage map: at most `ci`, `release`, and `nightly` workflows, automated assertions, one manual acceptance pass at release, no extra documents.
4. **Report** in the PR description, kept current rather than appended:
   - what changed (behavior, not a file list);
   - tests added or changed, with their PF stage;
   - CI result for the exact head SHA: `green @<sha>`, `red @<sha>: <failing check>`, or `not run`;
   - at most one line `Not auto-verifiable: <what> — <why>` when truly needed;
   - `Next:` one concrete action if work remains.
5. **Verdict.** Run `code-review` gates first, then the verdict. A `Block` or failed conformance returns to implement; report the findings on the PR.
6. **Merge** only with user approval and an Approve or Approve with Minor verdict. Do not merge, tag, or release because CI turned green. Merge is not release: `release-engineering` owns the version, lane, changelog, and produces `PUBLISHED`, `DEPLOYED`, or `RELEASED` evidence.

## Evidence rules

- A green run on an older SHA does not verify a newer HEAD.
- An edited file is not a verified outcome. Distinguish `IMPLEMENTED` (code exists) from `VERIFIED` (CI green on that SHA covering the behavior), and never claim `PUBLISHED`, `DEPLOYED`, or `RELEASED` without observed evidence.
- If the connector cannot read CI, write files, or perform an operation, say which operation is unavailable and stop that step. Never invent commits, job output, or runs.
- Before writing, re-read the branch HEAD and the files you will change; if another writer changed them, reconcile instead of overwriting.

## Issues (optional)

Use an Issue only when work genuinely spans independent deliverables or sessions — never to stage one normal feature into artificial milestones. Keep it to three sections — `Goal`, `Acceptance` (at most five checkboxes, each naming the automated test that proves it), `Next` — and update it in place. The PR and CI remain the evidence; do not maintain a second status ledger.

## Durable memory

When a slice changes product behavior, architecture, or design preferences, update the matching `.agents/` file in the same PR. Nothing else is persisted.
