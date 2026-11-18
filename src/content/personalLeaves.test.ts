import { describe, expect, it } from 'vitest';
import { personalBookLeaves, memberBookLeaves, sampleBookLeaves, sampleReaderChart } from '@/content/sampleBookLeaves';
import { BOOK_VERSIONS } from '@/lib/books';
import { comicPreviewArt } from '@/content/castArt';
import { buildComicIssue } from '@/lib/comic';

describe('personal first-ten-page previews', () => {
  const leaves = personalBookLeaves({ name: 'Rosalind Vance', birthLine: 'Born test', chart: sampleReaderChart(), coverSrc: 'cover.jpg' });
  const faces = leaves.flatMap(l => [l.front, l.back]);
  it('numbers exactly 25 book preview pages', () => {
    const nums = faces.map(f => ('page' in f ? f.page : undefined)).filter(Boolean);
    expect(nums).toEqual(Array.from({ length: 25 }, (_, i) => i + 1));
  });
  it('opens on the cover and closes on the back cover', () => {
    expect(faces[0].kind).toBe('cover');
    expect(faces[faces.length - 1].kind).toBe('back');
  });
  it('every illustrated comic panel in the first ten pages has a picture', () => {
    const issue = buildComicIssue(sampleReaderChart(), { reader: 'Rosalind', month: new Date(Date.UTC(2026, 11, 1)), issueNumber: 1 });
    const art = comicPreviewArt(issue);
    const keys = issue.pages.filter(p => p.n <= 10 && p.section !== 'Cover').flatMap(p => p.panels.map((_, i) => `${p.n}-${i}`));
    expect(keys.length).toBeGreaterThan(0);
    for (const k of keys) expect(art[k]).toBeTruthy();
  });
  it.each(BOOK_VERSIONS)('uses the $id edition, composed cover, custom name and dedication without changing chart facts', version => {
    const options = { edition: version.id, coverSrc: 'custom-cropped.jpg', coverChoice: 'design:midnight-stars', coverName: 'Alex Morgan', dedication: 'For the quieter questions.\nFrom Sam', tone: 'professional' as const };
    const customized = personalBookLeaves({ name: 'Rosalind Vance', birthLine: 'Born test', chart: sampleReaderChart(), ...options });
    const front = customized[0].front;
    expect(front.kind).toBe('jacket');
    if (front.kind !== 'jacket') throw new Error('Missing custom jacket');
    expect(front.art).toBe('custom-cropped.jpg');
    expect(front.composed).toBe(true);
    expect(front.choice).toBe('design:midnight-stars');
    expect(front.cover.name).toBe('Alex Morgan');
    expect(front.cover.signs).toContain('Taurus');
    expect(front.edition).toBe(version.name);
    expect(front.finish).toBe(version.id === 'linen' ? 'cloth' : version.id === 'signature' ? 'leatherette' : 'paper');
    const all = customized.flatMap(l => [l.front, l.back]);
    const end = all.find(f => f.kind === 'endpaper');
    expect(end?.kind === 'endpaper' ? end.lines : []).toContain('For the quieter questions.');
    expect(end?.kind === 'endpaper' ? end.lines : []).toContain('From Sam');
    expect(all.find(f => f.kind === 'title')).toMatchObject({ name: 'Alex Morgan', edition: `AstroBook · ${version.name}` });
    expect(all.flatMap(f => 'page' in f && f.page ? [f.page] : [])).toHaveLength(25);
    expect(all.find(f => f.kind === 'plate')?.page).toBe(7);
  });
  it('keeps standalone legacy cover arguments and propagates member options', () => {
    const birth = { name: 'Test Reader', date: '1990-09-06', time: '12:00', lat: 40.7, lon: -74, tz: 'America/New_York', placeLabel: 'New York', houseSystem: 'placidus' as const, sex: null };
    expect(memberBookLeaves(birth, 'old-cover.jpg')[0].front).toMatchObject({ kind: 'cover', src: 'old-cover.jpg' });
    const changed = memberBookLeaves(birth, { edition: 'linen', coverChoice: 'upload', coverSrc: 'upload.jpg', coverName: 'Morgan', dedication: 'Always curious.' });
    expect(changed[0].front).toMatchObject({ kind: 'jacket', composed: true, art: 'upload.jpg', cover: { name: 'Morgan' } });
    expect(changed[0].back).toMatchObject({ kind: 'endpaper', lines: expect.arrayContaining(['Always curious.']) });
  });
  it('customizes only the fictional public sample and leaves the default sample cover intact', () => {
    expect(sampleBookLeaves()[0].front.kind).toBe('cover');
    const sample = sampleBookLeaves({ coverName: 'Fictional Reader', edition: 'signature', coverChoice: 'design:vintage-monogram', coverSrc: 'monogram.jpg' });
    expect(sample[0].front).toMatchObject({ kind: 'jacket', cover: { name: 'Fictional Reader', birthLine: expect.stringContaining('1987') } });
    expect(JSON.stringify(sample)).not.toContain('Shane');
  });
});

import { memberComicLeaves as _mcl } from '@/content/sampleBookLeaves';
describe('member comic preview', () => {
  it('builds 24 complete comic pages naming the reader from the saved chart', () => {
    const leaves = _mcl({ name: 'Test Reader', date: '1990-09-06', time: '12:00', lat: 40.7, lon: -74, tz: 'America/New_York', placeLabel: 'New York' } as never);
    expect(leaves[0].front.kind).toBe('comic-page');
    const faces = leaves.flatMap(l => [l.front, l.back]);
    expect(JSON.stringify(faces)).toContain('Test Reader');
    expect(faces.filter(f => f.kind === 'comic-page')).toHaveLength(24);
  });
});
