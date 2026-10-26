import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { EXPECTED } from './generate-skills.mjs';

const root = new URL('../', import.meta.url);
const read = file => readFile(new URL(file, root), 'utf8');
const json = async file => JSON.parse(await read(file));

test('website catalog derives the router and ten specialists from canonical metadata', async () => {
  assert.equal(EXPECTED.length, 11);
  const grid = await read('src/components/SkillGrid.astro');
  assert.match(grid, /skills\.map\(/);
  assert.match(grid, /card\.skill === 'agentflow'/);
  assert.match(grid, /card\.skill !== 'agentflow'/);
  assert.match(grid, /<SkillCard \{\.\.\.router\} featured\s*\/>/);
  assert.match(grid, /<SkillCard \{\.\.\.skill\} \/>/);
  const card = await read('src/components/SkillCard.astro');
  assert.match(card, /featured \? 'Router' : 'Specialist'/);
  assert.match(card, /focus-visible/);
  assert.match(card, /prefers-reduced-motion/);
  assert.doesNotMatch(card, /shadow-|text-blue-|bg-slate-|border-slate-/);
});

test('plugin and marketplace metadata use the same product messaging', async () => {
  const plugin = await json('plugin.json');
  const claude = await json('.claude-plugin/plugin.json');
  const codex = await json('.codex-plugin/plugin.json');
  const claudeMarket = await json('.claude-plugin/marketplace.json');
  const codexMarket = await json('.agents/plugins/marketplace.json');
  const copy = 'Better judgment for AI agents. One decision router and ten portable engineering specialist skills.';
  for(const description of [plugin.description, claude.description, codex.description,
    claudeMarket.description, claudeMarket.plugins[0].description]) {
    assert.equal(description, copy);
  }
  assert.equal(plugin.name, 'agentflow');
  assert.equal(claude.name, 'agentflow');
  assert.equal(codex.name, 'agentflow');
  assert.equal(codex.interface.displayName, 'Agentflow');
  assert.equal(claudeMarket.name, 'agentflow');
  assert.equal(codexMarket.name, 'agentflow');
  assert.equal(codexMarket.interface.displayName, 'Agentflow');
  assert.deepEqual(plugin.keywords, claude.keywords);
  assert.equal(codexMarket.plugins[0].policy.installation, 'AVAILABLE');
  assert.equal(codexMarket.plugins[0].source.path, './');
});

test('responsive header retains named routes and accessible GitHub link', async () => {
  const header = await read('src/components/landing/LandingHeader.astro');
  assert.match(header, /class="install-link" href="\/start\/distribution\/"/);
  assert.match(header, /class="explore-link" href="\/start\/choose-a-skill\/"/);
  assert.match(header, /aria-label="Agentflow GitHub repository/);
  assert.match(header, /nav \.github-label/);
  assert.doesNotMatch(header, /nav a span \{[\s\S]{0,60}display: none/);
});
