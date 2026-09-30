import { Link } from 'react-router-dom';
import { PLACEMENTS, ANGLES } from '@/content/april';
import { BCB_CHAPTER } from '@/content/birthChartBook';
import { ConfidenceBadge } from '@/components/common/ConfidenceBadge';

/** Every natal position with its meaning and the source chapter it comes from. */
export default function ChartElements() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="font-smallcaps text-xs text-gold">Birth chart · element by element</div>
        <h1 className="text-4xl">Chart Elements & Their Meanings</h1>
        <p className="max-w-3xl text-muted-foreground">Each position in April’s chart (6 Sept 1990, 3:38 PM, as used in the reports), what it means, and where that meaning comes from. Every entry also appears in <Link to="/reading#elements" className="underline">the Complete Reading</Link>.</p>
      </header>
      <section className="parchment p-4 text-sm" id="el-angles">
        <h2 className="text-2xl">Angles</h2>
        {Object.entries(ANGLES).map(([k, a]) => <p key={k}><b className="capitalize">{k}</b>: {a.degree}°{String(a.minute).padStart(2, '0')}′ {a.sign} {a.signGlyph} — {a.note}</p>)}
        <p className="mt-1 text-xs">Source: <Link to={`/masterbook/${BCB_CHAPTER.asc.id}`} className="underline">Birth Chart Book — {BCB_CHAPTER.asc.label}</Link></p>
      </section>
      <ul className="grid md:grid-cols-2 gap-4">
        {PLACEMENTS.map(p => {
          const ch = BCB_CHAPTER[p.key];
          return (
            <li key={p.key} id={`el-${p.key}`} className="parchment p-4 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl">{p.glyph} {p.name} in {p.sign} {p.signGlyph}</h2>
                <ConfidenceBadge level="confirmed" />
              </div>
              <div className="text-xs text-muted-foreground">{p.degree}°{String(p.minute).padStart(2, '0')}′ · House {p.house} · {p.motion} · {p.dignity}</div>
              <p className="font-display text-lg">{p.headline}</p>
              <p className="text-sm">{p.interpretation}</p>
              {p.notes && <p className="text-xs text-muted-foreground">{p.notes}</p>}
              <div className="text-xs flex flex-wrap gap-3 pt-1">
                {ch ? <Link to={`/masterbook/${ch.id}`} className="underline">Source: Birth Chart Book — {ch.label}</Link> : <span>Source: April’s Masterbook natal report</span>}
                {!['northNode', 'southNode', 'vertex', 'lilith', 'fortune'].includes(p.key) && <Link to={`/planets/${p.key}`} className="underline">Planet page</Link>}
                <Link to={`/houses/${p.house}`} className="underline">House {p.house}</Link>
                <Link to={`/ask?q=${encodeURIComponent(`What does ${p.name} in ${p.sign} in house ${p.house} mean for April?`)}`} className="underline">Ask the Sources</Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
