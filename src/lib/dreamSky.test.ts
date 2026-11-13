import { describe, it, expect } from 'vitest';
import { computeChart } from './astro';
import { dreamSky, MOTIF_FACTORS } from './dreamSky';

const natal = computeChart({ date: '1990-05-01', time: '12:00', lat: 40.71, lon: -74.0, tz: 'America/New_York', placeLabel: 'New York', placeSource: 'geocoded', houseSystem: 'placidus' } as never);

describe('dream sky', () => {
  it('only reports contacts to dream points within orb', () => {
    const s = dreamSky(natal, '2026-11-12');
    for (const c of s.contacts) { expect(['Moon', 'Neptune', 'Pluto', 'South Node']).toContain(c.target); expect(c.orb).toBeLessThanOrEqual(4); }
  });
  it('maps water dreams to Neptune, the Moon and the 12th house', () => {
    expect(dreamSky(natal, '2026-11-12', ['water']).motifs[0].factors).toBe(MOTIF_FACTORS.water);
  });
  it('skips house placements when the birth time is unknown', () => {
    const untimed = { ...natal, input: { ...natal.input, time: null } };
    expect(dreamSky(untimed as never, '2026-11-12').houses).toEqual([]);
  });
});
