import { registerPrivateValue } from '@/lib/privateEditionStore';
// Feng Shui content transcribed from "April — Complete Birth Chart Analysis &
// Feng Shui Guide" (PDF, Section 18, pp. 114–122), plus Xuan Kong Flying Star
// charts computed in-app with the standard Lo Shu flight path.
import type { SourceRef } from './compendium';

export const FS_DOC_ID = 'd-ff306540';
const DOC = 'Complete Birth Chart Analysis & Feng Shui Guide';
export const fsSrc = (section: string, page: number): SourceRef & { pageNum: number } => ({ doc: DOC, section, page: `p. ${page}`, pageNum: page });

export type Dir = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' | 'C';
export const DIR_NAME: Record<Dir, string> = { N: 'North', NE: 'Northeast', E: 'East', SE: 'Southeast', S: 'South', SW: 'Southwest', W: 'West', NW: 'Northwest', C: 'Center' };

export interface KuaDirection { dir: Exclude<Dir, 'C'>; name: string; meaning: string; auspicious: boolean; activation: string; standardNote?: string; }

/** Verbatim from the 18A direction table (pp. 115–116). */
export let KUA_DIRECTIONS: KuaDirection[] = [];

export let KUA_FOUNDATION: { text: string; source: SourceRef & { pageNum: number; }; } = {"text":"","source":{"doc":"","section":"","page":"","pageNum":0}};

export let ELEMENT_PROFILE: { paragraphs: string[]; cycle: string[]; present: Record<string, string>; source: SourceRef & { pageNum: number; }; } = {"paragraphs":[],"cycle":[],"present":{"Water":"","Metal":"","Fire":"","Earth":"","Wood":""},"source":{"doc":"","section":"","page":"","pageNum":0}};

export interface Room { id: string; name: string; dirs: Dir[]; text: string; source: SourceRef; }
export let ROOMS: Room[] = [];

export interface Crystal { id: string; name: string; basis: string; purpose: string; placement: string; dirs: Dir[]; source: SourceRef; }
const cs = (p: number) => fsSrc('18D · Crystal Master Guide', p);
export let CRYSTALS: Crystal[] = [];

export interface Week { weeks: string; focus: string; actions: string; source: SourceRef; }
const ws = (p: number) => fsSrc('18E · 12-Week Implementation Timeline', p);
export let TWELVE_WEEKS: Week[] = [];

// ---------------- Flying Stars (Xuan Kong) ----------------
// Not covered by the source PDFs — computed in-app from the classical method and labelled as such.
export interface StarInfo { n: number; name: string; element: string; color: string; nature: 'Auspicious' | 'Mixed' | 'Inauspicious'; theme: string; remedy: string; }
export const STAR_INFO: Record<number, StarInfo> = {
  1: { n: 1, name: 'White Star (Tan Lang)', element: 'Water', color: 'White', nature: 'Auspicious', theme: 'Career, new opportunities, wisdom, romance. Especially resonant for anyone with a Water (Kua 1) element.', remedy: 'Activate with a water feature or blue/black accents; keep active and clear.' },
  2: { n: 2, name: 'Black Star (Ju Men)', element: 'Earth', color: 'Black', nature: 'Inauspicious', theme: 'Illness and low vitality.', remedy: 'Metal: brass gourd, metal wind chime, salt-water cure. Avoid red/fire and heavy activity.' },
  3: { n: 3, name: 'Jade Star (Lu Cun)', element: 'Wood', color: 'Jade', nature: 'Inauspicious', theme: 'Arguments, gossip, legal friction.', remedy: 'Fire (red, candles) to exhaust Wood. Keep quiet; avoid water and plants here.' },
  4: { n: 4, name: 'Green Star (Wen Qu)', element: 'Wood', color: 'Green', nature: 'Auspicious', theme: 'Study, writing, scholarship, romance.', remedy: 'Four stalks of bamboo or a healthy plant; excellent for a study desk.' },
  5: { n: 5, name: 'Yellow Star (Lian Zhen)', element: 'Earth', color: 'Yellow', nature: 'Inauspicious', theme: 'Misfortune, accidents, obstacles — the strongest affliction.', remedy: 'Heavy Metal: six-rod metal chime, brass objects. Do not renovate or dig here that year.' },
  6: { n: 6, name: 'White Star (Wu Qu)', element: 'Metal', color: 'White', nature: 'Auspicious', theme: 'Authority, mentors, windfall, heaven luck.', remedy: 'Metal objects, round shapes, white/silver; good for a desk or meetings.' },
  7: { n: 7, name: 'Red Star (Po Jun)', element: 'Metal', color: 'Red', nature: 'Inauspicious', theme: 'Loss, theft, betrayal, violence (out of timely period).', remedy: 'Water (still bowl of water, blue) to drain Metal; avoid Fire, which ignites it.' },
  8: { n: 8, name: 'White Star (Zuo Fu)', element: 'Earth', color: 'White', nature: 'Mixed', theme: 'Wealth and property — waning after Period 8 ended in 2024 but still broadly positive.', remedy: 'Keep clean and bright; crystals and yellow accents.' },
  9: { n: 9, name: 'Purple Star (You Bi)', element: 'Fire', color: 'Purple', nature: 'Auspicious', theme: 'Celebration, fame, future prosperity — the reigning Period 9 star (2024–2043).', remedy: 'Activate with light, purple/red, Wood to feed Fire. Very favourable now.' },
};

/** Lo Shu flight path order: Center → NW → W → NE → S → N → SW → E → SE */
export const FLIGHT: Dir[] = ['C', 'NW', 'W', 'NE', 'S', 'N', 'SW', 'E', 'SE'];
export const flyStars = (center: number): Record<Dir, number> => {
  const out = {} as Record<Dir, number>;
  FLIGHT.forEach((d, i) => { out[d] = ((center - 1 + i) % 9) + 1; });
  return out;
};
/** Annual center star; changes at Lichun (~Feb 4). 2026 = 1, and it descends by one each year. */
export const annualCenter = (year: number) => (((1 - (year - 2026)) % 9) + 9 - 1) % 9 + 1;
export const periodOf = (year: number) => {
  const start = 1864; const p = Math.floor((year - start) / 20) % 9 + 1;
  const from = start + Math.floor((year - start) / 20) * 20;
  return { period: p, from, to: from + 19 };
};

/** Lo Shu grid laid out South-at-top, the classical Chinese compass convention. */
export const GRID_SOUTH_UP: Dir[][] = [['SE', 'S', 'SW'], ['E', 'C', 'W'], ['NE', 'N', 'NW']];
export const GRID_NORTH_UP: Dir[][] = [['NW', 'N', 'NE'], ['W', 'C', 'E'], ['SW', 'S', 'SE']];

registerPrivateValue("fengshui", "KUA_DIRECTIONS", value => { KUA_DIRECTIONS = value as typeof KUA_DIRECTIONS; }, []);
registerPrivateValue("fengshui", "KUA_FOUNDATION", value => { KUA_FOUNDATION = value as typeof KUA_FOUNDATION; }, {"text":"","source":{"doc":"","section":"","page":"","pageNum":0}});
registerPrivateValue("fengshui", "ELEMENT_PROFILE", value => { ELEMENT_PROFILE = value as typeof ELEMENT_PROFILE; }, {"paragraphs":[],"cycle":[],"present":{"Water":"","Metal":"","Fire":"","Earth":"","Wood":""},"source":{"doc":"","section":"","page":"","pageNum":0}});
registerPrivateValue("fengshui", "ROOMS", value => { ROOMS = value as typeof ROOMS; }, []);
registerPrivateValue("fengshui", "CRYSTALS", value => { CRYSTALS = value as typeof CRYSTALS; }, []);
registerPrivateValue("fengshui", "TWELVE_WEEKS", value => { TWELVE_WEEKS = value as typeof TWELVE_WEEKS; }, []);
