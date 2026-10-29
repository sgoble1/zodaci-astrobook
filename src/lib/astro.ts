// In-app natal chart + Ba Zi calculator.
// Planet positions: astronomy-engine (VSOP87 / ELP-based, arc-second level for 1900–2100).
// Angles: RAMC from Greenwich apparent sidereal time + longitude; Placidus houses by default (Porphyry, Whole Sign, Equal selectable).
// Ba Zi: sexagenary cycle with solar-term (sun-longitude) boundaries.
import { chironLon } from './chiron';
import * as Astronomy from 'astronomy-engine';
import type { ConfidenceLevel } from '@/content/confidence';

export const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'] as const;
export const SIGN_GLYPH = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

export interface ChartInput {
  date: string;          // YYYY-MM-DD (local civil date)
  time: string | null;   // HH:MM (local clock) or null when unknown
  lat: number; lon: number;
  tz: string;            // IANA time zone
  placeLabel: string;
  placeSource: 'geocoded' | 'manual';
  sex?: 'male' | 'female' | 'unspecified';
  houseSystem?: HouseSystem;
}
export type HouseSystem = 'porphyry' | 'placidus' | 'whole' | 'equal';
export const HOUSE_SYSTEMS: { id: HouseSystem; label: string; note: string }[] = [
  { id: 'porphyry', label: 'Porphyry', note: 'Splits each quarter between the Ascendant and Midheaven into three equal parts. House placements can differ from Placidus.' },
  { id: 'placidus', label: 'Placidus', note: 'Splits each quarter by the time a degree takes to rise. A common modern Western system and Zodaci’s default.' },
  { id: 'whole', label: 'Whole Sign', note: 'Each house is one whole sign, starting with the rising sign. The oldest Hellenistic method.' },
  { id: 'equal', label: 'Equal', note: 'Twelve 30° houses measured from the exact Ascendant degree.' },
];

export interface Flag { level: ConfidenceLevel; topic: string; note: string; }

export interface BodyPos {
  key: string; name: string; glyph: string;
  lon: number; sign: string; signGlyph: string; deg: number; min: number;
  house: number | null; retro: boolean; confidence: ConfidenceLevel; note?: string;
}
export interface AspectHit { a: string; b: string; type: string; symbol: string; exact: number; orb: number; applying: boolean; }
export interface PillarCalc { label: string; stem: string; branch: string; romanized: string; stemElement: string; branchElement: string; animal: string; polarity: 'Yang' | 'Yin'; confidence: ConfidenceLevel; note: string; }

export interface ChartResult {
  input: ChartInput;
  utc: Date; utcOffsetMin: number;
  bodies: BodyPos[];
  asc: number | null; mc: number | null; cusps: number[] | null;
  aspects: AspectHit[];
  bazi: PillarCalc[];
  elements: Record<string, number>;
  flags: Flag[];
}

const norm = (x: number) => ((x % 360) + 360) % 360;
const rad = Math.PI / 180;

export const fmtLon = (lon: number) => {
  const s = Math.floor(norm(lon) / 30); const d = norm(lon) - s * 30;
  const deg = Math.floor(d); const min = Math.floor((d - deg) * 60);
  return { sign: SIGNS[s], signGlyph: SIGN_GLYPH[s], deg, min, text: `${SIGNS[s]} ${deg}°${String(min).padStart(2, '0')}′` };
};

/** Minutes east of UTC for `tz` at instant `d` (uses the browser's historical tz database). */
function tzOffsetMin(d: Date, tz: string) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    .formatToParts(d).filter(x => x.type !== 'literal').map(x => [x.type, +x.value]));
  return (Date.UTC(p.year, p.month - 1, p.day, p.hour % 24, p.minute, p.second) - d.getTime()) / 60000;
}

export function localToUtc(date: string, time: string, tz: string) {
  const [y, m, d] = date.split('-').map(Number); const [hh, mm] = time.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  let off = tzOffsetMin(new Date(guess), tz);
  off = tzOffsetMin(new Date(guess - off * 60000), tz);
  return { utc: new Date(guess - off * 60000), offset: off };
}

const BODIES: [string, string, string, Astronomy.Body][] = [
  ['sun', 'Sun', '☉', Astronomy.Body.Sun], ['moon', 'Moon', '☽', Astronomy.Body.Moon],
  ['mercury', 'Mercury', '☿', Astronomy.Body.Mercury], ['venus', 'Venus', '♀', Astronomy.Body.Venus],
  ['mars', 'Mars', '♂', Astronomy.Body.Mars], ['jupiter', 'Jupiter', '♃', Astronomy.Body.Jupiter],
  ['saturn', 'Saturn', '♄', Astronomy.Body.Saturn], ['uranus', 'Uranus', '♅', Astronomy.Body.Uranus],
  ['neptune', 'Neptune', '♆', Astronomy.Body.Neptune], ['pluto', 'Pluto', '♇', Astronomy.Body.Pluto],
];

export function eclLon(body: Astronomy.Body, d: Date) {
  const t = Astronomy.MakeTime(d);
  if (body === Astronomy.Body.Sun) return Astronomy.SunPosition(t).elon;
  if (body === Astronomy.Body.Moon) return Astronomy.EclipticGeoMoon(t).lon;
  return Astronomy.Ecliptic(Astronomy.GeoVector(body, t, true)).elon;
}

/** Mean Black Moon Lilith = mean lunar apogee (Meeus ch. 47 mean perigee + 180°). */
function meanLilith(d: Date) {
  const T = (d.getTime() / 86400000 + 2440587.5 - 2451545) / 36525;
  return norm(83.3532465 + 4069.0137287 * T - 0.01032 * T * T + 180);
}

/** Mean lunar node (Meeus 47.7). */
function meanNode(d: Date) {
  const T = (d.getTime() / 86400000 + 2440587.5 - 2451545) / 36525;
  return norm(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T);
}

function angles(d: Date, lat: number, lon: number) {
  const t = Astronomy.MakeTime(d);
  const gast = Astronomy.SiderealTime(t);             // hours
  const ramc = norm(gast * 15 + lon);
  const T = t.tt / 36525;
  const eps = (23.4392911 - 0.0130042 * T) * rad;
  const r = ramc * rad, phi = lat * rad;
  const mc = norm(Math.atan2(Math.sin(r), Math.cos(r) * Math.cos(eps)) / rad);
  const ascAt = (rr: number, ff: number) => norm(Math.atan2(Math.cos(rr), -(Math.sin(rr) * Math.cos(eps) + Math.tan(ff) * Math.sin(eps))) / rad);
  const asc = ascAt(r, phi);
  // Vertex: the western ecliptic–prime-vertical intersection (ascendant of the co-latitude, RAMC + 180°).
  const vertex = ascAt(r + Math.PI, Math.PI / 2 - phi);
  return { asc, mc, vertex, ramc, eps };
}

function placidus(asc: number, mc: number, ramc: number, eps: number, lat: number) {
  const phi = lat * rad;
  const lonOfRa = (ra: number) => norm(Math.atan2(Math.sin(ra * rad), Math.cos(ra * rad) * Math.cos(eps)) / rad);
  const cusp = (f: number, above: boolean) => {
    let ra = ramc + (above ? f * 90 : 180 - f * 90);
    for (let i = 0; i < 30; i++) {
      const dec = Math.asin(Math.sin(eps) * Math.sin(lonOfRa(ra) * rad));
      const x = Math.tan(phi) * Math.tan(dec);
      if (Math.abs(x) >= 1) return null;
      const ad = Math.asin(x) / rad;
      ra = above ? ramc + f * (90 + ad) : ramc + 180 - f * (90 - ad);
    }
    return lonOfRa(ra);
  };
  const c11 = cusp(1 / 3, true), c12 = cusp(2 / 3, true), c2 = cusp(2 / 3, false), c3 = cusp(1 / 3, false);
  if ([c11, c12, c2, c3].some(c => c == null)) return null; // undefined near the polar circles
  const c = [asc, c2!, c3!, norm(mc + 180)];
  return [...c, norm(c11! + 180), norm(c12! + 180), norm(asc + 180), norm(c2! + 180), norm(c3! + 180), mc, c11!, c12!];
}

export function cuspsFor(system: HouseSystem, a: { asc: number; mc: number; ramc: number; eps: number }, lat: number): number[] {
  if (system === 'whole') { const s0 = Math.floor(a.asc / 30) * 30; return Array.from({ length: 12 }, (_, i) => norm(s0 + i * 30)); }
  if (system === 'equal') return Array.from({ length: 12 }, (_, i) => norm(a.asc + i * 30));
  if (system === 'placidus') return placidus(a.asc, a.mc, a.ramc, a.eps, lat) ?? porphyry(a.asc, a.mc);
  return porphyry(a.asc, a.mc);
}

function porphyry(asc: number, mc: number) {
  const ic = norm(mc + 180), dsc = norm(asc + 180);
  const q1 = norm(ic - asc) / 3, q2 = norm(dsc - ic) / 3;
  return [asc, asc + q1, asc + 2 * q1, ic, ic + q2, ic + 2 * q2, dsc, dsc + q1, dsc + 2 * q1, mc, mc + q2, mc + 2 * q2].map(norm);
}
export const houseOf = (lon: number, cusps: number[]) => {
  for (let i = 0; i < 12; i++) { const a = cusps[i], b = cusps[(i + 1) % 12]; if (norm(lon - a) < norm(b - a)) return i + 1; }
  return 12;
};

const ASPECT_DEFS = [
  { type: 'Conjunction', symbol: '☌', angle: 0, orb: 8 }, { type: 'Opposition', symbol: '☍', angle: 180, orb: 8 },
  { type: 'Trine', symbol: '△', angle: 120, orb: 7 }, { type: 'Square', symbol: '□', angle: 90, orb: 7 },
  { type: 'Sextile', symbol: '⚹', angle: 60, orb: 5 },
];

// ---------- Ba Zi ----------
export const STEMS = [['甲', 'Jia', 'Wood'], ['乙', 'Yi', 'Wood'], ['丙', 'Bing', 'Fire'], ['丁', 'Ding', 'Fire'], ['戊', 'Wu', 'Earth'], ['己', 'Ji', 'Earth'], ['庚', 'Geng', 'Metal'], ['辛', 'Xin', 'Metal'], ['壬', 'Ren', 'Water'], ['癸', 'Gui', 'Water']];
export const BRANCHES = [['子', 'Zi', 'Water', 'Rat'], ['丑', 'Chou', 'Earth', 'Ox'], ['寅', 'Yin', 'Wood', 'Tiger'], ['卯', 'Mao', 'Wood', 'Rabbit'], ['辰', 'Chen', 'Earth', 'Dragon'], ['巳', 'Si', 'Fire', 'Snake'], ['午', 'Wu', 'Fire', 'Horse'], ['未', 'Wei', 'Earth', 'Goat'], ['申', 'Shen', 'Metal', 'Monkey'], ['酉', 'You', 'Metal', 'Rooster'], ['戌', 'Xu', 'Earth', 'Dog'], ['亥', 'Hai', 'Water', 'Pig']];
const mod = (a: number, n: number) => ((a % n) + n) % n;
const pillar = (label: string, s: number, b: number, confidence: ConfidenceLevel, note: string): PillarCalc => ({
  label, stem: STEMS[s][0], branch: BRANCHES[b][0], romanized: `${STEMS[s][1]} ${BRANCHES[b][1]}`,
  stemElement: STEMS[s][2], branchElement: BRANCHES[b][2], animal: BRANCHES[b][3], polarity: s % 2 === 0 ? 'Yang' : 'Yin', confidence, note,
});

function jdn(y: number, m: number, d: number) {
  const a = Math.floor((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

function bazi(input: ChartInput, instant: Date, sunLon: number, flags: Flag[]): PillarCalc[] {
  const [y, m, d] = input.date.split('-').map(Number);
  // Distance (in degrees of solar longitude) to the nearest 30° solar-term boundary at 15° past each sign (Jie terms)
  const toJie = Math.abs(mod(sunLon - 315 + 15, 30) - 15);
  const nearTerm = toJie < 1.05; // ≈ 1 day
  const solarYear = (m <= 2 && sunLon >= 270 && sunLon < 315) || m === 1 ? y - 1 : y;
  const ys = mod(solarYear - 4, 10), yb = mod(solarYear - 4, 12);
  const monthOffset = Math.floor(mod(sunLon - 315, 360) / 30);
  const mb = mod(monthOffset + 2, 12), ms = mod((ys % 5) * 2 + 2 + monthOffset, 10);
  const dayIdx = mod(jdn(y, m, d) + 49, 60);
  const ds = dayIdx % 10, db = dayIdx % 12;
  const out = [
    pillar('Year', ys, yb, nearTerm && Math.abs(mod(sunLon - 315 + 180, 360) - 180) < 1.05 ? 'ambiguous' : 'confirmed', `Solar year ${solarYear} (begins at Lichun, Sun 315°).`),
    pillar('Month', ms, mb, nearTerm ? 'ambiguous' : 'derived', `Sun at ${sunLon.toFixed(2)}° → ${BRANCHES[mb][1]} month (solar term boundary every 30° from 315°).`),
  ];
  if (nearTerm) flags.push({ level: 'ambiguous', topic: 'Ba Zi month', note: 'Birth is within ~1 day of a solar-term change; the month pillar (and possibly year) flips if the time is off.' });
  let dayConf: ConfidenceLevel = 'derived';
  if (input.time) {
    const hr = +input.time.split(':')[0];
    if (hr === 23) { dayConf = 'ambiguous'; flags.push({ level: 'ambiguous', topic: 'Ba Zi day', note: 'Born in the 23:00 Zi hour — some schools start the next day at 23:00, others at midnight. Midnight used here.' }); }
    out.push(pillar('Day', ds, db, dayConf, `Julian Day ${jdn(y, m, d)} → cycle index ${dayIdx + 1}/60 (local civil date, midnight boundary).`));
    const hb = Math.floor((hr + 1) / 2) % 12, hs = mod((ds % 5) * 2 + hb, 10);
    out.push(pillar('Hour', hs, hb, 'approximate', `Clock time ${input.time} → ${BRANCHES[hb][1]} hour. Clock time, not local solar time — can shift near 2-hour boundaries.`));
  } else {
    out.push(pillar('Day', ds, db, 'derived', `Julian Day ${jdn(y, m, d)} → cycle index ${dayIdx + 1}/60.`));
    flags.push({ level: 'ambiguous', topic: 'Ba Zi hour', note: 'No birth time — the Hour pillar cannot be computed; element balance uses 3 pillars.' });
  }
  void instant;
  return out;
}

export function computeChart(input: ChartInput): ChartResult {
  const flags: Flag[] = [];
  const timeKnown = !!input.time;
  const { utc, offset } = localToUtc(input.date, input.time ?? '12:00', input.tz);
  if (!timeKnown) flags.push({ level: 'ambiguous', topic: 'Birth time', note: 'No time given — noon used. Moon may be off by ±6.5°, Ascendant, Midheaven, houses and Hour pillar are not computed.' });
  if (input.placeSource === 'manual') flags.push({ level: 'approximate', topic: 'Place', note: 'Coordinates and time zone entered manually — verify the zone applied the correct historical daylight-saving rule.' });
  const [yr] = input.date.split('-').map(Number);
  if (yr < 1900 || yr > 2100) flags.push({ level: 'approximate', topic: 'Ephemeris range', note: 'Outside 1900–2100 the ephemeris precision and historical time-zone data degrade.' });
  if (yr < 1970) flags.push({ level: 'approximate', topic: 'Historical time zone', note: 'Pre-1970 daylight-saving rules were irregular in many places; confirm the offset below.' });

  let asc: number | null = null, mc: number | null = null, cusps: number[] | null = null, vertex: number | null = null;
  if (timeKnown) { const a = angles(utc, input.lat, input.lon); ({ asc, mc, vertex } = a); cusps = cuspsFor(input.houseSystem ?? 'placidus', a, input.lat); }
  // Angles move ~1° per 4 minutes of clock time; near a sign edge a small recording error changes the sign.
  if (asc != null && mc != null) for (const [topic, lon, mins] of [['Ascendant', asc, 4], ['Midheaven', mc, 4]] as const) {
    const edge = Math.min(norm(lon) % 30, 30 - (norm(lon) % 30));
    if (edge < 1) flags.push({ level: 'approximate', topic, note: `${fmtLon(lon).text} is within ${edge.toFixed(1)}° of a sign change — a birth time off by about ${Math.max(1, Math.round(edge * mins))} minutes would move it into the neighbouring sign.` });
  }

  const bodies: BodyPos[] = BODIES.map(([key, name, glyph, b]) => {
    const lon = eclLon(b, utc);
    const later = eclLon(b, new Date(utc.getTime() + 43200000)), earlier = eclLon(b, new Date(utc.getTime() - 43200000));
    const retro = key !== 'sun' && key !== 'moon' && norm(later - earlier + 180) - 180 < 0;
    const f = fmtLon(lon);
    let confidence: ConfidenceLevel = 'derived'; let note: string | undefined;
    if (key === 'moon' && !timeKnown) { confidence = 'ambiguous'; note = 'Moon moves ~13°/day; without a time its degree (and possibly sign) is uncertain.'; }
    const inSign = norm(lon) % 30;
    if ((inSign < 0.5 || inSign > 29.5) && (key !== 'moon' || timeKnown)) { confidence = 'approximate'; note = 'Within 0.5° of a sign cusp — double-check against a second ephemeris.'; }
    return { key, name, glyph, lon, sign: f.sign, signGlyph: f.signGlyph, deg: f.deg, min: f.min, house: cusps ? houseOf(lon, cusps) : null, retro, confidence, note };
  });
  const nn = meanNode(utc);
  [['northNode', 'North Node (mean)', '☊', nn], ['southNode', 'South Node (mean)', '☋', norm(nn + 180)]].forEach(([key, name, glyph, lon]) => {
    const f = fmtLon(lon as number);
    bodies.push({ key: key as string, name: name as string, glyph: glyph as string, lon: lon as number, sign: f.sign, signGlyph: f.signGlyph, deg: f.deg, min: f.min, house: cusps ? houseOf(lon as number, cusps) : null, retro: true, confidence: 'derived', note: 'Mean node; the true node can differ by up to ~1.5°.' });
  });
  const point = (key: string, name: string, glyph: string, lon: number, note: string) => {
    const f = fmtLon(lon);
    bodies.push({ key, name, glyph, lon, sign: f.sign, signGlyph: f.signGlyph, deg: f.deg, min: f.min, house: cusps ? houseOf(lon, cusps) : null, retro: false, confidence: 'derived', note });
  };
  const ch = chironLon(utc);
  if (ch != null) {
    const f = fmtLon(ch); const later = chironLon(new Date(utc.getTime() + 864e5)), earlier = chironLon(new Date(utc.getTime() - 864e5));
    bodies.push({ key: 'chiron', name: 'Chiron', glyph: '⚷', lon: ch, sign: f.sign, signGlyph: f.signGlyph, deg: f.deg, min: f.min, house: cusps ? houseOf(ch, cusps) : null, retro: later != null && earlier != null && norm(later - earlier + 180) - 180 < 0, confidence: 'derived', note: 'From a NASA JPL Horizons table (1940–2060), interpolated.' });
  }
  point('lilith', 'Black Moon Lilith (mean)', '⚸', meanLilith(utc), 'Mean lunar apogee; the “true”/oscillating Lilith can differ by several degrees.');
  if (asc != null && vertex != null) {
    const sunLon = bodies[0].lon, moonLon = bodies[1].lon;
    const dayChart = norm(sunLon - asc) > 180; // Sun above the horizon (houses 7–12)
    point('fortune', 'Part of Fortune', '⊕', norm(dayChart ? asc + moonLon - sunLon : asc + sunLon - moonLon), dayChart ? 'Day chart: Ascendant + Moon − Sun.' : 'Night chart: Ascendant + Sun − Moon.');
    point('vertex', 'Vertex', 'Vx', vertex, 'Western intersection of the ecliptic and prime vertical.');
  }

  const pts = [...bodies.filter(b => !['southNode', 'lilith', 'fortune', 'vertex'].includes(b.key)).map(b => ({ name: b.name, lon: b.lon, key: b.key })),
    ...(asc != null ? [{ name: 'Ascendant', lon: asc, key: 'asc' }, { name: 'Midheaven', lon: mc!, key: 'mc' }] : [])];
  const aspects: AspectHit[] = [];
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    if ((pts[i].key === 'asc' && pts[j].key === 'mc')) continue;
    const sep = Math.abs(norm(pts[i].lon - pts[j].lon + 180) - 180);
    for (const a of ASPECT_DEFS) {
      const lum = ['sun', 'moon'].includes(pts[i].key) || ['sun', 'moon'].includes(pts[j].key);
      const orb = Math.abs(sep - a.angle);
      if (orb <= a.orb + (lum ? 2 : 0)) {
        if (!timeKnown && (pts[i].key === 'moon' || pts[j].key === 'moon') && orb > a.orb - 5) continue;
        aspects.push({ a: pts[i].name, b: pts[j].name, type: a.type, symbol: a.symbol, exact: a.angle, orb, applying: false });
      }
    }
  }
  aspects.sort((x, y) => x.orb - y.orb);

  const sun = bodies[0].lon;
  const pillars = bazi(input, utc, sun, flags);
  const elements: Record<string, number> = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
  pillars.forEach(p => { elements[p.stemElement]++; elements[p.branchElement]++; });

  return { input, utc, utcOffsetMin: offset, bodies, asc, mc, cusps, aspects, bazi: pillars, elements, flags };
}

// Short, in-app keyword glosses (not from the PDFs; labelled as such in the UI).
export const SIGN_KEYWORDS: Record<string, string> = {
  Aries: 'initiating, direct, courageous, impatient', Taurus: 'steady, sensual, loyal, resistant to change',
  Gemini: 'curious, verbal, versatile, restless', Cancer: 'protective, feeling, rooted, memory-keeping',
  Leo: 'radiant, generous, creative, proud', Virgo: 'precise, discerning, devoted to craft, self-critical',
  Libra: 'relational, aesthetic, balancing, diplomatic', Scorpio: 'intense, probing, loyal, transformative',
  Sagittarius: 'expansive, philosophical, candid, freedom-seeking', Capricorn: 'structured, ambitious, patient, responsible',
  Aquarius: 'original, principled, detached, future-minded', Pisces: 'porous, imaginative, compassionate, mystical',
};
export const BODY_KEYWORDS: Record<string, string> = {
  sun: 'core identity & vitality', moon: 'emotional needs & instinct', mercury: 'mind & communication', venus: 'love, value & taste',
  mars: 'drive & assertion', jupiter: 'growth & faith', saturn: 'structure & mastery', uranus: 'awakening & freedom',
  neptune: 'dream & transcendence', pluto: 'power & transformation', northNode: 'soul direction', southNode: 'inherited gifts & habits',
  ceres: 'nurture & sustenance', pallas: 'strategy & pattern-sight', juno: 'commitment & partnership', vesta: 'devotion & focus',
};
