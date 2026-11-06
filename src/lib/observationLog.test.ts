import { describe, expect, it } from 'vitest';
import { localInputToIso, observationPatterns, parseTags, skyAt } from './observationLog';

describe('observation log', () => {
  it('cleans typed tags: trimmed, lower-case, no repeats, at most 12', () => {
    expect(parseTags(' Moon, saturn ,moon,  Clear   Sky ')).toEqual(['moon', 'saturn', 'clear sky']);
    expect(parseTags(Array.from({ length: 20 }, (_, i) => `t${i}`).join(','))).toHaveLength(12);
    expect(parseTags(' , ,')).toEqual([]);
  });
  it('reads the real sky for the moment observed (full Moon of 2024-04-23 is in Scorpio)', () => {
    const s = skyAt('2024-04-23T23:49:00Z');
    expect(s.phase.name).toBe('Full Moon');
    expect(s.moonSign).toBe('Scorpio');
  });
  it('counts tags and Moon phases only from the owner’s own entries', () => {
    const p = observationPatterns([
      { observed_at: '2024-04-23T23:49:00Z', tags: ['moon', 'clear'] },
      { observed_at: '2024-04-24T02:00:00Z', tags: ['moon'] },
      { observed_at: '2024-04-08T18:00:00Z', tags: ['eclipse'] },
    ]);
    expect(p.count).toBe(3);
    expect(p.topTags[0]).toEqual({ tag: 'moon', n: 2 });
    expect(p.phases.find(x => x.name === 'Full Moon')?.n).toBe(2);
  });
  it('an empty log has no patterns', () => {
    expect(observationPatterns([])).toMatchObject({ count: 0, waxingShare: 0, topTags: [] });
  });
  it('rejects a date-time that is not a real moment', () => {
    expect(localInputToIso('2026-13-40T99:00')).toBeNull();
    expect(localInputToIso('')).toBeNull();
    expect(localInputToIso('2026-11-06T21:30')).not.toBeNull();
  });
});
