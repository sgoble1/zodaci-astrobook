import { describe, expect, it } from 'vitest';
import { ephemerisMonth, filterEphemeris } from './ephemeris';
import { contextHighlights, parseFocus } from './intelligenceLayer';
describe('member workflow rules', () => {
  it('calculates each leap February day at UTC midnight', () => { const r=ephemerisMonth(2000,2); expect(r).toHaveLength(29); expect(r[28].date).toBe('2000-02-29'); expect(r[0].bodies).toHaveLength(10); expect(r[0].bodies.every(b=>b.house===null)).toBe(true); });
  it('enforces 1800–2100 and no fake date rollover', () => { expect(ephemerisMonth(1800,1)).toHaveLength(31); expect(ephemerisMonth(2100,2)).toHaveLength(28); expect(()=>ephemerisMonth(1799,1)).toThrow(); expect(()=>ephemerisMonth(2101,1)).toThrow(); expect(()=>ephemerisMonth(2026,13)).toThrow(); });
  it('filters real retrogrades by planet', () => { const all=ephemerisMonth(2026,11); const r=filterEphemeris(all,'mercury',true); expect(r.length).toBeGreaterThan(0); expect(r.every(x=>x.body.key==='mercury'&&x.body.retro)).toBe(true); });
  it('highlights explicit focus without inferring biography or changing facts', () => { const f={area:'work' as const,question:'Changing jobs'}; const before=JSON.stringify(f); expect(contextHighlights(f).map(x=>x.slug)).toContain('career'); expect(JSON.stringify(f)).toBe(before); expect(contextHighlights(null)).toEqual([]); expect(parseFocus('{"area":"unknown","question":"x"}')).toBeNull(); });
});