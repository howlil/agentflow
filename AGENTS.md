# Agentflow — Repository Rules

## Product
Agentflow routes concrete software-engineering tasks to the smallest relevant reasoning skills. Its eight canonical skills are a router plus seven specialists. Durable project memory in target repos uses only `.agents/product.md`, `.agents/engineering.md`, and `.agents/DESIGN.md`. Skills are portable instructions, not an executable orchestration runtime.

## Ownership and boundaries
- `skills/<name>/SKILL.md`: the only canonical runtime source. Do not duplicate content into vendor directories.
- `scripts/generate-skills.mjs`: validates skills and generates public reference pages, metadata and `llms.txt`.
- `src/content/docs/`: human guides and lifecycle documentation; Astro/Starlight compiles static `dist/`.
- `scripts/plugin-manifests.mjs`: validates native Claude/Codex manifests and package-version parity.
- Upstream `skills@1.7.4`: owns portable install, list, update, remove and state/lockfiles.
- Host-native Claude/Codex plugins: independent alternate managed installation routes.

## Distribution
Primary: `npx skills` with discovery on skills.sh. Alternate: host-managed native plugin. Never require or reintroduce `@howlil/agentflow-cli`, `packages/cli`, an npm publish workflow, custom registry, duplicate installer, or second lockfile. Root package tooling is **only** for building/validating the website and plugin metadata.

The installer may fetch the repository temporarily; only selected skills are installed. Installing only the router does not install specialists. Portable updates are manual. Invocation syntax and native marketplace auto-updates are host-specific, not universal guarantees.

## Optional ChatGPT Web + GitHub mode
The existing Agentflow skills-only plugin can guide coding through **ChatGPT Web as the only AI executor** and an authorized GitHub connector. GitHub stores code, Issues/PRs, and ordinary CI evidence; it never becomes an external AI coding worker. Installing Agentflow does not grant GitHub access, shell tools, model credentials, or autonomous execution. This mode is optional and must not weaken the portable eight-skill routing/distribution contract.

For nontrivial continuation, inspect the latest Issue/PR and HEAD SHA first, reuse an existing relevant branch/PR, and distinguish edited code from tested/accepted behavior. Do not force Issue/branch/PR setup for a trivial or read-only task. Keep the single canonical routing policy in `skills/agentflow/SKILL.md`; do not duplicate specialist guidance here. See `src/content/docs/recipes/run-code-from-chatgpt.md` for the host workflow. User approvals and repository permissions govern irreversible operations.

## Verification
Run `bun install --frozen-lockfile`, `bun run plugins:check`, `bun run test`, `bun run build`. Cross-agent CI covers claude-code, codex, gemini-cli, cursor and opencode; preserve `AGENTS.md` and unrelated skills. Keep generated docs derived from canonical sources.

## Release
The private root `package.json`, lockfile, `plugin.json`, `.codex-plugin/plugin.json`, and `.claude-plugin/plugin.json` must have matching versions for a native release. ChatGPT release ZIPs must include `.codex-plugin/plugin.json`, `skills/`, and `assets/` but exclude the legacy root manifest. For an intentional release, update `CHANGELOG.md` and `RELEASE_VERSION` in a reviewed PR with synced root and native versions. Merging the release request to master triggers the verified GitHub Release workflow, which creates immutable matching `vX.Y.Z` tags and a GitHub Release only. It must never publish npm. Historical npm package deletion/deprecation and credential revocation require separate npm-owner actions.

Do not claim that documentation or tests constitute real host invocation, marketplace approval or automatic updates.
