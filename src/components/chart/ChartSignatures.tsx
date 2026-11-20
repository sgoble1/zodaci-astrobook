import type { ChartResult } from '@/lib/astro';
import { detectPatterns, retroGood } from '@/lib/chartPatterns';

/** Rare chart signatures and the natal retrograde count, all calculated (no AI). */
export function ChartSignatures({ chart, timeKnown }: { chart: ChartResult; timeKnown: boolean }) {
  // Without a birth time the Moon's exact phase and the angles are unknown, so timing-based patterns are left out.
  const patterns = detectPatterns(timeKnown ? chart : { ...chart, asc: null, cusps: null, utc: null });
  const rg = retroGood(chart);
  return (
    <section aria-labelledby="sig" className="space-y-4">
      <h2 id="sig" className="font-display text-2xl">Your chart signatures</h2>
      <div className="rounded border border-border bg-card p-4">
        <h3 className="font-display text-lg">Natal retrogrades · {rg.planets.length}</h3>
        <p className="mt-1 text-sm">Retrograde placements are traditionally associated with review and reflection, not a measure of personal strength.</p>
        {rg.planets.length > 0 && <p className="mt-1 text-xs text-muted-foreground">Retrograde at birth: {rg.planets.join(', ')}</p>}
      </div>
      {patterns.length ? <ul className="grid gap-3 sm:grid-cols-2">{patterns.map((p, i) => (
        <li key={p.code + i} className="rounded border border-border bg-card p-4"><h3 className="font-medium">{p.title}</h3><p className="mt-1 text-sm text-muted-foreground">{p.detail}</p></li>
      ))}</ul> : <p className="text-sm text-muted-foreground">No rare configurations (grand trine, T-square, stellium, bucket shape and others) were found in your chart.</p>}
      <p className="text-xs text-muted-foreground">Calculated directly from your chart positions.</p>
    </section>
  );
}
