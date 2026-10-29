import { describe, expect, it } from 'vitest';
import { affirmationFor, journalPrompts, placementLine, CREATION_SIZE } from './creations';

describe('creations', () => {
  it('affirmation uses the planet sign', () => {
    expect(affirmationFor('Venus', 'Aries')).toContain('Venus in Aries brings courage');
  });
  it('journal omits houses without a birth time', () => {
    const chart = { bodies: [{ key: 'saturn', name: 'Saturn', sign: 'Aquarius', house: 7 }] } as never;
    expect(journalPrompts(chart, false)[0]).not.toContain('House');
    expect(journalPrompts(chart, true)[0]).toContain('House 7');
  });
  it('placement line shows degree, house and retrograde', () => {
    expect(placementLine({ name: 'Venus', sign: 'Aries', deg: 15, house: 9, retro: true })).toBe('Venus in Aries 15° · House 9 · Rx');
  });
  it('poster prints at 8x12 inches 300 dpi', () => {
    expect(CREATION_SIZE.poster).toMatchObject({ w: 2400, h: 3600 });
  });
});
