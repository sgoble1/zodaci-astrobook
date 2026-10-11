import astroBookLogo from '@/assets/astrobook-planet.png';
import { cn } from '@/lib/utils';

export function AstroBookLogo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn('flex min-w-0 items-center gap-2', className)} aria-label="AstroBook">
      <img
        src={astroBookLogo}
        alt=""
        width={1024}
        height={1024}
        loading="lazy"
        className={cn('shrink-0 object-contain', compact ? 'h-9 w-9' : 'h-12 w-12')}
      />
      <span className={cn('font-display font-semibold leading-none text-foreground', compact ? 'text-lg' : 'text-2xl')}>AstroBook</span>
    </div>
  );
}