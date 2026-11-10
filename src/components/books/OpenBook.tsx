import { useCallback, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { faceText, type BookFace } from '@/lib/bookLeaves';
import type { BookLeaf } from '@/content/sampleBookLeaves';

/**
 * An openable 3D book or comic digest. Leaves hinge on the spine and turn one at a time (buttons, arrow keys, a tap on
 * either page or a swipe); the closed book sits centred on its cover and closes again on its back cover. Every printed
 * face is also listed as plain text beside the book, so the pages read at any size and with a screen reader.
 */
export function OpenBook({ leaves, kind = 'book', label, layout = 'side', footer, spine }: { leaves: BookLeaf[]; kind?: 'book' | 'comic'; label: string; layout?: 'side' | 'stacked'; footer?: ReactNode; /** Text printed down the spine (shown while the book is closed). */ spine?: { title: string; name?: string } }) {
  const n = leaves.length;
  const [at, setAt] = useState(0);
  const go = useCallback((d: number) => setAt(a => Math.max(0, Math.min(n, a + d))), [n]);
  const swipe = useRef<number | null>(null);
  const swiped = useRef(false);
  const state = at === 0 ? 'closed' : at === n ? 'back' : 'open';
  // Leaf spacing sets the block's thickness, so the spine is as deep as the stacked pages.
  const gap = kind === 'comic' ? 0.7 : 1;
  const cover = leaves[0]?.front.kind === 'cover' ? leaves[0].front.src : null;
  const visible: BookFace[] = state === 'closed' ? [leaves[0].front] : state === 'back' ? [leaves[n - 1].back] : [leaves[at - 1].back, leaves[at].front];
  const pageNos = visible.map(f => ('page' in f ? f.page : undefined)).filter((p): p is number => p != null);
  const where = state === 'closed' ? 'Front cover' : state === 'back' ? 'Back cover' : pageNos.length ? `Pages ${pageNos.join('–')}` : at === 1 ? 'Inside the cover' : 'Endpapers';
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    else if (e.key === 'Home') setAt(0); else if (e.key === 'End') setAt(n);
  };
  const down = (e: PointerEvent) => { swipe.current = e.clientX; swiped.current = false; };
  // A swipe turns one spread; the click that follows the same gesture is ignored so it does not turn a second time.
  const up = (e: PointerEvent) => { const s = swipe.current; swipe.current = null; if (s != null && Math.abs(e.clientX - s) > 40) { swiped.current = true; go(e.clientX < s ? 1 : -1); } };
  const tap = (turned: boolean) => { if (swiped.current) { swiped.current = false; return; } go(turned ? -1 : 1); };
  const text = visible.map(faceText).filter(Boolean) as { heading: string; lines: string[] }[];
  const reader = (
    <div className="ob-reader" aria-live="polite">
      <p className="font-label text-xs tracking-[0.16em] text-primary">{where}</p>
      {text.map(t => <div key={t.heading} className="mt-3"><p className="font-semibold leading-snug">{t.heading}</p>{t.lines.map((l, k) => <p key={k} className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{l}</p>)}</div>)}
    </div>
  );
  return (
    <div className={layout === 'side' ? 'grid items-start gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]' : 'space-y-4'}>
      <div className="min-w-0">
        <div className="ob-stage" data-kind={kind} onPointerDown={down} onPointerUp={up} onPointerCancel={() => { swipe.current = null; }}>
          <div className="ob-book" data-state={state} role="region" aria-roledescription={kind === 'comic' ? 'comic digest' : 'book'} aria-label={`${label}. ${where}. Use the arrow keys to turn pages.`} tabIndex={0} onKeyDown={onKey}>
            {spine && <BookSpine title={spine.title} name={spine.name} src={cover} stack={n * gap} />}
            {leaves.map((leaf, i) => {
              const turned = i < at;
              const z = turned ? -(i + 1) * gap : (n - i) * gap;
              return (
                <div key={i} className="ob-leaf" data-turned={turned} aria-hidden onClick={() => tap(turned)} style={{ transform: `rotateY(${turned ? -180 : 0}deg) translateZ(${z}px)` }}>
                  <div className="ob-face ob-face-front"><Face f={leaf.front} kind={kind} /></div>
                  <div className="ob-face ob-face-back"><Face f={leaf.back} kind={kind} /></div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => go(-1)} disabled={at === 0} aria-label="Previous pages"><ChevronLeft />{at === 1 ? 'Close' : 'Back'}</Button>
          <span className="min-w-[8rem] text-center font-label text-sm tracking-[0.12em] text-muted-foreground" aria-hidden>{where}</span>
          <Button variant={at === 0 ? 'default' : 'outline'} size="sm" onClick={() => go(1)} disabled={at === n} aria-label={at === 0 ? `Open the ${kind === 'comic' ? 'comic' : 'book'}` : 'Next pages'}>{at === 0 ? 'Open' : 'Turn'}<ChevronRight /></Button>
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

function Face({ f, kind }: { f: BookFace; kind: 'book' | 'comic' }) {
  switch (f.kind) {
    case 'cover': return <img src={f.src} alt="" draggable={false} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />;
    case 'endpaper': return (
      <div className="ob-endpaper">
        <div className="ob-bookplate"><p className="font-script ob-script">{f.eyebrow}</p><p className="font-display ob-h">{f.heading}</p>{f.lines.map(l => <p key={l} className="ob-small">{l}</p>)}</div>
      </div>
    );
    case 'title': return (
      <div className="ob-pad items-center justify-center text-center">
        <p className="font-label ob-eyebrow">{f.edition}</p><Orbit /><p className="font-display ob-h ob-h-lg">{f.name}</p><p className="font-script ob-script">{f.subtitle}</p><p className="ob-small mt-auto">{f.note}</p>
      </div>
    );
    case 'facts': return (
      <div className="ob-pad">
        <p className="font-label ob-eyebrow">{f.eyebrow}</p><p className="font-display ob-h">{f.heading}</p>
        <dl className="ob-table">{f.rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        {f.note && <p className="ob-small mt-auto italic">{f.note}</p>}<Folio n={f.page} />
      </div>
    );
    case 'list': return (
      <div className="ob-pad">
        <p className="font-label ob-eyebrow">{f.eyebrow}</p><p className="font-display ob-h">{f.heading}</p>
        <ul className="ob-list">{f.items.map(x => <li key={x}>{x}</li>)}</ul>
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
      <div className="ob-pad">
        <p className="font-label ob-eyebrow">{f.eyebrow}</p><p className="font-display ob-h">{f.title}</p><p className="font-label ob-placement">{f.placement}</p>
        <dl className="ob-table ob-table-tight">{f.facts.slice(0, 2).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        <div className="ob-body">{f.body.map(p => <p key={p.slice(0, 24)}>{p}</p>)}</div><Folio n={f.page} />
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
      <div className={`ob-back ${kind === 'comic' ? 'ob-back-comic' : ''}`}><Orbit />{f.lines.map((l, k) => <p key={l} className={k === 0 ? 'font-display ob-h' : 'ob-small'}>{l}</p>)}</div>
    );
    default: return <div className="ob-blank" aria-hidden>✦</div>;
  }
}
