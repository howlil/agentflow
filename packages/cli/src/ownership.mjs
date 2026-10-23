import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const CANONICAL_SOURCE = 'howlil/agentflow';

export function isAgentflowSource(entry) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return false;
  const values = [entry.source, entry.sourceUrl].filter(value => typeof value === 'string');
  return values.some(value => {
    if (value === CANONICAL_SOURCE) return true;
    try {
      const url = new URL(value);
      const path = url.pathname.replace(/\/+$/, '').replace(/\.git$/, '').toLowerCase();
      return url.hostname.toLowerCase() === 'github.com' &&
        url.protocol === 'https:' && path === '/' + CANONICAL_SOURCE;
    } catch {
      return false;
    }
  });
}

export function getLockPath({ cwd, global, env = process.env, home = homedir() }) {
  if (!global) return join(cwd, 'skills-lock.json');
  const stateHome = env.XDG_STATE_HOME;
  return stateHome ? join(stateHome, 'skills', '.skill-lock.json') :
    join(home, '.agents', '.skill-lock.json');
}

export async function readInstalledSkills(options, io = { readFile }) {
  const file = getLockPath(options);
  let content;
  try {
    content = await io.readFile(file, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') return { found: false, skills: new Map(), path: file };
    throw new Error('Cannot inspect upstream skill lock at ' + file + ': ' + error.message);
  }
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('Cannot safely mutate skills: invalid JSON in ' + file);
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) ||
      !parsed.skills || typeof parsed.skills !== 'object' || Array.isArray(parsed.skills)) {
    throw new Error('Cannot safely mutate skills: unsupported upstream lock format at ' + file);
  }
  const entries = Object.entries(parsed.skills);
  if (entries.some(([name, entry]) => !name || !entry || typeof entry !== 'object' || Array.isArray(entry))) {
    throw new Error('Cannot safely mutate skills: invalid entry in ' + file);
  }
  return { found: true, skills: new Map(entries), path: file };
}

export async function verifySkillOwnership({
  cwd, global = false, command, skills = [], env, home, io,
}) {
  if (!['install', 'update', 'uninstall'].includes(command)) return [];
  const { found, skills: installed, path } = await readInstalledSkills({
    cwd, global, env, home,
  }, io);
  if (command === 'install') {
    // Interactive installs (with no skills named) defer selection to upstream.
    // Non-interactive installs must select names so collisions can be checked.
    for (const name of skills) {
      const entry = installed.get(name);
      if (entry && !isAgentflowSource(entry)) {
        throw new Error('Refusing install: ' + name + ' belongs to another source in ' + path);
      }
    }
    return skills;
  }

  // No lock => do not guess at source ownership for a destructive operation.
  if (!found) throw new Error('No upstream lock at ' + path +
    '. Cannot verify installed skill ownership; no changes made.');

  const selected = skills.length ? skills : [...installed]
    .filter(([, entry]) => isAgentflowSource(entry))
    .map(([name]) => name);

  if (selected.length === 0) {
    throw new Error('No Agentflow-owned installed skills found in ' + path + '; no changes made.');
  }
  for (const name of selected) {
    const entry = installed.get(name);
    if (!entry) throw new Error('Skill ' + name + ' not present in ' + path + '; no changes made.');
    if (!isAgentflowSource(entry)) {
      throw new Error('Refusing ' + command + ': ' + name + ' belongs to another source in ' + path);
    }
  }
  return selected;
}
