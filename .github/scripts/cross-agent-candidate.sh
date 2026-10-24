#!/usr/bin/env bash
# Exercise the current checkout's canonical skills through upstream portable installer.
set -euo pipefail
if [ "$#" -ne 1 ]; then echo 'Usage: cross-agent-candidate.sh <agent-id>' >&2; exit 2; fi
AGENT="$1"
case "$AGENT" in
  claude-code) PROJECT_DIR='.claude/skills'; GLOBAL_DIR='.claude/skills' ;;
  codex|gemini-cli|cursor|opencode) PROJECT_DIR='.agents/skills'; GLOBAL_DIR='.agents/skills' ;;
  *) echo "Unsupported agent ID: $AGENT" >&2; exit 2 ;;
esac
REPO="$(git rev-parse --show-toplevel)"
TEMP="$(mktemp -d)"
trap 'rm -rf "$TEMP"' EXIT
export HOME="$TEMP/home"
export XDG_CONFIG_HOME="$HOME/.config"
export npm_config_cache="$TEMP/npm-cache"
export DISABLE_TELEMETRY=1
mkdir -p "$HOME" "$TEMP/project"
cd "$TEMP/project"
printf 'Project steering preserved\n' > AGENTS.md
cp AGENTS.md "$TEMP/original-agents"
mkdir -p "$PROJECT_DIR/unrelated"
printf 'Other publisher\n' > "$PROJECT_DIR/unrelated/SKILL.md"
npx --yes skills@1.7.4 add "$REPO" --list > "$TEMP/discovery.txt" 2>&1
grep -Fq agentflow "$TEMP/discovery.txt"
grep -Fq code-review "$TEMP/discovery.txt"
npx --yes skills@1.7.4 add "$REPO" --skill agentflow --agent "$AGENT" --copy --yes
cmp "$REPO/skills/agentflow/SKILL.md" "$PROJECT_DIR/agentflow/SKILL.md"
npx --yes skills@1.7.4 list --agent "$AGENT" | grep -Fq agentflow
npx --yes skills@1.7.4 remove agentflow --agent "$AGENT" --yes
test ! -e "$PROJECT_DIR/agentflow/SKILL.md"
test -f "$PROJECT_DIR/unrelated/SKILL.md"
cmp AGENTS.md "$TEMP/original-agents"
npx --yes skills@1.7.4 add "$REPO" --skill agentflow --global --agent "$AGENT" --copy --yes
cmp "$REPO/skills/agentflow/SKILL.md" "$HOME/$GLOBAL_DIR/agentflow/SKILL.md"
npx --yes skills@1.7.4 list --global --agent "$AGENT" | grep -Fq agentflow
npx --yes skills@1.7.4 remove agentflow --global --agent "$AGENT" --yes
test ! -e "$HOME/$GLOBAL_DIR/agentflow/SKILL.md"
cmp AGENTS.md "$TEMP/original-agents"
echo "PASS: $AGENT portable project/global lifecycle from current checkout."
