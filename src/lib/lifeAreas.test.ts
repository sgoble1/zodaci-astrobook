import { describe, expect, it } from 'vitest';
import { computeChart, houseOf } from './astro';
import { transitPositions } from './transitOverlay';
import { detectPatterns, eventArea, HOUSE_AREA } from './lifeAreas';

describe('life areas', () => {
  it('finds the areas a member keeps writing about, most mentioned first', () => {
    const texts = ['My boss moved the deadline again and money is tight.', 'Work was calmer; talked with a friend.', 'Another project at work.', 'Slept badly.'];
    const top = detectPatterns(texts);
    expect(top[0]).toEqual({ area: 'work', hits: 5 });
    expect(top.map(t => t.area)).not.toContain('love');
  });
  it('ignores an area mentioned only once', () => {
    expect(detectPatterns(['I miss my partner.'])).toEqual([]);
  });
  it('an exact contact belongs to the natal point it touches', () => {
    const chart = computeChart({ date: '1990-06-15', time: null, lat: 40.7, lon: -74, tz: 'America/New_York', placeLabel: 'New York', placeSource: 'geocoded' });
    expect(eventArea({ natalKey: 'venus', planet: 'saturn', date: new Date() }, chart)).toBe('love');
    expect(eventArea({ natalKey: 'mc', planet: 'jupiter', date: new Date() }, chart)).toBe('work');
  });
  it('a station uses the natal house only when the birth time is known', () => {
    const date = new Date('2024-08-05T12:00:00Z');
    const untimed = computeChart({ date: '1990-06-15', time: null, lat: 40.7, lon: -74, tz: 'America/New_York', placeLabel: 'New York', placeSource: 'geocoded' });
    expect(eventArea({ planet: 'mercury', date }, untimed)).toBeNull();
    const timed = computeChart({ date: '1990-06-15', time: '08:30', lat: 40.7, lon: -74, tz: 'America/New_York', placeLabel: 'New York', placeSource: 'geocoded', houseSystem: 'placidus' });
    const lon = transitPositions(date).find(p => p.key === 'mercury')!.lon;
    expect(eventArea({ planet: 'mercury', date }, timed)).toBe(HOUSE_AREA[houseOf(lon, timed.cusps!)]);
  });
});
