---
name: Agentflow execution contract
about: Preserve approved research, requirements, evidence, and the next action across ChatGPT conversations
title: '[Agentflow] '
labels: []
---

## Objective
<!-- One observable engineering outcome; reference the approved research/specification. -->

## Repository and baseline
- Repository: <!-- owner/repo -->
- Base branch / commit: <!-- actual ref -->
- Related research / ADR: <!-- actual links or file paths -->
- Existing PR (if continuing): <!-- URL or none -->

## Scope and invariants
<!-- In-scope behavior, out-of-scope behavior, and guarantees that must remain true. -->

## Acceptance contract
<!-- Stable IDs. Each criterion must have observable proof. Do not mark done from code changes alone. -->
- [ ] **AF-001** — Description of required behavior
  - Acceptance: <!-- executable check or observable behavior -->
  - Failure / edge case: <!-- explicit negative scenario -->
  - Code evidence: UNRECORDED
  - Verification: UNRUN

## Requirement evidence ledger
<!-- Keep this table in sync with the checklist. Allowed: PENDING, IMPLEMENTED_UNVERIFIED, VERIFIED, BLOCKED. -->
| Requirement | Status | Changed code / PR | Verification evidence or blocker |
| --- | --- | --- | --- |
| AF-001 | PENDING | — | UNRUN |

## Decisions and deviations
<!-- Record decisions that change implementation direction; do not silently change acceptance criteria. -->

## Resume pointer
- Next requirement: AF-001
- Next concrete action: <!-- target file/behavior to inspect or implement -->
- Last inspected commit: <!-- SHA or unknown -->
- Open blockers: <!-- explicit blockers or none -->

## Completion gate
An item is VERIFIED only with cited evidence from reviewed code and/or actually observed tests.
Existing GitHub CI can run tests; no external AI coding worker, OpenAI API key, or standalone orchestrator is part of this workflow.
Do not mark the issue complete while blocking requirements or required target-runtime checks are unresolved.
