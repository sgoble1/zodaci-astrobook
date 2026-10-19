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
export function Book3D({ pages = 250 }: { pages?: number }) {
  const [cover, setCover] = useState(COVERS[0]);
  const [angle, setAngle] = useState(-28);
  const spinePx = Math.round(pages * 0.0045 * 40); // 40px per inch
  const w = 240, h = 360;
  return (
    <figure className="space-y-4">
      <div className="flex justify-center py-6" style={{ perspective: 1400 }}>
        <div
          role="img"
          aria-label={`${cover.label} AstroBook, 6 by 9 inch softcover, about ${pages} pages`}
          className="relative transition-transform duration-700 ease-out"
          style={{ width: w, height: h, transformStyle: 'preserve-3d', transform: `rotateY(${angle}deg) rotateX(4deg)` }}
        >
          <img src={cover.src} alt="" className="absolute inset-0 h-full w-full rounded-r-sm object-cover shadow-2xl" style={{ transform: `translateZ(${spinePx / 2}px)` }} />
          <div className="absolute inset-y-0 left-0 bg-muted" style={{ width: spinePx, transform: `rotateY(-90deg) translateZ(${spinePx / 2}px)`, transformOrigin: 'left', backgroundImage: `url(${cover.src})`, backgroundSize: 'cover', filter: 'brightness(0.6)' }} />
          <div className="absolute inset-y-1 right-0 bg-card" style={{ width: spinePx, transform: `rotateY(90deg) translateZ(${w - spinePx / 2}px)`, transformOrigin: 'left', backgroundImage: 'repeating-linear-gradient(90deg, hsl(var(--foreground) / 0.08) 0 1px, transparent 1px 3px)' }} />
          <div className="absolute inset-0 rounded-r-sm bg-card" style={{ transform: `translateZ(-${spinePx / 2}px)` }} />
        </div>
      </div>
      <div className="flex flex-col items-center gap-3">
        <input type="range" min={-60} max={60} value={angle} onChange={e => setAngle(Number(e.target.value))} aria-label="Rotate the book" className="w-56 accent-primary" />
        <div className="flex flex-wrap justify-center gap-2" role="radiogroup" aria-label="Preview cover">
          {COVERS.map(c => (
            <button key={c.key} type="button" role="radio" aria-checked={c.key === cover.key} onClick={() => setCover(c)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${c.key === cover.key ? 'border-primary bg-primary/15' : 'border-border hover:border-primary/60'}`}>{c.label}</button>
          ))}
        </div>
        <figcaption className="text-center text-sm text-muted-foreground">6″ × 9″ · softcover perfect binding · satin interior · ~{pages} pages. Drag the slider to turn the book.</figcaption>
      </div>
    </figure>
  );
}
