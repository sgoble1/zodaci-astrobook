import { SourceChapters } from '@/components/common/SourceChapters';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ASPECTS, PLACEMENTS, type Aspect } from '@/content/april';

const typeColor: Record<Aspect['type'], string> = {
  Conjunction: 'hsl(var(--gold))',
  Opposition:  'hsl(20 65% 55%)',
  Square:      'hsl(0 55% 55%)',
  Trine:       'hsl(140 40% 50%)',
  Sextile:     'hsl(200 45% 55%)',
};

export default function Aspects() {
  const [filter, setFilter] = useState<Aspect['type'] | 'All'>('All');
  const [selected, setSelected] = useState<Aspect | null>(null);

  const filtered = filter === 'All' ? ASPECTS : ASPECTS.filter(a => a.type === filter);
  const types: (Aspect['type'] | 'All')[] = ['All', 'Conjunction', 'Opposition', 'Square', 'Trine', 'Sextile'];

  return (
    <div className="space-y-10">
      <header>
        <div className="font-smallcaps text-[11px] text-gold">Section 4 · Major Aspects</div>
        <h1 className="font-display mt-2">The geometry of the chart.</h1>
        <div className="gold-rule my-5 max-w-xs" />
        <p className="max-w-2xl text-lg text-foreground/85 leading-relaxed">
          These are the major planet-to-planet aspects independently confirmed from April’s recorded birth data. The closest include Mars sextile Jupiter, Moon square Uranus, Mercury sextile Pluto, and Sun sextile Pluto. Click any row for its plain-language reading.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded border font-smallcaps text-[10px] transition-colors ${
              filter === t ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-gold'
            }`}>{t}</button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.05fr,0.95fr] gap-8">
        <div className="border border-border rounded bg-card/60 divide-y divide-border/70">
          {filtered.map((a, i) => {
            const A = PLACEMENTS.find(p => p.key === a.a)!;
            const B = PLACEMENTS.find(p => p.key === a.b)!;
            const active = selected === a;
            return (
              <button key={i} onClick={() => setSelected(a)}
                className={`w-full text-left px-4 py-3.5 flex items-center gap-4 hover:bg-muted/40 ${active ? 'bg-muted/40' : ''}`}>
                <div className="flex items-center gap-2 text-xl min-w-[70px]">
                  <span className="text-gold">{A.glyph}</span>
                  <span className="w-4 h-px" style={{ background: typeColor[a.type] }} />
                  <span className="text-gold">{B.glyph}</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm">{A.name} <span className="text-muted-foreground">{a.type.toLowerCase()}</span> {B.name}</div>
                  <div className="text-xs text-muted-foreground">{a.orb}</div>
                </div>
                <div className="font-smallcaps text-[10px]" style={{ color: typeColor[a.type] }}>{a.type}</div>
              </button>
            );
          })}
        </div>

        <div className="lg:sticky lg:top-8 h-fit">
          {selected ? (
            (() => {
              const A = PLACEMENTS.find(p => p.key === selected.a)!;
              const B = PLACEMENTS.find(p => p.key === selected.b)!;
              return (
                <div className="p-6 border border-gold/40 rounded bg-card">
                  <div className="font-smallcaps text-[11px] text-gold">{selected.type} · {selected.orb}</div>
                  <div className="mt-3 text-3xl">
                    <span className="text-gold">{A.glyph}</span> <span className="text-muted-foreground text-lg mx-2">×</span> <span className="text-gold">{B.glyph}</span>
                  </div>
                  <h2 className="font-display mt-3">{A.name} {selected.type.toLowerCase()} {B.name}</h2>
                  <p className="mt-4 text-foreground/85 leading-relaxed">{selected.interpretation}</p>
                  <div className="mt-6 flex gap-3">
                    <Link to={`/planets/${A.key}`} className="ink-link font-smallcaps text-xs">Read {A.name} →</Link>
                    <Link to={`/planets/${B.key}`} className="ink-link font-smallcaps text-xs">Read {B.name} →</Link>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="p-6 border border-dashed border-border rounded bg-card/40 text-sm text-muted-foreground">
              Select an aspect to read its interpretation.
            </div>
          )}
        </div>
      </div>
      <SourceChapters match={/aspect|conjunct|square|trine|opposition|sextile|quincunx|stellium|midpoint|harmonic|antiscia|bucket/i} />
    </div>
  );
}
