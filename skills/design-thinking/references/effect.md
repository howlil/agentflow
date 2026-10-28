# Effect projection

## 10. Project to Effect only when Effect is actually used

The graph model is language/framework-neutral.

Use Effect-specific projection only when:

```text
the repository uses Effect
or
the task explicitly requests Effect-style implementation
```

Before writing Effect API-specific code:

```text
inspect package.json / lockfile
        ↓
identify installed Effect version
        ↓
use matching repository APIs/docs/patterns
```

Do not write APIs from another Effect version.

### A / E / R projection

When applicable:

```text
A
→ success value/data flow

E
→ expected typed failure

R
→ contextual capabilities required to run
```

Defects and interruption are not simply extra variants of `E`; reason about the runtime/Cause model appropriate to the installed version.

### `Effect.gen`

Use `Effect.gen` when it makes sequential success flow clearer.

Do not impose:

```text
gen body = all A
outer pipe = all E
```

as a correctness invariant.

Better rule:

```text
Keep the happy path visually dominant.

Handle an expected failure at the narrowest boundary
that owns its recovery policy.
```

Examples:

```text
uniform recovery for the whole workflow
→ outer composition may be appropriate

operation-specific fallback
→ local handling around that operation

boundary error translation
→ handle at the boundary

caller-owned failure
→ propagate in E
```

### `.pipe()`

`.pipe()` is composition syntax, not proof that the graph is unchanged.

Combinators inside a pipe may alter:

```text
A
E
R
execution count
timing
concurrency
cancellation
resource behavior
```

Use `.pipe()` where it improves composition/readability, while reasoning about the real semantics of each combinator.

### `Layer`

Use Layer/provisioning to satisfy contextual capabilities and service-construction dependencies where appropriate.

Do not expose construction dependencies in service interfaces when they can be discharged during provisioning.

### `Stream`

Use Stream for incremental/multi-emission computations when its semantics are actually needed.

Do not convert every collection or paginated result into Stream by default.
