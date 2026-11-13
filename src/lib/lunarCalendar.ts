import * as Astronomy from 'astronomy-engine';
import { eclLon, houseOf, SIGNS, type ChartResult } from '@/lib/astro';

export type LunarPhase = 'New Moon' | 'First Quarter' | 'Full Moon' | 'Last Quarter';
export type LunarDay = { date: Date; phase: LunarPhase; lon: number; sign: string; deg: number; house: number | null; contacts: string[] };

const PHASES: LunarPhase[] = ['New Moon', 'First Quarter', 'Full Moon', 'Last Quarter'];
const norm = (x: number) => ((x % 360) + 360) % 360;
const sep = (a: number, b: number) => { const d = Math.abs(norm(a) - norm(b)); return d > 180 ? 360 - d : d; };

/**
 * Every Moon quarter from `from` for `months` months, from the ephemeris. Each is placed in the member's own
 * houses (only when the birth time is known) and lists natal points the Moon conjoins within `orb` degrees.
 * Nothing here is interpretation; it is position and timing only.
 */
export function lunarCalendar(from: Date, months: number, chart: ChartResult | null, orb = 3): LunarDay[] {
  const end = new Date(from); end.setUTCMonth(end.getUTCMonth() + months);
  const out: LunarDay[] = [];
  let q = Astronomy.SearchMoonQuarter(from);
  while (q.time.date < end) {
    const date = q.time.date;
    const lon = norm(eclLon(Astronomy.Body.Moon, date));
    const s = Math.floor(lon / 30);
    out.push({
      date, phase: PHASES[q.quarter], lon, sign: SIGNS[s], deg: Math.floor(lon - s * 30),
      house: chart?.cusps ? houseOf(lon, chart.cusps) : null,
      contacts: chart ? chart.bodies.filter(b => sep(b.lon, lon) <= orb).map(b => b.name) : [],
    });
    q = Astronomy.NextMoonQuarter(q);
  }
  return out;
}
