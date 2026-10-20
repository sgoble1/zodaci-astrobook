import { SIGNS, SIGN_KEYWORDS, BODY_KEYWORDS, fmtLon, type AspectHit, type BodyPos, type ChartResult } from '@/lib/astro';
import { TRAD_RULER } from '@/lib/advancedDeductions';
import { dignityOf } from '@/lib/retrogood';
import { lifePath } from '@/lib/synastry';
import { reduce } from '@/lib/numerologyCross';

/** Deterministic building blocks for the Results page: balance, placements, aspects, houses, numerology cycles, lots and fixed stars. */
const norm = (x: number) => ((x % 360) + 360) % 360;
const arc = (a: number, b: number) => Math.abs(norm(a - b + 180) - 180);
const ELEMENT: Record<string, 'Fire' | 'Earth' | 'Air' | 'Water'> = { Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire', Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth', Gemini: 'Air', Libra: 'Air', Aquarius: 'Air', Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water' };
const MODALITY: Record<string, 'Cardinal' | 'Fixed' | 'Mutable'> = { Aries: 'Cardinal', Cancer: 'Cardinal', Libra: 'Cardinal', Capricorn: 'Cardinal', Taurus: 'Fixed', Leo: 'Fixed', Scorpio: 'Fixed', Aquarius: 'Fixed', Gemini: 'Mutable', Virgo: 'Mutable', Sagittarius: 'Mutable', Pisces: 'Mutable' };
export const CORE_KEYS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
const MODERN_RULER: Record<string, string> = { Scorpio: 'pluto', Aquarius: 'uranus', Pisces: 'neptune' };
const NAME: Record<string, string> = { sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto' };
export const ordinal = (n: number) => `${n}${['th', 'st', 'nd', 'rd'][n % 10 > 3 || [11, 12, 13].includes(n % 100) ? 0 : n % 10]}`;

export function balance(c: ChartResult) {
  const el = { Fire: 0, Earth: 0, Air: 0, Water: 0 }; const mo = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  c.bodies.filter(b => CORE_KEYS.includes(b.key)).forEach(b => { el[ELEMENT[b.sign]]++; mo[MODALITY[b.sign]]++; });
  if (c.asc != null) { const s = fmtLon(c.asc).sign; el[ELEMENT[s]]++; mo[MODALITY[s]]++; }
  const total = Object.values(el).reduce((a, b) => a + b, 0);
  const dominant = (Object.entries(el) as [string, number][]).sort((a, b) => b[1] - a[1])[0][0];
  const mode = (Object.entries(mo) as [string, number][]).sort((a, b) => b[1] - a[1])[0][0];
  return { el, mo, total, dominant, mode };
}

export const HOUSE_AREA = ['', 'self, body and first impressions', 'money, possessions and self-worth', 'thinking, siblings and your neighbourhood', 'home, family life and inner foundations', 'creativity, romance, play and children', 'daily routine, work habits and health', 'partners and one-to-one relationships', 'shared resources, intimacy and deep change', 'beliefs, study and travel', 'career, reputation and public life', 'friends, groups and hopes', 'rest, solitude and the hidden inner life'];
const DIGNITY_PLAIN: Record<string, string> = { 'domicile+exaltation': 'It is exceptionally strong here: it both rules and is exalted in this sign.', domicile: 'It is at home in this sign, so it works naturally and with confidence.', exaltation: 'It is exalted here, which gives it a refined, elevated quality.', peregrine: 'It is neither strengthened nor weakened by this sign, so its expression depends on the rest of the chart.', fall: 'It is in its fall here, so it works best when used deliberately.', detriment: 'It is in detriment here, opposite its home sign, so it learns to work in an unfamiliar way.', 'detriment+fall': 'It is in both detriment and fall here: a placement that becomes skilful through conscious effort.' };

export function placementText(b: BodyPos, timeKnown: boolean) {
  const kw = BODY_KEYWORDS[b.key] ?? 'one part of your life';
  const parts = [`${b.name} describes ${kw}. In ${b.sign} it is ${SIGN_KEYWORDS[b.sign]}.`];
  if (CORE_KEYS.includes(b.key)) parts.push(DIGNITY_PLAIN[dignityOf(b.key, b.sign)]);
  if (b.house && timeKnown) parts.push(`In the ${ordinal(b.house)} house it shows up most in ${HOUSE_AREA[b.house]}.`);
  if (b.retro && !['northNode', 'southNode'].includes(b.key)) parts.push('It was retrograde at your birth, so this energy is processed inwardly before it is shown.');
  if (b.deg >= 29) parts.push('At the final degree of the sign it carries a theme of completion and urgency.');
  else if (b.deg < 1) parts.push('At the very start of the sign its expression is fresh and raw.');
  return parts.join(' ');
}

const ASPECT_NATURE: Record<string, string> = { Conjunction: 'fuse into a single force', Opposition: 'pull in opposite directions and ask for balance', Trine: 'support each other with ease', Square: 'create friction that drives growth', Sextile: 'offer an opportunity when you act on it' };
export function aspectText(a: AspectHit, bodies: BodyPos[]) {
  const ka = bodies.find(b => b.name === a.a)?.key, kb = bodies.find(b => b.name === a.b)?.key;
  const wa = a.a === 'Ascendant' ? 'how you meet the world' : a.a === 'Midheaven' ? 'your public path' : BODY_KEYWORDS[ka ?? ''] ?? a.a;
  const wb = a.b === 'Ascendant' ? 'how you meet the world' : a.b === 'Midheaven' ? 'your public path' : BODY_KEYWORDS[kb ?? ''] ?? a.b;
  const strength = a.orb < 1 ? 'This is very close to exact, so it is one of the loudest themes in your chart.' : a.orb < 3 ? 'It is close, so you will notice it often.' : 'It is wide, so it works more in the background.';
  return `${a.a} ${a.symbol} ${a.b}: ${wa} and ${wb} ${ASPECT_NATURE[a.type] ?? 'interact'}. ${strength}`;
}

export type HouseInfo = { n: number; cusp: number; sign: string; occupants: BodyPos[]; ruler: string; modernRuler: string | null; rulerHouse: number | null; rulerSign: string | null; text: string };
export function houseAnalysis(c: ChartResult): HouseInfo[] {
  if (!c.cusps) return [];
  return c.cusps.map((cusp, i) => {
    const n = i + 1; const sign = SIGNS[Math.floor(norm(cusp) / 30)];
    const occupants = c.bodies.filter(b => b.house === n && [...CORE_KEYS, 'chiron', 'northNode'].includes(b.key));
    const ruler = TRAD_RULER[SIGNS.indexOf(sign)]; const modern = MODERN_RULER[sign] ?? null;
    const rb = c.bodies.find(b => b.key === ruler);
    const occ = occupants.length ? `${occupants.map(o => o.name).join(', ')} ${occupants.length === 1 ? 'lives' : 'live'} here, making this a busy part of your life.` : 'No planets live here, so this area is run by its ruler rather than by planets inside it.';
    const text = `Your ${ordinal(n)} house covers ${HOUSE_AREA[n]}. It begins in ${sign}, so you approach it in a ${SIGN_KEYWORDS[sign].split(',')[0]} way. ${occ} Its ruler ${NAME[ruler]}${modern ? ` (modern co-ruler ${NAME[modern]})` : ''} sits in ${rb?.sign ?? '—'}${rb?.house ? `, ${ordinal(rb.house)} house` : ''}, linking ${HOUSE_AREA[n].split(',')[0]} to ${rb?.house ? HOUSE_AREA[rb.house].split(',')[0] : 'the rest of your chart'}.`;
    return { n, cusp, sign, occupants, ruler: NAME[ruler], modernRuler: modern ? NAME[modern] : null, rulerHouse: rb?.house ?? null, rulerSign: rb?.sign ?? null, text };
  });
}

// ---------- Numerology cycles ----------
const digits = (n: number) => String(n).split('').reduce((s, d) => s + Number(d), 0);
const single = (n: number) => { while (n > 9) n = digits(n); return n; };
export function pinnacles(date: string) {
  const [y, m, d] = date.split('-').map(Number);
  const M = reduce(m), D = reduce(d), Y = reduce(digits(y));
  const p1 = reduce(M + D), p2 = reduce(D + Y), p3 = reduce(p1 + p2), p4 = reduce(M + Y);
  const end1 = 36 - single(lifePath(date));
  return [{ n: p1, from: 0, to: end1 }, { n: p2, from: end1 + 1, to: end1 + 9 }, { n: p3, from: end1 + 10, to: end1 + 18 }, { n: p4, from: end1 + 19, to: null as number | null }];
}
export function challenges(date: string) {
  const [y, m, d] = date.split('-').map(Number);
  const M = single(m), D = single(d), Y = single(digits(y));
  const c1 = Math.abs(M - D), c2 = Math.abs(D - Y), c3 = Math.abs(c1 - c2), c4 = Math.abs(M - Y);
  return [c1, c2, c3, c4];
}
export const bridge = (a: number, b: number) => Math.abs(single(a) - single(b));
export const CHALLENGE_TEXT = ['the choice of where to focus when every path is open', 'self-confidence and standing up for yourself', 'sensitivity and not taking things personally', 'self-expression without scattering energy', 'patience, order and steady work', 'freedom without restlessness', 'responsibility without perfectionism', 'trusting others and opening up', 'money and power held with balance'];

// ---------- Hermetic lots (Arabic Parts) ----------
export function arabicParts(c: ChartResult) {
  if (c.asc == null) return [];
  const g = (k: string) => c.bodies.find(b => b.key === k)!.lon;
  const sun = g('sun'), moon = g('moon');
  const day = norm(sun - c.asc) > 180;
  const fortune = norm(day ? c.asc + moon - sun : c.asc + sun - moon);
  const spirit = norm(day ? c.asc + sun - moon : c.asc + moon - sun);
  const lot = (name: string, lon: number, theme: string, formula: string) => { const f = fmtLon(lon); return { name, lon, sign: f.sign, text: f.text, theme, formula }; };
  return [
    lot('Part of Fortune', fortune, 'body, wellbeing and material luck', day ? 'Asc + Moon − Sun (day)' : 'Asc + Sun − Moon (night)'),
    lot('Part of Spirit', spirit, 'purpose, mind and chosen actions', day ? 'Asc + Sun − Moon (day)' : 'Asc + Moon − Sun (night)'),
    lot('Part of Eros', norm(day ? c.asc + g('venus') - spirit : c.asc + spirit - g('venus')), 'desire and what you long for', day ? 'Asc + Venus − Spirit' : 'Asc + Spirit − Venus'),
    lot('Part of Necessity', norm(day ? c.asc + fortune - g('mercury') : c.asc + g('mercury') - fortune), 'constraints and what must be faced', day ? 'Asc + Fortune − Mercury' : 'Asc + Mercury − Fortune'),
    lot('Part of Courage', norm(day ? c.asc + fortune - g('mars') : c.asc + g('mars') - fortune), 'boldness and how you take risks', day ? 'Asc + Fortune − Mars' : 'Asc + Mars − Fortune'),
    lot('Part of Victory', norm(day ? c.asc + g('jupiter') - spirit : c.asc + spirit - g('jupiter')), 'faith, success and generosity', day ? 'Asc + Jupiter − Spirit' : 'Asc + Spirit − Jupiter'),
    lot('Part of Nemesis', norm(day ? c.asc + fortune - g('saturn') : c.asc + g('saturn') - fortune), 'endings, limits and hard lessons', day ? 'Asc + Fortune − Saturn' : 'Asc + Saturn − Fortune'),
  ];
}

// ---------- Fixed stars (J2000 tropical longitudes, precessed 50.29″/year) ----------
const STARS: [string, string, number, string][] = [
  ['Alpheratz', 'Aries', 14.3, 'independence, freedom and quick wit'], ['Mirach', 'Taurus', 0.4, 'beauty, devotion and artistic gifts'], ['Mira', 'Taurus', 1.5, 'persistence through changing fortunes'],
  ['Hamal', 'Taurus', 7.67, 'headstrong drive and self-reliance'], ['Menkar', 'Taurus', 14.32, 'collective causes and public responsibility'], ['Almach', 'Taurus', 14.23, 'artistic ability and honours'],
  ['Algol', 'Taurus', 26.17, 'intense passion and transforming powerful emotion'], ['Alcyone', 'Taurus', 30 - 0.02, 'vision, mysticism and deep sorrow turned to insight'], ['Aldebaran', 'Gemini', 9.78, 'integrity, eloquence and success through honesty'],
  ['Rigel', 'Gemini', 16.83, 'teaching, technical skill and lasting fame'], ['Bellatrix', 'Gemini', 20.95, 'quick decisions and leadership'], ['Capella', 'Gemini', 21.85, 'curiosity, learning and civic honours'],
  ['Alnilam', 'Gemini', 23.47, 'brief but brilliant public fame'], ['Betelgeuse', 'Gemini', 28.75, 'great success and good fortune'], ['Sirius', 'Cancer', 14.08, 'ambition, devotion and lasting honours'],
  ['Canopus', 'Cancer', 14.97, 'voyaging, education and guidance'], ['Castor', 'Cancer', 20.23, 'intellect, writing and sudden shifts'], ['Pollux', 'Cancer', 23.22, 'courage, sport and a sharp tongue'],
  ['Procyon', 'Cancer', 25.78, 'quick rise and the need for patience'], ['Praesepe', 'Leo', 7.33, 'industry, vision and a restless mind'], ['Acubens', 'Leo', 13.63, 'tenacity and self-protection'],
  ['Dubhe', 'Leo', 15.2, 'determination and protective strength'], ['Alphard', 'Leo', 27.28, 'deep emotion and wisdom of the heart'], ['Regulus', 'Leo', 29.83, 'leadership, success and honour kept through integrity'],
  ['Zosma', 'Virgo', 11.32, 'service, sensitivity to injustice'], ['Denebola', 'Virgo', 21.62, 'independent thinking and unconventional choices'], ['Alkaid', 'Virgo', 26.93, 'leadership in difficult conditions'],
  ['Vindemiatrix', 'Libra', 9.93, 'careful judgement and gathering harvest'], ['Algorab', 'Libra', 13.45, 'resourcefulness and protective instinct'], ['Spica', 'Libra', 23.83, 'brilliance, talent and protection'],
  ['Arcturus', 'Libra', 24.23, 'pathfinding, prosperity and new methods'], ['Acrux', 'Scorpio', 11.87, 'ceremony, mysticism and justice'], ['Zuben Elgenubi', 'Scorpio', 15.08, 'social reform and the cost of choices'],
  ['Zuben Eschamali', 'Scorpio', 19.37, 'good judgement and honourable ambition'], ['Unukalhai', 'Scorpio', 22.05, 'strategy and a sharp mind'], ['Antares', 'Sagittarius', 9.77, 'courage, intensity and decisive action'],
  ['Rasalgethi', 'Sagittarius', 16.15, 'striving for order and harmony'], ['Ras Alhague', 'Sagittarius', 22.45, 'healing and finding the antidote'], ['Facies', 'Capricorn', 8.3, 'focus, precision and leadership'],
  ['Nunki', 'Capricorn', 12.38, 'truthfulness and ambition for knowledge'], ['Vega', 'Capricorn', 15.32, 'charisma, music and artistic gifts'], ['Altair', 'Aquarius', 1.78, 'boldness, ambition and sudden opportunity'],
  ['Sadalsuud', 'Aquarius', 23.4, 'luck that comes through community'], ['Deneb Algedi', 'Aquarius', 23.55, 'justice, law and careful counsel'], ['Sadalmelik', 'Pisces', 3.35, 'persistence and quiet good fortune'],
  ['Fomalhaut', 'Pisces', 3.87, 'idealism and creative vision kept pure'], ['Deneb Adige', 'Pisces', 5.33, 'quick learning and ingenuity'], ['Achernar', 'Pisces', 15.32, 'faith, ethics and spiritual success'],
  ['Markab', 'Pisces', 23.48, 'steadiness of purpose'], ['Scheat', 'Pisces', 29.37, 'independent thought and free will'],
];
export function fixedStarContacts(c: ChartResult, orb = 1) {
  const years = (c.utc.getTime() - Date.UTC(2000, 0, 1, 12)) / (365.25 * 864e5);
  const shift = (50.29 / 3600) * years;
  const pts = [...c.bodies.filter(b => [...CORE_KEYS, 'northNode', 'chiron'].includes(b.key)).map(b => ({ name: b.name, lon: b.lon })), ...(c.asc != null ? [{ name: 'Ascendant', lon: c.asc }, { name: 'Midheaven', lon: c.mc! }] : [])];
  const out: { star: string; point: string; orb: number; meaning: string; position: string }[] = [];
  STARS.forEach(([star, sign, deg, meaning]) => {
    const lon = norm(SIGNS.indexOf(sign as typeof SIGNS[number]) * 30 + deg + shift);
    pts.forEach(p => { const o = arc(lon, p.lon); if (o <= orb) out.push({ star, point: p.name, orb: o, meaning, position: fmtLon(lon).text }); });
  });
  return out.sort((a, b) => a.orb - b.orb);
}

// ---------- Chinese clash / harmony between pillars ----------
const ANIMALS = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
const SIX_HARMONY = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]];
const TRINES = [[8, 0, 4], [5, 9, 1], [2, 6, 10], [11, 3, 7]];
export function pillarRelations(pillars: { label: string; animal: string }[]) {
  const out: { kind: 'Clash' | 'Harmony' | 'Trine'; text: string }[] = [];
  for (let i = 0; i < pillars.length; i++) for (let j = i + 1; j < pillars.length; j++) {
    const a = ANIMALS.indexOf(pillars[i].animal), b = ANIMALS.indexOf(pillars[j].animal);
    if (a < 0 || b < 0) continue;
    if ((a + 6) % 12 === b) out.push({ kind: 'Clash', text: `${pillars[i].label} ${pillars[i].animal} clashes with ${pillars[j].label} ${pillars[j].animal}: these two life areas pull against each other and ask for flexibility.` });
    if (SIX_HARMONY.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) out.push({ kind: 'Harmony', text: `${pillars[i].label} ${pillars[i].animal} and ${pillars[j].label} ${pillars[j].animal} form a Six Harmony pair: natural cooperation between these parts of life.` });
    if (a !== b && TRINES.some(t => t.includes(a) && t.includes(b))) out.push({ kind: 'Trine', text: `${pillars[i].label} ${pillars[i].animal} and ${pillars[j].label} ${pillars[j].animal} belong to the same harmony trine: they share goals and help each other.` });
  }
  return out;
}

/** Simple, explainable compatibility score (Sun, Moon, Venus, Mars, Rising) from element and modality. */
const EL_SCORE: Record<string, number> = { 'Fire-Fire': 22, 'Fire-Air': 25, 'Fire-Earth': 10, 'Fire-Water': 8, 'Earth-Earth': 22, 'Earth-Water': 25, 'Earth-Air': 9, 'Air-Air': 22, 'Air-Water': 10, 'Water-Water': 22 };
const MO_SCORE: Record<string, number> = { same: 6, different: 10 };
const WEIGHTS: Record<string, number> = { sun: 1, moon: 1, venus: 0.9, mars: 0.8, asc: 0.7 };
export function elementPairScore(a: string, b: string) {
  const ea = ELEMENT[a], eb = ELEMENT[b];
  return EL_SCORE[`${ea}-${eb}`] ?? EL_SCORE[`${eb}-${ea}`] ?? 0;
}
export function compatibilityScore(a: Record<string, string>, b: Record<string, string>) {
  let total = 0, weight = 0; const parts: { key: string; score: number }[] = [];
  Object.keys(WEIGHTS).forEach(k => {
    if (!a[k] || !b[k]) return;
    const s = Math.min(100, Math.round(elementPairScore(a[k], b[k]) * 3 + MO_SCORE[MODALITY[a[k]] === MODALITY[b[k]] ? 'same' : 'different'] * 2.5));
    parts.push({ key: k, score: s }); total += s * WEIGHTS[k]; weight += WEIGHTS[k];
  });
  return { score: weight ? Math.round(total / weight) : 0, parts };
}
