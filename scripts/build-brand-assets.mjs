import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import sharp from 'sharp';

const root = fileURLToPath(new URL('..', import.meta.url));
const placeholder = '<!-- AGENTFLOW_MARK -->';

export function composeSocialCard(template, mark) {
  if (template.split(placeholder).length !== 2) {
    throw new Error('Social card must contain exactly one mark placeholder.');
  }
  if (!/^<svg[\s>]/.test(mark.trim()) || !mark.includes('viewBox="0 0 64 64"')) {
    throw new Error('Favicon must be the 64×64 canonical SVG mark.');
  }
  const inset = mark.trim()
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/, '')
    .replace(/^<svg\b[^>]*>/,
      '<svg x="80" y="80" width="80" height="80" viewBox="0 0 64 64" aria-hidden="true">');
  return template.replace(placeholder, inset);
}

export async function buildBrandAssets({ outputRoot = root } = {}) {
  const assetRoot = resolve(outputRoot, 'public');
  const source = await readFile(resolve(assetRoot, 'favicon.svg'), 'utf8');
  const template = await readFile(resolve(assetRoot, 'social-card.template.svg'), 'utf8');
  const svg = composeSocialCard(template, source);
  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
  const metadata = await sharp(png).metadata();
  if (metadata.width !== 1200 || metadata.height !== 630) {
    throw new Error('Social image must be 1200×630 pixels.');
  }

  await mkdir(resolve(outputRoot, 'src/assets'), { recursive: true });
  await writeFile(resolve(outputRoot, 'src/assets/brand-mark.svg'), source);
  await writeFile(resolve(assetRoot, 'social-preview.svg'), svg);
  await writeFile(resolve(assetRoot, 'og.png'), png);
  return { width: metadata.width, height: metadata.height, bytes: png.byteLength };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await buildBrandAssets();
  console.log('Generated Agentflow brand assets:', result);
}
