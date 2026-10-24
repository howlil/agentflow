#!/usr/bin/env bash
# Canary for same-name skill replacement on the pinned upstream installer.
# Both fixtures have different content. Never touches a real user's HOME.
set -euo pipefail
TEMP="$(mktemp -d)"
trap 'rm -rf "$TEMP"' EXIT
export HOME="$TEMP/home"
export XDG_CONFIG_HOME="$HOME/.config"
export npm_config_cache="$TEMP/npm-cache"
export DISABLE_TELEMETRY='1'
mkdir -p "$HOME" "$TEMP/v1/skills/agentflow" "$TEMP/v2/skills/agentflow" "$TEMP/project"
cat > "$TEMP/v1/skills/agentflow/SKILL.md" <<'EOF'
---
name: agentflow
description: Local upgrade fixture release one.
---

# Agentflow
First fixture instructions.
EOF
cat > "$TEMP/v2/skills/agentflow/SKILL.md" <<'EOF'
---
name: agentflow
description: Local upgrade fixture release two.
---

# Agentflow
Second fixture instructions.
EOF

cd "$TEMP/project"
mkdir -p .agents/skills/unrelated
echo "User-owned skill" > .agents/skills/unrelated/SKILL.md

install_fixture() {
  local source="$1"
  npx --yes skills@1.7.4 add "$source" --skill agentflow --agent codex --copy --yes
  cmp "$source/skills/agentflow/SKILL.md" .agents/skills/agentflow/SKILL.md || {
    echo "Installer did not replace the previously installed skill with $source" >&2
    exit 1
  }
  npx --yes skills@1.7.4 list --agent codex | grep -Fq agentflow
}

install_fixture "$TEMP/v1"
# Crucial: no intermediate uninstall, so this tests replacement of a live skill,
# not three independent fresh installs.
install_fixture "$TEMP/v2"
install_fixture "$TEMP/v1"
npx --yes skills@1.7.4 remove agentflow --agent codex --yes
test ! -e .agents/skills/agentflow/SKILL.md
test "$(cat .agents/skills/unrelated/SKILL.md)" = "User-owned skill"
echo "PASS: pinned installer replaces and rolls back one active skill without touching unrelated files"
