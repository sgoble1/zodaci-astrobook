import { describe, expect, it } from 'vitest';
import { launchChecks } from './launchReadiness';

const base = { payments: { reachable: true, activeSubscriptions: 2 }, lulu: { configured: true, connected: true, environment: 'production', webhook: true }, admins: 1, maintenance: false };
const state = (s: typeof base, id: string) => launchChecks(s).find(c => c.id === id)?.state;

describe('launch readiness', () => {
  it('marks Lulu as waiting on the owner without keys', () => expect(state({ ...base, lulu: { ...base.lulu, configured: false } }, 'lulu')).toBe('external'));
  it('flags Lulu test mode as not ready', () => expect(state({ ...base, lulu: { ...base.lulu, environment: 'sandbox' } }, 'lulu')).toBe('action'));
  it('is ready with live Lulu and webhook', () => expect(state(base, 'lulu')).toBe('ready'));
  it('flags maintenance mode on', () => expect(state({ ...base, maintenance: true }, 'maintenance')).toBe('action'));
  it('flags unreachable live payments', () => expect(state({ ...base, payments: { reachable: false, activeSubscriptions: 0 } }, 'payments')).toBe('action'));
  it('never claims email is ready', () => expect(state(base, 'email')).toBe('external'));
});

import { PROOFS, proofCheck, parseProofs } from './launchReadiness';
describe('launch proof records', () => {
  const now = Date.parse('2026-10-23T12:00:00Z');
  const purchase = PROOFS.find(p => p.id === 'test-purchase')!;
  const security = PROOFS.find(p => p.id === 'security-review')!;
  it('waits on the owner until a proof is recorded', () => expect(proofCheck(purchase, undefined, now).state).toBe('external'));
  it('counts a dated proof as ready', () => expect(proofCheck(purchase, { date: '2026-10-20' }, now).state).toBe('ready'));
  it('never accepts an invalid or future date', () => {
    expect(proofCheck(purchase, { date: 'soon' }, now).state).toBe('external');
    expect(proofCheck(purchase, { date: '2027-01-01' }, now).state).toBe('external');
  });
  it('asks to rerun a security review older than 90 days', () => expect(proofCheck(security, { date: '2026-06-01' }, now).state).toBe('action'));
  it('drops malformed stored records', () => expect(parseProofs({ a: { date: 3 }, b: { date: '2026-10-01', note: 'ok' } })).toEqual({ b: { date: '2026-10-01', note: 'ok' } }));
});
