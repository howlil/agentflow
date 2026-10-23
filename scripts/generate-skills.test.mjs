import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { generateSkills, parseFrontmatter } from './generate-skills.mjs';

const source = (name, description = 'A skill: with a colon.') =>
  `---\nname: ${name}\ndescription: ${JSON.stringify(description)}\n---\n\n# Title\n\nRuntime behavior.\n`;

test('parses canonical scalar metadata without losing colons', () => {
  const parsed = parseFrontmatter(source('example'), 'example');
  assert.equal(parsed.name, 'example');
  assert.equal(parsed.description, 'A skill: with a colon.');
  assert.match(parsed.body, /Runtime behavior/);
});

test('handles quoted scalar values and CRLF', () => {
  const parsed = parseFrontmatter(
    '---\r\nname: example\r\ndescription: "Can: work"\r\n---\r\n# Title',
    'example',
  );
  assert.equal(parsed.description, 'Can: work');
});

test('rejects duplicate keys and unsupported multiline values', () => {
  assert.throws(
    () => parseFrontmatter('---\nname: a\nname: b\ndescription: hello\n---\n', 'x'),
    /Duplicate frontmatter key/,
  );
  assert.throws(
    () => parseFrontmatter('---\nname: a\ndescription: >\n  unexpected\n---\n', 'x'),
    /Unsupported frontmatter field/,
  );
});

async function withFixture(run) {
  const root = await mkdtemp(join(tmpdir(), 'agentflow-skills-'));
  const skillDir = join(root, 'skills', 'example');
  const guideDir = join(root, 'src', 'content', 'docs', 'skills');
  await mkdir(skillDir, { recursive: true });
  await mkdir(guideDir, { recursive: true });
  await writeFile(join(skillDir, 'SKILL.md'), source('example'));
  await writeFile(join(guideDir, 'example.md'), '---\ntitle: Example\n---\n\n[Runtime](/reference/example/)\n');
  try {
    await run(root, skillDir);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test('generates one manifest entry and a faithful runtime reference', async () => {
  await withFixture(async (root) => {
    assert.equal(await generateSkills({ root, expected: ['example'] }), 1);
    const manifest = JSON.parse(await readFile(join(root, 'src/generated/skills.json'), 'utf8'));
    assert.deepEqual(manifest.map(({ name }) => name), ['example']);
    assert.equal(manifest[0].referencePath, '/reference/example/');
    const reference = await readFile(join(root, 'src/content/docs/reference/example.md'), 'utf8');
    assert.match(reference, /Runtime behavior/);
    assert.doesNotMatch(reference, /# Title/);
  });
});

test('invalid skill input cannot erase the last successful generation', async () => {
  await withFixture(async (root, skillDir) => {
    await generateSkills({ root, expected: ['example'] });
    const path = join(root, 'src/generated/skills.json');
    const before = await readFile(path, 'utf8');

    await writeFile(join(skillDir, 'SKILL.md'), source('wrong-name'));
    await assert.rejects(generateSkills({ root, expected: ['example'] }), /Directory\/frontmatter mismatch/);
    assert.equal(await readFile(path, 'utf8'), before);
  });
});

test('rejects unexpected skill directories', async () => {
  await withFixture(async (root) => {
    await mkdir(join(root, 'skills', 'surprise'), { recursive: true });
    await assert.rejects(generateSkills({ root, expected: ['example'] }), /Unexpected skills/);
  });
});

test('requires each human guide to link to its canonical reference', async () => {
  await withFixture(async (root) => {
    await writeFile(join(root, 'src/content/docs/skills/example.md'), '---\\ntitle: Example\\n---\\n');
    await assert.rejects(generateSkills({ root, expected: ['example'] }), /lacks runtime reference link/);
  });
});

test('enforces Agent Skills name, description, and compatibility constraints', () => {
  for (const name of ['Bad', '-bad', 'bad-', 'bad--name', 'bad_name', 'a'.repeat(65)]) {
    assert.throws(() => parseFrontmatter(source(name), 'invalid.md'), /Invalid Agent Skills name/);
  }
  assert.doesNotThrow(() => parseFrontmatter(source('a'.repeat(64)), 'valid.md'));
  assert.throws(
    () => parseFrontmatter(source('valid', 'x'.repeat(1025)), 'invalid.md'),
    /description exceeds 1024/,
  );
  assert.doesNotThrow(() => parseFrontmatter(source('valid', 'x'.repeat(1024)), 'valid.md'));
  assert.throws(
    () => parseFrontmatter('---\nname: valid\ndescription: hi\ncompatibility: ' +
      'x'.repeat(501) + '\n---\nRuntime behavior.', 'invalid.md'),
    /compatibility exceeds 500/,
  );
});

test('rejects empty instructions instead of publishing blank skill packages', () => {
  assert.throws(
    () => parseFrontmatter('---\nname: valid\ndescription: hi\n---\n  ', 'invalid.md'),
    /Missing skill instructions/,
  );
});

test('rejects unquoted YAML special scalars before external installers silently skip skills', () => {
  assert.throws(
    () => parseFrontmatter('---\nname: example\ndescription: Choose tests: unit or E2E\n---\nBody', 'bad.md'),
    /Quote YAML-special/,
  );
  assert.throws(
    () => parseFrontmatter('---\nname: example\ndescription: Use tests # opinion\n---\nBody', 'bad.md'),
    /Quote YAML-special/,
  );
});
