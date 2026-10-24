import { fmtLon, type ChartResult } from '@/lib/astro';

/** A placement quoted in an edition's own text (ecliptic longitude in degrees), checked against the calculator. */
export type ChartCheckPoint = { key: string; label: string; volume: string; lon: number };
export type ChartCheckStatus = 'match' | 'close' | 'differs' | 'missing';
export type ChartCheckRow = ChartCheckPoint & { calculated: string; diff: number | null; diffText: string; status: ChartCheckStatus };

/** Within 6′ is a match (rounding between programs); within 1° is close; anything larger is flagged as a difference. */
export const MATCH_DEG = 0.1;
export const CLOSE_DEG = 1;

const sep = (a: number, b: number) => { const d = Math.abs((((a - b) % 360) + 540) % 360 - 180); return d; };
export function formatArc(deg: number) {
  const d = Math.floor(deg), m = Math.round((deg - d) * 60);
  return m === 60 ? `${d + 1}°00′` : d ? `${d}°${String(m).padStart(2, '0')}′` : `${m}′`;
}

function calculatedLon(chart: Pick<ChartResult, 'bodies' | 'asc' | 'mc'>, key: string): number | null {
  if (key === 'asc') return chart.asc ?? null;
  if (key === 'mc') return chart.mc ?? null;
  return chart.bodies.find(b => b.key === key)?.lon ?? null;
}

/** Compare each quoted placement with the calculated chart; mismatches are reported, never silently corrected. */
export function chartCheckRows(points: ChartCheckPoint[], chart: Pick<ChartResult, 'bodies' | 'asc' | 'mc'>): ChartCheckRow[] {
  return points.map(p => {
    const lon = calculatedLon(chart, p.key);
    if (lon == null) return { ...p, calculated: '—', diff: null, diffText: '', status: 'missing' as const };
    const diff = sep(lon, p.lon);
    const status: ChartCheckStatus = diff <= MATCH_DEG ? 'match' : diff <= CLOSE_DEG ? 'close' : 'differs';
    return { ...p, calculated: fmtLon(lon).text, diff, diffText: formatArc(diff), status };
  });
}
