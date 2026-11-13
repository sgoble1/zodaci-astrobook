import { describe, it, expect } from 'vitest';
import { devFailure, devFailureMessage, readLayout, sortColumn, validateDraft, restoreRow, statusPatch, centsToDollars, type DevItem } from './devBoard';

describe('developer board rules', () => {
  it('treats zero affected rows as a permission problem, not success', () => {
    expect(devFailure(null, 0)).toBe('permission');
    expect(devFailure(null, 1)).toBeNull();
  });
  it('separates permission, invalid input and network failures', () => {
    expect(devFailure({ code: '42501', message: 'new row violates row-level security policy' })).toBe('permission');
    expect(devFailure({ code: '23514', message: 'check constraint' })).toBe('invalid');
    expect(devFailure({ message: 'Failed to fetch' })).toBe('network');
    expect(devFailureMessage('network', 'save')).not.toMatch(/Only the developer/);
    expect(devFailureMessage('permission', 'delete')).toMatch(/Only the developer/);
  });
  it('reads the saved layout without throwing when storage is blocked', () => {
    expect(readLayout({ getItem: () => { throw new Error('SecurityError'); } })).toBe('board');
    expect(readLayout({ getItem: () => 'list' })).toBe('list');
    expect(readLayout(null)).toBe('board');
  });
  it('orders high priority first, then newest change', () => {
    const r = sortColumn([{ priority: 2, updated_at: '2026-11-13T00:00:00Z' }, { priority: 1, updated_at: '2026-11-01T00:00:00Z' }, { priority: 2, updated_at: '2026-11-12T00:00:00Z' }]);
    expect(r.map(x => x.updated_at)).toEqual(['2026-11-01T00:00:00Z', '2026-11-13T00:00:00Z', '2026-11-12T00:00:00Z']);
  });
  it('validates titles and stores dollar costs as cents', () => {
    expect(validateDraft({ title: 'ab', kind: 'bug' }).ok).toBe(false);
    const ok = validateDraft({ title: ' Fix cart ', kind: 'bug', cost: '$12.50', priority: 1 });
    expect('value' in ok && ok.value).toMatchObject({ title: 'Fix cart', cost_cents: 1250, area: 'General', priority: 1, status: 'todo' });
    expect(validateDraft({ title: 'Fix cart', kind: 'bug', cost: '-3' }).ok).toBe(false);
    expect(centsToDollars(1250)).toBe('12.50');
  });
  it('keeps id and dates when restoring a deleted item', () => {
    const item: DevItem = { id: 'x', title: 'T', details: '', kind: 'feature', status: 'done', area: 'A', priority: 2, blocker: '', cost_cents: null, done_at: '2026-11-01T00:00:00Z', created_at: '2026-10-01T00:00:00Z', updated_at: '2026-11-01T00:00:00Z' };
    expect(restoreRow(item)).toEqual(item);
  });
  it('sets the done date only when finishing', () => {
    expect(statusPatch('done', new Date('2026-11-13T00:00:00Z')).done_at).toBe('2026-11-13T00:00:00.000Z');
    expect(statusPatch('doing').done_at).toBeNull();
  });
});
