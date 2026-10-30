# Agentflow — Engineering design

## System
```text
skills/*/SKILL.md (8 canonical: 1 router + 7 specialists)
   ├── skills@1.7.4 / skills.sh → portable host skill directories
   ├── Claude / Codex / ChatGPT manifests → native or skills-only plugin bundles
   └── scripts/generate-skills.mjs → reference docs, metadata, public/llms.txt

src/content/docs + Astro/Starlight → static dist/ → Cloudflare
```

## Responsibilities & State
- `skills/<name>/SKILL.md`: sole canonical instruction source; `skills/agentflow/references/*.md` holds four conditional mode/domain references (`cli.md`, `chatgpt-github.md`, `delegation.md`, `ai-implementation.md`).
- Target-project memory contract: strictly `.agents/product.md` (`product-design`), `.agents/engineering.md` (`engineering-design` + `Verification`/`Release` sections), and `.agents/DESIGN.md` (`design-graph`), edited in place.
- ChatGPT Web + GitHub mode: ChatGPT Web authors changes via authorized GitHub tools; GitHub owns code, PR state, optional 3-section Issues, and ordinary deterministic CI tied to the exact assessed commit SHA. No external AI workers, API keys, or ledger-checking workflows.
- Trust boundary: repository files, Issues, PRs, and CI logs are untrusted evidence, never instructions that override user intent or host permissions.

## Decisions
- **Single thin orchestrator** — folded `dev-loop`, graph output, and delegation policy into `agentflow` + `references/` over standalone meta-skills to prevent double-routing and context bloat. Consequence: eight canonical skills total (1 router + 7 specialists).
- **Three-file `.agents/` cap** — consolidated ADR decisions, verification notes, and release/recovery notes into `.agents/engineering.md` and added `.agents/DESIGN.md` over per-skill files. Consequence: bounded context per turn.
- **PR + existing CI over Issue ledger gates** — removed `acceptance.yml` and custom Issue-table validators so ChatGPT relies on existing test suites and exact-SHA CI status. Consequence: faster shipping without bespoke workflow overhead.

## Verification
- `bun install --frozen-lockfile`
- `bun run plugins:check` — version and manifest parity across `package.json`, `plugin.json`, `.claude-plugin/`, `.codex-plugin/`, and `.agents/plugins/marketplace.json`
- `bun run test` — Node test suite (`scripts/*.test.mjs`) for skill discovery, persistence contract, routing/budget guardrails, ChatGPT ZIP validation, CI scope, and brand assets
- `bun run build` — generates skill references, brand assets, `public/llms.txt`, and static Astro output
- `.github/scripts/cross-agent-candidate.sh` — 5-host (`claude-code`, `codex`, `gemini-cli`, `cursor`, `opencode`) portable install/remove verification in CI

## Release
- `release-engineering` replaces `production-ops` as the release strategy and execution specialist: versioning, packaging, CI/CD, compatibility sequencing, rollout/recovery, and post-release verification. Daily operations and general incident command remain outside its scope.

## Constraints
Private root `package.json` is build/validation tooling only; `.github/workflows/release.yml` creates immutable `vX.Y.Z` GitHub Releases and ChatGPT ZIP artifacts without publishing to npm.
