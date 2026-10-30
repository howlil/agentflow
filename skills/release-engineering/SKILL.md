---
name: release-engineering
description: Decide whether to release, choose the version and release lane (alpha, beta, rc, stable), keep a clean changelog, and carry a verified change to its distribution target with a credible recovery path. Covers release triggers and batching, versioning and tagging (SemVer, calendar, build identity), pre-release promotion gates, CHANGELOG and release notes, CI/CD release workflows, artifact identity and provenance, compatibility and migration during rollout, rollback or roll-forward, post-release verification against SLOs, and release metrics (DORA). Use this whenever the user wants to release, publish, deploy, ship, tag, bump a version, cut a beta, write a changelog or release notes, set up release CI, or roll back, even if they only say "naikin versi" or "rilis". Reads .agents/engineering.md, code-review verdict, and test-engineering evidence. Does not run daily operations, incident command, or mandatory canaries.
---

# Release Engineer

A release is a decision, not a side effect of a merge. This skill decides whether to release, which version and lane, what the changelog says, and how the verified change reaches its target with evidence and a way back. Do not assume every project has a production server: a package, a plugin, and a service have different release contracts.

```text
In:   code-review verdict · test-engineering PF (stage release) and stage map · engineering.md (G/SLO, compat, F, D, ## Release)
      · product.md (distribution scope) · the repo and its existing release path
Out:  version + tag + changelog + published or deployed artifact + evidence · durable policy in engineering.md ## Release
Next: project operations (outside this skill)

Contract → Decide → Version → Changelog → Pipeline → Recovery → Verify → Ready
```

## IDs

```text
RL  a release (version, lane, source SHA, artifact identity). Its facts live in the tag, CHANGELOG, and release page.
```

## 1. Contract

Inspect the code, existing release workflow, manifests, repository rules, and `.agents/engineering.md`. Establish only what changes the release decision: exact source revision and its verification evidence; the real destination (static site, service, package, CLI, plugin, app); current vs candidate version; existing build, test, and publish commands and permissions; compatibility constraints, state changes, downtime tolerance, and consumers that cannot update together. Separate observed facts from assumptions.

Ask only when the destination, authorization, or version policy is unknown and changes the decision (max 3 questions); otherwise assume, mark A#, continue. If the target, permission, or evidence is missing, name the blocker. Never invent a deployment or claim readiness.

## 2. Decide: release or not

A merge is not a release. Changes accumulate in `[Unreleased]` or a release PR and ship as a batch.

| Change | New version? |
|---|---|
| feat, fix, perf, breaking, security | yes |
| docs, chore, ci, refactor, test, dev-dependency | no; rides the next batch |
| security or critical bug fix | immediately (patch or hotfix) |

Release when at least one change relevant to consumers is unreleased, the gates are green, and the batch is worth shipping (a coherent feature set, or an urgent fix). Services deployed continuously do not get a version per deploy: use the SHA or build number as release identity and version only meaningful points. Splitting one change across several releases to raise the count is a defect.

## 3. Version and lane

**Scheme** (decide once, record in `## Release`):

| Situation | Scheme |
|---|---|
| declared public API consumed by others (library, CLI, plugin, public API) | SemVer; the public API is declared in writing |
| app or service without external consumers | no semver; release identity = SHA or build number; a calendar version (YYYY.M.PATCH) only if humans need a readable one |
| pre-1.0 | `0.y.z`: minor marks API change, patch does not break (common convention, not a spec rule) |

**1.0.0 gate**: the public API is declared and in use, a compatibility and migration policy exists, and no breaking change is planned soon.

**Bump rules**: the highest change in the batch decides: breaking → MAJOR (MINOR in 0.x), feature → MINOR, fix → PATCH. Deprecation → minor, removal → major. Reset lower numbers on a higher bump.

**Immutability**: a published version or tag is never changed, deleted, or reused. A fix is the next number. Never move an existing tag to different code.

**Lanes:**

| Lane | When | Published to |
|---|---|---|
| main | daily integration | no version |
| `-alpha.N` | internal testing of an unstable build; skip by default | non-default channel |
| `-beta.N` | MINOR or MAJOR, or a risky change (migration, new public API, protocol) needing validation by real consumers before commitment | non-default channel (`next`/`beta`, GitHub pre-release) |
| `-rc.N` | optional; feature-frozen, blocker fixes only | non-default channel |
| stable | after the beta is validated | default channel (`latest`) |

Skip beta for patches, security fixes, docs, internal tools, personal projects, and continuously deployed services. A pre-release never lands on the default channel.

**Cut a beta when**: `merge` stage is green, no open Critical or Major from code-review, changelog draft ready, known issues written down.
**Promote beta → stable when**: PF at stage `release` pass; no API or contract change since the last beta; the validation period with real consumers is done (its length comes from G or an A#, not invented here); no new defects. A fix means `-beta.N+1`, never an edited beta.

## 4. Changelog and release notes

One `CHANGELOG.md` in Keep a Changelog form: a preamble stating the format and versioning, `[Unreleased]`, then one section per version with its date and compare link, using the six types Added, Changed, Deprecated, Removed, Fixed, Security.

- Written for humans. The entry is written with the change (in the PR); a generator (release-please, changesets, git-cliff) may draft, but the final text is curated. A commit message is not a changelog entry.
- One imperative line per entry, user impact first, linked to the PR or issue.
- **Breaking changes** go first with migration steps. Security fixes are named explicitly. Refactor, chore, and test changes stay out unless the user can see them.
- Release notes (the GitHub Release body) are a copy of that version's changelog section, not new prose.
- **Gate**: no release without a version section that has at least one entry, a date, and migration notes for every breaking change. Perfect wording is not a gate.
- Proportionality: an app or service without external consumers needs a release record of ≤ 5 lines; a changelog is optional.

## 5. Pipeline

Choose the smallest safe strategy and prefer the existing release path.

| Situation | Default |
|---|---|
| static site or low-risk stateless change | existing deployment + targeted smoke check |
| package, CLI, plugin | verify package contents, version parity across manifests, immutable identity, supported update route |
| service with availability constraints | compatible rolling deploy if the platform supports it |
| need for fast environment switchback | blue/green only when target and risk justify it |
| high-impact change with measurable signals | canary only with traffic routing, representative telemetry, and stop controls |
| data or protocol change | compatibility sequence before rollout mechanics |

Do not add staging environments, release branches, feature flags, approval gates, or orchestration by default. A feature flag separates exposure from deploy only when required, with an owner and a removal plan.

```text
verified SHA → one build → identified artifact → authorized publish/deploy → verification at the target → released
```

- Build once from the verified SHA, identify the artifact (digest or tag), and promote that same artifact. If the platform builds at deploy time, pin source, lockfile, config, and toolchain and verify the result instead of claiming byte-identical promotion.
- **At most three workflows**: `ci` (PR), `release` (tag or merged release PR: build → verify → publish or deploy), `nightly`. Implement test-engineering's stage map and budgets; every job names the gate it guards, with path filters plus the full-run safety net, cancel-in-progress, cache by lockfile, and timeouts.
- Prefer one release PR that batches changes; merging it creates the tag and release.
- Publish through OIDC trusted publishing with only the permissions needed; revoke long-lived write tokens (a leftover classic token can bypass provenance controls); produce provenance or attestation where the registry supports it; verify the registry digest matches the built artifact; protect tags; require reviewers on the production environment. Never print secrets or bypass protected environments.
- Serialize what must not overlap (publishing one version, a shared migration).
- Stop on a failed required check, version collision, unknown artifact identity, or missing authorization. Never blindly retry an irreversible publish.

A merge, a build, a GitHub Release, a package publish, and a deployment are separate events; one does not imply another.

## 6. Recovery and compatibility

Apply the compat rule from engineering.md: code N must work with schema or contract N-1 and N+1 during rollout. For a stateful or externally consumed change, prefer expand → migrate or backfill → verify → contract, the last step in a later safe release. A harmless additive change does not need the sequence. Ownership of migrations, locking, and idempotency belongs to `engineering-design`; the application code to `design-thinking`.

Choose the failure response before releasing:

- **Rollback**: restore a known-good artifact, only if it stays compatible with current data and external effects.
- **Roll-forward**: ship a correction when reverting cannot reverse the change.
- **Restore**: a proven state-recovery procedure, only when needed and authorized, accounting for writes since the backup.

Rolling back code does not undo data writes, sent notifications, or a published package. Never promise an irreversible artifact can be unpublished or an installed client forcibly downgraded; follow the registry's policy on deprecation, yanking, or a replacement version. Name the stop signal, the recovery action, who may authorize it, and the evidence required afterward. Never run a destructive migration, restore, publish, or production change without authorization.

## 7. Verify

**At the release boundary**, the cheapest faithful proof of the actual risk: package or plugin (inspect built contents, validate manifests, exercise the installation boundary if tools allow); static site (build passes, affected routes and assets respond); service (the intended version is running and the critical flow succeeds); migration (real compatibility and integrity checks, old/new coexistence); recovery (the real mechanism in a non-production boundary when risk requires it). Missing health evidence means unverified, never successful.

**After release**, compare each `H` guarantee's SLI with its target from G. A multiwindow burn-rate alert on the error budget is the trigger for rollback or roll-forward; thresholds come from G or Q, otherwise record an A#. Do not invent numbers. If the error budget is exhausted, release only P0 and security fixes until it recovers. Reference: a 99% SLO over 30 days leaves about 432 minutes of budget; 99.9% leaves about 43. Daily monitoring, on-call, capacity planning, and incident command are outside this skill.

## 8. Ready and status

Ready to release only if all hold:

- code-review verdict is Approve or Approve with Minor, no Critical or Major open;
- stage `merge` is green and PF at stage `release` pass;
- the compat rule and the recovery path are decided;
- signals and burn-rate alerts exist for `H` guarantees; the error budget is not exhausted;
- the version, lane, and CHANGELOG section are ready, and authorization exists;
- no `[blocking]` A# is open.

Report `IMPLEMENTED`, `VERIFIED`, `PUBLISHED`, `DEPLOYED`, and `RELEASED` separately as applicable. Never claim a remote effect from a local build, or execution from a proposal. Without shell, network, or publish tools, give a bounded recommendation and state the verification gap.

## 9. Metrics

| Indicator | Default | Note |
|---|---|---|
| Change lead time (commit → production) | trending down; rough elite benchmark < 1 day | start from the commit, not the merge |
| Deployment frequency | trend only | per application; never a target alone |
| Failed deployment recovery time | rough elite benchmark < 1 hour | |
| Change fail rate | rough elite benchmark ≈ 5% | least reliable benchmark |
| Deployment rework rate | trend | no official tiers |
| Spam ratio (releases containing only non-user-facing changes ÷ releases) | near 0 | own heuristic, not an industry standard |
| Changelog completeness (versions with a full section; breaking changes with migration notes) | 100% | |
| Beta → stable (soak time, `-beta.N` count) | trend | quality of validation |
| Error budget spent per release | trend | from G |
| Artifact integrity (releases with provenance, no long-lived tokens) | 100% where the registry supports it | |

Read throughput and instability together: speed bought with rising rework is not progress, and frequency can be gamed by splitting one change into several deploys. Not targets: tag count, release count, changelog length. Small projects need five: lead time, change fail rate, rework count, changelog completeness, spam ratio. Benchmarks come from industry reports and vary by source.

## 10. Persist and handoff

Persist durable policy in `.agents/engineering.md` `## Release`: version scheme, lanes and promotion gates, release commands, changelog policy, recovery direction; verification commands stay under `## Verification`. Edit in place and keep valid context. Per-release facts live in the tag, CHANGELOG, and release page. No release-plan documents, progress logs, or extra `.agents/` files. Touch README or version files only for an intentional release or a public behavior change.

| Neighbor | Boundary |
|---|---|
| `product-design` | owns user-visible scope and distribution requirements |
| `engineering-design` | owns state, compat contracts, invariants, G/SLO, and architecture decisions |
| `design-thinking` | implements migration or application behavior the release needs |
| `test-engineering` | owns the stage map, budgets, and proofs; this skill implements them in the pipeline |
| `code-review` | owns the verdict and the review of release code and config; this skill consumes it |

References when a decision needs them: Google SRE Workbook (Canarying Releases; Alerting on SLOs), AWS Builders' Library (rollback safety), semver.org, keepachangelog.com, GitHub deployment environments.