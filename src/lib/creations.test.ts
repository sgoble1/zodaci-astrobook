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

describe('studio presets', () => {
  it('tarot birth card adds the date digits and reduces above 22', async () => {
    const { tarotBirthCard } = await import('./creations');
    // 1993-03-25: 1+9+9+3+0+3+2+5 = 32 → 3+2 = 5, The Hierophant.
    expect(tarotBirthCard('1993-03-25')).toMatchObject({ number: 5, roman: 'V', name: 'The Hierophant', total: 32 });
    // A total of exactly 22 is The Fool.
    expect(tarotBirthCard('1960-01-05')).toMatchObject({ number: 0, name: 'The Fool' });
    expect(tarotBirthCard('not-a-date')).toBeNull();
  });
  it('badge reads only the Current Chapter and says when the sky is quiet', async () => {
    const { badgeLines } = await import('./creations');
    const day = new Date('2026-11-13T12:00:00Z');
    expect(badgeLines({ title: 'A quiet stretch in the sky', hit: null, summary: '' }, day).title).toBe('A quiet sky');
    const hit = { transit: { key: 'saturn', name: 'Saturn', glyph: '♄' }, natalName: 'Sun', type: 'Square', symbol: '□', orb: 0.42, applying: true } as never;
    expect(badgeLines({ title: 'Building long-term structure · Sun', hit, summary: '' }, day)).toMatchObject({ title: 'Building long-term structure', detail: 'Saturn square Sun · 0.4° applying' });
  });
  it('tarot card is standard tarot size', () => {
    expect(CREATION_SIZE.tarot).toMatchObject({ w: 825, h: 1425 });
  });
});
