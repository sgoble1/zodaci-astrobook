import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Page-opening poster: a 1950s atomic-age scene under a soft indigo wash, with the Bebas eyebrow, Alfa Slab
 * headline and Yellowtail script line used by the home hero. Shared so public pages open the same way.
 */
export function PosterHeader({ img, alt, eyebrow, title, script, children, className, tall = false }: {
  img: string; alt: string; eyebrow: string; title: ReactNode; script?: string; children?: ReactNode; className?: string; tall?: boolean;
}) {
  return (
    <header className={cn('poster-header relative overflow-hidden', className)}>
      <img src={img} alt={alt} width={1536} height={640} {...{ fetchpriority: 'high' }} decoding="async" className={cn('w-full object-cover', tall ? 'h-80 sm:h-[26rem]' : 'h-64 sm:h-80')} />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/5" />
      <div aria-hidden className="poster-header-grain absolute inset-0" />
      <div className="absolute inset-x-0 bottom-0 max-w-3xl p-5 sm:p-9">
        <p className="font-label text-sm tracking-[0.2em] text-primary">{eyebrow}</p>
        <h1 className="mt-2 font-display text-[clamp(2rem,6vw,3.6rem)] uppercase leading-[0.95] text-foreground">{title}</h1>
        {script && <p className="mt-2 font-script text-2xl text-primary sm:text-3xl">{script}</p>}
        {children && <div className="mt-3 max-w-2xl text-foreground/85">{children}</div>}
      </div>
    </header>
  );
}
