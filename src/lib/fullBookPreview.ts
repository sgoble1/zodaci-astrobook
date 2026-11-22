import { bookPreview, plainParagraphs, type BookPreviewInput } from './personalPreview';
import { buildVolumes, hasWorldSystems } from './bookVolumes';
import { deterministicPlanet } from './deterministicReadings';
import { planetPreview, risingPreview, untimedPreview } from './previewNarrative';
import { compassFor } from './readersCompass';
import type { BookFace, TextFace } from './bookLeaves';
import { chapterDepth, planetaryDepth } from './chapterDepth';
import type { EditorialPlanet } from '@/content/placements/blocks';

/** Balanced sentence-boundary pages; never add blank or repeated prose to meet the minimum. */
export function paginateChapter(paragraphs: string[], capacity = 230): string[][] {
  const sentences = paragraphs.flatMap((p, paragraph) => p.split(/(?<=[.!?])\s+(?=[A-Z“"])/).filter(Boolean).map(text => ({ text, paragraph, words: text.split(/\s+/).filter(Boolean).length })));
  let remaining = sentences.reduce((n, s) => n + s.words, 0);
  const count = Math.max(5, Math.ceil(remaining / capacity));
  const pages: string[][] = [];
  let cursor = 0;
  for (let page = 0; page < count; page++) {
    const target = remaining / (count - page);
    const body: string[] = []; let words = 0; let paragraph = -1;
    while (cursor < sentences.length) {
      const sentence = sentences[cursor];
      if (!sentence) break;
      if (words && count - page > 1 && Math.abs(words - target) <= Math.abs(words + sentence.words - target)) break;
      if (paragraph === sentence.paragraph) body[body.length - 1] += ` ${sentence.text}`;
      else { body.push(sentence.text); paragraph = sentence.paragraph; }
      words += sentence.words; cursor++;
    }
    remaining -= words;
    if (body.length) pages.push(body);
  }
  return pages;
}

const VOLUME_NAMES: Record<string, string> = {
  I: 'Your starting point', II: 'The places life happens', III: 'How the different parts of you work together',
  IV: 'Growth, sensitivity and familiar responses', V: 'Different ways of reading the same birth moment', VI: 'Your changing sky',
};
const PLANET_TITLES: Record<string, string> = {
  sun: 'What gives you a sense of purpose', moon: 'What helps you feel settled', mercury: 'How you think and find your words',
  venus: 'What you value and how you connect', mars: 'How you act and handle friction', jupiter: 'How you make room to grow',
  saturn: 'What you build patiently', uranus: 'Where you need a different approach', neptune: 'Imagination, hope and clear boundaries', pluto: 'Change, control and letting go',
};

/** Complete calculated chapters, not a fixed-length excerpt. No private archive or AI call. */
export function fullBookPreview(input: BookPreviewInput) {
  const excerpt = bookPreview({ ...input, proseMode: 'complete' });
  const tone = input.tone ?? 'oracle';
  const timed = Boolean(input.chart.input.time) && input.chart.asc != null;
  const chart = timed ? input.chart : { ...input.chart, asc: null, mc: null, cusps: null,
    bodies: input.chart.bodies.map(b => ({ ...b, house: null })),
    aspects: input.chart.aspects.filter(a => !['Moon', 'Ascendant', 'Midheaven'].includes(a.a) && !['Moon', 'Ascendant', 'Midheaven'].includes(a.b)) };
  const front = excerpt.faces.filter(f => !('page' in f) && ['endpaper', 'title', 'blank'].includes(f.kind));
  // Keep the measured opening and the physical verso plate/ruler pairing.
  const content: BookFace[] = excerpt.faces.filter(f => 'page' in f && f.page != null && f.page > 1 && f.page <= 7);
  const contents: { title: string; page: number }[] = [{ title: 'A letter and your calculation record', page: 2 }];
  const append = (volume: string, title: string, paragraphs: string[], placement = '', planet?: EditorialPlanet) => {
    if (!paragraphs.length) return;
    contents.push({ title, page: content.length + 2 });
    const definitions = compassFor(paragraphs.join(' ')).slice(0, 4).map(g => `${g.term}: ${g.plain}`).join(' ');
    const introduction = tone === 'professional' ? 'Reference terms for this chapter: ' : tone === 'educational' ? 'Before reading the connections, here are the terms in ordinary language: ' : 'A few words to make this chapter easier to read: ';
    const deeper = planet ? planetaryDepth(chart, planet, tone) : chapterDepth(chart, volume, title, tone, paragraphs);
    const pages = paginateChapter([...(definitions ? [introduction + definitions] : []), ...paragraphs, ...deeper]);
    const chapterId = `chapter-${contents.length}`;
    pages.forEach((body, i) => content.push({ kind: 'text', eyebrow: `Volume ${volume} · ${VOLUME_NAMES[volume]}`, title, placement: i ? '' : placement, facts: [], body, chapterId, chapterPage: i + 1, chapterPages: pages.length }));
  };
  const chapters = buildVolumes({ edition: input.edition ?? 'classic', chart, name: input.name, saved: [], today: input.asOf });
  let current = 'I';
  const groups: Record<string, string[]> = { I: [], II: [], III: [], IV: [], V: [], VI: [] };
  for (const ch of chapters) {
    const volume = ch.title.match(/^Volume (I{1,3}|IV|V|VI) ·/);
    if (volume) { current = volume[1]; continue; }
    if (ch.draw || /Opening Letter|Reader’s Compass|Birth-Moment Verse|Your Big Three|Your Planets, One by One/.test(ch.title)) continue;
    // Lunar phase/mansion and house-based timing cannot be asserted for a date-only birth.
    if (!timed && /Moon Phase|Twelve Houses|Rulership|Profection|Across Traditions/.test(ch.title)) continue;
    groups[current].push(...plainParagraphs(ch.content).filter(p => !p.startsWith('• ')));
  }
  append('I', 'Your sky as a whole', groups.I);
  append('I', timed ? 'How you meet the world' : 'A meaningful chart without a recorded birth time', [...risingPreview(chart, tone).body, ...untimedPreview(chart, 'geometry', tone).body]);
  append('II', timed ? 'Home, work, relationships and the links between them' : 'What your planetary relationships can tell you', timed ? groups.II : [...untimedPreview(chart, 'planets', tone).body, ...untimedPreview(chart, 'geometry', tone).body]);
  for (const key of Object.keys(PLANET_TITLES)) {
    const narrative = planetPreview(chart, key, tone);
    append('III', PLANET_TITLES[key], [...narrative.body, ...plainParagraphs(deterministicPlanet(chart, key, tone)), ...(narrative.reflection ? [narrative.reflection] : [])], narrative.placement, key as EditorialPlanet);
  }
  append('III', 'Cooperation, tension and the larger pattern', groups.III);
  append('IV', 'Growth without a verdict about your past', groups.IV);
  if (hasWorldSystems(input.edition ?? 'classic')) {
    const reference = excerpt.faces.filter((f): f is TextFace => f.kind === 'text' && f.eyebrow.startsWith('Volume V'));
    append('V', 'Different calendars, clearly separated', timed ? groups.V : reference.flatMap(f => f.body));
  }
  const timingReference = excerpt.faces.filter((f): f is TextFace => f.kind === 'text' && f.eyebrow.startsWith('Volume VI'));
  append('VI', 'Returning themes and the sky ahead', [...timingReference.flatMap(f => f.body), ...groups.VI]);
  const end = excerpt.faces.filter((f): f is TextFace => f.kind === 'text' && ['Reader’s Compass', 'Colophon'].includes(f.eyebrow));
  for (const face of end) { contents.push({ title: face.title, page: content.length + 2 }); content.push(face); }
  // Contents can span several faces; page offsets are adjusted together, never guessed in copy.
  const tocPages = Math.max(1, Math.ceil(contents.length / 8));
  const toc: BookFace[] = Array.from({ length: tocPages }, (_, i) => ({ kind: 'list', eyebrow: 'Table of Contents', heading: i ? 'Chapters · continued' : 'Your chapters', items: contents.slice(i * 8, i * 8 + 8).map(c => `${c.title} · ${c.page + tocPages - 1}`) }));
  // An odd contents count preserves the first plate on an even verso.
  if (tocPages % 2 === 0) toc.push({ kind: 'blank' });
  const tocOffset = toc.length - 1;
  for (const face of toc) if (face.kind === 'list') face.items = face.items.map(item => item.replace(/ · (\d+)$/, (_, n) => ` · ${Number(n) + tocOffset - (tocPages - 1)}`));
  const numbered = [...toc, ...content].map((f, i) => ({ ...f, page: i + 1 }));
  return { ...excerpt, chapterCount: contents.length, pageCount: numbered.length, faces: [...front, ...numbered] as BookFace[] };
}