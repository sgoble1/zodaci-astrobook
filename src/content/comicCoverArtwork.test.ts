import { describe, expect, it } from 'vitest';
import { buildComicPreview, buildFounderComic } from '@/lib/comicNarrative';
import { comicPreviewArt } from './castArt';
import { comicCoverArtwork, COMIC_SCENES } from './comicSceneArt';
import { computeChart } from '@/lib/astro';
import { sampleReaderChart, sampleComicLeaves } from './sampleBookLeaves';
import { personalCoverArtwork } from './personalCoverArtwork';

const shane = computeChart({ date: '1993-03-25', time: '13:55', lat: 42.9639, lon: -78.7378, tz: 'America/New_York', placeLabel: 'Williamsville, New York', placeSource: 'geocoded', houseSystem: 'placidus' });
const issue = (chart = shane, reader = 'Shane') => buildComicPreview(chart, { reader, month: new Date(Date.UTC(2026, 10, 1)), issueNumber: 2 });
describe('separate chart-specific comic cover', () => {
  it('retains Shane’s verified Taurus Moon in the 10th house', () => {
    const moon = shane.bodies.find(body => body.key === 'moon');
    expect(moon?.sign).toBe('Taurus');
    expect(moon?.house).toBe(10);
  });
  it('resolves distinct shelf covers from explicit founder edition identities without requiring birth data', () => {
    const covers = ['shane', 'april', 'zac'].map(edition => comicCoverArtwork({ edition: edition as 'shane' | 'april' | 'zac' }));
    expect(covers.every(Boolean)).toBe(true);
    expect(new Set(covers).size).toBe(3);
    expect(covers[0]).toContain('shane-atomic-comic-cover');
    expect(comicCoverArtwork({})).toBeUndefined();
  });
  it('uses the redesigned cover for Shane’s calculated Aries Sun, Taurus Moon and Leo rising issue', () => {
    const comic = buildFounderComic(shane, 'shane', { reader: 'Shane', month: new Date(Date.UTC(2026, 10, 1)), issueNumber: 2 });
    expect(comic.signs).toMatchObject({ sun: 'Aries', moon: 'Taurus', rising: 'Leo' });
    expect(comicCoverArtwork(comic)).toContain('shane-atomic-comic-cover');
    expect(comicPreviewArt(comic)['1-0']).toBe(comicCoverArtwork(comic));
    expect(comicCoverArtwork(issue())).toBeUndefined();
  });
  it('preserves the existing AstroBook artwork and keeps the comic cover separate', () => {
    expect(personalCoverArtwork('Shane', shane)).toBe(COMIC_SCENES.cover);
    expect(personalCoverArtwork('Shane', shane)).not.toBe(comicCoverArtwork(issue()));
  });
  it('never substitutes a founder cover on Rosalind’s public chart, even with the founder display name', () => {
    expect(comicCoverArtwork(issue(sampleReaderChart(), 'Shane'))).toBeUndefined();
    expect(comicCoverArtwork(issue(shane, 'Rosalind Vance'))).toBeUndefined();
    const publicFaces = sampleComicLeaves().flatMap(l => [l.front, l.back]);
    expect(publicFaces).toHaveLength(24);
    const first = publicFaces[0];
    if (first.kind !== 'comic-page') throw new Error('Missing public comic cover');
    expect(first.art['1-0']).not.toBe(comicCoverArtwork(issue()));
  });
});
