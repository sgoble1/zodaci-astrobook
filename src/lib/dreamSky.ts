import { computeChart, type ChartResult } from '@/lib/astro';

/**
 * "Sky that night" for a dream: which moving planets touched the chart's dream-related points that night.
 * Pure calculation from the ephemeris; it describes symbolic tradition and never predicts events or states past lives as fact.
 */
export const DREAM_TARGETS = ['moon', 'neptune', 'pluto', 'southNode'] as const;
const MOVING = ['moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'neptune', 'pluto'];
const ASPECTS: [string, number, number][] = [['conjunct', 0, 4], ['opposite', 180, 3], ['square', 90, 3], ['trine', 120, 3], ['sextile', 60, 2]];
const sep = (a: number, b: number) => { const d = Math.abs(((a - b) % 360 + 360) % 360); return d > 180 ? 360 - d : d; };

export const FEELINGS = ['calm', 'afraid', 'chased', 'water', 'flying', 'falling', 'familiar person', 'old place', 'house or rooms', 'teeth'] as const;
/** Motif → the chart factors tradition links it to. */
export const MOTIF_FACTORS: Record<string, string> = {
  water: 'Neptune, the Moon and the 12th house', chased: 'Mars and Pluto', flying: 'Jupiter and Neptune', falling: 'Saturn',
  teeth: 'Saturn', 'house or rooms': 'the 4th house and the Moon', 'old place': 'the Moon and the South Node',
  'familiar person': 'the Moon and the 7th house', afraid: 'Pluto and the 8th house', calm: 'the Moon and Venus',
};

export type DreamContact = { moving: string; aspect: string; target: string; orb: number };
export type DreamSky = { contacts: DreamContact[]; houses: { house: 8 | 12; planets: string[] }[]; motifs: { feeling: string; factors: string }[] };

/** Sky at 3 a.m. local on the dream date, compared with the natal chart. */
export function dreamSky(natal: ChartResult, date: string, feelings: string[] = []): DreamSky {
  const night = computeChart({ ...natal.input, date, time: '03:00' });
  const contacts: DreamContact[] = [];
  for (const m of night.bodies.filter(b => MOVING.includes(b.key))) {
    for (const t of natal.bodies.filter(b => (DREAM_TARGETS as readonly string[]).includes(b.key))) {
      const d = sep(m.lon, t.lon);
      for (const [name, angle, orb] of ASPECTS) if (Math.abs(d - angle) <= orb) contacts.push({ moving: m.name, aspect: name, target: t.name.replace(/ \(mean\)/, ''), orb: Math.round(Math.abs(d - angle) * 10) / 10 });
    }
  }
  contacts.sort((a, b) => a.orb - b.orb);
  const houses: DreamSky['houses'] = [];
  const cusps = natal.cusps;
  if (natal.input.time && cusps?.length === 12) {
    for (const h of [8, 12] as const) {
      const start = cusps[h - 1], end = cusps[h % 12];
      const span = ((end - start) % 360 + 360) % 360;
      const planets = night.bodies.filter(b => MOVING.includes(b.key) && ((b.lon - start) % 360 + 360) % 360 < span).map(b => b.name);
      if (planets.length) houses.push({ house: h, planets });
    }
  }
  const motifs = feelings.filter(f => MOTIF_FACTORS[f]).map(f => ({ feeling: f, factors: MOTIF_FACTORS[f] }));
  return { contacts: contacts.slice(0, 8), houses, motifs };
}
