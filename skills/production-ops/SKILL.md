---
name: production-ops
description: Design and operate the minimum production health, observability, alerting, recovery, and incident-response capability required by a workload. Use when preparing a workload for first production use, when a change materially alters runtime health or recovery, when adding or reviewing monitoring/alerts/runbooks/backups, or when diagnosing and recovering from a production incident. Derive operational controls from critical flows and real failure risks. Do not own CI/CD, rollout, or rollback mechanics; release-engineering owns those mechanisms. Do not add SRE ceremony, dashboards, alerts, SLOs, or disaster-recovery machinery without a concrete operational need.
---

# Production Ops

Production operations is not "add monitoring." It is the ability to know whether the workload is healthy, understand meaningful degradation, restore service or data when it is not, and prove recovery.

```text
W → Graph → Ops<H, S, R>
│              │     │  │  │
│              │     │  │  └─ recovery paths that restore the workload (§6)
│              │     │  └──── signals that detect and diagnose health (§3)
│              │     └─────── measurable health of critical flows (§2)
│              │
│              └─ nodes = critical flows, dependencies, stateful resources
│                 edges = runtime dependencies and failure propagation
│
└─ production-sensitive workload or change
```

```text
§1  Context      critical flows, runtime dependencies, state, risk
§2  H            healthy / degraded / unhealthy states
§3  S            detection signals first, diagnostic signals second
§4  Alert        page/notify only when a human action is required
§5  Diagnose     smallest evidence path from symptom to cause
§6  R            mitigation, recovery, and recovery verification
§7  Data         backup / restore / RPO / RTO only when state requires it
§8  Readiness    prove important operational paths before production
§9  Incident     assess → mitigate → recover → learn
§10 Contract     keep .agents/operations.md as a compact operational index
```

Read the workload or incident. Model the critical runtime flow. Decide what healthy means. Detect failure from symptoms users or critical flows experience. Add only the diagnosis and recovery machinery needed for the real risks.

If an operational control does not help detect, diagnose, mitigate, recover, or prove recovery from a material failure, remove it.

## 1. Establish the operational context

Start from the running behavior and the failures that matter.

When present, read:

```text
.agents/product.md
.agents/engineering.md
relevant ADRs
runtime/deployment configuration
existing metrics/logs/traces
existing alerts
existing backup/recovery configuration
existing runbooks
recent incident evidence
```

Identify only what matters operationally:

- **Critical flows** — user/system outcomes whose failure makes the workload meaningfully degraded.
- **Runtime dependencies** — services, stores, queues, workers, external systems, network paths, or infrastructure required by those flows.
- **Stateful resources** — state whose loss, corruption, or unavailability changes recovery.
- **Failure propagation** — how one unhealthy node affects downstream outcomes.
- **Recovery constraints** — known acceptable downtime/data-loss limits, if they actually exist.
- **Operational owner** — who can respond, when that matters for alerting/escalation.

Do not invent scale, SLOs, RTO, RPO, pager rotations, retention periods, thresholds, or business impact.

For an existing workload change, model only the affected operational subgraph.

For a small personal workload, the graph may be:

```text
request
  → application
  → database
```

That does not justify an enterprise observability stack.

## 2. Define H: health from critical outcomes

Health is not "CPU is below 80%." Health is whether the critical workload behavior is still producing acceptable outcomes.

Model:

```text
Critical flow
    ↓ depends on
Runtime nodes
    ↓ produce
Observable outcome
    ↓ classified as
healthy / degraded / unhealthy
```

Start from the outside:

```text
Can the user/system complete the critical operation?
Is the result correct?
Is it arriving within any known acceptable bound?
Is accepted work durable when durability is required?
```

Then derive the internal conditions that explain that outcome.

Example:

```text
Checkout
  ├─ healthy   → accepted orders complete correctly
  ├─ degraded  → orders complete but latency/retry rate is abnormal
  └─ unhealthy → orders cannot be completed or correctness is at risk
```

Use only health states the workload can actually distinguish and act on.

Do not create a formal SLO/error-budget program unless the workload, organization, or task needs one. If service objectives already exist, use them as health criteria rather than inventing parallel thresholds.

## 3. Derive S: detect symptoms before diagnosing causes

Separate two questions:

```text
What is broken?
Why is it broken?
```

### Detection signals

Prefer signals close to the critical outcome.

Typical candidates when relevant:

```text
success / error rate
latency
throughput / traffic
queue age or backlog
saturation
correctness invariant violations
freshness / staleness
job completion
dependency availability visible at the workload boundary
```

For user-facing request/response systems, latency, traffic, errors, and saturation are useful defaults to consider, not mandatory metrics.

For workers or pipelines, better primary signals may be:

```text
accepted work
completed work
failure rate
oldest work age
backlog
processing latency
```

For data systems:

```text
availability
write/read correctness
replication or freshness lag
capacity
recovery status
```

### Diagnostic signals

Add only the evidence needed to explain a detected symptom:

```text
structured logs
traces
dependency metrics
resource metrics
state transition records
deployment/version metadata
correlation/request IDs
```

Do not make verbose logs the primary health detector when a direct outcome signal exists.

Do not instrument every function. Instrument boundaries, critical transitions, and failure points that materially shorten diagnosis.

Telemetry exists to answer an operational question. If a signal has no question, owner, or use, do not add it.

## 4. Alert only when action is required

An alert is an interrupt. It needs a reason.

Create an alert only when:

```text
a material health condition exists
+
someone can take a meaningful action
+
waiting for passive inspection would materially worsen the outcome
```

Alert primarily on symptoms or direct health-state changes.

Use cause-level alerts only when the cause itself requires independent immediate action.

Every actionable alert should make these clear:

```text
What is affected?
How bad is it?
Where should the responder look first?
What safe first action or runbook is available?
```

Avoid:

```text
one alert per metric
alerts with no responder
alerts that have no action
duplicate alerts for the same user-visible symptom
static thresholds copied from generic guidance
```

Not every abnormal signal needs an alert.

Depending on risk, it may be enough to:

```text
record it
show it on demand
surface it during diagnosis
```

Choose paging, asynchronous notification, dashboard visibility, or logs according to urgency and required human action.

## 5. Build the shortest diagnosis path

Once a symptom is detected, a responder should be able to traverse:

```text
health symptom
    ↓
affected critical flow
    ↓
recent change / dependency / state
    ↓
evidence
    ↓
likely failure domain
```

Prefer a small number of views organized around critical flows over dashboards organized around every available metric.

A useful diagnostic view answers questions such as:

```text
What changed?
Which flow is unhealthy?
When did it start?
Which dependency or state transition correlates?
Is the failure global or scoped?
Is the workload failing, slow, saturated, stale, or incorrect?
```

Use logs, traces, dashboards, queries, or runtime inspection only where each gives evidence the others cannot provide cheaply.

Do not build a dashboard as proof of observability.

The proof is that a realistic failure can be detected and narrowed to an actionable failure domain.

## 6. Define R: mitigation, recovery, and proof

For every material failure class, ask:

```text
How do we stop user impact?
How do we restore a valid workload state?
How do we know recovery actually worked?
```

Separate:

### Mitigation

Reduce impact before full root cause is known.

Examples when applicable:

```text
disable a broken feature path
shed or reroute traffic
pause a worker
isolate a bad dependency
fail over
restart a stuck component
stop a destructive job
request rollback of a bad release
```

### Recovery

Return the workload to a valid operating state.

Examples:

```text
restart/recreate state safely
reprocess durable work
restore data
repair corrupted state
roll forward with a fix
use release-engineering rollback
fail back after dependency recovery
```

### Verification

Never infer recovery from "the command succeeded."

Re-check the original health outcome:

```text
mitigation/recovery action
        ↓
critical flow recovers?
        ↓
state/invariant valid?
        ↓
backlog/drain/freshness normal?
        ↓
no continuing user impact?
```

### Release-engineering boundary

`production-ops` owns:

```text
detect degradation
assess impact
determine that mitigation/recovery is needed
select the operational objective
verify health after recovery
```

`release-engineering` owns:

```text
deployment
rollout mechanics
rollback / roll-forward mechanism
artifact/environment promotion
```

Example:

```text
new release causes elevated failures
        ↓
production-ops:
"current production health is unacceptable"
        ↓
release-engineering:
execute the defined rollback mechanism
        ↓
production-ops:
verify the critical flow is healthy again
```

Do not redesign deployment machinery inside Production Ops.

## 7. Treat data recovery as a proven capability

A backup file is not recovery.

For state whose loss matters:

```text
state
  ↓
acceptable data loss?      → RPO, only if required/known
acceptable downtime?       → RTO, only if required/known
  ↓
backup / replication / rebuild strategy
  ↓
restore procedure
  ↓
integrity / usability verification
```

Do not invent RTO or RPO.

If the workload can reconstruct data from another authoritative source, document and test that reconstruction instead of adding redundant backup machinery.

For backups that matter, prove:

```text
backup exists
backup is accessible to the recovery process
restore succeeds
restored data is usable and internally valid
recovery procedure is executable under realistic conditions
```

A backup strategy is incomplete until restore is tested.

Prefer recovery tests that use the same procedure expected during a real incident.

Do not require multi-region DR, replicas, point-in-time recovery, or automated failover unless the recovery requirements justify their cost and complexity.

## 8. Prove operational readiness before production when risk justifies it

Production Ops applies before first launch and before changes that materially alter the operational envelope.

For the affected subgraph, ask:

```text
Can we tell whether the critical flow is healthy?
Can we detect its important failures?
Can we diagnose the likely failure domain?
Can we perform the required mitigation/recovery?
Can we prove recovery?
Can we recover important state if it is lost?
```

Only add a runbook when a non-obvious human procedure is required.

Only add an alert when a human must be interrupted.

Only test recovery paths that matter to the workload's actual failure risk.

Examples:

### New stateless HTTP service

Likely enough:

```text
health / request success signal
error + latency visibility
dependency failure visibility
restart/redeploy recovery
smoke/recovery verification
```

### New durable background worker

Likely needs:

```text
accepted/completed work signal
failure rate
backlog / oldest job age
retry/idempotency behavior
stuck-worker diagnosis
restart/replay recovery
proof that durable work is not lost
```

### Stateful production database change

May require:

```text
data-health signal
capacity/failure visibility
backup/restore proof
migration/recovery compatibility
explicit recovery constraints
```

Do not expand one affected subgraph into a company-wide reliability program.

## 9. Handle incidents mitigation-first

During an active production incident:

```text
detect
  ↓
assess impact
  ↓
stabilize / mitigate
  ↓
recover service or state
  ↓
verify health
  ↓
diagnose root cause deeply
  ↓
prevent recurrence
```

Do not delay a safe mitigation while searching for perfect root-cause certainty.

Preserve useful evidence when mitigation could destroy it, but user/service impact takes priority.

For small incidents, one responder may perform all roles. Do not impose incident-command bureaucracy where it adds no value.

For large incidents, separate coordination, technical operations, and communication when doing so reduces confusion.

During response, keep a concise timeline of:

```text
symptom
impact
hypotheses
actions
observed results
current health
```

After meaningful incidents, capture only learning that changes the system:

```text
detection gap
diagnosis gap
mitigation gap
recovery gap
architecture/control gap
```

Create follow-up work with a verifiable end state.

Do not turn every small production bug into a postmortem ceremony.

## 10. Persist only durable operational context

When working in a project, maintain a compact:

```text
.agents/operations.md
```

This file is an index of durable operational truth, not the executable monitoring or deployment system.

Use the smallest useful structure:

```markdown
# Operations

## Critical Health
- <flow>: <healthy/degraded/unhealthy condition>

## Detection
- <signal / alert>: <what it proves and when action is required>

## Diagnosis
- <entry point to the evidence path>

## Recovery
- <failure>: <mitigation/recovery path> → <recovery proof>

## Data Recovery
- <state>: <backup/rebuild + restore proof>

## Runbooks
- <only non-obvious human procedures>

## Risks / Assumptions
- <only unresolved items that materially affect operations>
```

Omit sections that do not apply.

Do not create separate observability, monitoring, alerting, reliability, backup, DR, or incident-management documents by default.

Executable configuration remains the source of truth for mechanics:

```text
monitoring / alert rules
dashboards as code when used
application instrumentation
backup configuration
runtime configuration
automation
release configuration
```

`.agents/operations.md` should point to or summarize those mechanics only when future operators/agents need the context.

If `.agents/operations.md` already exists:

1. read it first;
2. preserve still-valid operational decisions;
3. update only the affected operational subgraph;
4. remove stale references and contradictions;
5. do not rewrite unrelated operations context.

---

## Relationship to other skills

### `engineering-design`

```text
engineering-design
→ defines production-relevant system guarantees,
  state ownership, boundaries, and failure semantics

production-ops
→ turns those guarantees into runtime health,
  detection, diagnosis, and recovery capability
```

If Production Ops discovers that recovery or health is impossible because of an architectural limitation, feed that requirement back to `engineering-design`.

### `release-engineering`

```text
release-engineering
→ how a change reaches or leaves production safely

production-ops
→ whether production is healthy,
  whether recovery is required,
  and whether recovery succeeded
```

Production Ops consumes release/version metadata for diagnosis but does not own the deployment pipeline.

### `design-thinking`

Use `design-thinking` when production-ops requirements require application changes such as:

```text
instrument a boundary
add a health endpoint
make retry idempotent
expose a diagnostic state
implement graceful recovery
```

Production Ops defines the operational property; Design Thinking implements the software graph.

### `code-review`

Code Review checks whether operationally relevant changes actually preserve the intended health, recovery, and failure semantics.

Do not use Production Ops as a substitute for reviewing application correctness.

---

## Proportionality

Depth follows operational risk.

```text
local/personal app
→ basic failure visibility + local recovery + data restore if needed

small production service
→ critical-flow health + actionable failures + recovery proof

stateful / async / externally dependent workload
→ affected dependency/state subgraph + recovery readiness

high-impact distributed workload
→ explicit health model + actionable alerting +
  tested recovery + incident/runbook support where justified
```

Do not maximize monitoring coverage.

Maximize confidence that important production failures are:

```text
detectable
→ diagnosable enough
→ recoverable
→ verifiably recovered
```

---

## The Pipeline

```text
WORKLOAD / CHANGE / INCIDENT
  → "Which critical runtime outcome matters?"
      → identify the affected operational subgraph

  → "What does healthy, degraded, and unhealthy mean?"
      → define H from observable outcomes

  → "What tells us WHAT is broken?"
      → derive detection signals

  → "What evidence tells us WHY?"
      → add only required diagnostic signals

  → "Does this condition require immediate human action?"
      → alert only when actionable

  → "How do we stop impact and restore valid state?"
      → define mitigation and recovery

  → "How do we prove recovery?"
      → re-check the original health outcome and invariants

  → "Can important state be recovered?"
      → test restore/rebuild when data risk requires it

  → before production-sensitive launch/change
      → prove only the affected readiness paths

  → during incident
      → assess → mitigate → recover → verify → learn

  → .agents/operations.md
      → compact operational context; executable config remains truth
```

**If production can fail in a material way and you cannot detect it or prove recovery from it, the operational design is incomplete.**