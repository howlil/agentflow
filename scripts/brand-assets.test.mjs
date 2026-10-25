import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { composeSocialCard, buildBrandAssets } from './build-brand-assets.mjs';

const root = new URL('../', import.meta.url);
const read = (file) => readFile(new URL(file, root), 'utf8');

test('canonical logo is legible SVG with defined solid backgrounds and routing terminals', async () => {
  const svg = await read('public/favicon.svg');
  assert.match(svg, /viewBox="0 0 64 64"/);
  for (const hex of ['#0C0D10', '#F6F4EF', '#9B8BDE']) {
    assert.ok(svg.includes(hex), 'Missing visual token: ' + hex);
  }
  assert.equal((svg.match(/<circle /g) || []).length, 3);
  assert.doesNotMatch(svg, /<text|<image|gradient|filter|href=/);
});

test('brand social image has one canonical mark; HTML and CSS use the same asset', async () => {
  const mark = await read('public/favicon.svg');
  const template = await read('public/social-card.template.svg');
  const preview = composeSocialCard(template, mark);
  assert.match(preview, /1200" height="630"/);
  assert.match(preview, /Better judgment/);
  assert.match(preview, /THE RIGHT SKILL/);
  assert.equal((preview.match(/<svg\b/g) || []).length, 2);
  assert.equal((preview.match(/<\/svg>/g) || []).length, 2);
  assert.doesNotMatch(preview, /AGENTFLOW_MARK/);
  const header = await read('src/components/landing/LandingHeader.astro');
  assert.match(header, /src="\/favicon.svg"/);
});

test('brand assets build into SVG and a real 1200×630 PNG', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'agentflow-brand-'));
  try {
    await mkdir(join(dir, 'public'), { recursive: true });
    for (const file of ['favicon.svg', 'social-card.template.svg']) {
      await writeFile(join(dir, 'public', file), await read('public/' + file));
    }
    const result = await buildBrandAssets({ outputRoot: dir });
    assert.equal(result.width, 1200);
    assert.equal(result.height, 630);
    assert.ok(result.bytes > 10000);
    assert.equal(await readFile(join(dir, 'src/assets/brand-mark.svg'), 'utf8'),
      await read('public/favicon.svg'));
    const image = await sharp(join(dir, 'public/og.png')).metadata();
    assert.equal(image.format, 'png');
    assert.equal(image.width, 1200);
    assert.equal(image.height, 630);
    assert.ok((await readFile(join(dir, 'public/social-preview.svg'), 'utf8')).includes('Better judgment'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('social metadata uses absolute URL only when production site is configured', async () => {
  const config = await read('astro.config.mjs');
  assert.match(config, /process\.env\.PUBLIC_SITE_URL/);
  assert.match(config, /new URL\('\/og\.png'/);
  assert.match(config, /summary_large_image/);
  const guide = await read('src/content/docs/start/deploy-cloudflare.md');
  assert.match(guide, /PUBLIC_SITE_URL/);
});
