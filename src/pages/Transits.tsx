import { useState } from 'react';
import { TRANSITS, TRANSITS_SOURCE, type TransitEvent } from '@/content/transits';
import { SourceRefPanel } from '@/components/common/SourceRefPanel';

const YEARS = Array.from({ length: 15 }, (_, i) => 2026 + i); // 2026–2040

const INTENSITY_COLOR: Record<TransitEvent['intensity'], string> = {
  'era-defining': 'bg-gold',
  major: 'bg-accent',
  notable: 'bg-muted-foreground',
};

export default function Transits() {
  const [active, setActive] = useState<TransitEvent | null>(TRANSITS[0]);

  const barLeft = (t: TransitEvent) => ((t.startYear - 2026) / 14) * 100;
  const barWidth = (t: TransitEvent) => Math.max(2, ((t.endYear - t.startYear + 1) / 14) * 100);

  return (
    <article className="space-y-12">
      <header>
        <div className="font-smallcaps text-[11px] text-gold">Section · Outer-Planet Transits</div>
        <h1 className="font-display mt-2">The next decade, hour by degree.</h1>
        <div className="gold-rule my-5 max-w-xs" />
        <p className="max-w-2xl text-lg text-foreground/85 leading-relaxed">
          Every era-defining outer-planet contact to April's natal chart between 2026 and 2040. Click any bar for the full interpretation.
        </p>
      </header>

      <section>
        <div className="vellum deckle p-6">
          {/* year axis */}
          <div className="relative border-b border-border pb-2 mb-4">
            <div className="grid" style={{ gridTemplateColumns: `repeat(${YEARS.length}, 1fr)` }}>
              {YEARS.map(y => (
                <div key={y} className="text-[10px] text-muted-foreground font-smallcaps text-center border-l border-border/60 first:border-l-0">
                  {y}
                </div>
              ))}
            </div>
          </div>
          {/* transit bars */}
          <div className="space-y-2">
            {TRANSITS.map(t => (
              <button
                key={t.id}
                onClick={() => setActive(t)}
                className="relative w-full h-8 group text-left"
                aria-label={t.title}
              >
                <div className="absolute inset-y-0 left-0 right-0 bg-muted/30 rounded" />
                <div
                  className={`absolute inset-y-1 ${INTENSITY_COLOR[t.intensity]} rounded transition-all ${active?.id === t.id ? 'ring-2 ring-foreground' : 'opacity-80 group-hover:opacity-100'}`}
                  style={{ left: `${barLeft(t)}%`, width: `${barWidth(t)}%` }}
                />
                <div className="absolute inset-y-0 left-2 flex items-center text-[11px] font-smallcaps text-foreground z-10">
                  {t.transiting} {t.aspect} {t.natalPoint.split('·')[0]?.trim()}
                </div>
              </button>
            ))}
          </div>
          <div className="flex gap-4 mt-4 text-[10px] font-smallcaps text-muted-foreground">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-gold rounded-sm" /> Era-defining</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-accent rounded-sm" /> Major</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-muted-foreground rounded-sm" /> Notable</div>
          </div>
        </div>
      </section>

      {active && (
        <section className="grid md:grid-cols-[1fr,auto] gap-6 items-start p-6 border border-border rounded bg-card/70">
          <div>
            <div className="font-smallcaps text-[11px] text-gold">{active.window}</div>
            <h2 className="font-display text-2xl mt-1">{active.title}</h2>
            <div className="text-sm text-muted-foreground mt-1">
              {active.transiting} <span className="italic">{active.aspect}</span> {active.natalPoint}
            </div>
            <div className="gold-rule my-4 w-16" />
            <p className="leading-relaxed text-foreground/90">{active.body}</p>
          </div>
          <div className={`shrink-0 self-start px-3 py-1.5 rounded-full text-[10px] font-smallcaps ${INTENSITY_COLOR[active.intensity]} text-background`}>
            {active.intensity}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-display mb-4">All transits, in order</h2>
        <div className="divide-y divide-border/70 border-y border-border/70">
          {TRANSITS.map(t => (
            <button
              key={t.id}
              onClick={() => { setActive(t); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="w-full text-left py-4 grid grid-cols-[8rem,1fr] gap-4 items-baseline hover:bg-muted/40 px-2"
            >
              <div className="font-smallcaps text-[10px] text-muted-foreground">{t.window}</div>
              <div>
                <div className="font-display">{t.title}</div>
                <div className="text-xs text-foreground/70 mt-0.5">{t.transiting} {t.aspect} {t.natalPoint}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <SourceRefPanel source={TRANSITS_SOURCE} />
    </article>
  );
}
