import { describe, expect, it } from 'vitest';
import { BOOK_VERSIONS, bookTotal, contentDepth, editionName, marginPct, versionOf } from './books';
import { moonPhase, nextSolarReturn } from './bookExtras';
import { buildVolumes, chineseYear, lahiri, lifePath, profection, volumeFor } from './bookVolumes';
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
  it('Olivia Chen is born under a First Quarter Moon (Moon about 123° ahead of the Sun)', () => { const p = moonPhase(olivia); expect(p.name).toBe('First Quarter'); expect(Math.round(p.angle)).toBeGreaterThan(115); expect(Math.round(p.angle)).toBeLessThan(130); });
  it('her next solar return after Jan 2026 falls in March 2026', () => {
    const sr = nextSolarReturn(olivia, new Date('2026-01-01T00:00:00Z'));
    expect(sr.getUTCFullYear()).toBe(2026); expect(sr.getUTCMonth()).toBe(2);
  });
  const titles = (edition: string, opts: Partial<Parameters<typeof buildVolumes>[0]> = {}) => buildVolumes({ edition, chart: olivia, name: 'Olivia', saved: [], today: new Date('2026-01-01T00:00:00Z'), ...opts }).map(c => c.title);
  it('Digital has no verse; Pocket adds the verse', () => {
    expect(titles('digital')).not.toContain('Your Birth-Moment Verse');
    expect(titles('pocket')).toContain('Your Birth-Moment Verse');
  });
  it('Digital and Pocket have five volumes; World Systems (V) starts at Classic', () => {
    const vols = (e: string) => titles(e).filter(t => t.startsWith('Volume '));
    expect(vols('digital')).toHaveLength(5); expect(vols('pocket')).toHaveLength(5);
    expect(vols('digital').some(t => t.startsWith('Volume V ·'))).toBe(false);
    expect(vols('classic')).toHaveLength(6); expect(vols('linen')).toHaveLength(6);
  });
  it('every version is composable with no finished readings', () => {
    for (const e of ['digital', 'pocket', 'classic', 'signature', 'linen']) expect(titles(e)).toEqual(expect.arrayContaining(['Your Big Three', 'The Twelve Houses', 'Your Planets, One by One', 'Your Aspects', 'Your North Node', 'Your Profection Year']));
  });
  it('Classic adds the wheel, aspect grid, RetroGOOD and solar return', () => {
    expect(titles('classic')).toEqual(expect.arrayContaining(['Your Birth Sky', 'Aspect Grid', 'RetroGOOD: Your Retrograde Planets', 'Solar Return Preview']));
    expect(titles('pocket')).not.toContain('Aspect Grid');
  });
  it("only Collector's Linen has the certificate, forecast and lots", () => {
    const sig = buildVolumes({ edition: 'signature', chart: olivia, name: 'Olivia', saved: [] });
    expect(sig.some(c => c.draw === 'certificate')).toBe(false);
    expect(titles('linen')).toEqual(expect.arrayContaining(['Your 12-Month Sky Forecast', 'Lots and Fixed Stars', 'Collector’s Certificate']));
  });
  it('Linen with nobody saved gets synastry keys instead of comparisons', () => {
    expect(titles('linen')).toContain('Your Synastry Keys');
    expect(titles('linen', { people: [{ name: 'Sam', chart: olivia }] })).toContain('Relationship Comparisons');
  });
  it('aspect depth grows by version: 8, 12, 24, 36, up to 60', () => {
    const count = (e: string) => (buildVolumes({ edition: e, chart: olivia, name: 'Olivia', saved: [] }).find(c => c.title === 'Your Aspects')!.content.match(/^## /gm) ?? []).length;
    expect([count('digital'), count('pocket'), count('classic'), count('signature')]).toEqual([8, 12, 24, 36].map(n => Math.min(n, olivia.aspects.length)));
  });
  it('saved readings land in the volume they belong to', () => {
    expect(volumeFor('Love & Attraction')).toBe('III');
    expect(volumeFor('Career Calling')).toBe('II');
    expect(volumeFor('Your Shadow Work')).toBe('IV');
    expect(volumeFor('The Year Ahead')).toBe('VI');
    expect(volumeFor('Big Three')).toBe('I');
    const out = buildVolumes({ edition: 'classic', chart: olivia, name: 'Olivia', saved: [{ title: 'Love & Attraction', content: 'x' }] }).map(c => c.title);
    expect(out.indexOf('Love & Attraction')).toBeGreaterThan(out.findIndex(t => t.startsWith('Volume III')));
    expect(out.indexOf('Love & Attraction')).toBeLessThan(out.findIndex(t => t.startsWith('Volume IV')));
  });
});

describe('world systems and timing are calculated', () => {
  it('Lahiri ayanamsa is about 23.85° at 2000 and 24.2° in 2025', () => { expect(lahiri(2000)).toBeCloseTo(23.853, 3); expect(lahiri(2025)).toBeCloseTo(24.2, 1); });
  it('a birth on Jan 20, 1990 (before Lichun) belongs to the 1989 Yin Earth Snake year', () => expect(chineseYear('1990-01-20', 300)).toEqual({ year: 1989, element: 'Earth', polarity: 'Yin', animal: 'Snake' }));
  it('Olivia (Mar 14, 1992) is a Yang Water Monkey', () => expect(chineseYear('1992-03-14', 354)).toMatchObject({ year: 1992, element: 'Water', polarity: 'Yang', animal: 'Monkey' }));
  it('Life Path for 1992-03-14 is master number 11 (3 + 5 + 3)', () => expect(lifePath('1992-03-14')).toBe(11));
  it('Life Path for 1987-07-10 is 6 (7 + 1 + 7 = 15 → 6)', () => expect(lifePath('1987-07-10')).toBe(6));
  it('profection at 33 activates the 10th house', () => expect(profection(olivia, new Date('2026-01-01T00:00:00Z'))?.house).toBe(10));
});

describe('manifest depth per version', () => {
  const row = (title: string, section = 'My Masterbook') => ({ title, content: 'x', section, status: 'ready', updated_at: '2026-01-02T00:00:00Z' });
  it('Classic includes finished topic readings', () => expect(manuscriptManifest([row('Inner world'), row('Career', 'Topic Reading')], 'classic', [], null)).toHaveLength(2));
  it('Pocket leaves topic readings out', () => expect(manuscriptManifest([row('Inner world'), row('Career', 'Topic Reading')], 'pocket', [], null)).toHaveLength(1));
});
