import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const declaration = /^\s*(?:[-*]\s*)?((?:PF|B|X|P)\d+)(?=\s*[:(|])/;
const reference = /\b(?:PF|B|X|P)\d+\b/g;

function collect(source, allowed) {
  const declarations = new Map();
  const duplicates = [];
  let fenced = false;
  for (const line of source.split(/\r?\n/)) {
    if (/^\s*(?:~{3}|\x60{3})/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const match = line.match(declaration);
    if (!match || !allowed.has(match[1].replace(/\d+$/, ''))) continue;
    const id = match[1];
    if (declarations.has(id)) {
      duplicates.push(id);
      continue;
    }
    declarations.set(id, new Set((line.slice(match[0].length).match(reference) ?? []).filter(ref => ref !== id)));
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
    const linkedPs = proofs.filter(([, refs]) => refs.has(id)).map(([proof]) => proof);
    if (!linkedPs.length) {
      findings.push({ id, code: 'MISSING', detail: 'No explicitly linked P# acceptance proof' });
      continue;
    }
    const linkedPf = [...engineering.declarations.values()].some(refs => linkedPs.some(proof => refs.has(proof)));
    if (!linkedPf) {
      findings.push({ id, code: 'UNVERIFIED', detail: 'P# is documented but has no linked PF# declaration' });
    }
  }
  const incomplete = !behaviors.length || !proofs.length;
  const severe = findings.some(f => ['DANGLING', 'DUPLICATE', 'MISSING'].includes(f.code));
  return {
    status: incomplete ? 'UNKNOWN' : severe ? 'MISSING' : findings.length ? 'UNVERIFIED' : 'DOCUMENTED',
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
