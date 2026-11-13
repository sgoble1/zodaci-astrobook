import { describe, it, expect } from 'vitest';
import { MEMBER_DOMAINS, domainFor, domainById } from './memberNav';

const col = (id: Parameters<typeof domainById>[0], title: string) => domainById(id).columns.find(c => c.title === title)?.items.map(i => i.to) ?? [];

describe('five hubs', () => {
  it('Consultation Desk groups every way to ask', () => {
    expect(col('readings', 'Consultation Desk')).toEqual(expect.arrayContaining(['/consult', '/observatory', '/chat', '/counselors', '/workbook/social-integration', '/workbook/companion']));
  });
  it('Timing covers today, this year and lifetime', () => {
    expect(col('explore', 'Timing')).toEqual(expect.arrayContaining(['/transits', '/retrogrades', '/profection', '/timeline']));
  });
  it('RetroGOOD sits with the chart under What stands out', () => {
    expect(col('chart', 'What stands out')).toContain('/retrogood');
    expect(domainFor('/retrogood')).toBe('chart');
  });
  it('World Traditions and Archive & Journal exist', () => {
    expect(col('explore', 'World Traditions')).toContain('/other-systems');
    expect(col('readings', 'Archive & Journal')).toContain('/observation-log');
  });
  it('no page appears twice in the same column', () => {
    for (const d of MEMBER_DOMAINS) for (const c of d.columns) expect(new Set(c.items.map(i => i.to)).size).toBe(c.items.length);
  });
});
