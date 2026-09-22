---
name: design-graph
description: Turn a product behavior contract into an explicit interface graph of surfaces, user/system moves, primary content/actions, meaningful rendered variants, prerequisites, interaction semantics, and environment-specific projections. Use when designing, reviewing, auditing, or implementing a non-trivial screen, flow, form, dashboard, navigation structure, or interactive component. Do not redefine product behavior; consume it from product-design or the task. Do not treat client-side validation as a security trust boundary, force 1:1 symmetry with design-thinking, or require every surface/state/context to share one identical graph.
---

# Design Graph

Design Graph turns required product behavior into an interface a person can actually navigate and operate.

```text
Job + Product Behavior
          ↓
    Interface Graph
          ↓
   Surface<C, V, N>
          │
          ├─ C = primary content and actions
          ├─ V = meaningful rendered variants
          └─ N = prerequisites to enter/use the surface

Environment
→ viewport
→ input modality
→ connectivity
→ reduced motion
→ platform capability

Interaction semantics
→ focus
→ keyboard
→ pointer
→ announcement
→ pending/optimistic/conflict behavior
```

```text
§1  Surfaces      addressable interface places and units
§2  Moves         user/system transitions between states/surfaces
§3  C             primary content and actions
§4  V             meaningful rendered variants
§5  N             prerequisites for entering/using a surface
§6  Input         early interface feedback without confusing trust boundaries
§7  Interaction   focus, keyboard, pointer, announcements, async transitions
§8  Environment   responsive/platform projection without changing product intent
§9  Attention     focus-owning surfaces vs notification surfaces
§10 Proof         product behavior remains completable under relevant contexts
§11 Build         implementation exposes modeled states/moves explicitly
```

Read the product behavior first. Then model how that behavior is exposed through the interface.

Do not reopen product scope unless the interface reveals a contradiction that makes the product behavior impossible or ambiguous.

## 1. Start from the product contract

Preferred input:

```text
product-design
      ↓
Job
Behavior graph
Constraints
Proof
      ↓
design-graph
```

Design Graph owns:

```text
surfaces
moves
rendered states
interaction boundaries
responsive/environment projection
accessibility-relevant interaction semantics
```

Product Design owns:

```text
what the user must be able to accomplish
what behavior the product guarantees
what is in/out of scope
```

Do not silently invent a new feature, workflow, requirement, or success condition while designing the interface.

If no formal product contract exists, infer only the minimum behavior clearly established by the task and mark uncertainty instead of expanding scope.

## 2. Name surfaces and moves

Before styling, identify what the person can actually encounter and do.

### Surfaces

Examples:

```text
screen
route
pane
dialog
drawer
menu
form
list
detail
toolbar
row
field
control
status region
```

A surface is meaningful when it owns some combination of:

```text
content
interaction
state
navigation
attention
```

Do not split every visual group into a surface.

### Units

Units are repeated or locally meaningful pieces inside a surface:

```text
row
field
metric
card
tab
control group
```

Repeated appearance is evidence for reuse, not proof that a shared component should exist.

A shared component boundary is stronger when there is:

```text
stable responsibility
+
stable interaction contract
+
meaningful reuse
```

Do not abstract merely because two things look similar.

### Moves

Moves are user/system transitions:

```text
open
select
edit
submit
save
cancel
dismiss
expand
navigate
retry
undo
refresh
sync
```

Each important edge should answer:

```text
What triggers it?
What changes?
What becomes reachable next?
```

## 3. Model C: primary content and actions

Map the successful interface path first.

```text
Surface A
   ↓ move
Surface B
   ↓ move
Surface C
   ↓
Job complete
```

For each surface define only the primary content/actions needed for the product behavior.

Example:

```text
Task list
  ↓ select
Task detail
  ↓ edit
Edit state
  ↓ save
Updated detail
```

Do not add a screen because navigation convention suggests one.

A node with one trivial incoming edge and one trivial outgoing edge may not need to be a separate surface.

But do not collapse a step merely to reduce screen count if it owns distinct state, attention, or interaction semantics.

## 4. Model cardinality without inventing scale

Cardinality affects interface shape, but scale requirements must come from evidence.

Useful categories:

```text
one item
many items
incrementally/live-updating items
```

### One

A detail surface may emphasize:

```text
identity
important attributes
current state
primary actions
```

Do not assume every detail view needs one primary CTA or a specific layout.

### Many

Design for:

```text
0 items
1 item
representative normal volume
known upper-bound / stress case when evidence requires it
```

Do not invent arbitrary requirements such as:

```text
must support 10,000 rows
```

unless product/system constraints establish that scale.

### Live / changing data

For data that changes while being read, decide:

```text
Can updates change spatial position?
Would that interrupt the current interaction?
Does immediacy matter more than spatial stability?
```

Possible strategies:

```text
update in place
batch updates
show "new items"
re-sort immediately
freeze while interacting
manual refresh
```

Choose from product semantics, not a universal rule.

## 5. Model V: meaningful rendered variants

`V` means **rendered variants**, not merely void/absence.

Model only states that materially change what the person:

```text
sees
understands
can do
needs to do next
```

Possible variants include:

```text
empty
loading
partial
error
denied

editing
dirty
submitting
pending
optimistic
saved
stale
conflict
syncing

selected
expanded
disabled
read-only
```

Do not require every surface to implement every variant.

Example:

```text
Edit form
  ├─ clean
  ├─ dirty
  ├─ submitting
  ├─ save error
  ├─ saved
  └─ conflict
```

A variant is worth modeling when it changes behavior, affordance, interpretation, or recovery.

Do not create decorative state taxonomies that never affect interaction.

## 6. Model N: prerequisites separately from environment

`N` contains conditions required to enter or use a surface/move.

Examples:

```text
selected record
authenticated actor
required permission
completed prior step
available data
supported capability
```

Model:

```text
Move
  ↓ requires
N
  ↓ satisfied?
  ├─ yes → target surface/action
  └─ no  → unavailable / alternate path
```

Do not put viewport, reduced motion, or network quality in the same category as authorization/data prerequisites.

Those are environment/context dimensions, handled separately.

### Permission affordances

Do not use a universal "always hide" or "always disable" rule.

Prefer:

```text
unauthorized or irrelevant action
→ usually hide

temporarily unavailable but still meaningful
→ disabled + reason when that improves understanding/recovery
```

Examples:

```text
normal user
→ admin delete action
→ hide

Publish
→ disabled
→ "Complete required fields first"

Export
→ disabled
→ "Available on Pro plan"
```

Security authorization must still be enforced by the trusted system boundary. UI visibility is never the security control.

## 7. Separate interface feedback from system trust

The interface should give feedback as early as useful.

Example:

```text
user input
   ↓
field-level feedback
   ↓
submit
   ↓
server/system boundary
   ↓
authoritative validation
   ↓
domain operation
```

Good interface behavior:

```text
show format errors close to the field
explain missing required input before unnecessary round trips
preserve user input after recoverable failure
```

But:

```text
client validation ≠ trust boundary
```

Client-controlled data remains untrusted when it crosses into the backend/system.

Design Graph owns:

```text
when/how the interface communicates input problems
```

Design Thinking / system implementation owns:

```text
authoritative decode/validation at trusted boundaries
```

Do not describe browser validation as making data "trusted."

## 8. Model interaction semantics as part of the graph

Some behavior is presentation-only:

```text
decorative motion
hover styling
visual polish
```

Other behavior determines whether an edge is reachable at all:

```text
focus
keyboard interaction
pointer interaction
screen-reader semantics
announcements
Escape behavior
async pending state
optimistic updates
conflict recovery
```

Treat the second category as graph semantics.

### Reachability invariant

For each meaningful move ask:

```text
Can the person discover it?
Can they reach it?
Can they operate it?
Can they perceive the resulting state change?
```

### Keyboard and focus

For interactive surfaces ask only what the flow requires:

```text
Can keyboard users reach the control?
Is the control's purpose identifiable?
Does focus move to a valid place after the transition?
Can the user exit the interaction?
```

Example:

```text
Open dialog
    ↓
focus enters dialog
    ↓
operate dialog
    ↓
close / cancel
    ↓
focus returns to a valid origin
```

### State changes and announcements

When important state changes without navigation, decide whether it must be perceivable through:

```text
visible status
focus movement
live announcement
changed label/state
```

Do not add announcements for purely decorative changes.

### Async actions

For asynchronous operations decide the actual interaction semantics:

```text
Can the action be repeated while pending?
Is the previous state still visible?
Is optimistic state allowed?
Can the server reject after optimistic update?
What happens on conflict?
Can the person retry?
```

Model only states the product can actually reach.

## 9. Project the graph under environment constraints

The same product behavior can be expressed through different interface graphs under different environments.

Environment dimensions may include:

```text
viewport
input modality
reduced motion
connectivity
platform capability
device constraints
```

Example:

```text
same Detail behavior

desktop
→ list + detail visible together

mobile
→ list → detail route
```

Do not hardcode universal solutions such as:

```text
small screen → drawer
```

The correct projection depends on interaction and content needs.

Environment may legitimately alter:

```text
surface composition
navigation edges
simultaneous visibility
interaction mechanism
```

The invariant is not "same interface graph."

The invariant is:

```text
same required product behavior
must remain completable
under relevant supported contexts
```

Do not design for hypothetical platforms or modes not in scope.

## 10. Distinguish focus-owning and notification surfaces

Do not treat every overlay/message as acquiring attention in the same way.

### Focus-owning surfaces

Examples:

```text
modal dialog
menu
some drawers
popover with interactive content
```

They may require:

```text
intentional focus entry
contained/restricted interaction when appropriate
defined close/escape path
valid focus restoration
```

Model:

```text
trigger
  ↓
focus-owning surface
  ↓
interaction
  ↓
close
  ↓
focus returns
```

### Notification surfaces

Examples:

```text
toast
status message
live announcement
non-interactive banner
```

Usually:

```text
inform
→ do not steal focus
```

If a notification contains required actions, it may become an interactive surface and must be modeled accordingly.

Do not classify by visual shape alone; classify by interaction semantics.

## 11. Prove the interface under relevant contexts

Do not prove the design by requiring one identical graph under every context.

Instead ask whether required product behavior remains completable.

Challenge only relevant contexts:

```text
empty data
partial/error state
least-permitted role
representative data density
supported small/large viewport
keyboard-only interaction
reduced motion when motion exists
slow/offline connectivity when supported
stale/conflicting data when product behavior allows it
```

For each context:

```text
Can the person still understand the state?
Can they still reach the allowed action?
Can they recover when recovery is part of the behavior?
Can they still complete the required product job?
```

Do not invent:

```text
year-three scale
40,000 records
offline support
touch-only use
```

unless those are actual constraints.

A context may legitimately produce a different interface graph.

What must remain stable is the required product behavior, not the visual topology.

## 12. Build with explicit states and transitions

Do not impose:

```text
component tree = C
variant system = V
```

as an implementation invariant.

Frameworks may represent interface state through:

```text
conditional rendering
state machines
reducers
component composition
route state
variant utilities
async resource primitives
```

The requirement is:

```text
modeled states are explicit
transitions are understandable
rendering matches the modeled state
meaningful moves remain reachable
```

No consequential rendered state should exist only as an accidental conditional that the design cannot explain.

No consequential user move should appear in implementation without a corresponding interaction path.

### Component boundaries

Componentization is an implementation decision informed by the interface graph, not mechanically derived from it.

Repeated surface appearance may suggest reuse.

Extract a shared component when responsibility, interaction contract, and reuse are stable enough that the abstraction reduces complexity rather than merely moving it.

## 13. Relationship to other skills

### `product-design`

```text
product-design
→ what the product must enable

design-graph
→ how that behavior is expressed through interface
```

Do not reopen product scope during interface modeling.

If interface work reveals contradictory product behavior, return the contradiction to `product-design`.

### `design-thinking`

```text
design-thinking
→ computational/runtime implementation graph

design-graph
→ interaction/interface graph
```

Both may use:

```text
nodes
edges
state
requirements
alternate paths
proof
```

They do **not** need isomorphic sections or one-to-one mappings.

Do not mirror:

```text
Effect/Stream ↔ detail/list/live
E ↔ V
R ↔ N
pipe ↔ motion
gen/pipe ↔ tree/variants
```

Those analogies are not reliable enough to be canonical rules.

### `engineering-design`

Engineering Design owns system boundaries, state ownership, contracts, and guarantees.

Design Graph should not infer backend architecture from UI layout.

### `security-review`

UI permission visibility is not authorization.

When interface changes touch sensitive authority or exposure:

```text
design-graph
→ interaction/affordance

security-review
→ verify actual trust/authority property
```

### `test-engineering`

Use test-engineering only when verifying the interaction requires non-trivial test design.

Obvious interaction behavior can be verified directly at the appropriate level.

## 14. Proportionality

Do not run the full method for every visual change.

```text
tiny visual/style change
→ inspect local surface → update → targeted check

simple local interaction
→ surface + move + relevant variants

form / async interaction / permissions
→ add prerequisites + interaction semantics + failure/recovery states

multi-surface workflow / responsive navigation / complex state
→ model the affected interface graph explicitly
```

Depth follows interaction risk, not number of components.

Do not create a large UX specification when one local state transition is enough.

---

## The Pipeline

```text
PRODUCT CONTRACT / KNOWN BEHAVIOR
        ↓
"What must the person accomplish?"
        → preserve the product job

        ↓
"What surfaces expose that behavior?"
        → identify meaningful surfaces/units

        ↓
"What moves connect them?"
        → model user/system transitions

        ↓
"What primary content/actions exist?"
        → define C

        ↓
"What meaningful rendered variants can occur?"
        → define V

        ↓
"What prerequisites make each move/surface valid?"
        → define N

        ↓
"What interaction semantics make edges reachable?"
        → focus / keyboard / pointer / announcements / async states

        ↓
"How does environment change the projection?"
        → viewport / modality / connectivity / platform constraints

        ↓
"Can required product behavior still complete under relevant contexts?"
        → proof

        ↓
"Does implementation expose all consequential states and moves explicitly?"
        → verify build projection

        ↓
INTERFACE
```

**Every consequential rendered state and user move should trace to the interface graph. If implementation exposes a meaningful state or move the graph cannot explain, either the graph or the implementation is incomplete.**