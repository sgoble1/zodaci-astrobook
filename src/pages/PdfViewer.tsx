import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, FileText } from 'lucide-react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { BUILT_IN_SOURCES } from '@/content/sources';
import { loadLibraryIndex } from '@/lib/corpus';

/** In-app PDF reader: renders one page at a time with pdf.js, with the extracted page text alongside. */
export default function PdfViewer() {
  const { id = '' } = useParams();
  const [sp, setSp] = useSearchParams();
  const page = Math.max(1, +(sp.get('page') ?? 1));
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [meta, setMeta] = useState<{ title: string; url: string; libId?: string } | null>(null);
  const [err, setErr] = useState('');
  const [scale, setScale] = useState(1.25);
  const [showText, setShowText] = useState(false);
  const [text, setText] = useState<string[] | null>(null);
  const [jump, setJump] = useState('');
  const [textOnly, setTextOnly] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    (async () => {
      const upload = sp.get('src');
      if (upload) { setMeta({ title: sp.get('title') ?? 'Uploaded PDF', url: upload }); return; }
      const direct = BUILT_IN_SOURCES.find(s => s.id === decodeURIComponent(id));
      const ix = await loadLibraryIndex();
      const lib = direct ? ix.find(d => d.fileName === direct.fileName) : ix.find(d => d.id === id);
      const src = direct ?? BUILT_IN_SOURCES.find(s => s.fileName === lib?.fileName);
      if (!src) { setErr('That document could not be found.'); return; }
      if (src.ext !== 'pdf') { setErr('This viewer opens PDFs. For Word or PowerPoint files, use the text reader.'); setMeta({ title: src.title, url: src.url, libId: lib?.id }); return; }
      setMeta({ title: src.title, url: src.url, libId: lib?.id });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!meta || err) return;
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
        const worker = await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url');
        pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
        const d = await pdfjs.getDocument({ url: meta.url }).promise;
        if (!cancelled) setDoc(d);
      } catch { if (!cancelled) setTextOnly(true); }
    })();
    if (meta.libId) fetch(`/library/${meta.libId}.json`).then(r => r.json()).then((u: { text: string }[]) => setText(u.map(x => x.text))).catch(() => {});
    return () => { cancelled = true; };
  }, [meta, err]);

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

  const total = doc?.numPages ?? (textOnly ? text?.length : undefined);
  const go = (n: number) => { if (!total) return; const v = Math.min(Math.max(1, n), total); const s = new URLSearchParams(sp); s.set('page', String(v)); setSp(s, { replace: true }); };
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.target as HTMLElement).tagName === 'INPUT') return; if (e.key === 'ArrowRight') go(page + 1); if (e.key === 'ArrowLeft') go(page - 1); };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  });

  return (
    <div className="space-y-4">
      <Link to="/masterbook/index" className="text-xs font-smallcaps text-muted-foreground hover:text-foreground">← Document index</Link>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div><div className="font-smallcaps text-xs text-gold">PDF viewer</div><h1 className="text-2xl sm:text-3xl mt-1">{meta?.title ?? '…'}</h1></div>
        {meta && <div className="flex gap-3 text-xs">{meta.libId && <Link to={`/sources/read/${meta.libId}#u${page - 1}`} className="underline">Text of this page</Link>}<a href={meta.url} download className="underline flex items-center gap-1"><Download className="w-3 h-3" />Download</a></div>}
      </header>
      {err && <p className="text-oxblood">{err}</p>}
      {!err && (
        <>
          <div className="sticky top-14 z-10 flex flex-wrap items-center gap-2 bg-background/90 backdrop-blur border border-border rounded p-2">
            <button onClick={() => go(page - 1)} disabled={page <= 1} className="p-1.5 rounded hover:bg-muted disabled:opacity-40" aria-label="Previous page"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-sm">Page <b>{page}</b> of {total ?? '…'}</span>
            <button onClick={() => go(page + 1)} disabled={!!total && page >= total} className="p-1.5 rounded hover:bg-muted disabled:opacity-40" aria-label="Next page"><ChevronRight className="w-4 h-4" /></button>
            <form onSubmit={e => { e.preventDefault(); go(+jump); setJump(''); }} className="flex items-center gap-1"><input value={jump} onChange={e => setJump(e.target.value.replace(/\D/g, ''))} placeholder="Go to" className="w-16 text-sm border border-border rounded px-2 py-1 bg-background" aria-label="Go to page" /></form>
            <span className="mx-2 h-5 w-px bg-border" />
            <button onClick={() => setScale(s => Math.max(0.6, s - 0.2))} className="p-1.5 rounded hover:bg-muted" aria-label="Zoom out"><ZoomOut className="w-4 h-4" /></button>
            <span className="text-xs w-10 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(s => Math.min(3, s + 0.2))} className="p-1.5 rounded hover:bg-muted" aria-label="Zoom in"><ZoomIn className="w-4 h-4" /></button>
            {text && <button onClick={() => setShowText(v => !v)} className={`ml-auto text-xs border rounded px-2 py-1 flex items-center gap-1 ${showText ? 'bg-muted' : ''}`}><FileText className="w-3 h-3" />Page text</button>}
          </div>
          {textOnly ? (
            <div className="parchment p-5 space-y-2">
              <div className="font-smallcaps text-xs text-gold">Text view · page {page}</div>
              {text ? <div className="text-sm whitespace-pre-wrap leading-relaxed">{text[page - 1]?.trim() || 'This page has no selectable text (it may be an image).'}</div>
                : <p className="text-sm text-muted-foreground">The page images couldn’t be loaded here{meta?.libId ? ', and the text is still loading…' : ' and there is no extracted text for this file. Use Download to open it.'}</p>}
              <p className="text-[11px] text-muted-foreground">The original page image couldn’t be drawn in this browser, so the page’s extracted text is shown instead.</p>
            </div>
          ) : (
          <div className={`grid gap-4 ${showText ? 'lg:grid-cols-[auto_1fr]' : ''}`}>
            <div className="overflow-auto border border-border rounded bg-muted/30 p-2 flex justify-center">
              {!doc && !textOnly && <p className="p-10 text-muted-foreground text-sm">Loading document…</p>}
              <canvas ref={canvas} className="shadow-lg bg-background max-w-none" />
            </div>
            {showText && text && <div className="parchment p-4 text-sm whitespace-pre-wrap max-h-[80vh] overflow-auto">{text[page - 1] ?? 'No extracted text for this page.'}</div>}
          </div>
          )}
          <p className="text-[11px] text-muted-foreground">Tip: use the ← and → keys to turn pages. The link in your address bar opens this exact page.</p>
        </>
      )}
    </div>
  );
}
