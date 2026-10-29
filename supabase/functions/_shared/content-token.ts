// Private edition helpers. Editions open by account only (owner or shares); there are no passwords or unlock tokens.
export type Edition = 'april' | 'shane' | 'zac';
export const EDITIONS: Edition[] = ['april', 'shane', 'zac'];
/** Which edition each protected-content area belongs to. */
export const AREA_EDITION: Record<string, Edition> = { masterbook: 'april', library: 'april', shane: 'shane', zac: 'zac' };
/** Areas whose chapters can be shared one at a time (April's source library is shared only as part of her whole edition). */
export const CHAPTER_SHARE_AREAS = ['masterbook', 'shane', 'zac'];

/** The chapter id a file name refers to ("abc.md" → "abc"). */
export const chapterIdOf = (file: string) => file.replace(/\.(md|json|pdf)$/i, '');

/** Replaces generic chapter names ("Chapter 12", "Part 3") with the first section heading, so menus describe content. */
export function describeEntry<T extends { title: string; sections?: string[] }>(e: T): T {
  const generic = /^(chapter|part|section|volume|book)\s*[\dIVXLC]+\.?$/i.test(e.title.trim()) || /^[\dIVXLC]+\.?$/.test(e.title.trim());
  const first = e.sections?.find(s => s.trim().length > 3);
  return generic && first ? { ...e, title: first.replace(/^[\d.]+\s*/, '') } : e;
}
