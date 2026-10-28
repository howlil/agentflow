# AI and data security-review

Use when model, prompt, retrieval or data semantics affect this specialist’s responsibility.

Trace untrusted user/retrieved content through model output to tool calls, retrieval, data writes and external destinations. Treat model output as untrusted input; prompt text is not an authorization boundary. Verify tenant/user permissions at retrieval and tool-effect boundaries, constrain delegated authority and require appropriate confirmation for consequential actions. Inspect prompt injection, cross-tenant retrieval, exfiltration through tools/logs and resource-cost amplification only on reachable paths. Preserve provenance and data-use constraints. Prove controls with focused adversarial cases; do not claim a universal prompt-injection defense.
