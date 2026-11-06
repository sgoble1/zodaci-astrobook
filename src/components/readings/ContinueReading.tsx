import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { isFinished, type SavedProgress } from '@/lib/readingProgress';
import { cn } from '@/lib/utils';

/** Link that reopens a reading at the section where the reader stopped. */
export const resumeHref = (r: Pick<SavedProgress, 'path' | 'section_id' | 'progress'>) => `${r.path}${r.section_id && !isFinished(r.progress) ? `#${r.section_id}` : ''}`;
export const readOn = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

/** One saved reading: title, last section, a thin progress bar and a resume link, on a cream plate. */
export function ProgressCard({ row, className, children }: { row: SavedProgress; className?: string; children?: React.ReactNode }) {
  const done = isFinished(row.progress);
  return (
    <div className={cn('obs-paper flex flex-col gap-3 p-4 sm:p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-label text-xs tracking-[0.14em] text-primary">Last read {readOn(row.last_read_at)}</p>
          <h3 className="mt-1 font-display text-xl leading-snug">{row.title}</h3>
          {row.section_title && !done && <p className="mt-1 text-sm text-muted-foreground">Stopped at “{row.section_title}”</p>}
        </div>
        {done && <span className="inline-flex shrink-0 items-center gap-1 font-label text-xs tracking-[0.14em] text-primary"><CheckCircle2 aria-hidden className="h-3.5 w-3.5" />Finished</span>}
      </div>
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[hsl(var(--comic-navy)/0.15)]" role="progressbar" aria-label={`${row.title}: ${row.progress}% read`} aria-valuenow={row.progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-[hsl(var(--comic-brick))]" style={{ width: `${row.progress}%` }} />
        </div>
        <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">{row.progress}%</span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link to={resumeHref(row)} className="inline-flex items-center gap-1.5 font-label text-sm tracking-[0.12em] text-accent underline-offset-4 hover:underline">{done ? 'Read again' : 'Continue reading'}<ArrowRight aria-hidden className="h-4 w-4" /></Link>
        {children}
      </div>
    </div>
  );
}
