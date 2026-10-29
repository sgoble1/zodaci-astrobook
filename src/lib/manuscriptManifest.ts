import { contentDepth } from '@/lib/books';

export type SavedChapter = { title: string; content: string; section: string; status: string; updated_at: string };

/**
 * Only reviewed, current chart readings enter a purchased manuscript. None are required: the six volumes are written from
 * the chart itself, and finished readings (topic readings from Classic up) are woven in. Paid extra sections must exist.
 */
export function manuscriptManifest(rows: SavedChapter[], edition: string, extras: string[], birthSavedAt: string | null) {
  const fresh = rows.filter(r => r.status === 'ready' && r.content.trim() && (!birthSavedAt || Date.parse(r.updated_at) >= Date.parse(birthSavedAt)));
  const expanded = contentDepth(edition) === 'expanded';
  const wanted = new Set(extras.map(e => e.trim().toLowerCase()));
  const selected = fresh.filter(r => r.section === 'My Masterbook' || wanted.has(r.title.trim().toLowerCase()) || (expanded && r.section === 'Topic Reading'));
  const unique = [...new Map(selected.map(r => [r.title.trim().toLowerCase(), r])).values()];
  for (const title of wanted) if (!unique.some(r => r.title.trim().toLowerCase() === title)) throw new Error(`Finish the extra section “${title}” before composing.`);
  return unique.map(({ title, content }) => ({ title, content }));
}