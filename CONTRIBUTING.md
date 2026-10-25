# Contributing to Agentflow

Agentflow is an MIT-licensed collection of portable engineering skills, with a router and ten specialists. Contributions should make decisions clearer, execution safer, or installation/documentation more reliable—without adding an unnecessary agent runtime or mandatory SDLC ceremony.

## Before opening a pull request

Check [existing issues](https://github.com/howlil/agentflow/issues) and open a focused issue for behavioral changes or bugs needing discussion. For a small typo or unambiguous documentation correction, a concise PR is sufficient. Do not publish vulnerability details in Issues or PRs; use [SECURITY.md](SECURITY.md).

Keep each PR to one coherent outcome. Reuse the same branch/PR for fixes during review; do not create branches or commits per file, specialist, or test iteration. Explain the observable problem and which behavior changes.

## Repository boundaries

- `skills/<name>/SKILL.md` is the canonical instruction source for each of the eleven skills. Specialist skills own their engineering domains; `skills/agentflow/SKILL.md` owns routing.
- `skills/agentflow/references/` contains reusable policy references loaded when relevant, not new specialist skills.
- `src/content/docs/` holds user guides and generated reference content. Do not manually fork generated skill documentation from its canonical source.
- `scripts/` and `.github/workflows/` contain validation, packaging and CI. Existing GitHub Actions may test/build; they must not become external AI coding workers.
- `AGENTS.md` and `.agents/` contain repository-specific steering; do not copy them into user projects.

For a skill change, show which decision it improves and why the new instructions do not duplicate another specialist. For a documentation change, keep README statements aligned with implemented and released behavior.

## Validate proportionately

Node.js 22.20+ is the tested baseline for portable installation. For source, packaging, or site changes:

```bash
npm ci
npm run plugins:check
npm test
npm run build
```

For root documentation-only edits, review the actual diff, Markdown links and examples. CI chooses the applicable checks by change scope. Do not add browser E2E or a new test layer unless it demonstrates a meaningful failure mode that existing tests miss.

## Pull request description

Include the behavior changed, relevant Issue (if any), checks **actually run** with outcomes, and any remaining verification. Do not mark unrun host acceptance as passed. Release tags and publishing are separate, deliberate operations—not an automatic consequence of a documentation or skill PR.

Contributions are reviewed according to project needs, with no promised response or merge timeline. Please follow the [code of conduct](CODE_OF_CONDUCT.md).
