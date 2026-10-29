import { describe, expect, it } from 'vitest';
import { shareOrigin } from './siteOrigin';

describe('shared link address', () => {
  it('keeps the site the member is on (custom domain or www)', () => {
    expect(shareOrigin({ hostname: 'www.zodaci.com', origin: 'https://www.zodaci.com' })).toBe('https://www.zodaci.com');
    expect(shareOrigin({ hostname: 'zodaci-astrobook.lovable.app', origin: 'https://zodaci-astrobook.lovable.app' })).toBe('https://zodaci-astrobook.lovable.app');
  });
  it('never shares a preview or local address a friend could not open', () => {
    expect(shareOrigin({ hostname: 'localhost', origin: 'http://localhost:8080' })).toBe('https://zodaci.com');
    expect(shareOrigin({ hostname: 'id-preview--abc.lovable.app', origin: 'https://id-preview--abc.lovable.app' })).toBe('https://zodaci.com');
  });
});
