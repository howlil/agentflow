import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

// README is covered by product/install contract tests; do not skip those checks.
const QUICK_DOCS = new Set(['CHANGELOG.md', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', 'SECURITY.md', 'SUPPORT.md']);

export function classifyPaths(paths) {
  if (!Array.isArray(paths) || paths.length === 0)
    return { full_required: true, portable_required: true, scope: 'unknown' };
  const portable = paths.some(p =>
    p.startsWith('skills/') || p.startsWith('assets/') || p.startsWith('.claude-plugin/') ||
    p.startsWith('.codex-plugin/') || ['plugin.json', 'package.json', 'package-lock.json',
      '.node-version', 'RELEASE_VERSION', '.github/workflows/ci.yml',
      '.github/scripts/cross-agent-candidate.sh', 'scripts/generate-skills.mjs',
      'scripts/plugin-manifests.mjs', 'scripts/chatgpt-package.mjs'].includes(p)
  );
  const full = portable || paths.some(p => !QUICK_DOCS.has(p));
  return { full_required: full, portable_required: portable, scope: !full ? 'root-docs-only' : portable ? 'distribution' : 'source-or-site' };
}

function currentScope() {
  const base = process.env.CI_BASE_SHA || '';
  const head = process.env.CI_HEAD_SHA || 'HEAD';
  if (!/^[0-9a-f]{40}$/i.test(base) || /^0{40}$/i.test(base))
    return { ...classifyPaths(null), reason: 'unknown base SHA' };
  let paths;
  try {
    // A rename must include both its old and new path.
    const raw = execFileSync('git', ['diff', '--no-renames', '--name-only', '-z', base, head], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    paths = raw.split('\0').filter(Boolean);
  } catch {
    return { ...classifyPaths(null), reason: 'unavailable diff: fail closed to full checks' };
  }
  // A whitespace error must FAIL classification, not become a green fast path.
  execFileSync('git', ['diff', '--check', base, head], { stdio: ['ignore', 'pipe', 'inherit'] });
  return { ...classifyPaths(paths), count: paths.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const r = currentScope();
    process.stderr.write('CI scope: ' + JSON.stringify(r) + '\n');
    process.stdout.write('full_required=' + r.full_required + '\nportable_required=' + r.portable_required + '\n');
  } catch (error) {
    process.stderr.write('CI scope failed: ' + String(error.message) + '\n');
    process.exitCode = 1;
  }
}
