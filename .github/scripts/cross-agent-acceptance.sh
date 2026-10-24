#!/usr/bin/env bash
# M6: real file-based agent compatibility using the published v0.3.0 artifacts.
# No host login, account configuration or external home directories are touched.
set -euo pipefail

if [ "$#" -ne 1 ]; then echo 'Usage: cross-agent-acceptance.sh <agent-id>' >&2; exit 2; fi
AGENT="$1"
case "$AGENT" in
  claude-code) PROJECT_DIR='.claude/skills' ; GLOBAL_DIR='.claude/skills' ;;
  codex) PROJECT_DIR='.agents/skills' ; GLOBAL_DIR='.agents/skills' ;;
  gemini-cli) PROJECT_DIR='.agents/skills' ; GLOBAL_DIR='.agents/skills' ;;
  cursor) PROJECT_DIR='.agents/skills' ; GLOBAL_DIR='.agents/skills' ;;
  opencode) PROJECT_DIR='.agents/skills' ; GLOBAL_DIR='.agents/skills' ;;
  *) echo "Unsupported agent identifier: $AGENT" >&2; exit 2 ;;
esac

RELEASE='v0.3.0'
VERSION='0.3.0'
SKILLS_VERSION='1.7.4'
REPO="$(git rev-parse --show-toplevel)"
git -C "$REPO" rev-parse -q --verify "refs/tags/$RELEASE^{commit}" >/dev/null || {
  echo "Missing published $RELEASE tag in checkout" >&2; exit 1;
}

TEMP="$(mktemp -d)"
trap 'rm -rf "$TEMP"' EXIT
export HOME="$TEMP/home"
export XDG_CONFIG_HOME="$HOME/.config"
export npm_config_cache="$TEMP/npm-cache"
export DISABLE_TELEMETRY='1'
mkdir -p "$HOME" "$TEMP/cli" "$TEMP/project"

# Exercise real registry package rather than only repo-local executable.
npm install --prefix "$TEMP/cli" --no-fund --no-audit --ignore-scripts "@howlil/agentflow-cli@$VERSION"
CLI="$TEMP/cli/node_modules/.bin/agentflow"
test -x "$CLI"
test "$("$CLI" --version)" = "agentflow-cli $VERSION"

git -C "$REPO" show "$RELEASE:skills/agentflow/SKILL.md" > "$TEMP/canonical.md"
cd "$TEMP/project"
printf '%s\n' 'User-owned AGENTS.md must not be overwritten' > AGENTS.md
cp AGENTS.md "$TEMP/agents-sentinel"
mkdir -p "$PROJECT_DIR/unrelated"
printf '%s\n' 'foreign project skill' > "$PROJECT_DIR/unrelated/SKILL.md"

# Project: confirm host-recognized location, bytes and protected removal.
"$CLI" init --agent "$AGENT"
"$CLI" install --project --agent "$AGENT" --skill agentflow --copy --yes
test -f "$PROJECT_DIR/agentflow/SKILL.md"
cmp "$TEMP/canonical.md" "$PROJECT_DIR/agentflow/SKILL.md"
npx --yes "skills@$SKILLS_VERSION" list --agent "$AGENT" | grep -Fq agentflow
"$CLI" uninstall --project --agent "$AGENT" --skill agentflow --yes
test ! -e "$PROJECT_DIR/agentflow/SKILL.md"
test "$(cat "$PROJECT_DIR/unrelated/SKILL.md")" = 'foreign project skill'
cmp AGENTS.md "$TEMP/agents-sentinel"

# Global: isolated HOME and XDG paths, still backed by upstream lock.
"$CLI" install --global --agent "$AGENT" --skill agentflow --copy --yes
test -f "$HOME/$GLOBAL_DIR/agentflow/SKILL.md"
cmp "$TEMP/canonical.md" "$HOME/$GLOBAL_DIR/agentflow/SKILL.md"
npx --yes "skills@$SKILLS_VERSION" list --global --agent "$AGENT" | grep -Fq agentflow
"$CLI" uninstall --global --agent "$AGENT" --skill agentflow --yes
test ! -e "$HOME/$GLOBAL_DIR/agentflow/SKILL.md"
cmp AGENTS.md "$TEMP/agents-sentinel"

echo "PASS: $AGENT project and global install/list/uninstall; canonical bytes, source protection, and steering-file preservation."
