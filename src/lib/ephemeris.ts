import { skyAt } from './skyNow';
import type { BodyPos } from './astro';
export const EPHEMERIS_PLANETS = ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'] as const;
export type EphemerisDay = { date: string; bodies: BodyPos[] };
export function ephemerisMonth(year: number, month: number): EphemerisDay[] {
  if (!Number.isInteger(year) || year < 1800 || year > 2100 || !Number.isInteger(month) || month < 1 || month > 12) throw new Error('Choose a year from 1800 to 2100 and a valid month.');
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return Array.from({ length: days }, (_, i) => { const at = new Date(Date.UTC(year, month - 1, i + 1)); return { date: at.toISOString().slice(0, 10), bodies: skyAt(at).filter(b => (EPHEMERIS_PLANETS as readonly string[]).includes(b.key)) }; });
}
export function filterEphemeris(rows: EphemerisDay[], planet: string, retroOnly: boolean) { return rows.flatMap(day => day.bodies.filter(b => (!planet || b.key === planet) && (!retroOnly || b.retro)).map(body => ({ date: day.date, body }))); }