import { ZodaciMark } from './ZodaciMark';
import { cn } from '@/lib/utils';

/**
 * Astral Research Authority logo: star-in-orbit lens icon beside the ZODACI name and the
 * institution line. The full printed logo artwork lives in assets/zodaci-logo.png for print/social.
 */
export function ZodaciLogo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn('flex min-w-0 items-center gap-2.5', className)} aria-label="Zodaci, Astral Research Authority">
      <ZodaciMark className={cn('shrink-0 text-foreground', compact ? 'h-9 w-9' : 'h-10 w-10')} />
      <span className="flex min-w-0 flex-col leading-none">
        <span className={cn('font-display uppercase text-foreground', compact ? 'text-xl' : 'text-2xl')}>Zodaci</span>
        {!compact && <span className="mt-1 font-label text-[0.65rem] text-muted-foreground">Astral Research Authority</span>}
      </span>
    </div>
  );
}
