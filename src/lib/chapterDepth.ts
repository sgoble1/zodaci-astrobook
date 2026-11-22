import type { ChartResult } from './astro';
import type { Tone } from './perception';
import { degreeLabel } from './bookLeaves';
import { sourceRegister, moonNote } from './previewNarrative';
import { SIGN_RULER } from './signRulers';
import { PLANET_VOICES, SIGN_VOICES, HOUSE_VOICES, aspectFallback, type EditorialPlanet } from '@/content/placements/blocks';
import { SIGN_EXPRESSIONS } from '@/content/interpretationLibrary';

const count = (text: string) => text.split(/\s+/).filter(Boolean).length;
const functions = Object.keys(PLANET_VOICES) as EditorialPlanet[];

/** Expand a planetary chapter through distinct measured lenses, not repeated keywords. */
export function planetaryDepth(chart: ChartResult, key: EditorialPlanet, tone: Tone): string[] {
  const planet = chart.bodies.find(b => b.key === key);
  if (!planet) return [];
  const timed = Boolean(chart.input.time) && chart.asc != null;
  const voice = PLANET_VOICES[key];
  const sign = SIGN_EXPRESSIONS[planet.sign];
  const ruler = chart.bodies.find(b => b.key === SIGN_RULER[planet.sign]?.traditional);
  const parts: string[] = [];
  if (!timed && key === 'moon') return [moonNote(tone),
    'An unknown hour changes how this chapter must be read. The Moon moves far enough during a day to alter a close contact and sometimes its sign. This page therefore does not give a house, a settled emotional description, or an exact lunar relationship. The reference is a starting point for understanding the method. A birth certificate or another reliable record can narrow the uncertainty; a familiar-sounding interpretation cannot establish the missing time.',
    ...functions.filter(k => k !== 'moon').slice(0, 5).map(k => {
      const b = chart.bodies.find(p => p.key === k);
      const p = PLANET_VOICES[k];
      return b ? `Compare replenishment with ${p.subject}, represented separately by ${b.name} at ${degreeLabel(b.lon)}. ${p.question} That question can help you describe an actual choice without deciding where the Moon was. For example, a person may want rest and still care about making progress; neither need proves a lunar placement. Write down the difference in your own words. Your account of what helps you recover is usable personal context, even while the astronomical hour remains unknown. Keep those two kinds of information separate.` : '';
    })].filter(Boolean).map(p => sourceRegister(p, tone));

  if (sign) parts.push(`Start with the pace of this placement. ${planet.name} is at ${degreeLabel(planet.lon)}, in a ${sign.element} sign with a ${sign.mode} mode. The element is an interpretive category; the mode describes beginning, maintaining or adapting. Neither is a rating. Here the sign ${SIGN_VOICES[planet.sign as keyof typeof SIGN_VOICES]}. Through ${voice.subject}, that can make ${sign.gift} a useful possibility to explore. The same style can become less helpful when it is applied to every situation. Instead of asking whether you match a sign description, ask where this manner serves the particular decision in front of you. ${voice.question} A different answer tomorrow would not make the chart wrong or you inconsistent; circumstances and choices are not fixed by a birth position.`);

  if (ruler) {
    const rulerVoice = PLANET_VOICES[ruler.key as EditorialPlanet];
    parts.push(`Follow the sign to its traditional ruler. ${planet.sign} is ruled by ${ruler.name}, which this chart places at ${degreeLabel(ruler.lon)}${timed && ruler.house ? `, in the area of ${HOUSE_VOICES[ruler.house]}` : ''}. Rulership means that an astrologer reads the first placement with this second placement in mind. ${ruler.name === planet.name ? 'Here the planet rules its own sign; the chain comes back to the same function rather than introducing a second planetary voice.' : `The connection brings ${voice.subject} into conversation with ${rulerVoice?.subject ?? ruler.name}.`} This is why the same ${planet.name} sign can read differently in another chart. Notice the ruler’s manner: ${SIGN_VOICES[ruler.sign as keyof typeof SIGN_VOICES]}. A practical reading asks how that second approach could help the first one, or complicate it, rather than treating either placement as an instruction. It does not establish what happened in your home, work or relationships.`);
  }

  const contacts = chart.aspects.filter(a => (a.a === planet.name || a.b === planet.name) && (timed || (a.a !== 'Moon' && a.b !== 'Moon')))
    .filter(a => chart.bodies.some(b => b.name === a.a && functions.includes(b.key as EditorialPlanet)) && chart.bodies.some(b => b.name === a.b && functions.includes(b.key as EditorialPlanet)))
    .sort((a, b) => a.orb - b.orb).slice(0, 5);
  for (const [index, contact] of contacts.entries()) {
    const other = chart.bodies.find(b => b.name === (contact.a === planet.name ? contact.b : contact.a));
    if (!other) continue;
    const otherVoice = PLANET_VOICES[other.key as EditorialPlanet];
    if (!otherVoice) continue;
    parts.push(`A ${index ? 'further' : 'close'} connection adds another need: ${planet.name} ${contact.type.toLowerCase()} ${other.name}, with an orb of ${contact.orb.toFixed(2)}°. The orb is the distance from an exact angle, not a measure of how difficult your life must be. ${planet.name} concerns ${voice.subject}; ${other.name} concerns ${otherVoice.subject}. This ${contact.type.toLowerCase()} ${aspectFallback(contact.type)}. The other planet is in ${other.sign}, where its symbolism ${SIGN_VOICES[other.sign as keyof typeof SIGN_VOICES]}${timed && other.house ? `, with an emphasis on ${HOUSE_VOICES[other.house]}` : ''}. Read the two requests separately before trying to combine them. ${otherVoice.question} There may be a workable way to give both functions space. The measured angle makes the question specific; it does not prove that you have felt it, or tell us which person or event supplied the circumstances.`);
  }
  if (timed && planet.house) parts.push(`Bring the interpretation into a practical setting. The recorded time places ${planet.name} in house ${planet.house}, an area associated with ${HOUSE_VOICES[planet.house]}. A house is a division of the calculated local sky, not a description of a person who must appear in your life. Here you can explore ${voice.subject} in that setting. Think of a real, ordinary decision if you have one: what did you want, what constraints were present, and what did you actually choose? Keep the event in your own words before comparing it with this symbolism. ${voice.practice.charAt(0).toUpperCase() + voice.practice.slice(1)}. If the interpretation does not fit, leave it aside. It is more useful to preserve a clear distinction between the chart’s measured placement and your experience than to rewrite your experience to make a paragraph sound right.`);
  parts.push(`${planet.retro ? `${planet.name} was in apparent retrograde motion at this birth moment. Seen from Earth, its longitude was moving backward against the zodiac; the planet was not physically reversing its orbit.` : `${planet.name} was in direct apparent motion at this birth moment. Direct means that its longitude was advancing through the zodiac; it does not promise that this part of life will be effortless.`} Motion is another layer to read alongside sign and measured contacts. ${planet.retro ? `Within the tradition, reconsideration or private rehearsal can be a useful lens for ${voice.subject}.` : `For ${voice.subject}, outward engagement is one possible lens, but the other placements still matter.`} Try a small, observable practice: ${voice.practice}. Record what you intended, what you tried, and what changed. That note belongs to your life; it is not a predicted consequence of planetary motion. You can return to it later without turning a tentative interpretation into a fixed identity.`);
  return parts.map(p => sourceRegister(p, tone));
}

/** Volume chapters deepen through their relevant placements; traditions also explain their distinct rules. */
export function chapterDepth(chart: ChartResult, volume: string, title: string, tone: Tone, existing: string[]): string[] {
  const additions: string[] = [];
  if (volume === 'V') additions.push(
    'Start with the coordinate system. A tropical zodiac measures the Sun’s seasonal cycle from the March equinox. A sidereal zodiac uses a stellar reference and subtracts an offset called the ayanamsa. Changing the reference changes the sign labels; it does not move a planet to another place in the actual sky. The sidereal snapshot in this book labels its Lahiri offset as an approximation. Read a tropical and a sidereal placement within their own interpretive traditions. If their language differs, the useful question is which method supplied each statement, rather than which label sounds more like you.',
    'Chinese calendar symbolism begins from a different structure. Its stems and branches organise time into repeating combinations. The year pillar here is calculated using the beginning-of-spring boundary called Lichun, rather than simply assigning an animal from the printed calendar year. A year pillar is shared by many people; by itself it cannot describe a whole person. A full Four Pillars reading also needs the month, day and, when known, hour, with explicit calendar and timezone conventions. This chapter keeps the available calculation separate from a complete Four Pillars interpretation. It does not invent a missing hour or claim that a year animal explains your personal history.',
    'Numerology uses arithmetic on a date rather than measuring a celestial longitude. This book records the date-reduction convention behind its Life Path label, including the treatment of master numbers. Another convention can produce another label from the same written date. A number’s traditional meaning is a prompt for reflection; the arithmetic does not measure character or predict achievement. Compare what the number asks you to notice with a concrete example you choose to supply. Preserve the example as your own evidence and the number as the output of a named calculation. Agreement with another symbolic system is an interesting correspondence, not independent proof of a psychological claim.',
    'Keep disagreements visible. Two systems may describe initiative in different ways because they divide time, directions or the zodiac differently. There is no reason to smooth that difference into an impressive-sounding verdict. First identify the input each system used. Then identify what was calculated and what was interpreted. Finally ask whether the proposed reflection helps with something you actually know about your situation. A repeated theme may be worth considering, but several descriptions drawn from the same birth date are not several independent observations of your life. This distinction lets you explore more than one tradition without giving any of them authority over your memories or decisions.',
  );
  const keys: EditorialPlanet[] = volume === 'I' ? ['sun', 'mercury', 'saturn', 'venus', 'jupiter'] : volume === 'II' ? ['venus', 'mars', 'mercury', 'moon', 'saturn'] : volume === 'IV' ? ['pluto', 'saturn', 'neptune', 'uranus', 'sun'] : volume === 'V' ? ['sun', 'jupiter', 'saturn', 'mercury', 'venus'] : volume === 'VI' ? ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto'] : ['mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  let total = existing.reduce((n, p) => n + count(p), 0) + additions.reduce((n, p) => n + count(p), 0);
  for (const [index, key] of keys.entries()) {
    if (total >= 1050) break;
    const candidates = planetaryDepth(chart, key, tone);
    const paragraph = candidates[volume === 'II' ? candidates.length - 2 : volume === 'VI' ? candidates.length - 1 : index % Math.max(1, candidates.length)] ?? candidates[0];
    if (!paragraph) continue;
    const lead = volume === 'VI' ? 'Distinguish the birth placement from the moving sky. ' : volume === 'IV' ? 'A grounded comparison keeps the symbolic question separate from your history. ' : volume === 'V' ? 'Return to the measured Western chart for a clearly labelled comparison. ' : '';
    additions.push(lead + paragraph); total += count(lead + paragraph);
  }
  return additions.map(p => sourceRegister(p, tone));
}