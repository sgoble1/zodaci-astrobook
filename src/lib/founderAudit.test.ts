import { describe, expect, it } from 'vitest';
import { compareAreas, missingFiles } from './founderAudit';

const shane = { area: 'shane', edition: 'shane', chapters: 63, indexed: 63, words: 120000 };

describe('founder preservation audit', () => {
  it('flags an edition that has fewer chapters than the saved snapshot', () => {
    expect(compareAreas([{ ...shane, chapters: 62 }], [shane])[0].flags).toContain('lost');
  });
  it('flags an edition whose word count dropped even with the same chapter count', () => {
    expect(compareAreas([{ ...shane, words: 119000 }], [shane])[0].flags).toContain('lost');
  });
  it('passes an unchanged or grown edition', () => {
    expect(compareAreas([shane], [shane])[0].flags).toEqual(['ok']);
    expect(compareAreas([{ ...shane, words: 125000 }], [shane])[0].flags).toEqual(['ok']);
  });
  it('flags an unreadable edition file', () => {
    expect(compareAreas([{ ...shane, chapters: 0, words: 0, error: 'Edition file missing' }], null)[0].flags).toContain('missing');
  });
  it('flags chapters that the index does not list', () => {
    expect(compareAreas([{ ...shane, chapters: 64 }], null)[0].flags).toContain('unindexed');
  });
  it('marks a stored file as vanished only when the snapshot had it', () => {
    const now = [{ area: 'zac', file: 'workbook.json', present: false }];
    expect(missingFiles(now, [{ area: 'zac', file: 'workbook.json', present: true }])[0].vanished).toBe(true);
    expect(missingFiles(now, null)[0].vanished).toBe(false);
  });
});
