# Security policy

Agentflow contains portable skill instructions, plugin metadata, packaging scripts and a documentation site. Security issues may include unsafe distribution/installation behavior, exposure of credentials, or instructions that create consequential authorization risks.

## Reporting a vulnerability

**Do not disclose exploit details, credentials, private user information or a working attack in public Issues or pull requests.**

1. Prefer GitHub's **Report a vulnerability** option in this repository's **Security** tab, **if it is enabled**. This provides a private advisory workflow.
2. If that option is unavailable, [open a minimal Issue](https://github.com/howlil/agentflow/issues/new) requesting a private reporting channel **without including the vulnerability details**. Do not assume the public Issue is confidential.

In a private report, include the affected component/version or commit, the impact, a minimal reproduction, and any mitigation you have identified. Do not send actual secrets.

## Scope and expectations

Check [GitHub Releases](https://github.com/howlil/agentflow/releases) for published versions. Repository source, candidate ChatGPT plugin ZIPs and separately installed marketplace copies may be at different revisions. Specify the affected installation route; a fix merged to the repository is not necessarily published or automatically installed.

There is no guaranteed response, remediation, or disclosure SLA. Public disclosure should be coordinated after a safe fix or mitigation when possible. Third-party host, marketplace and installer vulnerabilities may also need reporting to their respective maintainers.
