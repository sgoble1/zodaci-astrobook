import { useMemo, useState } from 'react';
import type { ChartResult } from '@/lib/astro';
import { memberTimeline, openingRow, type TimelineRow } from '@/lib/memberTimeline';
import { cn } from '@/lib/utils';

const STATUS_LABEL: Record<TimelineRow['status'], string> = { passed: 'Passed', now: 'Now', ahead: 'Ahead' };
const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
const LANE_TOP = ['9%', '25%', '41%', '57%', '73%'];

/**
 * Timeline Hall wall: the member's own cycle dates (returns, squares, oppositions) pinned across ninety years,
 * with today's marker and a reading card for the chosen pin. Timing only — never biography.
 */
export function CycleWall({ chart, birthYear, list = false }: { chart: ChartResult; birthYear: number; list?: boolean }) {
  const now = useMemo(() => new Date(), []);
  const rows = useMemo(() => memberTimeline(chart, now), [chart, now]);
  const [picked, setPicked] = useState<string | null>(null);
  const selected = rows.find(r => r.key === picked) ?? openingRow(rows);
  const startYear = birthYear, endYear = startYear + 90, span = endYear - startYear;
  const pos = (year: number) => `${Math.max(0, Math.min(100, ((year - startYear) / span) * 100))}%`;
  const nowYear = now.getFullYear();
  // Lay pins into up to five lanes so labels never overlap (label width estimated in years at the 820px minimum).
  const lane = useMemo(() => {
    const ends: number[] = [];
    return new Map(rows.map(r => {
      const x = r.year + r.date.getUTCMonth() / 12, w = (r.title.length * 6.5 + 30) / (820 / span);
      let l = ends.findIndex(end => end < x);
      if (l < 0) l = ends.length < LANE_TOP.length ? ends.length : ends.indexOf(Math.min(...ends));
      ends[l] = x + w;
      return [r.key, l] as const;
    }));
  }, [rows, span]);
  if (!rows.length) return null;
  return (
    <div className="space-y-6">
      <section aria-label="Cycle wall" className="obs-panel p-4 sm:p-6">
        <div className="overflow-x-auto pb-7 pt-1">
          <div className="min-w-[820px] pr-32">
          <div className="relative h-40">
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-primary/50" />
            {Array.from({ length: 10 }, (_, i) => startYear + i * 10).map(y => (
              <div key={y} aria-hidden className="absolute bottom-0 top-0" style={{ left: pos(y) }}>
                <div className="h-full w-px bg-border/70" />
                <div className="absolute top-full mt-1 -translate-x-1/2 font-label text-[0.7rem] text-muted-foreground">{y}</div>
              </div>
            ))}
            {rows.map(r => (
              <button key={r.key} type="button" onClick={() => setPicked(r.key)} aria-pressed={selected?.key === r.key}
                aria-label={`${r.title}, ${fmt(r.date)}, age ${r.age}, ${STATUS_LABEL[r.status].toLowerCase()}`}
                className={cn('timeline-pin', `timeline-pin-${r.status}`, selected?.key === r.key && 'timeline-pin-on')}
                style={{ left: pos(r.year + r.date.getUTCMonth() / 12), top: LANE_TOP[lane.get(r.key) ?? 0] }}>
                <span aria-hidden className="timeline-pin-dot" /><span className="timeline-pin-label">{r.title}</span>
              </button>
            ))}
            <div aria-hidden className="absolute bottom-0 top-0" style={{ left: pos(nowYear + now.getMonth() / 12) }}>
              <div className="h-full w-0.5 bg-accent" />
              <div className="absolute -top-1 -translate-x-1/2 whitespace-nowrap rounded-sm bg-background/80 px-1 font-label text-[0.7rem] text-accent">Now · {nowYear}</div>
            </div>
          </div>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Dates are the first exact pass; most cycles are felt for several months either side.</p>
      </section>

      {selected && (
        <article key={selected.key} className="obs-paper gentle-fade p-6 sm:p-8" aria-live="polite">
          <p className="font-label text-xs tracking-widest text-accent">{fmt(selected.date)} · age {selected.age} · {STATUS_LABEL[selected.status]}</p>
          <h3 className="mt-2 font-display text-2xl sm:text-3xl">{selected.title}</h3>
          <p className="mt-3 text-sm text-muted-foreground">Transiting {selected.planet} {selected.angle === 0 ? 'returns to' : selected.angle === 90 ? 'squares' : 'opposes'} your natal {selected.planet}.</p>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed">{selected.meaning}</p>
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground">This describes the cycle, not what happened to you. Your own story fills it in.</p>
        </article>
      )}

      {list && (
        <section aria-labelledby="all-cycles">
          <h3 id="all-cycles" className="mb-4 font-display text-2xl">Every cycle in your chart</h3>
          <ul className="grid gap-3 md:grid-cols-2">
            {rows.map(r => (
              <li key={r.key}>
                <button type="button" onClick={() => setPicked(r.key)} className={cn('obs-panel w-full p-4 text-left transition-colors duration-700 hover:border-primary/70', r.status === 'now' && 'border-primary/70')}>
                  <span className="font-label text-xs tracking-widest text-primary">{fmt(r.date)} · age {r.age} · {STATUS_LABEL[r.status]}</span>
                  <span className="mt-1 block font-display text-lg">{r.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
