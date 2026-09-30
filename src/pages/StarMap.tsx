import { SourceChapters } from '@/components/common/SourceChapters';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FIXED_STARS, type FixedStar } from '@/content/compendium';
import { SourceRefPanel } from '@/components/common/SourceRefPanel';

export default function StarMap() {
  const [active, setActive] = useState<FixedStar>(FIXED_STARS[0]);
  const { hash } = useLocation();

  // Deep link support (⌘K palette → sky map opens the right star).
  useEffect(() => {
    const id = hash.replace('#', '');
    const match = FIXED_STARS.find(s => s.id === id);
    if (match) setActive(match);
  }, [hash]);

  const rings = useMemo(() => [20, 40, 60, 80], []);

  return (
    <div className="space-y-10">
      <header>
        <div className="font-smallcaps text-[11px] text-gold">Section 15 · Interactive Sky</div>
        <h1 className="font-display mt-2">The fixed-star sky.</h1>
        <div className="gold-rule my-5 max-w-xs" />
        <p className="max-w-2xl text-lg text-foreground/85 leading-relaxed">
          Every fixed star that touches April's chart, plotted on a stylised celestial dome. Click any point of light to open its full entry — meaning, natal activation, and the exact orb of contact.
        </p>
      </header>

      <div className="grid lg:grid-cols-[1.15fr,1fr] gap-8 items-start">
        {/* Sky map */}
        <div className="vellum deckle p-6">
          <svg viewBox="0 0 100 100" className="w-full aspect-square">
            <defs>
              <radialGradient id="dome" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsl(var(--card))" />
                <stop offset="100%" stopColor="hsl(var(--background))" />
              </radialGradient>
              <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity="0.8" />
                <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="url(#dome)" stroke="hsl(var(--gold) / 0.6)" strokeWidth="0.3" />
            {rings.map(r => (
              <circle key={r} cx="50" cy="50" r={r / 2}
                fill="none" stroke="hsl(var(--border))" strokeWidth="0.15" strokeDasharray="0.6 0.6" />
            ))}
            {/* cardinal cross */}
            <line x1="2"  y1="50" x2="98" y2="50" stroke="hsl(var(--border))" strokeWidth="0.15" />
            <line x1="50" y1="2"  x2="50" y2="98" stroke="hsl(var(--border))" strokeWidth="0.15" />
            {/* faint background stars */}
            {Array.from({ length: 60 }).map((_, i) => {
              const a = (i * 137.5) % 360;
              const r = 8 + ((i * 7) % 38);
              const x = 50 + r * Math.cos((a * Math.PI) / 180);
              const y = 50 + r * Math.sin((a * Math.PI) / 180);
              return <circle key={i} cx={x} cy={y} r="0.15" fill="hsl(var(--muted-foreground) / 0.6)" />;
            })}
            {/* fixed stars */}
            {FIXED_STARS.map(s => {
              const isActive = s.id === active.id;
              const size = 1.6 - Math.min(s.magnitude, 3) * 0.35;
              return (
                <g key={s.id} onClick={() => setActive(s)} className="cursor-pointer">
                  {isActive && (
                    <circle cx={s.x} cy={s.y} r={size * 4} fill="url(#glow)" />
                  )}
                  <circle cx={s.x} cy={s.y} r={size}
                    fill={isActive ? 'hsl(var(--gold))' : 'hsl(var(--foreground))'}
                    stroke="hsl(var(--gold))" strokeWidth={isActive ? 0.3 : 0} />
                  <text x={s.x + size + 1} y={s.y + 0.6}
                    fontSize="2.2" fill="hsl(var(--foreground))"
                    className="font-display pointer-events-none select-none">
                    {s.name}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="font-smallcaps text-[10px] text-muted-foreground text-center mt-2">
            Positions stylised · click a star to open its entry
          </div>
        </div>

        {/* Active star detail */}
        <div className="p-6 border border-gold/40 rounded bg-card gentle-fade" key={active.id}>
          <div className="font-smallcaps text-[10px] text-gold">Fixed Star</div>
          <h2 className="font-display text-3xl mt-1">{active.name}</h2>
          <div className="text-sm text-muted-foreground mt-1">
            {active.degree} · conj. {active.conjunct} · orb {active.orb}
          </div>
          <div className="gold-rule my-4 w-16" />
          <div className="font-smallcaps text-[10px] text-gold mb-1">Meaning</div>
          <p className="italic text-foreground/85 text-sm mb-4">{active.meaning}</p>
          <div className="font-smallcaps text-[10px] text-gold mb-1">Natal activation</div>
          <p className="text-sm text-foreground/90 leading-relaxed">{active.activation}</p>
          <SourceRefPanel source={active.source} />
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {FIXED_STARS.map(s => (
          <button key={s.id} onClick={() => setActive(s)}
            className={`px-3 py-1.5 rounded border text-xs transition-colors ${
              s.id === active.id ? 'border-gold bg-gold/10 text-foreground' : 'border-border hover:border-gold/60 text-muted-foreground'
            }`}>
            <span className="text-gold mr-1.5">★</span>{s.name}
          </button>
        ))}
      </div>
      <SourceChapters match={/fixed star|sabian|spica|galactic|asteroid|decan/i} />
    </div>
  );
}
