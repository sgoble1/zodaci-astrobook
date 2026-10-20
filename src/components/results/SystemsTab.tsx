import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ChartResult } from '@/lib/astro';
import { lifePath, LP_MEANING } from '@/lib/synastry';
import { personalYear } from '@/lib/advancedDeductions';
import { numerologyCross, NUM_KEYWORD, expression, soulUrge, personality } from '@/lib/numerologyCross';
import { pinnacles, challenges, bridge, CHALLENGE_TEXT, pillarRelations } from '@/lib/resultsEngine';
import { kuaNumber, dirsFor, groupOf, KUA_ELEMENT, type Sex } from '@/lib/kua';
import { TierGate } from '@/components/common/TierGate';
import { Input } from '@/components/ui/input';
import type { Plan } from '@/content/navigation';

/** Systems: Chinese pillars, numerology and Feng Shui with tiered depth (Free → Pro → Cosmic). */
export function SystemsTab({ chart, date, name, sex, plan, loading }: { chart: ChartResult; date: string; name: string; sex: Sex; plan: Plan; loading: boolean }) {
  const [fullName, setFullName] = useState(name);
  const [openNum, setOpenNum] = useState<string | null>(null);
  const year = chart.bazi.find(p => /year/i.test(p.label));
  const lp = lifePath(date);
  const day = Number(date.slice(8, 10));
  const tiles = useMemo(() => numerologyCross(chart, date, fullName.trim() || name), [chart, date, fullName, name]);
  const pins = pinnacles(date), chal = challenges(date);
  const age = new Date().getFullYear() - Number(date.slice(0, 4));
  const relations = pillarRelations(chart.bazi);
  const kua = sex !== 'unspecified' ? kuaNumber(date, sex) : null;
  const ex = expression(fullName || name), su = soulUrge(fullName || name), pe = personality(fullName || name);
  return (
    <div className="space-y-10">
      <section aria-labelledby="sy-cn" className="space-y-3">
        <h2 id="sy-cn" className="font-display text-2xl">Chinese astrology</h2>
        <p className="rounded-lg border border-border bg-card p-4"><span className="font-medium">Year animal: {year ? `${year.stemElement} ${year.animal}` : '—'}</span><span className="block text-sm text-muted-foreground">Based on the solar-term year, so births in January or early February can belong to the previous animal.</span></p>
        <TierGate plan={plan} loading={loading} need="full" title="Four Pillars, element balance, clashes and harmonies">
          <div className="space-y-3">
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{chart.bazi.map(p => <li key={p.label} className="rounded-lg border border-border bg-card p-4 text-center"><p className="font-smallcaps text-xs text-gold">{p.label}</p><p className="font-display text-3xl">{p.stem}{p.branch}</p><p className="text-sm">{p.romanized}</p><p className="text-xs text-muted-foreground">{p.stemElement} {p.polarity} · {p.animal}</p></li>)}</ul>
            <p className="text-sm">Element balance: {Object.entries(chart.elements).map(([k, v]) => `${k} ${v}`).join(' · ')}.{Object.entries(chart.elements).filter(([, v]) => v === 0).length ? ` Missing: ${Object.entries(chart.elements).filter(([, v]) => v === 0).map(([k]) => k).join(', ')}.` : ''}</p>
            {relations.length ? <ul className="space-y-2">{relations.map((r, i) => <li key={i} className="rounded border border-border bg-card p-3 text-sm"><span className={r.kind === 'Clash' ? 'text-destructive' : 'text-gold'}>{r.kind}:</span> {r.text}</li>)}</ul> : <p className="text-sm text-muted-foreground">No clashes or harmonies form between your pillars.</p>}
          </div>
        </TierGate>
      </section>

      <section aria-labelledby="sy-num" className="space-y-3">
        <h2 id="sy-num" className="font-display text-2xl">Numerology</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          <li className="rounded-lg border border-border bg-card p-4"><p className="font-smallcaps text-xs text-gold">Life Path</p><p className="font-display text-4xl">{lp}</p><p className="text-sm">{LP_MEANING[lp]}</p></li>
          <li className="rounded-lg border border-border bg-card p-4"><p className="font-smallcaps text-xs text-gold">Birthday</p><p className="font-display text-4xl">{day}</p><p className="text-sm">A secondary talent that colours your Life Path.</p></li>
        </ul>
        <TierGate plan={plan} loading={loading} need="full" title="Name numbers, Personal Year, Pinnacles and Challenges">
          <div className="space-y-5">
            <label className="block text-sm">Full birth name (used only on this page, never saved)<Input className="mt-1" value={fullName} onChange={e => setFullName(e.target.value.slice(0, 120))} placeholder="As written on your birth certificate" /></label>
            <ul className="grid gap-3 md:grid-cols-2">{tiles.map(t => (
              <li key={t.id} className="rounded-lg border border-border bg-card">
                <button type="button" aria-expanded={openNum === t.id} onClick={() => setOpenNum(openNum === t.id ? null : t.id)} className="flex w-full items-center gap-4 p-4 text-left transition-colors duration-500 hover:bg-primary/5">
                  <span className="font-display text-4xl text-gold">{t.value}</span><span><span className="font-medium">{t.label}</span><span className="block text-xs text-muted-foreground">{t.keyword} · {t.element}</span></span></button>
                {openNum === t.id && <div className="space-y-2 px-4 pb-4 text-sm"><p>{t.text}</p><p className="text-muted-foreground">{t.cross}</p><p className="text-xs text-muted-foreground">{t.basis}</p></div>}
              </li>))}</ul>
            <p className="rounded border border-border bg-card p-4 text-sm"><span className="font-medium">Personal Year {personalYear(date, new Date().getFullYear())}</span> for {new Date().getFullYear()}.</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-4"><h3 className="font-medium">Pinnacles (life chapters)</h3><ul className="mt-2 space-y-1 text-sm">{pins.map((p, i) => <li key={i} className={age >= p.from && (p.to == null || age <= p.to) ? 'text-gold' : ''}>{i + 1}. Ages {p.from}–{p.to ?? 'on'}: {p.n} ({NUM_KEYWORD[p.n]})</li>)}</ul></div>
              <div className="rounded-lg border border-border bg-card p-4"><h3 className="font-medium">Challenges (lessons)</h3><ul className="mt-2 space-y-1 text-sm">{chal.map((c, i) => <li key={i}>{i + 1}. {c}: {CHALLENGE_TEXT[c]}</li>)}</ul></div>
            </div>
          </div>
        </TierGate>
        <TierGate plan={plan} loading={loading} need="creator" title="Bridge numbers">
          <div className="rounded-lg border border-border bg-card p-4 text-sm"><h3 className="font-medium">Bridge numbers</h3>
            <p className="mt-1">These show the gap between parts of you, and the quality that closes it.</p>
            <ul className="mt-2 space-y-1">{ex != null && <li>Life Path ↔ Expression: {bridge(lp, ex)}</li>}{su != null && pe != null && <li>Soul Urge ↔ Personality: {bridge(su, pe)}</li>}</ul></div>
        </TierGate>
      </section>

      <section aria-labelledby="sy-fs" className="space-y-3">
        <h2 id="sy-fs" className="font-display text-2xl">Feng Shui</h2>
        {!kua ? <p className="rounded border border-border bg-card p-4 text-sm">Your Kua number uses birth sex. Add it in your <Link to="/start" className="text-primary underline">birth details</Link> to see your directions.</p> : <>
          <p className="rounded-lg border border-border bg-card p-4"><span className="font-medium">Kua {kua.kua} · {groupOf(kua.kua)} group · {KUA_ELEMENT[kua.kua]}</span><span className="block text-sm text-muted-foreground">Calculated from solar year {kua.solarYear}.</span></p>
          <TierGate plan={plan} loading={loading} need="full" title="Your eight directions">
            <ul className="grid gap-2 sm:grid-cols-2">{dirsFor(kua.kua).map(d => <li key={d.mansion} className={`rounded border p-3 text-sm ${d.good ? 'border-gold/50 bg-card' : 'border-border bg-muted/30'}`}><span className="font-medium">{d.dir} · {d.mansion}</span><span className="block text-muted-foreground">{d.meaning}. {d.use}</span></li>)}</ul>
            <p className="mt-3 text-sm"><Link className="text-primary underline" to="/feng-shui/flying-stars">See this year’s Flying Stars</Link> and <Link className="text-primary underline" to="/feng-shui">map your home</Link>.</p>
          </TierGate>
        </>}
      </section>
    </div>
  );
}
