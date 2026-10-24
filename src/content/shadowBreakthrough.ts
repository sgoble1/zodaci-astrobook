/**
 * Shadow and Breakthrough library (Unified Master Specification §7). For each major placement or configuration:
 * the energy under pressure (shadow), the integrated form (breakthrough) and one small practice between them.
 * A shadow is never shown without its breakthrough (§7.4).
 */
export type SBPair = { shadow: string; breakthrough: string; practice: string };

/** §7.1 planet and point pairs, keyed by chart body key. */
export const PLACEMENT_PAIRS: Record<string, SBPair & { label: string }> = {
  sun: { label: 'Sun', shadow: 'Living to be seen; identity tied to approval', breakthrough: 'Self-authored purpose that needs no audience', practice: 'Do one thing this week only because it is yours' },
  moon: { label: 'Moon', shadow: 'Mood as the whole truth; old comfort habits', breakthrough: 'Naming a feeling without being ruled by it', practice: 'Write down the need beneath each strong mood' },
  mercury: { label: 'Mercury', shadow: 'Rehearsed arguments, saying less than you think', breakthrough: 'Plain, timely speech and curious listening', practice: 'Say the true sentence, then stop' },
  venus: { label: 'Venus', shadow: 'Buying peace with self-erasure', breakthrough: 'Receiving as freely as giving', practice: 'Ask for one thing you usually hold back' },
  mars: { label: 'Mars', shadow: 'Anger turned inward or outward as attack', breakthrough: 'Directed effort and honest boundaries', practice: 'Take one decisive action before overthinking' },
  jupiter: { label: 'Jupiter', shadow: 'Excess, grandiosity, avoiding limits', breakthrough: 'Faith backed by commitment', practice: 'Finish one expansion before starting another' },
  saturn: { label: 'Saturn', shadow: 'Fear of failure, rigid self-judgment', breakthrough: 'Earned mastery and calm authority', practice: 'Keep one small promise daily' },
  uranus: { label: 'Uranus', shadow: 'Rebellion for its own sake, sudden exits', breakthrough: 'Freedom with responsibility', practice: 'Change one routine on purpose, not in reaction' },
  neptune: { label: 'Neptune', shadow: 'Fog, idealisation, escape', breakthrough: 'Compassion with clear boundaries', practice: 'Check one assumption against a fact' },
  pluto: { label: 'Pluto', shadow: 'Control, all-or-nothing power', breakthrough: 'Deliberate transformation and shared power', practice: 'Let go of one thing you are gripping' },
  chiron: { label: 'Chiron', shadow: 'The wound defines the self', breakthrough: 'The wound becomes the teacher', practice: 'Offer to others what you needed once' },
  northNode: { label: 'North Node', shadow: 'Staying in the comfortable past', breakthrough: 'Growing toward the unfamiliar purpose', practice: 'Choose the new option three times this month' },
  southNode: { label: 'South Node', shadow: 'Over-reliance on old skills', breakthrough: 'Using old gifts in service of growth', practice: 'Name what you already know and teach it' },
  asc: { label: 'Ascendant', shadow: 'Mask worn too long', breakthrough: 'Showing up as you actually are', practice: 'Enter one room unperformed' },
};

/** §7.2 retrograde tiers (RetroGOOD score bands). */
export const RETRO_TIER_PAIRS: Record<'Amplified' | 'Internalized' | 'Refined' | 'Karmic', { range: string; shadow: string; breakthrough: string }> = {
  Amplified: { range: '80–100', shadow: 'Intensity with no outlet; the planet dominates the story', breakthrough: "The planet's strength used consciously and shared" },
  Internalized: { range: '60–79', shadow: 'Private processing that never reaches other people', breakthrough: 'A rich inner life translated into speech or work' },
  Refined: { range: '40–59', shadow: "Doubt that the planet's gift is real", breakthrough: 'Quiet competence recognised over time' },
  Karmic: { range: '0–39', shadow: 'Repeating a lesson without noticing the pattern', breakthrough: 'Awareness that turns the pattern into a choice' },
};

/** §7.3 configuration pairs, keyed by pattern code. Practices follow §7.1 for the configuration's lead body. */
export const CONFIG_PAIRS: Partial<Record<string, SBPair & { label: string }>> = {
  ANARETIC_ASC: { label: 'Anaretic Ascendant', shadow: 'A lifetime of experience compressed into the first impression; feeling already finished', breakthrough: 'Transmitting what you know instead of seeking it', practice: 'Teach one thing you learned the hard way' },
  ANARETIC_PERSONAL_PLANET: { label: 'Anaretic personal planet', shadow: "Urgency and completion pressure around that planet's themes", breakthrough: 'Finishing a chapter and trusting the next', practice: 'Close one open loop before you open a new one' },
  OUTER_PLANET_H1_STELLIUM: { label: 'Outer planet stellium in the 1st house', shadow: 'Generational forces felt as personal burden', breakthrough: 'Embodying the shift of an era with self-possession', practice: 'Name one change you carry for others, then set it down for a day' },
  FULL_MOON_BIRTH: { label: 'Full Moon birth', shadow: 'Living between two poles, never settling', breakthrough: 'Awareness of both sides and the integration of them', practice: 'When torn, write both sides down before you choose' },
  FULL_MOON_PHASE: { label: 'Full Moon phase birth', shadow: 'Living between two poles, never settling', breakthrough: 'Awareness of both sides and the integration of them', practice: 'When torn, write both sides down before you choose' },
  BUCKET_CHART: { label: 'Chart handle (Bucket)', shadow: "Everything routed through one planet's agenda", breakthrough: 'One clear channel for a well-gathered chart', practice: 'Notice which single drive you lead with this week' },
  RETROGRADE_HANDLE: { label: 'Chart handle (Bucket)', shadow: "Everything routed through one planet's agenda", breakthrough: 'One clear channel for a well-gathered chart', practice: 'Notice which single drive you lead with this week' },
  DIRECT_HANDLE: { label: 'Chart handle (Bucket)', shadow: "Everything routed through one planet's agenda", breakthrough: 'One clear channel for a well-gathered chart', practice: 'Notice which single drive you lead with this week' },
  DOMICILE_PLUTO_10: { label: 'Domicile Pluto in the 10th house', shadow: 'Power that expects to be recognised', breakthrough: 'Legacy built through transformation of others', practice: 'Let go of one thing you are gripping' },
};

/** How the letter names each configuration in a sentence. */
const CONFIG_PHRASE: Record<string, string> = {
  ANARETIC_ASC: 'your Ascendant at the last degree of its sign', ANARETIC_PERSONAL_PLANET: 'the personal planet you carry at 29°',
  OUTER_PLANET_H1_STELLIUM: 'the outer planets gathered in your 1st house', FULL_MOON_BIRTH: 'your Full Moon birth', FULL_MOON_PHASE: 'your birth in the Full Moon phase',
  BUCKET_CHART: 'the handle of your Bucket chart', RETROGRADE_HANDLE: 'the handle of your Bucket chart', DIRECT_HANDLE: 'the handle of your Bucket chart', DOMICILE_PLUTO_10: 'Pluto at home in your 10th house',
};

const BODY_KEY: Record<string, string> = { Sun: 'sun', Moon: 'moon', Mercury: 'mercury', Venus: 'venus', Mars: 'mars', Jupiter: 'jupiter', Saturn: 'saturn', Uranus: 'uranus', Neptune: 'neptune', Pluto: 'pluto', Chiron: 'chiron', 'North Node': 'northNode', 'South Node': 'southNode', Ascendant: 'asc' };

export type SBTone = 'oracle' | 'educational' | 'professional';
export type SBItem = { id: string; title: string; source: string; phrase: string; shadow: string; breakthrough: string; practice: string | null; definition: string | null; score: number };
type Ranked = { pattern_id: string; label: string; affected_planets: string[]; score: number };

const DEFINE: Record<string, string> = {
  ANARETIC_ASC: 'An anaretic degree is the 29th, the last degree of a sign.', ANARETIC_PERSONAL_PLANET: 'An anaretic degree is the 29th, the last degree of a sign.',
  FULL_MOON_BIRTH: 'A Full Moon birth happens when the Moon stands opposite the Sun.', FULL_MOON_PHASE: 'The Full Moon phase runs from the Full Moon until the Moon is 45° past opposition.',
  OUTER_PLANET_H1_STELLIUM: 'A stellium is three or more planets gathered in one sign or house.', STELLIUM: 'A stellium is three or more planets gathered in one sign or house.', HOUSE_STELLIUM: 'A stellium is three or more planets gathered in one sign or house.',
  BUCKET_CHART: 'A Bucket chart has nine planets in one half of the sky and a single "handle" planet in the other.', RETROGRADE_HANDLE: 'A Bucket chart has nine planets in one half of the sky and a single "handle" planet in the other.', DIRECT_HANDLE: 'A Bucket chart has nine planets in one half of the sky and a single "handle" planet in the other.',
  T_SQUARE: 'A T-square is two planets in opposition, both square a third.', GRAND_TRINE: 'A Grand Trine is three planets about 120° apart.', YOD: 'A Yod is two planets in sextile, both 150° from a third.',
  GRAND_CROSS: 'A Grand Cross is four planets linked by two oppositions and four squares.', KITE: 'A Kite is a Grand Trine with a fourth planet opposite one corner.', MYSTIC_RECTANGLE: 'A Mystic Rectangle is two oppositions joined by sextiles and trines.',
  DOMICILE_PLUTO_10: 'A planet in domicile is in the sign it rules.',
};

/** Third person for the Professional tone (§7.4): "you" becomes "the native". */
const thirdPerson = (t: string) => t.replace(/\byour\b/gi, 'the native’s').replace(/\byou\b/gi, 'the native');

/**
 * The ShadowBreakthrough block: the top five significant patterns (not every placement), each paired with
 * its shadow and breakthrough. Educational adds a one-line definition; Professional uses third person and drops the practice.
 */
export function shadowBreakthroughBlock(ranked: Ranked[], tone: SBTone = 'oracle', limit = 5): SBItem[] {
  const out: SBItem[] = [];
  const seen = new Set<string>();
  for (const r of ranked) {
    if (out.length >= limit) break;
    const config = CONFIG_PAIRS[r.pattern_id];
    const lead = r.affected_planets.map(n => BODY_KEY[n]).find(k => k && PLACEMENT_PAIRS[k]);
    const pair = config ?? (lead ? PLACEMENT_PAIRS[lead] : undefined);
    if (!pair) continue;
    const dedupe = config ? `c:${config.label}` : `p:${lead}`;
    if (seen.has(dedupe)) continue;
    seen.add(dedupe);
    const source = config ? config.label : `${PLACEMENT_PAIRS[lead!].label}, leading ${r.label}`;
    const phrase = config ? CONFIG_PHRASE[r.pattern_id] ?? `your ${config.label.toLowerCase()}` : `your ${PLACEMENT_PAIRS[lead!].label}, which leads the ${r.label.replace(/^(Born|The) /, '').toLowerCase().replace(/\b(sun|moon|mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto|aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces|ascendant)\b/g, w => w[0].toUpperCase() + w.slice(1))} in your chart`;
    const fix = (t: string) => (tone === 'professional' ? thirdPerson(t) : t);
    out.push({ id: `${r.pattern_id}-${r.affected_planets.join('')}`, title: r.label, source, phrase, shadow: fix(pair.shadow), breakthrough: fix(pair.breakthrough), practice: tone === 'professional' ? null : pair.practice, definition: tone === 'educational' ? DEFINE[r.pattern_id] ?? null : null, score: r.score });
  }
  return out;
}

/** Practices seed the affirmations carousel (§7.4, MOD-006): "I …" statements built from each practice. */
export function practiceAffirmations(items: SBItem[]): string[] {
  return items.filter(i => i.practice).map(i => `I am ready for this: ${i.practice!.charAt(0).toLowerCase()}${i.practice!.slice(1)}.`);
}
