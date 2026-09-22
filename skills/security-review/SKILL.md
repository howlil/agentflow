---
name: security-review
description: Review a code change or security-sensitive implementation by tracing changed trust, authority, exposure, and sensitive-data flows to find concrete reachable security failures. Use when a change materially touches authentication, authorization, sessions/tokens, tenant isolation, privileged operations, untrusted input to sensitive sinks, files/paths, network requests, webhooks, external integrations, secrets/keys, cryptography, sensitive data, public exposure, CORS/CSRF, abuse controls, security configuration, or security-relevant dependencies. Default to the smallest affected security graph; use broader threat-based review only for new applications, major security redesigns, incidents, or explicit audits. Do not run generic OWASP/ASVS/STRIDE checklists by ritual, block solely on scanner/CVE presence, invent custom security controls when trusted primitives already satisfy the property, or report vulnerabilities without a reachable path and evidence.
---

# Security Review

Security Review exists to find meaningful security failures introduced or exposed by a change.

```text
Δ → Graph → Security<P, T, E>
│                │      │  │  │
│                │      │  │  └─ evidence that the property fails or holds (§10)
│                │      │  └──── reachable attacker / trust path          (§4-9)
│                │      └─────── protected asset or security property     (§3)
│                │
│                └─ nodes = actors, boundaries, controls, assets, sinks
│                   edges = authority and untrusted/sensitive data flow
│
└─ changed behavior, configuration, dependency, or exposure
```

```text
§1  Gate         invoke only when security-relevant behavior changed
§2  Delta        smallest affected security graph
§3  P            protected asset and required security property
§4  Authority    actor → authorization → protected effect
§5  Data         untrusted source → transformation → sensitive sink
§6  Secrets      sensitive-data flow and exposure boundaries
§7  Boundary     external systems, network, files, webhooks, configuration
§8  Supply       dependency and build/release security applicability
§9  Abuse        adversarial availability / resource abuse only when relevant
§10 E            evidence-backed reachable finding
§11 Proof        targeted security verification; test-engineering if complex
§12 Handoff      architecture/control changes go to the owning skill
```

Start from the change, not a vulnerability catalog.

Ask:

```text
What security property must remain true?
What can an untrusted or less-privileged actor reach now?
What authority can they exercise?
What sensitive data can flow?
What privileged effect can occur?
```

Then trace the smallest realistic path from attacker capability to protected asset/effect.

If there is no reachable path, broken control, and meaningful impact, there is no security finding.

## 1. Applicability gate

`security-review` is a specialist capability, not a mandatory stage.

Invoke it when a change materially touches:

```text
authentication
authorization / RBAC / ABAC
session management
cookies / tokens / JWT
password / credential handling

tenant or user isolation
ownership checks
admin / privileged operations
impersonation / delegated authority

user-controlled input reaching:
- database/query
- HTML/template output
- shell/process execution
- filesystem/path
- URL/network request
- parser/deserializer
- redirect
- dynamic code/config

file upload/download
secrets / key management
cryptography
sensitive/private data
payment or security-sensitive workflows

public API exposure
CORS / CSRF
webhooks
OAuth/OIDC
external integrations
rate / abuse controls

security configuration
IAM / permissions
public/private exposure
dependency changes with meaningful security impact
new trust boundary
```

Do not invoke deep security review by default for:

```text
formatting
renaming
CSS/layout
documentation
mechanical refactors
trivial type changes
internal mapping code
local changes that do not alter:
- trust
- authority
- exposure
- sensitive data flow
- privileged effects
```

Normal `code-review` remains responsible for noticing when a change should escalate.

Canonical trigger:

```text
If a change modifies
what an untrusted actor can reach,
what authority an actor has,
what sensitive data can flow,
or what privileged effect can occur,
security-review becomes relevant.
```

## 2. Scope the changed security graph

Default to diff-based review when a change set exists.

Build only the affected graph:

```text
untrusted / less-trusted actor
        ↓
entry point
        ↓
authentication / identity
        ↓
authorization / policy
        ↓
validation / normalization
        ↓
business operation
        ↓
sensitive state / privileged effect / external sink
```

Also trace configuration or dependency edges when they change effective security behavior.

Inspect surrounding code only far enough to establish:

```text
who controls the input/authority
where trust changes
which control is supposed to stop misuse
which asset/effect is reachable
what actually happens
```

Do not turn every PR into a whole-application penetration review.

Use broader baseline/threat-based review only when justified:

```text
new application
major security-sensitive redesign
new tenant/isolation model
large trust-boundary change
legacy system onboarding
post-incident investigation
explicit security audit
```

For baseline work, map the relevant application trust zones, assets, privileged workflows, external boundaries, and existing controls before looking for attack paths.

## 3. Define P: asset and required security property

Do not begin with vulnerability names.

Begin with:

```text
What are we protecting?
Who is allowed to do what?
What input is untrusted?
What boundary is crossed?
What must never become possible?
```

Examples:

```text
User A must never read or modify User B's private record.

A normal user must not invoke an administrator-only operation.

An unauthenticated caller must not create privileged state.

Uploaded content must not escape the intended storage boundary.

A user-controlled network destination must not expose internal-only resources.

A webhook replay must not duplicate a privileged effect.

Secrets must not reach client output, logs, traces, source artifacts, or third parties.

A tenant-scoped worker must not operate on another tenant's objects.
```

Write the property before judging the implementation.

Only inspect controls that trace to a real asset/property/threat.

If the property itself is missing or ambiguous because the architecture does not define the trust boundary, escalate that design gap to `engineering-design`.

## 4. Trace authority to the protected effect

Authentication answers:

```text
Who is this actor?
```

Authorization answers:

```text
May this actor perform this action on this resource?
```

For every changed privileged operation trace:

```text
actor
  ↓
identity/session
  ↓
requested resource/action
  ↓
authorization decision
  ↓
protected effect
```

Authorization must hold at the server-side effect boundary.

Do not accept authorization that exists only:

```text
in the UI
in hidden/disabled controls
in client-side state
in routing/navigation
in a previous unrelated request
in a guessed role from client input
```

Pay special attention when changed behavior touches:

```text
object ownership
IDOR / BOLA-style resource access
tenant isolation
admin/user transitions
bulk operations
indirect references
alternate API paths
background jobs acting for users
impersonation
delegated authority
resource creation followed by mutation
```

Prefer deny-by-default semantics when access is not explicitly granted.

Check the actual resource/action pair, not merely whether the actor is authenticated.

For multi-step workflows, confirm authorization is preserved across every step that can produce the protected effect.

## 5. Trace untrusted data to sensitive sinks

Use source → transformation → sink reasoning.

```text
SOURCE
user input
request body/query/header
URL
uploaded file
external API response
webhook
stored untrusted content
environment/config from a less-trusted source

        ↓

TRANSFORMATION
parse
canonicalize
validate
normalize
authorize
encode
map to safe primitive

        ↓

SINK
database/query
HTML/template
filesystem/path
command/process
network request
redirect
log
deserializer
dynamic code/config
privileged state transition
```

Do not report "missing validation" without explaining the actual path.

For every suspected issue establish:

```text
attacker-controlled value
        ↓
crossed boundary
        ↓
sensitive operation
        ↓
broken property
```

Reason about the actual library/framework semantics in use.

Do not infer a vulnerability merely because a source and sink both exist.

## 6. Respect trusted security primitives

Do not ask application code to reimplement protections already correctly provided by established framework/library primitives.

Examples:

```text
parameterized database API
framework output escaping
standard password hashing library
framework CSRF middleware
mature session implementation
well-established cryptographic primitive
```

Review whether the primitive is:

```text
used correctly
used on every required path
bypassed
disabled
misconfigured
fed invalid assumptions
wrapped in a way that removes its guarantee
```

Prefer secure defaults over custom hardening steps.

Do not invent custom cryptography, sanitizers, authentication protocols, token formats, or authorization frameworks when a trusted mechanism already satisfies the property.

If cryptography changes materially, verify purpose, primitive/library, key lifecycle, nonce/IV rules, rotation/revocation implications, failure handling, and compatibility. Escalate specialized cryptographic design when needed.

## 7. Trace secrets and sensitive data

Sensitive data is a flow problem.

Classify only data relevant to the change:

```text
credential
session/token
private key
API secret
personal/private record
payment/security-sensitive data
tenant-confidential data
internal security metadata
```

Trace:

```text
source
 ↓
processing
 ↓
storage
 ↓
transport
 ↓
telemetry
 ↓
client/third party
```

Verify it does not unintentionally reach:

```text
source control
client bundle
HTML/client response
logs
traces
metrics labels
error messages
analytics
URLs/query strings
third-party systems
build artifacts
cache keys or debug dumps
```

Telemetry is another data boundary.

Do not improve diagnosis by logging a secret or sensitive payload that does not belong there.

For stored/transmitted sensitive data, check only the protections required by the product/system property. Do not demand "encrypt everything" by ritual.

## 8. Review changed external and configuration boundaries

Configuration is part of the security graph when it changes effective authority or exposure.

Review relevant changes to:

```text
CORS
cookies
TLS
authentication mode
session settings
public/private exposure
network access
IAM / permissions
secret injection
debug/development mode
storage permissions
security headers
deployment environment
proxy/trust settings
```

Ask:

```text
Did the effective trust boundary move?
Did a previously private resource become reachable?
Did authority broaden?
Did a secure default become opt-in or disabled?
```

### Network destinations / SSRF-sensitive flows

When attacker-controlled data influences an outbound request, establish the required destination policy.

Trace:

```text
attacker-controlled destination
        ↓
parse / canonicalize
        ↓
scheme + host + port resolution
        ↓
redirect behavior
        ↓
DNS / network destination
        ↓
request
```

When only known destinations are valid, prefer explicit allowlisting and server-constructed requests.

When arbitrary public destinations are a product requirement, verify controls that keep internal/private/unsafe destinations out of reach and account for redirect/resolution behavior relevant to the implementation.

Do not label every URL field "SSRF"; prove the server actually performs a reachable request under attacker influence.

### Files

When untrusted input affects a path or upload:

```text
original name/input
        ↓
server-side identity/path decision
        ↓
type/size/content checks required by the product
        ↓
storage boundary
        ↓
serving/download boundary
```

Do not let user-supplied paths define arbitrary filesystem locations.

Review traversal/canonicalization, executable serving, access control, and storage exposure only where relevant to the actual file workflow.

### Webhooks / callbacks

Trace:

```text
sender identity/authenticity
        ↓
payload validation
        ↓
replay/duplicate semantics
        ↓
authorization/business rule
        ↓
privileged effect
```

Do not assume signature verification alone makes a replay-sensitive effect safe.

## 9. Review dependencies and supply-chain changes by applicability

A scanner finding is a lead, not automatically a security finding.

For a changed dependency ask:

```text
Was the package/version actually added or changed?
        ↓
Does the advisory apply to this version/configuration?
        ↓
Is the vulnerable capability present?
        ↓
Is it reachable in this application/deployment?
        ↓
Can an attacker satisfy the required preconditions?
        ↓
What is the realistic impact?
```

Prioritize reachable/applicable risk.

Do not block solely because:

```text
a CVE exists
a scanner reports "high"
a transitive dependency is present
```

without understanding applicability.

Escalate quickly when the change indicates:

```text
known malicious or compromised package
dependency provenance/integrity failure
credential or signing-key exposure
build/release integrity compromise
critical remotely reachable vulnerable functionality
unexpected dependency substitution/typosquatting
```

Supply-chain protection for build artifacts, provenance, signing, and release integrity belongs primarily to `release-engineering`; Security Review identifies the security property/risk.

Automated dependency review/SCA is useful for discovering candidate issues. Manual review decides whether a candidate is relevant to the changed application path.

## 10. Treat adversarial availability separately from capacity

Normal latency, capacity, autoscaling, and organic traffic saturation belong to `production-ops`.

Security Review owns availability when an attacker can intentionally create disproportionate impact through the changed behavior.

Examples:

```text
unbounded expensive request
credential brute force
unbounded upload
resource exhaustion
fan-out/amplification
algorithmic complexity abuse
missing rate/abuse boundary on privileged or costly operations
replay causing repeated expensive effects
```

Trace:

```text
attacker cost
        ↓
reachable operation
        ↓
system/resource cost
        ↓
existing bound/control
        ↓
impact
```

Do not demand rate limiting for every endpoint.

Add an abuse control only when the attacker/resource asymmetry justifies it.

## 11. Use threat frameworks as challenge libraries, not proof

OWASP Top 10, ASVS, CWE, STRIDE, and similar frameworks can help challenge the affected graph.

Use them after the graph is known:

```text
affected asset/property
        ↓
reachable trust/authority/data path
        ↓
relevant threat categories
        ↓
challenge existing controls
```

Do not:

```text
walk every ASVS item for a CSS change
run STRIDE on every CRUD patch
report a vulnerability because it matches a CWE name
add controls only to satisfy a checklist
```

For broad/baseline security review, a structured threat model is appropriate because design-level risks and forgotten attack paths are part of the scope.

For normal PR review, keep threat reasoning on the changed subgraph.

Vulnerability names are classification after understanding, not evidence before understanding.

## 12. Require evidence for every finding

Every finding must establish:

```text
Location
   ↓
Security property
   ↓
Attacker capability / trust assumption
   ↓
Actual authority/data flow
   ↓
Broken or missing control
   ↓
Reachable failure path
   ↓
Impact
   ↓
Smallest corrective direction
```

Minimum form:

```text
[Severity] file:line — concise security issue

Property:
<what must remain protected>

Actual:
<what the implementation currently allows>

Attack/failure path:
<minimal realistic reachable path>

Impact:
<unauthorized capability, exposure, integrity loss, or abuse>

Fix:
<smallest change that restores the property>
```

Do not report a theoretical vulnerability merely because code resembles a dangerous pattern.

If a suspected path is cheap and safe to verify, run the smallest targeted check.

If evidence falsifies the suspicion, remove the finding.

State residual uncertainty explicitly when reachability or deployment context cannot be established.

## 13. Assign severity from realistic impact and reachability

Use the same review language as `code-review`:

### Critical

A reachable issue can plausibly cause severe impact such as:

```text
broad authentication/authorization bypass
cross-tenant or large-scale sensitive-data exposure
remote code execution in the deployed context
credential/signing-key compromise
destructive integrity failure with large blast radius
build/release integrity compromise
```

### Major

A concrete reachable weakness can cause:

```text
unauthorized access/action
meaningful private-data exposure
privilege escalation with bounded scope
security-sensitive workflow bypass
real injection/path/network boundary violation
replay/abuse with meaningful effect
material security regression
```

### Minor

A real security weakness with limited scope/impact, for example:

```text
narrow information exposure
localized hardening gap with reachable but constrained impact
missing defensive control on a low-risk path
test gap around an already-correct important security property
```

Severity is not copied blindly from a scanner/CVE.

Consider attacker capability, reachability, preconditions, privilege level, data/effect scope, blast radius, and compensating controls.

## 14. Design targeted executable proof

Security Review owns:

```text
which security property matters
which attack/trust path threatens it
```

For obvious verification:

```text
simple policy decision
→ targeted unit test

API authorization / tenant isolation
→ integration test

real parser/validation boundary
→ unit or integration at that boundary

database-enforced isolation
→ real DB integration test

multi-step browser/session security workflow
→ targeted E2E only when lower levels cannot prove it
```

Examples:

```text
anonymous
→ privileged endpoint
→ denied

User B
→ User A's resource
→ denied

revoked session
→ protected action
→ denied

untrusted path
→ outside allowed root
→ rejected

replayed webhook
→ privileged effect occurs at most once
```

If verification itself requires non-trivial environment, concurrency, protocol, failure injection, or boundary design:

```text
security-review
→ property + reachable attack path
→ test-engineering
```

Do not recreate testing architecture here.

Do not create a giant security suite when one faithful regression proof protects the property.

## 15. Keep ownership boundaries clean

### `engineering-design`

Owns:

```text
trust boundaries
state ownership
system-level security guarantees
architecture
```

Security Review asks whether the implementation/change violates them.

If the correct fix requires a new trust boundary, different state owner, different isolation model, or new architectural control:

```text
security-review
→ finding/property
→ engineering-design
```

### `design-thinking`

Owns implementation of security controls inside the software graph.

### `code-review`

Owns general correctness/maintainability review and detects whether deeper security review is warranted.

```text
code-review
→ changed trust/authority/data boundary?
→ security-review
```

### `test-engineering`

Owns complex executable proof.

```text
security-review
→ property / attack path

test-engineering
→ smallest faithful proof
```

### `release-engineering`

Owns build/deploy/release mechanics and protections such as artifact/release integrity where those are part of the shipping system.

### `production-ops`

Owns runtime detection, diagnosis, mitigation, and recovery.

Security Review can identify security-relevant telemetry or operational properties, but monitoring/incident mechanics belong to `production-ops`.

## 16. Review-only vs remediation

For an explicit request:

```text
"security-review this PR/change"
```

default:

```text
inspect
→ prove findings
→ report
→ do not modify code
```

When the parent task explicitly asks to review and fix, or Security Review is an internal stage of implementation:

```text
inspect
→ finding
→ smallest effective control
→ targeted verification
→ re-review affected security graph
```

Do not broaden remediation into unrelated hardening.

Prefer:

```text
smallest effective control
+
smallest faithful proof
+
clear residual risk
```

## 17. Output and persistence

Lead with actionable findings ordered by severity.

```text
Critical
- ...

Major
- ...

Minor
- ...
```

Each finding must include the security property, reachable path, impact, and corrective direction.

After findings, optionally include:

```text
Verified
- targeted security checks actually performed

Residual risk
- material uncertainty that could not be resolved
```

If there are no evidence-backed findings:

```text
No actionable security findings.
```

Do not manufacture security feedback.

Do not create `.agents/security.md`, `SECURITY_REVIEW.md`, or `threat-model.md` by default for every change.

Per-change review evidence belongs in the PR/task/review context.

Durable system security properties belong in `.agents/engineering.md`.

Consequential security architecture decisions belong in ADRs.

Create a durable threat/security artifact only when a baseline audit, major architecture, compliance requirement, or explicit task actually needs one.

---

## Proportionality

Depth follows security risk, not diff size.

```text
mechanical / non-security change
→ no dedicated security-review

normal feature with unchanged trust/exposure
→ code-review security awareness only

auth / authorization / sensitive input/data change
→ focused review of affected security graph

new external boundary / tenant model / privileged workflow
→ deeper review + targeted proof

major security architecture change / incident / explicit audit
→ broader threat-based review
```

A five-line authorization change can deserve deeper review than a thousand-line internal refactor.

---

## Anti-goals

Security Review is not:

```text
OWASP checklist completion
mandatory STRIDE ceremony
"sanitize everything"
"encrypt everything"
one security test per endpoint
one threat model per PR
custom crypto design
custom auth framework design
CVE severity copying
scanner finding = vulnerability
speculative attacker stories
whole-app pentest for every change
security theater
```

Frameworks and scanners are inputs.

Reachable security properties and evidence determine findings.

---
