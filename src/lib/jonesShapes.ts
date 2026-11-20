import type { ChartResult } from './astro';
export type JonesShape = 'Bowl' | 'Bundle' | 'Locomotive' | 'Splash' | 'Splay' | 'Bucket' | 'Seesaw';
const PLANETS = new Set(['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']);
const norm = (v: number) => ((v % 360) + 360) % 360;
const gapsFor = (v: number[]) => v.map((n, i) => norm(v[(i + 1) % v.length] - n));
/** Explicit geometric working definitions, not a universally agreed diagnostic of character. */
export function classifyLongitudes(longitudes: number[]): { shape: JonesShape; span: number; gaps: number[]; handle?: number; note: string } {
  if (longitudes.length !== 10 || longitudes.some(n => !Number.isFinite(n))) throw new Error('Jones shapes require the ten calculated planets.');
  const values = longitudes.map(norm).sort((a, b) => a - b);
  const gaps = gapsFor(values);
  const span = 360 - Math.max(...gaps);
  const result = (shape: JonesShape, note: string, handle?: number) => ({ shape, span, gaps, note, ...(handle !== undefined ? { handle } : {}) });
  if (span <= 120) return result('Bundle', 'All ten planets fit inside 120° or less.');
  for (let i = 0; i < values.length; i++) {
    const rest = values.filter((_, j) => i !== j);
    const restSpan = 360 - Math.max(...gapsFor(rest));
    if (restSpan <= 180 && gaps[(i + 9) % 10] >= 60 && gaps[i] >= 60) return result('Bucket', 'Nine planets occupy at most 180°; an isolated handle has at least 60° clear on both sides.', values[i]);
  }
  if (span <= 180) return result('Bowl', 'All ten planets fit inside one hemisphere (180°).');
  const breaks = gaps.map((gap, i) => gap >= 60 ? i : -1).filter(i => i >= 0);
  if (breaks.length === 2) {
    const size = (breaks[1] - breaks[0] + 10) % 10;
    if (size >= 2 && size <= 8) return result('Seesaw', 'Two groups, each containing at least two planets, separated by two gaps of at least 60°.');
  }
  if (span <= 240 && Math.max(...gaps) >= 120) return result('Locomotive', 'Planets occupy more than 180° but no more than 240°, leaving a gap of at least 120°.');
  if (Math.max(...gaps) <= 60) return result('Splash', 'Distributed around the circle, with no empty interval greater than 60°.');
  return result('Splay', 'An irregular distribution that does not clearly meet the other six definitions; borderline patterns can be read differently.');
}
export function jonesShape(chart: ChartResult) {
  if (!chart.input.time) return null; // A provisional Moon can change borderline classifications.
  return classifyLongitudes(chart.bodies.filter(b => PLANETS.has(b.key)).map(b => b.lon));
}