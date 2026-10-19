import { BoxArt } from '@/components/common/BoxArt';
import { Link } from 'react-router-dom';
import { PLACEMENTS } from '@/content/april';

export default function Planets() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display mt-2">Every body in her sky.</h1>
        <div className="gold-rule my-5 max-w-xs" />
        <p className="max-w-2xl text-lg text-foreground/85 leading-relaxed">
          The ten classical bodies plus Chiron, the Nodes, Vertex, Black Moon Lilith and the Part of Fortune. Click any card for the full interpretation.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PLACEMENTS.map(p => (
          <Link key={p.key} to={`/planets/${p.key}`} className="group overflow-hidden p-5 border border-border rounded bg-card hover:border-gold hover:shadow-[var(--shadow-gold)] transition-all">
            <div className="-mx-5 -mt-5 mb-4"><BoxArt seed={p.key} label={p.name} className="h-20 w-full" /></div>
            <div className="flex items-baseline gap-3">
              <div className="font-display text-3xl text-gold">{p.glyph}</div>
              <div>
                <div className="font-display text-lg leading-tight">{p.name}</div>
                <div className="text-xs text-muted-foreground">
                  {p.sign} {p.signGlyph} · {p.degree}°{String(p.minute).padStart(2,'0')}′ · H{p.house}
                </div>
              </div>
            </div>
            <div className="gold-rule my-3" />
            <div className="text-[11px] font-smallcaps text-muted-foreground">{p.dignity}</div>
            <div className="text-sm mt-1 text-foreground/80">{p.notes}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
