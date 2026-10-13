import astroBookLogo from '@/assets/astrobook-planet.png';
import { cn } from '@/lib/utils';

export function ZodaciLogo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn('flex min-w-0 items-center gap-2', className)} aria-label="Zodaci">
      <img
        src={astroBookLogo}
        alt=""
        width={1024}
        height={1024}
        loading="eager"
        className={cn('shrink-0 object-contain drop-shadow-lg', compact ? 'h-12 w-12' : 'h-16 w-16')}
      />
      <span className={cn('font-display font-semibold leading-none text-foreground', compact ? 'text-xl' : 'text-3xl')}>Zodaci</span>
    </div>
  );
}