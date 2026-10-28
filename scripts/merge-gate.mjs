import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// GitHub treats skipped job checks as acceptable for branch rules. This check
// must fail closed when required work was skipped, cancelled or failed.
export function mergeGateDiagnostics({ classify, verify, portableRequired, portable }) {
  const errors = [];
  if (classify !== 'success') errors.push('Scope classification must succeed (got ' + classify + ')');
  if (verify !== 'success') errors.push('Required verify job must succeed (got ' + verify + ')');
  if (portableRequired === 'true') {
    if (portable !== 'success') errors.push('Required portable matrix must succeed (got ' + portable + ')');
  } else if (portableRequired === 'false') {
    if (portable !== 'skipped') errors.push('Non-required portable matrix must be skipped (got ' + portable + ')');
  } else {
    errors.push('Invalid portable_required classification: ' + portableRequired);
  }
  return errors;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const diagnostics = mergeGateDiagnostics({
    classify: process.env.CLASSIFY_RESULT || '',
    verify: process.env.VERIFY_RESULT || '',
    portableRequired: process.env.PORTABLE_REQUIRED || '',
    portable: process.env.PORTABLE_RESULT || ''
  });
  if (diagnostics.length) {
    for (const message of diagnostics) console.error('merge-gate: ' + message);
    process.exitCode = 1;
  } else {
    console.log('merge-gate: all required verification jobs completed successfully');
  }
}
