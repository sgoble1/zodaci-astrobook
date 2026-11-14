import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { PUBLIC_NAV } from '@/components/brand/PublicHeader';
import { FOOTER_COLUMNS } from '@/components/brand/GlobalFooter';

const app = readFileSync('src/App.tsx', 'utf8');
const routes = [...app.matchAll(/<Route path="([^"]+)"/g)].map(m => m[1]).filter(p => p !== '*');
const matches = (to: string) => {
  const path = to.split(/[?#]/)[0] || '/';
  return routes.some(r => r === path || new RegExp(`^${r.replace(/:[^/]+/g, '[^/]+')}$`).test(path));
};

describe('public navigation links', () => {
  it('every header link goes to a real page', () => {
    for (const [to] of PUBLIC_NAV) expect(matches(to), to).toBe(true);
  });
  it('every footer link goes to a real page', () => {
    for (const c of FOOTER_COLUMNS) for (const [to] of c.links) expect(matches(to), to).toBe(true);
  });
  it('old Academy and Blog addresses still resolve', () => {
    for (const p of ['/academy', '/blog', '/blog/learn/x', '/academy/x']) expect(matches(p), p).toBe(true);
  });
});
