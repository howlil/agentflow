---
name: Agentflow execution contract
about: Preserve approved research, requirements, evidence, and the next action across ChatGPT conversations
title: '[Agentflow] '
labels: []
---

## Objective
<!-- Name one observable engineering outcome. Replace every example placeholder before validation. -->

## Repository and baseline
- Repository: <!-- owner/repo -->
- Base branch and initial commit: <!-- actual branch / SHA -->
- Related research / ADR: <!-- links/paths or N/A with explanation -->
- Active Issue / PR (if continuing): <!-- existing URL or none -->
- Delivery target / GitHub Milestone: <!-- existing link or plain target; N/A if no milestone -->
- Parent / related Issues: <!-- existing Issue links or none; avoid duplicates -->
- Depends on / blocks: <!-- real Issue references, native relation only if actually configured; none if independent -->
- Related active PRs checked: <!-- PR links or none, with inspected revision/date -->

## Scope and invariants
<!-- Required behavior, preserved behavior, explicit exclusions, and consequential failure states. -->
<!-- Coordination: affected files/interfaces and shared state owner; current accountable work owner; potential write/decision/ordering conflicts. These pointers are NOT a second requirement ledger or an exclusive lock. -->
<!-- For cross-chat continuation, reconcile current Milestone/parent intent and open PRs against these invariants before editing. -->

## Research decision traceability
Record each **approved, actionable** research conclusion exactly once. Its disposition is INCLUDE (mapped to one or more requirement IDs), EXCLUDE, or DEFER (both require an explicit reason). These are research decisions, not a second requirement-status ledger. Do not copy an entire research transcript here. If the task has no approved research decisions, replace the **entire decision table (header, divider, and rows)** with the single line: N/A: no approved research decisions.

| Decision | Approved conclusion and source | Disposition | Requirement ID(s) or rationale |
| --- | --- | --- | --- |
| DEC-001 | <!-- approved conclusion and real source reference --> | INCLUDE | AF-001 |

## Acceptance contract
The **Requirement evidence ledger below is the single authoritative record** for requirement ID, observable acceptance, implementation state, and verification evidence. IDs are stable and unique within this Issue. A new decision affecting approved scope or acceptance must be recorded under Decisions and deviations. Do not maintain a separate status checklist.

## Requirement evidence ledger
| Requirement | Required behavior and observable acceptance | Failure / edge case | State | Code / PR evidence | Verification (method, SHA, result) |
| --- | --- | --- | --- | --- | --- |
| AF-001 | <!-- behavior and objective proof --> | <!-- meaningful failure or N/A with reason --> | PENDING | UNRECORDED | UNRUN |

Allowed states:
- `PENDING`: no implementation evidence yet.
- `IMPLEMENTED_UNVERIFIED`: code evidence exists but acceptance proof is incomplete.
- `VERIFIED`: inspected implementation and appropriate evidence satisfy the criterion at the assessed revision.
- `BLOCKED`: a known failure or unavailable required check blocks completion; document the blocker.

Evidence is a report of **actually observed** code/test results, not proof merely because a table says PASS. The host must read GitHub state for each cited run and confirm that its commit matches the latest assessed HEAD. Record UNRUN when tests cannot be executed.

## Decisions and deviations
<!-- Record actual user-approved changes to research disposition, scope, or acceptance, including links. -->

## Resume pointer
- Active PR and branch: <!-- URL/branch or none -->
- Execution phase: PLANNED
- Latest inspected HEAD SHA: UNKNOWN
- CI evidence assessed for SHA: UNRUN
- Next requirement: AF-001
- Next concrete action: <!-- exact affected code/behavior to inspect or implement -->
- Open blockers: none

## Completion gate
No requirement is accepted without observable evidence. Record decisions omitted from implementation as EXCLUDE or DEFER with reasons; never silently drop them. Do not close while requirements remain unverified or required target-runtime checks are missing. No external AI worker, model API key, or standalone orchestrator is part of this workflow.
