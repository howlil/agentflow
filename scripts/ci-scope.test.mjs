import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyPaths } from './ci-scope.mjs';

test('M3 fast path applies only to root docs with no source contract tests', () => {
  assert.deepEqual(classifyPaths(['CHANGELOG.md', 'CONTRIBUTING.md']), {
    full_required: false, portable_required: false, scope: 'root-docs-only'
  });
});

test('M3 README changes retain installation and product contract verification', () => {
  assert.deepEqual(classifyPaths(['README.md']), {
    full_required: true, portable_required: false, scope: 'source-or-site'
  });
  assert.deepEqual(classifyPaths(['README.md', 'CHANGELOG.md']), {
    full_required: true, portable_required: false, scope: 'source-or-site'
  });
});
test('M3 Issue contracts, website and source changes keep full verification', () => {
  for (const p of ['.github/ISSUE_TEMPLATE/agentflow-execution.md',
    'src/content/docs/start/chatgpt-web.md','scripts/execution-contract.mjs',
    'scripts/execution-contract.test.mjs','AGENTS.md']) {
    assert.deepEqual(classifyPaths([p]), {
      full_required: true, portable_required: false, scope: 'source-or-site'
    }, p);
  }
});
test('M3 skill/manifest/installer changes still require portable matrix', () => {
  for (const p of ['skills/agentflow/SKILL.md','skills/agentflow/references/github-delivery-policy.md',
    'assets/agentflow.svg','plugin.json','.claude-plugin/plugin.json','package-lock.json',
    'scripts/generate-skills.mjs','scripts/chatgpt-package.mjs',
    '.github/scripts/cross-agent-candidate.sh','.github/workflows/ci.yml','RELEASE_VERSION']) {
    assert.deepEqual(classifyPaths([p]), {
      full_required: true, portable_required: true, scope: 'distribution'
    }, p);
  }
});
test('M3 missing baseline or mixed changes never bypass safety checks', () => {
  assert.deepEqual(classifyPaths(null), {
    full_required: true, portable_required: true, scope: 'unknown'
  });
  assert.deepEqual(classifyPaths([]), classifyPaths(null));
  assert.deepEqual(classifyPaths(['README.md','scripts/execution-contract.mjs']), {
    full_required: true, portable_required: false, scope: 'source-or-site'
  });
  assert.deepEqual(classifyPaths(['README.md','skills/agentflow/SKILL.md']), {
    full_required: true, portable_required: true, scope: 'distribution'
  });
});
