import { useMemo } from 'react';
import type { ChartResult } from '@/lib/astro';
import { detectPatterns, rankPatterns } from '@/lib/chartPatterns';
import { shadowBreakthroughBlock } from '@/content/shadowBreakthrough';
import type { Tone } from '@/lib/perception';

/**
 * Shadow and Breakthrough (spec §7): the five most significant patterns in the member's chart, each shown as a pair.
 * A shadow is never shown alone. Tone changes the voice: Educational adds a definition; Professional is third person.
 */
export function ShadowBreakthrough({ chart, timeKnown, tone }: { chart: ChartResult; timeKnown: boolean; tone: Tone }) {
  const items = useMemo(() => shadowBreakthroughBlock(rankPatterns(detectPatterns(timeKnown ? chart : { ...chart, asc: null, cusps: null, utc: null }), chart), tone), [chart, timeKnown, tone]);
  if (!items.length) return null;
  return (
    <section aria-labelledby="sb-h" className="space-y-4">
      <div>
        <h2 id="sb-h" className="font-display text-2xl">Shadow and breakthrough</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your {items.length} most significant patterns, ranked by how closely they involve your Sun, Moon and Ascendant. Each one has a form under pressure and a form it grows into.</p>
      </div>
      <ol className="space-y-3">
        {items.map((it, i) => (
          <li key={it.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-xl">{it.source}</h3>
              <span className="text-xs text-muted-foreground">{i === 0 ? 'Most significant' : `Rank ${i + 1}`} · {it.title}</span>
            </div>
            {it.definition && <p className="mt-1 text-sm italic text-muted-foreground">{it.definition}</p>}
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-border/60 bg-muted/40 p-3"><p className="font-smallcaps text-xs text-muted-foreground">Under pressure</p><p className="mt-1">{it.shadow}</p></div>
              <div className="rounded-lg border border-gold/40 bg-gold/10 p-3"><p className="font-smallcaps text-xs text-gold">Breakthrough</p><p className="mt-1">{it.breakthrough}</p></div>
            </div>
            {it.practice && <p className="mt-3 text-sm"><span className="text-gold">Practice: </span>{it.practice}.</p>}
          </li>
        ))}
      </ol>
    </section>
  );
}
