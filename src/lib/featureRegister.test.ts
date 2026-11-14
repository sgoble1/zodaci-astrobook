import { describe, it, expect } from 'vitest';
import { FEATURES, nextImplementations, statusCounts } from './featureRegister';

describe('feature register', () => {
  it('ids are unique', () => { expect(new Set(FEATURES.map(f => f.id)).size).toBe(FEATURES.length); });
  it('blocked features name their blocker', () => { for (const f of FEATURES.filter(f => f.status === 'Blocked')) expect(f.blocker).toBeTruthy(); });
  it('next implementations exclude live and put high impact first', () => {
    const n = nextImplementations();
    expect(n.some(f => f.status === 'Live')).toBe(false);
    expect(n[0].impact).toBe('High');
  });
  it('status counts add up', () => { const c = statusCounts(); expect(c.Live + c.Partial + c.Planned + c.Blocked).toBe(FEATURES.length); });
});
