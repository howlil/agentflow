# Changelog

Agentflow releases track the canonical `skills/*/SKILL.md` library, website and optional native plugin manifests. The private root package is **not** an npm CLI. Updates to this changelog are part of a reviewed release request.

## v0.8.0

**Agentflow v0.8.0 — Router chain contract, seven-specialist catalog, and upgrade path** (2026-10-30)

### Changed

- **Chain contract in the router:** specialists now own IDs, a ready gate, and a handoff (`J/B/X/P` → `R/S/K` → `U/M/ST` → `T/O/FL` → `RK/PF` → `RV` → `RL`). The router carries those IDs, returns a failed gate to its owner, and treats release as a separate decision from merge.
- **`AGENTS.md` bootstrap:** the router creates a root `AGENTS.md` with durable operating rules only when it is missing, and points to `.agents/` instead of duplicating it.
- **Skill catalog reduced to eight:** one router plus seven specialists. Product, architecture, interface, implementation, test, review, and release documents were rewritten against the current contracts.
- **Budget aligned with the test stage map:** at most `ci`, `release`, and `nightly` workflows; automated assertions per proof plus one manual acceptance pass at release.

### Removed

- `graph-protocol` and `call-graph-output` — provisioning policy lives in the router references; a compact graph is rendered inline when useful.
- `production-ops` — replaced by `release-engineering`; daily operations and incident command are outside the catalog.
- `security-review` — trust, authorization, and release-integrity risks are reviewed by `code-review`.

### Migration

- Users with an installed copy must run `skills check`, `skills update -g`, remove the old names, and install the current set. Renames and removals are not applied silently.
- Native plugins require a version bump before the host refreshes; ChatGPT plugins require resubmission.
- Full procedure: [upgrade and migration](src/content/docs/start/upgrade-and-migration.md).

### Deprecation policy

- Add the new name, keep the old one for at least one minor release with a pointer, document the change here, then remove it in a release that states the removal. Never reuse a published name for different content.

## v0.7.0

**Agentflow v0.7.0 — GitHub delivery alignment across ChatGPT conversations**

### Changes

- **Cross-chat GitHub delivery discipline (PR #43):** recover the real default branch and work-item identity; reuse active Issues/PRs; align approved delivery targets and optional parent/Milestone links; model data, decision, ordering and write-conflict dependencies; reconcile concurrent writes and changed contracts without claiming a lock or an autonomous worker.
- **Optional coordination metadata:** extend the existing Issue contract template, router policy, and ChatGPT Web recipe without introducing another requirement ledger or mandatory Git ceremony for trivial work.
- **GitHub Actions maintenance (PRs #39 and #38):** update `actions/upload-artifact` to v7 and `actions/download-artifact` to v8 for the existing package/release workflows; preserve the reviewed artifact ZIP and fail-closed release gates.
- **Fail-closed merge gate (PR #45):** aggregate scope classification, required `verify`, and the five portable compatibility jobs into one `merge-gate` result; fail when applicable checks fail, cancel, or unexpectedly skip. The GitHub Ruleset/branch-protection required check must still be configured by a repository administrator; the CI job alone does not enforce merges.
- Synchronize v0.7.0 across the private root package/lockfile, Claude and Codex manifests, portable listing metadata and release trigger. No npm publication is performed.

### Acceptance and distribution limits

M1 source-contract requirements are verified in [Issue #42](https://github.com/howlil/agentflow/issues/42), with successful master CI for commit `9b80a7503856f1d12b63b86d0b715d27bb4ff287`. The optional manual `Agentflow Issue Acceptance` dispatch has not been observed yet. This release request itself must pass its own PR checks before approval/merge.

A GitHub Release ZIP does **not** install or update the current ChatGPT plugin. Genuine installed-version activation, fresh-conversation resume, concurrent-chat conflicts and host-level E2E remain unverified in [Issue #34](https://github.com/howlil/agentflow/issues/34). No backend, AI worker, API key, forced branch protection, automation service or additional runtime is introduced.

## v0.6.1

**Agentflow v0.6.1 — ChatGPT package-format compatibility**

### Fixes

- Change the ChatGPT upload ZIP to the required `.codex-plugin/plugin.json` path with top-level `interface` and `skills: "./skills/"`. Keep the legacy root manifest for portable consumers and verify listing identity parity.
- Revalidate the exact extracted ZIP, rejecting legacy ZIP layout, duplicate manifest files, unsafe paths and missing skills. Add regression tests and updated upload instructions.
- Synchronize v0.6.1 across package, lockfile, Claude manifest, Codex manifest, root manifest and release trigger.

### Acceptance caveat

This addresses a confirmed package-format mismatch with the current OpenAI documentation, not an observed portal error code. GitHub CI and a release ZIP do **not** prove the ChatGPT portal accepted the upload or updated the installed plugin. Host checks remain necessary. No npm publish, MCP backend, autonomous workers or change to the eleven canonical skills.

## v0.6.0

**Agentflow v0.6.0 — Lean Code Factory acceptance integrity**

### Changes

- **Lean orchestration contract:** route the smallest relevant specialist set; use DAG delegation only when the host genuinely supports workers and coordination provides value. The host, not Agentflow, remains the AI executor.
- **Issue-based execution integrity:** execution phases with fail-closed `ACCEPTED` checks; a shared authoritative `Resume pointer` parser that rejects duplicated fields and authoritative sections; valid repository identity in the baseline.
- **GitHub evidence gate:** `scripts/acceptance-gate.mjs` rejects mismatched repository, run IDs, commit SHA, unrelated CI, wrong branches, failed jobs, and unverified requirements. Only completed `CI` runs triggered by a `push` to `master` with a successful `verify` job qualify.
- **Manual read-only GitHub workflow:** `Agentflow Issue Acceptance` checks the existing Issue and CI through GitHub API; it rejects changed master/Issue state mid-check and never edits Issues, merges code, or deploys.
- **Regression coverage and guidance:** tests for duplicate/shadowed fields, invalid Issue identities, stale CI, forged runs, and host-orchestration boundaries; documentation distinguishes opt-in evidence checks from required branch protection.

### Compatibility and remaining acceptance

The original **one router + ten specialist skills** and skills-only distribution remain. There is no Agentflow backend, agent worker pool, scheduler, external AI model executor, npm package publish, or new API-key requirement.

GitHub Release includes the `agentflow-chatgpt-v0.6.0.zip` skills-only candidate. **Publishing the ZIP does not update a currently installed ChatGPT plugin, establish public Plugin Directory listing, or prove cross-conversation E2E**; those tests remain open in [Issue #34](https://github.com/howlil/agentflow/issues/34). The manual acceptance workflow is opt-in, and repository administrators must separately configure branch-protection/required-check policy.

## v0.5.0

**Agentflow v0.5.0 — GitHub Code Factory Foundation and Lean Engineering Policies**

### Highlights

- **ChatGPT Web + GitHub workflow (opt-in):** a single AI executor in ChatGPT Web can use authorized GitHub tools for source changes, Issues, pull requests and actual CI evidence. No external coding agent, separate backend or model API key.
- **Conditional operating policies:** reusable engineering execution, GitHub delivery/CI, and OSS/private/commercial documentation guidance under the Agentflow router's `references/`; the original one-router/ten-specialist inventory is unchanged.
- **Research-to-acceptance contract:** Issue template, stable requirement and decision IDs, verification evidence/resume pointers, and a structural validator with regression tests. It does not execute GitHub tests or automatically validate external Issues.
- **Lean, risk-adaptive CI:** always-on required verification; conditional five-host portable installer matrix; safe documentation fast path that still runs README contract tests; superseded PR-run cancellation.
- **Distribution confidence:** verify portable reference files during install and removal for five coding hosts; generate and validate the actual ChatGPT skills-only ZIP.
- **Open-source onboarding:** product-focused README and concrete contribution, security, support and conduct guidance; Cloudflare Worker preview builds for feature branches.
- **Regression hardening:** Markdown escaped-pipe handling, release/package invariants, source-of-truth alignment and SHA-aware verification discipline.

### Compatibility and acceptance

The eleven canonical skill names and supported distribution routes remain unchanged. The root npm package stays private, and **no npm publication occurs**. The GitHub Release includes the ChatGPT candidate ZIP for manual installation/testing; it is not confirmation of ChatGPT Plugin Directory approval or installation.

**Host-level E2E acceptance remains open** in [Issue #34](https://github.com/howlil/agentflow/issues/34): load this exact plugin candidate into ChatGPT, confirm new router instructions, validate GitHub permissions and negative cases, and exercise cross-conversation `next`. Passing repository CI does not satisfy those checks.

## v0.4.1

**Agentflow v0.4.1 — ChatGPT Web Skills-Only Package**

### Highlights

- **ChatGPT Web packaging:** ship the same 11 canonical engineering skills in a portable skills-only plugin with `extensions.com.openai` listing metadata and reusable brand SVG. No MCP server or second installer.
- **Decision-routing correctness:** clarify that a specialist may activate directly without a router-first invocation, and that guidance never grants shell, repository, write or deployment permissions.
- **Validated distribution artifact:** generate a ChatGPT plugin ZIP from `plugin.json`, `skills/` and `assets/`; extract and verify the actual archive, including metadata, version, skill inventory, image formats, unsafe files and host capability boundaries.
- **Release attachment:** publish the exact verified ChatGPT ZIP as an asset alongside the immutable GitHub release tag, making downloads independent of expiring GitHub Actions artifacts.
- **Regression coverage:** add tests for package identity, version synchronization, image dimensions, optional onboarding, missing or unexpected files, symlinks and host-specific guardrails.

### Compatibility and publishing

The eleven canonical skill names and Claude/Codex installation paths are preserved. This is a skills-only ChatGPT plugin package, **not** a published entry in the public ChatGPT Plugin Directory, and it does not imply approval, runtime activation, or access to connected GitHub tools.

Before directory submission, install the ZIP using the supported ChatGPT developer flow and verify the nine host-acceptance cases in `src/content/docs/start/chatgpt-web.md`. Keep results and any missing capabilities explicit. No npm package is published.

## v0.4.0

**Agentflow v0.4.0 — Engineering Skills for AI Agents**

### Highlights

- **Skills-first distribution:** retire the custom `@howlil/agentflow-cli` source and npm publishing workflow. The independent `npx skills` installer operates on the 11 canonical skill directories; native Claude Code and Codex plugins remain optional alternatives.
- **Agent compatibility:** exercise portable skill installation for Claude Code, Codex, Gemini CLI, Cursor and OpenCode in CI; preserve the same router and specialist sources.
- **Brand direction:** *Better judgment for AI agents.* Unified public README, product descriptions, docs landing and decision-first positioning.
- **Visual identity:** new geometric routing mark, brand color/typography tokens, favicon, documentation logo, and generated 1200×630 social preview.
- **Docs and catalog:** one router plus ten specialists, accessible responsive cards, clearer install/explore navigation, and synchronized Claude/Codex marketplace descriptions.
- **Release process:** GitHub Releases use reviewed, version-matched source, automated tests and the changelog. No npm publication.

### Compatibility and migration

The canonical skill names and `SKILL.md` instructions remain unchanged by the M1–M4 branding/distribution migration.

```bash
npx skills@1.7.4 add howlil/agentflow --list
npx skills@1.7.4 add howlil/agentflow -g -a codex
```

Select all eleven when you need the router and every specialist. Installing only the router **does not** install the specialists. Portable updates are user-initiated; host-native updates depend on the host marketplace. The old npm wrapper can be removed with `npm uninstall -g @howlil/agentflow-cli`; removing source code has **not** unpublished historical npm registry versions.

**Discovery versus publication:** installation from GitHub is separate from confirmed listing/indexing on skills.sh and from approval in official Anthropic or OpenAI plugin directories. A GitHub Release alone guarantees neither.
