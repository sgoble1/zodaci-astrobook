import type { ReactNode } from 'react';
import { SpotArt, type SpotKind } from '@/components/art/SpotArt';
import { cn } from '@/lib/utils';

/**
 * Member-page opening plate: Bebas eyebrow, Alfa Slab title, Yellowtail script line and an optional spot drawing, on a
 * dark instrument panel. Sits under the place banner AppShell already shows, so it never repeats the place's scene.
 */
export function PageHead({ eyebrow, title, script, art, children, actions, className, as: Tag = 'h1' }: {
  eyebrow: string; title: ReactNode; script?: string; art?: SpotKind; children?: ReactNode; actions?: ReactNode; className?: string; as?: 'h1' | 'h2';
}) {
  return (
    <header className={cn('obs-panel page-head flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-7', className)}>
      {art && <SpotArt kind={art} className="hidden h-24 w-24 shrink-0 sm:inline-flex" />}
      <div className="min-w-0 flex-1">
        <p className="font-label text-xs tracking-[0.16em] text-primary">{eyebrow}</p>
        <Tag className="mt-1 break-words font-display text-3xl leading-snug sm:text-4xl">{title}</Tag>
        {script && <p className="mt-1 font-script text-2xl text-primary sm:text-[1.7rem]">{script}</p>}
        {children && <div className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{children}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">{actions}</div>}
    </header>
  );
}
