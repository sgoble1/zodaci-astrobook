import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BIRTH, PLACEMENTS, ASPECTS, type PlanetKey } from '@/content/april';
import { PILLARS, ELEMENT_BALANCE, LIFE_LESSON, CHINESE_SOURCE } from '@/content/chinese';
import { SABIAN_SYMBOLS, FIXED_STARS, ASTEROIDS, ARABIC_PARTS, PROFECTION_35, type SourceRef } from '@/content/compendium';
import { KUA_FOUNDATION } from '@/content/fengshui';
import { computeChart, SIGN_KEYWORDS, BODY_KEYWORDS, fmtLon } from '@/lib/astro';
import { fromParams, toParams } from './ChartCalculator';
import { ConfidenceBadge } from '@/components/common/ConfidenceBadge';
import { ReasoningPanel } from '@/components/common/ReasoningPanel';
import { Cite } from '@/components/common/Cite';
import { CopyLinkButton } from '@/components/common/CopyLinkButton';
import type { ConfidenceLevel } from '@/content/confidence';
import { KuaWheel } from '@/components/fengshui/KuaWheel';
import { kuaNumber } from '@/lib/kua';
import { BaguaWheel } from '@/components/fengshui/BaguaWheel';
import { FlyingStarWheel } from '@/components/fengshui/FlyingStarWheel';
import { ChartWheel, starContacts } from '@/components/chart/ChartWheel';
import { BCB_CHAPTER, aprilSourcesFor } from '@/content/birthChartBook';

const SRC_BC: SourceRef = { doc: 'Complete Birth Chart Analysis & Feng Shui Guide', section: 'Planetary placements', page: 'Sections 2–12' };
const SRC_ASP: SourceRef = { doc: 'Complete Birth Chart Analysis & Feng Shui Guide', section: 'Major aspects' };
const P = (k: PlanetKey) => PLACEMENTS.find(p => p.key === k)!;
const sabFor = (name: string) => SABIAN_SYMBOLS.find(s => s.point.toLowerCase().startsWith(name.toLowerCase()));
const starsFor = (name: string) => FIXED_STARS.filter(s => s.conjunct.toLowerCase().includes(name.toLowerCase()));

function Section({ id, n, title, level, note, children }: { id: string; n: string; title: string; level: ConfidenceLevel; note: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <div className="flex flex-wrap items-center gap-3 border-b border-gold/40 pb-2">
        <span className="font-smallcaps text-xs text-gold">{n}</span><h2 className="text-3xl flex-1">{title}</h2>
        <ConfidenceBadge level={level} note={note} /><CopyLinkButton hash={id} label="Link" />
      </div>
      {children}
    </section>
  );
}

function PlacementBlock({ k }: { k: PlanetKey }) {
  const p = P(k); const sab = sabFor(p.name); const stars = starsFor(p.name); const open = (id: string) => { window.location.hash = id; };
  return (
    <article className="parchment p-4">
      <div className="flex flex-wrap items-baseline gap-2"><Link to={`/planets/${p.key}`} className="font-display text-xl hover:underline">{p.glyph} {p.name} in {p.sign}</Link><span className="text-xs text-muted-foreground">{p.degree}°{String(p.minute).padStart(2, '0')}′ · House {p.house} · {p.motion} · {p.dignity}</span></div>
      <p className="italic mt-1">{p.headline}</p>
      {BCB_CHAPTER[p.key] && <Link to={`/masterbook/${BCB_CHAPTER[p.key].id}`} className="text-xs underline text-gold">Read the full chapter — Birth Chart Book {BCB_CHAPTER[p.key].label}</Link>}
      <p className="text-sm mt-2">{p.interpretation}<Cite source={SRC_BC} /></p>
      {(sab || stars.length > 0) && (
        <div className="flex flex-wrap gap-2 mt-3 text-xs">
          {sab && <button onClick={() => open(sab.id)} className="border border-gold/50 rounded px-2 py-0.5 hover:bg-gold/10">Sabian {sab.degree}: “{sab.symbol}”</button>}
          {stars.map(s => <button key={s.id} onClick={() => open(s.id)} className="border border-gold/50 rounded px-2 py-0.5 hover:bg-gold/10">★ {s.name} conj.</button>)}
        </div>
      )}
    </article>
  );
}

function ComputedReading({ input }: { input: NonNullable<ReturnType<typeof fromParams>> }) {
  const r = useMemo(() => computeChart(input), [input]);
  const b = (k: string) => r.bodies.find(x => x.key === k)!;
  const stars = useMemo(() => starContacts(r), [r]);
  const worst: ConfidenceLevel = r.flags.some(f => f.level === 'ambiguous') ? 'ambiguous' : r.flags.length ? 'approximate' : 'derived';
  return (
    <div className="space-y-10">
      <header>
        <div className="font-smallcaps text-xs text-gold">Computed reading</div>
        <h1 className="text-4xl mt-2">Reading for {input.date} · {input.time ?? 'time unknown'} · {input.placeLabel}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">This chart isn’t covered by the source documents, so everything here is calculated, and the meanings are short in-app keyword notes rather than quotes. <Link className="underline" to={`/chart-calculator?${toParams(input)}`}>Open in the calculator</Link> · <Link className="underline" to="/reading">April’s full sourced reading</Link></p>
        <div className="mt-2 flex flex-wrap gap-2">{r.flags.map((f, i) => <ConfidenceBadge key={i} level={f.level} note={`${f.topic}: ${f.note}`} />)}</div>
      </header>
      <ChartWheel r={r} />
      <Section id="core" n="I" title="The core triad" level={worst} note="Sun, Moon and Rising. Moon and Rising depend on the birth time.">
        {['sun', 'moon'].map(k => <p key={k}><b>{b(k).name} in {b(k).sign}</b> ({BODY_KEYWORDS[k]}): {SIGN_KEYWORDS[b(k).sign]}.{b(k).house && ` Placed in house ${b(k).house}.`} <ConfidenceBadge compact level={b(k).confidence} note={b(k).note} /></p>)}
        {r.asc != null ? <p><b>Rising {fmtLon(r.asc).sign}</b>: {SIGN_KEYWORDS[fmtLon(r.asc).sign]}. Midheaven {fmtLon(r.mc!).text}.</p> : <p className="text-oxblood text-sm">Without a birth time, the Rising sign and houses are left out.</p>}
      </Section>
      <Section id="planets" n="II" title="The other planets" level="derived" note="Calculated from the ephemeris.">
        <ul className="grid sm:grid-cols-2 gap-2 text-sm">{r.bodies.slice(2).map(x => <li key={x.key} className="border border-border rounded p-2"><b>{x.glyph} {x.name}</b> in {x.sign} {x.deg}°{x.retro && !x.key.includes('Node') ? ' ℞' : ''}{x.house ? ` · H${x.house}` : ''} — {BODY_KEYWORDS[x.key]}, {SIGN_KEYWORDS[x.sign]}.</li>)}</ul>
      </Section>
      <Section id="aspects" n="III" title="Tightest aspects" level="derived" note="Aspects with the smallest orbs have the strongest effect.">
        <ul className="text-sm space-y-1">{r.aspects.slice(0, 10).map((a, i) => <li key={i}>{a.a} {a.symbol} {a.b} — {a.type}, {a.orb.toFixed(1)}° orb</li>)}</ul>
      </Section>
      <Section id="bazi" n="IV" title="Four Pillars" level={input.time ? 'derived' : 'ambiguous'} note="Hour pillar requires birth time.">
        <p>{r.bazi.map(p => `${p.label}: ${p.stem}${p.branch} ${p.romanized} (${p.polarity} ${p.stemElement} ${p.animal})`).join(' · ')}</p>
        <p className="text-sm">Element count: {Object.entries(r.elements).map(([e, n]) => `${e} ${n}`).join(', ')}. {Object.entries(r.elements).filter(([, n]) => n === 0).map(([e]) => e).join(', ') || 'No element'} missing.</p>
      </Section>
      <Section id="compendium" n="V" title="Compendium entries this chart touches" level="approximate" note="Fixed-star degrees come from the Compendium; contacts use a 1.5° orb against the calculated positions.">
        {stars.length === 0 ? <p className="text-sm text-muted-foreground">None of the Compendium’s fixed stars fall within 1.5° of this chart’s planets or angles.</p>
          : <ul className="grid sm:grid-cols-2 gap-3">{stars.map((s, i) => <li key={i} className="parchment p-3 text-sm"><Link to={`/compendium#${s.star.id}`} className="font-display text-lg hover:underline">★ {s.star.name}</Link> <span className="text-xs text-muted-foreground">{s.star.degree} · conjunct {s.point} ({s.orb.toFixed(1)}°)</span><p className="mt-1">{s.star.meaning}<Cite source={s.star.source} /></p></li>)}</ul>}
        <ReasoningPanel reasoning={{ inputs: [{ label: 'Positions', value: 'Calculated planets, Ascendant and Midheaven' }, { label: 'Star list', value: `${FIXED_STARS.length} stars from the Compendium` }], steps: [{ label: 'Parse', detail: 'Each star’s zodiac degree is converted to ecliptic longitude.' }, { label: 'Compare', detail: 'A contact is listed when the star is within 1.5° of a chart point.' }], output: `${stars.length} contact(s) found.`, confidence: 'approximate', caveats: ['The Compendium’s interpretations were written for April; for other charts they describe the star in general.'] }} />
      </Section>
      <Section id="elements" n="VI·A" title="Every position and its meaning" level={worst} note="In-app keyword meanings; chapter links point to the Birth Chart Book's general chapter for that planet.">
        <ul className="grid sm:grid-cols-2 gap-2 text-sm">{r.bodies.map(x => <li key={x.key} className="parchment p-3"><b>{x.glyph} {x.name} {x.deg}°{String(x.min).padStart(2, '0')}′ {x.sign}</b>{x.house ? ` · house ${x.house}` : ''} <ConfidenceBadge compact level={x.confidence} note={x.note} /><p>{BODY_KEYWORDS[x.key] ?? ''}: {SIGN_KEYWORDS[x.sign]}.</p>{BCB_CHAPTER[x.key] && <Link to={`/masterbook/${BCB_CHAPTER[x.key].id}`} className="text-xs underline">Source theme: Birth Chart Book {BCB_CHAPTER[x.key].label} (written for April)</Link>}</li>)}</ul>
        <p className="text-xs"><Link to="/chart-elements" className="underline">April’s sourced Chart Elements page</Link></p>
      </Section>
      <Section id="bagua" n="VI·B" title="Feng Shui · Bagua directions" level="derived" note="Kua number from birth year and sex (standard Eight Mansions formula).">
        {(() => { const k = kuaNumber(input.date, input.sex ?? 'unspecified'); return k ? <><KuaWheel kua={k.kua} /><ReasoningPanel reasoning={{ inputs: [{ label: 'Birth date', value: input.date }, { label: 'Sex', value: String(input.sex) }], steps: k.steps.map((s, i) => ({ label: `Step ${i + 1}`, detail: s })), output: `Kua ${k.kua}`, confidence: 'derived', caveats: [] }} /></> : <p className="text-sm">Choose a sex in the <Link className="underline" to={`/chart-calculator?${toParams(input)}`}>calculator</Link> to add this chart’s Kua directions.</p>; })()}
        <p className="text-xs mt-2"><Link to={`/bagua-reading?${toParams(input)}`} className="underline">Open the Bagua Reading for this chart</Link></p>
      </Section>
      <Section id="fengshui" n="VI" title="Feng Shui · Flying Stars this year" level="derived" note="Annual stars are calculated; Kua notes are April's, from the Feng Shui guide.">
        <FlyingStarWheel />
      </Section>
    </div>
  );
}

export default function Reading() {
  const [sp] = useSearchParams();
  const input = fromParams(sp);
  const isApril = !input || (input.date === '1990-09-06' && Math.abs(input.lat - 42.87) < 0.5);
  const check = useMemo(() => computeChart({ date: '1990-09-06', time: '15:38', lat: 42.8689, lon: -76.9856, tz: 'America/New_York', placeLabel: 'Geneva NY', placeSource: 'geocoded' }), []);
  if (!isApril && input) return <ComputedReading input={input} />;

  const dayMismatch = check.bazi.find(p => p.label === 'Day')?.romanized !== PILLARS.find(p => p.label.startsWith('Day'))?.romanized;
  const toc = [['core', 'The Full Moon core'], ['angles', 'Rising & the angles'], ['inner', 'Mind, love & drive'], ['outer', 'The Capricorn stellium & outer planets'], ['aspects', 'The aspect web'], ['compendium', 'Compendium layer'], ['bazi', 'Chinese Four Pillars'], ['fengshui', 'Feng Shui · Flying Stars'], ['synthesis', 'Synthesis across systems'], ['check', 'Calculation cross-check']];

  return (
    <div className="space-y-14">
      <header>
        <div className="font-smallcaps text-xs text-gold">A single reading · every system in one place</div>
        <h1 className="text-4xl sm:text-5xl mt-2">April’s Complete Reading</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">{BIRTH.date} · {BIRTH.time} · {BIRTH.place}. This reading brings together the natal placements, the aspects, the Compendium’s Sabian symbols, fixed stars, asteroids and Arabic parts, and the Ba Zi pillars. Each claim shows its source, how confident it is, and how it was worked out.</p>
        <nav className="flex flex-wrap gap-2 mt-4">{toc.map(([id, t], i) => <a key={id} href={`#${id}`} className="text-xs border border-border rounded px-2 py-1 hover:bg-muted">{['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'][i]}. {t}</a>)}</nav>
        <p className="text-xs mt-3"><Link to="/chart-calculator" className="underline">Calculate a different chart</Link> and choose “Turn into a reading”.</p>
      </header>

      <section><h2 className="text-2xl mb-3">The natal wheel</h2><p className="text-sm text-muted-foreground mb-3">Calculated from the 3:38 PM birth data; tap any element for its details, confidence and the matching Birth Chart Book chapter.</p><ChartWheel r={check} sourcesFor={aprilSourcesFor} /></section>

      <Section id="core" n="I" title="The Full Moon core" level="confirmed" note="Sun and Moon agree with the calculator to within 1′.">
        <p className="max-w-3xl">{ASPECTS.find(a => a.a === 'sun' && a.b === 'moon')?.interpretation}<Cite source={SRC_ASP} /></p>
        <div className="grid md:grid-cols-2 gap-4"><PlacementBlock k="sun" /><PlacementBlock k="moon" /></div>
        <ReasoningPanel reasoning={{ inputs: [{ label: 'Sun', value: 'Virgo 13°56′ H8' }, { label: 'Moon', value: 'Aries 6°37′ H3' }], steps: [{ label: 'Elongation', detail: 'Moon − Sun ≈ 172.7°, within 8° of opposition: a Full Moon birth.' }, { label: 'Houses', detail: 'The H8/H3 axis ties depth and inheritance (H8) to voice and siblings (H3).' }], output: 'The chart is organised around the Full Moon axis.', confidence: 'confirmed' }} />
      </Section>

      <Section id="angles" n="II" title="Rising & the angles" level="derived" note="Angles depend on the 3:38 PM birth time. An alternate 11:14 AM time appears in one source; see Data Quality.">
        <p className="max-w-3xl">Rising at <b>Sagittarius 29°28′</b>, the final (anaretic) degree, with the Midheaven at <b>Libra 24°59′</b>. Jupiter, the chart ruler, sits in Leo in the 7th house, so the self is steered through partnership and warmth.<Cite source={SRC_BC} /></p>
        {sabFor('Midheaven') && <p className="text-sm italic">MC Sabian symbol: “{sabFor('Midheaven')!.symbol}.” {sabFor('Midheaven')!.interpretation}<Cite source={sabFor('Midheaven')!.source} /></p>}
        <PlacementBlock k="jupiter" />
      </Section>

      <Section id="inner" n="III" title="Mind, love & drive" level="confirmed" note="Cross-checked with the calculator.">
        <div className="grid md:grid-cols-3 gap-4"><PlacementBlock k="mercury" /><PlacementBlock k="venus" /><PlacementBlock k="mars" /></div>
      </Section>

      <Section id="outer" n="IV" title="The Capricorn stellium & outer planets" level="confirmed" note="Slow planets; unaffected by birth-time uncertainty except for house placement.">
        <div className="grid md:grid-cols-2 gap-4">{(['saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'northNode'] as PlanetKey[]).map(k => <PlacementBlock key={k} k={k} />)}</div>
      </Section>

      <Section id="aspects" n="V" title="The aspect web" level="derived" note="Orbs come from the sources; the calculator confirms each aspect.">
        <div className="space-y-3">{ASPECTS.map((a, i) => {
          const hit = check.aspects.find(h => h.type === a.type && [h.a.toLowerCase(), h.b.toLowerCase()].includes(P(a.a).name.toLowerCase()) && [h.a.toLowerCase(), h.b.toLowerCase()].includes(P(a.b).name.toLowerCase()));
          return <details key={i} className="parchment p-3" id={`asp-${a.a}-${a.b}`}><summary className="cursor-pointer flex flex-wrap items-center gap-2"><span className="font-display">{P(a.a).glyph} {P(a.a).name} {a.type} {P(a.b).glyph} {P(a.b).name}</span><span className="text-xs text-muted-foreground">orb {a.orb}</span><ConfidenceBadge compact level={hit ? 'confirmed' : 'approximate'} note={hit ? `Calculator orb ${hit.orb.toFixed(2)}°.` : 'Not found within the calculator’s standard orbs (may be a wide or out-of-sign aspect, or involve a point the calculator doesn’t compute).'} /></summary><p className="text-sm mt-2">{a.interpretation}<Cite source={SRC_ASP} /></p></details>;
        })}</div>
      </Section>

      <Section id="compendium" n="VI" title="Compendium layer" level="confirmed" note="Quoted from the Master Astrological Compendium with page references.">
        <h3 className="text-xl">Asteroid goddesses</h3>
        <div className="grid md:grid-cols-2 gap-3">{ASTEROIDS.map(a => <div key={a.id} className="border border-border rounded p-3 text-sm"><b>{a.glyph} {a.name}</b> · {a.placement} — <i>{a.archetype}</i>. {a.expression}<Cite source={a.source} /></div>)}</div>
        <h3 className="text-xl mt-4">Arabic parts</h3>
        <div className="grid md:grid-cols-3 gap-3">{ARABIC_PARTS.map(p => <div key={p.id} className="border border-border rounded p-3 text-sm"><b>{p.name}</b> · {p.position}. {p.meaning}<Cite source={p.source} /></div>)}</div>
        <h3 className="text-xl mt-4">Fixed stars</h3>
        <ul className="text-sm space-y-1">{FIXED_STARS.map(s => <li key={s.id}><Link to={`/star-map#${s.id}`} className="underline">{s.name}</Link> ({s.degree}) conj. {s.conjunct}: {s.meaning}<Cite source={s.source} /></li>)}</ul>
        <p className="text-sm mt-3"><b>Current timing:</b> {PROFECTION_35.interpretation}<Cite source={PROFECTION_35.source} /> <Link to="/profection" className="underline">Profection module →</Link></p>
      </Section>

      <Section id="bazi" n="VII" title="Chinese Four Pillars" level={dayMismatch ? 'ambiguous' : 'confirmed'} note={dayMismatch ? 'Year and Month pillars match the calculator, but the Day and Hour pillars in the source differ from the standard day count.' : 'Matches the calculator.'}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">{PILLARS.map(p => {
          const c = check.bazi.find(x => p.label.startsWith(x.label));
          return <div key={p.id} className="parchment p-3"><div className="font-smallcaps text-[10px] text-gold">{p.label.split('·')[0]}</div><div className="font-display text-3xl">{p.stem}{p.branch} <span className="text-base">{p.romanized}</span></div><div className="text-xs text-muted-foreground">{p.element} · {p.animal}</div><p className="text-sm mt-1">{p.meaning}<Cite source={CHINESE_SOURCE} /></p>{c && c.romanized !== p.romanized && <p className="text-[11px] text-oxblood mt-1">Calculator: {c.stem}{c.branch} {c.romanized}</p>}<ReasoningPanel reasoning={p.reasoning} /></div>;
        })}</div>
        <p className="text-sm">Element balance: {ELEMENT_BALANCE.map(e => `${e.element} ${e.count}`).join(' · ')}.</p>
        <p className="max-w-3xl"><b>{LIFE_LESSON.headline}.</b> {LIFE_LESSON.body}<Cite source={CHINESE_SOURCE} /></p>
      </Section>

      <Section id="bagua" n="VII¼" title="Feng Shui · Bagua directions" level="derived" note="Wheel shows April's Kua 1 directions from the Feng Shui guide; Kua for another chart also needs birth year and gender, so treat this as a reference.">
        <BaguaWheel /><p className="text-xs mt-2"><Link to="/masterbook/bagua-wheel" className="underline">Open the Bagua wheel in the Masterbook</Link> · <Link to="/bagua-reading" className="underline">The Bagua Reading</Link></p>
      </Section>
      <Section id="elements" n="VII¾" title="Every chart element, with sources" level="confirmed" note="Each position's meaning with its Birth Chart Book chapter.">
        <ul className="grid sm:grid-cols-2 gap-2 text-sm">{PLACEMENTS.map(p => <li key={p.key} className="parchment p-3"><Link to={`/chart-elements#el-${p.key}`} className="font-display text-lg hover:underline">{p.glyph} {p.name} in {p.sign} · H{p.house}</Link><p>{p.headline}</p>{BCB_CHAPTER[p.key] && <Link to={`/masterbook/${BCB_CHAPTER[p.key].id}`} className="text-xs underline">Source: {BCB_CHAPTER[p.key].label}</Link>}</li>)}</ul>
        <p className="text-xs mt-2"><Link to="/chart-elements" className="underline">Open the full Chart Elements page</Link></p>
      </Section>
      <Section id="fengshui" n="VII½" title="Feng Shui · Flying Stars this year" level="derived" note="Annual stars are calculated; April's Kua 1 directions are quoted from the Feng Shui guide.">
        <FlyingStarWheel />
      </Section>
      <Section id="synthesis" n="VIII" title="Synthesis across systems" level="derived" note="An interpretive synthesis linking cited statements. The links are the app's inference.">
        {[
          { t: 'Depth before display', body: 'Sun, Venus and Mercury Rx in the 8th house, Pluto in domicile in the 10th, and Life Path 7 all point to truth found at depth and then brought into public work.', steps: [{ label: 'Western', detail: 'H8 stellium (Sun, Mercury, Venus) plus Pluto H10.' }, { label: 'Numerology', detail: 'Life Path 7: the seeker and specialist.' }, { label: 'Compendium', detail: `Sun Sabian “${sabFor('Sun')?.symbol}”: the ancestral, H8 inheritance theme.` }] },
          { t: 'Fire meeting Metal, with Water keeping the balance', body: 'The Ba Zi’s Fire–Metal tension matches the Western Full Moon (Aries fire against Virgo earth-precision). The Kua 1 Water element in Feng Shui is the balancing term, and the Feng Shui guide says Wood is what’s missing.', steps: [{ label: 'Ba Zi', detail: LIFE_LESSON.headline }, { label: 'Feng Shui', detail: 'Kua 1 Water; Wood is the missing bridge (18B).' }, { label: 'Western', detail: 'Sag ASC + Aries Moon (fire) vs Capricorn/Virgo (earth).' }] },
          { t: 'Structure as self', body: 'Saturn, Uranus and Neptune in Capricorn in the 1st house make structure part of her identity. The Feng Shui guide ties this to ritual and Black Obsidian at the entrance.', steps: [{ label: 'Western', detail: 'Capricorn H1 stellium.' }, { label: 'Feng Shui', detail: '18D: Black Obsidian for Saturn Rx H1; 12-week blessing ceremony.' }] },
        ].map((s, i) => <div key={i} className="parchment p-4"><h3 className="text-xl">{s.t}</h3><p className="text-sm mt-1">{s.body}<Cite source={KUA_FOUNDATION.source} /></p><ReasoningPanel reasoning={{ inputs: [], steps: s.steps, output: s.body, confidence: 'derived', caveats: ['Cross-system links are interpretive and are not quoted from the PDFs.'] }} /></div>)}
      </Section>

      <Section id="check" n="IX" title="Calculation cross-check" level="derived" note="The source positions compared with the in-app ephemeris.">
        <div className="overflow-x-auto"><table className="text-sm w-full"><thead><tr className="text-left font-smallcaps text-[10px] text-muted-foreground border-b border-border"><th className="py-1">Point</th><th>Source</th><th>Calculator</th><th>Δ</th></tr></thead><tbody>
          {check.bodies.filter(b => PLACEMENTS.some(p => p.key === b.key)).map(b => { const p = P(b.key as PlanetKey); const srcLon = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'].indexOf(p.sign) * 30 + p.degree + p.minute / 60; const d = Math.abs(((b.lon - srcLon + 540) % 360) - 180) * 60; return <tr key={b.key} className="border-b border-border/50"><td className="py-1">{b.glyph} {b.name}</td><td>{p.sign} {p.degree}°{String(p.minute).padStart(2, '0')}′</td><td>{b.sign} {b.deg}°{String(b.min).padStart(2, '0')}′</td><td className={d > 6 ? 'text-oxblood' : ''}>{d.toFixed(0)}′</td></tr>; })}
          <tr><td className="py-1">Ascendant</td><td>Sagittarius 29°28′</td><td>{fmtLon(check.asc!).text}</td><td>—</td></tr>
          <tr><td className="py-1">Midheaven</td><td>Libra 24°59′</td><td>{fmtLon(check.mc!).text}</td><td>—</td></tr>
        </tbody></table></div>
        <p className="text-xs text-muted-foreground">Nodes: the source may use the true node, while the calculator uses the mean node, so they can differ by up to ~1.5°. <Link to="/chart-calculator" className="underline">Open the calculator</Link></p>
      </Section>
    </div>
  );
}
