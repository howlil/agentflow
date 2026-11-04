import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { scoreReport } from './eval-score.mjs';

const ids = new Set(['EV01', 'EV02']);
function sample(variant, overrides = {}) {
  return {
    scenarioId: 'EV01',
    variant,
    trial: 1,
    host: 'codex',
    model: 'model-pinned',
    fixtureSha: 'fixture-123',
    toolset: 'tools-v1',
    resultSha: variant + '-result',
    durationMs: 800,
    tokens: 250,
    toolCalls: 3,
    claimedComplete: true,
    evidence: {
      kind: 'independent-check',
      testedSha: variant + '-result',
      reference: 'https://example.test/proof/' + variant,
      passed: true
    },
    ...overrides
  };
}

test('scores paired reported independent outcomes and computes measured deltas', () => {
  const report = { schemaVersion: 1, runs: [
    sample('baseline', { evidence: { ...sample('baseline').evidence, passed: false } }),
    sample('agentflow')
  ] };
  const result = scoreReport(report, ids);
  assert.equal(result.pairedTrials, 1);
  assert.equal(result.baseline.verifiedSuccess, 0);
  assert.equal(result.agentflow.verifiedSuccess, 1);
  assert.equal(result.successRateDelta, 1);
  assert.equal(result.baseline.unsupportedCompletionClaims, 1);
  assert.equal(result.agentflow.meanTokens, 250);
});

test('missing or stale-head proof never counts as success', () => {
  const result = scoreReport({ schemaVersion: 1, runs: [
    sample('baseline', { evidence: undefined }),
    sample('agentflow', { evidence: { ...sample('agentflow').evidence, testedSha: 'previous-head' } })
  ] }, ids);
  assert.equal(result.pairedTrials, 1);
  assert.equal(result.baseline.unverified, 1);
  assert.equal(result.agentflow.unverified, 1);
  assert.equal(result.agentflow.verifiedSuccess, 0);
  assert.equal(result.agentflow.unsupportedCompletionClaims, 1);
});

test('mismatched host, model, fixture or toolset is not a comparable pair', () => {
  const report = { schemaVersion: 1, runs: [
    sample('baseline'),
    sample('agentflow', { model: 'different-model' })
  ] };
  const result = scoreReport(report, ids);
  assert.equal(result.pairedTrials, 0);
  assert.equal(result.unpaired.length, 2);
  assert.equal(result.successRateDelta, null);
});

test('rejects duplicate trials and unknown scenario IDs', () => {
  assert.throws(() => scoreReport({ schemaVersion: 1, runs: [sample('baseline'), sample('baseline')] }, ids), /Duplicate variant/);
  assert.throws(() => scoreReport({ schemaVersion: 1, runs: [sample('baseline', { scenarioId: 'EV99' })] }, ids), /Unknown scenario/);
});

test('rejects invalid numeric measures and incompatible report versions', () => {
  assert.throws(() => scoreReport({ schemaVersion: 1, runs: [sample('baseline', { tokens: -5 })] }, ids), /tokens/);
  assert.throws(() => scoreReport({ schemaVersion: 2, runs: [] }, ids), /schemaVersion/);
});

test('pilot catalog has eight distinct scenario goals without pretending they executed', async () => {
  const catalog = JSON.parse(await readFile(new URL('../evals/scenarios.json', import.meta.url), 'utf8'));
  assert.equal(catalog.schemaVersion, 1);
  assert.equal(catalog.scenarios.length, 8);
  assert.equal(new Set(catalog.scenarios.map(s => s.id)).size, 8);
  for (const s of catalog.scenarios) {
    assert.match(s.id, /^EV0[1-8]$/);
    assert.ok(s.task && s.independentProof && s.failureMode);
  }
});
