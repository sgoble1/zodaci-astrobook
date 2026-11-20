import * as Astronomy from 'astronomy-engine';
import { computeChart, type ChartResult } from './astro';
export type ReturnLocation = { lat: number; lon: number; tz: string; placeLabel: string };
/** Library root search on apparent geocentric Sun longitude. Same UTC instant at every location. */
export function solarReturn(natal: ChartResult, year: number, location: ReturnLocation): { instant: Date; chart: ChartResult; provisional: boolean } {
  if (!Number.isInteger(year) || year < 1800 || year > 2100) throw new Error('Choose a year from 1800 to 2100.');
  if (!Number.isFinite(location.lat) || Math.abs(location.lat) >= 90 || !Number.isFinite(location.lon) || Math.abs(location.lon) > 180) throw new Error('Check the latitude (between −90 and 90) and longitude (−180 to 180).');
  const sun = natal.bodies.find(b => b.key === 'sun');
  if (!sun) throw new Error('The natal Sun could not be calculated.');
  const result = Astronomy.SearchSunLongitude(sun.lon, new Date(Date.UTC(year, 0, 1)), 370);
  if (!result || result.date.getUTCFullYear() !== year) throw new Error('The solar return could not be found for that year.');
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: location.tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(result.date).map(p => [p.type, p.value]));
  const date = `${parts.year}-${parts.month}-${parts.day}`;
  const time = natal.input.time ? `${parts.hour}:${parts.minute}` : null;
  const chart = computeChart({ ...natal.input, ...location, date, time, placeSource: 'manual' }, result.date);
  return { instant: result.date, chart, provisional: !natal.input.time };
}