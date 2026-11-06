import { describe, expect, it } from 'vitest';
import { SPECIFICITY_ROWS } from './SpecificityExamples';

describe('specificity examples', () => {
  it('quote only calculated facts that exist in the public sample edition', () => {
    for (const r of SPECIFICITY_ROWS) {
      expect(r.facts).not.toMatch(/(^|·)\s*(ruler\s*)?(·|$)/);
      expect(r.facts.length).toBeGreaterThan(20);
    }
    expect(SPECIFICITY_ROWS[0].facts).toContain('Taurus 12°47′');
    expect(SPECIFICITY_ROWS[1].facts).toContain('Aries 13°00′');
  });
});
