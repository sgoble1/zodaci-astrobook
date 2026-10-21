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
