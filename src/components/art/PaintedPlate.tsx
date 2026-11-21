import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** The three painted containers: 16:9 hero plate, 21:9 panoramic strip, 4:3 station card. Grain and lamp-glow come from .painted-plate in index.css. */
export type PlateShape = 'hero' | 'panorama' | 'station';
const RATIO: Record<PlateShape, string> = { hero: 'aspect-[16/9]', panorama: 'aspect-[16/9] sm:aspect-[21/9]', station: 'aspect-[4/3]' };

export function PaintedPlate({ src, alt, shape = 'hero', priority, className, children }: { src: string; alt: string; shape?: PlateShape; priority?: boolean; className?: string; children?: ReactNode }) {
  return (
    <figure className={cn('painted-plate relative overflow-hidden', RATIO[shape], className)}>
      <img src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} decoding="async" width={1600} height={shape === 'station' ? 1200 : shape === 'panorama' ? 686 : 900} className="absolute inset-0 h-full w-full object-cover" {...(priority ? { fetchpriority: 'high' } : {})} />
      {children && <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/70 to-transparent p-4 sm:p-6">{children}</figcaption>}
    </figure>
  );
}
