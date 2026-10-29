import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AstroComicShowcase } from '@/content/comicIssue1';

/**
 * 3D page-turning preview: cover plus every illustrated page. Tilts toward the pointer, turns with buttons, arrow keys
 * or swipe, and drops all motion for reduced-motion visitors.
 */
export function ComicFlipbook({ issue }: { issue: AstroComicShowcase }) {
  const leaves = issue.pages.length + 1; // cover + pages
  const [at, setAt] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const touch = useRef<number | null>(null);
  const go = useCallback((d: number) => setAt(a => Math.min(leaves - 1, Math.max(0, a + d))), [leaves]);
  useEffect(() => { setTilt({ x: 0, y: 0 }); }, [at]);
  const page = at === 0 ? null : issue.pages[at - 1];
  return (
    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div
        className="mx-auto w-full max-w-md [perspective:1600px]"
        onPointerMove={e => { if (e.pointerType !== 'mouse') return; const r = e.currentTarget.getBoundingClientRect(); setTilt({ x: ((e.clientY - r.top) / r.height - 0.5) * -8, y: ((e.clientX - r.left) / r.width - 0.5) * 12 }); }}
        onPointerLeave={() => setTilt({ x: 0, y: 0 })}
        onTouchStart={e => { touch.current = e.touches[0].clientX; }}
        onTouchEnd={e => { if (touch.current == null) return; const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); touch.current = null; }}
      >
        <div tabIndex={0} role="region" aria-roledescription="comic preview" aria-label={`Issue ${issue.issueNumber}, ${at === 0 ? 'cover' : `page ${at} of ${issue.pages.length}`}. Use arrow keys to turn pages.`}
          onKeyDown={e => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); }}
          className="relative aspect-[2/3] rounded-sm outline-none transition-transform duration-700 ease-out [transform-style:preserve-3d] focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y - 6}deg)` }}>
          {/* page edges for depth */}
          <div aria-hidden className="absolute inset-y-1 -right-2 w-2 rounded-r-sm bg-gradient-to-r from-muted to-muted-foreground/30 [transform:translateZ(-6px)]" />
          {Array.from({ length: leaves }).map((_, i) => {
            const turned = i < at; const p = i === 0 ? null : issue.pages[i - 1];
            return (
              <div key={i} aria-hidden={i !== at}
                className="absolute inset-0 origin-left overflow-hidden rounded-sm border-2 border-foreground/80 bg-background shadow-2xl transition-transform duration-[1200ms] ease-in-out [backface-visibility:hidden] motion-reduce:transition-none"
                style={{ transform: turned ? 'rotateY(-165deg)' : 'rotateY(0deg)', zIndex: turned ? i : leaves - i }}>
                {p == null ? (
                  <>
                    <img src={issue.cover} alt="Issue 1 cover: a young man on a limestone cliff holding a glowing astrolabe above a misty mill valley" width={1024} height={1536} className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-background/95 via-background/60 to-transparent p-4">
                      <p className="font-smallcaps text-[10px] text-gold">{issue.banner}</p>
                      <p className="mt-1 font-display text-2xl leading-tight sm:text-3xl">{issue.title}</p>
                    </div>
                    <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 to-transparent p-4 text-xs italic">{issue.subCaption}</p>
                  </>
                ) : (
                  <div className="flex h-full flex-col gap-2 p-2.5">
                    <div className="flex items-baseline justify-between border-b border-foreground/30 pb-1"><span className="font-smallcaps text-[9px] text-gold">{p.placement}</span><span className="text-[9px] text-muted-foreground">{p.pageNumber}</span></div>
                    <p className="font-display text-base leading-tight">{p.actTitle}</p>
                    <div className="relative min-h-0 flex-[3] overflow-hidden border-2 border-foreground/80">
                      <img src={p.art} alt={p.panels[0].visualPrompt} width={1536} height={1024} loading="lazy" className="h-full w-full object-cover" />
                      <p className="absolute left-1.5 top-1.5 max-w-[80%] border border-gold/60 bg-background/90 px-1.5 py-0.5 text-[10px] leading-snug">{p.panels[0].narration}</p>
                    </div>
                    <div className="grid min-h-0 flex-[2] grid-cols-2 gap-1.5">
                      {p.panels.slice(1).map((panel, k) => (
                        <div key={k} className="relative flex flex-col justify-end gap-1 overflow-hidden border-2 border-foreground/80 bg-card/70 p-1.5">
                          <img src={p.art} alt="" aria-hidden width={1536} height={1024} loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-40" style={{ objectPosition: k ? '85% 50%' : '15% 40%', transform: 'scale(1.8)' }} />
                          <p className="relative border border-gold/60 bg-background/90 px-1 py-0.5 text-[9px] leading-snug">{panel.narration}</p>
                          {panel.dialogue && <p className="relative w-fit rounded-2xl bg-foreground px-1.5 py-0.5 text-[9px] text-background">{panel.dialogue}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-5 flex items-center justify-center gap-3">
          <Button variant="outline" size="icon" onClick={() => go(-1)} disabled={at === 0} aria-label="Previous page"><ChevronLeft /></Button>
          <div className="flex gap-1.5" role="tablist" aria-label="Pages">{Array.from({ length: leaves }).map((_, i) => <button key={i} role="tab" aria-selected={i === at} aria-label={i === 0 ? 'Cover' : `Page ${i}`} onClick={() => setAt(i)} className={`h-2.5 rounded-full transition-all duration-500 ${i === at ? 'w-6 bg-gold' : 'w-2.5 bg-muted-foreground/40'}`} />)}</div>
          <Button variant="outline" size="icon" onClick={() => go(1)} disabled={at === leaves - 1} aria-label="Next page"><ChevronRight /></Button>
        </div>
      </div>
      <div aria-live="polite">
        <p className="font-smallcaps text-xs text-gold">Issue #{issue.issueNumber} · {issue.subject.sunSign} Sun · {issue.subject.moonSign} Moon · {issue.subject.risingSign} Rising</p>
        <h3 className="mt-2 font-display text-3xl">{page ? page.actTitle : issue.title}</h3>
        {page ? (
          <ol className="mt-5 space-y-4">{page.panels.map((p, i) => <li key={i} className="border-l-2 border-gold/60 pl-4"><p className="text-xs text-muted-foreground">Panel {i + 1}</p><p className="mt-1 leading-relaxed">{p.narration}</p>{p.dialogue && <p className="mt-1 font-semibold">{p.dialogue}</p>}</li>)}</ol>
        ) : (
          <p className="mt-4 leading-relaxed text-muted-foreground">Three acts, three placements. The rising sign sets the scene, the Sun lights the action, and the Moon brings the story home. Turn the page to read the script beside the art.</p>
        )}
        {at === leaves - 1 && <p className="mt-6 font-smallcaps text-xs text-gold">{issue.footer}</p>}
      </div>
    </div>
  );
}
