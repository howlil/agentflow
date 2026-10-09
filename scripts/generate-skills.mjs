import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const EXPECTED = [
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

// The canonical skill contract uses flat, single-line YAML scalars only.
// Reject unsupported syntax rather than silently generating incorrect metadata.
export function parseFrontmatter(source, file) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error(`Missing YAML frontmatter: ${file}`);

  const fields = Object.create(null);
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const property = line.match(/^([a-z][a-z0-9-]*):\s*(.*?)\s*$/);
    if (!property || !property[2]) {
      throw new Error(`Unsupported frontmatter field in ${file}: ${line}`);
    }
    const [, key, raw] = property;
    if (Object.hasOwn(fields, key)) throw new Error(`Duplicate frontmatter key "${key}": ${file}`);

    let value = raw;
    if (raw.startsWith('"')) {
      try {
        value = JSON.parse(raw);
      } catch {
        throw new Error(`Invalid quoted frontmatter value for "${key}": ${file}`);
      }
    } else if (raw.startsWith("'")) {
      if (!raw.endsWith("'") || raw.length < 2) {
        throw new Error(`Invalid quoted frontmatter value for "${key}": ${file}`);
      }
      value = raw.slice(1, -1).replaceAll("''", "'");
    }
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error(`Empty frontmatter value for "${key}": ${file}`);
    }
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

export async function generateSkills({ root = process.cwd(), expected = EXPECTED } = {}) {
  const skillsDir = join(root, 'skills');
  const generatedDir = join(root, 'src', 'generated');
  const referenceDir = join(root, 'src', 'content', 'docs', 'reference');
  const guidesDir = join(root, 'src', 'content', 'docs', 'skills');

  const directories = (await readdir(skillsDir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const missing = expected.filter((name) => !directories.includes(name));
  const unexpected = directories.filter((name) => !expected.includes(name));
  if (missing.length || unexpected.length) {
    throw new Error(
      [
        missing.length ? `Missing skills: ${missing.join(', ')}` : '',
        unexpected.length ? `Unexpected skills: ${unexpected.join(', ')}` : '',
      ].filter(Boolean).join('\n'),
    );
  }

  // Validate the entire input set before removing any existing generated files.
  const outputs = await Promise.all(expected.map(async (directory) => {
    const file = join(skillsDir, directory, 'SKILL.md');
    const skill = parseFrontmatter(await readFile(file, 'utf8'), file);
    if (skill.name !== directory) {
      throw new Error(
        `Directory/frontmatter mismatch: ${relative(root, file)} declares "${skill.name}"`,
      );
    }
    await readFile(join(guidesDir, `${directory}.md`), 'utf8');

    const sourcePath = `skills/${directory}/SKILL.md`;
    const referencePath = `/reference/${directory}/`;
    return {
      metadata: { name: skill.name, description: skill.description, sourcePath, referencePath },
      reference: `---
title: ${JSON.stringify(skill.name)}
description: ${JSON.stringify(skill.description)}
editUrl: false
---

> Generated at build time from [\`${sourcePath}\`](https://github.com/howlil/agentflow/blob/master/${sourcePath}). Do not edit this page directly.

${stripLeadingTitle(skill.body)}
`,
      directory,
    };
  }));

  await mkdir(generatedDir, { recursive: true });
  await rm(referenceDir, { recursive: true, force: true });
  await mkdir(referenceDir, { recursive: true });

  await Promise.all(outputs.map(({ directory, reference }) =>
    writeFile(join(referenceDir, `${directory}.md`), reference)
  ));
  await writeFile(
    join(generatedDir, 'skills.json'),
    JSON.stringify(outputs.map(({ metadata }) => metadata), null, 2) + '\n',
  );

  return outputs.length;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const count = await generateSkills();
  console.log(`Generated manifest and ${count} runtime reference pages.`);
}
