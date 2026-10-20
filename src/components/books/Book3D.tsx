import { useState } from 'react';
import coverMidnightStars from '@/assets/cover-design-midnight-stars.jpg';
import coverBlueCosmos from '@/assets/cover-design-blue-cosmos.jpg';
import coverGoldAurora from '@/assets/cover-design-gold-aurora.jpg';

const COVERS = [
  { key: 'midnight', label: 'Midnight Stars', src: coverMidnightStars },
  { key: 'blue', label: 'Blue Cosmos', src: coverBlueCosmos },
  { key: 'gold', label: 'Gold Aurora', src: coverGoldAurora },
];

/**
 * Interactive 3D AstroBook mockup scaled from the printer spec: US Trade 6 × 9 in softcover,
 * perfect-bound. Spine thickness approximates page count on 80 lb satin stock (~0.0045 in/page).
 */
export function Book3D({ pages = 250, trimPt = [432, 648], label = '6″ × 9″ · softcover perfect binding', hardcover = false, coverSrc }: { pages?: number; trimPt?: [number, number]; label?: string; hardcover?: boolean; coverSrc?: string }) {
  const [cover, setCover] = useState(COVERS[0]);
  const [angle, setAngle] = useState(-28);
  const spinePx = Math.round(pages * 0.0045 * 40) + (hardcover ? 8 : 0); // 40px per inch, boards add thickness
  const ratio = trimPt[1] / trimPt[0];
  const h = Math.min(360, Math.round(240 * ratio)), w = Math.round(h / ratio);
  const src = coverSrc ?? cover.src;
  return (
    <figure className="space-y-4">
      <div className="flex justify-center py-6" style={{ perspective: 1400 }}>
        <div
          role="img"
          aria-label={`AstroBook mockup, ${label}, about ${pages} pages`}
          className="relative transition-transform duration-700 ease-out"
          style={{ width: w, height: h, transformStyle: 'preserve-3d', transform: `rotateY(${angle}deg) rotateX(4deg)` }}
        >
          <img src={src} alt="" className="absolute inset-0 h-full w-full rounded-r-sm object-cover shadow-2xl" style={{ transform: `translateZ(${spinePx / 2}px)` }} />
          <div className="absolute inset-y-0 bg-muted" style={{ left: -spinePx / 2, width: spinePx, transform: 'rotateY(-90deg)', backgroundImage: `url(${src})`, backgroundSize: 'cover', filter: 'brightness(0.6)' }} />
          <div className="absolute inset-y-1 bg-card" style={{ left: w - spinePx / 2 - 2, width: spinePx, transform: 'rotateY(90deg)', backgroundImage: 'repeating-linear-gradient(90deg, hsl(var(--foreground) / 0.08) 0 1px, transparent 1px 3px)' }} />
          <div className="absolute inset-0 rounded-r-sm bg-card" style={{ transform: `translateZ(-${spinePx / 2}px)` }} />
        </div>
      </div>
      <div className="flex flex-col items-center gap-3">
        <input type="range" min={-60} max={60} value={angle} onChange={e => setAngle(Number(e.target.value))} aria-label="Rotate the book" className="w-56 accent-primary" />
        {!coverSrc && <div className="flex flex-wrap justify-center gap-2" role="radiogroup" aria-label="Preview cover">
          {COVERS.map(c => (
            <button key={c.key} type="button" role="radio" aria-checked={c.key === cover.key} onClick={() => setCover(c)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${c.key === cover.key ? 'border-primary bg-primary/15' : 'border-border hover:border-primary/60'}`}>{c.label}</button>
          ))}
        </div>}
        <figcaption className="text-center text-sm text-muted-foreground">{label} · ~{pages} pages. Drag the slider to turn the book.</figcaption>
      </div>
    </figure>
  );
}
