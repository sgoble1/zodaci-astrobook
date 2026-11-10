import { describe, expect, it } from 'vitest';
import { observatoryLines, parseSources } from './observatoryConsult';
import type { TransitHit } from './transitOverlay';

const hit = (name: string, weight: number, orb: number): TransitHit => ({
  transit: { key: name.toLowerCase(), name, glyph: '', lon: 0, sign: 'Aries', deg: 1, retro: false },
  natalKey: 'sun', natalName: 'Sun', natalRetro: false, type: 'square', symbol: '□', orb, applying: true, weight, text: '',
});

describe('Consult the Observatory inputs', () => {
  it('sends at most twelve sky lines, strongest contact first', () => {
    const lines = observatoryLines(Array.from({ length: 15 }, (_, i) => hit(`P${i}`, i, 1)));
    expect(lines).toHaveLength(12);
    expect(lines[0]).toBe('P14 in Aries square natal Sun, orb 1.0°, applying');
  });
  it('drops malformed or unknown source entries instead of showing them', () => {
    expect(parseSources(encodeURIComponent(JSON.stringify([{ kind: 'chart', label: 'Your calculated chart' }, { kind: 'diary', label: 'x' }, 'bad'])))).toEqual([{ kind: 'chart', label: 'Your calculated chart' }]);
    expect(parseSources('%%%')).toEqual([]);
    expect(parseSources(null)).toEqual([]);
  });
});
