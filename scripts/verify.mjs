#!/usr/bin/env node
// Údržbová kontrola instalace; nespouští se při běžné analýze komunikace.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { loadCorpus, cards, index, sha256, skillRoot } from './rules.mjs';

const textFiles = [
  '.gitattributes', '.gitignore', 'LICENSE', 'README.md', 'SKILL.md', 'RULEBOOK_CS.md',
  'agents/openai.yaml', 'references/workflow.md', 'references/assessment.md',
  'references/client-report.md', 'references/catalog.json',
  'scripts/rules.mjs', 'scripts/verify.mjs'
];

function inventory(folder, prefix = '') {
  return fs.readdirSync(folder, { withFileTypes: true }).flatMap(entry => {
    if (entry.name === '.git') return [];
    assert.ok(!entry.isSymbolicLink(), `Symbolický odkaz nepatří do balíčku: ${entry.name}`);
    const relative = prefix + entry.name;
    return entry.isDirectory() ? inventory(path.join(folder, entry.name), relative + '/') : [relative];
  });
}

try {
  const corpus = loadCorpus();
  assert.equal(corpus.catalog.rules.length, 80, 'Očekáváno 80 pravidel.');
  const sourcePaths = corpus.catalog.sources.map(source => source.file);
  assert.equal(new Set(sourcePaths).size, sourcePaths.length, 'Duplicitní příloha.');
  for (const source of corpus.catalog.sources) {
    assert.match(source.file, /^sources\/[A-Za-z0-9_.-]+\.(pdf|docx)$/);
    assert.equal(sha256(fs.readFileSync(path.join(skillRoot, source.file))), source.sha256, `Změněný zdroj: ${source.sourceId}`);
  }
  const expected = [...textFiles, ...sourcePaths].sort();
  const actual = inventory(skillRoot).filter(name => name !== 'MANIFEST.json').sort();
  assert.deepEqual(actual, expected, 'Balíček obsahuje neočekávané soubory nebo některé chybí.');
  for (const name of textFiles) {
    const text = fs.readFileSync(path.join(skillRoot, name), 'utf8');
    assert.ok(!/[\u0400-\u052f]/u.test(text), `Nepřípustné jazykové znaky: ${name}`);
    assert.ok(!/[A-Z]:[\\/](?:Users|Documents)[\\/]/i.test(text), `Osobní absolutní cesta: ${name}`);
    if (name.endsWith('.md')) {
      for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
        const target = match[1].replace(/^<|>$/g, '');
        if (/^https?:\/\//.test(target)) continue;
        const [file, anchor] = target.split('#');
        const resolved = path.resolve(path.dirname(path.join(skillRoot, name)), file || path.basename(name));
        assert.ok(fs.existsSync(resolved), `Nefunkční odkaz v ${name}: ${target}`);
        if (anchor && file.endsWith('RULEBOOK_CS.md')) {
          assert.ok(fs.readFileSync(resolved, 'utf8').includes(`id="${anchor}"`), `Chybějící kotva: ${target}`);
        }
      }
    }
  }
  const skill = fs.readFileSync(path.join(skillRoot, 'SKILL.md'), 'utf8');
  const matter = skill.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(matter, 'Chybí metadata skillu.');
  assert.match(matter[1], /^name: empco-cz-analysis$/m);
  assert.match(matter[1], /^description: .{20,1024}$/m);
  assert.ok(!/\[TODO:/u.test(skill), 'Nedokončená šablona.');
  const ui = fs.readFileSync(path.join(skillRoot, 'agents/openai.yaml'), 'utf8');
  assert.ok(ui.includes('$empco-cz-analysis') && ui.includes('allow_implicit_invocation: false'));
  const ids = corpus.catalog.rules.map(rule => rule.ruleId);
  const all = cards(corpus, ids);
  assert.equal(index(corpus).split('\n').length, 82);
  const validSources = new Set(corpus.catalog.sources.map(source => source.sourceId));
  for (const rule of all.rules) {
    assert.ok(rule.rulebookLine > 0 && rule.rulebookExcerpt.startsWith(`### ${rule.ruleId} — `));
    assert.ok(rule.sourceIds.every(id => validSources.has(id)), `Neznámý zdroj u ${rule.ruleId}`);
    assert.ok(rule.legalStatuses.includes(rule.primaryLegalStatus));
    for (const verdict of rule.permittedVerdicts) assert.ok(rule.riskMapping[verdict]);
  }
  assert.throws(() => cards(corpus, []), /identifikátory/);
  assert.throws(() => cards(corpus, ['NEEXISTUJE-99']), /Neznámé/);
  assert.equal(cards(corpus, ['BL-01', 'BL-01']).rules.length, 1);
  const manifest = Object.fromEntries(expected.map(name => [name, sha256(fs.readFileSync(path.join(skillRoot, name)))]));
  if (process.argv.includes('--write-manifest')) {
    fs.writeFileSync(path.join(skillRoot, 'MANIFEST.json'), JSON.stringify(manifest, null, 2) + '\n');
  } else {
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(skillRoot, 'MANIFEST.json'), 'utf8')), manifest, 'Kontrolní soupis nesouhlasí.');
  }
  console.log(JSON.stringify({ ok: true, version: corpus.catalog.version, rules: all.rules.length, sources: sourcePaths.length, files: expected.length + 1, message: 'Struktura, karty, místní odkazy a kontrolní otisky souhlasí.' }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ ok: false, error: error.message }));
  process.exitCode = 1;
}
