import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateSkillIntegrity } from './skill-integrity.mjs';

async function fixture(t, text) {
  const root = await mkdtemp(join(tmpdir(), 'skill-integrity-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'skills', 'example', 'references'), { recursive: true });
  await writeFile(join(root, 'skills', 'example', 'SKILL.md'), text);
  return root;
}
test('packaged references are resolved without installing sibling skills', async t => {
  const root = await fixture(t, '[Guide](references/topic.md)');
  await writeFile(join(root, 'skills/example/references/topic.md'), '# Local guide');
  await validateSkillIntegrity(root, ['example']);
});
test('missing references and escaping selected-skill references fail packaging', async t => {
  const root = await fixture(t, '[Guide](references/missing.md)');
  await assert.rejects(validateSkillIntegrity(root, ['example']), /Missing packaged/);
  await writeFile(join(root, 'skills/example/SKILL.md'), '[Guide](../other/SKILL.md)');
  await assert.rejects(validateSkillIntegrity(root, ['example']), /escapes selected skill/);
});
test('an absent release owner fails even when its name is valid prose', async t => {
  const root = await fixture(t, '`release-engineering` owns promotion.');
  await assert.rejects(validateSkillIntegrity(root, ['example']), /Unknown skill owner/);
});
