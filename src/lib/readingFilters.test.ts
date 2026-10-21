import { describe, expect, it } from 'vitest';
import { CORE_THEMES, READING_FILTERS, TOPIC_READINGS, readingMatches } from './topicReadings';

describe('reading filters', () => {
  it('puts every topic and core theme under at least one filter', () => {
    for (const t of [...TOPIC_READINGS, ...CORE_THEMES]) expect(READING_FILTERS.some(f => readingMatches(t.slug, f))).toBe(true);
  });
  it('shows everything with no filter', () => expect(readingMatches('love', null)).toBe(true));
  it('files love under Relationships, not Career', () => { expect(readingMatches('love', 'Relationships')).toBe(true); expect(readingMatches('love', 'Career')).toBe(false); });
});
