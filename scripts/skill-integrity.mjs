import { readFile, readdir, lstat } from 'node:fs/promises';
import { dirname, join, resolve, relative, isAbsolute } from 'node:path';

// Validate packaging/ownership only. This cannot prove that an agent follows prose.
export async function validateSkillIntegrity(root, names) {
  const known = new Set(names);
  for (const name of names) {
    const skillRoot = resolve(root, 'skills', name);
    const visit = async path => {
      const stat = await lstat(path);
      if (stat.isSymbolicLink()) throw new Error('Skill symlink is not portable: ' + path);
      if (stat.isDirectory()) {
        for (const entry of await readdir(path)) await visit(join(path, entry));
        return;
      }
      if (!path.endsWith('.md')) return;
      const body = await readFile(path, 'utf8');
      for (const [, target] of body.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
        if (/^(?:https?:|#)/.test(target)) continue;
        const dest = resolve(dirname(path), target.split('#')[0]);
        const rel = relative(skillRoot, dest);
        if (rel.startsWith('..') || isAbsolute(rel)) throw new Error('Reference escapes selected skill: ' + target);
        const info = await lstat(dest).catch(() => null);
        if (!info?.isFile() || info.isSymbolicLink()) throw new Error('Missing packaged reference: ' + target);
      }
      for (const [, owner] of body.matchAll(/`([a-z]+(?:-[a-z]+)*(?:-engineering|-design|-thinking|-review|-ops|-protocol|-graph|-output))`/g)) {
        if (!known.has(owner)) throw new Error('Unknown skill owner: ' + owner + ' in ' + path);
      }
    };
    await visit(skillRoot);
  }
}
