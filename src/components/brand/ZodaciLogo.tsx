import icon from '@/assets/zodaci-icon.png';
import { cn } from '@/lib/utils';

/**
 * Astral Research Authority logo: star-in-orbit lens icon beside the ZODACI name and the
 * institution line. The full printed logo artwork lives in assets/zodaci-logo.png for print/social.
 */
export function ZodaciLogo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn('flex min-w-0 items-center gap-2.5', className)} aria-label="Zodaci, Astral Research Authority">
      <img src={icon} alt="" width={1024} height={1024} loading="eager" className={cn('shrink-0 object-contain', compact ? 'h-10 w-10' : 'h-12 w-12')} />
      <span className="flex min-w-0 flex-col leading-none">
        <span className={cn('font-label text-foreground', compact ? 'text-2xl' : 'text-3xl')} style={{ letterSpacing: '0.06em' }}>Zodaci</span>
        {!compact && <span className="mt-1 font-label text-[0.6rem] text-primary" style={{ letterSpacing: '0.22em' }}>Astral Research Authority</span>}
      </span>
    </div>
  );
}
