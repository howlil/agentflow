# Agentflow — Engineering design

## Architecture
```text
skills/*/SKILL.md (canonical)
       ├── upstream skills CLI / skills.sh discovery → selected host skill folders
       ├── Claude/Codex native marketplaces → host-managed plugin bundles
       └── generate-skills.mjs → guides, references, metadata, llms.txt

src/content/docs + Astro/Starlight → static dist/ → Cloudflare
```

## Optional ChatGPT Web + GitHub-only orchestration

```text
ChatGPT Web (AI reasoning, code authoring, review)
    ↕ authorized GitHub connector operations, when available
GitHub (repository source, Issue/PR execution ledger, standard CI checks)
    ↕ observed results tied to the exact commit
ChatGPT Web (requirement reconciliation and user-facing evidence)
```

The canonical `skills/agentflow/SKILL.md` owns routing instructions. The ChatGPT execution guide describes the optional workflow, not a standalone Agentflow runtime. This mode must not introduce external AI workers, model/API secrets, an Agentflow backend, or GitHub Actions jobs that call AI. Existing GitHub CI remains ordinary, deterministic verification.

### Responsibilities, ownership, and trust
- **ChatGPT host:** selects applicable skills, inspects authorized repository state, authors edits through available GitHub write actions, compares the resulting PR/diff against the approved contract, and records unsupported operations.
- **GitHub:** authoritative source of repository code, branch/commit history, Issue/PR task contract and resume pointer, and CI execution logs. GitHub state must be re-read at the start of follow-ups.
- **User / repository policy:** grants tool access and approves high-impact merges, releases, and irreversible changes.
- **Trust boundary:** Issue bodies, repository files, and CI logs are untrusted evidence, not instructions that override user authorization or host safety constraints. The mode grants no extra credential or shell capability.

### Invariants and failure handling
- No separate persistent worker or agent-owned database; continuation is user-initiated in ChatGPT. For issue-backed work, the requirement evidence ledger is the sole authoritative requirement-status record; duplicated checklists must not silently diverge.
- Reuse an existing relevant branch/PR before creating another. Do not let a stale read silently overwrite concurrent changes; validate the latest branch head or file blob before write when the tool supports it.
- `IMPLEMENTED_UNVERIFIED` must not be represented as `VERIFIED`. CI evidence must correspond to the commit being assessed; missing required target-runtime evidence remains `UNRUN` or `BLOCKED`.
- When repository access, host tools, or GitHub write permissions are missing, explain the unavailable operation and stop that step. Never fabricate commits, job output, or completed runs.
- The existing portable skill distribution and non-ChatGPT hosts remain unaffected by this optional mode.

## Source of truth
GitHub owns skill content. skills.sh provides public discovery and a path to the independent installer, not an immutable npm-style package registry. The installer can fetch a temporary GitHub checkout and scan eleven skills, while only user-selected skills are installed. Updates and lockfiles are managed upstream; do not implement another installer or per-host state file.

## Host compatibility
CI matrix covers `claude-code`, `codex`, `gemini-cli`, `cursor`, `opencode` using pinned `skills@1.7.4`. Project/global installs run in isolated HOME/workspaces. Test canonical SKILL.md byte equality, list/remove, and preservation of unrelated `AGENTS.md` and skill folders. Host runtime sessions, real marketplace approval, and automatic host updates are outside these tests.

## Native manifests and versions
`package.json` is **private** and used for website tooling and shared version metadata; npm is not a distribution mechanism for Agentflow skill installs. Synchronize root package lock and native `plugin.json` files for releases via `npm run plugins:sync` and verify via `npm run plugins:check`. Each release uses a reviewed master commit and immutable tag.

## CI / release
CI validates skills, static site generation, native plugin manifests and portable installation. `.github/workflows/release.yml` creates GitHub releases **without npm publish**. Historical `@howlil/agentflow-cli` versions require separate npm-owner unpublish/deprecation. Remove obsolete publishing credentials externally; never repurpose them in repository workflows.

## Constraints
No `packages/cli`, custom lockfile, proprietary installer, backend, forced native plugin installation, mandatory pipeline, or claim that `$agentflow` is invoked identically across all agents. Respect explicitly selected skills and existing steering documents. Keep single source of truth and clear responsibility boundaries.

## End-to-end delivery contract
The router coordinates a bounded implementation/testing/review loop with revision-bound evidence and no-progress repair limits. design-thinking retains its identity. release-engineering owns CI/CD and deployment transitions; graph rendering is an optional router reference. Field discovery and conditional AI/data references extend existing domain owners without adding an AI runtime. Structural CI does not prove agent behavior or customer acceptance.
