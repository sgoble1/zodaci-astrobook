import { PDFDocument, rgb, degrees, type PDFFont, type PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { BOOK_SECTIONS, versionOf } from '@/lib/books';
import { SIGN_GLYPH, type ChartResult } from '@/lib/astro';
import type { BookChapter } from '@/lib/bookExtras';
import { coverType } from '@/lib/coverLayout';

export type ManuscriptChapter = { title: string; content: string };
export type ManuscriptInput = {
  name: string; birthFacts: string; chartFacts: string; chapters: ManuscriptChapter[]; cover?: Uint8Array; edition: string; extras: string[]; fontBytes: Uint8Array; bigThree?: string;
  /** Deterministic chapters for the chosen version (moon phase, RetroGOOD, forecast…). */
  editionChapters?: BookChapter[];
  /**
   * The complete six-volume book (see buildVolumes). When given, it is the whole body of the book: saved readings are
   * already woven into it, so a reader with no finished readings still gets a full chart-derived manuscript.
   */
  volumes?: BookChapter[];
  /** Calculated chart, used to draw the birth-sky wheel and aspect grid pages. */
  chart?: ChartResult;
  /** Certificate number shown on Collector's Linen certificate pages. */
  certificate?: string;
};
const ink = rgb(.12, .1, .18), muted = rgb(.38, .36, .42), gold = rgb(.62, .48, .2);
const clean = (s: string) => s.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)').replace(/[*`_]/g, '').replace(/\r/g, '');

/** Two-pass, real pagination at the version's trim size. No invented filler to manufacture a promised page count. */
export async function composeManuscript(input: ManuscriptInput) {
  if (!input.volumes?.length && !input.chapters.length) throw new Error('Write your personal chapters before composing a manuscript.');
  const version = versionOf(input.edition);
  const [W, H] = version?.trimPt ?? [432, 648];
  const scale = Math.min(W, H) / 432;
  const M = Math.round(48 * Math.max(.8, Math.min(scale, 1.25))), BOTTOM = M + 6;
  const body = 10.5 * Math.max(.88, Math.min(scale, 1.15));
  const pdf = await PDFDocument.create(); pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(input.fontBytes, { subset: true });
  pdf.setTitle(`${input.name || 'My'} AstroBook`); pdf.setAuthor('Zodaci'); pdf.setSubject(`Personal chart manuscript · ${version?.name ?? input.edition}`);
  const lines = (text: string, size: number, width = W - M * 2) => wrap(clean(text), font, size, width);
  // Page 1 is the designed front cover exactly as the reader approved it (name, subtitle and wordmark are part of it).
  const cover = pdf.addPage([W, H]);
  if (input.cover) {
    const image = input.cover[0] === 137 ? await pdf.embedPng(input.cover) : await pdf.embedJpg(input.cover);
    const s = Math.max(W / image.width, H / image.height);
    cover.drawImage(image, { x: (W - image.width * s) / 2, y: (H - image.height * s) / 2, width: image.width * s, height: image.height * s });
  } else {
    // No designed cover (tests and previews): the same type layout on plain midnight.
    cover.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(13 / 255, 16 / 255, 40 / 255) });
    const t = coverType(W, H, 72, input.name, (txt, size) => font.widthOfTextAtSize(txt, size), (txt, size) => font.widthOfTextAtSize(txt, size) + size * 0.18 * Math.max(0, txt.length - 1));
    const ivory = rgb(244 / 255, 236 / 255, 221 / 255), coverGold = rgb(212 / 255, 168 / 255, 83 / 255);
    t.title.lines.forEach((l, i) => cover.drawText(l, { x: t.title.x - font.widthOfTextAtSize(l, t.title.size) / 2, y: H - t.title.y[i], size: t.title.size, font, color: ivory }));
    cover.drawRectangle({ x: t.rule.x, y: H - t.rule.y, width: t.rule.width, height: 0.6, color: coverGold });
    const sub = t.subtitle.lines[0]; const sw = font.widthOfTextAtSize(sub, t.subtitle.size) + t.subtitle.size * 0.18 * (sub.length - 1);
    let x = t.subtitle.x - sw / 2; for (const ch of sub) { cover.drawText(ch, { x, y: H - t.subtitle.y[0], size: t.subtitle.size, font, color: coverGold }); x += font.widthOfTextAtSize(ch, t.subtitle.size) + t.subtitle.size * 0.18; }
    const wm = t.wordmark.lines[0]; cover.drawText(wm, { x: t.wordmark.x - font.widthOfTextAtSize(wm, t.wordmark.size), y: H - t.wordmark.y[0], size: t.wordmark.size, font, color: coverGold });
  }
  // Title page built from the reader's own chart.
  const title = pdf.addPage([W, H]);
  lines(`${input.name || 'My'} AstroBook`, 24).forEach((line, i) => title.drawText(line, { x: M, y: H * 0.62 - i * 32, size: 24, font, color: ink }));
  if (input.bigThree) lines(input.bigThree, 12).forEach((line, i) => title.drawText(line, { x: M, y: H * 0.62 - 70 - i * 18, size: 12, font, color: ink }));
  lines(input.birthFacts, 9).forEach((line, i) => title.drawText(line, { x: M, y: H * 0.62 - 130 - i * 14, size: 9, font, color: muted }));
  if (version) title.drawText(`${version.name} edition`, { x: M, y: M + 18, size: 10, font, color: gold });
  title.drawText('Zodaci', { x: M, y: M, size: 10, font, color: muted });
  let page = pdf.addPage([W, H]), y = H - M;
  const newPage = () => { page = pdf.addPage([W, H]); y = H - M; };
  const write = (text: string, size = body, gap = 7) => { for (const line of lines(text, size)) { if (y < BOTTOM + size) newPage(); page.drawText(line, { x: M, y, size, font, color: ink }); y -= size * 1.55; } y -= gap; };
  write('About this manuscript', 22); write(input.birthFacts);
  write(`Edition: ${version ? `${version.name}${version.trim ? ` · ${version.trim}` : ''} · ${version.binding}` : input.edition}. Printer approval is required before production.`);
  write('Planet positions and calculations are distinct from traditional symbolic interpretation. Astrology does not establish personality, sexuality, diagnosis or future events. Personal examples are user reports, not independently verified facts.');
  write(`Page count is determined by the actual content${version ? ` (this version aims for ${version.pages[0]}–${version.pages[1]} pages)` : ''}. No blank filler or invented biography is added to meet a target; journal pages are listed in the contents.`);
  if (input.volumes?.length) write('Every chapter is written from your calculated chart. Readings you finished in Zodaci appear inside the volume they belong to; where a calculation needs a birth time you did not give, the chapter says so instead of guessing.');
  let sections: BookChapter[];
  if (input.volumes?.length) sections = input.volumes;
  else {
    const baseChapters = input.chapters.filter(c => !input.extras.some(e => e.toLowerCase() === c.title.toLowerCase()));
    const pick = (re: RegExp, not?: RegExp) => baseChapters.filter(c => re.test(c.title) && !(not?.test(c.title))).map(c => `## ${c.title}\n\n${c.content}`).join('\n\n');
    sections = [
      { title: BOOK_SECTIONS[0].title, content: input.chartFacts },
      { title: BOOK_SECTIONS[1].title, content: pick(/big three|mind|communication|growth|lesson/i) },
      { title: BOOK_SECTIONS[2].title, content: pick(/love|relationship|sex|attract/i) },
      { title: BOOK_SECTIONS[3].title, content: baseChapters.filter(c => !/big three|mind|communication|growth|lesson|love|relationship|sex|attract/i.test(c.title)).map(c => `## ${c.title}\n\n${c.content}`).join('\n\n') },
    ];
    for (const extra of input.extras) { const chapter = input.chapters.find(c => c.title.toLowerCase() === extra.toLowerCase()); if (!chapter) throw new Error(`Write the extra section “${extra}” in My Masterbook before adding it to print.`); sections.push({ title: extra, content: chapter.content }); }
    if (sections.some(s => !s.content.trim())) throw new Error('Your four foundations are incomplete. Finish the ready-made chapters in My Masterbook first.');
    sections.push(...(input.editionChapters ?? []));
  }
  const journal = version?.journal ?? 0;
  const entries = [...sections.map(s => s.title), ...(journal ? [`Journal · ${journal} page${journal > 1 ? 's' : ''}`] : [])];
  const isVolume = (i: number) => sections[i]?.draw === 'volume';
  const firstVolume = sections.findIndex(s => s.draw === 'volume');
  // Reserve as many contents pages as needed before laying out chapters.
  const perToc = Math.max(8, Math.floor((H - M * 2 - 56) / 36));
  const tocPages = Array.from({ length: Math.ceil(entries.length / perToc) }, () => pdf.addPage([W, H]));
  const starts: number[] = [];
  for (const section of sections) {
    newPage(); starts.push(pdf.getPageCount());
    if (section.draw === 'certificate') { drawCertificate(page, font, W, H, M, input.name, input.birthFacts, input.certificate); continue; }
    if (section.draw === 'volume') { drawVolume(page, font, W, H, M, section.title, section.content); continue; }
    write(section.title, 22, 18);
    if (section.draw === 'wheel' && input.chart) { const size = Math.min(W - M * 2, H - M * 2 - 120); drawWheel(page, font, input.chart, W / 2, y - size / 2, size / 2); y -= size + 24; }
    if (section.draw === 'grid' && input.chart) { const used = drawGrid(page, font, input.chart, M, y, W - M * 2); y -= used + 20; if (y < BOTTOM + 60) newPage(); }
    for (const paragraph of section.content.split(/\n\s*\n/)) {
      const isHeading = /^#{1,6}\s/.test(paragraph);
      const text = paragraph.replace(/^#{1,6}\s/gm, '').replace(/^\|?[-: ]+\|[-|: ]*$/gm, '');
      if (isHeading && y < 110) newPage();
      write(text, isHeading ? 14 : body, isHeading ? 10 : 7);
    }
  }
  if (journal) {
    for (let j = 0; j < journal; j++) {
      newPage(); if (j === 0) starts.push(pdf.getPageCount());
      page.drawText(j === 0 ? 'Journal' : `Journal · ${j + 1}`, { x: M, y: H - M, size: j === 0 ? 20 : 11, font, color: j === 0 ? ink : muted });
      const prompt = JOURNAL_PROMPTS[j % JOURNAL_PROMPTS.length];
      lines(prompt, 10).forEach((l, i) => page.drawText(l, { x: M, y: H - M - 28 - i * 14, size: 10, font, color: muted }));
      for (let ly = H - M - 70; ly > BOTTOM + 10; ly -= 24) page.drawLine({ start: { x: M, y: ly }, end: { x: W - M, y: ly }, thickness: .4, color: rgb(.75, .73, .8) });
    }
  }
  entries.forEach((s, i) => {
    const p = tocPages[Math.floor(i / perToc)]; if (i % perToc === 0) p.drawText('Contents', { x: M, y: H - M, size: 23, font, color: ink });
    const top = H - M - 56 - (i % perToc) * 36; const vol = isVolume(i); const indent = firstVolume >= 0 && !vol && i > firstVolume && i < sections.length ? 12 : 0;
    const titleLines = lines(s, vol ? 11.5 : 10.5, W - M * 2 - 35 - indent);
    titleLines.slice(0, 2).forEach((l, n) => p.drawText(l, { x: M + indent, y: top - n * 13, size: vol ? 11.5 : 10.5, font, color: vol ? gold : ink }));
    p.drawText(String(starts[i] ?? ''), { x: W - M - 25, y: top, size: 10.5, font, color: vol ? gold : ink });
  });
  pdf.getPages().forEach((p, i) => { if (i === 0) return; p.drawText(`Zodaci · AstroBook     ${i + 1}`, { x: M, y: Math.max(18, M * .55), size: 8, font, color: muted }); });
  const target = version ? version.pages[1] : input.edition === 'expanded' ? 400 : 250;
  return { bytes: await pdf.save(), pages: pdf.getPageCount(), target };
}

const JOURNAL_PROMPTS = [
  'Which line in this book felt most true today? Copy it here and write why.',
  'Where does your Moon sign show up in how you rest and recover?',
  'Describe a moment this month when you acted from your Rising sign before thinking.',
  'What does your Sun sign ask you to grow into this year?',
  'Write about a relationship that brought out your Venus.',
  'What is one thing you want to build slowly, the Saturn way?',
  'Which retrograde planet in your chart feels like a private strength?',
  'Your North Node points somewhere unfamiliar. What small step could you take toward it?',
  'Look back at your last birthday. What changed by this one?',
  'Draw or describe the sky you wish you had been born under — then compare it to your real one.',
];

const PLANET_GLYPH: Record<string, string> = { sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂', jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇', chiron: '⚷', northNode: '☊' };
function drawWheel(page: PDFPage, font: PDFFont, c: ChartResult, cx: number, cy: number, r: number) {
  const asc = c.asc ?? 0; // without a birth time, Aries 0° sits on the left
  const pos = (lon: number, rad: number) => { const a = Math.PI - (lon - asc) * Math.PI / 180; return { x: cx + Math.cos(a) * rad, y: cy + Math.sin(a) * rad }; };
  page.drawCircle({ x: cx, y: cy, size: r, borderColor: ink, borderWidth: 1 });
  page.drawCircle({ x: cx, y: cy, size: r * .82, borderColor: ink, borderWidth: .6 });
  page.drawCircle({ x: cx, y: cy, size: r * .3, borderColor: muted, borderWidth: .4 });
  for (let s = 0; s < 12; s++) {
    const a = pos(s * 30, r), b = pos(s * 30, r * .82);
    page.drawLine({ start: a, end: b, thickness: .6, color: ink });
    const g = pos(s * 30 + 15, r * .91); page.drawText(SIGN_GLYPH[s], { x: g.x - 5, y: g.y - 4, size: Math.max(8, r * .08), font, color: gold });
  }
  (c.cusps ?? []).forEach((cusp, i) => { const a = pos(cusp, r * .82), b = pos(cusp, r * .3); page.drawLine({ start: a, end: b, thickness: i % 3 === 0 ? .9 : .3, color: i % 3 === 0 ? ink : muted }); });
  const placed: number[] = [];
  c.bodies.filter(b => PLANET_GLYPH[b.key]).sort((a, b) => a.lon - b.lon).forEach(b => {
    let ring = r * .7; while (placed.some(p => Math.abs(p - b.lon) < 6 && ring > r * .42)) { ring -= r * .1; } placed.push(b.lon);
    const p = pos(b.lon, ring); page.drawText(PLANET_GLYPH[b.key], { x: p.x - 5, y: p.y - 4, size: Math.max(8, r * .075), font, color: ink });
    const t = pos(b.lon, r * .82); const t2 = pos(b.lon, r * .78); page.drawLine({ start: t, end: t2, thickness: .8, color: ink });
  });
  page.drawText(c.asc != null ? 'ASC' : 'Aries 0° (time unknown)', { x: cx - r - 2, y: cy + 6, size: 7, font, color: muted, rotate: degrees(0) });
}

const ASPECT_GLYPH: Record<string, string> = { conjunction: '☌', opposition: '☍', trine: '△', square: '□', sextile: '⚹', quincunx: '⚻' };
function drawGrid(page: PDFPage, font: PDFFont, c: ChartResult, x: number, top: number, width: number) {
  const keys = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  const names = keys.map(k => c.bodies.find(b => b.key === k)?.name ?? k);
  const cell = Math.min(width / (keys.length + 1), 30);
  keys.forEach((k, i) => {
    page.drawText(PLANET_GLYPH[k], { x: x + 4, y: top - (i + 1.7) * cell, size: cell * .45, font, color: ink });
    for (let j = 0; j < i; j++) {
      const cx = x + (j + 1) * cell, cy = top - (i + 1) * cell;
      page.drawRectangle({ x: cx, y: cy - cell, width: cell, height: cell, borderColor: muted, borderWidth: .3 });
      const hit = c.aspects.find(a => (a.a === names[i] && a.b === names[j]) || (a.a === names[j] && a.b === names[i]));
      if (hit) page.drawText(ASPECT_GLYPH[hit.type.toLowerCase()] ?? hit.symbol, { x: cx + cell * .3, y: cy - cell * .65, size: cell * .42, font, color: ink });
    }
    if (i < keys.length - 1) page.drawText(PLANET_GLYPH[k], { x: x + (i + 1.3) * cell, y: top - (i + 1.7) * cell, size: cell * .45, font, color: gold });
  });
  return (keys.length + 1) * cell;
}

/** A volume divider: "VOLUME III" spaced in gold, the volume title, a rule and its one-line scope, centred. */
function drawVolume(page: PDFPage, font: PDFFont, W: number, H: number, M: number, title: string, line: string) {
  const [label, name] = title.includes(' · ') ? title.split(' · ') : ['', title];
  const center = (t: string, yy: number, size: number, color = ink) => page.drawText(t, { x: (W - font.widthOfTextAtSize(t, size)) / 2, y: yy, size, font, color });
  const spaced = label.toUpperCase().split('').join(' ');
  if (spaced) center(spaced, H * .64, 10, gold);
  const size = Math.min(26, (W - M * 2) / 12);
  const nameLines = wrap(name, font, size, W - M * 2.4);
  nameLines.forEach((l, i) => center(l, H * .56 - i * size * 1.25, size, ink));
  const after = H * .56 - nameLines.length * size * 1.25 - 6;
  page.drawLine({ start: { x: W / 2 - 28, y: after }, end: { x: W / 2 + 28, y: after }, thickness: .8, color: gold });
  wrap(line, font, 10, W - M * 3).forEach((l, i) => center(l, after - 22 - i * 14, 10, muted));
}

function drawCertificate(page: PDFPage, font: PDFFont, W: number, H: number, M: number, name: string, facts: string, number?: string) {
  page.drawRectangle({ x: M / 2, y: M / 2, width: W - M, height: H - M, borderColor: gold, borderWidth: 1.5 });
  page.drawRectangle({ x: M / 2 + 6, y: M / 2 + 6, width: W - M - 12, height: H - M - 12, borderColor: gold, borderWidth: .5 });
  const center = (t: string, yy: number, size: number, color = ink) => page.drawText(t, { x: (W - font.widthOfTextAtSize(t, size)) / 2, y: yy, size, font, color });
  center('Collector’s Edition', H * .72, 26, ink);
  center('This AstroBook was calculated and bound for', H * .62, 11, muted);
  center(name || 'its reader', H * .56, 22, ink);
  wrap(facts, font, 9, W - M * 2).forEach((l, i) => center(l, H * .5 - i * 13, 9, muted));
  center(number ? `No. ${number}` : 'No. ________', H * .34, 14, gold);
  center('Zodaci · AstroBook Collector’s Linen', M + 12, 9, muted);
}

function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const out: string[] = [];
  for (const paragraph of text.split('\n')) {
    let current = '';
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      if (font.widthOfTextAtSize(word, size) > width) {
        if (current) { out.push(current); current = ''; }
        let piece = ''; for (const letter of word) { if (font.widthOfTextAtSize(piece + letter, size) > width) { out.push(piece); piece = ''; } piece += letter; } current = piece;
      } else if (current && font.widthOfTextAtSize(`${current} ${word}`, size) > width) { out.push(current); current = word; }
      else current = current ? `${current} ${word}` : word;
    }
    out.push(current);
  }
  return out;
}
