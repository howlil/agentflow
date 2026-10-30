import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = path => readFile(join(root, path), 'utf8');
const TEMPLATES = '.github/ISSUE_TEMPLATE/';

test('community issue forms cover bug, install, and host compatibility', async () => {
  const forms = ['bug.yml', 'install.yml', 'host-compatibility.yml'];
  for (const file of forms) {
    const body = await read(TEMPLATES + file);
    for (const key of ['name:', 'description:', 'body:', 'validations:']) {
      assert.ok(body.includes(key), file + ' missing ' + key);
    }
    assert.ok((body.match(/type: (input|textarea|dropdown|checkboxes)/g) ?? []).length >= 4, file + ' needs structured fields');
    assert.match(body, /secrets/i, file + ' must warn against posting secrets');
  }
  const bug = await read(TEMPLATES + 'bug.yml');
  assert.match(bug, /SECURITY\.md/, 'bug form must redirect security reports');
  const install = await read(TEMPLATES + 'install.yml');
  assert.match(install, /list -g/, 'install form must ask for installed skill names');
  const host = await read(TEMPLATES + 'host-compatibility.yml');
  assert.match(host, /cross-agent-compatibility/, 'host form must link the compatibility guide');
});

test('issue chooser disables blank issues and links the real guides', async () => {
  const config = await read(TEMPLATES + 'config.yml');
  assert.match(config, /blank_issues_enabled: false/);
  for (const link of ['/security/policy', 'start/install.md', 'start/upgrade-and-migration.md', 'SUPPORT.md']) {
    assert.ok(config.includes(link), 'issue chooser missing ' + link);
  }
  const support = await read('SUPPORT.md');
  for (const form of ['Bug report', 'Installation or upgrade problem', 'Host compatibility']) {
    assert.ok(support.includes(form), 'SUPPORT.md must name the form: ' + form);
  }
  assert.ok(support.includes('upgrade-and-migration'), 'SUPPORT.md must link the upgrade guide');
});
