import { fmtLon, type ChartResult } from '@/lib/astro';
import { SIGN_RULER } from '@/lib/signRulers';
import { chartTitle, dominantElement } from '@/lib/chartTitle';
import { balance } from '@/lib/resultsEngine';
import { buildVolumes } from '@/lib/bookVolumes';
import { birthFactRows, houseRows, planetRows, tightestAspects, type BookFace, type CoverFacts, type TextFace, type TextFacePayload } from '@/lib/bookLeaves';
import type { ComicIssue } from '@/lib/comic';
import { planetPreview, risingPreview, untimedPreview, PROVISIONAL_MOON_NOTE } from '@/lib/previewNarrative';
import type { Tone } from '@/lib/perception';

export type { CoverFacts, TextFacePayload };

/** How many numbered pages each personal preview shows. */
export const PREVIEW_PAGES = 10;
export const BOOK_PREVIEW_PAGES = 25;

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

export interface BookPreviewInput { name: string; birthLine: string; chart: ChartResult; tone?: Tone; edition?: string; editionLabel?: string; artFor: (planetKey: string) => string }

/**
 * A 25-page personal AstroBook preview, built from the same chapters the printed book uses
 * (buildVolumes). A plate always lands on a left page so it faces the chapter it illustrates.
 */
export function bookPreview({ name, birthLine, chart: suppliedChart, tone = 'oracle', edition = 'classic', editionLabel = 'Classic Edition', artFor }: BookPreviewInput): { cover: CoverFacts; faces: BookFace[]; jacket: BookFace } {
  const chart = timedChart(suppliedChart) ? suppliedChart : { ...suppliedChart, asc: null, mc: null, cusps: null, bodies: suppliedChart.bodies.map(b => ({ ...b, house: null })), aspects: suppliedChart.aspects.filter(a => !['Ascendant', 'Midheaven'].includes(a.a) && !['Ascendant', 'Midheaven'].includes(a.b)) };
  const timed = timedChart(chart);
  const cover = coverFacts(chart, name, birthLine);
  const first = cover.name.split(/\s+/)[0];
  const chapters = buildVolumes({ edition, chart, name: first, saved: [] });
  const volumes = chapters.filter(ch => ch.draw === 'volume').map(ch => ch.title);
  const placement = cover.signs;
  const text = (eyebrow: string, title: string, body: string[], place = placement): TextFace => ({ kind: 'text', eyebrow, title, placement: place, facts: [], body });
  const extract = (topic: PreviewTopic, volume: string, title: string): TextFace => {
    if (!timed && (topic === 'houses' || topic === 'profection')) return { ...untimedPreview(chart, topic === 'houses' ? 'geometry' : 'cycles'), eyebrow: volume };
    const source = chapterForTopic(chapters, topic);
    const context: Record<PreviewTopic, string> = {
      houses: 'Read the cusp, its ruler and the ruler’s own placement together. Those three measured links make the interpretation more specific than a house keyword. They describe a symbolic setting, not proof of what happened in it. Your own account remains separate from that interpretation.',
      points: 'Chiron and the lunar nodes are interpreted differently from the ten planets. Their symbolic themes cannot establish trauma, a past life or a personal mission. Read the measured position first, then consider whether the interpretation offers a useful question without turning that question into a fact about you.',
      traditions: 'Each tradition begins with its own frame of reference and calculation rules. A sidereal sign is not a correction to a tropical sign. The Chinese year pillar is not a complete birth analysis. Keep these systems alongside one another rather than treating their agreement as independent proof.',
      decans: 'A decan divides a sign into three ten-degree sections. The Chaldean ruler adds a secondary symbolic layer; it does not replace the planet’s sign or its measured contacts. Read the planet first, then the smaller division, and notice which part of the interpretation actually helps you think.',
      profection: 'Annual profections advance one whole-sign house at each birthday. The activated sign’s traditional ruler supplies the reference planet for that year. This is an interpretive timing framework, not a forecast of a particular event. Read the ruler’s natal position and current movements together before making any personal connection.',
      retrograde: 'Retrograde describes apparent motion from Earth, not a planet physically reversing its orbit. Different planets spend different amounts of time in this condition. A slower planet’s retrograde can be shared by many people born nearby in time; it cannot by itself explain a private habit or a life event.',
    };
    if (!source) {
      // Smaller editions may omit a topic: offer planetary analysis, never a missing-text warning.
      return { ...untimedPreview(chart, 'planets'), eyebrow: volume, title };
    }
    return text(volume, title, [...plainParagraphs(source), context[topic]]);
  };
  const pages: Numbered[] = [
    { kind: 'list', eyebrow: 'Contents', heading: 'Inside this preview', items: ['A letter to begin · 2–4', 'Birth sky and its lights · 5–10', 'Houses and planetary voices · 11–15', 'Contacts and deeper questions · 16–19', 'Traditions and timing · 20–23', 'Reader’s notes and method · 24–25'], note: `25 pages from ${first}’s calculated chart` },
    text('A letter to begin', `Dear ${first},`, ['You deserve a book that can be personal without pretending to know things you have never told it. We begin with the birth moment you supplied. From there, we measure the sky and follow the connections between its parts.', 'Some passages may feel familiar. Others may leave you uncertain. There is room for both. The purpose of this reading is to give you something specific to think with, while leaving your own experience in your hands.']),
    text('A letter to begin', 'The facts stay visible', [`Your chart is calculated for ${birthLine.replace(/^Born /, '')}. ${timed ? 'The recorded time allows us to calculate the horizon and house cusps.' : 'With no recorded time, houses and angles remain unassigned; the Moon’s daily position is provisional.'}`, 'A degree is a measured position. A sign meaning is an interpretation passed down within an astrological tradition. A reflection is a question for you. Those are different kinds of information, and this book keeps the distinction clear. Compare the printed positions with your saved birth details before using the reading as a reference.']),
    text('A letter to begin', 'You have the last word', ['A chart cannot establish your childhood, your ancestry, your relationships or a hidden reason for something painful. It does not diagnose you. It cannot decide whether a particular person belongs in your life.', 'Read slowly enough to hear your own response. If a sentence fits, give it a real example. If it does not, let it go. You do not owe the book agreement. The strongest reading is one you can examine, question and return to with a little more understanding.']),
    { kind: 'facts', eyebrow: 'Volume I · The Celestial Matrix', heading: 'Birth facts', rows: birthFactRows(chart, timed), note: timed ? `${chart.input.houseSystem ?? 'placidus'} houses · tropical zodiac` : PROVISIONAL_MOON_NOTE },
    { kind: 'facts', eyebrow: 'Volume I · The Celestial Matrix', heading: 'The planets', rows: planetRows(chart, timed), note: `℞ marks apparent retrograde motion; it is not a prediction of difficulty.${timed ? '' : ` ${PROVISIONAL_MOON_NOTE}`}` },
    { kind: 'plate', src: artFor(cover.ruler), alt: `${cover.rulerName} illustrated in the atomic print style; symbolic artwork, not a sky diagram`, caption: `Plate I · ${cover.rulerName} · illustrative artwork` },
    planetPreview(chart, 'sun', tone),
    planetPreview(chart, 'moon', tone),
    risingPreview(chart),
    timed && chart.cusps?.length ? { kind: 'facts', eyebrow: 'Volume II · The Twelve Temples', heading: 'House cusps', rows: houseRows(chart), note: 'Calculated in the selected house system; other systems can assign planets differently.' } : { ...untimedPreview(chart, 'planets'), eyebrow: 'Volume II · The Twelve Temples' },
    extract('houses', 'Volume II · The Twelve Temples', 'Where the reading takes place'),
    planetPreview(chart, 'mercury', tone),
    planetPreview(chart, 'venus', tone),
    planetPreview(chart, 'mars', tone),
    { kind: 'list', eyebrow: 'Volume III · Planetary Geometry', heading: 'Closest contacts', items: tightestAspects(chart, 8), note: 'Orb measures distance from the exact angle. A tighter aspect is not proof of a life event.' },
    planetPreview(chart, 'saturn', tone),
    planetPreview(chart, 'pluto', tone),
    extract('points', 'Volume IV · Esoteric Points', 'Points, not a past-life record'),
    extract('traditions', 'Volume V · World Systems', 'Different systems, stated separately'),
    extract('decans', 'Volume I · The Celestial Matrix', 'A closer division of each sign'),
    extract('profection', 'Volume VI · Cycles of Time', 'The year’s reference point'),
    extract('retrograde', 'Volume VI · Cycles of Time', 'Reading retrograde motion'),
    text('Reader’s Compass', 'Keep your own record', ['Placement: the measured position of a planet or angle. House: a division of the sky that requires a birth time. Aspect: an angular relationship. Orb: the distance from an exact aspect. Retrograde: apparent backward motion as seen from Earth.', 'Choose one passage. Write down what it says, the chart fact it rests on, and an example from your own experience. Include what does not fit. Your observations are not evidence that the calculation is right or wrong; they help you decide whether the interpretation is useful.']),
    text('Method and colophon', 'How these pages were made', ['Planetary positions are calculated with Astronomy Engine. Reference tests compare the supported positions with Swiss Ephemeris within 0.1 degree. Historical time-zone conversion supplies the UTC moment. House calculations use the selected system.', 'The sidereal snapshot uses an approximate Lahiri ayanamsa; the Chinese section is a year pillar, not a complete Four Pillars analysis. These previews use calculated passages and editorial reflections, without an AI call. Illustration is symbolic. Paper, binding and final page count depend on the edition selected at order time.', 'Astrological insights provided for entertainment and self-reflection purposes only.']),
  ];
  if (pages.length !== BOOK_PREVIEW_PAGES) throw new Error('AstroBook preview must contain exactly 25 interior pages.');
  const numbered: BookFace[] = pages.map((p, i) => p.kind === 'text' ? { ...p, body: prosePage(p.body), page: i + 1 } : { ...p, page: i + 1 });

  const faces: BookFace[] = [
    { kind: 'endpaper', eyebrow: 'Ex libris', heading: cover.name, lines: [birthLine, 'Calculated from saved birth details'] },
    { kind: 'title', name: cover.name, subtitle: cover.title, edition: `AstroBook · ${editionLabel}`, note: 'Six volumes written from one birth chart' },
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
