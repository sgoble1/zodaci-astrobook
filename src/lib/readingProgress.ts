/** One saved reading position, owner-only. */
export type SavedProgress = { path: string; title: string; section_id: string | null; section_title: string | null; progress: number; last_read_at: string };

/** Progress kept is the furthest point reached, so scrolling back up to re-read never un-finishes a chapter. */
export const furthest = (saved: number, current: number) => Math.max(0, Math.min(100, Math.round(Math.max(saved, current))));

/** A chapter counts as finished once the reader reached its last screen. */
export const isFinished = (progress: number) => progress >= 98;

/**
 * Whether a new position is worth writing: a different section, five or more points further, or the end. Keeps
 * writes to a handful per chapter instead of one per scroll event.
 */
export function worthSaving(last: { progress: number; section: string }, next: { progress: number; section: string }) {
  if (next.section !== last.section) return true;
  if (next.progress === last.progress) return false;
  return Math.abs(next.progress - last.progress) >= 5 || isFinished(next.progress);
}

/**
 * Section to offer "Continue from …" for: only when the reader stopped past the first section, the chapter still
 * has that section, and they did not arrive on a specific #section link.
 */
export function continueTarget(saved: Pick<SavedProgress, 'section_id' | 'progress'> | null, sections: { id: string; title: string }[], hash: string) {
  if (!saved?.section_id || hash || isFinished(saved.progress) || sections.length < 2) return null;
  if (saved.section_id === sections[0].id) return null;
  return sections.find(s => s.id === saved.section_id) ?? null;
}

/** Founder chapter paths in the sidebar → how far this reader got (0–100), from their own saved rows. */
export function readMarks(rows: Pick<SavedProgress, 'path' | 'progress'>[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const r of rows) m.set(r.path.split('#')[0], Math.max(m.get(r.path) ?? 0, r.progress));
  return m;
}
