import { describe, expect, it } from 'vitest';
import { CORE_THEMES, TOPIC_READINGS } from '@/lib/topicReadings';
import { CASES } from '@/lib/investigations';
import { GALLERIES } from '@/lib/museum';
import { RELATED_SLUGS, relatedFor } from './relatedContent';

const READING_SLUGS = [...TOPIC_READINGS, ...CORE_THEMES].map(t => t.slug);

describe('Related panels registry', () => {
  it('covers every topic reading and core theme', () => {
    expect([...RELATED_SLUGS].sort()).toEqual([...READING_SLUGS].sort());
  });
  it('never lists the reading itself, and gives each reading at least one sibling and one place', () => {
    for (const s of READING_SLUGS) {
      const r = relatedFor(s);
      expect(r.readings.some(l => l.to.endsWith(`/${s}`))).toBe(false);
      expect(r.readings.length).toBeGreaterThan(0);
      expect(r.places.length).toBeGreaterThan(0);
      expect(r.readings.length).toBeLessThanOrEqual(4);
      expect(r.places.length).toBeLessThanOrEqual(3);
    }
  });
  it('links only to case files and galleries that exist', () => {
    const cases = new Set(CASES.map(c => `/investigations/${c.id}`)), galleries = new Set(GALLERIES.map(g => `/museum/${g.id}`));
    for (const s of READING_SLUGS) for (const p of relatedFor(s).places) {
      if (p.kind === 'case') expect(cases.has(p.to)).toBe(true);
      if (p.kind === 'gallery') expect(galleries.has(p.to)).toBe(true);
    }
  });
  it('sends love readers to the Relationship case file and gallery', () => {
    const tos = relatedFor('love').places.map(p => p.to);
    expect(tos).toContain('/investigations/relationship');
    expect(tos).toContain('/museum/relationships');
  });
  it('returns nothing for an unknown slug', () => expect(relatedFor('nope')).toEqual({ readings: [], places: [] }));
});
