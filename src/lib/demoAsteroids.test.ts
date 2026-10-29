import { describe, it, expect } from 'vitest';
import { computeChart } from './astro';
import { withDemoAsteroids } from './demoAsteroids';

const chart = (date: string, time: string, lat: number, lon: number, tz: string) => withDemoAsteroids(computeChart({ date, time, lat, lon, tz, placeLabel: '', placeSource: 'geocoded' }));
const pos = (r: ReturnType<typeof chart>, n: string) => { const b = r.bodies.find(x => x.name === n)!; return `${b.sign} ${b.deg}°${b.retro ? ' R' : ''}`; };

describe('demo asteroids (JPL Horizons reference)', () => {
  it('London 2000 solstice', () => {
    const r = chart('2000-06-21', '12:00', 51.5074, -0.1278, 'Europe/London');
    expect([pos(r, 'Ceres'), pos(r, 'Pallas'), pos(r, 'Juno'), pos(r, 'Vesta')]).toEqual(['Libra 1°', 'Leo 28°', 'Aquarius 26°', 'Capricorn 29° R']);
  });
  it('New York 1995', () => {
    const r = chart('1995-01-01', '09:30', 40.7128, -74.006, 'America/New_York');
    expect([pos(r, 'Ceres'), pos(r, 'Pallas'), pos(r, 'Juno'), pos(r, 'Vesta')]).toEqual(['Leo 19° R', 'Taurus 6°', 'Sagittarius 10°', 'Cancer 1° R']);
  });
  it('Sydney 1988 uses standard time (DST had ended)', () => {
    const r = chart('1988-03-20', '18:15', -33.8688, 151.2093, 'Australia/Sydney');
    expect([pos(r, 'Ceres'), pos(r, 'Pallas'), pos(r, 'Juno'), pos(r, 'Vesta')]).toEqual(['Pisces 0°', 'Aquarius 6°', 'Aries 24°', 'Cancer 23°']);
  });
  it('leaves other charts untouched', () => {
    const r = chart('1990-05-05', '10:00', 0, 0, 'UTC');
    expect(r.bodies.some(b => b.name === 'Ceres')).toBe(false);
  });
});
