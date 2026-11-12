import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Archive as ArchiveIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useLibrary';
import { usePageMeta } from '@/hooks/usePageMeta';
import { viewingSharedEdition } from '@/hooks/useAprilSpace';
import { PageHead } from '@/components/observatory/PageHead';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ARCHIVE_FILTERS, KIND_LABEL, filterEntries, groupByMonth, toArchiveEntries, type ArchiveEntry, type ArchiveRaw } from '@/lib/archive';

type FilterId = (typeof ARCHIVE_FILTERS)[number]['id'];
const when = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

/** The Cosmic Archive ledger: every record this account made or kept, newest first. Owner-only rows. */
export default function Archive() {
  usePageMeta('The Archive · Zodaci', 'Every reading, page, podcast, creation, book, comic, observation and bookmark you have kept, in one dated ledger.');
  const session = useSession(); const uid = session?.user.id;
  const [entries, setEntries] = useState<ArchiveEntry[] | null>(null);
  const [failed, setFailed] = useState<string[]>([]);
  const [filter, setFilter] = useState<FilterId>('all');

  const load = useCallback(async () => {
    if (!uid) { setEntries([]); return; }
    const [generated, custom, library, orders, issues, observations, bookmarks, workbook] = await Promise.all([
      supabase.from('generated_pages').select('id,page_key,section,title,status,version,updated_at').eq('owner_id', uid).order('updated_at', { ascending: false }).limit(300),
      supabase.from('custom_pages').select('id,title,status,updated_at').eq('owner_id', uid).order('updated_at', { ascending: false }).limit(200),
      supabase.from('library_items').select('id,kind,title,created_at').eq('owner_id', uid).order('created_at', { ascending: false }).limit(200),
      supabase.from('book_orders').select('id,edition,format,status,created_at').eq('user_id', uid).order('created_at', { ascending: false }).limit(50),
      supabase.from('comic_issues').select('id,issue_number,title,status,issue_month').eq('user_id', uid).order('issue_month', { ascending: false }).limit(50),
      supabase.from('observation_log').select('id,observed_at,location,notes').eq('owner_id', uid).order('observed_at', { ascending: false }).limit(200),
      supabase.from('bookmarks').select('id,path,title,created_at').eq('owner_id', uid).order('created_at', { ascending: false }).limit(200),
      supabase.from('workbook_entries').select('id,module,question,updated_at').eq('owner_id', uid).order('updated_at', { ascending: false }).limit(200),
    ]);
    // Never show one account's records to another after a switch mid-load.
    const current = await supabase.auth.getSession();
    if (current.data.session?.user.id !== uid) return;
    const named = { readings: generated, pages: custom, 'audio and creations': library, 'book orders': orders, 'comic issues': issues, observations, bookmarks, 'workbook answers': workbook };
    setFailed(Object.entries(named).filter(([, r]) => r.error).map(([k]) => k));
    const raw: ArchiveRaw = {
      generated: generated.data ?? [], custom: custom.data ?? [], library: library.data ?? [], orders: orders.data ?? [],
      issues: issues.data ?? [], observations: observations.data ?? [], bookmarks: bookmarks.data ?? [], workbook: workbook.data ?? [],
    };
    setEntries(toArchiveEntries(raw));
  }, [uid]);
  useEffect(() => { setEntries(null); setFailed([]); void load(); }, [load]);

  const shown = useMemo(() => groupByMonth(filterEntries(entries ?? [], filter)), [entries, filter]);
  const counts = useMemo(() => Object.fromEntries(ARCHIVE_FILTERS.map(f => [f.id, filterEntries(entries ?? [], f.id).length])), [entries]);
  const viewing = viewingSharedEdition();

  return (
    <article className="mx-auto max-w-5xl space-y-8">
      <PageHead eyebrow="Cosmic Archive" title="The Archive" script="Everything you have made and kept, by date." art="book"
        actions={<Button asChild variant="outline"><Link to="/reading-history">Reading history</Link></Button>}>
        Readings and their rewrites, pages you asked for, podcasts, creations, AstroBook orders, AstroComic issues, observations, bookmarks and workbook answers. Only you can see this ledger.
      </PageHead>
      {viewing && <p role="note" className="rounded-sm border border-[hsl(var(--brass)/0.5)] bg-[hsl(var(--brass)/0.08)] p-4 text-sm">You are viewing a shared edition, but the Archive always lists your own account’s records.</p>}
      <div role="group" aria-label="Filter the archive" className="flex flex-wrap gap-2">
        {ARCHIVE_FILTERS.map(f => <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)} className={`min-h-10 rounded-full border px-4 text-sm transition-colors duration-500 ${filter === f.id ? 'border-primary bg-primary/15 text-foreground' : 'border-border text-muted-foreground hover:bg-muted'}`}>{f.label}{entries ? ` · ${counts[f.id]}` : ''}</button>)}
      </div>
      {failed.length > 0 && <p role="alert" className="text-sm text-destructive">Some records could not load ({failed.join(', ')}). <button type="button" className="underline" onClick={() => void load()}>Try again</button></p>}
      {entries === null ? <div role="status" aria-label="Opening the archive" className="space-y-3"><Skeleton className="h-8 w-48" /><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>
        : shown.length === 0 ? (
          <div className="obs-paper space-y-3 p-8 text-center">
            <ArchiveIcon className="mx-auto h-8 w-8 text-primary" aria-hidden />
            <p className="font-display text-xl">{filter === 'all' ? 'The shelves are empty so far' : 'Nothing of this kind yet'}</p>
            <p className="text-sm text-muted-foreground">Open a reading, log an observation or bookmark a page, and it will be filed here with its date.</p>
            <div className="flex flex-wrap justify-center gap-2"><Button asChild size="sm"><Link to="/my-readings">Open my readings</Link></Button><Button asChild size="sm" variant="outline"><Link to="/observation-log">Log an observation</Link></Button></div>
          </div>
        ) : (
          <div className="space-y-10">
            {shown.map(g => (
              <section key={g.key} aria-labelledby={`m-${g.key}`} className="space-y-3">
                <h2 id={`m-${g.key}`} className="font-label !text-sm tracking-[0.18em] text-primary">{g.label} · {g.entries.length}</h2>
                <ol className="divide-y divide-border rounded-[var(--cut-card)] border border-border">
                  {g.entries.map(e => (
                    <li key={e.id}>
                      <Link to={e.to} className="group flex items-center gap-4 p-4 transition-colors duration-500 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <span className="w-14 shrink-0 font-label text-xs tracking-wide text-muted-foreground">{when(e.when)}</span>
                        <span className="min-w-0 flex-1"><span className="block truncate font-medium">{e.title}</span><span className="block text-xs text-muted-foreground">{KIND_LABEL[e.kind]} · {e.detail}{e.version ? ` · version ${e.version}` : ''}</span></span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-700 group-hover:translate-x-1" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        )}
    </article>
  );
}
