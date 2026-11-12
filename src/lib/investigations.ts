import { BODY_KEYWORDS, SIGNS, type BodyPos, type ChartResult } from '@/lib/astro';
import { HOUSE_ARENAS, SIGN_EXPRESSIONS } from '@/content/interpretationLibrary';
import { detectPatterns, rankPatterns } from '@/lib/chartPatterns';
import { contactReflection } from '@/lib/currentChapter';
import { transitsTo, upcomingEvents, type TransitEvent, type TransitHit } from '@/lib/transitOverlay';

/**
 * Investigations Bureau: seven case files built only from the member's calculated chart and today's real sky.
 * Every line of evidence names the placement it comes from; nothing here describes events in a person's life.
 */
export type CaseId = 'relationship' | 'purpose' | 'career' | 'money' | 'health' | 'spirituality' | 'pattern';
export type CaseArt = 'love' | 'purpose' | 'compass' | 'numbers' | 'healing' | 'dream' | 'magnifier';

export interface CaseSpec {
  id: CaseId; number: string; title: string; question: string; brief: string;
  /** Houses opened in the file (needs a birth time). */
  houses: number[];
  /** Natal points under investigation: body keys plus 'asc' / 'mc'. */
  points: string[];
  /** Matching written reading under /my-readings/topic/. */
  reading: string; readingLabel: string;
  /** Tag pre-filled when filing an observation. */
  tag: string; art: CaseArt;
}

export const CASES: CaseSpec[] = [
  { id: 'relationship', number: 'R-7', title: 'The Relationship File', question: 'What does my chart say I look for in a partner, and what do I bring?', brief: 'Venus, the Moon, Juno and the houses of partnership and romance.', houses: [7, 5], points: ['venus', 'moon', 'juno', 'mars', 'asc'], reading: 'love', readingLabel: 'Love & Relationships', tag: 'relationships', art: 'love' },
  { id: 'purpose', number: 'P-10', title: 'The Purpose File', question: 'Which direction does my chart keep pointing toward?', brief: 'The Sun, the North Node, Jupiter and the Midheaven.', houses: [10, 9], points: ['sun', 'northNode', 'jupiter', 'mc'], reading: 'purpose', readingLabel: 'Life Purpose & Mission', tag: 'purpose', art: 'purpose' },
  { id: 'career', number: 'C-6', title: 'The Career File', question: 'How do I work best, and what kind of work holds my attention?', brief: 'Saturn, Mars and the Sun, with the houses of vocation and daily work.', houses: [10, 6], points: ['saturn', 'mars', 'sun', 'mercury', 'mc'], reading: 'career', readingLabel: 'Career & Calling', tag: 'work', art: 'compass' },
  { id: 'money', number: 'M-2', title: 'The Money File', question: 'How does my chart describe earning, keeping and sharing resources?', brief: 'Venus, Jupiter and Saturn, with the houses of own and shared resources.', houses: [2, 8], points: ['venus', 'jupiter', 'saturn'], reading: 'money', readingLabel: 'Money & Resources', tag: 'money', art: 'numbers' },
  { id: 'health', number: 'H-6', title: 'The Health File', question: 'What rhythms and habits does my chart describe as sustaining me?', brief: 'The Moon, Mars, the Sun and the Ascendant, with the houses of body and routine. Not medical advice.', houses: [6, 1], points: ['moon', 'mars', 'sun', 'asc'], reading: 'health', readingLabel: 'Health & Wellness', tag: 'health', art: 'healing' },
  { id: 'spirituality', number: 'S-12', title: 'The Spirituality File', question: 'Where does my chart describe meaning, intuition and retreat?', brief: 'Neptune, Jupiter, the Moon and the houses of belief and the hidden life.', houses: [12, 9], points: ['neptune', 'jupiter', 'moon', 'northNode'], reading: 'spiritual-gifts', readingLabel: 'Spiritual Gifts & Intuition', tag: 'spirit', art: 'dream' },
  { id: 'pattern', number: 'X-1', title: 'The Pattern File', question: 'What shape and repeated signature does my whole chart have?', brief: 'Element and mode balance, stelliums, aspect figures and the most-connected planet.', houses: [], points: [], reading: 'recurring-themes', readingLabel: 'Recurring Themes', tag: 'patterns', art: 'magnifier' },
];

export const caseById = (id: string | undefined) => CASES.find(c => c.id === id);

export type EvidenceKind = 'placement' | 'house' | 'ruler' | 'aspect' | 'signature';
export interface Evidence { kind: EvidenceKind; title: string; detail: string; basis: string }
export interface CaseFile {
  spec: CaseSpec;
  timed: boolean;
  evidence: Evidence[];
  /** Real transits touching the points under investigation today, strongest first. */
  activeNow: TransitHit[];
  /** Exact contacts to those points in the coming window, in date order. */
  upcoming: TransitEvent[];
  questions: string[];
  limits: string[];
}

/** Traditional rulers (modern co-rulers are named in SIGN_EXPRESSIONS). */
export const TRADITIONAL_RULER: Record<string, string> = {
  Aries: 'mars', Taurus: 'venus', Gemini: 'mercury', Cancer: 'moon', Leo: 'sun', Virgo: 'mercury',
  Libra: 'venus', Scorpio: 'mars', Sagittarius: 'jupiter', Capricorn: 'saturn', Aquarius: 'saturn', Pisces: 'jupiter',
};
const MAIN = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
const TENSE = new Set(['Square', 'Opposition']);
const norm = (x: number) => ((x % 360) + 360) % 360;
export const signOfLon = (lon: number) => SIGNS[Math.floor(norm(lon) / 30)];
export const ordinal = (n: number) => `${n}${n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'}`;
const degText = (lon: number) => `${Math.floor(norm(lon) % 30)}°`;

/** A chart is "timed" only when a birth time was given and houses were calculated. */
export const isTimed = (c: ChartResult) => !!c.input.time && !!c.cusps && c.asc != null;

const where = (b: BodyPos, timed: boolean) => `${b.name} in ${b.sign}${timed && b.house ? `, ${ordinal(b.house)} house` : ''}${b.retro ? ' (retrograde)' : ''}`;

/** The plain reading of one placement, from the shared sign/house vocabulary. */
export function placementLine(b: BodyPos, timed: boolean): string {
  const s = SIGN_EXPRESSIONS[b.sign];
  const role = BODY_KEYWORDS[b.key] ?? b.name;
  const house = timed && b.house ? ` In the ${ordinal(b.house)} house it works in the arena of ${HOUSE_ARENAS[b.house].arena}.` : '';
  return `${role[0].toUpperCase()}${role.slice(1)} expressed in ${b.sign}: ${s.core}. Traditionally a gift for ${s.gift}; the watch-point is ${s.shadow}.${house}${b.retro ? ' Retrograde at birth, traditionally read as working more inwardly or on a second pass.' : ''}`;
}

function pointName(c: ChartResult, key: string) {
  if (key === 'asc') return 'Ascendant';
  if (key === 'mc') return 'Midheaven';
  return c.bodies.find(b => b.key === key)?.name ?? key;
}

function angleEvidence(c: ChartResult, key: 'asc' | 'mc'): Evidence | null {
  const lon = key === 'asc' ? c.asc : c.mc;
  if (lon == null) return null;
  const sign = signOfLon(lon); const s = SIGN_EXPRESSIONS[sign];
  const label = key === 'asc' ? 'Ascendant' : 'Midheaven';
  const role = key === 'asc' ? 'how you meet the world and begin things' : 'your public direction and the work you are known for';
  return { kind: 'placement', title: `${label} in ${sign} (${degText(lon)})`, detail: `The ${label} describes ${role}. In ${sign} it ${s.core}.`, basis: `Calculated ${label.toLowerCase()} from birth time and place` };
}

function houseEvidence(c: ChartResult, h: number): Evidence[] {
  if (!c.cusps) return [];
  const sign = signOfLon(c.cusps[h - 1]);
  const rulerKey = TRADITIONAL_RULER[sign];
  const ruler = c.bodies.find(b => b.key === rulerKey);
  const occupants = c.bodies.filter(b => b.house === h && MAIN.includes(b.key));
  const arena = HOUSE_ARENAS[h];
  const out: Evidence[] = [{
    kind: 'house', title: `${ordinal(h)} house · ${arena.arena}`,
    detail: `${sign} is on the cusp, so this arena (${arena.themes}) is approached in a ${sign} way: ${SIGN_EXPRESSIONS[sign].core}. ${occupants.length ? `Planets here: ${occupants.map(o => o.name).join(', ')}, which make this a busy, emphasised area.` : 'No planets sit here, so it is read mainly through its ruler.'}`,
    basis: `House cusps (${c.input.houseSystem ?? 'porphyry'}) calculated from birth time`,
  }];
  if (ruler) out.push({ kind: 'ruler', title: `Ruler of the ${ordinal(h)}: ${ruler.name} in ${ruler.sign}${ruler.house ? `, ${ordinal(ruler.house)} house` : ''}`, detail: `The ${ordinal(h)} house ruler links ${arena.arena} to ${ruler.house ? `the ${ordinal(ruler.house)}-house arena of ${HOUSE_ARENAS[ruler.house].arena}` : `${ruler.sign} themes`}, so what happens in one area tends to draw on the other.`, basis: `Traditional rulership of ${sign}` });
  return out;
}

function aspectEvidence(c: ChartResult, names: string[], max = 4): Evidence[] {
  return c.aspects
    .filter(a => names.includes(a.a) || names.includes(a.b))
    .filter(a => ['Conjunction', 'Opposition', 'Square', 'Trine', 'Sextile'].includes(a.type))
    .sort((x, y) => x.orb - y.orb)
    .slice(0, max)
    .map(a => ({
      kind: 'aspect' as const, title: `${a.a} ${a.symbol} ${a.b} · ${a.type}, ${a.orb.toFixed(1)}° orb`,
      detail: a.type === 'Conjunction' ? `${a.a} and ${a.b} are fused: their themes act together and are hard to separate.` : TENSE.has(a.type) ? `A tension contact. Traditionally read as friction between ${a.a} and ${a.b} that becomes a skill when it is worked with on purpose.` : `An easy contact. ${a.a} and ${a.b} support each other, often without effort or notice.`,
      basis: 'Calculated aspect between natal positions',
    }));
}

/** Western element and mode balance across the ten planets, counted from their signs. */
export function balance(c: ChartResult) {
  const el: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const mode: Record<string, number> = { cardinal: 0, fixed: 0, mutable: 0 };
  c.bodies.filter(b => MAIN.includes(b.key)).forEach(b => { const s = SIGN_EXPRESSIONS[b.sign]; el[s.element]++; mode[s.mode]++; });
  const top = (r: Record<string, number>) => Object.entries(r).sort((a, b) => b[1] - a[1])[0];
  const low = (r: Record<string, number>) => Object.entries(r).sort((a, b) => a[1] - b[1])[0];
  return { el, mode, topElement: top(el), lowElement: low(el), topMode: top(mode) };
}

function patternEvidence(c: ChartResult): Evidence[] {
  const b = balance(c);
  const out: Evidence[] = [{
    kind: 'signature', title: `Element balance: ${b.topElement[0]} leads (${b.topElement[1]} of 10)`,
    detail: `${Object.entries(b.el).map(([k, v]) => `${k} ${v}`).join(' · ')}. ${b.lowElement[1] <= 1 ? `${b.lowElement[0]} is scarce (${b.lowElement[1]}), traditionally a quality you build deliberately or find in other people.` : 'No element is missing.'}`,
    basis: 'Count of the ten planets by sign element',
  }, {
    kind: 'signature', title: `Mode balance: ${b.topMode[0]} leads (${b.topMode[1]} of 10)`,
    detail: `${Object.entries(b.mode).map(([k, v]) => `${k} ${v}`).join(' · ')}. ${b.topMode[0] === 'cardinal' ? 'Cardinal emphasis is read as a habit of starting things.' : b.topMode[0] === 'fixed' ? 'Fixed emphasis is read as staying power and resistance to change.' : 'Mutable emphasis is read as adaptability and quick adjustment.'}`,
    basis: 'Count of the ten planets by sign mode',
  }];
  rankPatterns(detectPatterns(c), c).slice(0, 4).forEach(p => out.push({ kind: 'signature', title: p.label, detail: p.detail, basis: `Chart pattern finder · ${p.factors.join(', ') || p.pattern_id}` }));
  const counts = new Map<string, number>();
  c.aspects.forEach(a => { counts.set(a.a, (counts.get(a.a) ?? 0) + 1); counts.set(a.b, (counts.get(a.b) ?? 0) + 1); });
  const busiest = [...counts.entries()].filter(([n]) => c.bodies.some(x => x.name === n && MAIN.includes(x.key))).sort((x, y) => y[1] - x[1])[0];
  if (busiest) out.push({ kind: 'signature', title: `Most connected planet: ${busiest[0]} (${busiest[1]} aspects)`, detail: `${busiest[0]} links to more of your chart than any other planet, so its themes (${BODY_KEYWORDS[c.bodies.find(x => x.name === busiest[0])!.key]}) tend to colour the rest.`, basis: 'Count of calculated natal aspects' });
  return out;
}

/** Builds one case file. `now` is injectable so tests and pages agree on the sky being read. */
export function buildCase(c: ChartResult, id: CaseId, now = new Date(), windowDays = 120): CaseFile {
  const spec = caseById(id)!;
  const timed = isTimed(c);
  const evidence: Evidence[] = [];
  const limits: string[] = [];
  if (!timed) limits.push('No birth time is saved, so houses, house rulers, the Ascendant and the Midheaven are left out of this file, and the Moon may be a few degrees off.');
  if (id === 'pattern') evidence.push(...patternEvidence(c));
  else {
    for (const key of spec.points) {
      if (key === 'asc' || key === 'mc') { if (timed) { const e = angleEvidence(c, key); if (e) evidence.push(e); } continue; }
      const b = c.bodies.find(x => x.key === key);
      if (b) evidence.push({ kind: 'placement', title: where(b, timed), detail: placementLine(b, timed), basis: `Calculated ${b.name} position${timed ? ' and house' : ''}` });
    }
    if (timed) spec.houses.forEach(h => evidence.push(...houseEvidence(c, h)));
    evidence.push(...aspectEvidence(c, spec.points.map(k => pointName(c, k))));
  }
  const watch = id === 'pattern' ? MAIN.concat(['asc', 'mc']) : spec.points;
  const activeNow = transitsTo(c, now).filter(h => watch.includes(h.natalKey)).sort((a, b) => b.weight - a.weight || a.orb - b.orb).slice(0, 4);
  const upcoming = upcomingEvents(c, now, windowDays).filter(e => e.kind === 'exact' && e.natalKey && watch.includes(e.natalKey)).slice(0, 5);
  const questions = [spec.question, ...spec.houses.filter(() => timed).map(h => HOUSE_ARENAS[h].question)];
  if (activeNow[0]) questions.push(contactReflection(activeNow[0]).prompt);
  questions.push('What have you noticed yourself that agrees with this file, or does not? Log it so the next reading can be checked against it.');
  return { spec, timed, evidence, activeNow, upcoming, questions: [...new Set(questions)], limits };
}

/** How much evidence each file holds, for the bureau's index cards. */
export function caseSummaries(c: ChartResult, now = new Date()) {
  return CASES.map(spec => { const f = buildCase(c, spec.id, now, 60); return { spec, evidence: f.evidence.length, active: f.activeNow.length, next: f.upcoming[0] ?? null }; });
}
