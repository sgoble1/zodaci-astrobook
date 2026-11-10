import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BookOpenCheck, History, NotebookPen } from 'lucide-react';
import { ordinal, readingFacts } from '@/lib/readingInsights';
import { cn } from '@/lib/utils';

/**
 * The reader's insights column: what this text itself covers (length, placements and houses it names) and where to
 * take it next. Everything here is read from the chapter's own words — no AI, nothing inferred about the reader.
 */
export function ReadingInsights({ content, sections, className, sticky = false }: { content: string; sections: number; className?: string; sticky?: boolean }) {
  const f = useMemo(() => readingFacts(content), [content]);
  if (!f.words) return null;
  return (
    <aside aria-label="About this chapter" className={cn('vellum space-y-4 p-4 text-sm', sticky && 'sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto', className)}>
      <div>
        <p className="font-label text-xs tracking-[0.16em] text-primary">About this chapter</p>
        <p className="mt-1 text-muted-foreground">About {f.minutes} min · {f.words.toLocaleString()} words{sections > 1 ? ` · ${sections} sections` : ''}</p>
      </div>
      {f.placements.length > 0 && (
        <div>
          <p className="font-label text-xs tracking-[0.14em] text-foreground/80">Placements named here</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {f.placements.map(p => <li key={p} className="rounded-sm border border-border px-2 py-0.5 text-xs text-foreground/90">{p}</li>)}
          </ul>
        </div>
      )}
      {f.houses.length > 0 && (
        <div>
          <p className="font-label text-xs tracking-[0.14em] text-foreground/80">Houses named here</p>
          <p className="mt-1 text-xs text-muted-foreground">{f.houses.map(h => `${ordinal(h)}`).join(' · ')}</p>
        </div>
      )}
      <div className="space-y-1 border-t border-border pt-3">
        <Link to="/observation-log" className="flex min-h-9 items-center gap-2 text-foreground/90 transition-colors duration-500 hover:text-primary"><NotebookPen aria-hidden className="h-4 w-4 text-primary" />Log what you notice</Link>
        <Link to="/reading-history" className="flex min-h-9 items-center gap-2 text-foreground/90 transition-colors duration-500 hover:text-primary"><History aria-hidden className="h-4 w-4 text-primary" />Reading history</Link>
        <Link to="/content-center" className="flex min-h-9 items-center gap-2 text-foreground/90 transition-colors duration-500 hover:text-primary"><BookOpenCheck aria-hidden className="h-4 w-4 text-primary" />All my readings</Link>
      </div>
      <p className="text-[11px] leading-snug text-muted-foreground">Taken from the words of this chapter only.</p>
    </aside>
  );
}
