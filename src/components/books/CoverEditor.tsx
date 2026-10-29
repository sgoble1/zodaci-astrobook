import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Minus, Plus, RotateCcw, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { COVER_BLEED_IN, COVER_SAFE_IN, DEFAULT_CROP, artPpi, clampCrop, placeArt } from '@/lib/coverLayout';
import { drawCover, coverPixels, sourceSize, type CoverSpec } from '@/lib/coverRender';

const PREVIEW_HEIGHT = 560;

/**
 * Design your AstroBook cover on the real trim: drag to move the picture, zoom in or out, and see the safe zone that
 * keeps your name clear of the cut. What you see here is drawn by the same code that makes the printed cover.
 */
export function CoverEditor({ spec, onChange, trimLabel }: { spec: CoverSpec; onChange: (s: CoverSpec) => void; trimLabel: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [showSafe, setShowSafe] = useState(true);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [error, setError] = useState('');
  const drag = useRef<{ x: number; y: number; crop: CoverSpec['crop'] } | null>(null);
  const ppi = PREVIEW_HEIGHT / (spec.trimPt[1] / 72);
  const [w, h] = coverPixels(spec.trimPt, ppi);
  const trimIn: [number, number] = [spec.trimPt[0] / 72, spec.trimPt[1] / 72];

  useEffect(() => { let on = true; setSize(null); sourceSize(spec.source).then(s => { if (on) setSize(s); }).catch(() => { if (on) setSize(null); }); return () => { on = false; }; }, [spec.source]);

  // Redraw on every change; a newer draw always wins over a slower older one.
  const drawId = useRef(0);
  useEffect(() => {
    const id = ++drawId.current; const el = canvas.current; if (!el) return;
    const off = document.createElement('canvas'); off.width = w; off.height = h;
    drawCover(off.getContext('2d')!, spec, w, h).then(() => {
      if (id !== drawId.current) return;
      el.width = w; el.height = h; el.getContext('2d')!.drawImage(off, 0, 0); setError('');
    }).catch(e => { if (id === drawId.current) setError(e instanceof Error ? e.message : 'The cover could not be drawn.'); });
  }, [spec, w, h]);

  const set = (crop: Partial<CoverSpec['crop']>) => onChange({ ...spec, crop: clampCrop({ ...spec.crop, ...crop }) });
  // Pixels the picture can move in each direction at this zoom, in preview pixels.
  const range = () => { const iw = size?.width ?? w, ih = size?.height ?? h; const p = placeArt(iw, ih, w, h, { ...spec.crop, x: 0, y: 0 }); return { x: (p.width - w) / 2, y: (p.height - h) / 2 }; };
  const scale = () => { const el = canvas.current; return el ? w / el.getBoundingClientRect().width : 1; };
  const onDown = (e: PointerEvent<HTMLCanvasElement>) => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY, crop: spec.crop }; };
  const onMove = (e: PointerEvent<HTMLCanvasElement>) => {
    const d = drag.current; if (!d) return;
    const r = range(); const k = scale();
    set({ x: r.x ? d.crop.x + ((e.clientX - d.x) * k) / r.x : 0, y: r.y ? d.crop.y + ((e.clientY - d.y) * k) / r.y : 0 });
  };
  const onUp = () => { drag.current = null; };
  const onKey = (e: KeyboardEvent<HTMLCanvasElement>) => {
    const step = e.shiftKey ? 0.2 : 0.05;
    const moves: Record<string, Partial<CoverSpec['crop']>> = { ArrowLeft: { x: spec.crop.x - step }, ArrowRight: { x: spec.crop.x + step }, ArrowUp: { y: spec.crop.y - step }, ArrowDown: { y: spec.crop.y + step }, '+': { zoom: spec.crop.zoom + 0.1 }, '=': { zoom: spec.crop.zoom + 0.1 }, '-': { zoom: spec.crop.zoom - 0.1 }, '0': DEFAULT_CROP };
    const m = moves[e.key]; if (!m) return; e.preventDefault(); set(m);
  };
  const movable = (() => { const r = range(); return r.x > 1 || r.y > 1; })();
  const printPpi = size ? artPpi(size.width, size.height, trimIn[0], trimIn[1], spec.crop.zoom) : null;
  const safePct = { x: (COVER_SAFE_IN / trimIn[0]) * 100, y: (COVER_SAFE_IN / trimIn[1]) * 100 };

  return (
    <div className="grid gap-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-start">
      <div className="mx-auto w-full max-w-[360px]">
        <div className="relative overflow-hidden rounded-sm shadow-2xl" style={{ aspectRatio: `${w} / ${h}` }}>
          <canvas ref={canvas} width={w} height={h} tabIndex={0} role="img"
            aria-label={`Cover preview, ${trimLabel}. Drag or use the arrow keys to move the picture; plus and minus to zoom.`}
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onKeyDown={onKey}
            className={`block h-full w-full touch-none select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${movable ? 'cursor-grab active:cursor-grabbing' : ''}`} />
          {showSafe && <>
            <div aria-hidden className="pointer-events-none absolute border border-dashed border-gold/80" style={{ left: `${safePct.x}%`, right: `${safePct.x}%`, top: `${safePct.y}%`, bottom: `${safePct.y}%` }} />
            <div aria-hidden className="pointer-events-none absolute inset-0 border-2 border-destructive/60" />
          </>}
        </div>
        {showSafe && <p className="mt-2 text-xs text-muted-foreground"><span className="text-destructive">Red</span>: the trim, where the book is cut (art also runs {COVER_BLEED_IN} in past it). <span className="text-gold">Gold dashes</span>: safe zone — your name stays inside.</p>}
      </div>
      <div className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="cover-name">Name on the cover</Label>
          <Input id="cover-name" value={spec.name} maxLength={40} onChange={e => onChange({ ...spec, name: e.target.value })} placeholder="Your name" autoComplete="name" />
          <p className="text-xs text-muted-foreground">Beneath it: “Your exact placement in print”. The AstroBook mark sits bottom-right.</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2"><Label htmlFor="cover-zoom">Zoom</Label><span className="text-xs text-muted-foreground">{Math.round(spec.crop.zoom * 100)}%</span></div>
          <div className="flex items-center gap-2">
            <Button type="button" size="icon" variant="outline" aria-label="Zoom out" onClick={() => set({ zoom: spec.crop.zoom - 0.1 })} disabled={spec.crop.zoom <= 1}><Minus /></Button>
            <input id="cover-zoom" type="range" min={1} max={4} step={0.01} value={spec.crop.zoom} onChange={e => set({ zoom: Number(e.target.value) })} className="w-full accent-primary" />
            <Button type="button" size="icon" variant="outline" aria-label="Zoom in" onClick={() => set({ zoom: spec.crop.zoom + 0.1 })} disabled={spec.crop.zoom >= 4}><Plus /></Button>
          </div>
          <p className="text-xs text-muted-foreground">{movable ? 'Drag the cover (or use the arrow keys) to choose which part of the picture shows.' : 'Zoom in to move the picture around.'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button type="button" variant="outline" size="sm" onClick={() => set(DEFAULT_CROP)}><RotateCcw />Reset position</Button>
          <label className="flex items-center gap-2 text-sm"><Switch checked={showSafe} onCheckedChange={setShowSafe} aria-label="Show trim and safe zone" /><ScanLine className="h-4 w-4 text-gold" aria-hidden />Show trim and safe zone</label>
        </div>
        {printPpi !== null && (printPpi < 150
          ? <p role="alert" className="text-sm text-destructive">This picture will print soft (about {printPpi} pixels per inch). Use a larger image or zoom out for a sharp cover.</p>
          : printPpi < 250 ? <p className="text-sm text-muted-foreground">Print sharpness: good (about {printPpi} pixels per inch). 300 is ideal.</p>
          : <p className="text-sm text-muted-foreground">Print sharpness: excellent (about {Math.min(printPpi, 999)} pixels per inch).</p>)}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <p className="text-xs text-muted-foreground">{trimLabel}. The printed cover, the 3D book and page one of your PDF all use exactly this design.</p>
      </div>
    </div>
  );
}
