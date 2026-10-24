#!/usr/bin/env bash
# M6 candidate acceptance: exercise THIS checkout's skills and packed CLI,
# not the already-released v0.3.0 artifacts. The released package is separately
# verified by the published-release-smoke job.
set -euo pipefail
if [ "$#" -ne 1 ]; then echo "Usage: cross-agent-candidate.sh <agent-id>" >&2; exit 2; fi

AGENT="$1"
case "$AGENT" in
  claude-code) PROJECT_DIR='.claude/skills' ; GLOBAL_DIR='.claude/skills' ;;
  codex|gemini-cli|cursor|opencode) PROJECT_DIR='.agents/skills' ; GLOBAL_DIR='.agents/skills' ;;
  *) echo "Unsupported agent identifier: $AGENT" >&2; exit 2 ;;
esac

SKILLS_VERSION='1.7.4'
REPO="$(git rev-parse --show-toplevel)"
VERSION="$(node -p "require('$REPO/package.json').version")"
CLI_VERSION="$(node -p "require('$REPO/packages/cli/package.json').version")"
test "$VERSION" = "$CLI_VERSION" || {
  echo "Candidate CLI and root version differ" >&2
  exit 1
}

TEMP="$(mktemp -d)"
trap 'rm -rf "$TEMP"' EXIT
export HOME="$TEMP/home"
export XDG_CONFIG_HOME="$HOME/.config"
export npm_config_cache="$TEMP/npm-cache"
export DISABLE_TELEMETRY='1'
mkdir -p "$HOME" "$TEMP/cli" "$TEMP/project"

# Package from HEAD. npm publish is never executed.
npm pack "$REPO/packages/cli" --pack-destination "$TEMP" --silent > "$TEMP/tarball-name"
TARBALL="$(cat "$TEMP/tarball-name")"
npm install --prefix "$TEMP/cli" --ignore-scripts --no-fund --no-audit "$TEMP/$TARBALL"
CLI="$TEMP/cli/node_modules/.bin/agentflow"
test -x "$CLI"
test "$("$CLI" --version)" = "agentflow-cli $VERSION"
"$CLI" doctor

cd "$TEMP/project"
printf '%s\n' 'Owner-managed steering file' > AGENTS.md
cp AGENTS.md "$TEMP/original-agents"
mkdir -p "$PROJECT_DIR/unrelated"
printf '%s\n' 'Other skill must remain' > "$PROJECT_DIR/unrelated/SKILL.md"

"$CLI" init --agent "$AGENT"
# CLI install intentionally fetches the canonical GitHub source. For PR
# candidates, call the pinned upstream installer with this checkout as source.
"$CLI" install --project --agent "$AGENT" --skill agentflow --dry-run |
  grep -Fq 'skills@1.7.4'
npx --yes "skills@$SKILLS_VERSION" add "$REPO" --skill agentflow --agent "$AGENT" --copy --yes
cmp "$REPO/skills/agentflow/SKILL.md" "$PROJECT_DIR/agentflow/SKILL.md"
npx --yes "skills@$SKILLS_VERSION" list --agent "$AGENT" | grep -Fq agentflow
npx --yes "skills@$SKILLS_VERSION" remove agentflow --agent "$AGENT" --yes
test ! -e "$PROJECT_DIR/agentflow/SKILL.md"
test "$(cat "$PROJECT_DIR/unrelated/SKILL.md")" = 'Other skill must remain'
cmp AGENTS.md "$TEMP/original-agents"

npx --yes "skills@$SKILLS_VERSION" add "$REPO" --skill agentflow --global --agent "$AGENT" --copy --yes
cmp "$REPO/skills/agentflow/SKILL.md" "$HOME/$GLOBAL_DIR/agentflow/SKILL.md"
npx --yes "skills@$SKILLS_VERSION" list --global --agent "$AGENT" | grep -Fq agentflow
npx --yes "skills@$SKILLS_VERSION" remove agentflow --global --agent "$AGENT" --yes
test ! -e "$HOME/$GLOBAL_DIR/agentflow/SKILL.md"
cmp AGENTS.md "$TEMP/original-agents"

echo "PASS: $AGENT candidate HEAD portable skill and packed CLI; project/global lifecycle."
