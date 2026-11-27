#!/usr/bin/env node
// Builds a 5-question quiz for every FHIR R4 resource and writes them to
// public/data/quiz/<Resource>.json. Questions are generated from:
//   - the official R4 StructureDefinitions (cardinality, modifiers, types)
//   - lib/resources.js (definitions, categories, sub-groups)
//   - lib/resourcetips.js (look-alike resources) and lib/studycards.js (scenarios)
//
// Usage:
//   curl -s -o /tmp/defs.zip https://hl7.org/fhir/R4/definitions.json.zip
//   unzip -o /tmp/defs.zip profiles-resources.json -d /tmp
//   node tools/build_resource_quizzes.mjs /tmp/profiles-resources.json
//
// In every generated question the correct option is listed first; the site
// shuffles the options when it shows them.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RESOURCES, RESOURCE_CATEGORIES } from '../lib/resources.js';
import { RESOURCE_TIPS } from '../lib/resourcetips.js';
import { SCENARIO_CARDS } from '../lib/studycards.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public', 'data', 'quiz');
const INHERITED = new Set(['id', 'meta', 'implicitRules', 'language', 'text', 'contained', 'extension', 'modifierExtension']);
const TYPE_POOL = ['string', 'boolean', 'dateTime', 'CodeableConcept', 'Identifier', 'code', 'Period', 'Quantity',
  'uri', 'markdown', 'integer', 'Annotation', 'Coding', 'Attachment', 'decimal', 'date', 'canonical', 'instant', 'positiveInt'];

// ---------- helpers ----------
function seeded(name) {
  let h = 2166136261;
  for (const ch of name) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h += 0x6D2B79F5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (rnd, list) => list[Math.floor(rnd() * list.length)];
function sample(rnd, list, n) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, n);
}
const unique = (list) => [...new Set(list)];
function firstSentence(text) {
  const m = text.match(/^(.+?[.!?])(\s|$)/);
  let s = (m ? m[1] : text).trim();
  if (s.length > 230) s = s.slice(0, 227).replace(/\s+\S*$/, '') + '…';
  return s;
}
function mask(text, name) {
  const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let t = text.replace(new RegExp(`\\b(The|A|An|This)\\s+${esc(name)}\\s+(resource|resource instance)\\b`, 'g'), 'This resource');
  t = t.replace(new RegExp(`\\b${esc(name)}\\b`, 'g'), 'this resource');
  const spaced = name.replace(/([a-z])([A-Z])/g, '$1 $2');
  // Also hide the name written as words ("Care Team"), but only capitalised,
  // so ordinary words such as "imaging study" stay readable.
  if (spaced !== name) t = t.replace(new RegExp(`\\b${esc(spaced)}\\b`, 'g'), 'this resource');
  t = t.replace(/this resource resource/gi, 'this resource')
    .replace(/\b(the|a|an) this resource/gi, (m, art) => (art[0] === art[0].toUpperCase() ? 'This resource' : 'this resource'))
    .replace(/(^|[.!?]\s+)this resource/g, (m, p) => `${p}This resource`);
  return t;
}
// Some R4 definitions are placeholders ("Todo.") or too short to quiz on.
const usableDefinition = (r) => r.description.length >= 25 && !/^todo/i.test(r.description.trim());
const card = (e) => `${e.min}..${e.max}`;
const code = (x) => '`' + x + '`';

// ---------- load the StructureDefinitions ----------
const bundle = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const facts = {};
for (const { resource: sd } of bundle.entry) {
  if (sd.resourceType !== 'StructureDefinition' || sd.kind !== 'resource' || sd.abstract || sd.derivation !== 'specialization') continue;
  const elements = sd.snapshot.element
    .filter((e) => e.path.split('.').length === 2)
    .map((e) => {
      const name = e.path.split('.')[1];
      const types = (e.type || []).map((t) => t.code);
      const targets = (e.type || []).flatMap((t) => (t.targetProfile || []).map((p) => p.split('/').pop()));
      return { name, min: e.min, max: e.max, modifier: !!e.isModifier, summary: !!e.isSummary, types, targets, short: e.short || '',
        binding: e.binding ? e.binding.strength : null };
    })
    .filter((e) => !INHERITED.has(e.name));
  facts[sd.type] = elements;
}

const byName = new Map(RESOURCES.map((r) => [r.name, r]));
const catTitle = (id) => RESOURCE_CATEGORIES.find((c) => c.id === id).title;
const groupDesc = new Map(RESOURCE_CATEGORIES.flatMap((c) => c.groups.map((g) => [`${c.id}|${g.title}`, g.description])));
const sameGroup = (r) => RESOURCES.filter((x) => x.name !== r.name && x.category === r.category && x.group === r.group);
const sameCategory = (r) => RESOURCES.filter((x) => x.name !== r.name && x.category === r.category);
function neighbours(rnd, r, n, exclude = []) {
  const skip = new Set([r.name, ...exclude]);
  const pool = [...sample(rnd, sameGroup(r), 50), ...sample(rnd, sameCategory(r), 200), ...sample(rnd, RESOURCES, 300)]
    .filter((x) => !skip.has(x.name));
  return unique(pool.map((x) => x.name)).slice(0, n).map((n2) => byName.get(n2));
}
function typeLabel(e) {
  if (e.types.length === 1 && e.types[0] === 'Reference' && e.targets.length) return `Reference(${e.targets.join(' | ')})`;
  if (e.types.length === 1 && e.types[0] === 'canonical' && e.targets.length) return `canonical(${e.targets.join(' | ')})`;
  return e.types.join(' | ');
}

// ---------- question builders ----------
function qPurpose(rnd, r) {
  if (!usableDefinition(r)) return null;
  const mine = mask(firstSentence(r.description), r.name);
  const seen = new Set([mine]);
  const others = [];
  for (const x of neighbours(rnd, r, 60)) {
    if (!usableDefinition(x)) continue;
    const d = mask(firstSentence(x.description), x.name);
    if (seen.has(d) || d.slice(0, 60) === mine.slice(0, 60)) continue;
    seen.add(d);
    others.push(x);
    if (others.length === 3) break;
  }
  if (others.length < 3) return null;
  return {
    kind: 'purpose',
    question: `Which description fits the **${r.name}** resource?`,
    options: [r, ...others].map((x) => mask(firstSentence(x.description), x.name)),
    explanation: `**${r.name}**: ${r.description} The other descriptions belong to ${others.map((x) => `**${x.name}**`).join(', ')}.`,
  };
}

function qUse(rnd, r) {
  const cards = SCENARIO_CARDS.filter((c) => c.resource === r.name);
  const tip = RESOURCE_TIPS[r.name];
  const lookalikes = tip ? tip.vs.flatMap(([n]) => n.split(' / ')).filter((n) => byName.has(n) && n !== r.name) : [];
  const fill = neighbours(rnd, r, 3, lookalikes).map((x) => x.name);
  const options = unique([r.name, ...lookalikes, ...fill]).slice(0, 4);
  if (cards.length) {
    const c = pick(rnd, cards);
    return {
      kind: 'scenario',
      question: `Which resource would you use? ${c.scenario}`,
      options,
      explanation: `**${r.name}**. ${c.note}`,
    };
  }
  if (!usableDefinition(r)) return null;
  return {
    kind: 'definition',
    question: `Which resource matches this definition from the specification? “${mask(firstSentence(r.description), r.name)}”`,
    options,
    explanation: `This is the definition of **${r.name}** (${catTitle(r.category)} › ${r.group}).`,
  };
}

function qLookalike(rnd, r) {
  const tip = RESOURCE_TIPS[r.name];
  const vs = tip ? tip.vs.filter(([n]) => !n.includes(' / ') && byName.has(n)) : [];
  if (vs.length) {
    const [other, why] = pick(rnd, vs);
    const o = byName.get(other);
    const fill = neighbours(rnd, o, 4, [r.name]).map((x) => x.name).filter((n) => n !== other).slice(0, 2);
    return {
      kind: 'lookalike',
      question: `You know **${r.name}**. Which resource should you use instead when you need “${why}”?`,
      options: [other, r.name, ...fill],
      explanation: `**${other}**: ${why}. **${r.name}** is for something else: ${firstSentence(r.description)}`,
    };
  }
  return qGroup(rnd, r);
}

function qRequired(rnd, r, els) {
  const required = els.filter((e) => e.min >= 1);
  const optional = els.filter((e) => e.min === 0);
  if (optional.length < 3) return null;
  const list = required.map((e) => `${code(e.name)} (${card(e)})`).join(', ');
  if (required.length) {
    const c = pick(rnd, required);
    return {
      kind: 'required',
      question: `Which element is **required** (minimum cardinality 1) in every **${r.name}** instance?`,
      options: [c.name, ...sample(rnd, optional, 3).map((e) => e.name)].map(code),
      explanation: `The required top-level elements of ${r.name} are ${list}. ${sample(rnd, optional, 3).length ? 'The other options have a minimum cardinality of 0, so they are optional.' : ''}`,
    };
  }
  return {
    kind: 'required-none',
    question: `Which statement about required elements in **${r.name}** is true?`,
    options: ['No top-level element is required: every element has a minimum cardinality of 0',
      ...sample(rnd, optional, 3).map((e) => `${code(e.name)} is required in every instance`)],
    explanation: `Every top-level element of ${r.name} is optional (\`0..1\` or \`0..*\`) in the base resource. Profiles can make elements required for a particular use.`,
  };
}

function qStructure(rnd, r, els) {
  const mods = els.filter((e) => e.modifier);
  const nonMods = els.filter((e) => !e.modifier);
  if (mods.length && nonMods.length >= 3) {
    const c = pick(rnd, mods);
    return {
      kind: 'modifier',
      question: `Which element of **${r.name}** is a **modifier** (?!), so receiving systems must not ignore it?`,
      options: [c.name, ...sample(rnd, nonMods, 3).map((e) => e.name)].map(code),
      explanation: `Modifier elements of ${r.name}: ${mods.map((e) => code(e.name)).join(', ')}. ${code(c.name)}: ${c.short}. ${c.name === 'status' ? 'A modifier can change the meaning of the whole resource: for example, a status of \`entered-in-error\` means the data must not be used.' : 'A modifier can change the meaning of the whole resource, so systems must understand it before using the data.'}`,
    };
  }
  return qType(rnd, r, els);
}

function qType(rnd, r, els) {
  const candidates = els.filter((e) => e.types.length === 1 && !['BackboneElement', 'Extension', 'Element'].includes(e.types[0]));
  if (!candidates.length) return null;
  const e = pick(rnd, candidates);
  const correct = typeLabel(e);
  const distract = sample(rnd, TYPE_POOL.filter((t) => t !== e.types[0]), 3);
  return {
    kind: 'type',
    question: `What is the data type of ${code(`${r.name}.${e.name}`)}?`,
    options: [correct, ...distract].map(code),
    explanation: `${code(`${r.name}.${e.name}`)} (${card(e)}) is ${code(correct)}: ${e.short}.`,
  };
}

function qCardinality(rnd, r, els) {
  const e = pick(rnd, els);
  const correct = card(e);
  const all = ['0..1', '1..1', '0..*', '1..*'];
  if (!all.includes(correct)) return null;
  const meaning = { '0..1': 'optional, at most one', '1..1': 'required, exactly one', '0..*': 'optional, can repeat', '1..*': 'required, can repeat' };
  return {
    kind: 'cardinality',
    question: `What is the cardinality of ${code(`${r.name}.${e.name}`)} (${e.short.replace(/\.$/, '')})?`,
    options: [correct, ...all.filter((x) => x !== correct)].map(code),
    explanation: `${code(`${r.name}.${e.name}`)} is ${code(correct)}: ${meaning[correct]}.${e.max === '*' ? ' In JSON it is always an array.' : ''}`,
  };
}

function qGroup(rnd, r) {
  const key = `${r.category}|${r.group}`;
  const groups = unique(RESOURCE_CATEGORIES.flatMap((c) => c.groups.map((g) => `${c.title} › ${g.title}`)));
  const correct = `${catTitle(r.category)} › ${r.group}`;
  return {
    kind: 'group',
    question: `Where does **${r.name}** sit in the FHIR R4 resource list?`,
    options: [correct, ...sample(rnd, groups.filter((g) => g !== correct), 3)],
    explanation: `**${r.name}** is in **${correct}**: ${groupDesc.get(key)}`,
  };
}

// ---------- build ----------
fs.mkdirSync(outDir, { recursive: true });
let total = 0;
const problems = [];
for (const r of RESOURCES) {
  const els = facts[r.name];
  if (!els) { problems.push(`${r.name}: no StructureDefinition`); continue; }
  const rnd = seeded(r.name);
  const questions = [];
  const add = (q) => {
    if (!q || questions.length >= 5 || questions.some((x) => x.question === q.question || (x.kind === q.kind && q.kind !== 'cardinality'))) return;
    questions.push(q);
  };
  [qPurpose(rnd, r), qUse(rnd, r), qLookalike(rnd, r), qRequired(rnd, r, els), qStructure(rnd, r, els)].forEach(add);
  // Top up to five with questions that work for any resource.
  [() => qType(rnd, r, els), () => qGroup(rnd, r), () => qCardinality(rnd, r, els), () => qCardinality(rnd, r, els), () => qCardinality(rnd, r, els)]
    .forEach((make) => { if (questions.length < 5) add(make()); });
  if (questions.length < 5) problems.push(`${r.name}: only ${questions.length} questions`);
  for (const q of questions) {
    if (q.options.length !== 4 || new Set(q.options).size !== 4) problems.push(`${r.name} ${q.kind}: options ${JSON.stringify(q.options)}`);
  }
  total += questions.length;
  fs.writeFileSync(path.join(outDir, `${r.name}.json`), JSON.stringify({ resource: r.name, questions }, null, 1) + '\n');
}
console.log(`Wrote quizzes for ${RESOURCES.length} resources, ${total} questions, to ${path.relative(root, outDir)}`);
if (problems.length) { console.log('Problems:\n' + problems.join('\n')); process.exitCode = 1; }
