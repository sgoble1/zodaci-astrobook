import { describe, it, expect } from 'vitest';
import { tourSteps } from './welcomeTour';
import { MEMBER_DOMAINS, domainFor } from './memberNav';

describe('welcome tour', () => {
  const steps = tourSteps();
  it('names every main section by its menu label', () => {
    const text = steps.map(s => s.body).join(' ');
    for (const d of MEMBER_DOMAINS) expect(text).toContain(d.label);
  });
  it('only links to pages that belong to a menu section', () => {
    for (const s of steps.filter(x => x.to)) expect(domainFor(s.to!)).not.toBeNull();
  });
  it('places SmartChat and the Workbook where the menu puts them', () => {
    const step = steps.find(s => s.title === 'Ask, practise, create')!;
    expect(step.body).toContain(MEMBER_DOMAINS.find(d => d.columns.some(c => c.items.some(i => i.to === '/chat')))!.label);
  });
});
