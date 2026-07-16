import { Link } from 'react-router-dom';
import { CORE_NUMBERS, PINNACLES, CHALLENGES, PERSONAL_YEARS, NUMEROLOGY_SOURCE } from '@/content/numerology';
import { SourceRefPanel } from '@/components/common/SourceRefPanel';

export default function Numerology() {
  return (
    <article className="space-y-14">
      <header>
        <div className="font-smallcaps text-[11px] text-gold">Section · Pythagorean Numerology</div>
        <h1 className="font-display mt-2">Numerology, derived.</h1>
        <div className="gold-rule my-5 max-w-xs" />
        <p className="max-w-2xl text-lg text-foreground/85 leading-relaxed">
          Every number below is computed from September 6, 1990 — the formulas are shown so nothing has to be taken on faith. Life Path 7. Birthday 6. Currently in Pinnacle 2 (7) and Challenge 2 (5).
        </p>
      </header>

      <section>
        <h2 className="font-display mb-6">Core numbers</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {CORE_NUMBERS.map(n => (
            <div key={n.id} id={n.id} className="p-6 border border-border rounded bg-card/70">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="font-smallcaps text-[10px] text-gold">{n.label}</div>
                  <div className="font-display text-4xl mt-1">{n.value || '—'}</div>
                </div>
              </div>
              <div className="font-smallcaps text-[10px] text-muted-foreground mt-2">Formula</div>
              <div className="text-xs mt-1">{n.formula}</div>
              <div className="gold-rule my-4 w-12" />
              <div className="font-display text-lg leading-snug">{n.headline}</div>
              <p className="text-sm mt-2 leading-relaxed text-foreground/85">{n.meaning}</p>
              <div className="font-smallcaps text-[10px] text-gold mt-4">Interlocks with the chart</div>
              <p className="text-sm mt-1 italic text-foreground/80">{n.chartLink}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-display mb-4">Pinnacles</h2>
          <p className="text-sm text-foreground/80 mb-4">Four life-arcs — each defines the opportunity of its decade.</p>
          <div className="space-y-3">
            {PINNACLES.map(p => (
              <div key={p.id} className={`p-4 border rounded ${p.active ? 'border-gold bg-gold/5' : 'border-border bg-card/60'}`}>
                <div className="flex items-baseline justify-between">
                  <div className="font-smallcaps text-[11px] text-gold">{p.label} · {p.ageRange}</div>
                  <div className="font-display text-2xl">{p.value}</div>
                </div>
                <div className="text-[11px] mt-1 text-muted-foreground">{p.formula}</div>
                <p className="text-sm mt-2 leading-relaxed">{p.meaning}</p>
                {p.active && <div className="font-smallcaps text-[10px] text-gold mt-2">Active now</div>}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-display mb-4">Challenges</h2>
          <p className="text-sm text-foreground/80 mb-4">Four counter-currents — the friction against which the Pinnacles form.</p>
          <div className="space-y-3">
            {CHALLENGES.map(c => (
              <div key={c.id} className={`p-4 border rounded ${c.active ? 'border-gold bg-gold/5' : 'border-border bg-card/60'}`}>
                <div className="flex items-baseline justify-between">
                  <div className="font-smallcaps text-[11px] text-gold">{c.label} · {c.ageRange}</div>
                  <div className="font-display text-2xl">{c.value}</div>
                </div>
                <div className="text-[11px] mt-1 text-muted-foreground">{c.formula}</div>
                <p className="text-sm mt-2 leading-relaxed">{c.meaning}</p>
                {c.active && <div className="font-smallcaps text-[10px] text-gold mt-2">Active now</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display mb-4">Personal Year cycle</h2>
        <p className="text-sm text-foreground/80 mb-4 max-w-3xl">
          The Personal Year begins each September 6. Formula: <span className="font-mono text-xs">9 + 6 + reduce(year) = personal year</span>. 2026 = 7, in perfect resonance with the Life Path.
        </p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {PERSONAL_YEARS.map(y => (
            <div key={y.year} className={`p-3 border rounded text-center ${y.year === 2026 ? 'border-gold bg-gold/10' : 'border-border bg-card/60'}`}>
              <div className="font-smallcaps text-[10px] text-muted-foreground">{y.year}</div>
              <div className="font-display text-2xl">{y.number}</div>
              <div className="text-[10px] leading-tight text-foreground/70 mt-1">{y.theme.split('·')[0]?.trim()}</div>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-3 mt-5">
          {PERSONAL_YEARS.filter(y => y.year >= 2025 && y.year <= 2028).map(y => (
            <div key={y.year} className="p-4 border border-border rounded bg-card/50">
              <div className="font-smallcaps text-[10px] text-gold">Personal Year {y.year} · {y.number}</div>
              <div className="text-sm mt-1">{y.theme}</div>
            </div>
          ))}
        </div>
      </section>

      <SourceRefPanel source={NUMEROLOGY_SOURCE} />

      <nav className="flex flex-wrap gap-3 text-sm">
        <Link to="/profection" className="ink-link">Profection · Age 35 →</Link>
        <Link to="/transits" className="ink-link">Outer-planet transits →</Link>
        <Link to="/chinese" className="ink-link">Chinese astrology · Ba Zi →</Link>
      </nav>
    </article>
  );
}
