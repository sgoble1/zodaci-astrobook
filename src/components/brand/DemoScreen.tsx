import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SAMPLE_READER } from '@/content/sampleBookLeaves';

/** Clickable walk-through of a member's first visit, using the fictional sample reader only. Replaces the promo film on /demo. */
const BORN = SAMPLE_READER.printed.born;

export const DEMO_STEPS = [
  { label: 'Birth details', title: 'Start with the birth moment', body: 'Date, time and town. If the time is unknown, Zodaci says so and leaves out the parts that depend on it.', rows: [['Born', BORN]] },
  { label: 'Your chart', title: 'Every placement, calculated', body: 'Planets, houses and angles are worked out from astronomical data, not picked from a list.', rows: [['Sun', 'Taurus · 12th house'], ['Moon', 'Cancer 13°28′ · 3rd house'], ['Rising', 'Taurus 12°47′']] },
  { label: 'A reading', title: 'Readings that show their working', body: 'Each paragraph names the placement it comes from, so you can check it against your chart.', rows: [['Chapter', 'Emotional World'], ['Based on', 'Moon in Cancer, 3rd house'], ['Length', 'About 1,000 words']] },
  { label: 'Your book', title: 'Keep it on the shelf', body: 'Readings can be gathered into an AstroBook or an AstroComic issue, previewed before anything is printed.', rows: [['Format', 'AstroBook or AstroComic'], ['Preview', 'Before you order'], ['Printed', 'Only when you say so']] },
] as const;

export function DemoScreen() {
  const [i, setI] = useState(0);
  const s = DEMO_STEPS[i];
  return (
    <div className="obs-panel p-5 sm:p-8 space-y-5">
      <div role="tablist" aria-label="Demo steps" className="flex flex-wrap gap-1">
        {DEMO_STEPS.map((d, n) => <Button key={d.label} role="tab" aria-selected={n === i} size="sm" variant={n === i ? 'default' : 'ghost'} onClick={() => setI(n)}>{n + 1}. {d.label}</Button>)}
      </div>
      <div role="tabpanel" className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-2xl">{s.title}</h3>
          <p className="text-muted-foreground leading-relaxed">{s.body}</p>
          <p className="text-xs text-muted-foreground">Sample reader: {SAMPLE_READER.name}, a fictional person.</p>
        </div>
        <dl className="border border-border bg-background/40 p-4 space-y-2 font-mono text-sm">
          {s.rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4 border-b border-border/50 pb-2 last:border-0"><dt className="text-muted-foreground">{k}</dt><dd>{v}</dd></div>)}
        </dl>
      </div>
      <div className="flex flex-wrap gap-2">
        {i < DEMO_STEPS.length - 1 ? <Button onClick={() => setI(i + 1)}>Next step</Button> : <Button asChild><Link to="/auth?mode=signup&next=/start">Start with your own chart</Link></Button>}
        {i > 0 && <Button variant="outline" onClick={() => setI(i - 1)}>Back</Button>}
      </div>
    </div>
  );
}
