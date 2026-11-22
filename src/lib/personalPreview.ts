import { fmtLon, type ChartResult } from '@/lib/astro';
import { SIGN_RULER } from '@/lib/signRulers';
import { chartTitle, dominantElement } from '@/lib/chartTitle';
import { arabicParts, balance } from '@/lib/resultsEngine';
import { chineseYear, lahiri, profection, VOLUMES, hasWorldSystems } from '@/lib/bookVolumes';
import { birthFactRows, planetRows, type BookFace, type CoverFacts, type TextFace, type TextFacePayload } from '@/lib/bookLeaves';
import type { ComicIssue } from '@/lib/comic';
import { planetPreview, risingPreview, untimedPreview, moonNote } from '@/lib/previewNarrative';
import type { Tone } from '@/lib/perception';
import { lifeCycles } from '@/lib/lifeCycles';
import { skyEvents } from '@/lib/skyToday';

export type { CoverFacts, TextFacePayload };

/** How many numbered pages each personal preview shows. */
export const PREVIEW_PAGES = 10;
export const BOOK_PREVIEW_PAGES = 28;
// Weak keys release authorized charts with their owner; tone/name edits reuse only measured cycle dates.
const cycleCache = new WeakMap<ChartResult, ReturnType<typeof lifeCycles>>();

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const GLYPHS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
const PLANET_NAME: Record<string, string> = { sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto' };
export const signGlyph = (sign: string) => GLYPHS[SIGNS.indexOf(sign)] ?? '✦';

const timedChart = (c: ChartResult) => !!c.input.time && c.asc != null;
const sunSign = (c: ChartResult) => c.bodies.find(b => b.key === 'sun')?.sign ?? 'Aries';

/** The chart ruler: the traditional ruler of the rising sign, or of the Sun sign when the birth time is unknown. */
export function chartRuler(c: ChartResult): string {
  const sign = timedChart(c) && c.asc != null ? fmtLon(c.asc).sign : sunSign(c);
  return SIGN_RULER[sign]?.traditional ?? 'sun';
}

/** Everything printed on a personal cover, calculated from the chart (the Moon is named only with a birth time). */
export function coverFacts(c: ChartResult, name: string, birthLine: string): CoverFacts {
  const timed = timedChart(c);
  const sun = sunSign(c);
  const moon = timed ? c.bodies.find(b => b.key === 'moon')?.sign : undefined;
  const rising = timed && c.asc != null ? fmtLon(c.asc).sign : undefined;
  const t = chartTitle({ sun, moon, rising, dominant: dominantElement(balance(c).el) });
  const ruler = chartRuler(c);
  const signs = [`☉ ${sun}`, moon && `☽ ${moon}`, rising && `↑ ${rising}`].filter(Boolean).join(' · ');
  return { name: name.trim() || 'Reader', title: t.title, subtitle: t.subtitle, signs, birthLine, ruler, rulerName: PLANET_NAME[ruler] ?? 'Sun', sunSign: sun, glyph: signGlyph(sun) };
}

/** Plain paragraphs from chapter markdown: headings, emphasis, tables, quotes and rules removed. */
export function plainParagraphs(md: string): string[] {
  return md.split(/\n\s*\n/).map(block => block.split('\n')
    .filter(l => !/^\s*(\||#{1,6}\s|In this chapter\b)/i.test(l) && !/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(l))
    .map(l => l.replace(/^\s*#{1,6}\s*/, '').replace(/^\s*>\s?/, '').replace(/^\s*[-*]\s+/, '• ').replace(/\*\*|__|(?<!\w)[*_](?!\s)|(?<!\s)[*_](?!\w)/g, '').replace(/[♦◆]\s*/g, '').trim())
    .filter(Boolean).join(' ')).filter(p => p.length > 1);
}

const words = (p: string) => p.split(/\s+/).filter(Boolean).length;
// Only whitespace after punctuation separates sentences; decimal degrees stay intact.
const sentencesOf = (p: string) => p.split(/(?<=[.!?])\s+(?=[A-Z“"])/).map(s => s.trim()).filter(Boolean);
/** Splits paragraphs into pages of about `perPage` words; a paragraph longer than a page is split between sentences. */
export function paginate(paras: string[], perPage = 115): string[][] {
  const pages: string[][] = [];
  let cur: string[] = [], n = 0;
  const flush = () => { if (cur.length) pages.push(cur); cur = []; n = 0; };
  for (const para of paras) {
    const sentences = words(para) <= perPage ? [para] : sentencesOf(para);
    let chunk = '';
    for (const sentence of sentences) {
      const w = words(sentence);
      if (n > 0 && n + w > perPage) { if (chunk) cur.push(chunk); chunk = ''; flush(); }
      chunk = chunk ? `${chunk} ${sentence}` : sentence;
      n += w;
    }
    if (chunk) cur.push(chunk);
  }
  flush();
  return pages;
}

type Numbered = Exclude<BookFace, { kind: 'cover' } | { kind: 'jacket' } | { kind: 'endpaper' } | { kind: 'title' } | { kind: 'back' } | { kind: 'blank' }>;
export type PreviewTopic = 'houses' | 'points' | 'traditions' | 'decans' | 'profection' | 'retrograde';
const TOPICS: Record<PreviewTopic, RegExp> = {
  houses: /\bhouses?\b|twelve temples/i,
  points: /esoteric|chiron|nodes?|sensitive points/i,
  traditions: /world systems|traditions|sidereal|vedic|chinese year pillar/i,
  decans: /decans?|ten.degree divisions/i,
  profection: /profections?|lord of the year/i,
  retrograde: /retrograde|retrogood|apparent backward motion/i,
};
/** Prefer a topic-bearing title, then its prose; dividers and drawings are not chapters. */
export function chapterForTopic(chapters: { title: string; content: string; draw?: string }[], topic: PreviewTopic): string {
  const candidates = chapters.filter(ch => !ch.draw && ch.content.trim());
  return (candidates.find(ch => TOPICS[topic].test(ch.title)) ?? candidates.find(ch => TOPICS[topic].test(ch.content)))?.content ?? '';
}

/** Select complete sentences/paragraphs for a single prose face, never an arbitrary word slice. */
export function prosePage(paragraphs: string[]): string[] {
  const out: string[] = [];
  let count = 0;
  for (const paragraph of paragraphs) {
    const sentences = sentencesOf(paragraph);
    const kept: string[] = [];
    for (const sentence of sentences) {
      const size = words(sentence);
      if (count + size > 135) {
        if (count >= 60) { if (kept.length) out.push(kept.join(' ')); return out; }
        continue;
      }
      kept.push(sentence); count += size;
    }
    if (kept.length) out.push(kept.join(' '));
    if (count >= 100) break;
  }
  if (count < 60) throw new Error('AstroBook prose requires at least 60 words of substantive source text.');
  return out;
}

export interface BookPreviewInput { name: string; birthLine: string; chart: ChartResult; tone?: Tone; asOf?: Date; dedication?: string; edition?: string; editionLabel?: string; proseMode?: 'excerpt' | 'complete'; artFor: (planetKey: string) => string }

/**
 * A 28-page personal AstroBook preview, built from the same chapters the printed book uses
 * (buildVolumes). A plate always lands on a left page so it faces the chapter it illustrates.
 */
export function bookPreview({ name, birthLine, chart: suppliedChart, tone = 'oracle', asOf = new Date(), dedication, edition = 'classic', editionLabel = 'Classic Edition', proseMode = 'excerpt', artFor }: BookPreviewInput): { cover: CoverFacts; faces: BookFace[]; jacket: BookFace } {
  const chart = timedChart(suppliedChart) ? suppliedChart : { ...suppliedChart, asc: null, mc: null, cusps: null, bodies: suppliedChart.bodies.map(b => ({ ...b, house: null })), aspects: suppliedChart.aspects.filter(a => !['Ascendant', 'Midheaven'].includes(a.a) && !['Ascendant', 'Midheaven'].includes(a.b)) };
  const timed = timedChart(chart);
  const cover = coverFacts(chart, name, birthLine);
  const first = cover.name.split(/\s+/)[0];
  const volumes = VOLUMES.filter(v => v.n !== 'V' || hasWorldSystems(edition)).map(v => `Volume ${v.n} · ${v.title}`);
  const placement = cover.signs;
  const text = (eyebrow: string, title: string, body: string[], place = placement): TextFace => ({ kind: 'text', eyebrow, title, placement: place, facts: [], body });
  const editorial = (section: 'letter' | 'facts' | 'agency' | 'compass' | 'method', oracle: string[]): string[] => {
    const frame = timed ? 'The recorded birth hour permits horizon and house calculations.' : 'The date-only reference omits horizon and house assignments; the Moon remains provisional.';
    const variants: Record<'educational' | 'professional', Record<typeof section, string[]>> = {
      educational: {
        letter: ['This book teaches a way of reading connections rather than collecting personality labels. Begin with the measured sky, distinguish the function of a planet from its sign, then follow the relationships between placements. A compound interpretation must show its reasoning, not simply sound convincing.', 'The method separates calculation, inherited symbolism and personal observation. These are different forms of information. Learning to recognise that distinction makes it possible to question a reading without losing the useful question it may contain.'],
        facts: [`The calculation uses ${birthLine.replace(/^Born /, '')}. ${frame} A longitude is a measured ecliptic position; a sign meaning is an interpretation within a named tradition.`, 'The method keeps those categories separate. First verify the supplied date, place and time. Then identify which statements are measured and which are interpretive. An observation from lived experience belongs in a third category: it helps assess usefulness, but does not independently validate an astronomical calculation.'],
        agency: ['The interpretive method cannot establish ancestry, childhood events, relationship history or a diagnosis. A chart is not a substitute for a person’s own account. Learning the symbolism should make the reasoning easier to examine, not make disagreement harder.', 'Compare a passage with a concrete observation and record both agreement and mismatch. This exercise tests the usefulness of an interpretation, not the truth of a hidden biography. No conclusion about another person or a difficult experience follows merely from an astrological pattern.'],
        compass: ['A placement is a measured position. An aspect is an angular relationship; its orb measures distance from exactness. A house requires a birth time. Retrograde denotes apparent backward motion from Earth. These definitions explain the mechanics used in the preceding pages.', 'For a reading exercise, identify a passage’s measured premise, its symbolic interpretation and an independently recorded observation. Compare all three without merging them. A mismatch can reveal an unhelpful interpretation without implying that a correctly calculated planetary position must be wrong.'],
        method: ['The method uses Astronomy Engine for planetary positions and historical time-zone conversion for UTC. Reference tests compare supported positions with Swiss Ephemeris within 0.1 degree. House calculations use the selected system only when a birth time is recorded.', 'The sidereal snapshot uses an approximate Lahiri ayanamsa; the Chinese section is a year pillar, not a complete Four Pillars analysis. Calculation, interpretation and symbolic illustration remain distinct. These deterministic previews make no AI call. Astrological insights provided for entertainment and self-reflection purposes only.'],
      },
      professional: {
        letter: ['Practitioner reference for the native: delineation begins with measured planetary positions and qualified interplanetary relationships. A sign alone does not establish a psychological profile. Compound interpretation specifies the planetary function, sign, verified house where available, and measured aspect before proposing a meaning.', 'The chart indicates symbolic hypotheses, not clinical findings. Calculation, traditional interpretation and the native’s reported experience remain separate evidence categories. No account of ancestry, trauma or relational history is inferred. This reference supports examination rather than an authoritative verdict about the native.'],
        facts: [`Reference birth data: ${birthLine.replace(/^Born /, '')}. ${frame} Ecliptic longitude is measured; traditional sign symbolism is interpretive. The native’s reported experience is a separate evidence category.`, 'Practitioner review should verify input data and distinguish positional precision from delineation confidence. A supported astronomical measurement does not validate a psychological inference. Date-only positions require temporal qualification, especially for lunar longitude and tight aspects. The reference preserves these limits rather than supplying unsupported personal facts.'],
        agency: ['For the native, astrological delineation does not establish childhood, ancestry, relationship history, diagnosis or causation. Clinical conclusions require appropriate independent assessment; none is supplied by this reference. The chart indicates symbolic relationships, not a hidden account of lived events.', 'Practitioner notes should identify measured premises, interpretive hypotheses and reported observations separately. Agreement and disagreement are both retained. A correspondence with experience does not prove causation, and disagreement does not invalidate a verified longitude. The native’s own account takes precedence over a proposed symbolic narrative.'],
        compass: ['Practitioner terms: placement denotes measured longitude; aspect denotes angular relationship; orb denotes departure from an exact angle. House assignments require a recorded hour. Retrograde denotes apparent geocentric backward motion, not physical reversal of an orbit.', 'For the native’s record, separate positional evidence, interpretive hypothesis and reported experience. Record contradictions as well as correspondences. The chart indicates symbolic relationships whose usefulness may be assessed, not clinical findings. A narrative match cannot establish astronomical accuracy, causation or a biographical fact absent independent evidence.'],
        method: ['Technical reference: planetary positions use Astronomy Engine; historical time-zone conversion supplies UTC. Supported reference positions are compared with Swiss Ephemeris within 0.1 degree. The selected house system applies only to recorded birth hours. The native’s delineation remains distinct from calculation accuracy.', 'Sidereal positions use approximate Lahiri ayanamsa. The Chinese year pillar is not a complete Four Pillars analysis. Preview prose is deterministic, with no AI call; illustration is symbolic. No clinical or predictive certainty is asserted. Astrological insights provided for entertainment and self-reflection purposes only.'],
      },
    };
    return tone === 'oracle' ? section === 'method' ? ['You should be able to trace what this book measures and what it only interprets. ' + oracle[0], ...oracle.slice(1)] : oracle : variants[tone][section];
  };
  const volume = (n: number) => ['Volume I · The Seed & Light', 'Volume II · Inner Geometry', 'Volume III · The Collective & Thresholds', 'Volume IV · Evolutionary Points & Hidden Axes', 'Volume V · Cross-System Synthesis & Lineage', 'Volume VI · The Unfolding Clock'][n - 1];
  const planet = (key: string, n: number): TextFace => ({ ...planetPreview(chart, key, tone), eyebrow: volume(n) });
  // Put the same significator beside its plate, not an unrelated chapter.
  const rulerNarrative = planet(cover.ruler, 1);
  const contextPage = (n: number, title: string, measured: string, voices: Record<Tone, string>): TextFace => text(volume(n), title, [
    tone === 'oracle' ? `You can begin with the measured reference: ${measured}` : tone === 'educational' ? `The method begins with the calculation: ${measured}` : `For the native, the reference calculation is as follows: ${measured}`,
    voices[tone],
  ], timed ? placement : 'Date-based planetary reference');
  const chiron = chart.bodies.find(b => b.key === 'chiron');
  const node = chart.bodies.find(b => b.key === 'northNode');
  const sun = chart.bodies.find(b => b.key === 'sun');
  if (!chiron || !node || !sun) throw new Error('The calculated chart requires Sun, Chiron and North Node positions.');
  const pointPosition = (b: typeof chiron) => `${b.name} at ${fmtLon(b.lon).text}${timed && b.house ? ` in house ${b.house}` : ''}`;
  const fortune = timed ? arabicParts(chart).find(p => p.name === 'Part of Fortune') : undefined;
  const cy = chineseYear(chart.input.date, sun.lon);
  const ay = lahiri(Number(chart.input.date.slice(0, 4)));
  const pf = timed ? profection(chart, asOf) : null;
  const dateLabel = (d: Date) => d.toISOString().slice(0, 10);
  let cycles = cycleCache.get(suppliedChart);
  if (!cycles) { cycles = lifeCycles(chart); cycleCache.set(suppliedChart, cycles); }
  const returns = cycles.filter(e => e.angle === 0 && e.date > asOf).slice(0, 2);
  const stations = skyEvents(asOf, 120).filter(e => e.kind === 'station').slice(0, 3);
  const outer = planet('uranus', 3);
  const neptune = planet('neptune', 3);
  const outerPage: TextFace = { ...outer, title: 'Experiment and imagination', placement: `${outer.placement} · ${neptune.placement}`, body: [outer.body[0], neptune.body[0], `The measured reference combines ${outer.placement} and ${neptune.placement}. ${tone === 'oracle' ? 'You can try a different approach while checking the hope that accompanies it.' : tone === 'educational' ? 'The method compares experimentation with idealisation rather than combining their planetary functions into a single label.' : 'For the native, experimentation and idealisation remain separate functions; their cohort-shared signs do not establish a personal event.'}`] };
  const pages: Numbered[] = [
    { kind: 'list', eyebrow: 'Table of Contents', heading: 'Inside this preview', items: ['Opening letter and calculation record · 2–4', 'I · The Seed & Light · 5–9', 'II · Inner Geometry · 10–13', 'III · The Collective & Thresholds · 14–17', 'IV · Evolutionary Points & Hidden Axes · 18–20', 'V · Cross-System Synthesis & Lineage · 21–23', 'VI · The Unfolding Clock · 24–26', 'Reader’s Compass and Colophon · 27–28'], note: `28 numbered interiors from ${first}’s calculated chart; cover and front/back matter are additional sheets.` },
    text('A letter to begin', tone === 'professional' ? `Practitioner reference · ${first}` : tone === 'educational' ? `Reading the chart · ${first}` : `Dear ${first},`, editorial('letter', ['You deserve a book that can be personal without pretending to know things you have never told it. We begin with the birth moment you supplied. From there, we measure the sky and follow the connections between its parts.', 'Some passages may feel familiar. Others may leave you uncertain. There is room for both. The purpose of this reading is to give you something specific to think with, while leaving your own experience in your hands.'])),
    text('A letter to begin', 'The facts stay visible', editorial('facts', [`Your chart is calculated for ${birthLine.replace(/^Born /, '')}. ${timed ? 'The recorded time allows us to calculate the horizon and house cusps.' : 'With no recorded time, houses and angles remain unassigned; the Moon’s daily position is provisional.'}`, 'A degree is a measured position. A sign meaning is an interpretation passed down within an astrological tradition. A reflection is a question for you. Those are different kinds of information, and this book keeps the distinction clear. Compare the printed positions with your saved birth details before using the reading as a reference.'])),
    { kind: 'facts', eyebrow: volume(1), heading: 'Birth facts', rows: [...birthFactRows(chart, timed), ...planetRows(chart, timed)], note: timed ? `${chart.input.houseSystem ?? 'placidus'} houses · tropical zodiac` : moonNote(tone) },
    planet('sun', 1),
    { kind: 'plate', src: artFor(cover.ruler), alt: `${cover.rulerName} illustrated in the atomic print style; symbolic artwork, not a sky diagram`, caption: `Plate I · ${cover.rulerName} · Symbolic illustration of the facing planetary narrative` },
    rulerNarrative,
    planet('moon', 1),
    { ...risingPreview(chart, tone), eyebrow: volume(1) },
    planet('mercury', 2),
    planet('venus', 2),
    planet('mars', 2),
    { ...untimedPreview(chart, 'geometry', tone), eyebrow: volume(2) },
    planet('jupiter', 3),
    planet('saturn', 3),
    outerPage,
    planet('pluto', 3),
    contextPage(4, 'Chiron: a question held carefully', pointPosition(chiron), {
      oracle: 'You do not need a story of damage to make this symbol useful. Chiron invites attention to the difference between feeling exposed and being incapable. Its sign qualifies that question; it does not supply a wound, a diagnosis or a childhood scene. Consider where patient practice helps you remain present without demanding that discomfort become an identity. Your own account decides whether the question belongs here.',
      educational: 'Chiron is a calculated minor-body position, not evidence of injury. The method reads its sign as a symbolic qualification of vulnerability and practice. A verified house can add context; non-lunar contacts can refine the relationship. Neither supplies a diagnosis or childhood narrative. Distinguish the measured coordinate from a proposed meaning, then compare that meaning with an independently recorded observation rather than assuming a wound must exist.',
      professional: 'Chiron delineation treats vulnerability and practice as symbolic hypotheses. The native’s history is not established by a minor-body coordinate. Sign and verified interplanetary contact qualify the reference; a life setting applies only where the recorded epoch supports it. No diagnosis, injury or childhood event follows. Practitioner review should preserve disagreement and distinguish the measured position from any interpretation of exposure or repair.',
    }),
    contextPage(4, 'Two ends of the lunar axis', `${pointPosition(node)}; South Node at ${fmtLon(node.lon + 180).text}. These points are exactly opposite.`, {
      oracle: 'You can think about a familiar response and an unfamiliar possibility without inventing a past life. The two signs offer contrasting symbolic questions, not a command to reject one half of yourself. Notice where a practiced response still serves you and where another approach deserves a trial. The node axis describes geometry; your choices and your observations remain yours.',
      educational: 'The lunar nodes are intersections of the lunar orbital plane with the ecliptic, not physical planets. Their opposition defines an axis. The method compares both sign expressions instead of treating one as good and the other as bad. Symbolic familiarity and development are interpretive themes, not evidence of a previous life, destiny or biography. Evaluate the contrast through observations recorded independently of this calculation.',
      professional: 'The nodal axis is an orbital-plane intersection reference with opposite longitudes. Delineation compares both tropical signs as complementary symbolic orientations. No prior incarnation, mission or personal history is established for the native. Verified settings may qualify a timed reference; they do not convert symbolism into evidence. Practitioner notes should retain the geometric premise separately from hypotheses concerning familiarity, experimentation and development.',
    }),
    fortune ? contextPage(4, 'Part of Fortune: the formula stays visible', `${fortune.text}; ${fortune.formula}.`, {
      oracle: 'You are looking at a derived point, not another planet and not a promise of wealth. The day or night formula combines the horizon with the two lights. Its traditional themes concern bodily participation and material circumstances; those themes are questions, not a diagnosis or a financial forecast. Read the sign alongside its ruler and the measured chart, keeping your actual circumstances separate from the symbolism.',
      educational: 'The Part of Fortune is a derived longitude, not an orbiting body. The calculation reverses the relationship of the lights for day and night births. The method distinguishes this mathematical construction from its inherited themes of bodily participation and material circumstances. Follow the sign to its traditional ruler before interpreting it. No diagnosis, income estimate or promised event follows from a lot or its ruler.',
      professional: 'The Part of Fortune is a sect-dependent derived longitude combining the horizon and luminaries. Delineation proceeds through its sign and traditional dispositor. For the native, bodily participation and material circumstances are traditional symbolic themes, not medical or financial findings. The formula is positional evidence only; its precision does not validate an outcome claim. Review the lot alongside planetary condition rather than treating it as an independent promise.',
    }) : { ...untimedPreview(chart, 'planets', tone), eyebrow: volume(4), title: 'Planetary relationships without derived lots' },
    contextPage(5, 'The tropical foundation', `Sun at ${fmtLon(sun.lon).text}; the tropical zodiac begins at the March equinox.`, {
      oracle: 'You can keep the seasonal frame clear without asking it to settle every question. A sign names a thirty-degree division; a planet supplies the function being interpreted. Bring two placements into conversation before accepting a broad label. Cross-system comparison starts here, with one stated reference, and does not turn agreement into proof. No tradition can recover your ancestry or tell the story of your family without your account.',
      educational: 'The tropical zodiac divides the ecliptic into twelve equal thirty-degree signs from the equinox. This is a coordinate convention, not a claim that signs are identical to constellations. The method combines planetary function, sign and measured relationship. Establish that foundation before comparing another system. Similar interpretations are not independent validation, and a symbolic framework cannot establish ancestry, family history or psychological findings.',
      professional: 'Tropical longitude is referenced to the equinox, with twelve equal sign divisions. Delineation qualifies planetary significators within that convention rather than conflating signs with astronomical constellations. For the native, cross-system comparison preserves the reference frame of each coordinate and the provenance of each interpretation. Agreement does not constitute independent validation. Ancestry, family lineage and psychological history require independent evidence and are not derived here.',
    }),
    contextPage(5, 'Chinese year pillar: a separate calendar', `${cy.polarity} ${cy.element} ${cy.animal}, year ${cy.year}, counted from Lichun using the solar longitude.`, {
      oracle: 'You share this year pillar with many people. Let it offer a second symbolic vocabulary, not a more intimate claim about you. The element and animal belong to a named calendar tradition; they do not confirm your tropical interpretation. A complete Four Pillars reading would also require month, day and hour pillars. This page makes no claim about family lineage, inherited temperament or the lives of your relatives.',
      educational: 'The year pillar uses the sexagenary cycle and changes at Lichun rather than January first. The method derives the stem element, polarity and animal from that solar-year reference. This is one pillar, not a complete BaZi analysis: month, day and hour pillars are not supplied. Cohort symbolism cannot establish individual biography or ancestry. Keep this calendar calculation separate from the tropical coordinate system and its interpretations.',
      professional: 'The solar-year pillar reports stem element, polarity and branch animal under the Lichun boundary convention. It is cohort-level reference information, not full Four Pillars delineation for the native. Month, day and hour pillars are not calculated here. No family lineage or inherited psychological trait is established. Comparison with tropical symbolism preserves distinct methods and does not treat apparent agreement as independent evidence of a personal finding.',
    }),
    contextPage(5, 'The sidereal perspective', `Approximate Lahiri ayanamsa ${ay.toFixed(2)}°; sidereal Sun at ${fmtLon(sun.lon - ay).text}.`, {
      oracle: 'You do not need to choose which version of yourself is real. Subtracting an ayanamsa changes the reference frame, not the person or the sky being studied. The sidereal Sun is a second coordinate description, not a correction of your tropical Sun. Read each tradition in its own terms. A shared theme can be worth considering, but neither agreement nor disagreement supplies proof about your life.',
      educational: 'The method subtracts an approximate Lahiri ayanamsa from tropical longitude to produce a sidereal snapshot. The approximation is stated rather than presented as a full Jyotish calculation. A changed sign follows from a changed origin; it does not imply a changed planet. Compare interpretive conventions within each tradition before comparing conclusions. This page omits time-sensitive lunar subdivisions and does not use agreement as evidence of biography.',
      professional: 'The sidereal snapshot applies a linear approximate Lahiri offset to the tropical reference longitude. It is not a full Jyotish delineation or an independently measured natal sky. For the native, changed sign assignment reflects the coordinate origin rather than a changed planetary function. Interpretive comparison retains each tradition’s conventions. Time-sensitive lunar subdivisions are omitted; correspondence between narratives cannot substantiate biography, causation or psychological findings.',
    }),
    pf ? contextPage(6, 'The annual profection', `As of ${dateLabel(asOf)}, age ${pf.age}: whole-sign house ${pf.house}, ${pf.sign}, ruled by ${pf.lord?.name ?? 'its traditional ruler'}.`, {
      oracle: 'You can use this year’s reference as a question about attention, not a deadline for a promised event. Each birthday moves the count one whole-sign place from the rising sign. Follow the activated sign to its traditional ruler, then compare that planet’s natal condition with its current motion. Your calendar notes can show what mattered; the symbolic framework cannot decide what must happen or why.',
      educational: 'Annual profections advance one whole-sign place at each birthday, returning to the first after twelve years. The method identifies the activated sign and its traditional ruler; this is distinct from the natal quadrant house system. Ruler condition qualifies the interpretation. The count is an interpretive timing framework rather than an event prediction. Compare it with independently recorded observations and current measured movements without assuming causation.',
      professional: 'Annual profection uses completed age modulo twelve from the verified rising sign. The activated whole-sign place and traditional lord provide an interpretive yearly reference distinct from quadrant cusps. For the native, ruler condition qualifies delineation; activation does not establish an event or its cause. The stated reference date bounds this calculation. Practitioner review should retain observations separately from timing hypotheses and avoid outcome certainty.',
    }) : { ...untimedPreview(chart, 'cycles', tone), eyebrow: volume(6), title: 'The year through planetary recurrence' },
    contextPage(6, 'Planetary returns: recurrence, not a deadline', returns.length ? `Next computed forward-pass returns: ${returns.map(e => `${e.title} on ${dateLabel(e.date)} UTC`).join('; ')}.${timed ? '' : ' Dates use provisional daily reference longitudes.'}` : 'No further Jupiter or Saturn return lies in the supported age windows through ninety years.', {
      oracle: 'You can revisit an old question without expecting an old life to repeat. A return brings a moving planet to its natal reference longitude; it does not return your circumstances to their starting point. These dates come from the ephemeris, not an average period. The search reports the first forward crossing within each supported age window, not every retrograde pass. Keep your experience beside the date, not underneath its authority.',
      educational: 'The method searches ecliptic longitude for the first forward crossing in supported lifetime windows. Jupiter and Saturn have variable apparent speeds, so an average orbital period cannot establish a return date. Retrograde loops can produce additional crossings not enumerated here. Date-only targets remain provisional. Compare the calculated recurrence with recorded observations, distinguishing positional agreement from any interpretation of development or a predicted event.',
      professional: 'Return epochs are ephemeris-searched first forward crossings within supported lifetime windows, not exhaustive multiple-pass sequences. The native’s reference longitude is the target; date-only targets remain provisional. Variable apparent speed prevents replacement with average orbital periods. A recurrence establishes positional correspondence only. Practitioner delineation may frame development symbolically but cannot establish repetition of circumstances, causation or a specific event from the computed date.',
    }),
    contextPage(6, 'Upcoming stations: the shared sky', `UTC daily-sampled station windows from ${dateLabel(asOf)}: ${stations.map(e => `${e.title}, ${dateLabel(e.date)}`).join('; ') || 'none found in the next 120 days'}.`, {
      oracle: 'You share these sky movements with everyone, though a measured natal contact can make a different question worth considering. A station marks a change in apparent direction, not a planet reversing its orbit. These are UTC day windows, not exact station instants. You need not expect trouble or promise a breakthrough. Notice what you are reconsidering, then distinguish that observation from any claim that the sky caused it.',
      educational: 'The method compares apparent motion at successive UTC midnights over a 120-day horizon. A direction change identifies a station window, not its exact instant. These are general sky events rather than natal returns or personalised predictions. Natal contacts require separate measurement. Retrograde describes the Earth-based perspective; it does not diagnose delay, force an event or establish causation. Record observations independently before proposing any symbolic correspondence.',
      professional: 'Station windows are daily-sampled changes of apparent geocentric direction over the stated 120-day horizon. Exact station instants are not resolved. For the native, these remain general sky references until a natal contact is independently measured. Retrograde is observational motion, not physical orbital reversal or a finding concerning personal delay. Practitioner notes should distinguish shared sky timing, measured natal relationships and interpretive hypotheses without asserting causation.',
    }),
    text('Reader’s Compass', 'Keep your own record', editorial('compass', ['Placement: the measured position of a planet or angle. House: a division of the sky that requires a birth time. Aspect: an angular relationship. Orb: the distance from an exact aspect. Retrograde: apparent backward motion as seen from Earth.', 'Choose one passage. Write down what it says, the chart fact it rests on, and an example from your own experience. Include what does not fit. Your observations are not evidence that the calculation is right or wrong; they help you decide whether the interpretation is useful.'])),
    text('Colophon', 'How these pages were made', editorial('method', ['Planetary positions are calculated with Astronomy Engine. Reference tests compare the supported positions with Swiss Ephemeris within 0.1 degree. Historical time-zone conversion supplies the UTC moment. House calculations use the selected system.', 'The sidereal snapshot uses an approximate Lahiri ayanamsa; the Chinese section is a year pillar, not a complete Four Pillars analysis. These previews use calculated passages and editorial reflections, without an AI call. Illustration is symbolic. Paper, binding and final page count depend on the edition selected at order time.', 'Astrological insights provided for entertainment and self-reflection purposes only.'])),
  ];
  if (pages.length !== BOOK_PREVIEW_PAGES) throw new Error('AstroBook preview must contain exactly 28 interior pages.');
  const numbered: BookFace[] = pages.map((p, i) => {
    if (p.kind !== 'text') return { ...p, page: i + 1 };
    if (proseMode === 'complete') return { ...p, page: i + 1 };
    try { return { ...p, body: prosePage(p.body), page: i + 1 }; }
    catch { throw new Error(`AstroBook page ${i + 1} (${p.title}, ${tone}) cannot meet the prose budget.`); }
  });

  const faces: BookFace[] = [
    { kind: 'endpaper', eyebrow: dedication?.trim() ? 'Dedication · Ex libris' : 'Ex libris', heading: cover.name, lines: [birthLine, ...(dedication?.trim() ? dedication.trim().split(/\n+/).filter(Boolean) : []), 'Calculated from saved birth details'] },
    { kind: 'title', name: cover.name, subtitle: cover.title, edition: `AstroBook · ${editionLabel}`, note: 'Six volumes written from one birth chart' },
    { kind: 'blank' },
    ...numbered,
    { kind: 'list', eyebrow: 'The preview ends here', heading: 'The book continues', items: volumes, note: `The full ${editionLabel} runs every volume from these same placements.` },
  ];
  return { cover, faces, jacket: { kind: 'jacket', cover, art: artFor(cover.ruler), edition: editionLabel } };
}

export type ComicArtSlot = 'sky' | 'letter' | string;

/**
 * Which picture fills each panel of an issue's first ten pages: the month's lead character, the reader's natal
 * character, the retrograde planet and the Moon, so every illustrated panel shows who the script names.
 */
export function comicArtSlots(issue: ComicIssue, upTo = PREVIEW_PAGES): Record<string, ComicArtSlot> {
  const lead = issue.cast?.lead ?? 'sun';
  const out: Record<string, ComicArtSlot> = {};
  let mainSeen = 0;
  for (const p of issue.pages.filter(pg => pg.n <= upTo && pg.section !== 'Cover')) {
    const isFirstMain = p.section === 'Main Story' && mainSeen++ === 0;
    p.panels.forEach((panel, i) => {
      const key = `${p.n}-${i}`;
      switch (p.section) {
        case 'Your Sky This Month': out[key] = 'sky'; break;
        case 'Letter from the Stars': out[key] = 'letter'; break;
        case 'Retrograde Watch': out[key] = issue.cast?.retro ?? 'mercury'; break;
        case 'Lunar Calendar': out[key] = 'moon'; break;
        case 'House Focus': out[key] = i === 0 ? 'sun' : lead; break;
        case 'Main Story': out[key] = isFirstMain && i === 1 && issue.cast?.natal ? issue.cast.natal : lead; break;
        default: out[key] = lead;
      }
    });
  }
  return out;
}
