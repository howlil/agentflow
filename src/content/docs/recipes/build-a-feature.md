---
title: Build a feature
description: Carry one feature through the chain without turning the specialists into a mandatory pipeline.
---

Suppose the request is:

```text
"Add recurring tasks."
```

Do not automatically run every skill. Enter at the first contract that is missing, and stop when the remaining contracts already hold.

## Chain

```text
J1/B#/X#      product behavior unclear        → product-design
R/S/K/G#      ownership, boundary, guarantee  → engineering-design
U/M/ST/UG     interface or interaction        → design-graph
T/O/FL        implementation path             → design-thinking
RK/PF/stage   proof selection and stage       → test-engineering
RV/verdict    diff correctness and gate       → code-review
RL            a real release decision         → release-engineering
```

## Gates

Each step has a ready gate; a failure returns to its owner instead of moving downstream.

```text
every B#/X# has a P#                  product-design
every B#/X# has R → S → flow          engineering-design
every X# has a recoverable V          design-graph
every O/FL/PL traces upstream         design-thinking
every P#/H G# has a PF with a stage   test-engineering
gates green, verdict Approve          code-review
verdict clear, stage merge green      release-engineering
```

## Example

Recurring tasks in a system that already has scheduling:

```text
product-design        J1, B#, X#: what the user can now do, and what breaks
engineering-design    only if a state owner, contract, or guarantee changes
design-graph          the editor: U, M, ST, V (empty/pending/conflict)
design-thinking       O (expand → persist), FL (duplicate run), VER
test-engineering      triage → PF for the duplicate-run invariant at stage pr
code-review           gates, conformance, verdict
release-engineering   only when this actually ships
```

If the existing system already has a scheduling abstraction and the product rules are explicit, skip product and architecture redesign. Use only the skills whose contract is still unresolved.

## What is not required

No mandatory TDD, no per-layer PR split, no release per slice, no `.agents` file beyond the three, and no report or checklist artifact. Proof depth follows the risk and stage, not the number of skills used.
