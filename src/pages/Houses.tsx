import { SourceChapters } from '@/components/common/SourceChapters';
import { Link } from 'react-router-dom';
import { HOUSES } from '@/content/april';

export default function Houses() {
  return (
    <div className="space-y-8">
      <header>
        <div className="font-smallcaps text-[11px] text-gold">Section 5 · House-by-House</div>
        <h1 className="font-display mt-2">All twelve rooms of the sky.</h1>
        <div className="gold-rule my-5 max-w-xs" />
        <p className="max-w-2xl text-lg text-foreground/85 leading-relaxed">
          The twelve houses of the natal chart, each with its cusp sign, ruler, planetary tenants and the story it is telling in April's life.
        </p>
      </header>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {HOUSES.map(h => (
          <Link key={h.number} to={`/houses/${h.number}`} className="group p-5 border border-border rounded bg-card hover:border-gold hover:shadow-[var(--shadow-gold)] transition-all">
            <div className="flex items-baseline justify-between">
              <div className="font-display text-4xl text-gold leading-none">{h.number}</div>
              <div className="font-smallcaps text-[10px] text-muted-foreground text-right">Cusp<br />{h.cusp}</div>
            </div>
            <div className="gold-rule my-3" />
            <div className="font-display text-lg leading-tight">{h.name}</div>
            <div className="text-xs text-muted-foreground mt-1">Ruler: {h.ruler}</div>
            {h.planets.length > 0 && (
              <div className="mt-2 text-xs">
                <span className="font-smallcaps text-[10px] text-gold">Tenants</span> · {h.planets.join(', ')}
              </div>
            )}
            <div className="text-sm text-foreground/80 mt-3 italic">{h.summary}</div>
          </Link>
        ))}
      </div>
      <SourceChapters match={/house|dispositor|rulership|angles?\b|arabic parts|part of fortune|vertex/i} />
    </div>
  );
}
