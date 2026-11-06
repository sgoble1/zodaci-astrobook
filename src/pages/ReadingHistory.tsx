import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { PageHead } from '@/components/observatory/PageHead';
import { ProgressCard } from '@/components/readings/ContinueReading';
import { useRecentReading } from '@/hooks/useReadingProgress';
import { isFinished } from '@/lib/readingProgress';

type Filter = 'all' | 'reading' | 'finished';
const FILTERS: { id: Filter; label: string }[] = [{ id: 'all', label: 'Everything' }, { id: 'reading', label: 'In progress' }, { id: 'finished', label: 'Finished' }];

/** Every reading this account has opened, newest first, with where they stopped. Owner-only rows. */
export default function ReadingHistory() {
  const { rows, error, remove, signedIn } = useRecentReading(200);
  const [filter, setFilter] = useState<Filter>('all');
  const shown = useMemo(() => (rows ?? []).filter(r => filter === 'all' || (filter === 'finished' ? isFinished(r.progress) : !isFinished(r.progress))), [rows, filter]);
  const finished = (rows ?? []).filter(r => isFinished(r.progress)).length;

  const forget = async (path: string, title: string) => {
    const ok = await remove(path);
    toast(ok ? { title: 'Removed from history', description: `${title} will start from the top next time.` } : { title: 'Not removed', description: 'Please try again.', variant: 'destructive' });
  };

  return (
    <article className="mx-auto max-w-5xl space-y-8">
      <PageHead eyebrow="Cosmic Archive · reading history" title="Your reading history" script="Every chapter you have opened." art="written">
        Zodaci remembers how far you got in each reading and the section where you stopped, on any device you sign in with. Only you can see this list.
      </PageHead>

      {!signedIn ? (
        <div className="obs-paper space-y-3 p-6"><p>Sign in to keep your place in every reading.</p><Button asChild><Link to="/auth?next=/reading-history">Sign in</Link></Button></div>
      ) : rows === null ? (
        <div className="grid gap-4 sm:grid-cols-2" aria-label="Loading your reading history">{[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-36 w-full" />)}</div>
      ) : error ? (
        <p role="alert" className="obs-paper p-5">Your reading history could not be loaded. Check your connection and refresh the page.</p>
      ) : !rows.length ? (
        <div className="obs-paper flex items-start gap-4 p-6"><BookOpen aria-hidden className="mt-1 h-6 w-6 shrink-0" /><div><p className="font-display text-xl">Nothing opened yet</p><p className="mt-1 text-sm text-muted-foreground">Open any reading and scroll a little. It will appear here with your place saved.</p><Button asChild className="mt-4"><Link to="/my-readings">Open my readings</Link></Button></div></div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{rows.length} opened · {finished} finished</p>
            <div role="group" aria-label="Show" className="flex gap-1.5">
              {FILTERS.map(f => <Button key={f.id} size="sm" variant={filter === f.id ? 'default' : 'outline'} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}</Button>)}
            </div>
          </div>
          {shown.length ? (
            <ul className="grid gap-4 sm:grid-cols-2">
              {shown.map(r => <li key={r.path}><ProgressCard row={r} className="h-full"><button type="button" onClick={() => void forget(r.path, r.title)} className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:underline" aria-label={`Remove ${r.title} from history`}><X aria-hidden className="h-3.5 w-3.5" />Remove</button></ProgressCard></li>)}
            </ul>
          ) : <p className="text-muted-foreground">Nothing in this list yet.</p>}
        </>
      )}
    </article>
  );
}
