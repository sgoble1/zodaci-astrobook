import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { computeChart } from '@/lib/astro';
import { kuaSex, toChartInput, type MyBirth } from '@/lib/myBirth';
import { kuaNumber, dirsFor, KUA_ELEMENT, groupOf } from '@/lib/kua';
import { STAR_INFO, flyStars, annualCenter, periodOf, GRID_SOUTH_UP, DIR_NAME, type Dir } from '@/content/fengshui';
import { KuaWheel } from '@/components/fengshui/KuaWheel';
import { ReasoningPanel } from '@/components/common/ReasoningPanel';
import { ConfidenceBadge } from '@/components/common/ConfidenceBadge';
import { Button } from '@/components/ui/button';
import { usePageMeta } from '@/hooks/usePageMeta';

const GEN: Record<string, string> = { Wood: 'Fire', Fire: 'Earth', Earth: 'Metal', Metal: 'Water', Water: 'Wood' };
const natureCls = (n: string) => (n === 'Auspicious' ? 'border-gold/70 bg-gold/10' : n === 'Mixed' ? 'border-border bg-muted/40' : 'border-oxblood/50 bg-oxblood/5');

/** A member's own Feng Shui: Kua number from their birth date and sex, their eight directions, and this year's flying stars read against them. */
export default function MemberFengShui({ birth, focus = 'directions' }: { birth: MyBirth; focus?: 'directions' | 'stars' }) {
  usePageMeta('Your Feng Shui · Kua & directions · Zodaci', 'Your Kua number, best and challenging directions, and this year’s flying stars, from your own birth details.');
  const [tab, setTab] = useState(focus);
  const [year, setYear] = useState(new Date().getFullYear());
  const [sel, setSel] = useState<Dir>('C');
  const k = kuaNumber(birth.date, kuaSex(birth.sex));
  const chart = useMemo(() => computeChart(toChartInput(birth)), [birth]);
  const day = chart.bazi.find(p => p.label.startsWith('Day'));
  const dirs = k ? dirsFor(k.kua) : [];
  const stars = flyStars(annualCenter(year));
  const period = periodOf(year);
  const kEl = k ? KUA_ELEMENT[k.kua] : null;
  const elRel = kEl && day && (kEl === day.stemElement ? 'the same element — your home reinforces your sense of self' : GEN[kEl] === day.stemElement ? `${kEl} feeds your ${day.stemElement} Day Master — the home nourishes you` : GEN[day.stemElement] === kEl ? `your ${day.stemElement} Day Master feeds the ${kEl} Kua — energy flows out into the home, so rest matters` : `${kEl} and ${day.stemElement} sit in a controlling relationship — balance them with the element between`);
  const mineFor = (d: Dir) => dirs.find(x => x.dir === d);
  const info = STAR_INFO[stars[sel]];
  const selMine = sel !== 'C' ? mineFor(sel) : undefined;
  return (
    <article className="space-y-10">
      <header>
        <p className="font-smallcaps text-xs text-gold">Feng Shui · from your birth details</p>
        <h1 className="font-display mt-1 text-4xl">{k ? `Kua ${k.kua} · ${KUA_ELEMENT[k.kua]} · ${groupOf(k.kua)} group` : 'Your Feng Shui directions'}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Eight Mansions directions from your Kua number, and the annual flying stars read against them. Calculated in the app from the classical method; your home’s layout is yours to apply.</p>
        <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Feng Shui views">
          {(['directions', 'stars'] as const).map(t => <Button key={t} role="tab" aria-selected={tab === t} size="sm" variant={tab === t ? 'secondary' : 'outline'} onClick={() => setTab(t)}>{t === 'directions' ? 'Your directions' : `Flying stars ${year}`}</Button>)}
          <Button asChild size="sm" variant="ghost"><Link to="/bagua-reading">Your Bagua reading</Link></Button>
        </div>
      </header>

      {!k && (
        <div role="note" className="rounded-lg border border-gold/40 bg-card/60 p-5 text-sm">
          <p>Your Kua number needs the sex recorded at birth (the classical formula differs for male and female).</p>
          <Button asChild size="sm" className="mt-3"><Link to="/start">Update my birth details</Link></Button>
        </div>
      )}

      {tab === 'directions' && k && (
        <section className="space-y-6">
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
            <KuaWheel kua={k.kua} label="You" />
            <div className="space-y-3">
              <ReasoningPanel reasoning={{ inputs: [{ label: 'Birth date', value: birth.date }, { label: 'Sex', value: birth.sex ?? '—' }], steps: k.steps.map((s, i) => ({ label: `Step ${i + 1}`, detail: s })), output: `Kua ${k.kua} · ${kEl} · ${groupOf(k.kua)} group`, confidence: 'derived', caveats: ['Births before Li Chun (about February 4) count as the previous solar year.'] }} />
              {elRel && <p className="text-sm"><b>Your Day Master ({day!.polarity} {day!.stemElement}) with your Kua element ({kEl}):</b> {elRel}.</p>}
            </div>
          </div>
          <ul className="grid gap-3 md:grid-cols-2">
            {dirs.map(d => (
              <li key={d.mansion} className={`rounded border p-4 text-sm ${d.good ? 'border-gold/50 bg-gold/5' : 'border-border bg-card/60'}`}>
                <div className="flex items-baseline justify-between gap-2"><b className="font-display text-lg">{DIR_NAME[d.dir]} · {d.mansion}</b><span className="text-xs text-muted-foreground">{d.good ? 'Supportive' : 'Challenging'}</span></div>
                <p className="mt-1">{d.meaning}</p>
                <p className="mt-1 text-muted-foreground">{d.use}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === 'stars' && (
        <section className="space-y-5">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <label className="flex items-center gap-2">Year
              <select value={year} onChange={e => setYear(+e.target.value)} className="rounded-md border border-input bg-background px-2 py-1">
                {Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 1 + i).map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </label>
            <span className="text-muted-foreground">Period {period.period} ({period.from}–{period.to}) · annual centre star {annualCenter(year)}</span>
            <ConfidenceBadge compact level="derived" note="Classical Xuan Kong annual chart; the year turns at Li Chun (about February 4). Not taken from your source documents." />
          </div>
          <div className="grid items-start gap-6 md:grid-cols-[minmax(0,360px)_1fr]">
            <div role="grid" aria-label={`Flying stars for ${year}, south at the top`} className="grid grid-cols-3 gap-2">
              {GRID_SOUTH_UP.flat().map(d => {
                const n = stars[d]; const mine = d !== 'C' ? mineFor(d) : undefined;
                return (
                  <button key={d} type="button" role="gridcell" aria-selected={sel === d} onClick={() => setSel(d)} className={`aspect-square rounded border p-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${natureCls(STAR_INFO[n].nature)} ${sel === d ? 'ring-2 ring-gold' : ''}`}>
                    <span className="block text-[10px] text-muted-foreground">{d === 'C' ? 'Centre' : DIR_NAME[d]}</span>
                    <span className="block font-display text-3xl">{n}</span>
                    {mine && <span className={`block text-[10px] ${mine.good ? 'text-gold' : 'text-muted-foreground'}`}>{mine.mansion}</span>}
                  </button>
                );
              })}
            </div>
            <div className="vellum space-y-2 p-5 text-sm">
              <h2 className="font-display text-2xl">{sel === 'C' ? 'Centre' : DIR_NAME[sel]} · Star {stars[sel]}</h2>
              <p><b>{info.name}</b> · {info.element} · {info.nature}</p>
              <p>{info.theme}</p>
              <p className="text-muted-foreground">Remedy: {info.remedy}</p>
              {selMine && <p className="border-t border-border pt-2">For you this is your <b>{selMine.mansion}</b> direction ({selMine.meaning.toLowerCase()}). {selMine.good && info.nature === 'Auspicious' ? 'A supportive star in a supportive direction — a strong place to work or rest this year.' : !selMine.good && info.nature === 'Inauspicious' ? 'A challenging star in a challenging direction — keep this area quiet and use the remedy.' : 'Mixed signals: use the remedy and keep the room tidy and well lit.'}</p>}
              <p className="text-xs text-muted-foreground">South is at the top, the traditional orientation.</p>
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
