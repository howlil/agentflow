---
title: Graph output migration
description: Graph rendering is now an optional router reference.
---

`call-graph-output` has been consolidated into the router's [graph output reference](https://github.com/howlil/agentflow/blob/master/skills/agentflow/references/graph-output.md). Rendering no longer occupies a specialist slot; `release-engineering` now owns release decisions. The collection remains one router and ten specialists, and `design-thinking` keeps its name.

Existing portable copies may retain the retired skill. Use the upstream installer's list/remove commands to remove that selected skill, then install/update the desired current collection; do not delete unrelated skills. Host-managed plugin updates follow their own lifecycle. A file update does not guarantee that stale installations disappear.

See [release engineering](/skills/release-engineering/) and [installation](/start/install/).
