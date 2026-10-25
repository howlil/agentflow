# Changelog

Agentflow releases track the canonical `skills/*/SKILL.md` library, website and optional native plugin manifests. The private root package is **not** an npm CLI. Updates to this changelog are part of a reviewed release request.

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
