import { describe, it, expect } from 'vitest';
import { pathBypassesGate } from './prelaunch';
describe('pre-launch gate paths', () => {
  it('keeps sign-in open so admins can get in', () => expect(pathBypassesGate('/auth')).toBe(true));
  it('keeps legal pages open', () => expect(pathBypassesGate('/privacy')).toBe(true));
  it('gates the home page', () => expect(pathBypassesGate('/')).toBe(false));
  it('gates member pages', () => expect(pathBypassesGate('/dashboard')).toBe(false));
  it('does not open look-alike paths', () => expect(pathBypassesGate('/authors')).toBe(false));
});
