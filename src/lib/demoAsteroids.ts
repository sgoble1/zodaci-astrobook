import { fmtLon, houseOf, type BodyPos, type ChartResult } from './astro';

/**
 * Ceres, Pallas, Juno and Vesta for the three fictional demo moments only (never member charts).
 * Geocentric apparent ecliptic longitude of date, fetched from NASA JPL Horizons on 2026-10-29 —
 * the same ephemeris family Astrodienst's Swiss Ephemeris is built from. `retro` from the 24-hour motion.
 * Keyed by the chart's UTC instant so a changed sample can never pick up the wrong positions.
 */
export const DEMO_ASTEROIDS: Record<string, Record<'ceres' | 'pallas' | 'juno' | 'vesta', { lon: number; retro: boolean }>> = {
  '2000-06-21T11:00:00.000Z': { ceres: { lon: 181.3239, retro: false }, pallas: { lon: 148.3654, retro: false }, juno: { lon: 326.9172, retro: false }, vesta: { lon: 299.8314, retro: true } },
  '1995-01-01T14:30:00.000Z': { ceres: { lon: 139.6869, retro: true }, pallas: { lon: 36.0160, retro: false }, juno: { lon: 250.8862, retro: false }, vesta: { lon: 91.0639, retro: true } },
  '1988-03-20T08:15:00.000Z': { ceres: { lon: 330.3108, retro: false }, pallas: { lon: 306.7693, retro: false }, juno: { lon: 24.7299, retro: false }, vesta: { lon: 113.7860, retro: false } },
};

const META = { ceres: ['Ceres', '⚳'], pallas: ['Pallas', '⚴'], juno: ['Juno', '⚵'], vesta: ['Vesta', '⚶'] } as const;

/** Adds the four asteroids to a demo chart when its instant has verified positions; otherwise returns the chart unchanged. */
export function withDemoAsteroids(r: ChartResult): ChartResult {
  const row = DEMO_ASTEROIDS[r.utc.toISOString()];
  if (!row) return r;
  const extra: BodyPos[] = (Object.keys(META) as (keyof typeof META)[]).map(key => {
    const { lon, retro } = row[key]; const f = fmtLon(lon);
    return { key, name: META[key][0], glyph: META[key][1], lon, sign: f.sign, signGlyph: f.signGlyph, deg: f.deg, min: f.min, house: r.cusps ? houseOf(lon, r.cusps) : null, retro, confidence: 'confirmed', note: 'Position from NASA JPL Horizons, the ephemeris behind Astrodienst.' };
  });
  return { ...r, bodies: [...r.bodies, ...extra] };
}
