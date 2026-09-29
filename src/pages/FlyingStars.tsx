import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { STAR_INFO, flyStars, annualCenter, periodOf, GRID_SOUTH_UP, GRID_NORTH_UP, DIR_NAME, KUA_DIRECTIONS, FS_DOC_ID, type Dir } from '@/content/fengshui';
import { BAGUA } from '@/content/april';
import { ConfidenceBadge } from '@/components/common/ConfidenceBadge';
import { ReasoningPanel } from '@/components/common/ReasoningPanel';
import { Cite } from '@/components/common/Cite';
import { CopyLinkButton } from '@/components/common/CopyLinkButton';

const natureCls = (n: string) => n === 'Auspicious' ? 'border-gold/70 bg-gold/10' : n === 'Mixed' ? 'border-border bg-muted/40' : 'border-oxblood/50 bg-oxblood/5';

export default function FlyingStars() {
  const [sp, setSp] = useSearchParams();
  const year = +(sp.get('year') ?? 2026);
  const sel = (sp.get('sector') ?? 'SE') as Dir;
  const [southUp, setSouthUp] = useState(true);
  const set = (k: string, v: string) => { const n = new URLSearchParams(sp); n.set(k, v); setSp(n, { replace: true }); };

  const center = annualCenter(year);
  const annual = useMemo(() => flyStars(center), [center]);
  const per = periodOf(year);
  const base = useMemo(() => flyStars(per.period), [per.period]);
  const grid = southUp ? GRID_SOUTH_UP : GRID_NORTH_UP;
  const kua = KUA_DIRECTIONS.find(k => k.dir === sel);
  const gua = BAGUA.find(b => (b.direction === 'Center' ? 'C' : b.direction) === sel);
  const star = STAR_INFO[annual[sel]];

  return (
    <div className="space-y-10">
      <header>
        <div className="font-smallcaps text-xs text-gold">Feng Shui · Xuan Kong Flying Stars</div>
        <h1 className="text-4xl sm:text-5xl mt-2">Flying Stars for April’s Home</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">Each year nine “stars” move through the nine sectors of a home. Pick a year and click any sector to see which star visits, what it means, and how it combines with April’s Kua 1 directions from the Feng Shui guide.</p>
        <div className="flex flex-wrap gap-3 mt-3 items-center text-sm">
          <ConfidenceBadge level="derived" note="The star charts are calculated with the classical method. The source PDFs don't include Flying Stars, so only the Kua directions carry page citations." />
          <Link to="/feng-shui/bagua" className="underline">Bagua & home guide →</Link>
          <Link to={`/masterbook/pdf/${FS_DOC_ID}?page=115`} className="underline">Open the Feng Shui PDF (p. 115)</Link>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <label className="font-smallcaps text-[10px] text-muted-foreground">Year</label>
        <input type="range" min={2024} max={2043} value={year} onChange={e => set('year', e.target.value)} className="w-56 accent-[hsl(var(--gold))]" aria-label="Year" />
        <span className="font-display text-2xl">{year}</span>
        <span className="text-xs text-muted-foreground">center star {center} · Period {per.period} ({per.from}–{per.to})</span>
        <button onClick={() => setSouthUp(v => !v)} className="text-xs border border-border rounded px-2 py-1 hover:bg-muted ml-auto">{southUp ? 'South at top (classical)' : 'North at top'} · flip</button>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,420px)_1fr] gap-8">
        <div>
          <div className="grid grid-cols-3 gap-1.5 aspect-square">
            {grid.flat().map(d => {
              const s = STAR_INFO[annual[d]]; const k = KUA_DIRECTIONS.find(x => x.dir === d);
              return (
                <button key={d} onClick={() => set('sector', d)} aria-pressed={sel === d}
                  className={`relative rounded border-2 p-2 text-left transition ${natureCls(s.nature)} ${sel === d ? 'ring-2 ring-foreground/70' : 'hover:ring-1 hover:ring-gold'}`}>
                  <div className="font-smallcaps text-[10px] text-muted-foreground">{DIR_NAME[d]}</div>
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
              <div className="font-smallcaps text-[10px] text-gold">{year} · {DIR_NAME[sel]}</div>
              <h2 className="text-2xl">Star {annual[sel]} — {star.name}</h2>
            </div>
            <CopyLinkButton path={`/feng-shui/flying-stars?year=${year}&sector=${sel}`} label="Share" />
          </div>
          <div className="flex gap-2 flex-wrap text-xs"><span className="border rounded px-2 py-0.5">{star.nature}</span><span className="border rounded px-2 py-0.5">{star.element}</span><span className="border rounded px-2 py-0.5">Base star {base[sel]}: {STAR_INFO[base[sel]].name}</span></div>
          <p>{star.theme}</p>
          <p className="text-sm"><span className="font-smallcaps text-[10px] text-gold mr-2">Remedy</span>{star.remedy}</p>
          {kua && (
            <div className="border-t border-border pt-3">
              <div className="font-smallcaps text-[10px] text-gold flex items-center gap-2">April’s Kua 1 direction <ConfidenceBadge compact level={kua.standardNote ? 'ambiguous' : 'confirmed'} note={kua.standardNote ?? 'Quoted from the PDF direction table.'} /></div>
              <p className="mt-1"><b>{kua.name}</b> · {kua.meaning}. {kua.activation}<Cite source={{ doc: 'Complete Birth Chart Analysis & Feng Shui Guide', section: '18A · Direction table', page: 'pp. 115–116' }} /></p>
              {kua.standardNote && <p className="text-xs italic text-muted-foreground mt-1">{kua.standardNote}</p>}
            </div>
          )}
          {gua && <div className="border-t border-border pt-3 text-sm"><div className="font-smallcaps text-[10px] text-gold">Bagua area · {gua.gua}</div><p className="mt-1">{gua.lifeArea} ({gua.element}). {gua.guidance}</p></div>}
          <div className="border-t border-border pt-3 text-sm">
            <div className="font-smallcaps text-[10px] text-gold">Combined reading</div>
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
      </div>

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
    </div>
  );
}
