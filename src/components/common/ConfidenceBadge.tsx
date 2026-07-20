import { Link } from 'react-router-dom';
import { CONFIDENCE_STYLE, type ConfidenceLevel } from '@/content/confidence';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface Props {
  level: ConfidenceLevel;
  note?: string;
  compact?: boolean;
}

/** Small pill announcing how trustworthy a piece of derived data is, with a
 *  tooltip that names the ambiguity and links to /data-quality. */
export function ConfidenceBadge({ level, note, compact }: Props) {
  const s = CONFIDENCE_STYLE[level];
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to="/data-quality"
            className={`inline-flex items-center gap-1 rounded-full border font-smallcaps tracking-wider ${s.className} ${compact ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-0.5'}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {s.label}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
          {note ?? 'How this insight was derived — see the Data Quality page for full audit trail.'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
