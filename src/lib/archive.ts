/**
 * The Archive: one owner-scoped ledger of everything an account has made or kept — readings (with their rewrite
 * version), created pages, audio and creations, books and comics, observations, bookmarks and workbook answers.
 * Pure mapping only; the page fetches each table under the account's own row-level security.
 */
export type ArchiveKind = 'reading' | 'page' | 'audio' | 'creation' | 'book' | 'comic' | 'observation' | 'bookmark' | 'workbook' | 'upload';
export interface ArchiveEntry { id: string; kind: ArchiveKind; title: string; detail: string; when: string; to: string; version?: number }

export const ARCHIVE_FILTERS: { id: 'all' | 'readings' | 'made' | 'products' | 'notes'; label: string; kinds: ArchiveKind[] }[] = [
  { id: 'all', label: 'Everything', kinds: [] },
  { id: 'readings', label: 'Readings & pages', kinds: ['reading', 'page'] },
  { id: 'made', label: 'Audio & creations', kinds: ['audio', 'creation', 'upload'] },
  { id: 'products', label: 'Books & comics', kinds: ['book', 'comic'] },
  { id: 'notes', label: 'Notes & bookmarks', kinds: ['observation', 'bookmark', 'workbook'] },
];
export const KIND_LABEL: Record<ArchiveKind, string> = {
  reading: 'Reading', page: 'Created page', audio: 'Podcast', creation: 'Creation', upload: 'Upload', book: 'AstroBook order', comic: 'AstroComic issue', observation: 'Observation', bookmark: 'Bookmark', workbook: 'Workbook answer',
};

type Gen = { id: string; page_key: string; section: string; title: string; status: string; version: number | null; updated_at: string };
type Custom = { id: string; title: string; status: string; updated_at: string };
type Lib = { id: string; kind: string; title: string; created_at: string };
type Order = { id: string; edition: string; format: string; status: string; created_at: string };
type Issue = { id: string; issue_number: number; title: string; status: string; issue_month: string };
type Obs = { id: string; observed_at: string; location: string; notes: string };
type Mark = { id: string; path: string; title: string; created_at: string };
type Work = { id: string; module: string; question: string; updated_at: string };
export interface ArchiveRaw { generated?: Gen[]; custom?: Custom[]; library?: Lib[]; orders?: Order[]; issues?: Issue[]; observations?: Obs[]; bookmarks?: Mark[]; workbook?: Work[] }

const clip = (s: string, n = 120) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);
const words = (s: string) => s.replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
/** Only internal paths are followed from saved bookmarks. */
const safePath = (p: string) => (p.startsWith('/') && !p.startsWith('//') ? p : '/my-astrobook');

function readingLink(g: Gen) {
  if (g.section === 'Topic Reading' && g.page_key.startsWith('topic-')) return `/my-readings/topic/${g.page_key.slice(6)}`;
  if (g.section === 'My Masterbook') return '/my-masterbook';
  return '/my-astrobook';
}

export function toArchiveEntries(raw: ArchiveRaw): ArchiveEntry[] {
  const out: ArchiveEntry[] = [];
  (raw.generated ?? []).filter(g => ['ready', 'preview'].includes(g.status)).forEach(g => out.push({
    id: `g-${g.id}`, kind: 'reading', title: g.title || words(g.page_key), when: g.updated_at, to: readingLink(g),
    detail: `${g.section}${g.status === 'preview' ? ' · free preview' : ''}`, version: g.version && g.version > 1 ? g.version : undefined,
  }));
  (raw.custom ?? []).filter(c => c.status !== 'failed').forEach(c => out.push({ id: `c-${c.id}`, kind: 'page', title: c.title, when: c.updated_at, to: `/p/${c.id}`, detail: c.status === 'generating' ? 'Still being written' : 'A page you asked for' }));
  (raw.library ?? []).forEach(l => {
    const kind: ArchiveKind = l.kind === 'podcast' ? 'audio' : l.kind === 'creation' ? 'creation' : 'upload';
    out.push({ id: `l-${l.id}`, kind, title: l.title, when: l.created_at, to: kind === 'audio' ? '/podcasts' : '/my-astrobook', detail: KIND_LABEL[kind] });
  });
  (raw.orders ?? []).forEach(o => out.push({ id: `o-${o.id}`, kind: 'book', title: `${words(o.edition)} AstroBook`, when: o.created_at, to: `/orders?order=${o.id}`, detail: `${o.format === 'digital' ? 'Digital PDF' : 'Printed book'} · ${o.status.replace(/_/g, ' ')}` }));
  (raw.issues ?? []).forEach(i => out.push({ id: `i-${i.id}`, kind: 'comic', title: `Issue #${i.issue_number}${i.title ? ` · ${i.title}` : ''}`, when: `${i.issue_month}T12:00:00Z`, to: '/my-comic', detail: `AstroComic · ${i.status.replace(/_/g, ' ')}` }));
  (raw.observations ?? []).forEach(o => out.push({ id: `ob-${o.id}`, kind: 'observation', title: clip(o.notes, 80) || 'Observation', when: o.observed_at, to: '/observation-log', detail: o.location ? `Logged at ${o.location}` : 'Observation Log' }));
  (raw.bookmarks ?? []).forEach(b => out.push({ id: `b-${b.id}`, kind: 'bookmark', title: b.title || b.path, when: b.created_at, to: safePath(b.path), detail: 'Bookmarked page' }));
  (raw.workbook ?? []).forEach(w => out.push({ id: `w-${w.id}`, kind: 'workbook', title: clip(w.question, 90) || words(w.module), when: w.updated_at, to: '/workbook', detail: `Workbook · ${words(w.module)}` }));
  return out.filter(e => !Number.isNaN(Date.parse(e.when))).sort((a, b) => Date.parse(b.when) - Date.parse(a.when));
}

/** Groups entries (already newest first) into calendar months, newest month first. */
export function groupByMonth(entries: ArchiveEntry[]): { key: string; label: string; entries: ArchiveEntry[] }[] {
  const groups = new Map<string, ArchiveEntry[]>();
  entries.forEach(e => { const d = new Date(e.when); const k = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`; groups.set(k, [...(groups.get(k) ?? []), e]); });
  return [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0])).map(([key, list]) => {
    const [y, m] = key.split('-').map(Number);
    return { key, label: new Date(Date.UTC(y, m - 1, 15)).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }), entries: list };
  });
}

export const filterEntries = (entries: ArchiveEntry[], filter: (typeof ARCHIVE_FILTERS)[number]['id']) => {
  const kinds = ARCHIVE_FILTERS.find(f => f.id === filter)?.kinds ?? [];
  return kinds.length ? entries.filter(e => kinds.includes(e.kind)) : entries;
};
