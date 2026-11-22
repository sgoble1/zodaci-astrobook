import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { faceText, type BookFace } from '@/lib/bookLeaves';
import type { BookLeaf } from '@/content/sampleBookLeaves';
import { ComicPageView } from '@/components/comic/ComicPageView';
import { CompassText } from '@/components/books/CompassText';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createSingleFlight } from '@/lib/singleFlight';

/**
 * An openable 3D book or comic digest. Leaves hinge on the spine and turn one at a time (buttons, arrow keys, a tap on
 * either page or a swipe); the closed book sits centred on its cover and closes again on its back cover. Every printed
 * face is also listed as plain text beside the book, so the pages read at any size and with a screen reader.
 */
export function OpenBook({ leaves, kind = 'book', label, layout = 'side', footer, spine, trimPt }: { leaves: BookLeaf[]; kind?: 'book' | 'comic'; label: string; layout?: 'side' | 'stacked'; footer?: ReactNode; trimPt?: [number, number]; /** Text printed down the spine (shown while the book is closed). */ spine?: { title: string; name?: string } }) {
  const n = leaves.length;
  const [at, setAt] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const exportGate = useRef(createSingleFlight<void>());
  useEffect(() => { setAt(0); setExportError(''); }, [leaves]);
  const go = useCallback((d: number) => setAt(a => Math.max(0, Math.min(n, a + d))), [n]);
  const swipe = useRef<number | null>(null);
  const swiped = useRef(false);
  const state = at === 0 ? 'closed' : at === n ? 'back' : 'open';
  // Leaf spacing sets the block's thickness, so the spine is as deep as the stacked pages.
  const gap = kind === 'comic' ? 0.7 : Math.min(1, 28 / Math.max(1, n));
  const front = leaves[0]?.front;
  const cover = front?.kind === 'cover' ? front.src : front?.kind === 'jacket' ? front.art : front?.kind === 'comic-page' ? front.art['1-0'] : null;
  const visible: BookFace[] = state === 'closed' ? [leaves[0]?.front] : state === 'back' ? [leaves[n - 1]?.back] : [leaves[at - 1]?.back, leaves[at]?.front];
  const safeVisible = visible.filter(Boolean);
  const chapters = leaves.flatMap(l => [l.front, l.back]).flatMap((f, i) => f?.kind === 'text' && (f.chapterPage ?? 1) === 1 && !f.title.includes('· continued') ? [{ title: f.title, at: Math.ceil(i / 2), page: f.page }] : []);
  const pageNos = safeVisible.map(f => ('page' in f ? f.page : undefined)).filter((p): p is number => p != null);
  const where = state === 'closed' ? 'Front cover' : state === 'back' ? 'Back cover' : pageNos.length ? `Pages ${pageNos.join('–')}` : at === 1 ? 'Inside the cover' : 'Endpapers';
  const onKey = (e: KeyboardEvent) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    else if (e.key === 'Escape') { e.preventDefault(); setAt(0); }
    else if (e.key === 'Home') setAt(0); else if (e.key === 'End') setAt(n);
  };
  const down = (e: PointerEvent) => { swipe.current = e.clientX; swiped.current = false; };
  // A swipe turns one spread; the click that follows the same gesture is ignored so it does not turn a second time.
  const up = (e: PointerEvent) => { const s = swipe.current; swipe.current = null; if (s != null && Math.abs(e.clientX - s) > 40) { swiped.current = true; go(e.clientX < s ? 1 : -1); } };
  const tap = (turned: boolean) => { if (swiped.current) { swiped.current = false; return; } go(turned ? -1 : 1); };
  const text = safeVisible.map(faceText).filter(Boolean) as { heading: string; lines: string[] }[];
  const reader = (
    <div className="ob-reader" aria-live="polite">
      <p className="font-label text-xs tracking-[0.16em] text-primary">{where}</p>
      {text.map((t, i) => <div key={`${at}:${i}`} className="mt-3"><p className="font-semibold leading-snug"><CompassText text={t.heading} /></p>{t.lines.map((l, k) => <p key={k} className={l.startsWith('Reflection: ') ? 'ob-reader-reflection' : 'mt-1.5 text-sm leading-relaxed text-muted-foreground'}><CompassText text={l} /></p>)}</div>)}
    </div>
  );
  const download = () => exportGate.current(async () => {
    setExporting(true); setExportError('');
    try {
      const { previewPdf } = await import('@/lib/previewPdf');
      const blob = await previewPdf(leaves.flatMap(l => [l.front, l.back]));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = kind === 'comic' ? 'astrocomic-preview.pdf' : 'astrobook-preview.pdf'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch { setExportError('The preview could not be downloaded. Please try again.'); }
    finally { setExporting(false); }
  });
  if (!n) return <p role="status">No pages are available. Close this reader and try opening the book again.</p>;
  return (
    <div className={layout === 'side' ? 'ob-layout grid items-start gap-8 2xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]' : 'space-y-4'}>
      <div className="min-w-0">
        {kind === 'book' && chapters.length > 0 && <div className="mb-4 flex min-w-0 items-center gap-3"><Select onValueChange={value => setAt(Math.min(n, Math.max(0, Number(value))))}><SelectTrigger aria-label="Jump to a chapter" className="min-h-11 min-w-0"><SelectValue placeholder="Choose a chapter" /></SelectTrigger><SelectContent>{chapters.map(c => <SelectItem key={`${c.at}:${c.title}`} value={String(c.at)}>{c.title}{c.page ? ` · ${c.page}` : ''}</SelectItem>)}</SelectContent></Select>{at > 0 && <Button size="icon" variant="outline" className="h-11 w-11 shrink-0" aria-label="Close book" onClick={() => setAt(0)}><X /></Button>}</div>}
        <div className="ob-stage" data-kind={kind} data-finish={front?.kind === 'jacket' ? front.finish : undefined} style={trimPt ? { ['--ob-ratio' as string]: trimPt[1] / trimPt[0] } : undefined} onPointerDown={down} onPointerUp={up} onPointerCancel={() => { swipe.current = null; }}>
          <div className="ob-book" data-state={state} role="region" aria-roledescription={kind === 'comic' ? 'comic digest' : 'book'} aria-label={`${label}. ${where}. Use the arrow keys to turn pages.`} tabIndex={0} onKeyDown={onKey}>
            {spine && <BookSpine title={spine.title} name={spine.name} src={cover} stack={n * gap} />}
            {leaves.map((leaf, i) => {
              const turned = i < at;
              const z = turned ? -(i + 1) * gap : (n - i) * gap;
              return (
                <div key={i} className="ob-leaf" data-visible={visible.includes(leaf.front) || visible.includes(leaf.back)} data-turned={turned} onClick={() => tap(turned)} style={{ transform: `rotateY(${turned ? -180 : 0}deg) translateZ(${z}px)` }}>
                  <FittedFace className="ob-face ob-face-front" face={leaf.front} kind={kind} visible={visible.includes(leaf.front)} />
                  <FittedFace className="ob-face ob-face-back" face={leaf.back} kind={kind} visible={visible.includes(leaf.back)} />
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3"><Button variant="ghost" size="sm" disabled={exporting} onClick={() => void download()}><Download />{exporting ? 'Preparing PDF…' : 'Download preview'}</Button>{exportError && <p role="alert" className="text-sm text-destructive">{exportError}</p>}</div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="outline" size="sm" className="min-h-11" onClick={() => go(-1)} disabled={at === 0} aria-label="Previous pages"><ChevronLeft />{at === 1 ? 'Close' : 'Back'}</Button>
          <span className="min-w-[8rem] text-center font-label text-sm tracking-[0.12em] text-muted-foreground" aria-hidden>{where}</span>
          <Button variant={at === 0 ? 'default' : 'outline'} size="sm" className="min-h-11" onClick={() => go(1)} disabled={at === n} aria-label={at === 0 ? `Open the ${kind === 'comic' ? 'comic' : 'book'}` : 'Next pages'}>{at === 0 ? 'Open' : 'Turn'}<ChevronRight /></Button>
        </div>
        {footer}
      </div>
      {layout === 'side' ? reader : <details className="ob-details"><summary className="cursor-pointer text-sm text-primary">Read these pages as text</summary>{reader}</details>}
    </div>
  );
}

/**
 * The spine, hinged on the cover's left edge. The cover's own left edge is stretched across it, so the cover's colour
 * bands carry round the fold without a seam, a squeezed crop or mirrored lettering.
 */
function BookSpine({ title, name, src, stack }: { title: string; name?: string; src: string | null; stack: number }) {
  // At least a tenth of the page width deep, extending behind the back cover when the leaf stack itself is thinner.
  return (
    <div className="ob-spine" aria-hidden style={{ ['--ob-stack' as string]: `${stack}px`, ['--ob-spine-art' as string]: src ? `url(${src})` : 'none' }}>
      <span className="ob-spine-art" />
      <span className="ob-spine-text">{name && <span className="ob-spine-name">{name}</span>}<span className="ob-spine-title">{title}</span></span>
    </div>
  );
}

const Folio = ({ n }: { n?: number }) => n ? <span className="ob-folio">{n}</span> : null;
const Orbit = () => <svg className="ob-orbit" viewBox="0 0 100 60" aria-hidden><ellipse cx="50" cy="30" rx="46" ry="12" /><ellipse cx="50" cy="30" rx="46" ry="12" transform="rotate(32 50 30)" /><ellipse cx="50" cy="30" rx="46" ry="12" transform="rotate(-32 50 30)" /><circle cx="50" cy="30" r="6" /></svg>;

/** Fit the printed content, not a scrollable excerpt, after resize and font loading. */
function FittedFace({ className, face, kind, visible }: { className: string; face: BookFace; kind: 'book' | 'comic'; visible: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || !visible || kind !== 'book') return;
    let frame = 0;
    let active = true;
    const fit = () => {
      if (!active) return;
      element.style.setProperty('--ob-fit', '1');
      const content = element.querySelector<HTMLElement>('.ob-pad, .ob-bookplate, .ob-back-copy');
      if (!content) return;
      // Leave the folio and the paper margins intact. Layout reads deliberately
      // follow each adjustment, so long headings and wrapped tables are remeasured.
      for (let attempt = 0, scale = 1; attempt < 12; attempt++) {
        const body = content.querySelector<HTMLElement>('.ob-body');
        const overflow = Math.max(content.scrollHeight - content.clientHeight, body ? body.scrollHeight - body.clientHeight : 0);
        if (overflow <= 1) break;
        scale *= .92;
        element.style.setProperty('--ob-fit', String(scale));
      }
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(fit); };
    const observer = new ResizeObserver(schedule);
    observer.observe(element);
    fit();
    void document.fonts.ready.then(schedule);
    document.fonts.addEventListener('loadingdone', schedule);
    return () => { active = false; cancelAnimationFrame(frame); observer.disconnect(); document.fonts.removeEventListener('loadingdone', schedule); };
  }, [face, kind, visible]);
  return <div ref={ref} className={className} aria-hidden={!visible} {...(!visible ? { inert: '' } : {})}><Face f={face} kind={kind} /></div>;
}

function Face({ f, kind }: { f: BookFace; kind: 'book' | 'comic' }) {
  switch (f.kind) {
    case 'comic-page': return <div className="ob-comic-sheet"><ComicPageView page={f.sheet} art={f.art} compact /></div>;
    case 'cover': return <img src={f.src} alt="" draggable={false} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />;
    case 'jacket': return <div className="ob-jacket" data-finish={f.finish ?? 'paper'} data-composed={f.composed || undefined}><img src={f.art} alt="" loading="lazy" decoding="async" draggable={false} /><span className="ob-cover-texture" aria-hidden /><span className="ob-deboss-frame" aria-hidden />{!f.composed && <><div className="ob-jacket-title"><p className="font-label ob-eyebrow">Zodaci · Astral Research Authority</p><p className="font-display ob-h">AstroBook</p><p className="font-script ob-script">{f.cover.name}</p><p className="ob-small">{f.cover.birthLine}</p></div><div className="ob-jacket-foot"><p className="ob-celestial-title">{f.cover.title}</p><p className="font-label ob-placement">{f.cover.signs}</p><p className="ob-edition-seal font-label">{f.edition}</p></div></>}</div>;
    case 'endpaper': return (
      <div className="ob-endpaper">
        <div className="ob-bookplate"><p className="font-script ob-script">{f.eyebrow}</p><p className="font-display ob-h">{f.heading}</p>{f.lines.map((l, i) => <p key={`${i}:${l}`} className="ob-small">{l}</p>)}</div>
      </div>
    );
    case 'title': return (
      <div className="ob-pad items-center justify-center text-center">
        <p className="font-label ob-eyebrow">{f.edition}</p><Orbit /><p className="font-display ob-h ob-h-lg">{f.name}</p><p className="font-script ob-script">{f.subtitle}</p><p className="ob-small mt-auto">{f.note}</p>
      </div>
    );
    case 'facts': return (
      <div className="ob-pad">
        <p className="font-label ob-eyebrow">{f.eyebrow}</p><p className="font-display ob-h"><CompassText text={f.heading} /></p>
        <dl className="ob-table">{f.rows.map(([k, v]) => <div key={k}><dt><CompassText text={k} /></dt><dd><CompassText text={v} /></dd></div>)}</dl>
        {f.note && <p className="ob-small mt-auto italic"><CompassText text={f.note} /></p>}<Folio n={f.page} />
      </div>
    );
    case 'list': return (
      <div className="ob-pad">
        <p className="font-label ob-eyebrow">{f.eyebrow}</p><p className="font-display ob-h">{f.heading}</p>
        <ul className="ob-list">{f.items.map(x => <li key={x}><CompassText text={x} /></li>)}</ul>
        {f.note && <p className="ob-small mt-auto italic">{f.note}</p>}<Folio n={f.page} />
      </div>
    );
    case 'plate': return (
      <div className="ob-pad">
        <div className="ob-plate"><img src={f.src} alt="" draggable={false} loading="lazy" decoding="async" /></div>
        <p className="font-label ob-caption">{f.caption}</p><Folio n={f.page} />
      </div>
    );
    case 'text': return (
      <div className="ob-pad" data-chapter-page={f.chapterPage}>
        {f.chapterPage && f.chapterPage > 1 ? <p className="font-label ob-running-title"><CompassText text={f.title} /></p> : <><p className="font-label ob-eyebrow">{f.eyebrow}</p><p className="font-display ob-h"><CompassText text={f.title} /></p>{f.placement && <p className="font-label ob-placement"><CompassText text={f.placement} /></p>}</>}
        {f.facts.length > 0 && <dl className="ob-table ob-table-tight">{f.facts.map(([k, v]) => <div key={k}><dt><CompassText text={k} /></dt><dd><CompassText text={v} /></dd></div>)}</dl>}
        <div className="ob-body">{f.body.map((p, i) => <p key={i}><CompassText text={p} /></p>)}{f.reflection && <aside className="ob-margin-note"><span className="font-label">Reflection</span><p><CompassText text={f.reflection} /></p></aside>}</div><Folio n={f.page} />
      </div>
    );
    case 'comic': return (
      <div className="ob-pad ob-comic">
        <div className="ob-comic-head"><span className="font-label">{f.placement}</span></div>
        <div className="ob-comic-art"><img src={f.src} alt="" draggable={false} loading="lazy" decoding="async" /><p className="ob-caption-box">{f.caption}</p></div>
        <p className="font-display ob-h ob-h-sm">{f.title}</p>
        {f.dialogue && <p className="ob-bubble">{f.dialogue}</p>}<Folio n={f.page} />
      </div>
    );
    case 'back': return (
      <div className={`ob-back ${kind === 'comic' ? 'ob-back-comic' : 'ob-back-book'}`} data-choice={f.choice}>{f.art && <img src={f.art} alt="" loading="lazy" decoding="async" className="ob-back-art" />}<div className="ob-back-copy"><Orbit />{f.seal && <p className="font-label ob-orbit-seal">{f.seal}</p>}{f.lines.map((l, k) => <p key={l} className={k === 0 ? 'font-display ob-h' : 'ob-small'}>{l}</p>)}{f.imprint && <p className="font-label ob-small">{f.imprint}</p>}{f.barcode && <div className="ob-barcode-reserve"><span>Barcode reserved</span></div>}</div></div>
    );
    default: return <div className="ob-blank" aria-hidden>✦</div>;
  }
}
