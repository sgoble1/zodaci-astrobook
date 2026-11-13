import { describe, expect, it } from 'vitest';
import { FOUNDER_NEWS, founderNewsFor, noteKey } from './founderNews';

describe('founder news', () => {
  it('never mentions Zac or his workbook in April’s notes', () => {
    for (const n of founderNewsFor('april')) expect(`${n.title} ${n.text} ${n.to ?? ''}`).not.toMatch(/zac|brother/i);
  });
  it('never mentions April in Zac’s notes', () => {
    for (const n of founderNewsFor('zac')) expect(`${n.title} ${n.text} ${n.to ?? ''}`).not.toMatch(/april/i);
  });
  it('lists newest first and respects the count', () => {
    const list = founderNewsFor('april', 3);
    expect(list).toHaveLength(3);
    expect(list.map(n => n.date)).toEqual([...list.map(n => n.date)].sort().reverse());
  });
  it('every note targets at least one edition and has a dated, plain title', () => {
    for (const n of FOUNDER_NEWS) { expect(n.for.length).toBeGreaterThan(0); expect(n.date).toMatch(/^\d{4}-\d{2}-\d{2}$/); }
  });
  it('gives every note a unique stable key', () => {
    const keys = FOUNDER_NEWS.map(noteKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
