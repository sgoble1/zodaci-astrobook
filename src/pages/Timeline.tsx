import { useMemo, useState } from 'react';
import { BIRTH, PHASES, type LifePhase } from '@/content/april';
import { SourceChapters } from '@/components/common/SourceChapters';
import { StartLink } from '@/components/common/StartLink';
import { PanelTitle } from '@/components/observatory/Observatory';
import { Button } from '@/components/ui/button';
import { useAprilSpace } from '@/hooks/useAprilSpace';
import { computeChart } from '@/lib/astro';
import { toChartInput, useMyBirth } from '@/lib/myBirth';
import { CycleWall } from '@/components/timeline/CycleWall';

/**
 * Timeline Hall. April's original edition keeps her ten written life phases; every other account sees its own
 * calculated cycles (returns, squares, oppositions) from its own saved chart — never another person's phases.
 */
export default function Timeline() {
  const april = useAprilSpace();
  if (april === undefined) return <p role="status" className="text-muted-foreground">Opening Timeline Hall…</p>;
  return april && PHASES.length > 0 ? <AprilTimeline /> : <MemberTimeline />;
}

const NOW_YEAR = () => new Date().getFullYear();

function MemberTimeline() {
  const birth = useMyBirth();
  const chart = useMemo(() => { if (!birth) return null; try { return computeChart(toChartInput(birth)); } catch { return null; } }, [birth]);
  if (birth === undefined) return <p role="status" className="text-muted-foreground">Opening your chart…</p>;
  if (!birth || !chart) return (
    <div className="obs-panel max-w-2xl space-y-4 p-6">
      <PanelTitle eyebrow="Timeline Hall">Your timeline needs your birth details</PanelTitle>
      <p className="text-muted-foreground">The dates on this wall are calculated from your own chart, so we need your birth date, time and place first.</p>
      <Button asChild variant="signal"><StartLink>Open birth details</StartLink></Button>
    </div>
  );
  const startYear = Number(birth.date.slice(0, 4));
  return (
    <div className="space-y-8">
      <header className="max-w-3xl space-y-3">
        <h1 className="font-display text-3xl sm:text-4xl">{birth.name ? `${birth.name}’s timeline` : 'Your timeline'} · {startYear}–{startYear + 90}</h1>
        <p className="text-lg leading-relaxed text-foreground/85">These are the big cycles in your chart, dated from the ephemeris: when Jupiter and Saturn come back to where they were at your birth, and when the slow planets square or oppose themselves. Pick any marker to read it.</p>
      </header>
      <CycleWall chart={chart} birthYear={startYear} list />
    </div>
  );
}

function AprilTimeline() {
  const [selected, setSelected] = useState<LifePhase>(PHASES.find(p => p.current) || PHASES[0]);
  const startYear = Number(BIRTH.date.match(/\d{4}/)?.[0] ?? 2000), endYear = startYear + 70;
  const total = endYear - startYear;
  const nowYear = NOW_YEAR();
  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display mt-2">The timeline · {startYear}–{endYear}.</h1>
        <div className="gold-rule my-5 max-w-xs" />
        <p className="max-w-2xl text-lg text-foreground/85 leading-relaxed">
          Ten life phases, from the Chiron wound of Early Life Foundation through the consecration of the Second Saturn Return. Click any phase.
        </p>
      </header>

      <div className="obs-panel p-6 overflow-x-auto">
        <div className="relative min-w-[900px] h-24">
          <div className="absolute inset-x-0 top-1/2 h-px bg-primary/60" />
          {Array.from({ length: 8 }, (_, i) => startYear + i * 10).map(y => {
            const left = ((y - startYear) / total) * 100;
            return (
              <div key={y} className="absolute" style={{ left: `${left}%`, top: 0, bottom: 0 }}>
                <div className="h-full w-px bg-border" />
                <div className="absolute top-full mt-1 -translate-x-1/2 font-label text-[10px] text-muted-foreground">{y}</div>
              </div>
            );
          })}
          {PHASES.map(p => {
            const start = parseInt(p.years.split('–')[0]);
            const end = parseInt(p.years.split('–')[1]);
            const left = ((start - startYear) / total) * 100;
            const width = ((end - start) / total) * 100;
            const active = selected.id === p.id;
            return (
              <button key={p.id} onClick={() => setSelected(p)} aria-pressed={active}
                className={`absolute top-1/2 -translate-y-1/2 h-8 rounded border transition-all duration-700 ${
                  active ? 'bg-primary text-primary-foreground border-primary z-10 scale-105'
                         : p.current ? 'bg-primary/25 border-primary/70 text-foreground'
                         : 'bg-card border-border hover:border-primary'
                }`}
                style={{ left: `${left}%`, width: `calc(${width}% - 4px)` }}
                title={`${p.title} · ${p.years}`}>
                <span className="text-[10px] font-label px-2 truncate block">{p.number}. {p.title}</span>
              </button>
            );
          })}
          <div className="absolute top-0 bottom-0" style={{ left: `${((nowYear - startYear) / total) * 100}%` }}>
            <div className="h-full w-0.5 bg-accent" />
            <div className="absolute -top-2 -translate-x-1/2 font-label text-[9px] text-accent">NOW · {nowYear}</div>
          </div>
        </div>
      </div>

      <div className="obs-paper p-8 gentle-fade" key={selected.id}>
        <div className="font-label text-[11px] text-accent">{selected.years} · {selected.ages}{selected.current && ' · CURRENT WINDOW'}</div>
        <h2 className="font-display mt-2">{selected.title}</h2>
        <div className="gold-rule my-4 w-16" />
        <p className="text-lg italic text-foreground/85">{selected.summary}</p>
        <p className="mt-5 text-foreground/90 leading-loose">{selected.interpretation}</p>
      </div>

      <section>
        <h2 className="font-display mb-6">All ten phases</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {PHASES.map(p => (
            <button key={p.id} onClick={() => setSelected(p)}
              className={`obs-panel text-left p-5 transition-colors duration-700 hover:border-primary ${p.current ? 'border-primary/60' : ''}`}>
              <div className="font-label text-[10px] text-primary">Phase {p.number} · {p.years}</div>
              <div className="font-display text-lg mt-1">{p.title}</div>
              <div className="text-sm text-muted-foreground mt-2">{p.summary}</div>
            </button>
          ))}
        </div>
      </section>
      <SourceChapters match={/timeline|life phase|decade|age \d|\b(19|20)\d\d\b|return|progress|solar arc|solar return/i} ids={['v2-04', 'v2-05', 'v2-06', 'v2-18']} title="Timing & cycles — complete source chapters" />
    </div>
  );
}
