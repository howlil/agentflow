#!/usr/bin/env bash
# Post-release acceptance only mutates temporary install directories.
set -euo pipefail

RELEASE_REF="$1"
PREVIOUS_REF="$(printf '%s' "$2")"
SKILLS_VERSION="1.7.4"
REPOSITORY="howlil/agentflow"

validate_tag() {
  [[ "$1" =~ ^v[0-9]+[.][0-9]+[.][0-9]+$ ]] || {
    echo "Invalid release tag: $1" >&2
    exit 1
  }
}
validate_tag "$RELEASE_REF"
if [ -n "$PREVIOUS_REF" ]; then
  validate_tag "$PREVIOUS_REF"
  test "$PREVIOUS_REF" != "$RELEASE_REF" || {
    echo "Previous tag cannot equal the target tag." >&2
    exit 1
  }
fi

ROOT="$(git rev-parse --show-toplevel)"
git -C "$ROOT" fetch --no-tags origin master
git -C "$ROOT" fetch --tags origin

verify_release_tag() {
  local tag="$1"
  git -C "$ROOT" show-ref --verify --quiet "refs/tags/$tag" || {
    echo "Published tag not found: $tag" >&2
    exit 1
  }
  local sha
  sha="$(git -C "$ROOT" rev-parse "refs/tags/$tag^{commit}")"
  git -C "$ROOT" merge-base --is-ancestor "$sha" "refs/remotes/origin/master" || {
    echo "Release tag is not reachable from master: $tag" >&2
    exit 1
  }
  test "$(gh release view "$tag" --repo "$REPOSITORY" --json isDraft --jq .isDraft)" = false || {
    echo "GitHub release is draft or missing: $tag" >&2
    exit 1
  }
}
verify_release_tag "$RELEASE_REF"
if [ -n "$PREVIOUS_REF" ]; then verify_release_tag "$PREVIOUS_REF"; fi

RELEASE_SHA="$(git -C "$ROOT" rev-parse "refs/tags/$RELEASE_REF^{commit}")"
if [ -n "$EXPECTED_RELEASE_SHA" ] && [ "$EXPECTED_RELEASE_SHA" != "$RELEASE_SHA" ]; then
  echo "Release workflow commit does not match the published tag." >&2
  exit 1
fi

RELEASE_VERSION="$(printf '%s' "$RELEASE_REF" | cut -c2-)"
TAG_VERSION="$(git -C "$ROOT" show "$RELEASE_REF:packages/cli/package.json" |
  node -e "let s='';process.stdin.on('data',x=>s+=x);process.stdin.on('end',()=>process.stdout.write(JSON.parse(s).version))")"
test "$TAG_VERSION" = "$RELEASE_VERSION" || {
  echo "CLI version is inconsistent with the immutable release tag." >&2
  exit 1
}

# Install public registry artifacts, never the local checkout.
test "$(npm view "@howlil/agentflow-cli@$RELEASE_VERSION" version --registry=https://registry.npmjs.org)" = "$RELEASE_VERSION"
TARGET="$(mktemp -d)"
trap 'rm -rf "$TARGET"' EXIT
mkdir -p "$TARGET/cli" "$TARGET/project"
npm install --prefix "$TARGET/cli" --no-audit --no-fund --ignore-scripts "@howlil/agentflow-cli@$RELEASE_VERSION"
AGENTFLOW="$TARGET/cli/node_modules/.bin/agentflow"
test -x "$AGENTFLOW" || { echo "Published npm package has no agentflow command" >&2; exit 1; }
test "$("$AGENTFLOW" --version)" = "agentflow-cli $RELEASE_VERSION"
"$AGENTFLOW" doctor

cd "$TARGET/project"
verify_installed_skill() {
  local tag="$1"
  test -f .agents/skills/agentflow/SKILL.md
  git -C "$ROOT" show "$tag:skills/agentflow/SKILL.md" > "$TARGET/expected-SKILL.md"
  cmp "$TARGET/expected-SKILL.md" .agents/skills/agentflow/SKILL.md
  npx --yes "skills@$SKILLS_VERSION" list --agent codex | grep -Fq agentflow
}
install_tag() {
  local tag="$1"
  npx --yes "skills@$SKILLS_VERSION" add "howlil/agentflow#$tag" --skill agentflow --agent codex --copy --yes
  verify_installed_skill "$tag"
}
uninstall_agentflow() {
  "$AGENTFLOW" uninstall --project --agent codex --skill agentflow --yes
  if [ -e .agents/skills/agentflow/SKILL.md ]; then
    echo "CLI uninstall left an installed skill behind." >&2
    exit 1
  fi
}

if [ -n "$PREVIOUS_REF" ]; then
  # Keep the older skill installed while upgrading. Replacing the same
  # installed name must change its actual SKILL.md bytes; a fresh install
  # after uninstall does not test the compatibility boundary.
  install_tag "$PREVIOUS_REF"
  install_tag "$RELEASE_REF"
  # Roll back while the newer installation remains active.
  install_tag "$PREVIOUS_REF"
else
  install_tag "$RELEASE_REF"
fi
uninstall_agentflow

echo "PASS: published npm CLI $RELEASE_VERSION, pinned GitHub skill and protected removal"
if [ -n "$PREVIOUS_REF" ]; then
  echo "PASS: in-place tag replacement and rollback to $PREVIOUS_REF"
fi
