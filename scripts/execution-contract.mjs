// Pure structural validation of the human-maintained GitHub Issue contract.
// This does NOT query GitHub or establish whether reported CI/test evidence is true.
const REQUIREMENT_ID = /^AF-\d{3,}$/;
const DECISION_ID = /^DEC-\d{3,}$/;
const VALID_STATES = new Set(['PENDING', 'IMPLEMENTED_UNVERIFIED', 'VERIFIED', 'BLOCKED']);
const SHA = /^[0-9a-f]{40}$/i;
const incomplete = value => !value || /<!--|-->|^\s*(?:TBD|TODO|—|-)\s*$/i.test(value);

function section(body, name) {
  const delimiter = '\n## ' + name + '\n';
  const normalized = '\n' + body.replace(/\r\n/g, '\n');
  const offset = normalized.indexOf(delimiter);
  if (offset < 0) return null;
  const after = normalized.slice(offset + delimiter.length);
  const end = after.indexOf('\n## ');
  return end < 0 ? after : after.slice(0, end);
}

function tables(body, name, columns, errors) {
  const content = section(body, name);
  if (content === null) { errors.push('Missing section: ' + name); return []; }
  const lines = content.split('\n').map(x => x.trim()).filter(x => x.startsWith('|'));
  if (lines.length < 3) { errors.push('Missing Markdown table rows in ' + name); return []; }
  const split = line => line.slice(1, -1).split('|').map(x => x.trim());
  if (split(lines[0]).length !== columns || split(lines[1]).length !== columns ||
      !split(lines[1]).every(x => /^:?-{3,}:?$/.test(x))) {
    errors.push('Invalid table header/separator in ' + name);
    return [];
  }
  return lines.slice(2).map((line, i) => {
    const cells = split(line);
    if (cells.length !== columns) errors.push('Invalid column count in ' + name + ' row ' + (i + 1));
    return cells;
  }).filter(cells => cells.length === columns);
}

function field(body, name) {
  const resume = section(body, 'Resume pointer');
  if (!resume) return null;
  const prefix = '- ' + name + ':';
  const row = resume.split('\n').find(s => s.trim().startsWith(prefix));
  return row ? row.trim().slice(prefix.length).trim() : null;
}

export function validateExecutionContract(body) {
  const errors = [];
  if (typeof body !== 'string' || body.trim().length === 0) {
    return { valid: false, diagnostics: ['Issue body must be nonempty text'], requirements: [] };
  }
  for (const name of ['Objective', 'Repository and baseline', 'Scope and invariants', 'Research decision traceability', 'Acceptance contract', 'Requirement evidence ledger', 'Resume pointer']) {
    if (section(body, name) === null) errors.push('Missing section: ' + name);
  }
  for (const name of ['Objective', 'Scope and invariants']) {
    const content = section(body, name);
    if (!content || !content.split('\n').some(line => line.trim() && !incomplete(line.trim()))) {
      errors.push('Unresolved content: ' + name);
    }
  }

  const requirements = tables(body, 'Requirement evidence ledger', 6, errors);
  const ids = new Set();
  for (const [id, acceptance, failure, state, codeEvidence, verification] of requirements) {
    if (!REQUIREMENT_ID.test(id)) errors.push('Invalid requirement ID: ' + id);
    if (ids.has(id)) errors.push('Duplicate requirement ID: ' + id);
    ids.add(id);
    if (incomplete(acceptance)) errors.push('Missing acceptance for ' + id);
    if (incomplete(failure)) errors.push('Missing meaningful failure case or N/A reason for ' + id);
    if (!VALID_STATES.has(state)) errors.push('Invalid requirement state: ' + id + ' / ' + state);
    if (['IMPLEMENTED_UNVERIFIED', 'VERIFIED'].includes(state) && (incomplete(codeEvidence) || codeEvidence === 'UNRECORDED')) {
      errors.push('Missing code evidence for ' + id);
    }
    if (state === 'VERIFIED' && (incomplete(verification) || verification === 'UNRUN')) errors.push('VERIFIED without observed verification: ' + id);
    if (state === 'BLOCKED' && (verification === 'UNRUN' || incomplete(verification))) errors.push('BLOCKED requires a concrete verification blocker: ' + id);
  }
  if (requirements.length === 0) errors.push('At least one requirement is necessary');

  const decisionSection = section(body, 'Research decision traceability') || '';
  const noResearch = /^\s*N\/A: no approved research decisions\s*$/m.test(decisionSection);
  const decisions = noResearch ? [] : tables(body, 'Research decision traceability', 4, errors);
  if (!noResearch && decisions.length === 0) errors.push('Record approved decisions or explicit N/A');
  if (noResearch && decisionSection.split('\n').some(line => line.trim().startsWith('|'))) {
    errors.push('Do not mix N/A with decision table rows');
  }
  const decisionIds = new Set();
  for (const [id, description, disposition, mapping] of decisions) {
    if (!DECISION_ID.test(id)) errors.push('Invalid decision ID: ' + id);
    if (decisionIds.has(id)) errors.push('Duplicate research decision: ' + id);
    decisionIds.add(id);
    if (incomplete(description)) errors.push('Missing research conclusion/source: ' + id);
    if (disposition === 'INCLUDE') {
      if (!/^AF-\d{3,}(?:,\s*AF-\d{3,})*$/.test(mapping)) errors.push('Invalid INCLUDE mapping: ' + id);
      const refs = mapping.match(/AF-\d{3,}/g) || [];
      for (const ref of refs) if (!ids.has(ref)) errors.push('Unresolved requirement ' + ref + ' in ' + id);
    } else if (['EXCLUDE', 'DEFER'].includes(disposition)) {
      if (!/^Reason:\s*\S.{5,}$/i.test(mapping) || /<!--|-->/.test(mapping)) errors.push('Missing approved exclusion/deferral rationale: ' + id);
    } else errors.push('Invalid research disposition: ' + id);
  }

  const next = field(body, 'Next requirement');
  const head = field(body, 'Latest inspected HEAD SHA');
  const ci = field(body, 'CI evidence assessed for SHA');
  const nextAction = field(body, 'Next concrete action');
  const blockers = field(body, 'Open blockers');
  const unresolved = requirements.filter(row => VALID_STATES.has(row[3]) && row[3] !== 'VERIFIED').map(row => row[0]);
  if (unresolved.length && !unresolved.includes(next)) errors.push('Resume pointer must identify an unresolved requirement');
  if (!unresolved.length && requirements.length && next !== 'DONE') errors.push('Completed ledger requires Next requirement: DONE');
  if (incomplete(nextAction)) errors.push('Missing concrete next action');
  if (!head || (head !== 'UNKNOWN' && !SHA.test(head))) errors.push('Invalid latest HEAD SHA');
  if (head === 'UNKNOWN' && requirements.some(row => row[3] === 'VERIFIED')) errors.push('VERIFIED cannot use UNKNOWN HEAD');
  if (!ci) errors.push('Missing CI evidence field');
  if (ci && ci !== 'UNRUN' && !/^NOT_REQUIRED:\s*\S.{5,}$/i.test(ci)) {
    const match = ci.match(/\bsha=([0-9a-f]{40})\b/i);
    if (!match) errors.push('CI evidence must name its observed SHA or be UNRUN/NOT_REQUIRED');
    else if (head && match[1].toLowerCase() !== head.toLowerCase()) errors.push('CI evidence is stale relative to HEAD');
  }
  if (incomplete(blockers)) errors.push('Missing blocker field');
  if (requirements.some(row => row[3] === 'BLOCKED') && blockers && blockers.toLowerCase() === 'none') {
    errors.push('BLOCKED requirement must appear in open blockers');
  }
  for (const [id, , , state, , verification] of requirements) {
    if (state === 'VERIFIED') {
      const evidenceSHA = verification.match(/\bsha=([0-9a-f]{40})\b/i);
      if (!evidenceSHA || !head || evidenceSHA[1].toLowerCase() !== head.toLowerCase()) {
        errors.push('VERIFIED evidence must match assessed HEAD: ' + id);
      }
    }
  }

  return { valid: errors.length === 0, diagnostics: errors, requirements: requirements.map(row => ({ id: row[0], state: row[3] })) };
}
