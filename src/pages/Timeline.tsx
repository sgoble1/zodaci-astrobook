import { useState } from 'react';
import { PHASES, type LifePhase } from '@/content/april';

export default function Timeline() {
  const [selected, setSelected] = useState<LifePhase>(PHASES.find(p => p.current) || PHASES[0]);
  const startYear = 1990, endYear = 2060;
  const total = endYear - startYear;

  return (
    <div className="space-y-10">
      <header>
        <div className="font-smallcaps text-[11px] text-gold">Section 14 · Life Journey & Timing</div>
        <h1 className="font-display mt-2">The timeline · 1990–2060.</h1>
        <div className="gold-rule my-5 max-w-xs" />
        <p className="max-w-2xl text-lg text-foreground/85 leading-relaxed">
          Ten life phases, from the Chiron wound of Early Life Foundation through the consecration of the Second Saturn Return. Click any phase.
        </p>
      </header>

      {/* Timeline scrubber */}
      <div className="vellum deckle p-6 overflow-x-auto">
        <div className="relative min-w-[900px] h-24">
          {/* baseline */}
          <div className="absolute inset-x-0 top-1/2 h-px bg-gold/60" />
          {/* decade ticks */}
          {Array.from({ length: 8 }, (_, i) => 1990 + i * 10).map(y => {
            const left = ((y - startYear) / total) * 100;
            return (
              <div key={y} className="absolute" style={{ left: `${left}%`, top: 0, bottom: 0 }}>
                <div className="h-full w-px bg-border" />
                <div className="absolute top-full mt-1 -translate-x-1/2 font-smallcaps text-[10px] text-muted-foreground">{y}</div>
              </div>
            );
          })}
          {/* phase markers */}
          {PHASES.map(p => {
            const start = parseInt(p.years.split('–')[0]);
            const end = parseInt(p.years.split('–')[1]);
            const left = ((start - startYear) / total) * 100;
            const width = ((end - start) / total) * 100;
            const active = selected.id === p.id;
            return (
              <button key={p.id} onClick={() => setSelected(p)}
                className={`absolute top-1/2 -translate-y-1/2 h-8 rounded border transition-all ${
                  active ? 'bg-gold text-primary-foreground border-gold z-10 scale-105'
                         : p.current ? 'bg-gold/25 border-gold/70 text-foreground'
                         : 'bg-card border-border hover:border-gold'
                }`}
                style={{ left: `${left}%`, width: `calc(${width}% - 4px)` }}
                title={`${p.title} · ${p.years}`}>
                <span className="text-[10px] font-smallcaps px-2 truncate block">{p.number}. {p.title}</span>
              </button>
            );
          })}
          {/* now marker */}
          <div className="absolute top-0 bottom-0" style={{ left: `${((2026 - startYear) / total) * 100}%` }}>
            <div className="h-full w-0.5 bg-oxblood" />
            <div className="absolute -top-2 -translate-x-1/2 font-smallcaps text-[9px] text-oxblood">NOW · 2026</div>
          </div>
        </div>
      </div>

      {/* Selected phase */}
      <div className="p-8 border border-gold/40 rounded bg-card gentle-fade" key={selected.id}>
        <div className="font-smallcaps text-[11px] text-gold">Phase {selected.number} · {selected.years} · {selected.ages}{selected.current && ' · CURRENT WINDOW'}</div>
        <h2 className="font-display mt-2">{selected.title}</h2>
        <div className="gold-rule my-4 w-16" />
        <p className="text-lg italic text-foreground/85">{selected.summary}</p>
        <p className="mt-5 text-foreground/90 leading-loose">{selected.interpretation}</p>
      </div>

      {/* All phases list */}
      <section>
        <h2 className="font-display mb-6">All ten phases</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {PHASES.map(p => (
            <button key={p.id} onClick={() => setSelected(p)}
              className={`text-left p-5 border rounded bg-card/60 hover:border-gold transition-colors ${
                p.current ? 'border-gold/60' : 'border-border'
              }`}>
              <div className="font-smallcaps text-[10px] text-gold">Phase {p.number} · {p.years}</div>
              <div className="font-display text-lg mt-1">{p.title}</div>
              <div className="text-sm text-muted-foreground mt-2">{p.summary}</div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
