import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditionPages } from '@/components/book/EditionPages';
import { NoEditionAccess } from '@/components/common/PrivateEditionGate';
import { usePageMeta } from '@/hooks/usePageMeta';
import type { EditionShowcase } from '@/content/sampleEdition';
import { ContentLockedError, loadProtectedFileUrl, loadProtectedJson, type Area } from '@/lib/protectedContent';

const AREA: Record<string, Area> = { april: 'masterbook', shane: 'shane', zac: 'zac' };
const OWNER: Record<string, string> = { april: 'April', shane: 'Shane', zac: 'Zac' };

/** One-time illustrated showcase of a founder edition. Text and plates live in private storage; the server checks access. */
export default function OfficialShowcase() {
  const { edition = '' } = useParams();
  const area = AREA[edition];
  usePageMeta(`${OWNER[edition] ?? 'Private'} · Illustrated showcase · Zodaci`, 'Private illustrated edition.');
  const [data, setData] = useState<EditionShowcase | null>(null);
  const [images, setImages] = useState<Record<string, string>>({});
  const [denied, setDenied] = useState(false);
  const [err, setErr] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!area) return;
    let cancelled = false;
    setData(null); setDenied(false); setErr('');
    (async () => {
      try {
        const d = await loadProtectedJson<EditionShowcase>(area, 'showcase.json');
        const urls = await Promise.all(d.pages.map(p => loadProtectedFileUrl(area, p.image).then(u => [p.image, u] as const)));
        if (cancelled) return;
        setImages(Object.fromEntries(urls)); setData(d);
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ContentLockedError) setDenied(true);
        else setErr('The illustrated pages couldn’t be opened. Check your connection and try again.');
      }
    })();
    return () => { cancelled = true; };
  }, [area, attempt]);

  if (!area) return <p className="text-muted-foreground">This edition doesn’t exist. <Link to="/official-astrobook" className="underline">Back to the Official AstroBook</Link></p>;
  return (
    <article className="space-y-10">
      <header className="max-w-3xl">
        <p className="font-smallcaps text-xs text-gold">Official AstroBook · Illustrated showcase</p>
        <h1 className="mt-1 text-4xl sm:text-5xl">{data?.title ?? OWNER[edition]}</h1>
        <p className="mt-1 font-display text-xl text-muted-foreground">{data?.subtitle ?? 'Your exact placement in print'}</p>
        {data && <p className="mt-3 text-sm text-muted-foreground">{data.note} Four pages are fully illustrated; the next chapters are shown as script. Facts are calculated positions; the paragraphs are interpretation.</p>}
      </header>
      {denied && <NoEditionAccess owner={OWNER[edition]} onRetry={() => setAttempt(a => a + 1)} />}
      {err && <div role="alert" className="flex flex-wrap items-center gap-3 text-destructive">{err}<Button size="sm" variant="outline" onClick={() => setAttempt(a => a + 1)}>Try again</Button></div>}
      {!data && !denied && !err && <p role="status" className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />Opening the illustrated pages…</p>}
      {data && (
        <>
          <EditionPages pages={data.pages} images={images} />
          {!!data.script?.length && (
            <section aria-labelledby="sc-h" className="space-y-4">
              <h2 id="sc-h" className="text-3xl">Coming next in the book</h2>
              <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.script.map(s => <li key={s.n} className="vellum p-5"><p className="font-smallcaps text-xs text-gold">Page {s.n} · {s.placement}</p><h3 className="mt-1 text-xl">{s.title}</h3><p className="mt-2 text-sm text-muted-foreground">{s.summary}</p></li>)}</ol>
            </section>
          )}
        </>
      )}
      <p className="text-xs text-muted-foreground"><Link to="/official-astrobook" className="underline underline-offset-2">Back to the Official AstroBook</Link></p>
    </article>
  );
}
