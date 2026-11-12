import { describe, expect, it } from 'vitest';
import { filterEntries, groupByMonth, toArchiveEntries } from './archive';

describe('Archive ledger', () => {
  const entries = toArchiveEntries({
    generated: [
      { id: '1', page_key: 'topic-love', section: 'Topic Reading', title: 'Love & Relationships', status: 'ready', version: 3, updated_at: '2026-10-02T10:00:00Z' },
      { id: '2', page_key: 'topic-career', section: 'Topic Reading', title: 'Career', status: 'generating', version: 1, updated_at: '2026-11-01T10:00:00Z' },
    ],
    bookmarks: [{ id: 'b', path: 'https://evil.example', title: 'Outside', created_at: '2026-11-03T10:00:00Z' }],
    orders: [{ id: 'o', edition: 'signature', format: 'print', status: 'in_production', created_at: '2026-11-05T10:00:00Z' }],
  });
  it('links a topic reading back to its own page and keeps the rewrite version', () => {
    const r = entries.find(e => e.kind === 'reading')!;
    expect(r.to).toBe('/my-readings/topic/love');
    expect(r.version).toBe(3);
  });
  it('leaves readings that are still being written out of the archive', () => {
    expect(entries.some(e => e.title === 'Career')).toBe(false);
  });
  it('never follows an off-site bookmark path', () => {
    expect(entries.find(e => e.kind === 'bookmark')!.to).toBe('/my-astrobook');
  });
  it('lists newest first and groups by month', () => {
    expect(entries[0].kind).toBe('book');
    expect(groupByMonth(entries).map(g => g.label)).toEqual(['November 2026', 'October 2026']);
  });
  it('filters by family of records', () => {
    expect(filterEntries(entries, 'products').map(e => e.kind)).toEqual(['book']);
    expect(filterEntries(entries, 'all')).toHaveLength(3);
  });
});
