import * as Astronomy from 'astronomy-engine';
import { eclLon } from './astro';
const DAY = 86400000;
const delta = (a: number, b: number) => ((a - b + 540) % 360) - 180;
export const DYNAMIC_PLANETS = [Astronomy.Body.Sun, Astronomy.Body.Moon, Astronomy.Body.Mercury, Astronomy.Body.Venus, Astronomy.Body.Mars, Astronomy.Body.Jupiter, Astronomy.Body.Saturn, Astronomy.Body.Uranus, Astronomy.Body.Neptune, Astronomy.Body.Pluto];
export function planetSpeed(planet: Astronomy.Body, date: Date) {
  return delta(eclLon(planet, new Date(date.getTime() + DAY / 2)), eclLon(planet, new Date(date.getTime() - DAY / 2)));
}
export function motionState(speed: number, nextSpeed: number, average: number) {
  const stationary = Math.abs(speed) <= average * 0.05;
  return stationary ? nextSpeed > speed ? 'Stationary · turning Direct' : 'Stationary · turning Retrograde' : speed < 0 ? 'Retrograde' : 'Direct';
}
/** Comparison baseline = mean absolute daily speed over this calendar year, not a fabricated nominal speed. */
const averages = new Map<number, number[]>();
export function planetarySpeeds(date: Date) {
  const year = date.getUTCFullYear();
  let baseline = averages.get(year);
  if (!baseline) {
    baseline = DYNAMIC_PLANETS.map(p => Array.from({ length: 24 }, (_, i) => Math.abs(planetSpeed(p, new Date(Date.UTC(year, 0, 1 + i * 15))))).reduce((a, b) => a + b, 0) / 24);
    if (averages.size >= 8) averages.clear();
    averages.set(year, baseline);
  }
  return DYNAMIC_PLANETS.map((planet, i) => {
    const speed = planetSpeed(planet, date);
    const next = planetSpeed(planet, new Date(date.getTime() + DAY));
    const average = baseline?.[i] ?? 0;
    return { planet, speed, average, percent: average ? speed / average * 100 : 0, state: motionState(speed, next, average) };
  });
}