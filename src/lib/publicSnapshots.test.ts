import { describe, expect, it } from 'vitest';
import { PUBLIC_SNAPSHOTS, snapshotHtml } from '../../scripts/publicSnapshots';

const BASE = `<html><head><title>Zodaci · Your sky, your story</title><meta name="description" content="x" /><meta property="og:title" content="x" /><meta property="og:description" content="x" /><meta name="twitter:title" content="x" /><meta name="twitter:description" content="x" /></head><body><div id="root"></div>\n<script type="module" src="/a.js"></script></body></html>`;

describe('public page snapshots', () => {
  it('writes the page title, description and self canonical into the head', () => {
    const p = PUBLIC_SNAPSHOTS.find(s => s.path === '/about')!;
    const html = snapshotHtml(BASE, p);
    expect(html).toContain('<title>About Zodaci');
    expect(html).toContain('<link rel="canonical" href="https://zodaci.com/about" />');
    expect(html).toContain('<h1>About Zodaci</h1>');
    expect(html).toContain('<script type="module" src="/a.js"></script>');
  });
  it('lists public pages only, never member or founder pages', () => {
    for (const s of PUBLIC_SNAPSHOTS) expect(s.path).not.toMatch(/^\/(dashboard|my-|april|shane|zac|admin|shared|developer|investors)/);
  });
  it('keeps prices out of the snapshots (prices live only in plans.ts and books.ts)', () => {
    for (const s of PUBLIC_SNAPSHOTS) expect(`${s.title} ${s.description}`).not.toMatch(/\$\d/);
  });
});
