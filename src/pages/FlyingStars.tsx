import { SourceChapters } from '@/components/common/SourceChapters';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { STAR_INFO, flyStars, annualCenter, periodOf, GRID_SOUTH_UP, GRID_NORTH_UP, DIR_NAME, KUA_DIRECTIONS, FS_DOC_ID, SOLAR_MONTHS, monthlyCenter, yearBranch, type Dir } from '@/content/fengshui';
import { cn } from '@/lib/utils';
import { BAGUA } from '@/content/april';
import { ConfidenceBadge } from '@/components/common/ConfidenceBadge';
import { ReasoningPanel } from '@/components/common/ReasoningPanel';
import { Cite } from '@/components/common/Cite';
import { CopyLinkButton } from '@/components/common/CopyLinkButton';

const natureCls = (n: string) => n === 'Auspicious' ? 'border-gold/70 bg-gold/10' : n === 'Mixed' ? 'border-border bg-muted/40' : 'border-oxblood/50 bg-oxblood/5';
type View = 'annual' | 'monthly' | 'guide';
const VIEWS: { id: View; label: string }[] = [{ id: 'annual', label: 'Annual stars' }, { id: 'monthly', label: 'Monthly stars' }, { id: 'guide', label: 'How to use it' }];
/** Solar month holding today's date (month 0 begins ~Feb 4). */
const currentSolarMonth = (d = new Date()) => {
  const md = (d.getMonth() + 1) * 100 + d.getDate();
  if (md >= 1207 || md < 106) return 10;
  if (md < 204) return 11;
  const starts = [204, 306, 405, 506, 606, 707, 808, 908, 1008, 1107];
  let m = 0; starts.forEach((s, i) => { if (md >= s) m = i; }); return m;
};

export default function FlyingStars() {
  const [sp, setSp] = useSearchParams();
  const year = +(sp.get('year') ?? 2026);
  const view: View = (['monthly', 'guide'] as const).find(v => v === sp.get('view')) ?? 'annual';
  const month = Math.min(11, Math.max(0, +(sp.get('month') ?? currentSolarMonth())));
  const sel = (sp.get('sector') ?? 'SE') as Dir;
  const [southUp, setSouthUp] = useState(true);
  const set = (k: string, v: string) => { const n = new URLSearchParams(sp); n.set(k, v); setSp(n, { replace: true }); };
  const setView = (v: View) => { const n = new URLSearchParams(sp); if (v === 'annual') n.delete('view'); else n.set('view', v); setSp(n, { replace: true }); };

  const center = annualCenter(year);
  const annual = useMemo(() => flyStars(center), [center]);
  const per = periodOf(year);
  const base = useMemo(() => flyStars(per.period), [per.period]);
  const grid = southUp ? GRID_SOUTH_UP : GRID_NORTH_UP;
  const kua = KUA_DIRECTIONS.find(k => k.dir === sel);
  const gua = BAGUA.find(b => (b.direction === 'Center' ? 'C' : b.direction) === sel);
  const star = STAR_INFO[annual[sel]];
  const mCenter = monthlyCenter(year, month);
  const monthly = useMemo(() => flyStars(mCenter), [mCenter]);

  return (
    <div className="space-y-10">
      <header>
        <div className="font-label text-xs tracking-[0.16em] text-primary">Feng Shui · Xuan Kong Flying Stars</div>
        <h1 className="text-4xl sm:text-5xl mt-2">Flying Stars for April’s Home</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">Each year nine “stars” move through the nine sectors of a home. Pick a year and click any sector to see which star visits, what it means, and how it combines with April’s Kua 1 directions from the Feng Shui guide.</p>
        <div className="flex flex-wrap gap-3 mt-3 items-center text-sm">
          <ConfidenceBadge level="derived" note="The star charts are calculated with the classical method. The source PDFs don't include Flying Stars, so only the Kua directions carry page citations." />
          <Link to="/feng-shui/bagua" className="underline">Bagua & home guide →</Link>
          <Link to={`/masterbook/pdf/${FS_DOC_ID}?page=115`} className="underline">Open the Feng Shui PDF (p. 115)</Link>
        </div>
      </header>

      <section aria-labelledby="fs-about" className="obs-paper grid gap-5 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <p className="font-label text-xs tracking-[0.16em] text-primary">About Flying Stars</p>
          <h2 id="fs-about" className="mt-1 font-display text-3xl">Xuan Kong Fei Xing</h2>
          <p className="mt-3 text-sm leading-relaxed">Flying Stars is a classical Chinese feng shui method. It tracks nine numbered “stars” — 1 to 9 — as they move through the nine sectors of a home, so the same room can feel different from one year, or one month, to the next.</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">The method is usually traced to Tang-dynasty (618–907) masters, was written down in the Song dynasty and refined through the Ming and Qing. It sits beside the Bagua and Kua directions rather than replacing them.</p>
        </div>
        <ol className="space-y-3 text-sm leading-relaxed">
          <li><span className="font-label text-xs tracking-[0.14em] text-accent">How it moves · </span>Each solar year one star takes the centre and the rest follow the Lo Shu path: centre, northwest, west, northeast, south, north, southwest, east, southeast. Months repeat the pattern on a smaller scale.</li>
          <li><span className="font-label text-xs tracking-[0.14em] text-accent">Step one · </span>Find which way the front of the home faces and stand in the middle of the floor plan.</li>
          <li><span className="font-label text-xs tracking-[0.14em] text-accent">Step two · </span>Lay this year’s chart over the plan, sector by sector.</li>
          <li><span className="font-label text-xs tracking-[0.14em] text-accent">Step three · </span>Use the good stars for desks, beds and daily work; calm the difficult ones with the remedy listed for each star.</li>
        </ol>
      </section>

      <div role="tablist" aria-label="Flying Stars views" className="flex flex-wrap gap-2">
        {VIEWS.map(v => <button key={v.id} type="button" role="tab" aria-selected={view === v.id} onClick={() => setView(v.id)} className={cn('rounded-full border border-[hsl(var(--brass)/0.5)] px-4 py-1.5 font-label text-sm tracking-[0.12em] transition-colors duration-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', view === v.id ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary')}>{v.label}</button>)}
      </div>

      {view !== 'guide' && <div className="flex flex-wrap items-center gap-3">
        <label className="font-label text-[10px] tracking-[0.14em] text-muted-foreground">Year</label>
        <input type="range" min={2024} max={2043} value={year} onChange={e => set('year', e.target.value)} className="w-56 accent-[hsl(var(--gold))]" aria-label="Year" />
        <span className="font-display text-2xl">{year}</span>
        <span className="text-xs text-muted-foreground">center star {center} · Period {per.period} ({per.from}–{per.to})</span>
        <button onClick={() => setSouthUp(v => !v)} className="text-xs border border-border rounded px-2 py-1 hover:bg-muted ml-auto">{southUp ? 'South at top (classical)' : 'North at top'} · flip</button>
      </div>}

      {view === 'monthly' && <MonthlyStars year={year} month={month} onMonth={m => set('month', String(m))} grid={grid} monthly={monthly} annual={annual} center={mCenter} />}

      {view === 'guide' && <FlyingStarsGuide />}

      {view === 'annual' && <div className="grid lg:grid-cols-[minmax(0,420px)_1fr] gap-8">
        <div>
          <div className="grid grid-cols-3 gap-1.5 aspect-square">
            {grid.flat().map(d => {
              const s = STAR_INFO[annual[d]]; const k = KUA_DIRECTIONS.find(x => x.dir === d);
              return (
                <button key={d} onClick={() => set('sector', d)} aria-pressed={sel === d}
                  className={`relative rounded border-2 p-2 text-left transition ${natureCls(s.nature)} ${sel === d ? 'ring-2 ring-foreground/70' : 'hover:ring-1 hover:ring-gold'}`}>
                  <div className="font-label text-[10px] tracking-[0.14em] text-muted-foreground">{DIR_NAME[d]}</div>
                  <div className="font-display text-4xl leading-none mt-1">{annual[d]}</div>
                  <div className="text-[10px] mt-1">{s.element}</div>
                  <div className="absolute top-1.5 right-2 text-[10px] text-muted-foreground" title="Period 9 base star">P{base[d]}</div>
                  {k && <div className={`absolute bottom-1.5 right-2 text-[9px] font-smallcaps ${k.auspicious ? 'text-gold' : 'text-oxblood'}`}>{k.name}</div>}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">Big number = annual star · P = Period 9 base star · bottom label = April’s Kua direction.</p>
        </div>

        <div className="parchment p-5 space-y-4" id={`sector-${sel}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-label text-[10px] tracking-[0.14em] text-primary">{year} · {DIR_NAME[sel]}</div>
              <h2 className="text-2xl">Star {annual[sel]} — {star.name}</h2>
            </div>
            <CopyLinkButton path={`/feng-shui/flying-stars?year=${year}&sector=${sel}`} label="Share" />
          </div>
          <div className="flex gap-2 flex-wrap text-xs"><span className="border rounded px-2 py-0.5">{star.nature}</span><span className="border rounded px-2 py-0.5">{star.element}</span><span className="border rounded px-2 py-0.5">Base star {base[sel]}: {STAR_INFO[base[sel]].name}</span></div>
          <p>{star.theme}</p>
          <p className="text-sm"><span className="font-label text-[10px] tracking-[0.14em] text-primary mr-2">Remedy</span>{star.remedy}</p>
          {kua && (
            <div className="border-t border-border pt-3">
              <div className="font-label text-[10px] tracking-[0.14em] text-primary flex items-center gap-2">April’s Kua 1 direction <ConfidenceBadge compact level={kua.standardNote ? 'ambiguous' : 'confirmed'} note={kua.standardNote ?? 'Quoted from the PDF direction table.'} /></div>
              <p className="mt-1"><b>{kua.name}</b> · {kua.meaning}. {kua.activation}<Cite source={{ doc: 'Complete Birth Chart Analysis & Feng Shui Guide', section: '18A · Direction table', page: 'pp. 115–116' }} /></p>
              {kua.standardNote && <p className="text-xs italic text-muted-foreground mt-1">{kua.standardNote}</p>}
            </div>
          )}
          {gua && <div className="border-t border-border pt-3 text-sm"><div className="font-label text-[10px] tracking-[0.14em] text-primary">Bagua area · {gua.gua}</div><p className="mt-1">{gua.lifeArea} ({gua.element}). {gua.guidance}</p></div>}
          <div className="border-t border-border pt-3 text-sm">
            <div className="font-label text-[10px] tracking-[0.14em] text-primary">Combined reading</div>
            <p className="mt-1">{kua?.auspicious && star.nature === 'Auspicious' ? `Double support: a good personal direction meets a good annual star. Put the desk, bed-head or daily work here in ${year}.`
              : kua?.auspicious && star.nature !== 'Auspicious' ? `A good personal direction is visited by a difficult star in ${year}. Keep using the direction, but apply the remedy and avoid renovation here this year.`
              : !kua?.auspicious && star.nature === 'Auspicious' && sel !== 'C' ? `An unfavourable personal direction receives a helpful star. It's fine for social or shared use this year, but don't move the bed or desk here.`
              : sel === 'C' ? 'The center holds the year’s ruling star. Keep it open, bright and uncluttered.'
              : `Unfavourable direction and difficult star: use it for storage or utility this year and apply the remedy.`}</p>
          </div>
          <ReasoningPanel reasoning={{
            inputs: [{ label: 'Year', value: String(year) }, { label: 'Annual center star', value: String(center) }, { label: 'Period', value: `${per.period} (${per.from}–${per.to})` }],
            steps: [
              { label: 'Center star', detail: `2026 is star 1 at the center. It descends by one each solar year (starting at Lichun, ~Feb 4) → ${year}: ${center}.` },
              { label: 'Flight path', detail: 'Stars fly Center → NW → W → NE → S → N → SW → E → SE, adding 1 each step (9 wraps to 1).' },
              { label: 'Overlay', detail: 'Each sector’s star is combined with April’s Kua 1 direction (PDF 18A) and the Bagua life area.' },
            ],
            output: `${DIR_NAME[sel]} holds annual star ${annual[sel]} and base star ${base[sel]}.`,
            confidence: 'derived',
            caveats: ['A full natal house chart needs the building’s facing degree and construction period (not in the sources). This view shows annual and period base stars only.', 'The year changes at Lichun (~Feb 4), not January 1.'],
          }} />
        </div>
      </div>}

      <section>
        <h2 className="text-2xl mb-3">The nine stars</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {Object.values(STAR_INFO).map(s => (
            <div key={s.n} className={`rounded border p-3 ${natureCls(s.nature)}`}>
              <div className="font-display text-xl">{s.n} · {s.name}</div>
              <div className="text-[11px] text-muted-foreground">{s.element} · {s.nature}</div>
              <p className="text-sm mt-1">{s.theme}</p>
            </div>
          ))}
        </div>
      </section>
      <SourceChapters match={/flying star|feng shui|period \d|annual star/i} />
    </div>
  );
}

/** One solar month: its centre star, the nine sectors, and how each month star meets the year's star. */
function MonthlyStars({ year, month, onMonth, grid, monthly, annual, center }: { year: number; month: number; onMonth: (m: number) => void; grid: Dir[][]; monthly: Record<Dir, number>; annual: Record<Dir, number>; center: number }) {
  const solarYear = month === 11 ? `${year}–${year + 1}` : String(year);
  return (
    <section aria-labelledby="fs-monthly" className="space-y-5">
      <div>
        <h2 id="fs-monthly" className="font-display text-3xl">Monthly stars · {yearBranch(year)} year {year}</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Month stars change at each solar term, not on the 1st. They are lighter than the year’s star: read them as the weather of the month passing through a room whose climate is set by the year.</p>
      </div>
      <div role="group" aria-label="Solar month" className="flex snap-x gap-2 overflow-x-auto pb-2">
        {SOLAR_MONTHS.map((m, i) => <button key={m.label} type="button" aria-pressed={month === i} onClick={() => onMonth(i)} className={cn('shrink-0 snap-start rounded-sm border px-3 py-2 text-left text-xs transition-colors duration-700', month === i ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:border-[hsl(var(--brass)/0.7)]')}><span className="block font-label text-sm tracking-[0.12em]">{m.label}</span>from ~{m.starts}{i === 11 ? `, ${year + 1}` : ''} · star {monthlyCenter(year, i)}</button>)}
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
        <div>
          <div className="grid aspect-square grid-cols-3 gap-1.5">
            {grid.flat().map(d => { const s = STAR_INFO[monthly[d]]; return (
              <div key={d} className={`relative rounded border-2 p-2 ${natureCls(s.nature)}`}>
                <div className="font-label text-[10px] tracking-[0.14em] text-muted-foreground">{DIR_NAME[d]}</div>
                <div className="mt-1 font-display text-4xl leading-none">{monthly[d]}</div>
                <div className="mt-1 text-[10px]">{s.element}</div>
                <div className="absolute right-2 top-1.5 text-[10px] text-muted-foreground" title={`Annual star for ${year}`}>Y{annual[d]}</div>
              </div>); })}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Big number = month star · Y = this solar year’s star in the same sector.</p>
        </div>
        <div className="obs-paper space-y-4 p-5">
          <p className="font-label text-xs tracking-[0.16em] text-primary">{SOLAR_MONTHS[month].label} · {solarYear}</p>
          <h3 className="font-display text-2xl">Star {center} — {STAR_INFO[center].name} at the centre</h3>
          <p className="text-sm">{STAR_INFO[center].theme}</p>
          <ul className="space-y-2 text-sm">
            {(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as Dir[]).filter(d => [2, 5].includes(monthly[d]) || [2, 5].includes(annual[d])).map(d => (
              <li key={d}><span className="font-medium">{DIR_NAME[d]}:</span> month {monthly[d]} over year {annual[d]}. {monthly[d] === 5 || annual[d] === 5 ? 'Keep it quiet this month — no digging or drilling — and add metal.' : 'Keep it calm and add metal; good for storage rather than a bedroom this month.'}</li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">Calculated with the classical rule for monthly stars. The source PDFs don’t cover Flying Stars, so this view carries no page citations.</p>
        </div>
      </div>
    </section>
  );
}

/** Plain-language guide to reading the charts on this page. */
function FlyingStarsGuide() {
  const steps = [
    { t: 'Find the facing direction', d: 'Stand at the front door looking out. The direction you face is the home’s facing direction; a phone compass works if you hold it away from metal and appliances.' },
    { t: 'Mark the nine sectors', d: 'Draw a three-by-three grid over the floor plan, centred on the middle of the home rather than the middle of a room. Each square is one sector.' },
    { t: 'Overlay the year', d: 'Open the annual chart for the current solar year (it changes around Feb 4, not Jan 1). Write each sector’s star on the plan.' },
    { t: 'Read the good stars', d: 'Stars 1, 4, 6, 8 and 9 support work, study, rest and money. Put the desk, bed-head or the room you use most in one of them.' },
    { t: 'Settle the difficult stars', d: 'Stars 2 and 5 call for metal and quiet; 3 calls for a little fire (red, candles); 7 calls for still water. Avoid renovation in the 5 sector that year.' },
    { t: 'Check the month', d: 'Glance at the monthly chart when something big is planned. A difficult month star over a difficult year star is the moment to postpone work in that sector.' },
  ];
  return (
    <section aria-labelledby="fs-guide" className="space-y-5">
      <h2 id="fs-guide" className="font-display text-3xl">How to use Flying Stars at home</h2>
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((s, i) => <li key={s.t} className="obs-paper space-y-2 p-5"><p className="font-label text-xs tracking-[0.16em] text-primary">Step {i + 1}</p><h3 className="font-display text-xl">{s.t}</h3><p className="text-sm leading-relaxed text-muted-foreground">{s.d}</p></li>)}
      </ol>
      <p className="max-w-3xl text-sm text-muted-foreground">Flying Stars describes the space, not the person. Combine it with the Kua directions on this page and the Bagua map, and treat it as a guide for arranging rooms rather than a forecast of events.</p>
    </section>
  );
}

