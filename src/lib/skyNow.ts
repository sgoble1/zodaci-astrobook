import { computeChart, type BodyPos } from '@/lib/astro';

/** Geocentric planet positions at an instant, from the same engine as natal charts. Houses are omitted: they depend on a place. */
/** Part of Fortune and Vertex are built from a birthplace's horizon, so they have no meaning for the general sky. */
const PLACE_BOUND = new Set(['fortune', 'vertex']);
export function skyAt(at: Date): BodyPos[] {
  const iso = at.toISOString();
  return computeChart({ date: iso.slice(0, 10), time: iso.slice(11, 16), lat: 0, lon: 0, tz: 'UTC', placeLabel: 'Geocentric', placeSource: 'manual' })
    .bodies.filter(b => !PLACE_BOUND.has(b.key)).map(b => ({ ...b, house: null }));
}

/** "14 Nov 2026, 13:41 UTC" and the viewer's own clock, so both are always labelled. */
export function dualTime(d: Date, localTz?: string) {
  const fmt = (timeZone: string) => d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone, timeZoneName: 'short' });
  return { utc: fmt('UTC'), local: fmt(localTz || Intl.DateTimeFormat().resolvedOptions().timeZone) };
}
