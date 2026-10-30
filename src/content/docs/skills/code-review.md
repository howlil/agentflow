---
title: Code Review
description: Compare a change against its contract, run the chain's gates, and return a verdict.
---

`code-review` owns:

> **May this change merge, and which upstream contract does it violate if not?**

## Input and output

```text
In:   diff/PR + implementation note (T, O, FL, CAP, PL, LF, VER)
      + engineering.md (F#, D#, DEC, G#, contracts, ## Verification)
      + product.md (P#) + test-engineering PF/RK + interface graph (U, ST, UG)
Out:  verdict + findings (RV#) in the PR or task; no file under .agents/
Next: release-engineering
```

## Use when

Reviewing a diff, PR, commit, or finished implementation; before merge or deploy; when asked to "cek kode" or "udah bener belum".

## Don't use when

Product behavior or architecture is still being decided, or you are about to report style nits the linter already owns.

## Model

```text
Gates      build, typecheck, lint, tests at stage pr, F#, CQ, secret scan, dependency check
Intent     P#/X#/R#/S#/G#/F#/DEC + the implementation note
Actual     trigger → authorization → owner → state → effect → result
Compare    behavior, ownership, invariant, boundary, failure semantics
Conform    F# vs D#/DEC, compat rule, emitted signals, PF tier, touched P#, UG
Risk       correctness → state/concurrency → contracts → security → performance → maintainability → tests
Verdict    Approve | Approve with Minor | Block
```

A finding needs a location, the actual behavior, a concrete failure scenario, and the smallest fix direction. If it cannot be traced to a consequence, it is not a finding.

## Ready gate

- every mechanical gate is green; otherwise return the change without deep review;
- no Critical or Major finding remains open;
- conformance failures are either fixed or recorded as D#/DEC;
- the change is reviewable in size, or split before review.

## Try it

```text
Use $code-review on this diff. Run the gates first, check conformance
against engineering.md, and give me a verdict with RV findings.
```

[Read the complete `code-review` instructions](/reference/code-review/).
