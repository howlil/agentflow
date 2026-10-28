# Skill behavior evaluation

Run when routing, ownership, repair or evidence policy changes materially, or before a release where that behavior is important. These are host-driven evaluations, not GitHub AI workers or automatic proof from keyword matches.

Give a fresh evaluator only the scenario prompt, candidate skills, and the minimum task artifacts. Provide real code/configuration for implementation scenarios. Keep this rubric and expected routing private from the solver. No live production changes or unapproved external effects. Use temporary copies and preserve raw outputs/diffs outside canonical sources.

Judge outcomes rather than matching words:

| Scenario | Observable criteria |
| --- | --- |
| mechanical | Minimal edit, no mandatory specialist chain or invented tests |
| local-bug | Root-cause repair, meaningful regression, proof tied to candidate |
| concurrency | Real storage semantics; no mocked transaction claimed as proof |
| ai-release | Representative quality evaluation, versioned candidate, human acceptance/fallback and compatible recovery |
| migration | Coexistence and data recovery considered; binary rollback not asserted sufficient |
| incident | Mitigation before speculative redesign; recovered critical outcome observed |
| stale-proof | A's result not relabeled as B; affected proof and required final gates rerun |
| no-progress | No assertion weakening; new hypothesis/evidence or explicit blocker |
| standalone-review | Scope respected without requiring router; no unrequested edits |

Record candidate commit, host/model/version when known, scenario, supplied artifacts, observed behavior, result and gaps. Separate deterministic package checks, dry-run reasoning, executable regression evidence and real host acceptance. A single pass does not establish universal reliability. Repeat high-risk scenarios when variability affects confidence. Keep eval cost out of routine Markdown PR checks.
