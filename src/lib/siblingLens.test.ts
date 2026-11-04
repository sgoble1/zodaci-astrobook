import { describe, expect, it } from 'vitest';
import { computeChart } from '@/lib/astro';
import { isSiblingRelation, siblingLens, SIBLING_CHANNELS } from '@/lib/synastry';

const A = computeChart({ date: '1989-04-16', time: '15:55', lat: 33.91, lon: -98.49, tz: 'America/Chicago', placeLabel: 'Wichita Falls', placeSource: 'geocoded' });
const B = computeChart({ date: '1992-08-03', time: null, lat: 33.91, lon: -98.49, tz: 'America/Chicago', placeLabel: 'Wichita Falls', placeSource: 'geocoded' });

describe('sibling lens', () => {
  it('reports all five channels, each with a practice matching its strongest contact', () => {
    const lens = siblingLens(A, B, 'Shane', 'Zac');
    expect(lens.channels.map(c => c.id)).toEqual(SIBLING_CHANNELS.map(c => c.id));
    for (const c of lens.channels) {
      expect(c.tone).toBe(c.contacts[0]?.tone ?? 'none');
      expect(c.practice.length).toBeGreaterThan(20);
      const planet = SIBLING_CHANNELS.find(x => x.id === c.id)!.planet;
      for (const x of c.contacts) expect([x.aKey, x.bKey]).toContain(planet);
    }
  });
  it('cannot place planets in the third house of a chart with no birth time', () => {
    const lens = siblingLens(A, B, 'Shane', 'Zac');
    expect(lens.thirdHouse.aInB).toBeNull();
    expect(Array.isArray(lens.thirdHouse.bInA)).toBe(true);
  });
  it('recognises sibling relations only', () => {
    expect(isSiblingRelation('Brother')).toBe(true);
    expect(isSiblingRelation('older sister')).toBe(true);
    expect(isSiblingRelation('Friend')).toBe(false);
    expect(isSiblingRelation('Brother-in-law')).toBe(false);
  });
});
