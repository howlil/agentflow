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
# Reference policies must ship with the selected skill (project and global).
assert_installed() {
  local skill="$1" target="$2" reference
  shift 2
  cmp "$REPO/skills/$skill/SKILL.md" "$target/SKILL.md"
  for reference in "$@"; do
    cmp "$REPO/skills/$skill/references/$reference" "$target/references/$reference"
  done
}
assert_removed() {
  local target="$1" reference
  shift
  test ! -e "$target/SKILL.md"
  for reference in "$@"; do
    test ! -e "$target/references/$reference"
  done
}
npx --yes skills@1.7.4 add "$REPO" --list > "$TEMP/discovery.txt" 2>&1
grep -Fq agentflow "$TEMP/discovery.txt"
grep -Fq code-review "$TEMP/discovery.txt"
npx --yes skills@1.7.4 add "$REPO" --skill agentflow --agent "$AGENT" --copy --yes
assert_installed agentflow "$PROJECT_DIR/agentflow" cli.md chatgpt-github.md delegation.md ai-implementation.md
npx --yes skills@1.7.4 list --agent "$AGENT" | grep -Fq agentflow
npx --yes skills@1.7.4 remove agentflow --agent "$AGENT" --yes
assert_removed "$PROJECT_DIR/agentflow" cli.md chatgpt-github.md delegation.md ai-implementation.md
# A specialist's bundled references must travel too; global scope is proven above.
npx --yes skills@1.7.4 add "$REPO" --skill design-graph --agent "$AGENT" --copy --yes
assert_installed design-graph "$PROJECT_DIR/design-graph" direction.md craft.md signs.md tokens.md visuals.md
npx --yes skills@1.7.4 list --agent "$AGENT" | grep -Fq design-graph
npx --yes skills@1.7.4 remove design-graph --agent "$AGENT" --yes
assert_removed "$PROJECT_DIR/design-graph" direction.md craft.md signs.md tokens.md visuals.md
test -f "$PROJECT_DIR/unrelated/SKILL.md"
cmp AGENTS.md "$TEMP/original-agents"
npx --yes skills@1.7.4 add "$REPO" --skill agentflow --global --agent "$AGENT" --copy --yes
assert_installed agentflow "$HOME/$GLOBAL_DIR/agentflow" cli.md chatgpt-github.md delegation.md ai-implementation.md
npx --yes skills@1.7.4 list --global --agent "$AGENT" | grep -Fq agentflow
npx --yes skills@1.7.4 remove agentflow --global --agent "$AGENT" --yes
assert_removed "$HOME/$GLOBAL_DIR/agentflow" cli.md chatgpt-github.md delegation.md ai-implementation.md
cmp AGENTS.md "$TEMP/original-agents"
echo "PASS: $AGENT portable project/global lifecycle from current checkout."
