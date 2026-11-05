import { describe, expect, it } from 'vitest';
import { onboardingDestination, startLinkFrom } from './onboardingReturn';

describe('onboardingDestination', () => {
  it('opens My Chart when no page sent the member', () => {
    expect(onboardingDestination(null)).toBe('/my-chart');
    expect(onboardingDestination('')).toBe('/my-chart');
  });
  it('returns to the page the member came from', () => {
    expect(onboardingDestination('/forecast')).toBe('/forecast');
    expect(onboardingDestination('/results?tab=love')).toBe('/results?tab=love');
  });
  it('never returns to sign-in or birth entry', () => {
    expect(onboardingDestination('/start')).toBe('/my-chart');
    expect(onboardingDestination('/auth?next=/x')).toBe('/my-chart');
  });
  it('rejects outside sites', () => {
    expect(onboardingDestination('//evil.example')).toBe('/my-chart');
    expect(onboardingDestination('https://evil.example')).toBe('/my-chart');
  });
  it('device-only saves open My Chart with the device notice', () => {
    expect(onboardingDestination('/forecast', 'device')).toBe('/my-chart?device=1');
  });
});

describe('startLinkFrom', () => {
  it('carries the current page', () => {
    expect(startLinkFrom('/forecast')).toBe('/start?next=%2Fforecast');
  });
  it('drops looping or unsafe pages', () => {
    expect(startLinkFrom('/start')).toBe('/start');
    expect(startLinkFrom('//evil.example')).toBe('/start');
  });
});
