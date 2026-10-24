# Agentflow — Engineering design

## Architecture
```text
skills/*/SKILL.md (canonical)
       ├── upstream skills CLI / skills.sh discovery → selected host skill folders
       ├── Claude/Codex native marketplaces → host-managed plugin bundles
       └── generate-skills.mjs → guides, references, metadata, llms.txt

src/content/docs + Astro/Starlight → static dist/ → Cloudflare
```

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
