# AI and data release-engineering

Use when model, prompt, retrieval or data semantics affect this specialist’s responsibility.

Treat model, prompt, retrieval index, schema and data changes as versioned behavioral releases. Bind evaluation evidence to the exact candidate tuple and environment; passing application unit tests does not prove output quality. Promote the evaluated tuple, check permissions and data compatibility, and observe quality/cost/latency after exposure. Preserve a known-good compatible tuple or document why rollback requires restore, replay or roll-forward. Define gradual exposure or shadow evaluation only when risk, privacy and infrastructure support it. Stop promotion on failed quality acceptance; never relabel unevaluated candidates as verified.
