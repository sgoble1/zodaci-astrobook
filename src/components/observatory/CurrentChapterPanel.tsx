import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { ChartResult } from '@/lib/astro';
import { transitsTo } from '@/lib/transitOverlay';
import { chapterFrom, compassFrom, type CompassDomain } from '@/lib/currentChapter';
import { RetroTV, SignalMeter, PanelTitle, StatusLight } from './Observatory';
import { Button } from '@/components/ui/button';
import hero from '@/assets/observatory-hero.jpg';

/** Broadcast Studio: Current Chapter on a retro TV plus the six Life Compass signals, from today's real transits. */
export function CurrentChapterPanel({ chart, name }: { chart: ChartResult; name?: string }) {
  const hits = useMemo(() => { try { return transitsTo(chart, new Date()); } catch { return []; } }, [chart]);
  const chapter = chapterFrom(hits);
  const compass = compassFrom(hits);
  return (
    <section aria-labelledby="cc-h" className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <div className="obs-panel p-5 sm:p-6">
        <PanelTitle eyebrow={`Broadcast Studio · Channel 01${name ? ` · ${name}` : ''}`} live><span id="cc-h">Current Chapter</span></PanelTitle>
        <RetroTV channel="On air" label={chapter.hit ? `${chapter.hit.transit.name} ${chapter.hit.symbol} ${chapter.hit.natalName}` : 'Quiet sky'}>
          <div className="relative h-full w-full">
            <img src={hero} alt="" width={1920} height={1088} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-right opacity-60" />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-background via-background/60 to-transparent p-5">
              <p className="font-label text-xs text-primary">Now transmitting</p>
              <h3 className="mt-1 font-display text-3xl leading-tight sm:text-4xl">{chapter.title}</h3>
            </div>
          </div>
        </RetroTV>
        <p className="mt-4 leading-relaxed text-muted-foreground">{chapter.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2"><Button asChild variant="signal" size="sm"><Link to="/transits">Open the Forecast Center</Link></Button><Button asChild variant="outline" size="sm"><Link to="/timeline">Timeline Hall</Link></Button></div>
      </div>
      <div className="obs-panel p-5 sm:p-6">
        <PanelTitle eyebrow="Analyst’s desk">Life Compass</PanelTitle>
        <div className="space-y-4">{(Object.keys(compass) as CompassDomain[]).map(d => <SignalMeter key={d} label={d} value={compass[d]} />)}</div>
        <p className="mt-5 text-xs text-muted-foreground"><StatusLight tone="info" /> Signal strength counts how strongly today’s planets touch the chart points tied to each area. It measures activity, not good or bad luck.</p>
      </div>
    </section>
  );
}
