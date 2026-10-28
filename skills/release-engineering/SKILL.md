---
name: release-engineering
description: Use when designing or changing CI/CD, build and artifact promotion, first deployment, rollout, rollback, migration sequencing, or release gates. Turn a verified change into a repeatable delivery contract with artifact identity, compatibility, recovery and target acceptance. Keep routine local edits out of release ceremony; production-ops owns runtime health and recovery objectives, while test-engineering owns proof design.
---

# Release Engineering

Model delivery as source → verified artifact → target transition → observed outcome, with explicit failure and recovery edges. Use the smallest delivery mechanism that satisfies the workload.

## Standalone safeguards
Inspect the current repository, release policy and target before changing them. Preserve scope and existing authorization; skill activation grants no deploy or merge permission. Distinguish proposed, executed and verified actions. Record missing evidence and never infer success from an upload or green older commit.

## Establish the contract
Read existing build/deploy configuration, lockfiles, environment constraints and relevant engineering/operations guidance. Identify the source revision, artifact identity, target environment, release owner, required proof, compatibility window and recovery objective. Reuse existing pipelines; do not introduce a deployment platform solely because this skill is active.

Define only relevant boundaries:
- source/configuration → build: supported runtime, locked dependencies, repeatable inputs;
- build → artifact: immutable identifier/digest, checks and provenance where warranted;
- artifact → environment: configuration and secret references, least required authority;
- old → new runtime/data: coexistence, migration ordering and external consumer compatibility;
- rollout → acceptance: smoke/health conditions, observation interval grounded in risk, stop and recovery triggers.

Unknown access, owner or recovery capability is a blocker for the affected action, not permission to invent it. Scope authorization already provided by the user and repository applies; do not ask again mechanically.

## Keep CI useful
Run the cheapest faithful checks early and repository-required checks on the final candidate. Each job must protect a distinct property. Measure queue time, runtime, flaky failures and superseded work before adding path filters, matrices or caching. If the full suite is cheap, keep it simple.

Pin required tool versions and dependency inputs. Keep latest-version compatibility probes separate from reproducible required checks. Cache only replaceable build/download inputs with correct keys; never let a cache substitute for required verification. Do not place secrets in cache keys, logs or artifacts.

Use one stable required aggregate check where conditional jobs exist. Require success for every applicable job; failed, cancelled, absent or unexpectedly skipped jobs must not become green. Exercise both classifier and aggregation failure paths. Include merge-queue events only if the repository uses that queue. Cancel superseded verification when safe; serialize non-idempotent publication/deployment rather than cancelling it blindly. Never use skip directives to bypass required evidence.

Keep ordinary CI deterministic. Agent evaluations belong to an explicitly supported evaluation environment, not an unrequested AI worker in GitHub Actions. Read references/ai-data-release.md for model, prompt, retrieval or data changes.

## Ship the tested candidate
Build once and promote the verified artifact when the platform supports it. If a platform rebuilds, verify the actual deployed artifact and record any difference in build inputs. Check environment-specific settings without exposing secret values. Use a direct deployment for a small reversible workload; use progressive exposure only when risk and observability justify it.

Before a stateful transition, establish old/new reader-writer compatibility and the actual recovery path. Expand/migrate/contract only when coexistence needs it. A binary rollback may be unsafe after data mutation; choose tested rollback, restore/replay or roll-forward according to the invariant. Do not promise reversibility for destructive migrations.

On failure, stop further promotion, preserve evidence, and execute only the authorized recovery mechanism. production-ops determines the operational objective and verifies recovered health; this skill owns the release mechanism. Use test-engineering when migration or recovery proof needs design and security-review when build authority or artifact trust changes.

## Evidence and exit
Record source revision, artifact identifier, target/configuration version, applicable checks, deployment observation, and recovery limitations in existing release/task records. Keep executable pipeline configuration authoritative; do not create another release document unless durable context is missing.

RELEASE-READY requires the candidate, applicable compatibility/recovery proof and operational prerequisites. DEPLOYED requires observed target execution and critical-flow checks. Customer acceptance remains with the product owner. Report unrun target checks explicitly; a successful package upload alone is not deployment acceptance.

## AI and data work
When applicable, read [AI and data guidance](references/ai-data-release.md).
