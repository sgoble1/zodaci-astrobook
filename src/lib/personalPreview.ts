import { fmtLon, type ChartResult } from '@/lib/astro';
import { SIGN_RULER } from '@/lib/signRulers';
import { chartTitle, dominantElement } from '@/lib/chartTitle';
import { balance } from '@/lib/resultsEngine';
import { buildVolumes } from '@/lib/bookVolumes';
import { birthFactRows, houseRows, planetRows, tightestAspects, type BookFace, type CoverFacts } from '@/lib/bookLeaves';
import type { ComicIssue } from '@/lib/comic';

export type { CoverFacts };

/** How many numbered pages each personal preview shows. */
export const PREVIEW_PAGES = 10;

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const GLYPHS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
const PLANET_NAME: Record<string, string> = { sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto' };
export const signGlyph = (sign: string) => GLYPHS[SIGNS.indexOf(sign)] ?? '✦';

const timedChart = (c: ChartResult) => !!c.input.time && c.asc != null;
const sunSign = (c: ChartResult) => c.bodies.find(b => b.key === 'sun')?.sign ?? 'Aries';

/** The chart ruler: the traditional ruler of the rising sign, or of the Sun sign when the birth time is unknown. */
export function chartRuler(c: ChartResult): string {
  const sign = timedChart(c) ? fmtLon(c.asc!).sign : sunSign(c);
  return SIGN_RULER[sign]?.traditional ?? 'sun';
}

/** Everything printed on a personal cover, calculated from the chart (the Moon is named only with a birth time). */
export function coverFacts(c: ChartResult, name: string, birthLine: string): CoverFacts {
  const timed = timedChart(c);
  const sun = sunSign(c);
  const moon = timed ? c.bodies.find(b => b.key === 'moon')?.sign : undefined;
  const rising = timed ? fmtLon(c.asc!).sign : undefined;
  const t = chartTitle({ sun, moon, rising, dominant: dominantElement(balance(c).el) });
  const ruler = chartRuler(c);
  const signs = [`☉ ${sun}`, moon && `☽ ${moon}`, rising && `↑ ${rising}`].filter(Boolean).join(' · ');
  return { name: name.trim() || 'Reader', title: t.title, subtitle: t.subtitle, signs, birthLine, ruler, rulerName: PLANET_NAME[ruler] ?? 'Sun', sunSign: sun, glyph: signGlyph(sun) };
}

/** Plain paragraphs from chapter markdown: headings, emphasis, tables, quotes and rules removed. */
export function plainParagraphs(md: string): string[] {
  return md.split(/\n\s*\n/).map(block => block.split('\n')
    .filter(l => !/^\s*\|/.test(l) && !/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(l))
    .map(l => l.replace(/^\s*#{1,6}\s*/, '').replace(/^\s*>\s?/, '').replace(/^\s*[-*]\s+/, '• ').replace(/\*\*|__|(?<!\w)[*_](?!\s)|(?<!\s)[*_](?!\w)/g, '').replace(/[♦◆]\s*/g, '').trim())
    .filter(Boolean).join(' ')).filter(p => p.length > 1);
}

const words = (p: string) => p.split(/\s+/).filter(Boolean).length;
/** Splits paragraphs into pages of about `perPage` words; a paragraph longer than a page is split between sentences. */
export function paginate(paras: string[], perPage = 115): string[][] {
  const pages: string[][] = [];
  let cur: string[] = [], n = 0;
  const flush = () => { if (cur.length) pages.push(cur); cur = []; n = 0; };
  for (const para of paras) {
    const sentences = words(para) <= perPage ? [para] : para.match(/[^.!?]+[.!?]+["”’)]*|[^.!?]+$/g)?.map(x => x.trim()).filter(Boolean) ?? [para];
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
const chapterOf = (chapters: { title: string; content: string }[], title: string) => chapters.find(ch => ch.title === title)?.content ?? '';

export interface BookPreviewInput { name: string; birthLine: string; chart: ChartResult; edition?: string; editionLabel?: string; artFor: (planetKey: string) => string }

/**
 * The cover and first ten pages of a personal AstroBook, built from the same chapters the printed book uses
 * (buildVolumes). A plate always lands on a left page so it faces the chapter it illustrates.
 */
export function bookPreview({ name, birthLine, chart, edition = 'classic', editionLabel = 'Classic Edition', artFor }: BookPreviewInput): { cover: CoverFacts; faces: BookFace[]; jacket: BookFace } {
  const timed = timedChart(chart);
  const cover = coverFacts(chart, name, birthLine);
  const first = cover.name.split(/\s+/)[0];
  const chapters = buildVolumes({ edition, chart, name: first, saved: [] });
  const volumes = chapters.filter(ch => ch.draw === 'volume').map(ch => ch.title);
  const letter = paginate(plainParagraphs(chapterOf(chapters, 'Your Opening Letter')));
  const bigThree = paginate(plainParagraphs(chapterOf(chapters, 'Your Big Three')));
  const moonPhase = paginate(plainParagraphs(chapterOf(chapters, 'Your Birth Moon Phase')));
  const sun = chart.bodies.find(b => b.key === 'sun');
  const placement = cover.signs;
  const text = (eyebrow: string, title: string, body: string[], place = placement): Numbered => ({ kind: 'text', eyebrow, title, placement: place, facts: [], body });

  const pages: Numbered[] = [
    { kind: 'list', eyebrow: 'Contents', heading: 'Six volumes, one sky', items: ['Your Opening Letter', ...volumes], note: `Written from ${first}’s calculated chart` },
    ...letter.slice(0, 2).map((body, i) => text('A letter to begin', i ? 'Your Opening Letter, continued' : 'Your Opening Letter', body)),
    { kind: 'facts', eyebrow: 'Volume I · The Celestial Matrix', heading: 'Birth facts', rows: birthFactRows(chart, timed), note: timed ? 'Tropical zodiac · houses from the saved birth time' : 'Birth time unknown: houses and angles are left out rather than guessed' },
  ];
  // The plate sits on a left page (odd page number here) facing the chapter about the chart ruler's sign.
  if (pages.length % 2 === 1) pages.push({ kind: 'facts', eyebrow: 'Volume I · The Celestial Matrix', heading: 'The planets', rows: planetRows(chart, timed), note: 'Tropical zodiac · ℞ marks a planet in retrograde motion' });
  pages.push({ kind: 'plate', src: artFor(cover.ruler), alt: `${cover.rulerName}, the chart ruler, drawn as an Atomic Zodiac character`, caption: `Plate I · ${cover.rulerName} · chart ruler${sun ? ` · Sun in ${sun.sign}` : ''}` });
  pages.push(...bigThree.slice(0, 2).map((body, i) => text('Volume I · The Celestial Matrix', i ? 'Your Big Three, continued' : 'Your Big Three', body)));
  if (!pages.some(p => p.kind === 'facts' && p.heading === 'The planets')) pages.push({ kind: 'facts', eyebrow: 'Volume I · The Celestial Matrix', heading: 'The planets', rows: planetRows(chart, timed), note: 'Tropical zodiac · ℞ marks a planet in retrograde motion' });
  if (moonPhase[0]) pages.push(text('Volume I · The Celestial Matrix', 'Your Birth Moon Phase', moonPhase[0]));
  if (timed && chart.cusps?.length) pages.push({ kind: 'facts', eyebrow: 'Volume II · The Twelve Temples', heading: 'House cusps', rows: houseRows(chart), note: 'Each house runs from its cusp to the next' });
  pages.push({ kind: 'list', eyebrow: 'Volume III · Planetary Geometry', heading: 'Closest contacts', items: tightestAspects(chart, 8), note: 'The number is the orb: how far each aspect is from exact' });
  // Fill to ten with the rest of the letter, then the Big Three, before anything is cut.
  for (const body of [...letter.slice(2), ...bigThree.slice(2)]) if (pages.length < PREVIEW_PAGES) pages.push(text('Volume I · The Celestial Matrix', 'Continued', body));
  const ten = pages.slice(0, PREVIEW_PAGES).map((p, i) => ({ ...p, page: i + 1 })) as BookFace[];

  const faces: BookFace[] = [
    { kind: 'endpaper', eyebrow: 'Ex libris', heading: cover.name, lines: [birthLine, 'Calculated from saved birth details'] },
    { kind: 'title', name: cover.name, subtitle: cover.title, edition: `AstroBook · ${editionLabel}`, note: 'Six volumes written from one birth chart' },
    ...ten,
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
