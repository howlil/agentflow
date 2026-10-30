---
name: design-thinking
description: Turn an engineering contract or a local implementation request into a concrete implementation graph (shapes, success flow, execution semantics, failures, capabilities, trust boundaries, runtime policies, resource lifetimes, targeted verification) and write code that passes explicit quality gates (complexity, patterns, secure defaults, AI-code checks). Language and framework neutral. Use this whenever the user asks to implement, build, code, refactor, fix a bug, add an endpoint, service, script, job, or migration, or to turn a design into working code, even if they never say "design". Reads .agents/engineering.md, .agents/product.md, and design-graph output when present. Does not own product behavior (product-design), system architecture (engineering-design), interface graph (design-graph), test strategy (test-engineering), diff review (code-review), or release mechanics (release-engineering).
---

# Design Thinking

Turn a known engineering contract into an implementation graph, then write code whose consequential paths the graph explains. Do not redesign the product or the system; if implementation exposes a contradiction, return it upstream.

```text
In:   .agents/engineering.md (K, R, S, contracts + compat, flows, G, F, DEC, D)
      + design-graph output (U, M, ST, UG) + .agents/product.md (B, X, P) + the repo
Out:  code + an implementation note in the task or PR (≤ 15 lines)
      durable consequences (D#, DEC, verification commands) → engineering.md
Next: test-engineering

Contract → T → O → FL → CAP → PL → LF → VER → code
```

## IDs

```text
T   shape (type)      O  operation (node in the flow)     FL failure
CAP capability        PL policy                            LF lifetime
VER proof
```

Upstream IDs (B, X, P, Q, A#, R#, S#, K, G, F, DEC, D, U, M, ST, UG) keep their meaning. Trace: every O cites an R# or flow; every FL cites an X# or G#; every P# has a VER.

## 1. Context

Read the upstream contracts and inspect the repo: language, conventions, naming, layout, tooling, existing patterns, installed versions. Follow what exists (detect first); never import APIs or conventions from another version or ecosystem.

- A violation of an F# rule or a contract is allowed only through a D# or DEC.
- A contradiction in R, S, K, or contracts goes back to `engineering-design`; in B or scope, to `product-design`; in U, M, or ST, to `design-graph`.
- Ask only when the answer changes behavior or a contract (max 3 questions); otherwise assume, mark A#, continue.

## 2. Shapes (T)

Define the values that actually move through the code: records, IDs, variants, expected-failure values, commands or events. Use a stronger type only where it removes real ambiguity or an invalid state. Do not brand every ID or wrap every primitive. The shapes are the nouns; the graph is the behavior between them.

## 3. Flow (O)

Map the successful transformation first.

```text
Input → O1 → O2 → O3 → Output
```

Per node: what value comes in and out, what state changes, what external effect occurs. Keep the happy path readable after failure and policy are added. A local function stays local; do not make a service of everything. Preserve the boundaries engineering-design set unless the code proves a contradiction.

## 4. Execution

Cardinality, ordering, concurrency, and freshness are separate concerns.

- **Cardinality**: one result vs incremental results over time. A collection returned once is still one result. Stream only for incremental consumption, continuous emission, or backpressure.
- **Ordering**: mark edges where order matters (reserve stock → charge payment). Do not parallelize merely because it is possible.
- **Concurrency**: mark intent (sequential, parallel, bounded, race, background). Ask what may overlap, what ordering must still hold, what state is shared, what a branch failure does, and what parent cancellation does.
- **Freshness**: caching is a policy (recompute, memoize, TTL, invalidate, dedupe concurrent lookups), allowed only if the contract tolerates stale data.

## 5. Failure (FL)

Retry, fallback, and crash are different outcomes. Model each node as success, expected failure, defect, or interruption.

- **Expected failure** (NotFound, Conflict, PermissionDenied, RateLimited, ValidationError): part of the contract and handleable by callers. Handle at the narrowest boundary that owns the recovery policy (cache miss → local fallback to the database).
- **Defect** (broken invariant, bug, unrecoverable assumption): let it propagate to the proper boundary. Do not convert every defect into a domain error to make types look complete.
- **Interruption**: decide what may stop, what must finish, what must be cleaned up, what state may already have changed, and what child work inherits cancellation.
- **Translation**: convert low-level failures where abstraction ownership changes (SqlError → DatabaseError → BookingFailure → API error). Do not leak implementation failures through a boundary that should hide them.

## 6. Capabilities (CAP)

Separate three kinds of input:

```text
request or local data              → function arguments
stable, substitutable capability   → injected dependency (clock, repository, gateway, config)
dependency needed only to build a
  service                          → satisfied at construction, not leaked to consumers
```

Inject only where substitution, lifecycle, configuration, or boundary ownership justifies it. One interface per function is a defect.

## 7. Boundaries and secure defaults

Every external ingress is a trust transition: HTTP, queue payload, third-party response, config, file, CLI, webhook.

```text
unknown → decode / parse / validate → domain value        (egress: domain → encode → external contract)
```

Decoding proves only what the decoder represents. It does not prove authorization, ownership, freshness, business invariants, or transaction safety; those belong to their real owners. Do not force transport, persistence, and domain representations to share one schema just to avoid duplication.

Secure defaults for every ingress and egress:

- deny by default; authorize on the server and check ownership;
- allowlist validation; parameterized queries; never build commands by string concatenation;
- fail safely: generic message outward, detail to the log, every exception handled at its boundary;
- no secrets in code or logs; run a secret scanner before commit.

## 8. Policies (PL)

Retry, timeout, recovery, caching, rate limits, and instrumentation change semantics (execution count, timing, cancellation, resource use). Model their effect; keep them visually separate from the domain flow where that helps.

**Retry and timeout defaults:**

```text
retry   : transient failures only (timeout, 429, 502-504, connection reset); jittered backoff;
          capped attempts and an overall deadline; honor Retry-After;
          retry budget or circuit breaker when a dependency is clearly down
timeout : layered (connect, request, overall); chosen from the dependency's latency percentile
write   : retry only if idempotent or protected by an idempotency key (key check and action atomic)
          a timeout means the result is uncertain, not "did not happen": reconcile status
```

If a write cannot be made safe to repeat: idempotency key, deduplication, status reconciliation, or no automatic retry.

**Observability**: emit the signals engineering.md names (G measurement points, Challenge detection signals). Structured logs with a correlation ID across boundaries. Log an error once, at the boundary that handles it. Alerts and dashboards belong to `release-engineering`.

**Compatibility**: implement the contract's compat rule (code N works with N-1 and N+1; breaking change = expand → migrate → contract, separate releases).

## 9. Lifetimes (LF)

For connections, files, sockets, streams, subprocesses, subscriptions, and background work:

```text
acquire → owner scope → use → child work → release
```

Make the owner lifecycle explicit so cleanup follows it. Cleanup comes from correct scoped acquisition and finalization in the runtime, not from a type guarantee. For background work ask: does it belong to the parent scope, does interruption cancel it, can it outlive the request, who cleans up? Unowned background work is a lifecycle bug.

## 10. Quality gates

**CQ gate** (enforce with the project's linter or scanner; scan changed functions only; ratchet legacy so no function gets worse):

| Indicator | Default | Note |
|---|---|---|
| Cognitive complexity per function | ≤ 15 (new code); review anything > 25 | Reads closer to maintenance effort than cyclomatic |
| Cyclomatic complexity per function | ≤ 10 (new code) | |
| Function size, parameters | soft: ≲ 30–50 lines, ≲ 3–5 parameters | Soft limits; split by responsibility, not by line count |
| New-code duplication | ≤ 3% | Common gate default |
| New-code coverage | ≥ 80% | Weak alone; assertions must be meaningful |

Reduce nesting with guard clauses and extract-by-responsibility. Do not game the metric with artificial flattening or premature polymorphism. Names follow the codebase convention; a name states what a thing is or does, in domain words.

**Patterns**: a pattern appears only when a named force requires it. Prefer composition over inheritance. Introduce an abstraction at the third duplication, not the second.

| Force | Pattern |
|---|---|
| algorithm varies at runtime | strategy |
| external API shape mismatches the domain | adapter in Data |
| dependency must be swappable or mockable | port + implementation (dependency inversion) |
| complex object construction | factory or builder |
| cross-cutting concern (log, cache, auth) | decorator or middleware |
| data access | repository behind a port Logic owns |

**AI-code gate** (treat model output as untrusted input):

1. Every new import or dependency is verified to exist in the official registry and pinned by lockfile.
2. Build, typecheck, lint, and dependency resolution pass before anything is called done.
3. Spot-check tests: deliberately break the implementation; the tests must fail.
4. Search the repo before writing a helper or abstraction (reuse before create).
5. No dead code and no abstraction without a user.

**Shortcuts**: a deliberate shortcut becomes a D# in engineering.md. An unrecorded shortcut is a defect.

## 11. Verification (VER)

Choose the smallest test that faithfully proves the actual risk. Run the `test-engineering` triage (does an existing proof already cover it?) before adding a test, and give every VER a stage: local checks run at `iter`; integration belongs to `pr`, E2E and manual acceptance to `release`, never to a per-change iteration. Pure rule → unit test. Simple bug → regression test. Existing integration pattern covers it → reuse it. Hand off to `test-engineering` when the proof boundary itself needs design (transactions, races, migrations, async or queue semantics, recovery, flaky suites).

Substitute a dependency only when the property under test lives above it; use the real one when correctness lives in its semantics:

```text
business decision        → fake repository is enough
retry timing             → controllable clock is enough
SQL uniqueness, isolation, migration → real database (with concurrency or representative data)
filesystem, HTTP serialization       → real boundary
```

A fake proves only the behavior whose semantics it preserves.

## 12. Done

Done only if all hold:

- every O, FL, and PL traces to upstream, and no consequential path is unexplained by the graph (else the code or the graph is incomplete; fix the right side);
- CQ gate, AI-code gate, and F# rules pass in CI;
- every FL, PL, and P# has a VER with the right fidelity;
- shortcuts are recorded as D#;
- no `[blocking]` A# is open.

**Implementation note** (task or PR, ≤ 15 lines):

```text
Shapes: T1 …
Flow:   O1 → O2 → …            (R#/flow cited)
Failure: FL1 (X#): … handled at …
Capabilities / policies / lifetimes: only those that change correctness
Verification: VER1 (P#) [iter|pr|release]: …
Debt / decisions: D#, DEC#
```

## Proportionality

```text
tiny local change              → inspect → change → targeted check
normal behavior change         → shapes + flow + failure + capabilities
state, boundary, concurrency,
  or resource change           → model the affected execution graph explicitly
high-risk implementation       → full method
```

Depth follows implementation risk. Use only the parts that can change correctness or maintainability.

## Handoff

`test-engineering` consumes O, FL, PL, LF, VER, and the P# trace, and designs the suites the proof needs. `code-review` later reverses the graph: from the diff back to intent, including a security pass over changed trust paths. `release-engineering` consumes compat rules, migration steps, and emitted signals.