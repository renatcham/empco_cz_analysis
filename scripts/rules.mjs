#!/usr/bin/env node
// Místní čtení českého rulebooku; bez sítě, modelového API a změn případů.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

export function parseRulebook(text) {
  const headings = [...text.matchAll(/^### ([A-Z]+-\d+) — ([^\r\n]+)$/gm)];
  const result = new Map();
  for (const heading of headings) {
    if (result.has(heading[1])) throw new Error(`Duplicitní pravidlo: ${heading[1]}`);
    const afterHeading = heading.index + heading[0].length;
    const next = text.slice(afterHeading).search(/^#{1,3} /m);
    const end = next < 0 ? text.length : afterHeading + next;
    result.set(heading[1], {
      title: heading[2],
      rulebookLine: text.slice(0, heading.index).split('\n').length,
      rulebookAnchor: heading[1].toLowerCase(),
      rulebookExcerpt: text.slice(heading.index, end)
        .replace(/^<a id="[a-z]+-\d+"><\/a>\r?\n/gm, '').trim()
    });
  }
  return result;
}

export function loadCorpus(root = skillRoot) {
  const catalogPath = path.join(root, 'references/catalog.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const rulebookPath = path.join(root, 'RULEBOOK_CS.md');
  const bytes = fs.readFileSync(rulebookPath);
  if (sha256(bytes) !== catalog.corpus.rulebookSha256) {
    throw new Error('Kontrolní otisk rulebooku nesouhlasí. Katalog nelze považovat za ověřený.');
  }
  const sections = parseRulebook(bytes.toString('utf8'));
  const ids = catalog.rules.map(rule => rule.ruleId);
  if (ids.length !== catalog.corpus.ruleCount || new Set(ids).size !== ids.length || sections.size !== ids.length) {
    throw new Error('Katalog pravidel je neúplný nebo obsahuje duplicity.');
  }
  if (ids.some(id => !sections.has(id))) throw new Error('Katalog neodpovídá oddílům rulebooku.');
  return { catalog, rulebookPath, sections };
}

function metadata(corpus) {
  return {
    workflowVersion: corpus.catalog.version,
    rulesetVersion: corpus.catalog.rulesetVersion,
    assessment: corpus.catalog.assessment,
    cutoff: corpus.catalog.corpus.cutoff,
    rulebookPath: corpus.rulebookPath,
    legalReview: corpus.catalog.review,
    boundary: 'Jediné hodnocení pro cílový režim EmpCo od 27. září 2026 včetně relevantních obecných testů. Statusy karet popisují právní oporu, nikoli alternativní režimy. Pouze místní rulebook, bez externí právní rešerše, odvětvových posudků a doporučení k nápravě. Datum korpusu není ověřením dnešního práva.'
  };
}

export function index(corpus) {
  return [
    `EmpCo ${corpus.catalog.version}; pouze cílový režim od ${corpus.catalog.assessment.targetDate}; stav podkladů ${corpus.catalog.corpus.cutoff}; ${corpus.sections.size} pravidel.`,
    'Statusy označují právní oporu, nikoli alternativní režimy. Před posouzením přečtěte celé relevantní karty včetně použitelných obecných testů.',
    ...corpus.catalog.rules.map(rule => `${rule.ruleId} | ${corpus.sections.get(rule.ruleId).title} | ${rule.primaryLegalStatus} | ${rule.recordKind}`)
  ].join('\n');
}

export function cards(corpus, ids) {
  if (!ids.length) throw new Error('Uveďte identifikátory pravidel, například cards DET-01 CTX-02.');
  const byId = new Map(corpus.catalog.rules.map(rule => [rule.ruleId, rule]));
  const selected = [...new Set(ids)].map(id => {
    if (!byId.has(id)) throw new Error(`Neznámé pravidlo: ${id}`);
    const rule = byId.get(id);
    return { ...rule, ...corpus.sections.get(id) };
  });
  const sourceIds = new Set(selected.flatMap(rule => rule.sourceIds));
  return {
    ...metadata(corpus), rules: selected,
    sources: corpus.catalog.sources.filter(source => sourceIds.has(source.sourceId))
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [command = 'help', ...ids] = process.argv.slice(2);
    if (command === 'help') console.log('Čtení místních pravidel:\nnode scripts/rules.mjs index\nnode scripts/rules.mjs cards ID [ID ...]');
    else if (command === 'index' && !ids.length) console.log(index(loadCorpus()));
    else if (command === 'cards') console.log(JSON.stringify(cards(loadCorpus(), ids), null, 2));
    else throw new Error('Použijte index nebo cards ID [ID ...].');
  } catch (error) {
    console.error(JSON.stringify({ ok: false, error: error.message }));
    process.exitCode = 1;
  }
}
