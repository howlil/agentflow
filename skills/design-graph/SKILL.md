---
name: design-graph
description: 'Turn a product behavior contract into an explicit interface graph (surfaces, moves, state ownership, rendered variants, prerequisites, interaction semantics, environment projections) and a frontend structure, then build UI that passes quality gates (accessibility, performance, anti-generic visual defaults). Use this whenever the user builds, changes, reviews, or audits any UI: a screen, page, landing page, form, dashboard, navigation, interactive component, responsive layout, or frontend app, or asks for "tampilan", "UI", "frontend", state management, or a DESIGN.md, even if they never say "design". Reads .agents/product.md and .agents/engineering.md when present; reads and maintains .agents/DESIGN.md. Does not redefine product behavior (product-design), system architecture (engineering-design), or code-level patterns (design-thinking).'
---

# Design Graph

Turn required product behavior into an interface a person can navigate and operate, built on a frontend whose state, structure, and visual defaults are explicit. Do not reopen product scope; if the interface exposes a contradiction in B, return it to `product-design`.

```text
In:   .agents/product.md (J, B, X, P, Q) + .agents/engineering.md (Structure, F, G) + .agents/DESIGN.md
Out:  interface graph (in the task or PR) + .agents/DESIGN.md (durable preferences only)
Next: design-thinking

B → M → U → ST/V/N → Structure → Gates → Proof
```

## IDs

```text
U  surface    M  move (cites B#)    V  variant    N  prerequisite
ST state entry (owner per state)    UG UI gate (quality target)
A  assumption (continues numbering; [blocking] if it changes B, scope, or visual direction)
```

## 1. Context

Read product.md for B, X, P, Q; engineering.md for Structure and F rules; DESIGN.md for tokens and conventions. With no product contract, infer only the minimum behavior the task clearly establishes and mark the rest A#.

**Ask or assume.** Ask only when the answer changes J, B, scope, or visual direction that cannot be guessed; max 3 questions. Otherwise assume, record A#, continue.

## 2. Surfaces (U)

A surface is a place the person can encounter that owns content, interaction, state, navigation, or attention: screen, route, pane, dialog, drawer, menu, form, list, detail, status region. Do not split every visual group into one. A step with one trivial in-edge and out-edge may merge, unless it owns distinct state, attention, or interaction.

- A surface that can be deep-linked, bookmarked, or reached with Back **must have a route**.
- Repeated look is evidence for reuse, not proof. Share a component only when responsibility, interaction contract, and reuse are all stable.
- Cardinality shapes the surface: one item (identity, state, primary actions); many (design 0, 1, normal volume; a stress case only when evidence requires it); live data (decide whether updates may move things under the person: update in place, batch with "new items", freeze while interacting, or manual refresh).

## 3. Moves (M)

A move is a user or system transition: open, select, edit, submit, cancel, dismiss, navigate, retry, undo, refresh. Map the successful path first.

```text
M1 (B1): U1 --select--> U2 --edit--> U2[editing] --save--> U2[saved]
```

Each edge answers: what triggers it, what changes, what becomes reachable. Add no screen because convention suggests one.

## 4. State (ST)

Every piece of state that matters gets one owner, chosen by category, never one store for everything.

```text
ST1: <state> | owner: server | url | form | ui-local | derived | workflow
```

| Owner | Rule |
|---|---|
| server | Held by a server-state cache (query library or router loader). Never mirrored into a client store without an offline or workflow reason |
| url | Filters, tabs, page, selected item that should survive reload or be shared. The URL owns it; do not duplicate it in component state |
| form | Dirty, touched, submit lifecycle stays local to the form, not global |
| ui-local | Open/closed, active tab. Lift only when shared |
| derived | Computed, never stored |
| workflow | Only for multi-step flows with guards. Model it as an explicit state machine |

Each async resource declares its variants (§5). A state with two owners is a defect.

## 5. Variants (V) and prerequisites (N)

**V** = rendered variants that change what the person sees, understands, can do, or must do next: empty, loading, partial, error, denied, editing, dirty, submitting, pending, optimistic, saved, stale, conflict, selected, expanded, disabled, read-only. Model only those the product can reach; every X from product.md needs a V the person can recover from. Do not build a state taxonomy that never affects interaction.

**N** = conditions to enter or use a surface or move: selected record, authenticated actor, permission, completed prior step, available data. Viewport, reduced motion, and connectivity are environment (§7), not N.

```text
Move --requires--> N --satisfied?--> yes: target | no: unavailable or alternate path
```

Permission affordance: an action the actor can never use is hidden; one that is temporarily unavailable but meaningful is disabled with a reason ("Complete required fields first"). UI visibility is never the authorization control; the trusted boundary enforces it.

Client-side validation is early feedback, not trust. Show format errors at the field, preserve input after a recoverable failure, and treat everything that crosses to the backend as untrusted.

## 6. Interaction semantics

Some behavior is decoration (hover polish). Other behavior decides whether an edge is reachable at all: focus, keyboard, pointer, announcements, Escape, pending, optimistic, conflict. Treat the second kind as graph semantics.

For each move: can the person discover it, reach it, operate it, and perceive the result?

- **Focus**: after a transition focus lands somewhere valid; an exit exists; closing returns focus to a valid origin.
- **Announcements**: important state changes without navigation need a visible status, focus move, live announcement, or changed label. None for decorative change.
- **Async**: decide whether the action can repeat while pending, whether the previous state stays visible, whether optimistic state is allowed, what happens when the server rejects or conflicts, and how to retry.
- **Focus-owning surfaces** (modal, menu, interactive popover, some drawers): intentional focus entry, a defined close path, valid focus restoration. **Notification surfaces** (toast, status, non-interactive banner): inform without taking focus. If a notification holds required actions it is interactive; model it so. Classify by interaction, not by shape.

## 7. Environment

Viewport, input modality, reduced motion, connectivity, and platform may change composition, navigation edges, and simultaneous visibility (desktop: list and detail together; mobile: list → detail route). Never hardcode "small screen → drawer". The invariant is not the same graph; it is that required product behavior stays completable in every supported context. Do not design for platforms or modes not in scope.

## 8. Frontend structure

Layers, with dependencies pointing downward only:

```text
ui       render-only, stateless; props in, events out; no fetching or side effects
feature  container: state, effects, calls data access; composes ui
data     the only layer that knows API shapes; owns fetching and cache wiring
domain   pure rules, no framework (only if rules exist)
```

- Feature modules are organized by product capability and layered inside. A feature imports another feature only through its public entry, never its internals.
- Components never call the API directly. `ui` never imports `feature`.
- Map these to `engineering.md` Structure and propose F# rules there (ui ↛ feature, no cross-feature internals, no direct API calls from components). With no `engineering.md` on a small frontend-only project, keep five lines of this in DESIGN.md until engineering-design absorbs them.
- A component boundary is a decision informed by the graph, not derived mechanically. No consequential state may exist only as an accidental conditional; no consequential move may exist without an interaction path.

## 9. Gates (UG)

**Visual and copy: anti-generic gate.** Direction comes from the brief and DESIGN.md. Where the brief pins a look, follow it; where it leaves an axis free, do not spend it on a default.

1. **Tokens only** (automatable, add as F#): no raw color, size, or radius values in components.
2. **Tell checklist**: reject by default unless the brief asks: cream background with serif and terracotta accent; near-black with one neon accent; newspaper layout; identical rounded cards sharing one radius and shadow; ALL-CAPS eyebrow above headings; numbered markers on non-sequences; a single accented word in a headline; fade-slide entrances on every section; hover motion on every card.
3. **Specificity test**: before building, would this plan be produced for any similar brief? If yes, revise it and say what changed. Spend boldness in one element; keep the rest quiet.
4. **Copy**: real content, no filler. Buttons are specific verbs ("Save changes", not "Submit"); one action keeps one name through the whole flow; errors say what went wrong and how to fix it; empty states point to the next action.

Aesthetic direction (palette, type, composition) is delegated to `frontend-design` when available. This skill owns the gate and records the chosen result in DESIGN.md.

**Quality targets.** Take UG from product.md Q first. Otherwise use these published defaults and record them as A# when applied.

| UG | Default | Design consequence | Verified by |
|---|---|---|---|
| Web performance (public web only) | LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at p75 field data | Reserve space for media and embeds, keep interactions responsive | release-engineering (field), test-engineering (lab) |
| Accessibility | WCAG 2.2 AA: text contrast 4.5:1, UI and non-text 3:1, targets ≥ 24×24 px, focus never fully hidden by sticky UI, a non-drag alternative for every drag, no cognitive-test-only authentication | Each M has a keyboard path; drag has an alternative | test-engineering |
| Task outcome | Each P is one task: completable without error | Each P has a UI path | test-engineering (e2e), walkthrough for small projects |

Scale: internal tools and personal projects need accessibility and task success only. SUS or HEART only with real users and research budget; read task success with time and error rate, never alone. For a quick heuristic pass check system status visibility, error prevention and recovery, and consistency.

## 10. Proof and ready gate

Prove completability under the contexts that apply, not identical graphs: empty data, partial or error state, least-privileged role, representative density, supported small and large viewport, keyboard-only, reduced motion if motion exists, slow or offline if supported, stale or conflicting data if the product allows it. Do not invent scale, offline support, or touch-only use. Per context: can the person understand the state, reach the allowed action, recover, and finish the job?

Ready for `design-thinking` only if all hold:

- every B has an M, and every M reaches a U;
- every X has a V the person can recover from;
- every ST has exactly one owner;
- every addressable surface has a route;
- the plan passes the tell checklist and the specificity test;
- UG is filled, or an A# says it is undefined;
- DESIGN.md exists or is created in this task;
- no `[blocking]` A# is open.

If a check fails, fix the graph. Do not pass the gap downstream.

## 11. Persist: `.agents/DESIGN.md`

One file, near 100 lines, only durable rules that every future surface must follow. No per-screen specs; those live in the task or PR. If it exists, read it first and follow it; update only what a durable decision changed. If it does not, create a minimal one before the second surface is built (the first surface may derive it). When tokens live in code, point to that source instead of copying values.

Format: YAML front matter for machine-readable tokens, then short prose for rationale (the pattern of Google Labs' DESIGN.md, which is alpha: use a conservative subset, keep keys mappable to W3C design tokens, and check its spec when generating tokens).

```markdown
---
colors:     {primary: "#…", surface: "#…", text: "#…"}      # 4–6 named values
typography: {display: {family: …, size: …}, body: {…}}
spacing:    {…}
radius:     {…}
motion:     {…}
components: {button: {…}}                                    # only stable ones
---
## Direction
Tone, audience, what to avoid (3–5 lines).

## Guardrails
Project-specific overrides of the §9 gates.

## State
Default owner per category; shared loading, empty, error, permission conventions.

## Patterns
Navigation model, form pattern, when modal vs page.

## Accessibility
Requirements beyond the WCAG 2.2 AA baseline.
```

Omit empty sections. Edit in place; condense instead of splitting files.

## Proportionality

```text
tiny visual or style change            → inspect the surface, update, targeted check
simple local interaction               → U + M + relevant V
form, async, permissions               → add ST, N, interaction semantics, failure and recovery V
multi-surface flow, responsive nav,
  complex state, new app               → full method
```

Depth follows interaction risk, not component count.

## Handoff

`design-thinking` consumes U, M, ST, V, N, structure, UG, and the F# proposals. It owns component internals, effects, error handling, and code-level patterns. If an implementation need contradicts the graph, fix the graph here.