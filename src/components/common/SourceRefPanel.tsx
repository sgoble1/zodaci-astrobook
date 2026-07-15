import { BookOpen } from 'lucide-react';
import type { SourceRef } from '@/content/compendium';

interface Props { source: SourceRef; compact?: boolean; }

export function SourceRefPanel({ source, compact }: Props) {
  return (
    <div className={`mt-3 flex items-start gap-2 border-t border-border/60 pt-3 ${compact ? 'text-[10px]' : 'text-xs'} text-muted-foreground`}>
      <BookOpen className="w-3.5 h-3.5 mt-0.5 text-gold shrink-0" />
      <div className="leading-snug">
        <div className="font-smallcaps text-[10px] tracking-wider text-gold">PDF Source</div>
        <div>
          <span className="italic">{source.doc}</span>
          {' · '}{source.section}
          {source.page && <span className="text-foreground/70"> · {source.page}</span>}
        </div>
      </div>
    </div>
  );
}
