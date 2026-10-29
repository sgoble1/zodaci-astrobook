// Relationship (synastry) calculations between two computed charts.
// All interpretation text here is in-app keyword writing, not quoted from the source PDFs.
import { houseOf, fmtLon, SIGN_KEYWORDS, BRANCHES, type ChartResult, type BodyPos } from '@/lib/astro';
import { kuaNumber, groupOf, KUA_TABLE, type Sex } from '@/lib/kua';

const norm = (x: number) => ((x % 360) + 360) % 360;
const SIGN_ELEMENT: Record<string, string> = { Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire', Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth', Gemini: 'Air', Libra: 'Air', Aquarius: 'Air', Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water' };
const SIGN_MODE: Record<string, string> = { Aries: 'Cardinal', Cancer: 'Cardinal', Libra: 'Cardinal', Capricorn: 'Cardinal', Taurus: 'Fixed', Leo: 'Fixed', Scorpio: 'Fixed', Aquarius: 'Fixed', Gemini: 'Mutable', Virgo: 'Mutable', Sagittarius: 'Mutable', Pisces: 'Mutable' };
export const elementOf = (sign: string) => SIGN_ELEMENT[sign];

const DEFS = [
  { type: 'Conjunction', symbol: '☌', angle: 0, orb: 7, tone: 'fusion' },
  { type: 'Opposition', symbol: '☍', angle: 180, orb: 7, tone: 'tension' },
  { type: 'Trine', symbol: '△', angle: 120, orb: 6, tone: 'harmony' },
  { type: 'Square', symbol: '□', angle: 90, orb: 6, tone: 'tension' },
  { type: 'Sextile', symbol: '⚹', angle: 60, orb: 4, tone: 'harmony' },
] as const;

const KEY_WEIGHT: Record<string, number> = { sun: 3, moon: 3, venus: 3, mars: 3, asc: 3, mercury: 2, jupiter: 2, saturn: 2, northNode: 2, mc: 1, uranus: 1, neptune: 1, pluto: 1 };
const THEME: Record<string, string> = {
  sun: 'identity and vitality', moon: 'emotional needs and safety', mercury: 'talking and thinking', venus: 'affection, taste and values',
  mars: 'desire, drive and response style', jupiter: 'growth, generosity and faith', saturn: 'commitment, boundaries and responsibility',
  uranus: 'surprise and freedom', neptune: 'idealism, romance and confusion', pluto: 'power, intensity and transformation',
  northNode: 'shared destiny and growth direction', asc: 'first impression and physical presence', mc: 'public life and goals',
};

export interface InterAspect { aKey: string; bKey: string; aName: string; bName: string; type: string; symbol: string; tone: string; orb: number; weight: number; text: string; uncertain: boolean; }

type Pt = { key: string; name: string; lon: number; uncertain: boolean };
const points = (r: ChartResult): Pt[] => {
  const timeKnown = !!r.input.time;
  const p: Pt[] = r.bodies.filter(b => b.key !== 'southNode').map(b => ({ key: b.key, name: b.name.replace(' (mean)', ''), lon: b.lon, uncertain: b.key === 'moon' && !timeKnown }));
  if (r.asc != null) p.push({ key: 'asc', name: 'Ascendant', lon: r.asc, uncertain: false }, { key: 'mc', name: 'Midheaven', lon: r.mc!, uncertain: false });
  return p;
};

function describe(a: Pt, b: Pt, d: typeof DEFS[number], aLabel: string, bLabel: string) {
  const ta = THEME[a.key] ?? a.name, tb = THEME[b.key] ?? b.name;
  const pair = [a.key, b.key].sort().join('-');
  const special: Record<string, string> = {
    'moon-sun': 'A classic bond marker: one person’s core self meets the other’s emotional needs.',
    'mars-venus': 'Classic attraction signature: desire meets affection.',
    'moon-moon': 'Emotional rhythms compared directly: how easily you feel at home together.',
    'saturn-sun': 'A commitment signature: stabilising when structure leaves room for both people.', 'moon-saturn': 'Loyalty and duty around feelings; warmth grows through patience and trust.',
    'northNode-sun': 'Often read as a fated or purposeful meeting.', 'moon-northNode': 'Often read as a fated emotional connection.',
    'asc-sun': 'Strong recognition — one person “sees” the other immediately.', 'pluto-venus': 'Magnetic, intense attraction with power themes.',
  };
  const tone = d.tone === 'harmony' ? 'flows easily between' : d.tone === 'tension' ? 'creates a productive growth edge between' : 'fuses';
  return `${possessive(aLabel)} ${a.name} ${d.type.toLowerCase()} ${possessive(bLabel)} ${b.name}: ${tone} ${ta} and ${tb}. ${special[pair] ?? ''}`.trim();
}

/** "Your" for the signed-in person without a saved name, otherwise "Name’s". */
export const possessive = (label: string) => (label === 'You' ? 'Your' : `${label}’s`);
const tends = (label: string) => (label === 'You' ? 'tend' : 'tends');
const can = (label: string) => label;

export function interAspects(A: ChartResult, B: ChartResult, aLabel: string, bLabel: string): InterAspect[] {
  const out: InterAspect[] = [];
  for (const a of points(A)) for (const b of points(B)) {
    const sep = Math.abs(norm(a.lon - b.lon + 180) - 180);
    for (const d of DEFS) {
      const orb = Math.abs(sep - d.angle);
      const uncertain = a.uncertain || b.uncertain;
      if (orb <= d.orb && !(uncertain && orb > 3)) {
        out.push({ aKey: a.key, bKey: b.key, aName: a.name, bName: b.name, type: d.type, symbol: d.symbol, tone: d.tone, orb, uncertain,
          weight: ((KEY_WEIGHT[a.key] ?? 1) + (KEY_WEIGHT[b.key] ?? 1)) * (1 - orb / 10), text: describe(a, b, d, aLabel, bLabel) });
      }
    }
  }
  return out.sort((x, y) => y.weight - x.weight);
}

export const HOUSE_THEME = ['', 'self & appearance', 'money & values', 'talk & daily contact', 'home & family', 'romance, play & creativity', 'routine & health', 'partnership', 'intimacy & shared resources', 'beliefs & travel', 'career & status', 'friends & hopes', 'the hidden & spiritual'];

/** Where one person's planets fall in the other person's houses. */
export function overlays(from: ChartResult, into: ChartResult) {
  if (!into.cusps) return null;
  return from.bodies.filter(b => b.key !== 'southNode').map(b => { const h = houseOf(b.lon, into.cusps!); return { body: b, house: h, theme: HOUSE_THEME[h] }; });
}

const midpoint = (a: number, b: number) => { const d = norm(b - a); return d > 180 ? norm(a + (d - 360) / 2) : norm(a + d / 2); };
export function composite(A: ChartResult, B: ChartResult) {
  const out = A.bodies.filter(b => b.key !== 'southNode').map(a => { const b = B.bodies.find(x => x.key === a.key)!; const lon = midpoint(a.lon, b.lon); const f = fmtLon(lon); return { key: a.key, name: a.name.replace(' (mean)', ''), glyph: a.glyph, lon, sign: f.sign, text: f.text, uncertain: a.key === 'moon' && (!A.input.time || !B.input.time) }; });
  if (A.asc != null && B.asc != null) { const lon = midpoint(A.asc, B.asc); const f = fmtLon(lon); out.push({ key: 'asc', name: 'Ascendant', glyph: 'AC', lon, sign: f.sign, text: f.text, uncertain: false }); }
  return out;
}

export function balance(r: ChartResult) {
  const el: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 }, mo: Record<string, number> = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  r.bodies.filter((b: BodyPos) => !['northNode', 'southNode'].includes(b.key)).forEach(b => { el[SIGN_ELEMENT[b.sign]]++; mo[SIGN_MODE[b.sign]]++; });
  return { el, mo };
}

export const signPair = (a: string, b: string) => {
  const ea = SIGN_ELEMENT[a], eb = SIGN_ELEMENT[b];
  const compat = ea === eb ? 'same element — instinctive understanding' : (['Fire', 'Air'].includes(ea) && ['Fire', 'Air'].includes(eb)) || (['Earth', 'Water'].includes(ea) && ['Earth', 'Water'].includes(eb)) ? 'complementary elements — mutually supportive' : 'contrasting elements — attraction through difference, needs translation';
  return `${a} (${SIGN_KEYWORDS[a]}) with ${b} (${SIGN_KEYWORDS[b]}): ${compat}.`;
};

// ---- Chinese ----
const bIdx = (animal: string) => BRANCHES.findIndex(b => b[3] === animal);
export function animalRelation(a: string, b: string) {
  const x = bIdx(a), y = bIdx(b);
  if (x < 0 || y < 0) return { label: 'Unknown', good: null as boolean | null, text: '' };
  if (x === y) return { label: 'Same sign', good: true, text: 'Shared temperament; easy recognition, but the same blind spots.' };
  if ((x + y) % 12 === 1) return { label: 'Six Harmony (secret friend)', good: true, text: 'One of the six most harmonious pairings: quiet, natural alliance.' };
  if (x % 4 === y % 4) return { label: 'Trine (San He)', good: true, text: 'Same triangle of affinity: shared outlook and easy teamwork.' };
  if (Math.abs(x - y) === 6) return { label: 'Dynamic polarity (Liu Chong)', good: false, text: 'Opposite branches create energy and contrast; conscious respect helps turn differences into complementary strengths.' };
  if ((x + y) % 12 === 7) return { label: 'Sensitivity pairing (Liu Hai)', good: false, text: 'Small misunderstandings can accumulate, making early clarification and kind communication especially valuable.' };
  return { label: 'Neutral', good: null, text: 'No special classical relationship: compatibility rests on the rest of the charts.' };
}
const GEN: Record<string, string> = { Wood: 'Fire', Fire: 'Earth', Earth: 'Metal', Metal: 'Water', Water: 'Wood' };
const CTRL: Record<string, string> = { Wood: 'Earth', Earth: 'Water', Water: 'Fire', Fire: 'Metal', Metal: 'Wood' };
export function dayMasterRelation(a: string, b: string, aLabel: string, bLabel: string) {
  if (a === b) return `Both Day Masters are ${a}: peers and companions (比劫) — understanding, sometimes competitive.`;
  if (GEN[a] === b) return `${possessive(aLabel)} ${a} nourishes ${possessive(bLabel)} ${b} (generating cycle): ${can(aLabel)} ${tends(aLabel)} to support and feed ${bLabel === 'You' ? 'you' : bLabel}.`;
  if (GEN[b] === a) return `${possessive(bLabel)} ${b} nourishes ${possessive(aLabel)} ${a} (generating cycle): ${can(bLabel)} ${tends(bLabel)} to support and feed ${aLabel === 'You' ? 'you' : aLabel}.`;
  if (CTRL[a] === b) return `${possessive(aLabel)} ${a} guides ${possessive(bLabel)} ${b} in the controlling cycle: ${aLabel} can bring focus and shape, with room needed for ${possessive(bLabel).replace(/^Your$/, 'your')} autonomy.`;
  return `${possessive(bLabel)} ${b} guides ${possessive(aLabel)} ${a} in the controlling cycle: ${bLabel} can bring focus and shape, with room needed for ${possessive(aLabel).replace(/^Your$/, 'your')} autonomy.`;
}

// ---- Numerology ----
const reduce = (n: number): number => (n <= 9 || n === 11 || n === 22 || n === 33) ? n : reduce(String(n).split('').reduce((a, c) => a + +c, 0));
export function lifePath(date: string) {
  const [y, m, d] = date.split('-').map(Number);
  const parts = [reduce(y), reduce(m), reduce(d)];
  return { n: reduce(parts[0] + parts[1] + parts[2]), steps: `Year ${y}→${parts[0]}, month ${m}→${parts[1]}, day ${d}→${parts[2]}; ${parts.join('+')}=${parts[0] + parts[1] + parts[2]}→${reduce(parts[0] + parts[1] + parts[2])}` };
}
export const LP_MEANING: Record<number, string> = { 1: 'the Leader', 2: 'the Peacemaker', 3: 'the Communicator', 4: 'the Builder', 5: 'the Adventurer', 6: 'the Nurturer', 7: 'the Seeker', 8: 'the Powerhouse', 9: 'the Humanitarian', 11: 'the Intuitive (master)', 22: 'the Master Builder', 33: 'the Master Teacher' };
const base = (n: number) => (n > 9 ? reduce(String(n).split('').reduce((a, c) => a + +c, 0)) : n);
export function lifePathPair(a: number, b: number) {
  const x = base(a), y = base(b);
  const groups = [[1, 5, 7], [2, 4, 8], [3, 6, 9]];
  if (x === y) return 'Same number: mirror-like understanding, shared lessons.';
  if (groups.some(g => g.includes(x) && g.includes(y))) return 'Same numerology family: naturally compatible goals and pace.';
  return 'Different numerology families: complementary strengths, different pace; needs conscious appreciation.';
}

// ---- Feng Shui ----
export function kuaPair(aDate: string, aSex: Sex, bDate: string, bSex: Sex) {
  const a = kuaNumber(aDate, aSex), b = kuaNumber(bDate, bSex);
  if (!a || !b) return { a, b, text: 'Kua needs both people’s sex; one is not given.', shared: [] as string[] };
  const same = groupOf(a.kua) === groupOf(b.kua);
  const goodA = Object.entries(KUA_TABLE[a.kua]).slice(0, 4).map(([, d]) => d);
  const goodB = Object.entries(KUA_TABLE[b.kua]).slice(0, 4).map(([, d]) => d);
  const shared = goodA.filter(d => goodB.includes(d));
  return { a, b, shared, text: same ? `Both are in the ${groupOf(a.kua)} group: your good directions overlap, so shared rooms and a shared bed direction are easy to arrange.` : `Kua ${a.kua} (${groupOf(a.kua)}) and Kua ${b.kua} (${groupOf(b.kua)}) are in different groups: your best directions don’t overlap. Classic remedy — each person faces their own good direction at their desk; for the bed, use the direction of whoever needs support most, or a neutral compromise.` };
}

export function scoreSummary(ia: InterAspect[]) {
  const h = ia.filter(x => x.tone === 'harmony').reduce((s, x) => s + x.weight, 0);
  const t = ia.filter(x => x.tone === 'tension').reduce((s, x) => s + x.weight, 0);
  const f = ia.filter(x => x.tone === 'fusion').reduce((s, x) => s + x.weight, 0);
  return { harmony: Math.round(h), tension: Math.round(t), fusion: Math.round(f) };
}
