import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const VARIANTS = new Set(['baseline', 'agentflow']);

function requiredString(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(name + ' must be a non-empty string');
  return value;
}

function requiredSha(value, name) {
  requiredString(value, name);
  if (!/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/i.test(value)) {
    throw new TypeError(name + ' must be a full Git SHA (40 or 64 hex characters)');
  }
}

function proofState(run) {
  const e = run.evidence;
  // This validates a reported independent check, not the authenticity of the linked artifact.
  if (!e || e.kind !== 'independent-check' || typeof e.testedSha !== 'string' ||
      e.testedSha.toLowerCase() !== run.resultSha.toLowerCase() ||
      typeof e.reference !== 'string' || !e.reference.trim() || typeof e.passed !== 'boolean') {
    return 'UNVERIFIED';
  }
  return e.passed ? 'PASS' : 'FAIL';
}

function average(values) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
}

export function scoreReport(report, knownScenarios) {
  if (report?.schemaVersion !== 1 || !Array.isArray(report.runs)) {
    throw new TypeError('Expected schemaVersion=1 with a runs array');
  }
  if (!(knownScenarios instanceof Set) || !knownScenarios.size) {
    throw new TypeError('Pass a non-empty set of known scenario IDs');
  }
  const groups = new Map();
  for (const run of report.runs) {
    const scenarioId = requiredString(run?.scenarioId, 'scenarioId');
    if (!knownScenarios.has(scenarioId)) throw new Error('Unknown scenario: ' + scenarioId);
    if (!VARIANTS.has(run.variant)) throw new Error('Unknown variant: ' + run.variant);
    if (!Number.isInteger(run.trial) || run.trial < 1) throw new TypeError('trial must be a positive integer');
    for (const name of ['host', 'model', 'toolset']) requiredString(run[name], name);
    for (const name of ['fixtureSha', 'resultSha']) requiredSha(run[name], name);
    for (const name of ['durationMs', 'tokens', 'toolCalls']) {
      if (run[name] !== undefined && (!Number.isFinite(run[name]) || run[name] < 0)) {
        throw new TypeError(name + ' must be nonnegative and finite');
      }
    }
    if (run.claimedComplete !== undefined && typeof run.claimedComplete !== 'boolean') {
      throw new TypeError('claimedComplete must be boolean');
    }
    const pairKey = JSON.stringify([scenarioId, run.trial, run.host, run.model, run.fixtureSha.toLowerCase(), run.toolset]);
    const group = groups.get(pairKey) ?? { scenarioId, trial: run.trial };
    if (group[run.variant]) throw new Error('Duplicate variant for trial: ' + pairKey);
    group[run.variant] = { run, proof: proofState(run) };
    groups.set(pairKey, group);
  }

  const paired = [...groups.values()].filter(g => g.baseline && g.agentflow);
  const complete = paired.filter(g => g.baseline.proof !== 'UNVERIFIED' && g.agentflow.proof !== 'UNVERIFIED');
  // An unknown result is not a failed task. Do not publish a definitive A/B
  // success rate unless every paired trial has independent evidence on both sides.
  const comparable = paired.length > 0 && complete.length === paired.length;
  const unpaired = [...groups.values()].filter(g => !g.baseline || !g.agentflow)
    .map(g => ({ scenarioId: g.scenarioId, trial: g.trial, missing: g.baseline ? 'agentflow' : 'baseline' }));
  function summarize(variant) {
    const entries = paired.map(g => g[variant]);
    const values = entries.map(e => e.run);
    return {
      total: entries.length,
      verifiedSuccess: entries.filter(e => e.proof === 'PASS').length,
      failedIndependentChecks: entries.filter(e => e.proof === 'FAIL').length,
      unverified: entries.filter(e => e.proof === 'UNVERIFIED').length,
      unsupportedCompletionClaims: entries.filter(e => e.run.claimedComplete === true && e.proof !== 'PASS').length,
      successRate: comparable ? entries.filter(e => e.proof === 'PASS').length / entries.length : null,
      meanDurationMs: average(values.map(r => r.durationMs).filter(Number.isFinite)),
      meanTokens: average(values.map(r => r.tokens).filter(Number.isFinite)),
      meanToolCalls: average(values.map(r => r.toolCalls).filter(Number.isFinite))
    };
  }
  const baseline = summarize('baseline');
  const agentflow = summarize('agentflow');
  return {
    schemaVersion: 1,
    pairedTrials: paired.length,
    comparableTrials: complete.length,
    incompletePairedTrials: paired.length - complete.length,
    unpaired,
    baseline,
    agentflow,
    successRateDelta: comparable ? agentflow.successRate - baseline.successRate : null,
    evidenceCaveat: 'Evidence links and execution provenance must be checked independently; the scorer validates only report consistency.'
  };
}

export async function scoreFile(path, catalogPath) {
  const [raw, catalogRaw] = await Promise.all([readFile(path, 'utf8'), readFile(catalogPath, 'utf8')]);
  const catalog = JSON.parse(catalogRaw);
  if (catalog?.schemaVersion !== 1 || !Array.isArray(catalog.scenarios)) throw new Error('Invalid catalog');
  const ids = catalog.scenarios.map(s => requiredString(s.id, 'catalog scenario id'));
  if (new Set(ids).size !== ids.length) throw new Error('Duplicate scenario ID in catalog');
  return scoreReport(JSON.parse(raw), new Set(ids));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const path = process.argv[2];
  if (!path) {
    console.error('Usage: node scripts/eval-score.mjs <results.json>');
    process.exitCode = 1;
  } else {
    const catalog = new URL('../evals/scenarios.json', import.meta.url);
    scoreFile(path, catalog).then(result => {
      console.log(JSON.stringify(result, null, 2));
    }).catch(error => {
      console.error(error.message);
      process.exitCode = 1;
    });
  }
}
