import { Link } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { BIRTH, PLACEMENTS, ANGLES, ASPECTS, HOUSES, ZODIAC } from '@/content/april';
import { APRIL } from '@/pages/ChartCalculator';
import { useState } from 'react';
import { computeChart, fmtLon, HOUSE_SYSTEMS, type HouseSystem } from '@/lib/astro';
import { DataAudit } from '@/components/common/DataAudit';
import { ChartWheel } from '@/components/chart/ChartWheel';
import { Button } from '@/components/ui/button';

export default function BirthChart() {
  const [hs, setHs] = useState<HouseSystem>('placidus');
  const hsInfo = HOUSE_SYSTEMS.find(h => h.id === hs)!;
  const chart = computeChart({ ...APRIL, houseSystem: hs });
  const elements = ZODIAC.reduce((acc, z) => {
    acc[z.element] = (acc[z.element] || 0) + PLACEMENTS.filter(p => p.sign === z.name && !['vertex','lilith','fortune','northNode','southNode'].includes(p.key)).length;
    return acc;
  }, {} as Record<string, number>);
  const modalities = ZODIAC.reduce((acc, z) => {
    acc[z.modality] = (acc[z.modality] || 0) + PLACEMENTS.filter(p => p.sign === z.name && !['vertex','lilith','fortune','northNode','southNode'].includes(p.key)).length;
    return acc;
  }, {} as Record<string, number>);
  const bodyMeaning = (key: string) => ({ sun: 'your basic identity and sense of purpose', moon: 'your feelings, instincts and need for safety', mercury: 'how you think, learn and communicate', venus: 'how you love, connect and decide what matters', mars: 'how you act, assert yourself and pursue what you want', jupiter: 'where confidence, opportunity and perspective grow', saturn: 'where effort, boundaries and maturity develop', uranus: 'where you need freedom and do things differently', neptune: 'where imagination, sensitivity and uncertainty mingle', pluto: 'where deep change, power and renewal happen', northNode: 'the unfamiliar qualities you are learning to develop', southNode: 'familiar habits and talents you can use without getting stuck in them' } as Record<string, string>)[key] ?? 'a point astrologers use to describe part of your life';
  const aspectMeaning = (type: string) => ({ Conjunction: 'These two needs are joined and tend to act as one.', Opposition: 'These two needs pull in opposite directions and need an honest balance.', Square: 'These needs create friction that can become growth with practice.', Trine: 'These qualities support each other naturally and can be easy to overlook.', Sextile: 'These qualities offer an opportunity when you choose to use them.' } as Record<string, string>)[type] ?? 'These two parts of the chart interact.';

  return (
    <article className="space-y-14 print-chart">
      <header>
        <h1 className="font-display mt-2">The Birth Chart, in full.</h1>
        <div className="gold-rule my-5 max-w-xs" />
        <p className="max-w-2xl text-lg text-foreground/85 leading-relaxed">
          Sun in Virgo, Moon in Aries, Sagittarius Rising at the anaretic 29°28′. Waning gibbous Moon, 157.3° from the Sun. The source describes a Bucket chart with the Aries Moon as the Handle. A triple Capricorn stellium in the first house. Pluto in domicile at the crown of the chart. Source claims and independent calculations are labeled separately here.
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          <Button asChild variant="outline"><Link to="/chart-guide">Read the plain-language chart guide</Link></Button>
          <Link to="/reading" className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm">Read the complete reading →</Link>
          <Link to="/chart-calculator" className="px-4 py-2 rounded border border-border text-sm hover:border-gold">Spin the natal wheel</Link>
          <Button type="button" variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" aria-hidden="true"/>Print chart</Button>
        </div>
      </header>

      <section className="parchment p-5" aria-labelledby="read-chart"><h2 id="read-chart" className="text-2xl">How to read this report</h2><ol className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><li><strong>1. Start with the planet.</strong><p className="mt-1 text-sm text-muted-foreground">The planet names a part of you, such as feelings, thinking, love or drive.</p></li><li><strong>2. Read the sign.</strong><p className="mt-1 text-sm text-muted-foreground">The sign describes how that part of you tends to behave.</p></li><li><strong>3. Check the house.</strong><p className="mt-1 text-sm text-muted-foreground">The house names the area of life where the pattern appears most clearly.</p></li><li><strong>4. Read the aspects.</strong><p className="mt-1 text-sm text-muted-foreground">The angles show which parts of you cooperate, clash or ask for balance.</p></li></ol><p className="mt-4 text-sm text-muted-foreground"><strong className="text-foreground">Helpful words:</strong> retrograde means the quality is processed inwardly; domicile means a planet is considered at home and works naturally; peregrine means it works more independently; anaretic means the final degree of a sign; stellium means a strong cluster of planets.</p></section>

      <section className="grid lg:grid-cols-[1fr,1fr] gap-8 items-start chart-report-lead">
        <div className="deckle p-2 bg-vellum"><ChartWheel r={chart} /></div>
        <div>
          <h2 className="font-display mb-4">Chart at a glance</h2>
          <dl className="text-sm divide-y divide-border/70 border-y border-border/70">
            {[
              ['Born', `${BIRTH.date} · ${BIRTH.time}`],
              ['Place', `${BIRTH.place} · ${BIRTH.coords}`],
              ['Sun', 'Virgo ♍ 13°56′ · House 8 · Peregrine'],
              ['Moon', 'Aries ♈ 6°37′ · House 3 · waning gibbous · source-described Bucket Handle'],
              ['Ascendant', `Sagittarius ♐ ${ANGLES.ascendant.degree}°${ANGLES.ascendant.minute}′ · Anaretic`],
              ['Midheaven', `${ANGLES.midheaven.sign} ${ANGLES.midheaven.signGlyph} ${ANGLES.midheaven.degree}°${String(ANGLES.midheaven.minute).padStart(2, '0')}′ · source-reported · conjunct Spica`],
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

      <DataAudit />

      <section aria-labelledby="calculated-positions">
        <h2 id="calculated-positions" className="font-display mb-5">Calculated positions & houses</h2>
        <div className="mb-5 rounded border border-border bg-card/60 p-4 text-sm space-y-2">
          <label className="flex flex-wrap items-center gap-3"><span className="font-medium">House system</span>
            <select value={hs} onChange={e => setHs(e.target.value as HouseSystem)} className="h-10 rounded-md border border-input bg-background px-3" aria-label="House system">{HOUSE_SYSTEMS.map(h => <option key={h.id} value={h.id}>{h.label}</option>)}</select></label>
          <p className="text-muted-foreground">{hsInfo.note}</p>
          <p><strong>Note on Mercury:</strong> Mercury sits at Virgo 16°35′. In Placidus (the books' system) the 9th house begins at Virgo 21°23′, so Mercury is in the <strong>8th house</strong>. In Porphyry the 9th house begins at Virgo 16°28′ — just 7′ earlier — so Mercury reads as <strong>9th</strong>. A 7′ gap is less than a minute of birth-time difference, so the 8th-house reading is kept, matching the sources.</p>
        </div>
        <p className="-mt-3 mb-5 text-sm text-muted-foreground">This map uses April’s recorded birth data: {BIRTH.date} at {BIRTH.time} in {BIRTH.place}. Planet positions are recalculated astronomically. The source reports use Placidus houses; the calculator column below follows the house system you choose above.</p>
        <div className="overflow-x-auto border border-border"><table className="w-full min-w-[820px] text-sm"><thead className="bg-muted/50"><tr><th scope="col" className="p-3 text-left">Point</th><th scope="col" className="p-3 text-left">Calculated position</th><th scope="col" className="p-3 text-left">Source house · Placidus</th><th scope="col" className="p-3 text-left">Calculator house · {hsInfo.label}</th><th scope="col" className="p-3 text-left">Motion</th><th scope="col" className="p-3 text-left">What this means for April</th></tr></thead><tbody>{chart.bodies.map(body => { const sourcePlacement=PLACEMENTS.find(item => item.key === body.key); const house=HOUSES.find(h => h.number === sourcePlacement?.house); return <tr key={body.key} className="border-t border-border align-top"><th scope="row" className="p-3 text-left font-medium">{body.glyph} {body.name}</th><td className="p-3">{body.sign} {body.deg}°{String(body.min).padStart(2, '0')}′</td><td className="p-3">{sourcePlacement?.house ?? '—'}{house && <span className="block text-xs text-muted-foreground">{house.name}</span>}</td><td className="p-3">{body.house ?? '—'}</td><td className="p-3">{body.retro ? 'Retrograde — turned inward' : 'Direct — expressed outwardly'}</td><td className="p-3 text-muted-foreground">This describes {bodyMeaning(body.key)}{house ? `, especially in ${house.name.toLowerCase()}: ${house.summary.toLowerCase()}.` : '.'}</td></tr>; })}</tbody></table></div>
      </section>

      {chart.cusps && <section aria-labelledby="house-cusps"><h2 id="house-cusps" className="font-display mb-2">Independent house check · {hsInfo.label}</h2><p className="mb-5 text-sm text-muted-foreground">A cusp is the starting line of a house. These cusp numbers are an independent {hsInfo.label} calculation from April’s recorded time and place. The source interpretations above remain labeled Placidus. Showing both preserves the source reading while making the calculator’s different method explicit.</p><dl className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">{chart.cusps.map((cusp, index) => { const house=HOUSES[index]; return <div key={index} className="bg-background p-3"><div className="flex justify-between gap-3"><dt>House {index + 1}</dt><dd className="font-mono text-sm">{fmtLon(cusp).text}</dd></div><dd className="mt-1 text-xs text-muted-foreground">{house.name}: {house.summary}.</dd></div>; })}</dl></section>}

      <section aria-labelledby="calculated-aspects"><h2 id="calculated-aspects" className="font-display mb-2">Planetary aspects</h2><p className="mb-5 text-sm text-muted-foreground">Aspects are measured angles between planets. Astrologers read them as places where different needs cooperate, challenge one another, or demand balance. The orb is the distance from a perfect angle: a smaller number means a stronger connection.</p><div className="overflow-x-auto border border-border"><table className="w-full min-w-[720px] text-sm"><thead className="bg-muted/50"><tr><th scope="col" className="p-3 text-left">Bodies</th><th scope="col" className="p-3 text-left">Aspect</th><th scope="col" className="p-3 text-left">Orb</th><th scope="col" className="p-3 text-left">In everyday language</th></tr></thead><tbody>{chart.aspects.map((aspect, index) => <tr key={`${aspect.a}-${aspect.b}-${index}`} className="border-t border-border align-top"><td className="p-3">{aspect.a} — {aspect.b}</td><td className="p-3">{aspect.symbol} {aspect.type}</td><td className="p-3 font-mono">{aspect.orb.toFixed(2)}°</td><td className="p-3 text-muted-foreground">{aspectMeaning(aspect.type)} {aspect.orb < 3 ? 'Because this angle is close, it is one of the louder patterns in the chart.' : 'It is part of the chart, but may be less constant than tighter angles.'}</td></tr>)}</tbody></table></div></section>

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
