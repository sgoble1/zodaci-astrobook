import { describe, expect, it } from 'vitest';
import { computeChart } from '@/lib/astro';
import { detectPatterns, rankPatterns } from '@/lib/chartPatterns';
import { firstPerson, PLACEMENT_PAIRS, practiceAffirmations, shadowBreakthroughBlock } from '@/content/shadowBreakthrough';

const april = computeChart({ date: '1990-09-06', time: '15:38', lat: 42.86896, lon: -76.97774, tz: 'America/New_York', houseSystem: 'placidus', placeLabel: '', placeSource: 'geocoded' });
const ranked = rankPatterns(detectPatterns(april), april);

describe('Shadow and Breakthrough (§7)', () => {
  it('shows at most the top five patterns', () => expect(shadowBreakthroughBlock(ranked).length).toBeLessThanOrEqual(5));
  it('never shows a shadow without its breakthrough', () => {
    for (const i of shadowBreakthroughBlock(ranked)) { expect(i.shadow.length).toBeGreaterThan(0); expect(i.breakthrough.length).toBeGreaterThan(0); }
  });
  it('has a pair for all twelve planets and points in §7.1 plus the Ascendant', () => expect(Object.keys(PLACEMENT_PAIRS).length).toBe(14));
  it('Educational adds a definition; Professional drops the practice and uses third person', () => {
    expect(shadowBreakthroughBlock(ranked, 'educational').some(i => i.definition)).toBe(true);
    const pro = shadowBreakthroughBlock(ranked, 'professional');
    expect(pro.every(i => i.practice === null)).toBe(true);
    expect(pro.map(i => `${i.shadow} ${i.breakthrough}`).join(' ')).not.toMatch(/\byou\b/i);
  });
  it('turns practices into first-person affirmations', () => {
    expect(firstPerson('Ask for one thing you usually hold back')).toBe('I ask for one thing I usually hold back.');
    expect(firstPerson('When torn, write both sides down before you choose')).toBe('When torn, I write both sides down before I choose.');
    expect(firstPerson('Do one thing this week only because it is yours')).toBe('I do one thing this week only because it is mine.');
    expect(practiceAffirmations(shadowBreakthroughBlock(ranked)).every(a => a.text.startsWith('I ') || a.text.startsWith('When'))).toBe(true);
  });
});
