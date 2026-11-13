import { describe, it, expect } from 'vitest';
import { auditDateBounds, auditSearchTerm, mergeOptions } from './auditQuery';

describe('audit log filters', () => {
  it('strips characters that would break the server search', () => {
    expect(auditSearchTerm('order,(id)%*  42')).toBe('order id 42');
    expect(auditSearchTerm('   ')).toBe('');
  });
  it('makes the To date inclusive of the whole day', () => {
    const b = auditDateBounds('2026-11-01', '2026-11-01');
    expect(new Date(b.lt!).getTime() - new Date(b.gte!).getTime()).toBe(24 * 3600 * 1000);
    expect(auditDateBounds('', 'not-a-date')).toEqual({});
  });
  it('never drops a dropdown choice once seen', () => {
    expect(mergeOptions(['grant'], ['delete', null, 'grant'])).toEqual(['delete', 'grant']);
  });
});
