import { fmtLon, type ChartInput, type ChartResult } from '@/lib/astro';
import { balance, isTimed, ordinal, signOfLon } from '@/lib/investigations';
import { moonPhase } from '@/lib/currentChapter';

/**
 * Printable keepsakes (Birth-Sky Certificate and Star Scroll), built only from calculated positions.
 * The keepsake number is a stable label derived from the birth details; it is not a registry or an official record.
 */
export interface CertificateRow { label: string; value: string }

const pos = (lon: number) => { const f = fmtLon(lon); return `${f.deg}°${String(f.min).padStart(2, '0')}′ ${f.sign}`; };

/** Sun, Moon, Rising and Midheaven, plus the leading element. Rising and Midheaven need a birth time. */
export function certificateRows(c: ChartResult): CertificateRow[] {
  const timed = isTimed(c);
  const sun = c.bodies.find(b => b.key === 'sun')!; const moon = c.bodies.find(b => b.key === 'moon')!;
  const rows: CertificateRow[] = [{ label: 'Sun', value: pos(sun.lon) }, { label: 'Moon', value: timed ? pos(moon.lon) : `${moon.sign} (time unknown)` }];
  if (timed && c.asc != null) rows.push({ label: 'Rising', value: pos(c.asc) });
  if (timed && c.mc != null) rows.push({ label: 'Midheaven', value: pos(c.mc) });
  const b = balance(c);
  rows.push({ label: 'Leading element', value: `${b.topElement[0]} · ${b.topElement[1]} of 10 planets` });
  const ph = moonPhase(sun.lon, moon.lon);
  rows.push({ label: 'Moon phase at birth', value: `${ph.name} · ${ph.lit}% lit` });
  return rows;
}

/** Stable "ZK-XXXXXX" label from the birth moment and place (FNV-1a), so a reprint shows the same number. */
export function keepsakeNumber(input: Pick<ChartInput, 'date' | 'time' | 'lat' | 'lon'>): string {
  const key = `${input.date}|${input.time ?? ''}|${input.lat.toFixed(3)}|${input.lon.toFixed(3)}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return `ZK-${h.toString(36).toUpperCase().padStart(7, '0').slice(-6)}`;
}

export interface ScrollSection { title: string; rows: CertificateRow[] }
const MAIN = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'northNode', 'chiron'];

/** The Star Scroll's columns: planets, houses (timed only), closest aspects and balance. */
export function scrollSections(c: ChartResult): ScrollSection[] {
  const timed = isTimed(c);
  const out: ScrollSection[] = [{
    title: 'The planets',
    rows: c.bodies.filter(b => MAIN.includes(b.key)).map(b => ({ label: `${b.glyph} ${b.name}`, value: `${b.key === 'moon' && !timed ? b.sign : pos(b.lon)}${timed && b.house ? ` · ${ordinal(b.house)}` : ''}${b.retro ? ' · Rx' : ''}` })),
  }];
  if (timed && c.cusps) out.push({ title: 'The houses', rows: c.cusps.map((lon, i) => ({ label: `${ordinal(i + 1)} house`, value: `${signOfLon(lon)} ${Math.floor(lon % 30)}°` })) });
  out.push({ title: 'Closest aspects', rows: [...c.aspects].sort((a, b) => a.orb - b.orb).slice(0, 8).map(a => ({ label: `${a.a} ${a.symbol} ${a.b}`, value: `${a.type} · ${a.orb.toFixed(1)}°` })) });
  const b = balance(c);
  out.push({ title: 'Balance', rows: [...Object.entries(b.el).map(([k, v]) => ({ label: k, value: `${v} of 10` })), ...Object.entries(b.mode).map(([k, v]) => ({ label: k[0].toUpperCase() + k.slice(1), value: `${v} of 10` }))] });
  return out;
}
