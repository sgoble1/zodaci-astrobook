import { useMemo } from 'react';
import planetCore from '@/assets/zodaci-planet-core.png';
import clouds from '@/assets/zodaci-clouds.png';
import { cn } from '@/lib/utils';

const SEEN_KEY = 'zodaci:logo-clouds-seen';

/** Original planet logo; on a visitor's first arrival the clouds drift in sideways once, then rest. */
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
      <span className={cn('relative shrink-0 drop-shadow-lg', compact ? 'h-12 w-12' : 'h-16 w-16')}>
        <img src={planetCore} alt="" width={1024} height={1024} loading="eager" className="absolute inset-0 h-full w-full object-contain" />
        <img src={clouds} alt="" aria-hidden width={1024} height={1024} loading="eager" className={cn('absolute inset-0 h-full w-full object-contain', arrive && 'logo-clouds--arrive')} />
      </span>
      <span className={cn('font-display leading-none text-silver tracking-tight', compact ? 'text-2xl' : 'text-4xl')}>Zodaci</span>
    </div>
  );
}
