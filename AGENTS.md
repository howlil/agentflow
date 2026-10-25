# Agentflow — Repository Rules

## Product
Agentflow routes concrete software-engineering tasks to the smallest relevant reasoning skills. Its eleven canonical skills are a router plus ten specialists. They are portable instructions, not an executable orchestration runtime.

## Ownership and boundaries
- `skills/<name>/SKILL.md`: the only canonical runtime source. Do not duplicate content into vendor directories.
- `scripts/generate-skills.mjs`: validates skills and generates public reference pages, metadata and `llms.txt`.
- `src/content/docs/`: human guides and lifecycle documentation; Astro/Starlight compiles static `dist/`.
- `scripts/plugin-manifests.mjs`: validates native Claude/Codex manifests and package-version parity.
- Upstream `skills@1.7.4`: owns portable install, list, update, remove and state/lockfiles.
- Host-native Claude/Codex plugins: independent alternate managed installation routes.

## Distribution
Primary: `npx skills` with discovery on skills.sh. Alternate: host-managed native plugin. Never require or reintroduce `@howlil/agentflow-cli`, `packages/cli`, an npm publish workflow, custom registry, duplicate installer, or second lockfile. Root npm tooling is **only** for building/validating the website and plugin metadata.

The installer may fetch the repository temporarily; only selected skills are installed. Installing only the router does not install specialists. Portable updates are manual. Invocation syntax and native marketplace auto-updates are host-specific, not universal guarantees.

## Verification
Run `npm ci`, `npm run plugins:check`, `npm test`, `npm run build`. Cross-agent CI covers claude-code, codex, gemini-cli, cursor and opencode; preserve `AGENTS.md` and unrelated skills. Keep generated docs derived from canonical sources.

## Release
The private root `package.json`, lockfile, `plugin.json`, and `.claude-plugin/plugin.json` must have matching versions for a native release. For an intentional release, update `CHANGELOG.md` and `RELEASE_VERSION` in a reviewed PR with synced root and native versions. Merging the release request to master triggers the verified GitHub Release workflow, which creates immutable matching `vX.Y.Z` tags and a GitHub Release only. It must never publish npm. Historical npm package deletion/deprecation and credential revocation require separate npm-owner actions.

Do not claim that documentation or tests constitute real host invocation, marketplace approval or automatic updates.
