import { useMemo } from 'react';
import planetCore from '@/assets/zodaci-planet-core.png';
import { cn } from '@/lib/utils';

const SEEN_KEY = 'zodaci:logo-clouds-seen';

/** Puffy cloud wisps that hug the planet's rim; drawn so the whole group can orbit. */
function CloudRing({ arrive }: { arrive: boolean }) {
  const puff = (cx: number, cy: number, rot: number, s = 1) => (
    <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${s})`}>
      <ellipse cx="0" cy="0" rx="22" ry="9" />
      <circle cx="-10" cy="-4" r="8" />
      <circle cx="4" cy="-7" r="9.5" />
      <circle cx="15" cy="-2" r="6.5" />
    </g>
  );
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={cn('absolute inset-0 h-full w-full', arrive ? 'logo-clouds--arrive' : 'logo-clouds')}>
      <defs>
        <radialGradient id="zc-cloud" cx="40%" cy="30%" r="80%">
          <stop offset="0%" stopColor="hsl(var(--foreground))" />
          <stop offset="100%" stopColor="hsl(var(--muted-foreground))" />
        </radialGradient>
      </defs>
      <g fill="url(#zc-cloud)" opacity="0.95">
        {puff(32, 26, -40)}
        {puff(96, 60, 80, 0.85)}
        {puff(38, 96, 35, 0.95)}
      </g>
    </svg>
  );
}

export function ZodaciLogo({ compact = false, className }: { compact?: boolean; className?: string }) {
  const arrive = useMemo(() => {
    try {
      if (localStorage.getItem(SEEN_KEY)) return false;
      localStorage.setItem(SEEN_KEY, '1');
      return true;
    } catch {
      return false;
    }
  }, []);
  return (
    <div className={cn('flex min-w-0 items-center gap-2', className)} aria-label="Zodaci">
      <span className={cn('relative shrink-0', compact ? 'h-12 w-12' : 'h-16 w-16')}>
        <img src={planetCore} alt="" width={1024} height={1024} loading="eager" className="absolute inset-[14%] h-[72%] w-[72%] object-contain drop-shadow-lg" />
        <CloudRing arrive={arrive} />
      </span>
      <span className={cn('font-display leading-none text-silver tracking-tight', compact ? 'text-2xl' : 'text-4xl')}>Zodaci</span>
    </div>
  );
}
