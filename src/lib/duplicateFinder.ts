/**
 * Harvest & Fold helper: finds sentences repeated across chapters by normalized hash. It returns counts and short
 * fingerprints only (first words), never edits text, so folding stays a human decision and nothing valuable is lost.
 */
export const MIN_WORDS = 8;
const norm = (s: string) => s.toLowerCase().replace(/[*_#>`[\]()]/g, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
export function sentences(text: string): string[] {
  return text.replace(/\n+/g, ' ').split(/(?<=[.!?])\s+/).map(norm).filter(s => s.split(' ').length >= MIN_WORDS);
}
export type Repeat = { fingerprint: string; count: number; chapters: string[] };
/** Sentences that appear in two or more chapters, most repeated first. */
export function findRepeats(chapters: { id: string; text: string }[], limit = 50): Repeat[] {
  const seen = new Map<string, Set<string>>();
  for (const ch of chapters) for (const s of new Set(sentences(ch.text))) { if (!seen.has(s)) seen.set(s, new Set()); seen.get(s)!.add(ch.id); }
  return [...seen.entries()].filter(([, ids]) => ids.size > 1)
    .map(([s, ids]) => ({ fingerprint: s.split(' ').slice(0, 6).join(' ') + '…', count: ids.size, chapters: [...ids] }))
    .sort((a, b) => b.count - a.count).slice(0, limit);
}
