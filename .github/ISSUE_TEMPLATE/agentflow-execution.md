---
name: Agentflow execution contract
about: Preserve approved research, requirements, evidence, and the next action across ChatGPT conversations
title: '[Agentflow] '
labels: []
---

## Objective
<!-- One observable engineering outcome; link the approved research or specification where available. -->

## Repository and baseline
- Repository: <!-- owner/repo -->
- Base branch and initial commit: <!-- observed branch / full SHA -->
- Related research / ADR: <!-- actual links or paths, never fabricated -->
- Active Issue / PR (if continuing): <!-- URL or none -->

## Scope and invariants
<!-- In-scope behavior, explicit exclusions, and properties that must remain true. -->

## Acceptance contract
The **Requirement evidence ledger below is the single authoritative record** for each requirement, acceptance check, implementation state, and verification evidence. Do not maintain a second requirement checklist that can drift out of sync. Requirement IDs are stable and unique within this Issue. New scope and modified acceptance criteria require a recorded decision.

## Requirement evidence ledger
| Requirement | Required behavior and observable acceptance | Failure / edge case | State | Code / PR evidence | Verification (method, SHA, result) |
| --- | --- | --- | --- | --- | --- |
| AF-001 | <!-- required result and how to recognize it --> | <!-- meaningful failure case --> | PENDING | UNRECORDED | UNRUN |

Allowed states:
- `PENDING`: no implementation evidence yet.
- `IMPLEMENTED_UNVERIFIED`: code evidence exists, but acceptance proof is incomplete.
- `VERIFIED`: reviewed code and required evidence demonstrate the behavior at the assessed commit and environment.
- `BLOCKED`: a known failure or unavailable mandatory check prevents verification; record why.

A green CI check for an older commit is not verification for a newer commit. Distinguish tests not run (`UNRUN`) from tests observed to fail.

## Decisions and deviations
<!-- Record changes to approved scope, acceptance criteria, or implementation direction; link actual evidence. -->

## Resume pointer
- Active PR and branch: <!-- link / branch or none -->
- Latest inspected HEAD SHA: <!-- full SHA or unknown -->
- CI evidence assessed for SHA: <!-- SHA and run URL or UNRUN -->
- Next requirement: AF-001
- Next concrete action: <!-- target file or behavior -->
- Open blockers: <!-- concrete failures or none -->

## Completion gate
Only mark a requirement `VERIFIED` with inspected evidence appropriate to its acceptance criterion. Do not close while required checks or target-runtime acceptance are missing. No external AI coding worker, OpenAI API key, or standalone orchestrator is part of this workflow.
