import { SourceChapters } from '@/components/common/SourceChapters';
import { PlanetOrb } from '@/components/chart/PlanetOrb';
import { Link, useParams } from 'react-router-dom';
import { PLACEMENTS, ASPECTS } from '@/content/april';

export default function PlanetDetail() {
  const { key } = useParams();
  const p = PLACEMENTS.find(pl => pl.key === key);
  if (!p) return (
    <div>
      <h1 className="font-display">Planet not found.</h1>
      <Link to="/planets" className="ink-link">← All planets</Link>
    </div>
  );

  const related = ASPECTS.filter(a => a.a === p.key || a.b === p.key);

  return (
    <article className="space-y-10 max-w-3xl">
      <header>
        <Link to="/planets" className="font-smallcaps text-[10px] text-muted-foreground hover:text-gold">← All planets</Link>
        <div className="mt-4 flex items-center gap-4">
          <PlanetOrb planet={p.key} size={112} label={p.name} />
          <div className="font-display text-5xl text-gold leading-none">{p.glyph}</div>
          <div>
            <h1 className="font-display leading-none">{p.name}</h1>
            <div className="text-sm text-muted-foreground mt-2">
              {p.sign} {p.signGlyph} · {p.degree}°{String(p.minute).padStart(2,'0')}′ · House {p.house} · {p.motion}
            </div>
          </div>
        </div>
        <div className="gold-rule my-6" />
        <div className="font-smallcaps text-[11px] text-gold">{p.dignity}</div>
        <div className="mt-2 text-lg italic text-foreground/85">{p.headline}</div>
      </header>

      <div className="prose-lg">
        <p className="text-foreground/90 leading-loose text-lg">{p.interpretation}</p>
      </div>

      {related.length > 0 && (
        <section>
          <h2 className="font-display mb-4">Aspects to {p.name}</h2>
          <div className="space-y-4">
            {related.map((a, i) => {
              const other = a.a === p.key ? a.b : a.a;
              const o = PLACEMENTS.find(pl => pl.key === other)!;
              return (
                <div key={i} className="p-4 border border-border rounded bg-card/60">
                  <div className="font-smallcaps text-[11px] text-gold">
                    {a.type} · {p.glyph} → {o.glyph} · {o.name} · {a.orb}
                  </div>
                  <p className="mt-2 text-sm text-foreground/85 leading-relaxed">{a.interpretation}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="flex gap-3 pt-6 border-t border-border">
        <Link to={`/houses/${p.house}`} className="ink-link font-smallcaps text-xs">Read House {p.house} →</Link>
        <Link to="/aspects" className="ink-link font-smallcaps text-xs">All aspects →</Link>
      </div>
      <SourceChapters match={new RegExp(`\\b${key === 'northnode' ? 'north node' : key === 'southnode' ? 'south node' : key}\\b`, 'i')} title="Everything the sources say" />
    </article>
  );
}
