import { describe, expect, it } from 'vitest';
import { computeChart, type ChartInput } from './astro';
import { interAspects, possessive, dayMasterRelation, sharedGoodDirections, distanceKm } from './synastry';
import { kuaNumber } from './kua';

const partner: ChartInput = { date: '1985-02-14', time: '08:30', lat: 40.7128, lon: -74.006, tz: 'America/New_York', placeLabel: 'New York', placeSource: 'geocoded', houseSystem: 'placidus' };
const shane: ChartInput = { date: '1993-03-25', time: '13:55', lat: 42.96395, lon: -78.73781, tz: 'America/New_York', placeLabel: 'Williamsville', placeSource: 'geocoded', houseSystem: 'placidus' };
const zac: ChartInput = { date: '1987-07-10', time: '12:08', lat: 39.9567, lon: -83.0144, tz: 'America/New_York', placeLabel: 'Columbus, Ohio', placeSource: 'geocoded', houseSystem: 'placidus' };

describe('relationship comparisons use the signed-in person’s own chart', () => {
  it('different people get different contacts with the same partner', () => {
    const B = computeChart(partner);
    const fromShane = interAspects(computeChart(shane), B, 'Shane', 'Sam').map(x => `${x.aKey}-${x.type}-${x.bKey}`);
    const fromZac = interAspects(computeChart(zac), B, 'Zac', 'Sam').map(x => `${x.aKey}-${x.type}-${x.bKey}`);
    expect(fromShane).not.toEqual(fromZac);
  });
  it('names the signed-in person in the text, never April', () => {
    const ia = interAspects(computeChart(zac), computeChart(partner), 'Zac', 'Sam');
    expect(ia[0].text.startsWith('Zac’s ')).toBe(true);
    expect(ia.some(x => x.text.includes('April'))).toBe(false);
  });
  it('reads naturally when no name is saved', () => {
    expect(possessive('You')).toBe('Your');
    expect(possessive('Zac')).toBe('Zac’s');
    expect(dayMasterRelation('Wood', 'Fire', 'You', 'Sam')).toBe('Your Wood nourishes Sam’s Fire (generating cycle): You tend to support and feed Sam.');
  });
});

describe('Kua for the signed-in person comes from their own birth date and sex', () => {
  it('Shane (male, 1993) is Kua 7; unspecified sex has no Kua', () => {
    expect(kuaNumber('1993-03-25', 'male')?.kua).toBe(7);
    expect(kuaNumber('1993-03-25', 'unspecified')).toBeNull();
  });
  it('post-2000 births use the 2000s formula (2005: male 4, female 2)', () => {
    expect(kuaNumber('2005-06-01', 'male')?.kua).toBe(4);
    expect(kuaNumber('2005-06-01', 'female')?.kua).toBe(2);
    expect(kuaNumber('1990-06-01', 'male')?.kua).toBe(1);
  });
  it('shared good directions are symmetric', () => {
    expect(sharedGoodDirections(1, 9)).toEqual(sharedGoodDirections(9, 1).slice().sort((a, b) => sharedGoodDirections(1, 9).indexOf(a) - sharedGoodDirections(1, 9).indexOf(b)));
    expect(sharedGoodDirections(1, 2)).toEqual([]);
  });
  it('birthplace distance is plain geography', () => {
    expect(distanceKm(40.7128, -74.006, 40.7128, -74.006)).toBe(0);
    expect(Math.abs(distanceKm(40.7128, -74.006, 39.9567, -83.0144) - 768)).toBeLessThan(10);
  });
});

describe('Zac natal reference (Volume I, confirmed 12:08 birth time)', () => {
  const c = computeChart(zac);
  const diff = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);
  it('matches the source Ascendant, Sun and Moon within 0.25°', () => {
    expect(c.utc.toISOString()).toBe('1987-07-10T16:08:00.000Z');
    expect(diff(c.bodies.find(b => b.key === 'sun')!.lon, 90 + 17 + 52 / 60)).toBeLessThan(0.25);
    expect(diff(c.bodies.find(b => b.key === 'moon')!.lon, 270 + 11 + 2 / 60)).toBeLessThan(0.25);
    expect(diff(c.asc!, 150 + 27 + 38 / 60)).toBeLessThan(0.25);
  });
});
