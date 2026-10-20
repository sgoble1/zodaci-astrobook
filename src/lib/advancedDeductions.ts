import * as Astronomy from 'astronomy-engine';
import { eclLon, SIGNS, type ChartResult, type BodyPos } from '@/lib/astro';
import type { Deduction } from '@/lib/deductions';

/**
 * The fifteen advanced deterministic deductions from the Results & Readings specification.
 * Pure astronomy and arithmetic: no AI, every result shows the calculation it came from.
 */
const TEN = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
const MAJOR = ['Conjunction', 'Opposition', 'Square', 'Trine', 'Sextile'];
const norm = (x: number) => ((x % 360) + 360) % 360;
export const arc = (a: number, b: number) => { const d = Math.abs(norm(a) - norm(b)); return d > 180 ? 360 - d : d; };
const signIdx = (lon: number) => Math.floor(norm(lon) / 30);
const ELEMENT = ['Fire', 'Earth', 'Air', 'Water'];
const elementOfIdx = (i: number) => ELEMENT[i % 4];
const MODE = ['Cardinal', 'Fixed', 'Mutable'];
const modeOfIdx = (i: number) => MODE[i % 3];
/** Traditional rulers (used for reception, profections and time lords). */
export const TRAD_RULER = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'];
const NAME: Record<string, string> = { sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto' };
const ASTRO_BODY: Record<string, Astronomy.Body> = { sun: Astronomy.Body.Sun, moon: Astronomy.Body.Moon, mercury: Astronomy.Body.Mercury, venus: Astronomy.Body.Venus, mars: Astronomy.Body.Mars, jupiter: Astronomy.Body.Jupiter, saturn: Astronomy.Body.Saturn, uranus: Astronomy.Body.Uranus, neptune: Astronomy.Body.Neptune, pluto: Astronomy.Body.Pluto };
const HOUSE_THEME = ['', 'self, body and the way you meet the world', 'money, possessions and self-worth', 'learning, siblings and daily conversation', 'home, family and inner foundations', 'creativity, romance, play and children', 'work habits, health and service', 'partnership and one-to-one relationships', 'shared resources, intimacy and transformation', 'beliefs, study and long journeys', 'career, reputation and public life', 'friends, groups and hopes', 'solitude, rest and the hidden inner life'];

type P = { key: string; name: string; lon: number; sign: string; house: number | null };
const planets = (c: Pick<ChartResult, 'bodies'>): P[] => TEN.map(k => c.bodies.find(b => b.key === k)).filter(Boolean).map(b => ({ key: b!.key, name: b!.name, lon: b!.lon, sign: b!.sign, house: b!.house }));
const list = (xs: string[]) => xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`;

// 1. Chart shape (Marc Edmund Jones patterns)
const SHAPE_TEXT: Record<string, string> = {
  Bundle: 'All ten planets sit within a third of the zodiac. Your energy is concentrated and specialised; you go deep rather than wide.',
  Bowl: 'Your planets fill one half of the chart. You carry a strong sense of purpose and tend to pour yourself into what you care about, while the empty half shows what you seek from others.',
  Bucket: 'Nine planets gather in one half with a single planet, the handle, on the other side. That handle planet is where your energy is directed and released.',
  Locomotive: 'Your planets fill two-thirds of the chart with one clear empty third. This gives a self-driven, persistent momentum; the leading planet sets the pace.',
  Seesaw: 'Your planets form two opposing groups. You see both sides of things and grow by balancing competing pulls rather than choosing one.',
  Splay: 'Your planets form several irregular clusters. You are individualistic and resist being categorised, with strong interests in a few distinct areas.',
  Splash: 'Your planets are spread around the whole chart. You have wide-ranging interests and adapt to many settings; the challenge is focus.',
};
export function chartShape(lons: number[]) {
  const s = lons.map(norm).sort((a, b) => a - b);
  const gaps = s.map((v, i) => ({ start: v, size: i === s.length - 1 ? s[0] + 360 - v : s[i + 1] - v }));
  const sorted = [...gaps].sort((a, b) => b.size - a.size);
  const span = 360 - sorted[0].size;
  if (span <= 120) return { shape: 'Bundle', handle: null as number | null };
  if (span <= 180) return { shape: 'Bowl', handle: null };
  for (let i = 0; i < s.length; i++) {
    const rest = s.filter((_, j) => j !== i);
    const restGaps = rest.map((v, k) => k === rest.length - 1 ? rest[0] + 360 - v : rest[k + 1] - v);
    if (360 - Math.max(...restGaps) <= 180) return { shape: 'Bucket', handle: s[i] };
  }
  if (sorted[0].size >= 120) return { shape: 'Locomotive', handle: null };
  if (sorted[0].size >= 60 && sorted[1].size >= 60) return { shape: 'Seesaw', handle: null };
  const occupied = new Set(s.map(signIdx)).size;
  if (sorted[0].size <= 60 && occupied >= 7) return { shape: 'Splash', handle: null };
  return { shape: 'Splay', handle: null };
}

// Aspect helpers across the ten planets
function majorAspects(c: Pick<ChartResult, 'aspects'>, ps: P[]) {
  const names = new Set(ps.map(p => p.name));
  return c.aspects.filter(a => MAJOR.includes(a.type) && names.has(a.a) && names.has(a.b));
}

// 8. Declination for out-of-bounds
export function declination(key: string, utc: Date) {
  const t = Astronomy.MakeTime(utc);
  const obs = new Astronomy.Observer(0, 0, 0);
  return Astronomy.Equator(ASTRO_BODY[key], t, obs, true, true).dec;
}
const OBLIQUITY = 23 + 26 / 60;

// 12. Void-of-course Moon: no major aspect perfects before the Moon leaves its sign
export function voidOfCourseMoon(c: Pick<ChartResult, 'utc' | 'bodies'>) {
  const moon = c.bodies.find(b => b.key === 'moon'); if (!moon) return null;
  const startSign = signIdx(moon.lon);
  const others = TEN.filter(k => k !== 'moon');
  const angles = [0, 60, 90, 120, 180];
  const sepFor = (k: string, d: Date) => norm(eclLon(ASTRO_BODY.moon, d) - eclLon(ASTRO_BODY[k], d));
  const off = (sep: number, target: number) => norm(sep - target + 180) - 180;
  const targets = angles.flatMap(a => a === 0 || a === 180 ? [a] : [a, 360 - a]);
  const prevSeps: Record<string, number> = Object.fromEntries(others.map(k => [k, sepFor(k, c.utc)]));
  for (let h = 1; h <= 72; h++) {
    const d = new Date(c.utc.getTime() + h * 3600000);
    if (signIdx(eclLon(ASTRO_BODY.moon, d)) !== startSign) return { void: true, ingressHours: h, next: null as string | null };
    for (const k of others) {
      const now = sepFor(k, d), was = prevSeps[k];
      for (const t of targets) { const a = off(was, t), b = off(now, t); if (Math.abs(a) < 20 && Math.abs(b) < 20 && (a === 0 || Math.sign(a) !== Math.sign(b))) return { void: false, ingressHours: null, next: `${NAME[k]} (${t > 180 ? 360 - t : t}°)` }; }
      prevSeps[k] = now;
    }
  }
  return { void: false, ingressHours: null, next: null };
}

const reduce = (n: number): number => n <= 9 ? n : reduce(String(n).split('').reduce((s, d) => s + +d, 0));
export function personalYear(birthDate: string, year: number) {
  const [, m, d] = birthDate.split('-').map(Number);
  return reduce(reduce(m) + reduce(d) + reduce(year));
}
const PY_TEXT: Record<number, string> = { 1: 'a year of beginnings: start the thing you have been circling.', 2: 'a year of patience and partnership: cooperation matters more than speed.', 3: 'a year of expression: share, create and connect.', 4: 'a year of building: steady work lays foundations that last.', 5: 'a year of change: travel, experiments and new freedom.', 6: 'a year of responsibility and care: home and relationships take centre stage.', 7: 'a year of reflection: study, rest and inner questions.', 8: 'a year of results: ambition, money and authority come into focus.', 9: 'a year of completion: finish, release and clear space for what comes next.' };

export function advancedDeductions(c: ChartResult, opts: { date: string; timeKnown: boolean; today?: Date }): Deduction[] {
  const out: Deduction[] = [];
  const ps = planets(c);
  const today = opts.today ?? new Date();
  if (ps.length < 10) return out;

  // 1 Chart shape (needs only longitudes; Moon may shift without a time)
  const shape = chartShape(ps.map(p => p.lon));
  const handle = shape.handle != null ? ps.find(p => Math.abs(norm(p.lon) - shape.handle!) < 1e-9) : null;
  out.push({ id: 'shape', system: 'Western', title: `Chart shape: ${shape.shape}`, text: SHAPE_TEXT[shape.shape] + (handle ? ` Your handle is ${handle.name} in ${handle.sign}.` : ''), basis: 'Spread of the ten planets around the zodiac' });

  const aspects = majorAspects(c, ps);
  // 2 Focal planet
  const counts = ps.map(p => { const hits = aspects.filter(a => a.a === p.name || a.b === p.name); return { p, n: hits.length, avg: hits.length ? hits.reduce((s, a) => s + a.orb, 0) / hits.length : 99 }; });
  const focal = [...counts].sort((a, b) => b.n - a.n || a.avg - b.avg)[0];
  if (focal.n > 0) out.push({ id: 'focal', system: 'Western', title: `Focal planet: ${focal.p.name}`, text: `${focal.p.name} in ${focal.p.sign} makes more major aspects than any other planet (${focal.n}), so its themes thread through most of your chart.`, basis: `${focal.n} major aspects, average orb ${focal.avg.toFixed(1)}°` });

  // 3 Unaspected planets
  const lonely = counts.filter(x => x.n === 0).map(x => x.p);
  if (lonely.length) out.push({ id: 'unaspected', system: 'Western', title: `Unaspected: ${list(lonely.map(p => p.name))}`, text: `${list(lonely.map(p => p.name))} ${lonely.length === 1 ? 'makes' : 'make'} no major aspect to another planet. Unaspected planets act on their own, either as a pure, unfiltered gift or as a blind spot until you consciously bring them into play.`, basis: 'No conjunction, opposition, square, trine or sextile within orb' });

  // 4 T-square, 5 Grand trine, 6 Yod
  const tsq: string[] = []; const gt: { names: string[]; el: string }[] = []; const yods: string[] = [];
  for (let i = 0; i < 10; i++) for (let j = i + 1; j < 10; j++) {
    const a = ps[i], b = ps[j], s = arc(a.lon, b.lon);
    if (Math.abs(s - 180) <= 6) for (const x of ps) { if (x === a || x === b) continue; if (Math.abs(arc(x.lon, a.lon) - 90) <= 6 && Math.abs(arc(x.lon, b.lon) - 90) <= 6) tsq.push(`${a.name}–${b.name} with apex ${x.name} in ${x.sign}${x.house ? ` (house ${x.house})` : ''}, ${modeOfIdx(signIdx(x.lon))} ${elementOfIdx(signIdx(x.lon))}`); }
    if (Math.abs(s - 60) <= 2) for (const x of ps) { if (x === a || x === b) continue; if (Math.abs(arc(x.lon, a.lon) - 150) <= 2 && Math.abs(arc(x.lon, b.lon) - 150) <= 2) yods.push(`${a.name}–${b.name} pointing to ${x.name} in ${x.sign}${x.house ? ` (house ${x.house})` : ''}`); }
    for (let k = j + 1; k < 10; k++) { const x = ps[k]; const el = elementOfIdx(signIdx(a.lon)); if ([arc(a.lon, b.lon), arc(a.lon, x.lon), arc(b.lon, x.lon)].every(v => Math.abs(v - 120) <= 6) && elementOfIdx(signIdx(b.lon)) === el && elementOfIdx(signIdx(x.lon)) === el) gt.push({ names: [a.name, b.name, x.name], el }); }
  }
  if (tsq.length) out.push({ id: 't-square', system: 'Western', title: 'T-square', text: `A T-square creates productive tension: two planets pull in opposite directions and the apex planet is where that pressure gets channelled into effort and achievement. ${tsq[0]}.`, basis: `${tsq.length} configuration${tsq.length > 1 ? 's' : ''} within 6°` });
  const GT_TEXT: Record<string, string> = { Fire: 'inspiration and confidence flow easily', Earth: 'practical skill and steadiness come naturally', Air: 'ideas, conversation and connection come naturally', Water: 'emotional intuition and empathy flow easily' };
  if (gt.length) out.push({ id: 'grand-trine', system: 'Western', title: `Grand trine in ${gt[0].el}`, text: `${list(gt[0].names)} form a closed triangle of support in ${gt[0].el} signs: ${GT_TEXT[gt[0].el]}. The gift is ease; the task is to use it rather than coast on it.`, basis: 'Three planets mutually trine within 6° in one element' });
  if (yods.length) out.push({ id: 'yod', system: 'Western', title: 'Yod (Finger of God)', text: `A yod points two harmonising planets at a third through uneasy 150° angles. The apex planet feels like a calling that asks for repeated adjustment: ${yods[0]}.`, basis: 'Sextile within 2° with a third planet quincunx both within 2°' });

  // 7 Mutual reception (traditional rulers)
  const rec: string[] = [];
  for (let i = 0; i < 7; i++) for (let j = i + 1; j < 7; j++) { const a = ps[i], b = ps[j]; if (TRAD_RULER[signIdx(a.lon)] === b.key && TRAD_RULER[signIdx(b.lon)] === a.key) rec.push(`${a.name} in ${a.sign} and ${b.name} in ${b.sign}`); }
  if (rec.length) out.push({ id: 'reception', system: 'Western', title: 'Mutual reception', text: `${rec.join('; ')} each sit in the other's sign. They cooperate like trusted allies who can swap roles, so either planet can draw on the other's strengths.`, basis: 'Traditional rulerships' });

  // 8 Out-of-bounds
  const oob = ps.map(p => ({ p, dec: declination(p.key, c.utc) })).filter(x => Math.abs(x.dec) > OBLIQUITY);
  if (oob.length) out.push({ id: 'oob', system: 'Western', title: `Out of bounds: ${list(oob.map(x => x.p.name))}`, text: `${list(oob.map(x => x.p.name))} ${oob.length === 1 ? 'was' : 'were'} beyond the Sun's furthest reach north or south. Out-of-bounds planets behave unconventionally: original, hard to rule, and often a source of unusual talent.`, basis: oob.map(x => `${x.p.name} ${x.dec.toFixed(2)}°`).join(', ') + ' declination' });

  if (opts.timeKnown && c.asc != null && c.cusps) {
    // 9 Part of Fortune
    const pof = c.bodies.find(b => b.key === 'fortune');
    if (pof?.house) out.push({ id: 'fortune', system: 'Western', title: `Part of Fortune in house ${pof.house}`, text: `Your Part of Fortune in ${pof.sign} falls in the house of ${HOUSE_THEME[pof.house]}. This is where ease, wellbeing and good fortune tend to show up when you engage with it.`, basis: pof.note ?? 'Ascendant, Sun and Moon' });

    // 10 Annual profection
    const [by, bm, bd] = opts.date.split('-').map(Number);
    let age = today.getFullYear() - by; if (today.getMonth() + 1 < bm || (today.getMonth() + 1 === bm && today.getDate() < bd)) age--;
    if (age >= 0) {
      const house = (age % 12) + 1; const sIdx = (signIdx(c.asc) + age) % 12; const lord = TRAD_RULER[sIdx];
      const lordNow = SIGNS[signIdx(eclLon(ASTRO_BODY[lord], today))];
      out.push({ id: 'profection', system: 'Western', title: `Profection year: house ${house}`, text: `At age ${age} your year activates the house of ${HOUSE_THEME[house]}, in ${SIGNS[sIdx]}. ${NAME[lord]} is your time lord this year and is currently travelling through ${lordNow}; its movements carry extra weight for you until your next birthday.`, basis: `Age ${age} → house ${house}, whole-sign from ${SIGNS[signIdx(c.asc)]} rising` });
    }

    // 14 Intercepted signs
    const cuspSigns = c.cusps.slice(0, 12).map(signIdx);
    const present = new Set(cuspSigns);
    const missing = SIGNS.map((_, i) => i).filter(i => !present.has(i));
    const dup = SIGNS.map((_, i) => i).filter(i => cuspSigns.filter(x => x === i).length > 1);
    if (missing.length) out.push({ id: 'interception', system: 'Western', title: `Intercepted: ${list(missing.map(i => SIGNS[i]))}`, text: `${list(missing.map(i => SIGNS[i]))} ${missing.length === 1 ? 'does' : 'do'} not start any house in your chart. Intercepted signs describe qualities that develop later and more privately, while ${list(dup.map(i => SIGNS[i]))} ${dup.length === 1 ? 'rules' : 'rule'} two houses each and so carry extra weight.`, basis: 'Signs on the twelve house cusps' });

    // 15 Sect
    const sun = c.bodies.find(b => b.key === 'sun');
    if (sun?.house) { const day = sun.house >= 7; out.push({ id: 'sect', system: 'Western', title: day ? 'Day chart' : 'Night chart', text: day ? 'You were born with the Sun above the horizon. In Hellenistic astrology the Sun, Jupiter and Saturn lead a day chart: visible purpose, public effort and reputation matter.' : 'You were born with the Sun below the horizon. In Hellenistic astrology the Moon, Venus and Mars lead a night chart: inner life, feeling and personal bonds steer you.', basis: `Sun in house ${sun.house}` }); }
  }

  // 11 Personal year
  const py = personalYear(opts.date, today.getFullYear());
  out.push({ id: 'personal-year', system: 'Numerology', title: `Personal Year ${py} (${today.getFullYear()})`, text: `You are in ${PY_TEXT[py]}`, basis: `Birth month + day + ${today.getFullYear()}, reduced` });

  // 12 Void-of-course Moon (needs an exact time)
  if (opts.timeKnown) {
    const voc = voidOfCourseMoon(c);
    if (voc?.void) out.push({ id: 'voc-moon', system: 'Western', title: 'Void-of-course Moon at birth', text: 'Your Moon made no further major aspect before leaving its sign. People with this signature often feel emotionally self-contained and follow their own instincts rather than outside expectations.', basis: `Moon changed sign about ${voc.ingressHours} hours after birth with no aspect in between` });
  }

  // 13 Polarity
  const yang = ps.filter(p => signIdx(p.lon) % 2 === 0).length; const yin = 10 - yang;
  out.push({ id: 'polarity', system: 'Western', title: Math.abs(yang - yin) <= 1 ? 'Balanced polarity' : yang > yin ? 'Yang emphasis' : 'Yin emphasis', text: Math.abs(yang - yin) <= 1 ? 'Your planets split evenly between active (fire/air) and receptive (earth/water) signs, so you move easily between initiating and absorbing.' : yang > yin ? 'Most of your planets are in fire and air signs: outward, initiating and expressive.' : 'Most of your planets are in earth and water signs: receptive, steady and inward-focused.', basis: `${yang} yang (${yang * 10}%) · ${yin} yin (${yin * 10}%)` });
  return out;
}

export type { BodyPos };
