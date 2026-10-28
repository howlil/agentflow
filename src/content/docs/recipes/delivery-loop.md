---
title: From requirements to production
description: Ownership, bounded repair, and evidence across the delivery lifecycle.
---

Agentflow keeps one router and ten specialists. `design-thinking` retains its name and owns implementation. `release-engineering` fills the delivery boundary; graph rendering moves into an optional router reference. This is instruction-guided work using host tools, not an autonomous runtime.

## Implementation contract

| Area | Implementation |
| --- | --- |
| Global SWE policy | Router baseline plus scoped engineering policy |
| Standalone use | Every specialist keeps local scope, authority and evidence safeguards |
| Development loop | Router reference coordinates implementation, faithful proof, review, repair and final gates |
| Release | Candidate identity, CI, promotion, compatibility, recovery and target checks |
| Customer delivery | Product discovery includes feasibility, acceptance owner, pilot, adoption and handover |
| AI/data | Conditional references owned by architecture, testing, security, operations and release |
| Portability | Local reference links stay inside each installed skill; owner names must resolve |
| Verification | Structural CI plus isolated host evaluations with separate evidence |

Start with the smallest useful outcome. Define acceptance and preserved invariants in the existing task. Implement and test continuously. Review the final diff; return evidenced blockers to implementation. Changed code/configuration invalidates affected evidence. After two consecutive repair attempts without progress, change the diagnosis or expose the blocker rather than repeat the same action. Do not weaken tests to obtain a pass.

Finish only when required proof and gates hold for the final candidate. Implemented, verified, release-ready and deployed are distinct states. A customer outcome may still require pilot acceptance after technical verification.

The canonical [development loop](https://github.com/howlil/agentflow/blob/master/skills/agentflow/references/development-loop.md) owns detailed transitions. [Release engineering](/skills/release-engineering/) owns delivery decisions. [Graph output migration](/skills/call-graph-output/) explains removal of the former standalone rendering skill.

## Validation and rollout

Run `npm ci`, `npm run plugins:check`, `npm test` and `npm run build`. Package validation checks local references and skill ownership in the extracted archive. Portable compatibility checks verify shipped reference bytes. Required CLI checks use fixed versions; optional latest-version probes are separate and manual.

Use `evals/scenarios.json` with the evaluator guidance in `evals/rubric.md` for material behavior changes. Report what actually ran, including host limitations; structural tests cannot prove that an agent follows instructions. Keep version/tag publication separate from source changes. Updating portable installations may require removing the retired rendering skill through the upstream installer.
