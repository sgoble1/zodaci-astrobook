import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Download, Grid3X3, Loader2, RectangleVertical } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ComicPageView } from '@/components/comic/ComicPageView';
import { usePageMeta } from '@/hooks/usePageMeta';
import { computeChart } from '@/lib/astro';
import { buildComicIssue, monthLabel } from '@/lib/comic';
import { isOfficialEdition, officialChartInput, ownerLabel, useOfficialEditions } from '@/lib/officialEditions';
import cover from '@/assets/astrocomic-cover.jpg';
import skyPanel from '@/assets/astrocomic-sky-panel.jpg';
import letterPanel from '@/assets/astrocomic-letter-panel.jpg';
import fontUrl from '@/assets/fonts/manuscript.ttf?url';

// Shared Lantern & Ink scenes; every chart position and letter on the page is calculated for this edition.
const ART: Record<string, string> = { '1-0': cover, '2-0': skyPanel, '3-0': letterPanel };
/** Official issues are numbered from the first official month (October 2026). */
const FIRST_OFFICIAL = Date.UTC(2026, 9, 1);
const monthStart = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
const addMonths = (d: Date, n: number) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
export const officialIssueNumber = (month: Date) => Math.max(1, (month.getUTCFullYear() - 2026) * 12 + month.getUTCMonth() - 9 + 1);

/** The founder's own AstroComic: a full 24-page issue built from their chart and the chosen month's sky. */
export default function OfficialComic() {
  const { edition = '' } = useParams();
  const { rows, error, retry } = useOfficialEditions();
  const row = rows?.find(r => r.edition === edition);
  usePageMeta(row ? `${row.is_own ? 'Your' : `${row.display_name}’s`} Official AstroComic · Zodaci` : 'Official AstroComic · Zodaci', 'An AstroComic issue drawn from one chart.');
  const [month, setMonth] = useState(() => { const now = monthStart(new Date()); return now.getTime() < FIRST_OFFICIAL ? new Date(FIRST_OFFICIAL) : now; });
  const [page, setPage] = useState(1);
  const [view, setView] = useState<'page' | 'all'>('page');
  const [busy, setBusy] = useState(false);

  const issue = useMemo(() => {
    if (!row?.birth) return null;
    try {
      const chart = computeChart(officialChartInput(row.birth));
      return buildComicIssue(chart, { reader: row.display_name, month, issueNumber: officialIssueNumber(month) });
    } catch { return undefined; }
  }, [row, month]);
  const total = issue?.pages.length ?? 0;
  const go = useCallback((n: number) => setPage(Math.min(Math.max(1, n), total || 1)), [total]);
  useEffect(() => { setPage(1); }, [month, edition]);
  useEffect(() => {
    if (view !== 'page') return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input, textarea, select, [contenteditable]')) return;
      if (e.key === 'ArrowRight') setPage(p => Math.min(p + 1, total || 1));
      if (e.key === 'ArrowLeft') setPage(p => Math.max(p - 1, 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view, total]);

  const downloadProof = async () => {
    if (!issue) return;
    setBusy(true);
    try {
      const [{ composeComicPdf }, font] = await Promise.all([import('@/lib/comicPdf'), fetch(fontUrl).then(r => { if (!r.ok) throw new Error('font'); return r.arrayBuffer(); })]);
      const art = new Map<string, { bytes: Uint8Array; width: number; height: number }>();
      await Promise.all(Object.entries(ART).map(async ([key, src]) => {
        const blob = await (await fetch(src)).blob();
        const bmp = await createImageBitmap(blob);
        art.set(key, { bytes: new Uint8Array(await blob.arrayBuffer()), width: bmp.width, height: bmp.height });
      }));
      const { bytes } = await composeComicPdf({ issue, fontBytes: new Uint8Array(font), art, mode: 'proof' });
      const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" }));
      const a = document.createElement('a'); a.href = url; a.download = `astrocomic-${edition}-${issue.month}.pdf`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch { toast.error('The proof PDF couldn’t be made. Please try again.'); }
    finally { setBusy(false); }
  };

  if (!isOfficialEdition(edition)) return <Missing text="That AstroComic doesn’t exist." />;
  if (error) return <div role="alert" className="flex flex-wrap items-center gap-3 text-destructive">{error}<Button size="sm" variant="outline" onClick={retry}>Try again</Button></div>;
  if (!rows) return <p role="status" className="text-muted-foreground">Opening the AstroComic…</p>;
  if (!row) return <Missing text="This AstroComic belongs to a private edition." />;
  if (!row.birth) return (
    <Missing text={row.is_own ? 'Save your birth details first, then your AstroComic is drawn from your chart.' : `${row.display_name} hasn’t saved birth details yet.`}>
      {row.is_own && <Button asChild><Link to="/start">Add birth details</Link></Button>}
    </Missing>
  );
  if (issue === undefined) return <Missing text="This chart couldn’t be calculated from the saved birth details." />;
  if (!issue) return null;

  const current = issue.pages[page - 1];
  return (
    <article className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-smallcaps text-xs text-gold">Official AstroComic · {ownerLabel(row)}</div>
          <h1 className="text-4xl sm:text-5xl">{issue.title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Issue {issue.issueNumber} · {issue.monthLabel}. Sun in {issue.signs.sun}{issue.signs.moon ? `, Moon in ${issue.signs.moon}` : ''}{issue.signs.rising ? `, ${issue.signs.rising} rising` : ''}. Calculated from {row.birth_source.toLowerCase()}.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-md border border-border" role="group" aria-label="Issue month">
            <Button size="icon" variant="ghost" aria-label="Previous month" disabled={month.getTime() <= FIRST_OFFICIAL} onClick={() => setMonth(m => addMonths(m, -1))}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="min-w-32 px-2 text-center text-sm" aria-live="polite">{monthLabel(month)}</span>
            <Button size="icon" variant="ghost" aria-label="Next month" disabled={month.getTime() >= addMonths(monthStart(new Date()), 1).getTime()} onClick={() => setMonth(m => addMonths(m, 1))}><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setView(v => (v === 'page' ? 'all' : 'page'))} aria-pressed={view === 'all'}>
            {view === 'page' ? <><Grid3X3 className="mr-1.5 h-4 w-4" aria-hidden="true" />All pages</> : <><RectangleVertical className="mr-1.5 h-4 w-4" aria-hidden="true" />Page by page</>}
          </Button>
          <Button variant="outline" size="sm" onClick={downloadProof} disabled={busy}>{busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" /> : <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />}Proof PDF</Button>
        </div>
      </header>

      {view === 'page' ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_14rem]">
          <div className="mx-auto w-full max-w-xl space-y-3">
            <ComicPageView page={current} art={ART} />
            <nav className="flex items-center justify-between gap-2" aria-label="Pages">
              <Button variant="outline" onClick={() => go(page - 1)} disabled={page <= 1}><ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />Previous</Button>
              <span className="text-sm text-muted-foreground" aria-live="polite">Page {page} of {total} · {current.section}</span>
              <Button variant="outline" onClick={() => go(page + 1)} disabled={page >= total}>Next<ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" /></Button>
            </nav>
            <p className="text-center text-xs text-muted-foreground">Use the ← and → keys to turn pages.</p>
          </div>
          <ol className="grid max-h-[70vh] grid-cols-4 gap-2 overflow-y-auto pr-1 lg:grid-cols-2" aria-label="Jump to a page">
            {issue.pages.map(p => (
              <li key={p.n}><button type="button" onClick={() => go(p.n)} aria-current={p.n === page ? 'page' : undefined} aria-label={`Page ${p.n}: ${p.title}`}
                className={`block w-full rounded-sm text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${p.n === page ? 'ring-2 ring-gold' : 'opacity-80 hover:opacity-100'}`}>
                <ComicPageView page={p} compact art={ART} />
              </button></li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">{issue.pages.map(p => <button key={p.n} type="button" onClick={() => { setPage(p.n); setView('page'); }} className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Open page ${p.n}: ${p.title}`}><ComicPageView page={p} compact art={ART} /></button>)}</div>
      )}

      <p className="text-xs text-muted-foreground">Scenes marked in italics are the artist’s directions for panels not yet drawn. Positions, dates and the letter are calculated from the chart; nothing about the reader is invented. <Link to="/official-astrobook" className="underline underline-offset-2">Back to the Official AstroBook</Link></p>
    </article>
  );
}

function Missing({ text, children }: { text: string; children?: ReactNode }) {
  return (
    <div className="mx-auto max-w-xl space-y-4 py-12 text-center">
      <h1 className="font-display text-3xl">Official AstroComic</h1>
      <p className="text-muted-foreground">{text}</p>
      <div className="flex flex-wrap justify-center gap-2">{children}<Button asChild variant="outline"><Link to="/official-astrobook">Back to the Official AstroBook</Link></Button></div>
    </div>
  );
}
