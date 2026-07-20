import { useState } from 'react';
import { ChevronDown, Sigma } from 'lucide-react';
import type { SourceRef } from '@/content/compendium';
import type { ConfidenceLevel } from '@/content/confidence';
import { ConfidenceBadge } from './ConfidenceBadge';

export interface ReasoningInput { label: string; value: string; source?: SourceRef; }
export interface ReasoningStep  { label: string; detail: string; }

export interface Reasoning {
  inputs: ReasoningInput[];
  steps: ReasoningStep[];
  output: string;
  confidence: ConfidenceLevel;
  caveats?: string[];
}

interface Props { reasoning: Reasoning; defaultOpen?: boolean; }

/** Collapsible "How this is calculated" panel. Shows the exact inputs, the
 *  ordered derivation steps, the output claim, and a confidence badge. */
export function ReasoningPanel({ reasoning, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mt-4 border border-border/70 rounded bg-muted/20">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-3 px-3 py-2 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <Sigma className="w-3.5 h-3.5 text-gold" />
          <span className="font-smallcaps text-[10px] tracking-wider text-gold">How this is calculated</span>
        </div>
        <div className="flex items-center gap-2">
          <ConfidenceBadge level={reasoning.confidence} compact />
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1 space-y-3 text-xs leading-relaxed">
          {reasoning.inputs.length > 0 && (
            <div>
              <div className="font-smallcaps text-[9px] text-muted-foreground mb-1">Inputs</div>
              <ul className="space-y-1">
                {reasoning.inputs.map((i, ix) => (
                  <li key={ix} className="flex gap-2">
                    <span className="text-muted-foreground min-w-[8rem]">{i.label}</span>
                    <span className="font-mono text-foreground/90">{i.value}</span>
                    {i.source && <span className="italic text-muted-foreground">· {i.source.section}{i.source.page ? ` ${i.source.page}` : ''}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {reasoning.steps.length > 0 && (
            <div>
              <div className="font-smallcaps text-[9px] text-muted-foreground mb-1">Derivation</div>
              <ol className="space-y-1 list-decimal list-inside marker:text-gold">
                {reasoning.steps.map((s, ix) => (
                  <li key={ix}><span className="font-medium">{s.label}</span> — <span className="text-foreground/80">{s.detail}</span></li>
                ))}
              </ol>
            </div>
          )}
          <div>
            <div className="font-smallcaps text-[9px] text-muted-foreground mb-1">Output</div>
            <div className="italic text-foreground/90">{reasoning.output}</div>
          </div>
          {reasoning.caveats && reasoning.caveats.length > 0 && (
            <div>
              <div className="font-smallcaps text-[9px] text-oxblood mb-1">Caveats</div>
              <ul className="list-disc list-inside text-foreground/70 space-y-0.5">
                {reasoning.caveats.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
