import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Loader2, ZoomIn, ZoomOut } from 'lucide-react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { Button } from '@/components/ui/button';
import { SitePasswordGate } from '@/components/common/SitePasswordGate';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ContentLockedError, loadProtectedFileUrl } from '@/lib/protectedContent';

const FILE = 'illustrated-october-2026.pdf';

/** Shane's illustrated October 2026 edition: a private PDF opened through a short-lived link, read page by page. */
export default function OfficialIllustrated() {
  usePageMeta('Shane · Zodaci Illustrated, October 2026', 'Private illustrated edition.');
  return <SitePasswordGate edition="shane"><IllustratedReader /></SitePasswordGate>;
}

function IllustratedReader() {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [err, setErr] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [rendering, setRendering] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setErr(''); setDoc(null);
    (async () => {
      try {
        const url = await loadProtectedFileUrl('shane', FILE);
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
        const worker = await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url');
        pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
        const d = await pdfjs.getDocument({ url }).promise;
        if (!cancelled) setDoc(d);
      } catch (e) {
        if (!cancelled) setErr(e instanceof ContentLockedError ? 'Unlock with Shane’s Masterbook password to open this edition.' : 'This edition is private to Shane, or it couldn’t be opened.');
      }
    })();
    return () => { cancelled = true; };
  }, [attempt]);

  useEffect(() => {
    if (!doc || !canvas.current) return;
    let task: { cancel: () => void; promise: Promise<unknown> } | null = null;
    let cancelled = false;
    setRendering(true);
    (async () => {
      const p = await doc.getPage(Math.min(page, doc.numPages));
      const base = p.getViewport({ scale: 1 });
      const fit = Math.min(1, ((wrap.current?.clientWidth ?? 800) - 8) / base.width);
      const dpr = window.devicePixelRatio || 1;
      const vp = p.getViewport({ scale: fit * scale * dpr });
      const c = canvas.current; if (!c || cancelled) return;
      c.width = vp.width; c.height = vp.height;
      c.style.width = `${vp.width / dpr}px`; c.style.height = `${vp.height / dpr}px`;
      task = p.render({ canvasContext: c.getContext('2d')!, viewport: vp, canvas: c } as never) as unknown as { cancel: () => void; promise: Promise<unknown> };
      await task.promise.catch(() => {});
      if (!cancelled) setRendering(false);
    })();
    return () => { cancelled = true; task?.cancel(); };
  }, [doc, page, scale]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!doc || (e.target as HTMLElement)?.closest('input, textarea, select')) return;
      if (e.key === 'ArrowRight') setPage(p => Math.min(p + 1, doc.numPages));
      if (e.key === 'ArrowLeft') setPage(p => Math.max(p - 1, 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [doc]);

  const pages = doc?.numPages ?? 0;
  return (
    <article className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-smallcaps text-xs text-gold">Official AstroBook · Shane</div>
          <h1 className="text-4xl sm:text-5xl">Zodaci Illustrated, October 2026</h1>
          <p className="mt-2 text-muted-foreground">Shane’s illustrated edition, read page by page. The file stays private; each visit opens it through a link that expires within minutes.</p>
        </div>
        {doc && (
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" aria-label="Zoom out" onClick={() => setScale(s => Math.max(0.6, +(s - 0.2).toFixed(1)))}><ZoomOut className="h-4 w-4" /></Button>
            <span className="w-12 text-center text-sm" aria-live="polite">{Math.round(scale * 100)}%</span>
            <Button size="icon" variant="outline" aria-label="Zoom in" onClick={() => setScale(s => Math.min(2.4, +(s + 0.2).toFixed(1)))}><ZoomIn className="h-4 w-4" /></Button>
          </div>
        )}
      </header>
      {err && <div role="alert" className="flex flex-wrap items-center gap-3 text-destructive">{err}<Button size="sm" variant="outline" onClick={() => setAttempt(a => a + 1)}>Try again</Button></div>}
      {!doc && !err && <p role="status" className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />Opening the illustrated edition…</p>}
      {doc && (
        <>
          <div ref={wrap} className="relative overflow-auto rounded-xl border border-border bg-card/40 p-1">
            <canvas ref={canvas} className="mx-auto block" role="img" aria-label={`Page ${page} of ${pages}`} />
            {rendering && <Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />}
          </div>
          <nav className="flex flex-wrap items-center justify-between gap-2" aria-label="Pages">
            <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}><ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />Previous</Button>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">Page
              <select value={page} onChange={e => setPage(+e.target.value)} className="rounded-md border border-input bg-background px-2 py-1 text-foreground">
                {Array.from({ length: pages }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
              </select>
              of {pages}
            </label>
            <Button variant="outline" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages}>Next<ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" /></Button>
          </nav>
        </>
      )}
      <p className="text-xs text-muted-foreground"><Link to="/official-astrobook" className="underline underline-offset-2">Back to the Official AstroBook</Link></p>
    </article>
  );
}
