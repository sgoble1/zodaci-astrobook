import { computeChart, fmtLon, type ChartResult } from '@/lib/astro';

/**
 * The calculated sky at the logged local time on the dream date, compared with natal dream-related points.
 * Pure ephemeris calculation; it describes symbolic tradition, not prediction or diagnosis.
 */
export const DREAM_TARGETS = ['moon', 'neptune', 'pluto', 'southNode'] as const;
const MOVING = ['moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'neptune', 'pluto'];
const ASPECTS: [string, number, number][] = [['conjunct', 0, 4], ['opposite', 180, 3], ['square', 90, 3], ['trine', 120, 3], ['sextile', 60, 2]];
const sep = (a: number, b: number) => { const d = Math.abs(((a - b) % 360 + 360) % 360); return d > 180 ? 360 - d : d; };

export const FEELINGS = ['calm', 'afraid', 'chased', 'water', 'flying', 'falling', 'familiar person', 'old place', 'house or rooms', 'teeth'] as const;
/** Motif → chart factors tradition links to it. */
export const MOTIF_FACTORS: Record<string, string> = {
  water: 'Neptune, the Moon and the 12th house', chased: 'Mars and Pluto', flying: 'Jupiter and Neptune', falling: 'Saturn',
  teeth: 'Saturn', 'house or rooms': 'the 4th house and the Moon', 'old place': 'the Moon and the South Node',
  'familiar person': 'the Moon and the 7th house', afraid: 'Pluto and the 8th house', calm: 'the Moon and Venus',
};

export type DreamContact = { moving: string; aspect: string; target: string; orb: number };
export type DreamSky = {
  contacts: DreamContact[];
  houses: { house: 8 | 12; planets: string[] }[];
  motifs: { feeling: string; factors: string }[];
  moonPhase: string;
};

function phaseOf(night: ChartResult): string {
  const sun = night.bodies.find(b => b.key === 'sun');
  const moon = night.bodies.find(b => b.key === 'moon');
  if (!sun || !moon) return 'unknown';
  const angle = sep(sun.lon, moon.lon);
  if (angle <= 22.5 || angle >= 337.5) return 'new moon';
  if (angle <= 67.5) return 'waxing crescent';
  if (angle <= 112.5) return 'first quarter';
  if (angle <= 157.5) return 'waxing gibbous';
  if (angle <= 202.5) return 'full moon';
  if (angle <= 247.5) return 'waning gibbous';
  if (angle <= 292.5) return 'last quarter';
  return 'waning crescent';
}

/** Sky at the selected local time (03:00 by default) on the dream date. */
export function dreamSky(natal: ChartResult, date: string, feelings: string[] = [], time = '03:00'): DreamSky {
  const night = computeChart({ ...natal.input, date, time });
  const contacts: DreamContact[] = [];
  for (const moving of night.bodies.filter(b => MOVING.includes(b.key))) {
    for (const target of natal.bodies.filter(b => (DREAM_TARGETS as readonly string[]).includes(b.key))) {
      const distance = sep(moving.lon, target.lon);
      for (const [name, angle, orb] of ASPECTS) {
        if (Math.abs(distance - angle) <= orb) {
          contacts.push({ moving: moving.name, aspect: name, target: target.name.replace(/ \(mean\)/, ''), orb: Math.round(Math.abs(distance - angle) * 10) / 10 });
        }
      }
    }
  }
  contacts.sort((a, b) => a.orb - b.orb);

  const houses: DreamSky['houses'] = [];
  const cusps = natal.cusps;
  if (natal.input.time && cusps?.length === 12) {
    for (const house of [8, 12] as const) {
      const start = cusps[house - 1], end = cusps[house % 12];
      const span = ((end - start) % 360 + 360) % 360;
      const planets = night.bodies.filter(b => MOVING.includes(b.key) && ((b.lon - start) % 360 + 360) % 360 < span).map(b => b.name);
      if (planets.length) houses.push({ house, planets });
    }
  }

  const motifs = feelings.filter(f => MOTIF_FACTORS[f]).map(f => ({ feeling: f, factors: MOTIF_FACTORS[f] }));
  return { contacts: contacts.slice(0, 8), houses, motifs, moonPhase: phaseOf(night) };
}

/** Format a longitude as the familiar sign-degree value, useful for sky badges. */
export const dreamSignAt = (chart: ChartResult, key: string) => {
  const body = chart.bodies.find(b => b.key === key);
  return body ? fmtLon(body.lon).text : null;
};
