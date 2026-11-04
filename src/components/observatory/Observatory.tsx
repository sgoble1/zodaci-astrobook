import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Retro television: brass cabinet, curved CRT glass with scanlines, switch-on animation and dials. */
export function RetroTV({ children, channel, label, className }: { children: ReactNode; channel?: string; label?: string; className?: string }) {
  return (
    <figure className={cn('obs-panel p-3 sm:p-4', className)}>
      <div className="obs-crt aspect-[4/3]"><div className="obs-tv-on h-full w-full">{children}</div></div>
      {(channel || label) && <figcaption className="mt-3 flex items-center justify-between gap-3">
        <span className="font-label text-xs text-primary">{channel}</span>
        <span className="truncate font-label text-xs text-muted-foreground">{label}</span>
        <span aria-hidden className="flex gap-1.5"><span className="h-3 w-3 rounded-full border border-[hsl(var(--brass))] bg-secondary" /><span className="h-3 w-3 rounded-full border border-[hsl(var(--brass))] bg-secondary" /></span>
      </figcaption>}
    </figure>
  );
}

/** Small blinking status lamp used in the console and panel headers. */
export function StatusLight({ tone = 'primary', label }: { tone?: 'primary' | 'accent' | 'info'; label?: string }) {
  const color = tone === 'accent' ? 'bg-accent' : tone === 'info' ? 'bg-[hsl(var(--constellation))]' : 'bg-primary';
  return <span className="inline-flex items-center gap-1.5"><span aria-hidden className={cn('obs-light h-2 w-2 rounded-full', color)} />{label && <span className="font-label text-[0.65rem] text-muted-foreground">{label}</span>}</span>;
}

/** Signal meter: 10 segments lit to `value` (0–10). Value always comes from real chart timing. */
export function SignalMeter({ label, value, note }: { label: string; value: number; note?: string }) {
  const v = Math.max(0, Math.min(10, Math.round(value)));
  return (
    <div>
      <div className="flex items-baseline justify-between"><span className="font-label text-xs text-foreground">{label}</span><span className="font-label text-xs text-primary">{v}/10</span></div>
      <div className="mt-1.5 grid grid-cols-10 gap-0.5" role="meter" aria-valuemin={0} aria-valuemax={10} aria-valuenow={v} aria-label={`${label} signal`}>
        {Array.from({ length: 10 }, (_, i) => <span key={i} className={cn('h-2.5 rounded-sm', i < v ? (i >= 8 ? 'bg-accent' : 'bg-primary') : 'bg-secondary')} />)}
      </div>
      {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

/** Panel heading in the poster label style, with optional status light. */
export function PanelTitle({ children, eyebrow, live }: { children: ReactNode; eyebrow?: string; live?: boolean }) {
  return <div className="mb-4 flex items-start justify-between gap-3"><div>{eyebrow && <p className="flex items-center gap-2 font-script text-xl normal-case text-primary"><span aria-hidden className="retro-starburst retro-twinkle text-sm text-accent" />{eyebrow}</p>}<h2 className="font-label text-lg text-foreground">{children}</h2></div>{live && <StatusLight label="Online" />}</div>;
}

/** Archive stamp, e.g. "Issued", "Classified: personal". */
export function Stamp({ children }: { children: ReactNode }) { return <span className="obs-stamp">{children}</span>; }

/** Constellation line drawing that draws itself in once. */
export function ConstellationDraw({ className }: { className?: string }) {
  return <svg viewBox="0 0 400 120" className={cn('w-full text-[hsl(var(--brass))]', className)} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.2">
    <path className="obs-draw" d="M10 90 L70 40 L130 70 L190 20 L250 60 L310 30 L390 80" />
    {[[10, 90], [70, 40], [130, 70], [190, 20], [250, 60], [310, 30], [390, 80]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="3" fill="hsl(var(--primary))" stroke="none" />)}
  </svg>;
}
