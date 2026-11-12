import type { BodyPos, ChartResult } from '@/lib/astro';
import { HOUSE_ARENAS, SIGN_EXPRESSIONS } from '@/content/interpretationLibrary';
import { isTimed, ordinal, placementLine, signOfLon, TRADITIONAL_RULER } from '@/lib/investigations';
import { lifeCycles, type CycleEvent } from '@/lib/lifeCycles';
import { upcomingEvents, type TransitEvent } from '@/lib/transitOverlay';

/**
 * Museum of the Sky: five galleries that exhibit the member's own calculated placements as framed plates.
 * Plaques quote the chart and the shared interpretation vocabulary only. The Roots gallery describes symbolism of
 * home and belonging, never a person's childhood or family history.
 */
export type GalleryId = 'roots' | 'relationships' | 'purpose' | 'future' | 'legacy';
export type Element = 'fire' | 'earth' | 'air' | 'water';

export interface Exhibit { id: string; title: string; glyph: string; sign: string; element: Element; plaque: string; facts: string[] }
export interface Milestone { key: string; title: string; date: Date; age: number; meaning: string; past: boolean }
export interface Gallery {
  id: GalleryId; name: string; wing: string; curatorNote: string; note?: string;
  exhibits: Exhibit[]; milestones: Milestone[]; coming: TransitEvent[];
}

export const GALLERIES: { id: GalleryId; name: string; wing: string; intro: string; points: string[]; house?: number; art: 'house' | 'love' | 'purpose' | 'year' | 'book' }[] = [
  { id: 'roots', name: 'Roots & Belonging', wing: 'East Wing', intro: 'How your chart pictures home, comfort and belonging.', points: ['moon', 'ceres'], house: 4, art: 'house' },
  { id: 'relationships', name: 'Relationships', wing: 'West Wing', intro: 'Venus, Mars, Juno and the Descendant: how you love and partner.', points: ['venus', 'mars', 'juno'], house: 7, art: 'love' },
  { id: 'purpose', name: 'Purpose', wing: 'North Wing', intro: 'The Sun, the North Node and the Midheaven: where the chart points.', points: ['sun', 'northNode'], house: 10, art: 'purpose' },
  { id: 'future', name: 'Future Exhibitions', wing: 'Special Exhibitions Hall', intro: 'Real slow-planet contacts and life cycles still ahead of you.', points: [], art: 'year' },
  { id: 'legacy', name: 'Legacy', wing: 'Hall of Long Cycles', intro: 'Saturn, Jupiter and Pluto: what you build over decades.', points: ['saturn', 'jupiter', 'pluto'], art: 'book' },
];
export const galleryById = (id: string | undefined) => GALLERIES.find(g => g.id === id);

const ELEMENT: Record<string, Element> = { Fire: 'fire', Earth: 'earth', Air: 'air', Water: 'water' };
const SIGN_GLYPHS: Record<string, string> = { Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓' };
const SLOW = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

function bodyExhibit(b: BodyPos, timed: boolean): Exhibit {
  return {
    id: b.key, title: `${b.name} in ${b.sign}`, glyph: b.glyph, sign: b.sign, element: ELEMENT[SIGN_EXPRESSIONS[b.sign].element],
    plaque: placementLine(b, timed),
    facts: [`${b.deg}°${String(b.min).padStart(2, '0')}′ ${b.sign}`, ...(timed && b.house ? [`${ordinal(b.house)} house`] : []), ...(b.retro ? ['Retrograde at birth'] : [])],
  };
}

function cuspExhibit(c: ChartResult, h: number): Exhibit | null {
  if (!c.cusps) return null;
  const lon = c.cusps[h - 1]; const sign = signOfLon(lon); const s = SIGN_EXPRESSIONS[sign];
  const label = h === 4 ? 'The IC · base of the chart' : h === 7 ? 'The Descendant' : h === 10 ? 'The Midheaven' : `${ordinal(h)} house cusp`;
  const ruler = c.bodies.find(b => b.key === TRADITIONAL_RULER[sign]);
  return {
    id: `cusp-${h}`, title: `${label} in ${sign}`, glyph: SIGN_GLYPHS[sign], sign, element: ELEMENT[s.element],
    plaque: `${sign} on the ${ordinal(h)} house: the arena of ${HOUSE_ARENAS[h].arena} (${HOUSE_ARENAS[h].themes}) is met in a ${sign} way — ${s.core}.${ruler ? ` Its ruler, ${ruler.name}, sits in ${ruler.sign}${ruler.house ? ` in the ${ordinal(ruler.house)} house` : ''}.` : ''}`,
    facts: [`${Math.floor(lon % 30)}° ${sign}`, `${ordinal(h)} house cusp`, ...(ruler ? [`Ruler ${ruler.name}`] : [])],
  };
}

const toMilestone = (e: CycleEvent, now: Date): Milestone => ({ key: e.key, title: e.title, date: e.date, age: e.age, meaning: e.meaning, past: e.date.getTime() < now.getTime() });

/** One gallery, built from the chart. `now` is injectable so the Future and Legacy halls are testable. */
export function buildGallery(c: ChartResult, id: GalleryId, now = new Date()): Gallery {
  const spec = galleryById(id)!;
  const timed = isTimed(c);
  const exhibits: Exhibit[] = [];
  spec.points.forEach(k => { const b = c.bodies.find(x => x.key === k); if (b) exhibits.push(bodyExhibit(b, timed)); });
  if (spec.house && timed) { const e = cuspExhibit(c, spec.house); if (e) exhibits.push(e); c.bodies.filter(b => b.house === spec.house && !spec.points.includes(b.key) && !['southNode', 'lilith', 'fortune', 'vertex'].includes(b.key)).forEach(b => exhibits.push(bodyExhibit(b, timed))); }
  let milestones: Milestone[] = [];
  let coming: TransitEvent[] = [];
  if (id === 'legacy') milestones = lifeCycles(c).filter(e => ['Saturn', 'Jupiter', 'Pluto'].includes(e.planet)).map(e => toMilestone(e, now));
  if (id === 'future') {
    milestones = lifeCycles(c).map(e => toMilestone(e, now)).filter(m => !m.past).slice(0, 4);
    coming = upcomingEvents(c, now, 365).filter(e => e.kind === 'exact' && e.planet && SLOW.includes(e.planet)).slice(0, 8);
  }
  const notes: Record<GalleryId, string> = {
    roots: 'These plates describe the symbolism of home and belonging in your chart. They are not a record of your childhood or your family.',
    relationships: 'Read as tendencies and needs, not a description of any particular person.',
    purpose: 'Direction, not destiny: the chart describes what tends to feel meaningful, and you decide what to do with it.',
    future: 'Dates are calculated from the real sky. They mark contacts to your chart, not events that will happen.',
    legacy: 'Long cycles return on calculated dates. What each one meant is yours to record.',
  };
  return {
    id, name: spec.name, wing: spec.wing, curatorNote: spec.intro, note: notes[id] + (!timed && spec.house ? ' Add a birth time to open the house plate in this gallery.' : ''),
    exhibits, milestones, coming,
  };
}
