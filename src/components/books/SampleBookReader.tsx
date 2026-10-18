import { useEffect, useRef, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { Button } from '@/components/ui/button';
import { composeSampleBook } from '@/lib/sampleBook';

/** Inline reader for the public sample AstroBook PDF, rendered page by page with pdf.js. */
function Reader({ blob, maxPages }: { blob: Blob; maxPages?: number }) {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1.05);
  const [err, setErr] = useState('');
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
        const worker = await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url');
        pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
        const d = await pdfjs.getDocument({ data: await blob.arrayBuffer() }).promise;
        if (!cancelled) setDoc(d);
      } catch { if (!cancelled) setErr('The sample book could not be opened in this browser.'); }
    })();
    return () => { cancelled = true; };
  }, [blob]);

  useEffect(() => {
    if (!doc || !canvas.current) return;
    let task: { cancel: () => void } | null = null;
    (async () => {
      const p = await doc.getPage(Math.min(page, doc.numPages));
      const vp = p.getViewport({ scale: scale * (window.devicePixelRatio || 1) });
      const c = canvas.current!; c.width = vp.width; c.height = vp.height;
      c.style.width = `${vp.width / (window.devicePixelRatio || 1)}px`;
      const r = p.render({ canvasContext: c.getContext('2d')!, viewport: vp, canvas: c } as Parameters<typeof p.render>[0]);
      task = r; await r.promise.catch(() => {});
    })();
    return () => task?.cancel();
  }, [doc, page, scale]);

  const total = Math.min(doc?.numPages ?? 1, maxPages ?? Number.MAX_SAFE_INTEGER);
  if (err) return <p role="alert" className="text-destructive text-sm">{err}</p>;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded border border-border bg-card p-2">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 rounded hover:bg-muted disabled:opacity-40" aria-label="Previous page"><ChevronLeft className="w-4 h-4" /></button>
        <span className="text-sm">Page <b>{page}</b> of {maxPages ? `${total} shown` : total ?? '…'}</span>
        <button onClick={() => setPage(p => Math.min(total, p + 1))} disabled={!!doc && page >= total} className="p-1.5 rounded hover:bg-muted disabled:opacity-40" aria-label="Next page"><ChevronRight className="w-4 h-4" /></button>
        <span className="mx-2 h-5 w-px bg-border" />
        <button onClick={() => setScale(s => Math.max(0.6, s - 0.2))} className="p-1.5 rounded hover:bg-muted" aria-label="Zoom out"><ZoomOut className="w-4 h-4" /></button>
        <span className="text-xs w-10 text-center">{Math.round(scale * 100)}%</span>
        <button onClick={() => setScale(s => Math.min(2.5, s + 0.2))} className="p-1.5 rounded hover:bg-muted" aria-label="Zoom in"><ZoomIn className="w-4 h-4" /></button>
      </div>
      <div className="overflow-auto rounded border border-border bg-muted/30 p-2 flex justify-center">
        {!doc && <p className="p-10 text-sm text-muted-foreground">Loading the sample book…</p>}
        <canvas ref={canvas} className="shadow-lg bg-background max-w-none" />
      </div>
    </div>
  );
}

/** Composes the sample AstroBook on demand, then shows it in the reader. */
export function SampleBook({ maxPages, cta }: { maxPages?: number; cta?: React.ReactNode }) {
  const [state, setState] = useState<'idle' | 'busy' | 'ready' | 'error'>('idle');
  const [blob, setBlob] = useState<Blob | null>(null);
  const open = async () => {
    setState('busy');
    try { const { blob } = await composeSampleBook(); setBlob(blob); setState('ready'); }
    catch { setState('error'); }
  };
  if (state === 'idle' || state === 'busy' || state === 'error') {
    return (
      <div className="space-y-3">
        <Button size="lg" disabled={state === 'busy'} onClick={() => void open()}><BookOpen />{state === 'busy' ? 'Composing the sample book…' : 'Open the sample book'}</Button>
        {state === 'error' && <p role="alert" className="text-destructive text-sm">The sample book could not be composed. <button className="underline" onClick={() => void open()}>Try again</button></p>}
        <p className="text-xs text-muted-foreground">Composed live in your browser from a fictional reader's chart — the same layout, formatting and length as a real AstroBook.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <Reader blob={blob!} maxPages={maxPages} />
      <p className="text-xs text-muted-foreground">Sample book · fictional reader "Jules Harbor" · your AstroBook is written from your own chart.</p>
      {cta}
    </div>
  );
}
