import { fmtLon, SIGNS, type ChartResult } from '@/lib/astro';
import { aspectText, arabicParts, fixedStarContacts, houseAnalysis, ordinal, placementText } from '@/lib/resultsEngine';
import { perceive, narrative } from '@/lib/perception';
import { HOUSE_ARENAS, SIGN_EXPRESSIONS } from '@/content/interpretationLibrary';
import { SIGN_RULER } from '@/lib/signRulers';
import { NUM_KEYWORD } from '@/lib/numerologyCross';
import { versionOf } from '@/lib/books';
import { detectPatterns, rankPatterns, sep } from '@/lib/chartPatterns';
import { dignityOf } from '@/lib/retrogood';
import { shadowBreakthroughBlock } from '@/content/shadowBreakthrough';
import { buildOpeningLetter, letterText } from '@/lib/openingLetter';
import { lifeCycles } from '@/lib/lifeCycles';
import {
  affirmationsChapter, birthVerse, elementChapter, forecastChapter, moonPhase, mythologyChapter, northNodeChapter, relationshipPrimer,
  retroChapter, rulershipSummary, sensitivePoints, solarReturnChapter, synastryChapter, type BookChapter, type Person,
} from '@/lib/bookExtras';

/**
 * AstroBook as a personal Masterbook: six volumes written from the reader's own calculated chart, at the same
 * structure as the founders' Masterbooks. Every version can be composed from the chart alone (so payment never waits
 * on AI readings); finished readings are woven into the volume they belong to. Larger versions add chapters, never filler.
 */
export const VOLUMES = [
  { n: 'I', title: 'The Celestial Matrix', line: 'Your birth sky, its balance and its first story' },
  { n: 'II', title: 'The Twelve Temples', line: 'The houses: where each part of life takes place' },
  { n: 'III', title: 'Planetary Geometry & Aspect Harmonics', line: 'Each planet, and the angles between them' },
  { n: 'IV', title: 'Esoteric Points', line: 'Chiron, the Nodes, the lots and the fixed stars' },
  { n: 'V', title: 'World Systems', line: 'Your birth moment in Vedic, Chinese and numerological traditions' },
  { n: 'VI', title: 'Cycles of Time', line: 'Returns, profections and the year ahead' },
] as const;
export type VolumeNo = typeof VOLUMES[number]['n'];

const RANK = ['digital', 'pocket', 'classic', 'signature', 'linen'];
/** World Systems (Volume V) starts at Classic, alongside the other deeper chart chapters. */
export const WORLD_SYSTEMS_FROM = 'classic';
const norm = (x: number) => ((x % 360) + 360) % 360;
const body = (c: ChartResult, key: string) => c.bodies.find(b => b.key === key);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Which volume a saved reading belongs in, from its title. */
export function volumeFor(title: string): VolumeNo {
  const t = title.toLowerCase();
  if (/vedic|jyotish|chinese|numerolog|mayan|tzolk|feng shui|bagua|kua|celtic|tree calendar|druid|tibetan|mewa|nine star|egyptian|aztec|tarot|kabbal|human design|i ching|system/.test(t)) return 'V';
  if (/forecast|transit|year ahead|timing|timeline|return|profection|retrograde/.test(t)) return 'VI';
  if (/shadow|spirit|karm|past li|mission|node|chiron|soul|esoteric|intuition|gift/.test(t)) return 'IV';
  if (/love|relationship|sex|attract|partner|venus|mars|aspect|communication|mind/.test(t)) return 'III';
  if (/home|family|career|money|resource|health|work|house|calling|wellness/.test(t)) return 'II';

  return 'I';
}

function bigThree(c: ChartResult, timeKnown: boolean) {
  const sun = body(c, 'sun')!, moon = body(c, 'moon')!;
  const rising = c.asc != null ? SIGNS[Math.floor(norm(c.asc) / 30)] : null;
  const parts = [`## Sun in ${sun.sign}\n\n${placementText(sun, timeKnown)}`, `## Moon in ${moon.sign}\n\n${placementText(moon, timeKnown)}`];
  if (rising) { const e = SIGN_EXPRESSIONS[rising]; parts.push(`## ${rising} Rising\n\nYour Ascendant is ${fmtLon(c.asc!).text}. ${rising} rising ${e.core}: the first impression you give and the way you begin things. Its gift is ${e.gift}; its growing edge is ${e.shadow}.`); }
  else parts.push('## Rising sign\n\nYour birth time is unknown, so the Ascendant cannot be calculated. Everything else in this book that depends only on signs is still exact.');
  const ruler = rising ? body(c, SIGN_RULER[rising].traditional) : undefined;
  if (ruler) parts.push(`## Your chart ruler: ${ruler.name}\n\nThe planet that rules your rising sign leads the whole chart. ${ruler.name} sits in ${ruler.sign}${ruler.house ? ` in your ${ordinal(ruler.house)} house` : ''}, so its story colours every other chapter.`);
  return parts.join('\n\n');
}

function housesChapter(c: ChartResult) {
  const houses = houseAnalysis(c);
  if (!houses.length) return 'Your birth time is unknown, so the twelve houses cannot be drawn. The house themes below are the arenas astrologers read; add a birth time and compose again to see which signs and planets fall in each.\n\n' + HOUSE_ARENAS.slice(1).map((h, i) => `## The ${ordinal(i + 1)} house · ${h.arena}\n\n${h.question} ${cap(h.themes)}.`).join('\n\n');
  return houses.map(h => {
    const a = HOUSE_ARENAS[h.n];
    const e = SIGN_EXPRESSIONS[h.sign];
    return `## The ${ordinal(h.n)} house · ${a.arena}\n\n${a.question} This house holds ${a.themes}. ${h.sign} is on its cusp, so you meet these matters in a way that ${e.core}. It is ruled by ${h.ruler}${h.rulerSign ? ` in ${h.rulerSign}` : ''}${h.rulerHouse ? ` (${ordinal(h.rulerHouse)} house)` : ''}.${h.occupants.length ? ` Planets here: ${h.occupants.map(o => o.name).join(', ')} — this is an emphasised room in your chart.` : ' No planets sit here; its ruler tells the story.'}`;
  }).join('\n\n');
}

const PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
const PLANET_PROMPT: Record<string, string> = {
  sun: 'When did you last feel fully yourself? What were you doing?', moon: 'What restores you after a hard day, honestly?',
  mercury: 'How do you think best: out loud, on paper, or alone?', venus: 'What do you find beautiful that others overlook?',
  mars: 'What makes you act before you have time to doubt?', jupiter: 'Where has generosity, given or received, changed your path?',
  saturn: 'What have you built slowly that you are proud of?', uranus: 'Where do you refuse to be like everyone else?',
  neptune: 'What do you long for that you cannot quite name?', pluto: 'What ending made room for who you are now?',
};
/** One section per planet: position, sign and house meaning, its tightest aspects, and a reflection. */
function planetsChapter(c: ChartResult, timeKnown: boolean) {
  return PLANETS.map(k => body(c, k)).filter((b): b is NonNullable<typeof b> => !!b).map(b => {
    const e = SIGN_EXPRESSIONS[b.sign];
    const house = b.house && timeKnown ? HOUSE_ARENAS[b.house] : null;
    const hits = c.aspects.filter(a => a.a === b.name || a.b === b.name).sort((x, y) => x.orb - y.orb).slice(0, 4);
    return [
      `## ${b.name} in ${b.sign}${house ? ` · ${ordinal(b.house!)} house` : ''}${b.retro ? ' · retrograde' : ''}`,
      `${fmtLon(b.lon).text}. ${placementText(b, timeKnown)}`,
      e ? `${b.sign} ${e.core}. Through ${b.name}, its gift is ${e.gift}; its growing edge is ${e.shadow}.` : '',
      house ? `The ${ordinal(b.house!)} house asks: ${house.question} Here that question is answered through ${house.themes}.` : '',
      hits.length ? `Its closest contacts: ${hits.map(a => `${a.a} ${a.type.toLowerCase()} ${a.b} (${a.orb.toFixed(1)}°)`).join('; ')}.` : `${b.name} makes no major aspect within orb, so it tends to act on its own terms.`,
      `Reflect: ${PLANET_PROMPT[b.key]}`,
    ].filter(Boolean).join('\n\n');
  }).join('\n\n');
}

function aspectsChapter(c: ChartResult, limit: number) {
  const list = [...c.aspects].sort((a, b) => a.orb - b.orb).slice(0, limit);
  if (!list.length) return 'No major aspects fall within the orbs used in this book.';
  return `${list.length} of your ${c.aspects.length} aspects, tightest first. A smaller orb means a stronger, more constant theme.\n\n` + list.map(a => `## ${a.a} ${a.type.toLowerCase()} ${a.b} · orb ${a.orb.toFixed(1)}°\n\n${aspectText(a, c.bodies)}`).join('\n\n');
}

function lotsAndStars(c: ChartResult) {
  const lots = arabicParts(c);
  const stars = fixedStarContacts(c, 1);
  const out: string[] = [];
  out.push(lots.length ? '## The Hermetic lots\n\nEach lot is a calculated point that combines your Ascendant with two planets; day and night births use mirrored formulas.\n\n' + lots.map(l => `**${l.name}** · ${l.text} · ${l.theme} (${l.formula})`).join('\n\n') : '## The Hermetic lots\n\nThe lots are measured from the Ascendant, which needs a birth time.');
  out.push(stars.length ? '## Fixed-star contacts (within 1°)\n\nStar positions are precessed to your birth year.\n\n' + stars.map(s => `**${s.point} with ${s.star}** (${s.position}) · orb ${s.orb.toFixed(2)}° — ${s.meaning}`).join('\n\n') : '## Fixed-star contacts\n\nNone of your planets or angles sit within 1° of the bright fixed stars used here.');
  return out.join('\n\n');
}

const NAKSHATRAS = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
const STEMS = [['Wood', 'Yang'], ['Wood', 'Yin'], ['Fire', 'Yang'], ['Fire', 'Yin'], ['Earth', 'Yang'], ['Earth', 'Yin'], ['Metal', 'Yang'], ['Metal', 'Yin'], ['Water', 'Yang'], ['Water', 'Yin']];
const ANIMALS = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
const reduce = (n: number, keepMaster = true): number => { while (n > 9 && !(keepMaster && [11, 22, 33].includes(n))) n = String(n).split('').reduce((a, d) => a + Number(d), 0); return n; };

/** Lahiri ayanamsa, linear approximation (about 50.3″ a year from 23.853° at 2000.0). */
export const lahiri = (year: number) => 23.853 + (year - 2000) * 0.013969;
/** Chinese year pillar: the year changes at Lichun, when the Sun reaches 315° (about February 4). */
export function chineseYear(date: string, sunLon: number) {
  const [y, m] = date.split('-').map(Number);
  const year = m <= 2 && sunLon >= 270 && sunLon < 315 ? y - 1 : y;
  const [element, polarity] = STEMS[((year - 4) % 10 + 10) % 10];
  return { year, element, polarity, animal: ANIMALS[((year - 4) % 12 + 12) % 12] };
}
/** Life path: month, day and year each reduced, then summed and reduced, keeping 11, 22 and 33. */
export function lifePath(date: string) {
  const [y, m, d] = date.split('-').map(Number);
  return reduce(reduce(m) + reduce(d) + reduce(String(y).split('').reduce((a, x) => a + Number(x), 0)));
}

export function worldSystems(c: ChartResult) {
  const year = Number(c.input.date.slice(0, 4));
  const ay = lahiri(year);
  const sid = (lon: number) => fmtLon(norm(lon - ay));
  const moon = body(c, 'moon')!, sun = body(c, 'sun')!;
  const nak = NAKSHATRAS[Math.floor(norm(moon.lon - ay) / (360 / 27))];
  const cy = chineseYear(c.input.date, sun.lon);
  const lp = lifePath(c.input.date);
  return [
    `## Vedic (sidereal) snapshot\n\nVedic astrology measures signs against the stars, so every position shifts back by the ayanamsa — ${ay.toFixed(2)}° for ${year} (Lahiri, approximated). Your Sun is ${sid(sun.lon).text} and your Moon ${sid(moon.lon).text} sidereal${c.asc != null ? `, with ${sid(c.asc).sign} rising` : ''}. Your Moon's nakshatra (lunar mansion) is ${nak}.`,
    `## Chinese year pillar\n\nBorn in the ${cy.polarity} ${cy.element} ${cy.animal} year (${cy.year}–${cy.year + 1}, counted from Lichun, the start of spring). The animal colours how you are seen in a group; the element describes the year's character.`,
    `## Numerology: Life Path ${lp}\n\nFrom your birth date, reduced digit by digit${[11, 22, 33].includes(lp) ? ' (a master number, kept unreduced)' : ''}. Life Path ${lp} is often called the ${NUM_KEYWORD[lp] ?? 'Seeker'}.`,
    'These traditions use their own rules; they are shown beside your Western chart for reflection, not as a single combined verdict.',
  ].join('\n\n');
}

/** Annual profection: each birthday moves the focus one house (whole sign from the Ascendant); that sign's ruler leads the year. */
export function profection(c: ChartResult, today = new Date()) {
  if (c.asc == null) return null;
  const [y, m, d] = c.input.date.split('-').map(Number);
  let age = today.getUTCFullYear() - y; if (today.getUTCMonth() + 1 < m || (today.getUTCMonth() + 1 === m && today.getUTCDate() < d)) age--;
  const house = (age % 12) + 1;
  const sign = SIGNS[(Math.floor(norm(c.asc) / 30) + house - 1) % 12];
  const lord = body(c, SIGN_RULER[sign].traditional);
  return { age, house, sign, lord };
}
function profectionChapter(c: ChartResult, today?: Date) {
  const p = profection(c, today);
  if (!p) return 'Annual profections count houses from the Ascendant, which needs a birth time.';
  return `At ${p.age}, your profected year activates the ${ordinal(p.house)} house — ${HOUSE_ARENAS[p.house].arena} — in ${p.sign}. Its ruler, ${p.lord?.name ?? 'its ruling planet'}${p.lord ? ` (in ${p.lord.sign}${p.lord.house ? `, ${ordinal(p.lord.house)} house` : ''})` : ''}, is your lord of the year: transits to it, and its own movements, carry extra weight until your next birthday.`;
}

/** Your own relationship reference points, for Collector's Linen when no partner charts are saved. */
function synastryKeys(c: ChartResult) {
  const keys = ['sun', 'moon', 'venus', 'mars'].map(k => body(c, k)!).map(b => `**${b.name}** · ${fmtLon(b.lon).text}`);
  const dsc = c.asc != null ? fmtLon(norm(c.asc + 180)).text : null;
  return [
    'No partner charts were saved when this book was composed, so instead of comparisons this chapter gives you the points astrologers compare first.',
    keys.join('\n\n') + (dsc ? `\n\n**Descendant** · ${dsc}` : ''),
    '## How to use them\n\nWhen someone’s Sun, Moon, Venus or Mars falls within a few degrees of one of these points — by conjunction, opposition, trine or square — that contact is usually felt strongly in the relationship. Add up to three people in Relationships and compose again to have the comparisons written for you.',
  ].join('\n\n');
}

const DIGNITY_WORD: Record<string, string> = { domicile: 'at home (domicile)', exaltation: 'exalted', 'domicile+exaltation': 'at home and exalted', peregrine: 'peregrine (a guest)', detriment: 'in detriment', fall: 'in fall', 'detriment+fall': 'in detriment and fall' };
/** Dignity of each planet plus where the chart's weight falls (hemispheres need a birth time). */
function dignitiesChapter(c: ChartResult, timeKnown: boolean) {
  const rows = PLANETS.map(k => body(c, k)).filter((b): b is NonNullable<typeof b> => !!b).map(b => `**${b.name}** in ${b.sign} · ${DIGNITY_WORD[dignityOf(b.key, b.sign)] ?? 'peregrine'}`);
  const strong = PLANETS.map(k => body(c, k)!).filter(b => ['domicile', 'exaltation', 'domicile+exaltation'].includes(dignityOf(b.key, b.sign)));
  const parts = ['Dignity describes how comfortable a planet is in its sign. At home or exalted, it works with ease; in detriment or fall, it works harder and often grows more skilful for it.', rows.join('\n\n')];
  parts.push(strong.length ? `## Your strongest voices\n\n${strong.map(b => b.name).join(', ')} ${strong.length > 1 ? 'are' : 'is'} dignified in your chart, so ${strong.length > 1 ? 'they speak' : 'it speaks'} clearly and early in life.` : '## Your strongest voices\n\nNo planet sits in its own sign or exaltation, so no single voice dominates; your chart is a conversation between equals.');
  if (timeKnown && c.cusps?.length) {
    const ps = PLANETS.map(k => body(c, k)!).filter(b => b.house);
    const above = ps.filter(b => b.house! >= 7).length, east = ps.filter(b => b.house! >= 10 || b.house! <= 3).length;
    parts.push(`## Where the weight falls\n\n${above} of 10 planets are above the horizon (houses 7–12) and ${10 - above} below it; ${east} are on the eastern side (houses 10–3) and ${10 - east} on the western. ${above >= 6 ? 'A chart weighted above the horizon tends to live outwardly, through the world and other people.' : above <= 4 ? 'A chart weighted below the horizon tends to live inwardly first, from private life and personal ground.' : 'Above and below are close to balanced.'} ${east >= 6 ? 'Eastern emphasis favours self-direction: you shape circumstances.' : east <= 4 ? 'Western emphasis favours relationship: circumstances and people shape you, and you shape them back.' : ''}`.trim());
  }
  return parts.join('\n\n');
}

/** Multi-planet configurations, ranked by significance, with the reasons each one ranks. */
function patternsChapter(c: ChartResult, timeKnown: boolean) {
  const ranked = rankPatterns(detectPatterns(timeKnown ? c : { ...c, asc: null, cusps: null, utc: null }), c);
  if (!ranked.length) return 'No major multi-planet configuration (stellium, Grand Trine, T-square, Yod, Kite or Grand Cross) forms in your chart. Your planets act more as individuals than as a choir, so the planet-by-planet chapters carry the story.';
  return `${ranked.length} configuration${ranked.length > 1 ? 's' : ''} found, most significant first.\n\n` + ranked.map(r => `## ${r.label}\n\n${r.detail}${r.factors.length ? `\n\nWhy it ranks: ${r.factors.join('; ')}.` : ''}`).join('\n\n');
}

/** Shadow and breakthrough for the most significant patterns, with one small practice each. */
function shadowChapter(c: ChartResult, timeKnown: boolean) {
  const ranked = rankPatterns(detectPatterns(timeKnown ? c : { ...c, asc: null, cusps: null, utc: null }), c);
  const items = shadowBreakthroughBlock(ranked, 'oracle', 5);
  if (!items.length) return 'Your chart has no single dominant configuration, so shadow and breakthrough are read planet by planet in Volume III.';
  return 'Each strong pattern has a form it takes under pressure and a form it grows into. Neither is a verdict; both are yours to notice.\n\n' + items.map(i => `## ${i.source}\n\nUnder pressure: ${i.shadow}.\n\nIntegrated: ${i.breakthrough}.${i.practice ? `\n\nPractice: ${i.practice}.` : ''}`).join('\n\n');
}

/** Planetary midpoints and the planets sitting on them (within 1.5°). */
function midpointsChapter(c: ChartResult) {
  const pts = [...PLANETS.map(k => body(c, k)!).map(b => ({ name: b.name, lon: b.lon })), ...(c.asc != null ? [{ name: 'Ascendant', lon: c.asc }] : []), ...(c.mc != null ? [{ name: 'Midheaven', lon: c.mc }] : [])];
  const pairs: [string, string][] = [['Sun', 'Moon'], ['Venus', 'Mars'], ['Sun', 'Saturn'], ['Moon', 'Venus'], ['Jupiter', 'Saturn'], ...(c.asc != null && c.mc != null ? [['Ascendant', 'Midheaven'] as [string, string]] : [])];
  const lines = pairs.map(([a, b]) => {
    const pa = pts.find(p => p.name === a)!, pb = pts.find(p => p.name === b)!;
    let mid = norm(pa.lon + norm(pb.lon - pa.lon) / 2); if (norm(pb.lon - pa.lon) > 180) mid = norm(mid + 180);
    const on = pts.filter(p => p.name !== a && p.name !== b && (sep(p.lon, mid) <= 1.5 || sep(p.lon, mid + 180) <= 1.5));
    return `**${a}/${b}** · ${fmtLon(mid).text}${on.length ? ` — activated by ${on.map(p => p.name).join(', ')}` : ''}`;
  });
  return 'A midpoint is the exact halfway point between two planets. When a third planet sits on it (or opposite it), the three act as one theme.\n\n' + lines.join('\n\n');
}

/** Returns and turning points across a lifetime, from the real ephemeris. */
function cyclesChapter(c: ChartResult, today = new Date()) {
  const events = lifeCycles(c);
  if (!events.length) return 'The cycle dates could not be calculated for this chart.';
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: c.input.tz });
  const next = events.find(e => e.date > today);
  return [
    `These are the dates when a planet returns to its own place in your chart, or squares or opposes it, calculated from the ephemeris.${next ? ` Your next one is the ${next.title} in ${fmt(next.date)}, at about ${next.age}.` : ''}`,
    ...events.map(e => `## ${e.title} · age ${e.age} · ${fmt(e.date)}${e.date <= today ? ' (passed)' : ''}\n\n${e.meaning}`),
  ].join('\n\n');
}

export type VolumeInput = { edition: string; chart: ChartResult; name: string; saved: { title: string; content: string }[]; people?: Person[]; today?: Date; /** Birth facts and the full planet table. */ facts?: string };

/** All chapters of a personal AstroBook, in reading order, with a divider page before each volume. */
export function buildVolumes({ edition, chart: c, name, saved, people = [], today, facts }: VolumeInput): BookChapter[] {
  const rank = RANK.indexOf(versionOf(edition)?.id ?? '');
  const r = rank < 0 ? 2 : rank;
  const timeKnown = !!c.input.time;
  const ph = moonPhase(c);
  const fromReadings = new Set<BookChapter>();
  const bySaved = (n: VolumeNo) => saved.filter(s => volumeFor(s.title) === n).map(s => { const ch = { title: s.title, content: s.content }; fromReadings.add(ch); return ch; });
  const vol: Record<VolumeNo, BookChapter[]> = { I: [], II: [], III: [], IV: [], V: [], VI: [] };

  if (facts) vol.I.push({ title: 'Birth Facts and Planet Table', content: facts });
  vol.I.push({ title: 'Your Big Three', content: bigThree(c, timeKnown) });
  if (r >= 2) vol.I.push({ title: 'Your Birth Sky', content: 'The wheel above is drawn from your calculated positions: signs around the edge, planets at their exact degrees.', draw: 'wheel' });
  vol.I.push({ title: 'Your Birth Moon Phase', content: `${ph.name} · ${Math.round(ph.angle)}° from the Sun · ${ph.illumination}% lit\n\n${ph.text}` });
  vol.I.push({ title: 'Dignities and Chart Emphasis', content: dignitiesChapter(c, timeKnown) });
  if (r >= 3) vol.I.push({ title: 'Element and Modality Balance', content: elementChapter(c) }, { title: 'The Story of Your Sky', content: narrative(perceive(c, timeKnown), 'oracle', 6) + '\n\n' + perceive(c, timeKnown).slice(0, 6).map(i => `## ${i.title}\n\n${i.text}`).join('\n\n') });
  vol.I.push(...bySaved('I'));

  vol.II.push({ title: 'The Twelve Houses', content: housesChapter(c) }, { title: 'Rulership Summary', content: rulershipSummary(c) });
  vol.II.push(...bySaved('II'));

  vol.III.push({ title: 'Your Planets, One by One', content: planetsChapter(c, timeKnown) });
  vol.III.push({ title: 'Your Aspects', content: aspectsChapter(c, [8, 12, 24, 36, 60][r]) });
  vol.III.push({ title: 'Aspect Patterns', content: patternsChapter(c, timeKnown) });
  if (r >= 3) vol.III.push({ title: 'Midpoints', content: midpointsChapter(c) });
  if (r >= 2) vol.III.push({ title: 'Aspect Grid', content: 'Each square marks an aspect between the two planets on its row and column.', draw: 'grid' });
  if (r >= 3) vol.III.push({ title: 'Relationship Primer', content: relationshipPrimer(c, timeKnown) });
  if (r >= 4) vol.III.push(people.length ? { title: 'Relationship Comparisons', content: synastryChapter(c, people) } : { title: 'Your Synastry Keys', content: synastryKeys(c) });
  vol.III.push(...bySaved('III'));

  vol.IV.push({ title: 'Your North Node', content: northNodeChapter(c) }, { title: 'Shadow and Breakthrough', content: shadowChapter(c, timeKnown) });
  if (r >= 2) vol.IV.push({ title: 'Chiron, the Nodes and Sensitive Points', content: sensitivePoints(c, timeKnown) });
  if (r >= 4) vol.IV.push({ title: 'Lots and Fixed Stars', content: lotsAndStars(c) }, { title: 'Planet Mythology', content: mythologyChapter(c) });
  vol.IV.push(...bySaved('IV'));

  if (r >= RANK.indexOf(WORLD_SYSTEMS_FROM)) vol.V.push({ title: 'Your Birth Moment Across Traditions', content: worldSystems(c) });
  vol.V.push(...bySaved('V'));

  vol.VI.push({ title: 'Your Profection Year', content: profectionChapter(c, today) }, { title: 'Life Cycles: Returns and Turning Points', content: cyclesChapter(c, today) });
  if (r >= 2) vol.VI.push({ title: 'RetroGOOD: Your Retrograde Planets', content: retroChapter(c) }, { title: 'Solar Return Preview', content: solarReturnChapter(c, timeKnown, today) });
  if (r >= 4) vol.VI.push({ title: 'Your 12-Month Sky Forecast', content: forecastChapter(c, today) }, { title: 'Twelve Affirmations', content: affirmationsChapter(c) });
  vol.VI.push(...bySaved('VI'));

  // A finished reading with the same title as a calculated chapter replaces it (the reading is the deeper version).
  const key = (t: string) => t.toLowerCase().replace(/^your\s+/, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const savedKeys = new Set(saved.map(s => key(s.title)));
  for (const n of Object.keys(vol) as VolumeNo[]) vol[n] = vol[n].filter(ch => fromReadings.has(ch) || ch.draw || !savedKeys.has(key(ch.title)));

  const out: BookChapter[] = [];
  if (r >= 1) out.push({ title: 'Your Birth-Moment Verse', content: birthVerse(c, name) });
  out.push({ title: 'Your Opening Letter', content: letterText(buildOpeningLetter({ name, placeLabel: c.input.placeLabel, chart: c, timeKnown })) });
  for (const v of VOLUMES) {
    const chapters = vol[v.n];
    if (!chapters.length) continue;
    out.push({ title: `Volume ${v.n} · ${v.title}`, content: v.line, draw: 'volume' }, ...chapters);
  }
  if (r >= 4) out.push({ title: 'Collector’s Certificate', content: '', draw: 'certificate' });
  return out;
}
