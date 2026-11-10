import type { ChartResult } from '@/lib/astro';
import { SIGN_RULER } from '@/lib/signRulers';
import type { EditionPage } from '@/content/sampleEdition';
import type { AstroComicShowcase } from '@/content/sampleComic';

/**
 * One printed face of a page in the openable 3D book. Faces are plain data so the same pages can be drawn in the
 * book, read aloud in the side panel and checked in tests. Chart faces come only from a calculated chart.
 */
export type BookFace =
  | { kind: 'cover'; src: string; alt: string }
  | { kind: 'endpaper'; eyebrow: string; heading: string; lines: string[] }
  | { kind: 'title'; name: string; subtitle: string; edition: string; note: string }
  | { kind: 'facts'; eyebrow: string; heading: string; rows: [string, string][]; note?: string; page?: number }
  | { kind: 'plate'; src: string; alt: string; caption: string; page?: number }
  | { kind: 'text'; eyebrow: string; title: string; placement: string; facts: [string, string][]; body: string[]; reflection?: string; page?: number }
  | { kind: 'comic'; src: string; alt: string; title: string; placement: string; caption: string; dialogue?: string; page: number }
  | { kind: 'list'; eyebrow: string; heading: string; items: string[]; note?: string; page?: number }
  | { kind: 'back'; lines: string[] }
  | { kind: 'blank' };

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const ORDINAL = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

/** Sign and degree of an ecliptic longitude, e.g. 42.79 → "Taurus 12°47′". */
export function degreeLabel(lon: number) {
  const x = ((lon % 360) + 360) % 360;
  let sign = Math.floor(x / 30), deg = Math.floor(x % 30), min = Math.round(((x % 30) - deg) * 60);
  if (min === 60) { min = 0; deg += 1; }
  if (deg === 30) { deg = 0; sign = (sign + 1) % 12; }
  return `${SIGNS[sign]} ${deg}°${String(min).padStart(2, '0')}′`;
}
const signOf = (lon: number) => SIGNS[Math.floor((((lon % 360) + 360) % 360) / 30)];
const body = (c: ChartResult, name: string) => c.bodies.find(b => b.name === name || b.key === name.toLowerCase());
const pos = (b: { sign: string; deg: number; min: number }) => `${b.sign} ${b.deg}°${String(b.min).padStart(2, '0')}′`;

/** Birth facts page: angles, lights and chart ruler. Angles and houses appear only when the birth time is known. */
export function birthFactRows(c: ChartResult, timed: boolean): [string, string][] {
  const rows: [string, string][] = [];
  const sun = body(c, 'Sun'), moon = body(c, 'Moon');
  if (timed && c.asc != null) rows.push(['Ascendant', degreeLabel(c.asc)]);
  if (timed && c.mc != null) rows.push(['Midheaven', degreeLabel(c.mc)]);
  if (sun) rows.push(['Sun', `${pos(sun)}${timed && sun.house ? ` · ${ORDINAL[sun.house]} house` : ''}`]);
  if (moon) rows.push(['Moon', `${pos(moon)}${timed && moon.house ? ` · ${ORDINAL[moon.house]} house` : ''}`]);
  if (timed && c.asc != null) {
    const ruler = body(c, SIGN_RULER[signOf(c.asc)].traditional);
    if (ruler) rows.push(['Chart ruler', `${ruler.name} in ${pos(ruler)}${ruler.house ? ` · ${ORDINAL[ruler.house]} house` : ''}`]);
  }
  return rows;
}

/** Planet table: the ten planets with sign, degree, house and retrograde mark. */
export function planetRows(c: ChartResult, timed: boolean): [string, string][] {
  return PLANETS.map(n => body(c, n)).filter((b): b is NonNullable<typeof b> => !!b)
    .map(b => [b.name, `${pos(b)}${b.retro ? ' ℞' : ''}${timed && b.house ? ` · ${ORDINAL[b.house]}` : ''}`]);
}

/** Tightest three aspects between the planets, for the "strongest contacts" line. */
export function tightestAspects(c: ChartResult, n = 3): string[] {
  return c.aspects.filter(a => PLANETS.includes(a.a) && PLANETS.includes(a.b)).sort((x, y) => x.orb - y.orb).slice(0, n)
    .map(a => `${a.a} ${a.type.toLowerCase()} ${a.b} · ${a.orb.toFixed(2)}°`);
}

const VOLUME_LIST = ['I · The Celestial Matrix', 'II · The Twelve Temples', 'III · Planetary Geometry', 'IV · The Esoteric Points', 'V · World Systems', 'VI · Cycles of Time'];

/** House cusps, 1st to 12th, as sign and degree. Only for a known birth time. */
export function houseRows(c: ChartResult): [string, string][] {
  return (c.cusps ?? []).slice(0, 12).map((lon, k) => [`${ORDINAL[k + 1]}${k === 0 ? ' · Ascendant' : k === 9 ? ' · Midheaven' : ''}`, degreeLabel(lon)]);
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/** Birth line in the cover style, e.g. "Born 3 May 1987 · 6:42 a.m. · Asheville, North Carolina". */
export function birthLineOf(date: string, time: string | null, place: string) {
  const [y, m, d] = date.split('-').map(Number);
  let t = 'time unknown';
  if (time) { const [h, min] = time.split(':').map(Number); t = `${h % 12 || 12}:${String(min).padStart(2, '0')} ${h < 12 ? 'a.m.' : 'p.m.'}`; }
  return `Born ${d} ${MONTHS[m - 1]} ${y} · ${t} · ${place}`;
}

export interface BookInteriorInput {
  name: string; birthLine: string; chart: ChartResult; timed: boolean; edition: string;
  /** Finished illustrated pages (plate + text) to bind after the chart pages; omitted for chart-only previews. */
  pages?: EditionPage[];
  /** Whose book this is, for the small print on the bookplate. */
  owner: 'sample' | 'member';
}

/**
 * Interior of an openable AstroBook, inside front cover to inside back cover. The bookplate, title page, birth facts,
 * planet table, house cusps and closest contacts are calculated from the chart; illustrated pages are bound in only
 * when supplied, each plate on a left page facing its text.
 */
export function bookInterior(i: BookInteriorInput): BookFace[] {
  let page = 1;
  const faces: BookFace[] = [
    { kind: 'endpaper', eyebrow: 'Ex libris', heading: i.name, lines: [i.birthLine, i.owner === 'sample' ? 'A fictional reader · a real calculation' : 'Calculated from your saved birth details'] },
    { kind: 'title', name: i.name, subtitle: 'Your exact placement in print', edition: `AstroBook · ${i.edition}`, note: 'Six volumes written from one birth chart' },
    { kind: 'facts', eyebrow: 'Volume I · The Celestial Matrix', heading: 'Birth facts', rows: birthFactRows(i.chart, i.timed), note: i.timed ? `${(i.chart.input.houseSystem ?? 'placidus').replace(/^./, s => s.toUpperCase())} houses · tropical zodiac` : 'Birth time unknown: houses and angles are left out rather than guessed', page: page++ },
    { kind: 'facts', eyebrow: 'Volume I · The Celestial Matrix', heading: 'The planets', rows: planetRows(i.chart, i.timed), note: 'Tropical zodiac · ℞ marks a planet in retrograde motion', page: page++ },
  ];
  if (i.timed && i.chart.cusps?.length) faces.push({ kind: 'facts', eyebrow: 'Volume II · The Twelve Temples', heading: 'House cusps', rows: houseRows(i.chart), note: 'Each house runs from its cusp to the next', page: page++ });
  faces.push({ kind: 'list', eyebrow: 'Volume III · Planetary Geometry', heading: 'Closest contacts', items: tightestAspects(i.chart, 8), note: 'The number is the orb: how far each aspect is from exact', page: page++ });
  const pages = i.pages ?? [];
  // A plate must land on a left page (a leaf's back) so it faces its own text.
  if (pages.length && faces.length % 2 === 1) faces.push({ kind: 'blank' });
  for (const p of pages) {
    faces.push({ kind: 'plate', src: p.image, alt: p.imageAlt, caption: `Plate ${p.n} · ${p.placement}`, page: page++ });
    faces.push({ kind: 'text', eyebrow: p.volume, title: p.title, placement: p.placement, facts: p.facts.map(f => [f.label, f.value]), body: p.body, reflection: p.reflection, page: page++ });
  }
  faces.push({ kind: 'list', eyebrow: 'The book continues', heading: 'Six volumes, one sky', items: VOLUME_LIST, note: i.owner === 'sample' ? 'The sample stops here. A full book runs every volume from the same chart.' : 'Your full book writes every volume from these placements. You read the real manuscript before you pay.', page });
  return faces;
}

/** Interior of the sample comic digest: inside cover, each drawn page, then a "next issue" page. */
export function comicInterior(issue: AstroComicShowcase, birthLine: string, bigThree: string): BookFace[] {
  return [
    { kind: 'endpaper', eyebrow: 'This issue stars', heading: issue.hero, lines: [birthLine, bigThree, 'A fictional reader · a real calculation'] },
    ...issue.pages.map((p): BookFace => ({ kind: 'comic', src: p.art, alt: p.panels[0].visualPrompt, title: p.actTitle, placement: p.placement, caption: p.panels[0].narration, dialogue: p.panels[1]?.dialogue, page: p.pageNumber })),
    { kind: 'list', eyebrow: 'Next in a real subscription', heading: 'Your own Issue #1', items: ['Your Sun, Moon and Rising cast the story', 'That month’s real transits decide what happens', 'Lunar calendar, retrograde watch and reflection prompts', '24 pages, printed and mailed in the US'], note: issue.footer, page: issue.pages.length + 1 },
  ];
}

/**
 * Pairs faces into leaves. Leaf 0's front is the cover; each leaf's back is the left page of the next spread; the
 * final face is the back cover, so it always lands on a leaf's back (a blank page is inserted when needed).
 */
export function toLeaves(cover: BookFace, interior: BookFace[], back: BookFace): { front: BookFace; back: BookFace }[] {
  const faces = [cover, ...interior];
  if (faces.length % 2 === 0) faces.push({ kind: 'blank' });
  faces.push(back);
  const leaves: { front: BookFace; back: BookFace }[] = [];
  for (let k = 0; k < faces.length; k += 2) leaves.push({ front: faces[k], back: faces[k + 1] });
  return leaves;
}

/** Plain-text version of a face for the reading panel and screen readers. */
export function faceText(f: BookFace): { heading: string; lines: string[] } | null {
  switch (f.kind) {
    case 'cover': return { heading: 'Front cover', lines: [f.alt] };
    case 'endpaper': return { heading: `${f.eyebrow}: ${f.heading}`, lines: f.lines };
    case 'title': return { heading: f.name, lines: [f.subtitle, f.edition, f.note] };
    case 'facts': return { heading: f.heading, lines: [...f.rows.map(([k, v]) => `${k}: ${v}`), ...(f.note ? [f.note] : [])] };
    case 'plate': return { heading: f.caption, lines: [f.alt] };
    case 'text': return { heading: `${f.title} · ${f.placement}`, lines: [...f.facts.map(([k, v]) => `${k}: ${v}`), ...f.body, ...(f.reflection ? [`Reflection: ${f.reflection}`] : [])] };
    case 'comic': return { heading: `p. ${f.page} · ${f.title} · ${f.placement}`, lines: [f.caption, ...(f.dialogue ? [f.dialogue] : [])] };
    case 'list': return { heading: f.heading, lines: [...f.items, ...(f.note ? [f.note] : [])] };
    case 'back': return { heading: 'Back cover', lines: f.lines };
    default: return null;
  }
}
