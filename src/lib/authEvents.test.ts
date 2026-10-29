import { describe, expect, it, vi } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({ supabase: { auth: { getSession: async () => ({ data: { session: null } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) } } }));

import { isAccountChange } from './authEvents';
import { isSameAccountEvent } from '@/hooks/useAprilSpace';

describe('session refresh keeps the app in place', () => {
  it('a token refresh for the same account is not an account change', () => {
    expect(isAccountChange('TOKEN_REFRESHED', 'u1|a@b.co', 'u1|a@b.co')).toBe(false);
    expect(isAccountChange('SIGNED_IN', 'u1|a@b.co', 'u1|a@b.co')).toBe(false);
  });
  it('signing in as someone else or signing out is a change', () => {
    expect(isAccountChange('SIGNED_IN', 'u1|a@b.co', 'u2|c@d.co')).toBe(true);
    expect(isAccountChange('SIGNED_OUT', 'u1|a@b.co', '')).toBe(true);
  });
  it('the private edition stays loaded on token refresh but resets on sign-out', () => {
    expect(isSameAccountEvent('TOKEN_REFRESHED', 'u1', 'u1')).toBe(true);
    expect(isSameAccountEvent('SIGNED_IN', 'u1', 'u1')).toBe(true);
    expect(isSameAccountEvent('SIGNED_IN', 'u2', 'u1')).toBe(false);
    expect(isSameAccountEvent('SIGNED_OUT', null, 'u1')).toBe(false);
  });
});
