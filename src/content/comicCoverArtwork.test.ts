import { describe, expect, it } from 'vitest';
import { buildComicPreview } from '@/lib/comicNarrative';
import { comicPreviewArt } from './castArt';
import { comicCoverArtwork, COMIC_SCENES } from './comicSceneArt';
import { computeChart } from '@/lib/astro';
import { sampleReaderChart, sampleComicLeaves } from './sampleBookLeaves';
import { personalCoverArtwork } from './personalCoverArtwork';

const shane = computeChart({ date: '1993-03-25', time: '13:55', lat: 42.9639, lon: -78.7378, tz: 'America/New_York', placeLabel: 'Williamsville, New York', placeSource: 'geocoded', houseSystem: 'placidus' });
const issue = (chart = shane, reader = 'Shane') => buildComicPreview(chart, { reader, month: new Date(Date.UTC(2026, 10, 1)), issueNumber: 2 });
describe('separate chart-specific comic cover', () => {
  it('uses the redesigned cover for Shane’s calculated Aries Sun, Taurus Moon and Leo rising issue', () => {
    const comic = issue();
    expect(comic.signs).toMatchObject({ sun: 'Aries', moon: 'Taurus', rising: 'Leo' });
    expect(comicCoverArtwork(comic)).toContain('shane-atomic-comic-cover');
    expect(comicPreviewArt(comic)['1-0']).toBe(comicCoverArtwork(comic));
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
