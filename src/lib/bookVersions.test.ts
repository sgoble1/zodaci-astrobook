import { describe, expect, it } from 'vitest';
import { BOOK_VERSIONS, bookTotal, contentDepth, editionName, marginPct, versionOf } from './books';
import { editionExtras, moonPhase, nextSolarReturn } from './bookExtras';
import { manuscriptManifest } from './manuscriptManifest';
import { computeChart, type ChartInput } from './astro';

const olivia = computeChart({ date: '1992-03-14', time: '07:23', lat: 45.5152, lon: -122.6784, tz: 'America/Los_Angeles', placeLabel: 'Portland, Oregon, USA', placeSource: 'geocoded', houseSystem: 'placidus' } as ChartInput);

describe('AstroBook versions and prices', () => {
  it('Digital PDF is $24.99', () => expect(bookTotal('digital', 0, 'digital')).toBe(2499));
  it('Pocket is $34.99', () => expect(bookTotal('pocket', 0)).toBe(3499));
  it('Classic is $59.99', () => expect(bookTotal('classic', 0)).toBe(5999));
  it('Signature Hardcover is $97', () => expect(bookTotal('signature', 0)).toBe(9700));
  it("Collector's Linen is $149", () => expect(bookTotal('linen', 0)).toBe(14900));
  it('extra sections stay $6.99 each', () => expect(bookTotal('linen', 2)).toBe(14900 + 1398));
  it('only the Digital version is a download', () => expect(BOOK_VERSIONS.filter(v => v.format === 'digital').map(v => v.id)).toEqual(['digital']));
  it('legacy Standard orders keep their $59 price', () => expect(bookTotal('standard', 0)).toBe(5900));
  it('Classic and above include topic readings; Digital and Pocket do not', () => {
    expect(['digital', 'pocket'].map(contentDepth)).toEqual(['standard', 'standard']);
    expect(['classic', 'signature', 'linen', 'expanded'].map(contentDepth)).toEqual(['expanded', 'expanded', 'expanded', 'expanded']);
  });
  it('names earlier editions clearly', () => expect(editionName('expanded', 'print')).toContain('earlier edition'));
  it('computes margin percentages', () => expect(marginPct(5999, 3600)).toBe(40));
  it('Signature is an 8.5 inch square', () => expect(versionOf('signature')?.trimPt).toEqual([612, 612]));
});

describe('edition chapters come from the calculated chart', () => {
  it('Olivia Chen is born under a Waning (Balsamic) Moon two days before New Moon', () => expect(moonPhase(olivia).name).toBe('Balsamic'));
  it('her next solar return after Jan 2026 falls in March 2026', () => {
    const sr = nextSolarReturn(olivia, new Date('2026-01-01T00:00:00Z'));
    expect(sr.getUTCFullYear()).toBe(2026); expect(sr.getUTCMonth()).toBe(2);
  });
  it('Digital has no verse; Pocket adds the verse', () => {
    expect(editionExtras('digital', olivia, 'Olivia').map(c => c.title)).not.toContain('Your Birth-Moment Verse');
    expect(editionExtras('pocket', olivia, 'Olivia').map(c => c.title)).toContain('Your Birth-Moment Verse');
  });
  it('Classic adds the wheel, aspect grid and RetroGOOD', () => {
    const t = editionExtras('classic', olivia, 'Olivia').map(c => c.title);
    expect(t).toEqual(expect.arrayContaining(['Your Birth Sky', 'Aspect Grid', 'RetroGOOD: Your Retrograde Planets', 'Solar Return Preview']));
  });
  it("only Collector's Linen has the certificate and forecast", () => {
    expect(editionExtras('signature', olivia, 'Olivia').some(c => c.draw === 'certificate')).toBe(false);
    const linen = editionExtras('linen', olivia, 'Olivia', { today: new Date('2026-01-01T00:00:00Z') });
    expect(linen.some(c => c.draw === 'certificate')).toBe(true);
    expect(linen.map(c => c.title)).toContain('Your 12-Month Sky Forecast');
  });
  it('legacy editions get no version chapters', () => expect(editionExtras('standard', olivia, 'Olivia')).toEqual([]));
});

describe('manifest depth per version', () => {
  const row = (title: string, section = 'My Masterbook') => ({ title, content: 'x', section, status: 'ready', updated_at: '2026-01-02T00:00:00Z' });
  it('Classic includes finished topic readings', () => expect(manuscriptManifest([row('Inner world'), row('Career', 'Topic Reading')], 'classic', [], null)).toHaveLength(2));
  it('Pocket leaves topic readings out', () => expect(manuscriptManifest([row('Inner world'), row('Career', 'Topic Reading')], 'pocket', [], null)).toHaveLength(1));
});
