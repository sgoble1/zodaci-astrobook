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
export const KUA_DIRECTIONS: KuaDirection[] = [
  { dir: 'SE', name: 'Sheng Chi', meaning: 'Wealth & Prosperity', auspicious: true, activation: 'Best direction for main desk, sleeping head, primary workspace — greatest activation for material abundance' },
  { dir: 'E', name: 'Tien Yi', meaning: 'Health', auspicious: true, activation: 'Best direction for bedroom placement; sleeping with head toward East activates physical vitality and immune support' },
  { dir: 'S', name: 'Nien Yen', meaning: 'Romance & Relationships', auspicious: true, activation: 'Activate for partnership energy; excellent for Jupiter Leo H7 chart ruler work — the romance direction' },
  { dir: 'N', name: 'Fu Wei', meaning: 'Personal Growth', auspicious: true, activation: 'Best for meditation, journaling, and personal development work; activates internal wisdom and self-understanding' },
  { dir: 'SW', name: 'Jue Ming', meaning: 'Total Loss — AVOID', auspicious: false, activation: 'Most inauspicious direction; avoid placing bedroom, main workspace, or primary activities in SW quadrant' },
  { dir: 'NE', name: 'Ho Hai', meaning: 'Obstacles', auspicious: false, activation: 'Avoid for important activities; suppress with metal element if the main door faces NE',
    standardNote: 'Standard Eight Mansions tables place Wu Gui (Five Ghosts) in the NE for Kua 1 and Ho Hai in the W. The site’s older Bagua page lists NE as Liu Sha. Flagged as a source discrepancy.' },
  { dir: 'W', name: 'Wu Kwei', meaning: 'Five Ghosts', auspicious: false, activation: 'Suppress; avoid placing important rooms in W quadrant if possible',
    standardNote: 'Standard tables place Ho Hai (Mishaps) in the W for Kua 1. The direction is inauspicious under both readings, so the practical advice doesn’t change.' },
  { dir: 'NW', name: 'Liu Sha', meaning: 'Six Killings', auspicious: false, activation: 'Suppress; avoid main door, bedroom, or workspace in NW quadrant',
    standardNote: 'Matches standard tables. The site’s older Bagua page listed NW as Jue Ming, which contradicts this PDF.' },
];

export const KUA_FOUNDATION = {
  text: "April's Kua Number is 1, placing her in the East Group of Feng Shui — the group whose auspicious directions align with the East quadrant of the compass. Kua 1 (Water) is the numerological foundation of her Feng Shui practice, describing the directions that activate her luck, health, relationships, and professional success, and the directions that suppress or drain them. The East Group includes Kua 1, 3, 4, and 9.",
  source: fsSrc('18A · Kua Number 1 (Water) — Foundations', 114),
};

export const ELEMENT_PROFILE = {
  paragraphs: [
    "April's elemental profile across multiple systems: Kua 1 Water (primary Feng Shui element) + Metal Horse birth year (Metal element) + Sagittarius ASC (Fire element) + Capricorn H1 stellium (Earth element) + Aries Moon (Fire element) + Virgo Sun (Earth element) = Water-Metal-Fire-Earth dominant with very little Wood element present in the overall system. In the Five Element cycle, Wood is the bridge between Water (which feeds Wood) and Fire (which Wood feeds): Water → Wood → Fire → Earth → Metal → Water. Without Wood, the circuit has a gap: the Water and Metal elements cannot easily feed into the Fire without the bridge Wood provides.",
    "Adding Wood to April's home and personal element palette completes the elemental circuit and allows the full Five Element cycle to turn smoothly. Wood is also the element most directly associated with growth, expansion, new beginnings, and upward energy — precisely what the Personal Year 7's emphasis on growth through inner cultivation and the Jupiter Return are calling for in 2026. Wood in Feng Shui is activated through: living plants (especially tall, upright plants with smooth leaves), wooden objects and furniture, columnar shapes, the colors green and teal, and the East direction (Wood's home direction). The fact that East is also April's health direction (Tien Yi for Kua 1) creates a double activation: adding Wood in the East sector simultaneously completes the elemental circuit and activates her most auspicious health direction.",
  ],
  cycle: ['Water', 'Wood', 'Fire', 'Earth', 'Metal'],
  present: { Water: 'Kua 1', Metal: 'Metal Horse year', Fire: 'Sag ASC · Aries Moon', Earth: 'Capricorn H1 stellium · Virgo Sun', Wood: 'Missing: the bridge to add' } as Record<string, string>,
  source: fsSrc('18B · Elemental Profile — What She Needs to Balance', 116),
};

export interface Room { id: string; name: string; dirs: Dir[]; text: string; source: SourceRef; }
export const ROOMS: Room[] = [
  { id: 'room-bedroom', name: 'Bedroom', dirs: ['SE', 'E'], source: fsSrc('18C · Room-by-Room — Bedroom', 117),
    text: "The bedroom is the most important Feng Shui space in any home, and for April it should be located in the SE or E sector of the residence if at all possible. The elemental quality of the bedroom should be Water dominant — blues, black, deep navy, and dark green in textiles, art, and soft furnishings create the Water element environment that resonates with Kua 1 and activates the Sheng Chi (wealth and prosperity) of the SE direction. All sharp corners — including furniture corners — should be positioned so they do not point directly at the bed, as sharp architectural energy disrupts sleep and the restoration that sleep provides. A pair of objects on the nightstand or dresser (two candles, two crystals, or two small plants in matching containers) activates the partnership energy of Jupiter Leo H7 and the Chiron-Part of Fortune Cancer H7 healing intention. Rose Quartz placed on the nightstand specifically activates the belonging healing of Chiron Cancer H7 — the most important crystal placement for her current healing work." },
  { id: 'room-living', name: 'Living Room / Social Space', dirs: ['S', 'E'], source: fsSrc('18C · Room-by-Room — Living Room', 117),
    text: "The living room is where Jupiter Leo H7 should be activated — this is the space of partnership, warmth, expansiveness, and the generous social energy that is the chart ruler's domain. Leo colors (warm gold, amber, deep orange, rich cream) in soft furnishings, art, or decorative objects activate the Jupiter Leo energy. A large mirror placed on the South or East wall expands the space and activates the Fire and Wood elements simultaneously. Living plants — particularly the larger, upright, woody varieties like fiddle-leaf figs or snake plants — add the Wood element circuit completion in the space where social energy is highest. Candles or a working fireplace, used intentionally, activate the Fire element of both the Sagittarius ASC and the Aries Moon, creating the warmth and expansiveness that the chart's Fire elements require in the social domain." },
  { id: 'room-office', name: 'Home Office / Study', dirs: ['SE', 'N'], source: fsSrc('18C · Room-by-Room — Home Office', 118),
    text: "The desk should face the Southeast direction — the Sheng Chi direction for Kua 1, activating maximum wealth and professional success. Mercury Rx Virgo H8 requires a precisely organized workspace: clutter in the study space creates cognitive disruption that is more significant for this placement than for most, because the retrograde Mercury needs a clear external environment in which its internal processing can run cleanly. Dark blue or black accents in the home office activate the Water element for depth thinking and the Kua 1 elemental resonance. Amethyst on the desk activates the Neptune H1 spiritual intelligence and creative depth. The study door should face North if possible to activate the Fu Wei personal growth direction." },
  { id: 'room-wet', name: 'Bathroom and Kitchen', dirs: ['SW', 'NE', 'W', 'NW'], source: fsSrc('18C · Room-by-Room — Bathroom & Kitchen', 118),
    text: "These water-heavy rooms should be located in neutral or inauspicious sectors of the residence if possible — specifically avoiding the SW sector entirely. If the kitchen or bathroom occupies an auspicious sector, use Metal element cures (metal objects, white or silver accents, round shapes) to suppress the negative energy drain that water-heavy rooms can create in good-luck sectors." },
  { id: 'room-entrance', name: 'Entrance / Foyer', dirs: ['C'], source: fsSrc('18C · Room-by-Room — Entrance', 118),
    text: "The entrance of the home must feel expansive, unobstructed, and philosophically generous — matching the Sagittarius ASC's fundamental requirement of space and open horizon. Remove any objects that block the flow of chi at the front entrance: dense furniture arrangements, large piles of shoes, overstuffed coat closets, or dark narrow corridor treatment. A clear, well-lit entrance with clean sightlines activates the first house energy and supports the anaretic Sagittarius ASC's need for the home to breathe. A single living plant near the entrance activates Wood element at the threshold — inviting growth and new possibility into the home with every entry." },
];

export interface Crystal { id: string; name: string; basis: string; purpose: string; placement: string; dirs: Dir[]; source: SourceRef; }
const cs = (p: number) => fsSrc('18D · Crystal Master Guide', p);
export const CRYSTALS: Crystal[] = [
  { id: 'cr-rose', name: 'Rose Quartz', basis: 'Chiron Cancer H7 + Venus Leo H8', purpose: 'Belonging wound healing, unconditional love activation, self-worth restoration', placement: 'Nightstand; pair of pieces for partnership energy', dirs: ['SE', 'E'], source: cs(119) },
  { id: 'cr-lapis', name: 'Lapis Lazuli', basis: 'Mercury Rx Virgo H8 (truth and depth)', purpose: 'Clarity of deep truth, enhanced analytical precision, honest communication', placement: 'Desk or study; near writing space', dirs: ['SE'], source: cs(119) },
  { id: 'cr-obsidian', name: 'Black Obsidian', basis: 'Saturn Rx H1 (grounding and protection)', purpose: 'Grounding of the H1 Saturn architecture; psychic protection for Neptune H1', placement: 'Entrance of home; near front door', dirs: ['C'], source: cs(119) },
  { id: 'cr-citrine', name: 'Citrine', basis: 'Jupiter Leo H7 (chart ruler activation)', purpose: 'Abundance activation, chart ruler energization, partnership expansion', placement: 'SE sector of home or living room — Sheng Chi direction', dirs: ['SE'], source: cs(119) },
  { id: 'cr-moonstone', name: 'Moonstone', basis: 'Waning gibbous Moon in Aries H3; source-described Bucket handle', purpose: 'Lunar attunement, reflection and emotional flow', placement: 'Writing space or near the journaling area; supports communication rituals', dirs: ['N'], source: cs(119) },
  { id: 'cr-labradorite', name: 'Labradorite', basis: 'Neptune Rx H1 (psychic protection and intuition)', purpose: 'Psychic shielding, intuition activation, protection of the permeable Neptune H1 field', placement: 'On the body as jewelry or near the front entrance', dirs: ['C'], source: cs(119) },
  { id: 'cr-smoky', name: 'Smoky Quartz', basis: 'Sun H8 + parental losses (grief support)', purpose: 'Grief processing, transformation support, grounding during H8 depth work', placement: 'Bedroom or quiet personal space; near photographs of parents if honoring them', dirs: ['E', 'SE'], source: cs(119) },
  { id: 'cr-amethyst', name: 'Amethyst', basis: 'Neptune H1 (spiritual depth)', purpose: 'Spiritual intelligence, dream enhancement, psychic clarity', placement: 'Study desk; under pillow for enhanced dream access', dirs: ['SE'], source: cs(120) },
  { id: 'cr-clear', name: 'Clear Quartz', basis: 'North Node Aquarius H1 (soul direction)', purpose: 'Amplification of soul compass direction, clarity of life purpose', placement: 'North sector of home; near the personal development area', dirs: ['N'], source: cs(120) },
  { id: 'cr-carnelian', name: 'Carnelian', basis: 'Aries Moon H3 + Mars Gemini H5', purpose: 'Bucket handle activation, creative courage, communication boldness', placement: 'Writing space or desk; carry in pocket on days when communication is challenging', dirs: ['SE', 'N'], source: cs(120) },
];

export interface Week { weeks: string; focus: string; actions: string; source: SourceRef; }
const ws = (p: number) => fsSrc('18E · 12-Week Implementation Timeline', p);
export const TWELVE_WEEKS: Week[] = [
  { weeks: 'Weeks 1–2', focus: 'Foundation: Declutter', source: ws(120), actions: 'Declutter the entire home with particular focus on the entrance and bedroom. Remove anything that does not belong to the person she is becoming. This is Pluto H10 work at the home level: clearing space for the new form that is already emerging.' },
  { weeks: 'Weeks 3–4', focus: 'Bedroom Activation', source: ws(121), actions: 'Activate bedroom with Water element colors (deep blue, navy, dark green), rose quartz placement (paired, on nightstand), and optimal compass positioning of the bed. Remove sharp corners or angle furniture away from the sleeping position.' },
  { weeks: 'Weeks 5–6', focus: 'Study / Office Setup', source: ws(121), actions: 'Orient desk to face SE. Clear and organize the workspace completely — the Mercury Rx Virgo H8 requirement is a clear external environment. Place lapis lazuli and amethyst on the desk. Ensure the writing/journaling space is distinct from the screen-based work space if possible.' },
  { weeks: 'Weeks 7–8', focus: 'Wood Element Integration', source: ws(121), actions: 'Add living plants throughout the home, particularly in the East sector (health direction and Wood direction simultaneously). Wooden objects, columnar shapes, and green accents in strategic locations to complete the elemental circuit.' },
  { weeks: 'Weeks 9–10', focus: 'Living Room — Jupiter Leo Activation', source: ws(121), actions: 'Introduce Leo colors (warm gold, amber, rich cream) in the living room. Large mirror on South or East wall. Candles for Fire element activation. Citrine in the SE sector. Create the space that Jupiter Leo H7 chart ruler wants to inhabit.' },
  { weeks: 'Weeks 11–12', focus: 'Crystal Grid and Blessing Ceremony', source: ws(122), actions: 'Place all crystals in their designated locations. Create a personal home blessing ceremony — a ritual honoring the new phase of the home and the new phase of the life. Include a candle for the parents, a written intention for the coming year, and a moment of gratitude for everything that has been built thus far. Saturn H1 honors ritual; Neptune H1 experiences the sacred through it. This ceremony is both practical and sacred. Do it with full intention.' },
];

// ---------------- Flying Stars (Xuan Kong) ----------------
// Not covered by the source PDFs — computed in-app from the classical method and labelled as such.
export interface StarInfo { n: number; name: string; element: string; color: string; nature: 'Auspicious' | 'Mixed' | 'Inauspicious'; theme: string; remedy: string; }
export const STAR_INFO: Record<number, StarInfo> = {
  1: { n: 1, name: 'White Star (Tan Lang)', element: 'Water', color: 'White', nature: 'Auspicious', theme: 'Career, new opportunities, wisdom, romance. April’s own Kua element — extra resonant.', remedy: 'Activate with a water feature or blue/black accents; keep active and clear.' },
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
