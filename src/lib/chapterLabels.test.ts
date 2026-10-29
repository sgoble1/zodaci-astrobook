import { describe, expect, it } from 'vitest';
import { shortChapterLabel } from './chapterLabels';

describe('shortChapterLabel', () => {
  it('uses the direct half of poetic titles and drops degrees', () => expect(shortChapterLabel('zac-11', 'The Lighthouse: The Sun in Cancer (17°52′)')).toBe('The Sun in Cancer'));
  it('drops name possessives', () => expect(shortChapterLabel('zac-23', "Fixed Stars in Zachary's Chart")).toBe('Fixed Stars'));
  it('keeps the topic before a colon', () => expect(shortChapterLabel('zac-37', 'The Navamsa: The Map Behind the Map')).toBe('The Navamsa'));
  it('uses Shane’s hand-written labels', () => expect(shortChapterLabel('sm-01', 'Natal Chart Foundation — The Cosmic Fingerprint')).toBe('Natal Chart Overview'));
  it('never returns more than 38 characters', () => expect(shortChapterLabel('x', 'An Extremely Long Chapter Title That Keeps Going Forever And Ever').length).toBeLessThanOrEqual(38));
});
