---
title: Test Engineering
description: Decide whether, what, and where to test, then prove it at the stage where the evidence is needed.
---

`test-engineering` owns:

> **What is the cheapest proof that faithfully covers this real risk, and at which stage does it run?**

## Input and output

```text
In:   P#, X# (product) · G# priority, F#, Challenge (engineering)
      · FL#, PL#, VER (design-thinking) · UG (design-graph) · the diff
Out:  tests + stage map lines in .agents/engineering.md (## Verification, ≤ 12 lines)
Next: code-review
```

## Use when

Every change, starting with the 3-question triage:

```text
Q1  Does it touch a P#, G#, FL#, or a boundary?         no  → run existing tests, stop
Q2  Does an existing proof already fail if this breaks? yes → reuse it, stop
Q3  What is the cheapest faithful boundary?             → write it, stage = iter
```

Go deeper for races, migrations, recovery, async/queue semantics, or a flaky suite.

## Don't use when

You are about to maximize coverage, write one test per function, or require TDD. A proof with no named failure it catches is not admitted.

## Model

```text
RK   risk entry: likelihood × impact (Critical | Important | Routine)
PF   proof: boundary + stage + the property it proves
```

| Stage | Runs |
|---|---|
| `iter` | typecheck, lint, unit for the changed behavior |
| `pr` | build, unit, integration on changed boundaries, contract if changed, F# and CQ gates |
| `merge` | full unit + integration, migration test, small smoke E2E |
| `release` | critical-journey E2E, compat N-1/N+1, restore drill, load, a11y/perf lab, one manual acceptance pass |
| `post`, `nightly` | smoke and synthetic checks; cross-browser, long compat, mutation, load |

E2E needs admission: one critical journey whose failure needs a real browser or real cross-system wiring. Ordinary CRUD, forms, and API features are proven lower.

## Ready gate

- every P#, `H` G#, and critical FL# has a PF with tier and stage;
- no new E2E without admission, and no heavy suite at `iter`;
- every critical PF was shown able to fail;
- the stage map lines are recorded;
- no `[blocking]` A# is open.

## Try it

```text
Use $test-engineering to triage this booking change and design the
proof that two concurrent bookings cannot both commit.
```

[Read the complete `test-engineering` instructions](/reference/test-engineering/).
