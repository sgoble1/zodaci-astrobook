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
  const [text, setText] = useState('');
  const [attempt, setAttempt] = useState(0);
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
  }, [blob, attempt]);

  useEffect(() => {
    if (!doc || !canvas.current) return;
    let task: { cancel: () => void } | null = null;
    let active = true;
    (async () => {
      try {
      const p = await doc.getPage(Math.min(page, doc.numPages));
      const content = await p.getTextContent();
      if (!active) return;
      setText(content.items.map(item => 'str' in item ? item.str : '').join(' '));
      const vp = p.getViewport({ scale: scale * (window.devicePixelRatio || 1) });
      const c = canvas.current;
      const context = c?.getContext('2d');
      if (!c || !context) return;
      c.width = vp.width; c.height = vp.height;
      c.style.width = `${vp.width / (window.devicePixelRatio || 1)}px`;
      const r = p.render({ canvasContext: context, viewport: vp, canvas: c } as Parameters<typeof p.render>[0]);
      task = r; await r.promise.catch(() => {});
      } catch { if (active) setErr('This sample page could not be displayed.'); }
    })();
    return () => { active = false; task?.cancel(); };
  }, [doc, page, scale]);

  const total = Math.min(doc?.numPages ?? 1, maxPages ?? Number.MAX_SAFE_INTEGER);
  if (err) return <div role="alert" className="space-y-2"><p className="text-destructive text-sm">{err}</p><Button variant="outline" onClick={() => { setErr(''); setAttempt(n => n + 1); }}>Retry sample</Button></div>;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded border border-border bg-card p-2">
        <Button size="icon" variant="ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!doc || page <= 1} aria-label="Previous page"><ChevronLeft className="w-4 h-4" /></Button>
        <span className="text-sm">Page <b>{page}</b> of {maxPages ? `${total} shown` : total ?? '…'}</span>
        <Button size="icon" variant="ghost" onClick={() => setPage(p => Math.min(total, p + 1))} disabled={!doc || page >= total} aria-label="Next page"><ChevronRight className="w-4 h-4" /></Button>
        <span className="mx-2 h-5 w-px bg-border" />
        <Button size="icon" variant="ghost" onClick={() => setScale(s => Math.max(0.6, s - 0.2))} disabled={!doc} aria-label="Zoom out"><ZoomOut className="w-4 h-4" /></Button>
        <span className="text-xs w-10 text-center">{Math.round(scale * 100)}%</span>
        <Button size="icon" variant="ghost" onClick={() => setScale(s => Math.min(2.5, s + 0.2))} disabled={!doc} aria-label="Zoom in"><ZoomIn className="w-4 h-4" /></Button>
      </div>
      <div className="overflow-auto rounded border border-border bg-muted/30 p-2 flex">
        {!doc && <p className="p-10 text-sm text-muted-foreground">Loading the sample book…</p>}
        <canvas ref={canvas} aria-label={`Sample AstroBook page ${page}`} className="mx-auto shrink-0 shadow-lg bg-background max-w-none" />
      </div>
      <details className="border-t border-border pt-3"><summary className="cursor-pointer text-sm">Read this page as text</summary><p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{text || 'Opening page text…'}</p></details>
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
        {state === 'error' && <div role="alert" className="space-y-2"><p className="text-destructive text-sm">The sample book could not be composed.</p><Button variant="outline" onClick={() => void open()}>Retry sample</Button><p className="text-sm text-muted-foreground">Jules Harbor’s fictional sample includes chart facts, personal themes, work, relationships and reflection passages. No real member’s readings are used.</p></div>}
        <p className="text-xs text-muted-foreground">A short fictional sample with calculated chart facts and illustrative editorial passages. Your purchased book’s content and actual length are reviewed separately.</p>
      </div>
    );
  }
  if (!blob) return null;
  return (
    <div className="space-y-4">
      <Reader blob={blob} maxPages={maxPages} />
      <p className="text-xs text-muted-foreground">Sample book · fictional reader "Olivia Chen" · Classic version · your AstroBook is written from your own chart.</p>
      {cta}
    </div>
  );
}
