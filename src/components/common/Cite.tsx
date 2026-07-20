import { BookOpen } from 'lucide-react';
import type { SourceRef } from '@/content/compendium';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Props { source: SourceRef; n?: number; }

/** Inline citation superscript. Renders like [1] and opens a small popover
 *  with the exact document / section / page reference. */
export function Cite({ source, n }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="align-super text-[9px] font-smallcaps text-gold hover:text-foreground border-b border-gold/40 hover:border-foreground/60 mx-0.5 leading-none">
          {n != null ? `[${n}]` : '[cite]'}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 text-xs leading-snug">
        <div className="flex items-start gap-2">
          <BookOpen className="w-3.5 h-3.5 mt-0.5 text-gold shrink-0" />
          <div>
            <div className="font-smallcaps text-[9px] tracking-wider text-gold">PDF Source</div>
            <div className="italic mt-0.5">{source.doc}</div>
            <div className="text-muted-foreground">{source.section}{source.page && ` · ${source.page}`}</div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Small list of all sources cited in a drawer body. */
export function SourcesList({ sources }: { sources: SourceRef[] }) {
  return (
    <div className="mt-4 border-t border-border/60 pt-3">
      <div className="font-smallcaps text-[10px] tracking-wider text-gold mb-1.5">Cited in</div>
      <ol className="space-y-1 text-xs text-muted-foreground list-decimal list-inside">
        {sources.map((s, i) => (
          <li key={i}>
            <span className="italic text-foreground/80">{s.doc}</span> · {s.section}{s.page && ` · ${s.page}`}
          </li>
        ))}
      </ol>
    </div>
  );
}
