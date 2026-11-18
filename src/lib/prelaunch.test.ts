import { describe, it, expect } from 'vitest';
import { gateView, pathBypassesGate } from './prelaunch';

describe('pre-launch gate paths', () => {
  it('keeps sign-in open so admins can get in', () => expect(pathBypassesGate('/auth')).toBe(true));
  it('keeps public landing pages open', () => {
    expect(pathBypassesGate('/welcome')).toBe(true);
    expect(pathBypassesGate('/coming-soon')).toBe(true);
    expect(pathBypassesGate('/access')).toBe(true);
  });
  it('keeps legal pages open', () => expect(pathBypassesGate('/privacy')).toBe(true));
  it('gates the homepage', () => expect(pathBypassesGate('/')).toBe(false));
  it('gates member pages', () => expect(pathBypassesGate('/dashboard')).toBe(false));
  it('does not open look-alike paths', () => expect(pathBypassesGate('/authors')).toBe(false));
});

describe('gateView', () => {
  it('opens the self-contained demo without a passcode or session', () => {
    expect(gateView('/demo', 'gated')).toBe('site');
    expect(gateView('/demo', 'checking')).toBe('site');
    expect(pathBypassesGate('/demographic')).toBe(false);
  });
  it('shows the real home page once someone is let in', () => {
    expect(gateView('/', 'open')).toBe('site');
    expect(gateView('/dashboard', 'open')).toBe('site');
  });
  it('sends /access home once in, and keeps /coming-soon as the waitlist preview', () => {
    expect(gateView('/access', 'open')).toBe('home');
    expect(gateView('/coming-soon', 'open')).toBe('waitlist');
  });
  it('keeps the home page and member pages on the waitlist while locked', () => {
    expect(gateView('/', 'gated')).toBe('waitlist');
    expect(gateView('/dashboard', 'gated')).toBe('waitlist');
    expect(gateView('/privacy', 'gated')).toBe('site');
  });
});
