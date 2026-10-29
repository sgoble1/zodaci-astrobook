import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { computeChart, fmtLon, SIGN_KEYWORDS, BODY_KEYWORDS, type ChartInput } from '@/lib/astro';
import { usePageMeta } from '@/hooks/usePageMeta';
import { APRIL, fromParams, toParams } from './ChartCalculator';
import { starContacts } from '@/components/chart/ChartWheel';
import { KuaWheel } from '@/components/fengshui/KuaWheel';
import { BaguaWheel } from '@/components/fengshui/BaguaWheel';
import { ConfidenceBadge } from '@/components/common/ConfidenceBadge';
import { ReasoningPanel } from '@/components/common/ReasoningPanel';
import { kuaNumber, dirsFor, KUA_ELEMENT, groupOf } from '@/lib/kua';
import { DIR_NAME } from '@/content/fengshui';
import { BCB_CHAPTER } from '@/content/birthChartBook';

const GEN: Record<string, string> = { Wood: 'Fire', Fire: 'Earth', Earth: 'Metal', Metal: 'Water', Water: 'Wood' };

/** One reading that ties natal positions, aspects, Ba Zi, Compendium stars and the Kua/Bagua directions together. */
export default function BaguaReading({ input: given }: { input?: ChartInput } = {}) {
  const [sp] = useSearchParams();
  // Members pass their own birth details; April's edition (the only place this renders without them) reads hers.
  const input = given ?? fromParams(sp) ?? APRIL;
  const isApril = !given && input.date === APRIL.date && input.time === APRIL.time;
  usePageMeta(given ? 'Your Bagua reading · Zodaci' : 'Bagua reading · Zodaci', 'Natal positions, Four Pillars and Feng Shui directions woven into one reading.');
  const key = JSON.stringify(input);
  const r = useMemo(() => computeChart(input), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const k = isApril ? { kua: 1, steps: ['Kua 1 as stated in April’s Feng Shui guide, Section 18A (p. 114).'] } : kuaNumber(input.date, input.sex ?? 'unspecified');
  const stars = starContacts(r);
  const day = r.bazi.find(p => p.label.startsWith('Day'))!;
  const b = (key: string) => r.bodies.find(x => x.key === key)!;
  const dirs = k ? dirsFor(k.kua) : [];
  const kEl = k ? KUA_ELEMENT[k.kua] : null;
  const elRel = kEl && (kEl === day.stemElement ? 'the same element — the home reinforces the self' : GEN[kEl] === day.stemElement ? `${kEl} feeds the ${day.stemElement} Day Master — the home nourishes the self` : GEN[day.stemElement] === kEl ? `the ${day.stemElement} Day Master feeds the ${kEl} Kua — energy flows out into the home; rest matters` : `${kEl} and ${day.stemElement} sit in a controlling relationship — balance with the element between them`);
  const venusH = b('venus').house, sunH = b('sun').house;

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <div className="font-smallcaps text-xs text-gold">Bagua reading</div>
        <h1 className="text-4xl">{given ? 'Your Bagua reading' : `Bagua Reading · ${isApril ? 'April' : `${input.date} · ${input.placeLabel}`}`}</h1>
        <p className="max-w-3xl text-muted-foreground">Natal positions, aspects, the Four Pillars, Compendium fixed stars and the Feng Shui Kua directions woven into one reading, with confidence and reasoning for each part. {given ? <><Link to="/my-chart" className="underline">Your chart</Link> · <Link to="/feng-shui" className="underline">Your directions</Link></> : <><Link to={`/reading?${toParams(input)}`} className="underline">Full reading</Link> · <Link to={`/chart-calculator?${toParams(input)}`} className="underline">Change the chart</Link></>}</p>
        <div className="flex flex-wrap gap-2">{r.flags.map((f, i) => <ConfidenceBadge key={i} level={f.level} note={`${f.topic}: ${f.note}`} />)}</div>
      </header>

      <section className="space-y-3"><h2 className="text-2xl border-b border-gold/40 pb-1">I · The directions</h2>
        {isApril ? <BaguaWheel /> : k ? <KuaWheel kua={k.kua} /> : <p className="text-oxblood">Sex isn’t given, so the Kua number can’t be calculated. {given ? <Link to="/start" className="underline">Add it to your birth details</Link> : 'Add it in the Chart Calculator.'}</p>}
        {k && <ReasoningPanel reasoning={{ inputs: [{ label: 'Birth date', value: input.date }, { label: 'Sex', value: isApril ? 'female (Kua from guide)' : input.sex ?? '—' }], steps: k.steps.map((s, i) => ({ label: `Step ${i + 1}`, detail: s })), output: `Kua ${k.kua} · ${kEl} · ${groupOf(k.kua)} group`, confidence: isApril ? 'confirmed' : 'derived', caveats: isApril ? ['The standard female formula gives Kua 8 for this birth year; the guide’s Kua 1 is used.'] : [] }} />}
      </section>

      {k && <section className="space-y-3"><h2 className="text-2xl border-b border-gold/40 pb-1">II · Each direction, read through the chart <ConfidenceBadge level="derived" note="The links between directions and chart placements are the app’s interpretation." /></h2>
        <ul className="grid md:grid-cols-2 gap-3 text-sm">{dirs.map(d => {
          const link = d.mansion === 'Sheng Chi' ? `Career and money: Sun in ${b('sun').sign}${sunH ? ` (house ${sunH})` : ''} and the Midheaven${r.mc != null ? ` in ${fmtLon(r.mc).sign}` : ''} are activated by working facing ${DIR_NAME[d.dir]}.`
            : d.mansion === 'Tien Yi' ? `Health: Moon in ${b('moon').sign} (${SIGN_KEYWORDS[b('moon').sign]}) rests best with the head toward ${DIR_NAME[d.dir]}.`
            : d.mansion === 'Nien Yen' ? `Love: Venus in ${b('venus').sign}${venusH ? ` (house ${venusH})` : ''} — ${SIGN_KEYWORDS[b('venus').sign]} — is supported by a bed or shared space in the ${DIR_NAME[d.dir]}.`
            : d.mansion === 'Fu Wei' ? `Growth: North Node in ${b('northNode').sign} points the way; meditate or study facing ${DIR_NAME[d.dir]}.`
            : `Keep important activity out of the ${DIR_NAME[d.dir]}; use it for storage or a bathroom.`;
          return <li key={d.mansion} className="parchment p-3"><b>{DIR_NAME[d.dir]} · {d.mansion}</b> — {d.meaning} {d.good ? '✓' : '✗'}<p>{d.use}</p><p className="mt-1 italic">{link}</p></li>;
        })}</ul></section>}

      <section className="space-y-3"><h2 className="text-2xl border-b border-gold/40 pb-1">III · Natal positions</h2>
        <ul className="grid sm:grid-cols-2 gap-2 text-sm">{r.bodies.map(x => <li key={x.key} className="parchment p-2"><b>{x.glyph} {x.name} {x.deg}° {x.sign}</b>{x.house ? ` · H${x.house}` : ''} <ConfidenceBadge compact level={x.confidence} note={x.note} /> — {BODY_KEYWORDS[x.key]}: {SIGN_KEYWORDS[x.sign]}. {isApril && BCB_CHAPTER[x.key] && <Link to={`/masterbook/${BCB_CHAPTER[x.key].id}`} className="underline text-xs">Source: {BCB_CHAPTER[x.key].label}</Link>}</li>)}</ul>
        <h3 className="text-xl">Strongest aspects</h3>
        <ul className="text-sm grid sm:grid-cols-2">{r.aspects.slice(0, 12).map((a, i) => <li key={i}>{a.a} {a.symbol} {a.b} ({a.orb.toFixed(1)}°)</li>)}</ul>
      </section>

      <section className="space-y-3"><h2 className="text-2xl border-b border-gold/40 pb-1">IV · Four Pillars & the home</h2>
        <p className="text-sm">{r.bazi.map(p => `${p.label}: ${p.stem}${p.branch} ${p.romanized} (${p.stemElement} ${p.animal})`).join(' · ')}</p>
        {kEl && <p><b>Day Master {day.stemElement} with Kua element {kEl}:</b> {elRel}.</p>}
        <p className="text-sm">Ba Zi element count: {Object.entries(r.elements).map(([e, n]) => `${e} ${n}`).join(', ')}. Missing: {Object.entries(r.elements).filter(([, n]) => n === 0).map(([e]) => e).join(', ') || 'none'} — bring the missing element in with colour and objects in your good directions.</p>
      </section>

      <section className="space-y-3"><h2 className="text-2xl border-b border-gold/40 pb-1">V · Compendium fixed stars</h2>
        {stars.length ? <ul className="text-sm">{stars.map((s, i) => <li key={i}>★ <Link className="underline" to={`/compendium#${s.star.id}`}>{s.star.name}</Link> conjunct {s.point} ({s.orb.toFixed(1)}°): {s.star.meaning}</li>)}</ul> : <p className="text-sm text-muted-foreground">No Compendium stars within 1.5°.</p>}
      </section>
    </div>
  );
}
