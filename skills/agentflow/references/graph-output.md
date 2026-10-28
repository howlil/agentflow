# Graph output

Use only when known relationships are clearer visually than in prose. Render evidence supplied by code, contracts or the owning specialist. Never invent components, workers, dependencies or verification claims to complete a diagram.

Choose a call path for execution, a dependency graph for ownership, a state graph for transitions, or a small DAG for delegated outcomes. Label concurrency, ordering, retry and conflict only when established. A branch alone does not imply parallel execution.

Name nodes by responsibility or outcome. Keep diagrams scoped to the question. Compare expected and actual behavior by contract equivalence; internal structure may legitimately differ. Separate production and test views only when substitutions change relevant semantics. Show verification evidence separately from production execution.

Use Mermaid when the host renders it, compact text in terminals, or another requested format. Prefer prose or a table for trivial relationships. Graph notation is optional presentation and must never become another mandatory SDLC stage.
