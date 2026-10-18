export type SavedChapter = { title: string; content: string; section: string; status: string; updated_at: string };

/** Only reviewed, current chart readings enter a purchased manuscript. */
export function manuscriptManifest(rows: SavedChapter[], edition: string, extras: string[], birthSavedAt: string | null) {
  const fresh = rows.filter(r => r.status === 'ready' && r.content.trim() && (!birthSavedAt || Date.parse(r.updated_at) >= Date.parse(birthSavedAt)));
  const wanted = new Set(extras.map(e => e.trim().toLowerCase()));
  const selected = fresh.filter(r => r.section === 'My Masterbook' || wanted.has(r.title.trim().toLowerCase()) || (edition === 'expanded' && r.section === 'Topic Reading'));
  const unique = [...new Map(selected.map(r => [r.title.trim().toLowerCase(), r])).values()];
  if (edition === 'expanded' && !unique.some(r => r.section === 'Topic Reading' && !wanted.has(r.title.trim().toLowerCase()))) {
    throw new Error('Expanded needs additional finished topic readings. Open the themes you want included, then compose again.');
  }
  for (const title of wanted) if (!unique.some(r => r.title.trim().toLowerCase() === title)) throw new Error(`Finish the extra section “${title}” before composing.`);
  return unique.map(({ title, content }) => ({ title, content }));
}