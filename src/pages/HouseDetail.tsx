import { SourceChapters } from '@/components/common/SourceChapters';
import { Link, useParams } from 'react-router-dom';
import { HOUSES, PLACEMENTS } from '@/content/april';

export default function HouseDetail() {
  const { num } = useParams();
  const h = HOUSES.find(x => String(x.number) === num);
  if (!h) return (
    <div>
      <h1 className="font-display">House not found.</h1>
      <Link to="/houses" className="ink-link">← All houses</Link>
    </div>
  );
  const tenants = PLACEMENTS.filter(p => p.house === h.number);
  const prev = HOUSES.find(x => x.number === (h.number === 1 ? 12 : h.number - 1));
  const next = HOUSES.find(x => x.number === (h.number === 12 ? 1 : h.number + 1));

  return (
    <article className="space-y-10 max-w-3xl">
      <header>
        <Link to="/houses" className="font-smallcaps text-[10px] text-muted-foreground hover:text-gold">← All houses</Link>
        <div className="mt-4 flex items-baseline gap-4">
          <div className="font-display text-7xl text-gold leading-none">{h.number}</div>
          <div>
            <h1 className="font-display leading-tight">{h.name}</h1>
            <div className="text-sm text-muted-foreground mt-1">Cusp: {h.cusp} · Ruler: {h.ruler}</div>
          </div>
        </div>
        <div className="gold-rule my-6" />
        <p className="text-lg italic text-foreground/85">{h.summary}</p>
      </header>

      <p className="text-foreground/90 leading-loose text-lg">{h.interpretation}</p>

      {tenants.length > 0 && (
        <section>
          <h2 className="font-display mb-4">Planets in House {h.number}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {tenants.map(p => (
              <Link key={p.key} to={`/planets/${p.key}`} className="p-4 border border-border rounded bg-card/60 hover:border-gold">
                <div className="flex items-baseline gap-3">
                  <div className="text-3xl text-gold">{p.glyph}</div>
                  <div>
                    <div className="font-display text-lg leading-tight">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.sign} · {p.degree}°{String(p.minute).padStart(2,'0')}′ · {p.dignity}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <nav className="flex justify-between pt-6 border-t border-border font-smallcaps text-[11px]">
        <Link to={`/houses/${prev!.number}`} className="ink-link">← H{prev!.number} · {prev!.name}</Link>
        <Link to={`/houses/${next!.number}`} className="ink-link">H{next!.number} · {next!.name} →</Link>
      </nav>
      <SourceChapters match={new RegExp(`\\b(house ${num}|h${num})\\b|house-by-house|${['','1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th'][Number(num)] || 'zz'} house`, 'i')} title="Everything the sources say" />
    </article>
  );
}
