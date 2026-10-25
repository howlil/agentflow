import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');

test('Node runtime is supported by security-patched Astro and Cloudflare docs agree', async () => {
  const version = (await read('.node-version')).trim();
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  assert.ok(match, 'pin Node to an explicit patch release');
  const [, major, minor, patch] = match.map(Number);
  assert.equal(major % 2, 0, 'only supported even Node LTS lines');
  assert.ok(major >= 24 || (major === 22 && (minor > 23 || (minor === 23 && patch >= 4))),
    'Astro 7.4.2 requires >=22.23.4 and October 2026 Node security fixes');
  const guide = await read('src/content/docs/start/deploy-cloudflare.md');
  assert.ok(guide.includes('Node version | `' + version + '`'), 'documented Cloudflare Node pin must match .node-version');
  assert.doesNotMatch(guide, /Node version\s*\|\s*`22\.23\.3`/, 'Cloudflare version table must not recommend the incompatible runtime');
});
