import * as Astronomy from 'astronomy-engine';
import { eclLon, fmtLon, type ChartResult } from '@/lib/astro';

/** Transit Overlay (MOD-007): today's transits to the natal chart and a 90-day timeline of major events. Deterministic. */
const T_BODIES: [string, string, string, Astronomy.Body][] = [
  ['sun', 'Sun', '☉', Astronomy.Body.Sun], ['moon', 'Moon', '☽', Astronomy.Body.Moon],
  ['mercury', 'Mercury', '☿', Astronomy.Body.Mercury], ['venus', 'Venus', '♀', Astronomy.Body.Venus],
  ['mars', 'Mars', '♂', Astronomy.Body.Mars], ['jupiter', 'Jupiter', '♃', Astronomy.Body.Jupiter],
  ['saturn', 'Saturn', '♄', Astronomy.Body.Saturn], ['uranus', 'Uranus', '♅', Astronomy.Body.Uranus],
  ['neptune', 'Neptune', '♆', Astronomy.Body.Neptune], ['pluto', 'Pluto', '♇', Astronomy.Body.Pluto],
];
const ASPECTS = [
  { type: 'Conjunction', symbol: '☌', angle: 0, nature: 'merges with' }, { type: 'Opposition', symbol: '☍', angle: 180, nature: 'faces' },
  { type: 'Trine', symbol: '△', angle: 120, nature: 'flows easily with' }, { type: 'Square', symbol: '□', angle: 90, nature: 'pushes against' },
  { type: 'Sextile', symbol: '⚹', angle: 60, nature: 'opens a door for' },
];
/** Transit orbs are tighter than natal orbs: fast movers 2°, slow movers 3°. */
const ORB: Record<string, number> = { sun: 2, moon: 2, mercury: 2, venus: 2, mars: 2, jupiter: 3, saturn: 3, uranus: 3, neptune: 3, pluto: 3 };
const NATAL_TARGETS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'asc', 'mc'];
const SLOW = ['mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
const WEIGHT: Record<string, number> = { sun: 2, moon: 1, mercury: 2, venus: 2, mars: 3, jupiter: 4, saturn: 5, uranus: 5, neptune: 5, pluto: 5 };
const norm = (x: number) => ((x % 360) + 360) % 360;
const sep = (a: number, b: number) => Math.abs(norm(a - b + 180) - 180);
const DAY = 864e5;

export type TransitPos = { key: string; name: string; glyph: string; lon: number; sign: string; deg: number; retro: boolean };
export type TransitHit = { transit: TransitPos; natalKey: string; natalName: string; natalRetro: boolean; type: string; symbol: string; orb: number; applying: boolean; weight: number; text: string };
export type TransitEvent = { date: Date; kind: 'exact' | 'station' | 'ingress'; title: string; detail: string; retro: boolean; doubleRx: boolean; weight: number };

export function transitPositions(d: Date): TransitPos[] {
  return T_BODIES.map(([key, name, glyph, body]) => {
    const lon = eclLon(body, d);
    const retro = key !== 'sun' && key !== 'moon' && norm(eclLon(body, new Date(d.getTime() + DAY / 2)) - eclLon(body, new Date(d.getTime() - DAY / 2)) + 180) - 180 < 0;
    const f = fmtLon(lon);
    return { key, name, glyph, lon, sign: f.sign, deg: f.deg, retro };
  });
}

function natalPoints(natal: ChartResult) {
  const pts = natal.bodies.filter(b => NATAL_TARGETS.includes(b.key)).map(b => ({ key: b.key, name: b.name, lon: b.lon, retro: b.retro }));
  if (natal.asc != null) pts.push({ key: 'asc', name: 'Ascendant', lon: natal.asc, retro: false });
  if (natal.mc != null) pts.push({ key: 'mc', name: 'Midheaven', lon: natal.mc, retro: false });
  return pts;
}

const THEME: Record<string, string> = { sun: 'identity and vitality', moon: 'feelings and needs', mercury: 'thinking and conversations', venus: 'love, money and values', mars: 'drive and conflict', jupiter: 'growth and opportunity', saturn: 'responsibility and limits', uranus: 'change and freedom', neptune: 'dreams and uncertainty', pluto: 'power and deep change', asc: 'how you meet the world', mc: 'career and reputation' };
const hitText = (t: string, type: string, n: string, retro: boolean) => {
  const a = ASPECTS.find(x => x.type === type)!;
  return `Transiting ${t[0].toUpperCase()}${t.slice(1)} ${a.nature} your natal ${n}${retro ? ' while retrograde, so the theme is revisited rather than started fresh' : ''}.`;
};

/** Transits on a date, sorted by significance: applying first, then tighter orb, then slower planet. */
export function transitsTo(natal: ChartResult, date: Date): TransitHit[] {
  const now = transitPositions(date), next = transitPositions(new Date(date.getTime() + DAY));
  const out: TransitHit[] = [];
  natalPoints(natal).forEach(n => now.forEach((t, i) => {
    if (n.key === 'moon' && !natal.input.time) return;
    for (const a of ASPECTS) {
      const orb = Math.abs(sep(t.lon, n.lon) - a.angle);
      if (orb > ORB[t.key]) continue;
      const applying = Math.abs(sep(next[i].lon, n.lon) - a.angle) < orb;
      const label = n.key === 'asc' ? 'Ascendant' : n.key === 'mc' ? 'Midheaven' : n.name;
      out.push({ transit: t, natalKey: n.key, natalName: label, natalRetro: n.retro, type: a.type, symbol: a.symbol, orb, applying, weight: WEIGHT[t.key] + (applying ? 1 : 0) + (orb < 1 ? 1 : 0),
        text: `${hitText(THEME[t.key], a.type, THEME[n.key] ?? label, t.retro)}` });
    }
  }));
  return out.sort((x, y) => Number(y.applying) - Number(x.applying) || x.orb - y.orb || y.weight - x.weight);
}

/** Major transit events over the next `days`: exact slow-planet aspects to personal points, retrograde stations and sign ingresses. */
export function upcomingEvents(natal: ChartResult, from: Date, days = 90): TransitEvent[] {
  const start = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), 12));
  const series = Array.from({ length: days + 2 }, (_, i) => transitPositions(new Date(start.getTime() + (i - 1) * DAY)));
  const natalRx = new Set(natal.bodies.filter(b => b.retro && !['northNode', 'southNode'].includes(b.key)).map(b => b.key));
  const pts = natalPoints(natal).filter(p => ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'asc', 'mc'].includes(p.key) && (p.key !== 'moon' || !!natal.input.time));
  const out: TransitEvent[] = [];
  for (let d = 1; d <= days; d++) {
    const date = new Date(start.getTime() + (d - 1) * DAY);
    const prev = series[d - 1], cur = series[d], nxt = series[d + 1];
    cur.forEach((t, i) => {
      if (t.key === 'moon' || t.key === 'sun') return;
      if (prev[i].retro !== t.retro) out.push({ date, kind: 'station', title: `${t.name} turns ${t.retro ? 'retrograde' : 'direct'}`, detail: `${t.name} stations ${t.retro ? 'retrograde' : 'direct'} at ${t.deg}° ${t.sign}. ${t.retro ? 'A review period begins for ' + THEME[t.key] + '.' : 'Plans around ' + THEME[t.key] + ' can move forward again.'}`, retro: t.retro, doubleRx: t.retro && natalRx.has(t.key), weight: WEIGHT[t.key] + 2 });
      if (Math.floor(prev[i].lon / 30) !== Math.floor(t.lon / 30) && SLOW.includes(t.key) || (Math.floor(prev[i].lon / 30) !== Math.floor(t.lon / 30) && ['mercury', 'venus'].includes(t.key)))
        out.push({ date, kind: 'ingress', title: `${t.name} enters ${t.sign}`, detail: `${t.name} moves into ${t.sign}, shifting the tone of ${THEME[t.key]}.`, retro: t.retro, doubleRx: false, weight: WEIGHT[t.key] });
    });
    SLOW.forEach(k => {
      const i = T_BODIES.findIndex(b => b[0] === k);
      pts.forEach(n => ASPECTS.forEach(a => {
        const o = (s: TransitPos[]) => Math.abs(sep(s[i].lon, n.lon) - a.angle);
        const oc = o(cur);
        if (oc < 1.2 && oc <= o(prev) && oc < o(nxt)) {
          const t = cur[i]; const label = n.key === 'asc' ? 'Ascendant' : n.key === 'mc' ? 'Midheaven' : n.name;
          out.push({ date, kind: 'exact', title: `${t.name} ${a.symbol} natal ${label}`, detail: hitText(THEME[t.key], a.type, THEME[n.key] ?? label, t.retro), retro: t.retro, doubleRx: t.retro && natalRx.has(n.key), weight: WEIGHT[k] + (['sun', 'moon', 'asc', 'mc'].includes(n.key) ? 2 : 0) });
        }
      }));
    });
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime() || b.weight - a.weight);
}
