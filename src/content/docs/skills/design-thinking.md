---
title: Design Thinking
description: Turn a known contract into an implementation graph, then code that passes explicit quality gates.
---

`design-thinking` owns:

> **How should this known behavior and system contract become code?**

## Input and output

```text
In:   .agents/engineering.md (K, R, S, contracts + compat, flows, G#, F#, DEC, D)
      + interface graph (U, M, ST, UG) + .agents/product.md (B#, X#, P#) + the repo
Out:  code + an implementation note in the task or PR (≤ 15 lines)
      durable consequences (D#, DEC, verification commands) → engineering.md
Next: test-engineering
```

## Use when

Implementing, building, refactoring, or fixing anything non-trivial: an endpoint, service, script, job, migration, or the code behind an interface.

## Don't use when

Product behavior, system architecture, interface graph, test strategy, diff review, or release mechanics are still unresolved.

## Model

```text
T    shape (types, IDs, variants, expected errors)
O    operation in the success flow, citing an R# or flow
FL   failure: expected, defect, or interruption, handled at its owner
CAP  capability: argument vs injected dependency vs construction
PL   policy: retry, timeout, cache, instrumentation
LF   lifetime: acquire → scope → use → child work → release
VER  proof, with the stage it belongs to
```

Every consequential path must trace upstream. Decode at every trust boundary; deny by default; never build commands or queries by string concatenation.

## Ready gate

Done only if:

- every O, FL, and PL traces upstream, and no consequential path is unexplained;
- the CQ gate, AI-code gate, and F# rules pass in CI;
- every FL, PL, and P# has a VER at the right fidelity and stage;
- shortcuts are recorded as D#;
- no `[blocking]` A# is open.

## Try it

```text
Use $design-thinking to implement recurring-task expansion against
the existing scheduling contract, and show me the O/FL/VER trace.
```

[Read the complete `design-thinking` instructions](/reference/design-thinking/).
