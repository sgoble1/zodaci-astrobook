import { Link } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { BIRTH, PLACEMENTS, ANGLES, ASPECTS, ZODIAC } from '@/content/april';
import { APRIL } from '@/pages/ChartCalculator';
import { computeChart, fmtLon } from '@/lib/astro';
import { ChartWheel } from '@/components/chart/ChartWheel';
import { Button } from '@/components/ui/button';

export default function BirthChart() {
  const chart = computeChart(APRIL);
  const elements = ZODIAC.reduce((acc, z) => {
    acc[z.element] = (acc[z.element] || 0) + PLACEMENTS.filter(p => p.sign === z.name && !['vertex','lilith','fortune','northNode','southNode'].includes(p.key)).length;
    return acc;
  }, {} as Record<string, number>);
  const modalities = ZODIAC.reduce((acc, z) => {
    acc[z.modality] = (acc[z.modality] || 0) + PLACEMENTS.filter(p => p.sign === z.name && !['vertex','lilith','fortune','northNode','southNode'].includes(p.key)).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <article className="space-y-14 print-chart">
      <header>
        <div className="font-smallcaps text-[11px] text-gold">Section 1 · Natal Chart Snapshot</div>
        <h1 className="font-display mt-2">The Birth Chart, in full.</h1>
        <div className="gold-rule my-5 max-w-xs" />
        <p className="max-w-2xl text-lg text-foreground/85 leading-relaxed">
          Sun in Virgo, Moon in Aries, Sagittarius Rising at the anaretic 29°28′. Full Moon birth. Bucket chart with the Aries Moon as the Handle. A triple Capricorn stellium in the first house. Pluto in domicile at the crown of the chart. Every configuration is documented here.
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          <Link to="/reading" className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm">Read the complete reading →</Link>
          <Link to="/chart-calculator" className="px-4 py-2 rounded border border-border text-sm hover:border-gold">Spin the natal wheel</Link>
          <Button type="button" variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" aria-hidden="true"/>Print chart</Button>
        </div>
      </header>

      <section className="grid lg:grid-cols-[1fr,1fr] gap-8 items-start chart-report-lead">
        <div className="deckle p-2 bg-vellum"><ChartWheel r={chart} /></div>
        <div>
          <h2 className="font-display mb-4">Chart at a glance</h2>
          <dl className="text-sm divide-y divide-border/70 border-y border-border/70">
            {[
              ['Born', `${BIRTH.date} · ${BIRTH.time}`],
              ['Place', `${BIRTH.place} · ${BIRTH.coords}`],
              ['Sun', 'Virgo ♍ 13°56′ · House 8 · Peregrine'],
              ['Moon', 'Aries ♈ 6°37′ · House 3 · Bucket Handle · FULL MOON BIRTH'],
              ['Ascendant', `Sagittarius ♐ ${ANGLES.ascendant.degree}°${ANGLES.ascendant.minute}′ · Anaretic`],
              ['Midheaven', `${ANGLES.midheaven.sign} ${ANGLES.midheaven.signGlyph} ${ANGLES.midheaven.degree}°`],
              ['Chart shape', BIRTH.chartShape],
              ['Chart ruler', 'Jupiter in Leo · House 7'],
              ['Most elevated planet', 'Pluto in Scorpio · House 10 · Domicile'],
              ['Life Path · Kua', `${BIRTH.lifePath} · Kua ${BIRTH.kuaNumber} (${BIRTH.kuaElement})`],
              ['Chinese zodiac', BIRTH.chineseZodiac],
              ['Personal Year 2026', `${BIRTH.personalYear2026} — Reflection, Inner Wisdom, Spiritual Deepening`],
            ].map(([k, v]) => (
              <div key={k} className="py-2.5 grid grid-cols-[7rem,1fr] gap-4">
                <dt className="font-smallcaps text-[10px] text-muted-foreground pt-0.5">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="calculated-positions">
        <h2 id="calculated-positions" className="font-display mb-5">Calculated positions & houses</h2>
        <p className="-mt-3 mb-5 text-sm text-muted-foreground">This is a map of where each planet appeared when April was born. A “house” is the area of life where that planet is said to show up most clearly.</p>
        <div className="overflow-x-auto border border-border"><table className="w-full min-w-[560px] text-sm"><thead className="bg-muted/50"><tr><th scope="col" className="p-3 text-left">Point</th><th scope="col" className="p-3 text-left">Position</th><th scope="col" className="p-3 text-left">House</th><th scope="col" className="p-3 text-left">Motion</th></tr></thead><tbody>{chart.bodies.map(body => <tr key={body.key} className="border-t border-border"><th scope="row" className="p-3 text-left font-medium">{body.glyph} {body.name}</th><td className="p-3">{body.sign} {body.deg}°{String(body.min).padStart(2, '0')}′</td><td className="p-3">{body.house ?? '—'}</td><td className="p-3">{body.retro ? 'Retrograde' : 'Direct'}</td></tr>)}</tbody></table></div>
      </section>

      {chart.cusps && <section aria-labelledby="house-cusps"><h2 id="house-cusps" className="font-display mb-2">House cusps · Porphyry</h2><p className="mb-5 text-sm text-muted-foreground">A cusp is the starting line of a house. Porphyry is simply the calculation method used to divide April’s sky into twelve life areas.</p><dl className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">{chart.cusps.map((cusp, index) => <div key={index} className="flex justify-between bg-background p-3"><dt>House {index + 1}</dt><dd className="font-mono text-sm">{fmtLon(cusp).text}</dd></div>)}</dl></section>}

      <section aria-labelledby="calculated-aspects"><h2 id="calculated-aspects" className="font-display mb-2">Planetary aspects</h2><p className="mb-5 text-sm text-muted-foreground">Aspects are measured angles between planets. Astrologers read them as places where different needs cooperate, challenge one another, or demand balance. A smaller “orb” means the angle is closer to exact.</p><div className="overflow-x-auto border border-border"><table className="w-full min-w-[560px] text-sm"><thead className="bg-muted/50"><tr><th scope="col" className="p-3 text-left">Bodies</th><th scope="col" className="p-3 text-left">Aspect</th><th scope="col" className="p-3 text-left">Orb</th></tr></thead><tbody>{chart.aspects.map((aspect, index) => <tr key={`${aspect.a}-${aspect.b}-${index}`} className="border-t border-border"><td className="p-3">{aspect.a} — {aspect.b}</td><td className="p-3">{aspect.symbol} {aspect.type}</td><td className="p-3 font-mono">{aspect.orb.toFixed(2)}°</td></tr>)}</tbody></table></div></section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="p-6 border border-border rounded bg-card/60">
          <div className="font-smallcaps text-[11px] text-gold mb-2">Elemental balance</div>
          <div className="space-y-2">
            {['Fire','Earth','Air','Water'].map(e => (
              <BalanceRow key={e} label={e} count={elements[e] || 0} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
            Heavy Earth (Virgo–Capricorn) with a single Aries Fire that runs the whole chart. The chart's contradiction is its power.
          </p>
        </div>
        <div className="p-6 border border-border rounded bg-card/60">
          <div className="font-smallcaps text-[11px] text-gold mb-2">Modality balance</div>
          <div className="space-y-2">
            {['Cardinal','Fixed','Mutable'].map(e => (
              <BalanceRow key={e} label={e} count={modalities[e] || 0} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
            Cardinal-heavy — the initiator, the beginner, the builder. Fixed anchor from the Leo–Scorpio axis. Mutable adaptability from the Sagittarius rising and Virgo Sun.
          </p>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        {[
          { to: '/planets', label: 'Read every planet →' },
          { to: '/houses', label: 'Read every house →' },
          { to: '/aspects', label: `All ${ASPECTS.length} major aspects →` },
        ].map(l => (
          <Link key={l.to} to={l.to} className="p-5 border border-border rounded bg-card hover:border-gold hover:shadow-[var(--shadow-gold)] transition-all">
            <div className="font-display text-lg">{l.label}</div>
          </Link>
        ))}
      </section>

      <section className="max-w-3xl">
        <h2 className="font-display mb-4">The Big Three — deep dive</h2>
        <div className="space-y-8">
          {['sun','moon'].map(k => {
            const p = PLACEMENTS.find(pl => pl.key === k);
            if (!p) return null;
            return (
              <div key={k}>
                <div className="font-smallcaps text-[10px] text-gold">{p.headline}</div>
                <p className="text-foreground/85 leading-relaxed mt-2">{p.interpretation}</p>
                <Link to={`/planets/${k}`} className="ink-link text-xs mt-3 inline-block font-smallcaps">Continue →</Link>
              </div>
            );
          })}
          <div>
            <div className="font-smallcaps text-[10px] text-gold">Ascendant · Sagittarius 29°28′ · Anaretic</div>
            <p className="text-foreground/85 leading-relaxed mt-2">
              The Ascendant is the mask through which the self meets the world. Hers rises at the anaretic 29th degree of Sagittarius — the degree of completion and crisis, the last breath of the sign before it becomes Capricorn. The world sees the philosopher-explorer, the archer aiming for horizons beyond the visible. What stands behind that first impression is the triple Capricorn stellium already rising: Saturn's discipline, Uranus's revolution, Neptune's mysticism — and the Aquarius North Node calling her forward into the first house of self. She is Sagittarius as it turns into Capricorn: freedom crystallizing into structure.
            </p>
          </div>
        </div>
      </section>
    </article>
  );
}

function BalanceRow({ label, count }: { label: string; count: number }) {
  const pct = Math.min(100, count * 18);
  return (
    <div>
      <div className="flex items-baseline justify-between font-smallcaps text-[11px]">
        <span>{label}</span>
        <span className="text-muted-foreground">{count}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
        <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
