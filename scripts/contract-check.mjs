import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const declaration = /^\s*(?:[-*]\s*)?((?:PF|B|X|P)\d+)(?=\s*[:(|])/;
const reference = /\b(?:PF|B|X|P)\d+\b/g;

function linkedIds(line) {
  // Only the declaration's link clause is authoritative; prose may mention other IDs.
  const clause = line.match(/^\s*(?:[-*]\s*)?(?:PF|P)\d+\s*\(([^)]*)\)/)?.[1] ?? '';
  const refs = new Set(clause.match(reference) ?? []);
  for (const [, kind, first, last] of clause.matchAll(/\b([BX])(\d+)\s*-\s*\1(\d+)\b/g)) {
    const start = Number(first);
    const end = Number(last);
    if (end < start || end - start > 1000) {
      throw new RangeError('Invalid or oversized contract ID range: ' + kind + first + '-' + kind + last);
    }
    for (let n = start; n <= end; n++) refs.add(kind + n);
  }
  return refs;
}

function collect(source, allowed) {
  const declarations = new Map();
  const explicit = new Set();
  const duplicates = [];
  let fenced = false;
  for (const line of source.split(/\r?\n/)) {
    if (/^\s*(?:~{3}|\x60{3})/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;

    const match = line.match(declaration);
    if (match && allowed.has(match[1].replace(/\d+$/, ''))) {
      const id = match[1];
      if (explicit.has(id)) duplicates.push(id);
      explicit.add(id);
      declarations.set(id, linkedIds(line));
    }
    // Product-design permits a path graph instead of individual B# declarations.
    // Repeated nodes in the graph are references, not duplicate declarations.
    if (allowed.has('B')) {
      const path = line.match(/^\s*(?:[-*]\s*)?B\d+(?:\s*(?:→|->)\s*B\d+)+/);
      if (path) {
        for (const id of path[0].match(/\bB\d+\b/g) ?? []) {
          if (!declarations.has(id)) declarations.set(id, new Set());
        }
      }
    }
  }
  return { declarations, duplicates };
}

// Diagnostics only: never treats a Markdown link as executed test evidence.
export function inspectContracts(productMd, engineeringMd) {
  if (typeof productMd !== 'string' || typeof engineeringMd !== 'string') {
    throw new TypeError('Expected product and engineering Markdown');
  }
  const product = collect(productMd, new Set(['B', 'X', 'P']));
  const engineering = collect(engineeringMd, new Set(['PF']));
  const behaviors = [...product.declarations.keys()].filter(id => /^[BX]\d+$/.test(id));
  const proofs = [...product.declarations.entries()].filter(([id]) => /^P\d+$/.test(id));
  const findings = [];
  for (const id of [...product.duplicates, ...engineering.duplicates]) {
    findings.push({ id, code: 'DUPLICATE', detail: 'ID has multiple declarations' });
  }
  for (const [id, refs] of proofs) {
    for (const ref of refs) {
      if (/^[BX]\d+$/.test(ref) && !product.declarations.has(ref)) {
        findings.push({ id, code: 'DANGLING', detail: 'Unknown behavior: ' + ref });
      }
    }
  }
  for (const [id, refs] of engineering.declarations) {
    for (const ref of refs) {
      if (/^P\d+$/.test(ref) && !product.declarations.has(ref)) {
        findings.push({ id, code: 'DANGLING', detail: 'Unknown product proof: ' + ref });
      }
    }
  }
  for (const id of behaviors) {
    if (!proofs.some(([, refs]) => refs.has(id))) {
      findings.push({ id, code: 'MISSING', detail: 'No explicitly linked P# acceptance proof' });
    }
  }
  // A P# is verified by documentation only if it independently links to a PF#.
  // One PF for B1's P1 must not silently cover B1's separate P2.
  for (const [id] of proofs) {
    if (![...engineering.declarations.values()].some(refs => refs.has(id))) {
      findings.push({ id, code: 'UNVERIFIED', detail: 'P# has no linked PF# declaration' });
    }
  }
  const severe = findings.some(f => ['DANGLING', 'DUPLICATE', 'MISSING'].includes(f.code));
  const unknown = !behaviors.length;
  return {
    status: severe ? 'MISSING' : unknown ? 'UNKNOWN' : findings.length ? 'UNVERIFIED' : 'DOCUMENTED',
    behaviorCount: behaviors.length,
    acceptanceCount: proofs.length,
    proofDeclarationCount: engineering.declarations.size,
    findings,
    limitation: 'DOCUMENTED means IDs are linked in Markdown, not that tests ran or behavior is correct.'
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [, , productPath, engineeringPath] = process.argv;
  if (!productPath || !engineeringPath) {
    console.error('Usage: node scripts/contract-check.mjs <product.md> <engineering.md>');
    process.exitCode = 1;
  } else {
    Promise.all([readFile(productPath, 'utf8'), readFile(engineeringPath, 'utf8')])
      .then(([product, engineering]) => console.log(JSON.stringify(inspectContracts(product, engineering), null, 2)))
      .catch(error => { console.error(error.message); process.exitCode = 1; });
  }
}
