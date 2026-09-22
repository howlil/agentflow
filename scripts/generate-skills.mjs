import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SKILLS_DIR = join(ROOT, 'skills');
const GENERATED_DIR = join(ROOT, 'src', 'generated');
const REFERENCE_DIR = join(ROOT, 'src', 'content', 'docs', 'reference');

const EXPECTED = [
  'product-design',
  'engineering-design',
  'design-graph',
  'design-thinking',
  'test-engineering',
  'production-ops',
  'code-review',
  'security-review',
  'graph-protocol',
  'call-graph-output',
];

function parseFrontmatter(source, file) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) throw new Error(`Missing YAML frontmatter: ${file}`);

  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(':');
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    fields[key] = value;
  }

  if (!fields.name || !fields.description) {
    throw new Error(`Skill must define name and description: ${file}`);
  }

  return {
    name: fields.name,
    description: fields.description,
    body: source.slice(match[0].length),
  };
}

function stripLeadingTitle(body) {
  return body.replace(/^#\s+[^\n]+\r?\n+/, '');
}

await mkdir(GENERATED_DIR, { recursive: true });
await rm(REFERENCE_DIR, { recursive: true, force: true });
await mkdir(REFERENCE_DIR, { recursive: true });

const directories = (await readdir(SKILLS_DIR, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const missing = EXPECTED.filter((name) => !directories.includes(name));
const unexpected = directories.filter((name) => !EXPECTED.includes(name));

if (missing.length || unexpected.length) {
  throw new Error(
    [
      missing.length ? `Missing skills: ${missing.join(', ')}` : '',
      unexpected.length ? `Unexpected skills: ${unexpected.join(', ')}` : '',
    ].filter(Boolean).join('\n'),
  );
}

const manifest = [];

for (const directory of EXPECTED) {
  const file = join(SKILLS_DIR, directory, 'SKILL.md');
  const source = await readFile(file, 'utf8');
  const skill = parseFrontmatter(source, file);

  if (skill.name !== directory) {
    throw new Error(
      `Directory/frontmatter mismatch: ${relative(ROOT, file)} declares "${skill.name}"`,
    );
  }

  const sourcePath = `skills/${directory}/SKILL.md`;
  const referencePath = `/reference/${directory}/`;

  manifest.push({
    name: skill.name,
    description: skill.description,
    sourcePath,
    referencePath,
  });

  const reference = `---
title: ${JSON.stringify(skill.name)}
description: ${JSON.stringify(skill.description)}
editUrl: false
---

> Generated at build time from [\`${sourcePath}\`](https://github.com/howlil/agentflow/blob/master/${sourcePath}). Do not edit this page directly.

${stripLeadingTitle(skill.body)}
`;

  await writeFile(join(REFERENCE_DIR, `${directory}.md`), reference);
}

await writeFile(
  join(GENERATED_DIR, 'skills.json'),
  JSON.stringify(manifest, null, 2) + '\n',
);

console.log(`Generated manifest and ${manifest.length} runtime reference pages.`);
