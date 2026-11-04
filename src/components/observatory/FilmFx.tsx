import { useId } from 'react';
import { cn } from '@/lib/utils';

/**
 * Projected-film layer shared by the zodiac projector and the retro TVs: a slow uneven lamp
 * flicker, film scratches that jump between frames, floating dust motes, single-frame specks
 * and a stray hair. Purely decorative (aria-hidden); everything stops under reduced motion.
 */
export function FilmFx({ className, motes = 18, specks = 9 }: { className?: string; motes?: number; specks?: number }) {
  return (
    <div className={cn('film-fx', className)} aria-hidden="true">
      <div className="film-flicker" />
      <div className="film-scratches"><i /><i /><i /></div>
      <div className="film-motes">{Array.from({ length: motes }, (_, i) => <span key={i} />)}</div>
      <div className="film-specks">{Array.from({ length: specks }, (_, i) => <span key={i} />)}</div>
      <svg className="film-hair" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M71 12c-3 6 4 9 1 15s-6 4-4 10" />
        <path d="M18 64c4-2 3 5 8 4s3-6 7-5" />
      </svg>
      <div className="film-vignette" />
    </div>
  );
}

/**
 * Hand-drawn ink wobble: a gentle displacement that makes computed chart lines read like a
 * 1950s printed poster drawing. Geometry and hit areas are unchanged (it is a paint filter).
 */
export function useInkFilter(scale = 1.4) {
  const id = `ink-${useId().replace(/:/g, '')}`;
  const defs = (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <filter id={id} x="-2%" y="-2%" width="104%" height="104%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={scale} xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
  return { defs, style: { filter: `url(#${id})` } as const };
}
