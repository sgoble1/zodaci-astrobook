import { useRef, useState, type PointerEvent } from 'react';
import { COVER_DESIGNS, coverSrc } from '@/content/coverDesigns';
import { useCoverImage } from '@/hooks/useCoverImage';
import { DEFAULT_CROP } from '@/lib/coverLayout';

/**
 * Interactive 3D AstroBook mockup scaled from the printer spec: US Trade 6 × 9 in softcover,
 * perfect-bound. Spine thickness approximates page count on 80 lb satin stock (~0.0045 in/page).
 */
export function Book3D({ pages = 250, trimPt = [432, 648], label = '6″ × 9″ · softcover perfect binding', hardcover = false, coverSrc: fixedSrc, name = '', detail, design, onPick }: { pages?: number; trimPt?: [number, number]; label?: string; hardcover?: boolean; coverSrc?: string; name?: string; /** Birth line under the name on designed previews. */ detail?: string; design?: string; /** When given, the preview chips choose the real cover instead of only previewing one. */ onPick?: (key: string) => void }) {
  const [picked, setCover] = useState(() => COVER_DESIGNS.find(d => d.key === design) ?? COVER_DESIGNS[0]);
  const cover = COVER_DESIGNS.find(d => d.key === design) ?? picked;
  // Without a finished cover, show the chosen design with the same name, subtitle and wordmark as the printed book.
  const designed = useCoverImage(fixedSrc ? null : { source: { kind: 'design', key: cover.key }, crop: DEFAULT_CROP, name, trimPt, detail }, 40);
  const [angle, setAngle] = useState(-28);
  // Drag (mouse or touch) to turn the book; vertical swipes still scroll the page.
  const drag = useRef<{ x: number; a: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const onDown = (e: PointerEvent<HTMLDivElement>) => { drag.current = { x: e.clientX, a: angle }; setDragging(true); e.currentTarget.setPointerCapture?.(e.pointerId); };
  const onMove = (e: PointerEvent<HTMLDivElement>) => { const d = drag.current; if (d) setAngle(Math.max(-60, Math.min(60, Math.round(d.a + (e.clientX - d.x) * 0.45)))); };
  const onUp = () => { drag.current = null; setDragging(false); };
  const spinePx = Math.round(pages * 0.0045 * 40) + (hardcover ? 8 : 0); // 40px per inch, boards add thickness
  const ratio = trimPt[1] / trimPt[0];
  const h = Math.min(360, Math.round(240 * ratio)), w = Math.round(h / ratio);
  const src = fixedSrc || designed || coverSrc(cover);
  return (
    <figure className="space-y-4">
      <div className={`flex cursor-grab select-none justify-center py-6 ${dragging ? 'cursor-grabbing' : ''}`} style={{ perspective: 1400, touchAction: 'pan-y' }} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        <div
          role="img"
          aria-label={`AstroBook mockup, ${label}, about ${pages} pages`}
          className={`relative ${dragging ? '' : 'transition-transform duration-700 ease-out'}`}
          style={{ width: w, height: h, transformStyle: 'preserve-3d', transform: `rotateY(${angle}deg) rotateX(4deg)` }}
        >
          <img loading="lazy" decoding="async" draggable={false} src={src} alt="" className="absolute inset-0 h-full w-full rounded-r-sm object-cover shadow-2xl" style={{ transform: `translateZ(${spinePx / 2}px)` }} />
          <div className="absolute inset-y-0 bg-muted" style={{ left: -spinePx / 2, width: spinePx, transform: 'rotateY(-90deg)', backgroundImage: `url(${src})`, backgroundSize: 'cover', filter: 'brightness(0.6)' }} />
          <div className="absolute inset-y-1 bg-card" style={{ left: w - spinePx / 2 - 2, width: spinePx, transform: 'rotateY(90deg)', backgroundImage: 'repeating-linear-gradient(90deg, hsl(var(--foreground) / 0.08) 0 1px, transparent 1px 3px)' }} />
          <div className="absolute inset-0 rounded-r-sm bg-card" style={{ transform: `translateZ(-${spinePx / 2}px)` }} />
        </div>
      </div>
      <div className="flex flex-col items-center gap-3">
        <input type="range" min={-60} max={60} value={angle} onChange={e => setAngle(Number(e.target.value))} aria-label="Rotate the book" className="w-56 accent-primary" />
        {!fixedSrc && !design && <div className="flex flex-wrap justify-center gap-2" role="radiogroup" aria-label={onPick ? 'Choose a cover' : 'Preview cover'}>
          {COVER_DESIGNS.map(c => (
            <button key={c.key} type="button" role="radio" aria-checked={c.key === cover.key} onClick={() => { setCover(c); onPick?.(c.key); }}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${c.key === cover.key ? 'border-primary bg-primary/15' : 'border-border hover:border-primary/60'}`}>{c.label}</button>
          ))}
        </div>}
        <figcaption className="text-center text-sm text-muted-foreground">{label} · ~{pages} pages. Drag the book or the slider to turn it.</figcaption>
      </div>
    </figure>
  );
}
