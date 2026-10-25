# Project Archetypes and Documentation Governance

Use only when a task concerns repository onboarding, README content, community readiness, handover, paid-product documentation, or documentation policy. This complements the operating policy; it does not force documentation creation on every code edit. Infer archetype from actual license, source availability, intended audience, deployment and ownership; a public repository alone does not guarantee that it is licensed open source.

## Select the project's audience
| Archetype | README entry point | Additional documentation when warranted |
| --- | --- | --- |
| OSS library / developer tool | Purpose, supported versions, install, copyable minimal example, API/docs, license | CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, SUPPORT, changelog as community and maintenance needs require |
| OSS application | Product use, platforms, downloads/install, features, permissions, limitations, troubleshooting | Developer setup, license, responsible vulnerability channel, support |
| Commercial / paid SaaS | Product onboarding, integration, supported deployment and support channels; public versus internal boundaries | Pricing/terms/privacy when applicable; private architecture, operations, access/security and recovery material |
| Private/client-owned project | Authorized setup, deployment, ownership, acceptance and handover | Contract-required runbook, recovery, security and operational notes |

Do not assume a product is paid, OSS, public, or licensed based on an example. Do not add an OSS LICENSE to client-owned or private proprietary code without owner approval. Commercial legal/privacy obligations depend on actual jurisdiction, data and contracts; do not invent legal text or compliance claims.

## Documentation source of truth
- README serves the target user or contributor: what, why, quickstart, one working example, compatibility, links. It is not an agent activity log, a milestone transcript, or a second architecture specification.
- Maintain public API/reference, user-facing how-to, and engineering contracts at their appropriate owners. Product intent belongs in project-specific product guidance, architecture in engineering guidance, operational recovery in a runbook only when necessary.
- Update documentation when a durable contract, public behavior, setup step, supported platform, environment variable, or user-visible limitation changes. Internal refactor without contract change normally needs no README rewrite.
- Reuse organization/account GitHub community-health defaults when they actually apply; avoid copying identical templates across repositories. Keep license selection explicitly repository-specific.
- Every newly added document must identify its audience and purpose. Link to the authoritative source instead of duplicating it. Never publish secrets, client data, private operations or unverified availability and support promises.
- A documentation task is complete when its commands and links match the repository's current state and its claims reflect shipped, not merely planned, features.

## Readiness checks
Inspect what already exists before adding files; absence of a root CONTRIBUTING or SECURITY file alone does not prove missing community defaults. For an OSS project check ownership/license, actual quickstart, contribution route, disclosure channel and a working release/install path where applicable. For commercial projects check audience separation, environment setup without credentials, actual deployment/support requirements and contractual ownership. Mark unavailable external/legal evidence as unknown rather than fabricating completion.
