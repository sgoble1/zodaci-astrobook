import { computeChart, type ChartInput, type ChartResult } from '@/lib/astro';
import { toChartInput, type MyBirth } from '@/lib/myBirth';
import { LEAD_COVER } from '@/content/coverSamples';
import { SAMPLE_ISSUE } from '@/content/sampleComic';
import { birthLineOf, comicInterior, toLeaves, type BookFace } from '@/lib/bookLeaves';
import { bookPreview } from '@/lib/personalPreview';
import { castFull, comicPreviewArt } from '@/content/castArt';
import { buildComicIssue } from '@/lib/comic';
import { personalCoverArtwork } from '@/content/personalCoverArtwork';
import { buildComicPreview, previewName } from '@/lib/comicNarrative';
import type { ComicIssue } from '@/lib/comic';
import { versionOf, type Edition } from '@/lib/books';
import type { Tone } from '@/lib/perception';
import { resolveBookArtwork } from '@/content/bookArtwork';

export interface BookPreviewOptions {
  edition?: Edition; editionLabel?: string; coverSrc?: string; coverChoice?: string;
  coverName?: string; dedication?: string; tone?: Tone;
}

export type BookLeaf = { front: BookFace; back: BookFace };

/**
 * One fictional sample reader everywhere: the Collector cover reader (Rosalind Vance). Her chart is calculated once
 * from the birth details printed on that cover and reused by the sample book, comic digest, demo reading and chart.
 */
let cached: ChartResult | null = null;
export const SAMPLE_READER = LEAD_COVER;
export const SAMPLE_READER_INPUT: ChartInput = { ...LEAD_COVER.birth, placeSource: 'geocoded', houseSystem: 'placidus' } as ChartInput;
export const sampleReaderChart = () => (cached ??= computeChart(SAMPLE_READER_INPUT));

const BOOK_BACK: Extract<BookFace, { kind: 'back' }> = { kind: 'back', lines: ['Zodaci AstroBook', 'Written from one birth chart, in six volumes', 'Astrological insights provided for entertainment and self-reflection purposes only', 'zodaci.com'], imprint: 'Zodaci · Astral Research Authority', seal: 'ORBIT', barcode: true };

/** The fictional Collector cover stays public; its 28-page interior uses the same composer as personal previews. */
export function sampleBookLeaves(options?: BookPreviewOptions): BookLeaf[] {
  if (options) return personalBookLeaves({ name: LEAD_COVER.name, birthLine: LEAD_COVER.printed.born, chart: sampleReaderChart(), ...options });
  const art = resolveBookArtwork(sampleReaderChart());
  const { faces } = bookPreview({ name: LEAD_COVER.name, birthLine: LEAD_COVER.printed.born, chart: sampleReaderChart(), editionLabel: 'Collector Preview', artFor: key => key === art.ruler ? art.plate : castFull(key) });
  return toLeaves(
    { kind: 'cover', src: LEAD_COVER.src, alt: LEAD_COVER.alt },
    faces,
    { ...BOOK_BACK, art: art.back },
  );
}

/**
 * The cover and 28 numbered interior pages of a member's own AstroBook, built from their saved birth details with
 * the same chapters the printed book opens with (buildVolumes). Houses and angles are left out when the time is unknown.
 */
export function memberBookLeaves(birth: MyBirth, options?: string | BookPreviewOptions): BookLeaf[] {
  const name = birth.name?.trim() || 'Your AstroBook';
  return personalBookLeaves({ name, birthLine: birthLineOf(birth.date, birth.time, birth.placeLabel), chart: computeChart(toChartInput(birth)), ...(typeof options === 'string' ? { coverSrc: options } : options) });
}

/** The same 28-page interior for any authorized chart (a founder's edition, or the member's own). */
export function personalBookLeaves({ name, birthLine, chart, coverSrc, coverChoice, coverName, dedication, tone, edition = 'classic', editionLabel }: { name: string; birthLine: string; chart: ChartResult } & BookPreviewOptions): BookLeaf[] {
  const label = editionLabel ?? versionOf(edition)?.name ?? 'Classic Edition';
  const art = resolveBookArtwork(chart);
  const { cover, faces } = bookPreview({ name: coverName === undefined ? previewName(name) : coverName.trim() || 'Your Name', birthLine, chart, edition, editionLabel: label, dedication, tone, artFor: () => art.plate });
  const customized = coverChoice !== undefined || coverName !== undefined || edition !== 'classic';
  const front: BookFace = coverSrc && !customized ? { kind: 'cover', src: coverSrc, alt: `AstroBook cover printed with ${cover.name}` } : { kind: 'jacket', cover, art: coverSrc || personalCoverArtwork(name, chart), edition: label, choice: coverChoice, composed: !!coverSrc, finish: edition === 'linen' ? 'cloth' : edition === 'signature' ? 'leatherette' : 'paper' };
  return toLeaves(front, faces, { ...BOOK_BACK, art: coverSrc || art.back, choice: coverChoice });
}

/** The sample AstroComic digest for the same reader. */
export function sampleComicLeaves(): BookLeaf[] {
  const issue = buildComicPreview(sampleReaderChart(), { reader: LEAD_COVER.name, month: new Date(Date.UTC(2026, 11, 1)), issueNumber: 1 });
  const art = comicPreviewArt(issue);
  // Public example keeps its own fictional reader and garden artwork, never a private chart or private birth line.
  art['1-0'] = SAMPLE_ISSUE.cover;
  issue.pages.slice(1).forEach((p, at) => p.panels.forEach((_, i) => { art[`${p.n}-${i}`] = SAMPLE_ISSUE.pages[at % SAMPLE_ISSUE.pages.length].art; }));
  issue.pages[0] = { ...issue.pages[0], title: SAMPLE_ISSUE.title, panels: [{ ...issue.pages[0].panels[0], caption: 'Rosalind Vance · Fictional sample' }] };
  return comicIssueLeaves(issue, art);
}

/** Exactly 24 faces including covers; complete panels and dialogue survive page turns and exports. */
export function comicIssueLeaves(issue: ComicIssue, art = comicPreviewArt(issue)): BookLeaf[] {
  const faces: BookFace[] = issue.pages.map(sheet => ({ kind: 'comic-page', sheet, art, page: sheet.n }));
  const leaves: BookLeaf[] = [];
  for (let i = 0; i < faces.length; i += 2) leaves.push({ front: faces[i], back: faces[i + 1] });
  return leaves;
}

/**
 * The cover and first pages of a member's own Issue #1, scripted in the browser from their saved chart with this
 * month's transits (buildComicIssue, no AI). The cover shows the month's lead planet character; panels show the planet
 * characters the script names. Nothing is saved.
 */
export function memberComicLeaves(birth: MyBirth, upTo = 24): BookLeaf[] {
  const natal = computeChart(toChartInput(birth));
  const reader = birth.name?.trim() || 'You';
  const issue = buildComicPreview(natal, { reader, month: new Date(), issueNumber: 1 });
  return comicIssueLeaves(issue, comicPreviewArt(issue, upTo));
}
