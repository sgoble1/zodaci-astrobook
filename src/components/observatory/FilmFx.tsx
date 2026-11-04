import { useId, useMemo, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';

/**
 * Projected-film layer shared by the zodiac projector and the retro TVs: a slow uneven lamp
 * flicker, drifting haze in the beam, dust that flies around the whole picture at several
 * depths, film scratches, single-frame specks and a stray hair. Purely decorative
 * (aria-hidden); everything stops under reduced motion.
 *
 * tone "glow"   — bright dust on a dark picture (retro TVs).
 * tone "screen" — lamp light on a pale pull-down screen: glinting motes in the beam plus
 *                 soft, out-of-focus lens dust that reads against the cream.
 */
export type FilmTone = 'glow' | 'screen';

type Dust = { kind: 'glint' | 'mote' | 'bokeh' | 'blob'; style: CSSProperties };

function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic dust field: same count/tone → same paths, so nothing jumps on re-render. */
export function makeDust(count: number, tone: FilmTone): Dust[] {
  const r = seeded(count * 7919 + (tone === 'screen' ? 13 : 3));
  const blobs = tone === 'screen' ? Math.max(3, Math.round(count / 6)) : 0;
  const px = (n: number) => `${Math.round(n)}px`;
  const step = (span: number) => (r() * 2 - 1) * span;
  const bokeh = Math.max(2, Math.round(count / 8));
  return Array.from({ length: count + bokeh + blobs }, (_, i) => {
    const kind: Dust['kind'] = i >= count + bokeh ? 'blob' : i >= count ? 'bokeh' : i % 3 === 0 ? 'mote' : 'glint';
    const span = kind === 'blob' ? 80 : kind === 'bokeh' ? 110 : kind === 'mote' ? 140 : 170;
    const size = kind === 'blob' ? 9 + r() * 12 : kind === 'bokeh' ? 7 + r() * 6 : kind === 'mote' ? 3 + r() * 3 : 1.4 + r() * 1.8;
    const slow = kind === 'blob' ? 60 : kind === 'bokeh' ? 34 : 22;
    const style = {
      left: `${(3 + r() * 94).toFixed(1)}%`,
      top: `${(3 + r() * 94).toFixed(1)}%`,
      '--s': px(size),
      '--o': (kind === 'blob' ? 0.16 + r() * 0.12 : kind === 'bokeh' ? 0.3 + r() * 0.2 : 0.65 + r() * 0.35).toFixed(2),
      '--d': `${Math.round(slow + r() * 26)}s`,
      '--t': `${(3 + r() * 6).toFixed(1)}s`,
      '--dl': `${(-r() * 60).toFixed(1)}s`,
      '--ax': px(step(span)), '--ay': px(step(span)),
      '--bx': px(step(span)), '--by': px(step(span)),
      '--cx': px(step(span)), '--cy': px(step(span)),
      '--dx': px(step(span)), '--dy': px(step(span)),
    } as CSSProperties;
    return { kind, style };
  });
}

export function FilmFx({ className, motes = 18, specks = 9, tone = 'glow' }: { className?: string; motes?: number; specks?: number; tone?: FilmTone }) {
  const dust = useMemo(() => makeDust(motes, tone), [motes, tone]);
  return (
    <div className={cn('film-fx', tone === 'screen' && 'film-fx-screen', className)} aria-hidden="true">
      <div className="film-haze" />
      <div className="film-flicker" />
      <div className="film-scratches"><i /><i /><i /></div>
      <div className="film-dust">{dust.map((d, i) => <span key={i} className={`film-${d.kind}`} style={d.style} />)}</div>
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
