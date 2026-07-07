import { Link } from 'react-router-dom';
import { RETROGRADES_AT_BIRTH, PLACEMENTS } from '@/content/april';
import journalImg from '@/assets/journaling-desk.jpg';

export default function Retrogrades() {
  return (
    <div className="space-y-10">
      <header>
        <div className="font-smallcaps text-[11px] text-gold">Part Two · Retrograde Navigation</div>
        <h1 className="font-display mt-2">Four planets, turned inward.</h1>
        <div className="gold-rule my-5 max-w-xs" />
        <p className="max-w-2xl text-lg text-foreground/85 leading-relaxed">
          Four of the ten planets were retrograde the day she was born. Retrograde-at-birth is not a defect; it is a signature of a life whose most important work is done internally first, and then delivered.
        </p>
      </header>

      <div className="deckle p-2 bg-vellum max-w-3xl">
        <img src={journalImg} alt="A scholar's writing desk at night, lit by a single oil lamp" width={1200} height={800} className="w-full h-auto" loading="lazy" />
      </div>

      <div className="space-y-6">
        {RETROGRADES_AT_BIRTH.map(r => {
          const p = PLACEMENTS.find(pl => pl.key === r.planet)!;
          return (
            <div key={r.planet} className="p-6 border border-border rounded bg-card/60">
              <div className="flex items-baseline gap-4">
                <div className="text-4xl text-gold">{p.glyph}</div>
                <div>
                  <div className="font-display text-2xl leading-tight">{p.name} Retrograde in {p.sign}</div>
                  <div className="text-xs text-muted-foreground mt-1">House {p.house} · {p.degree}°{String(p.minute).padStart(2,'0')}′ · {p.dignity}</div>
                </div>
              </div>
              <div className="gold-rule my-4 w-16" />
              <p className="text-foreground/85 leading-relaxed">{r.meaning}</p>
              <Link to={`/planets/${p.key}`} className="ink-link font-smallcaps text-xs mt-4 inline-block">Full {p.name} chapter →</Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
