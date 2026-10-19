import { SourceChapters } from '@/components/common/SourceChapters';
import { Link, useSearchParams } from 'react-router-dom';
import { BAGUA } from '@/content/april';
import { KUA_DIRECTIONS, KUA_FOUNDATION, ELEMENT_PROFILE, ROOMS, CRYSTALS, TWELVE_WEEKS, GRID_SOUTH_UP, DIR_NAME, FS_DOC_ID, STAR_INFO, flyStars, annualCenter, type Dir } from '@/content/fengshui';
import { ConfidenceBadge } from '@/components/common/ConfidenceBadge';
import { Cite } from '@/components/common/Cite';
import { ReasoningPanel } from '@/components/common/ReasoningPanel';
import { CopyLinkButton } from '@/components/common/CopyLinkButton';
import type { SourceRef } from '@/content/compendium';

const PdfLink = ({ s }: { s: SourceRef & { pageNum?: number } }) =>
  s.pageNum ? <Link to={`/masterbook/pdf/${FS_DOC_ID}?page=${s.pageNum}`} className="text-[11px] underline text-muted-foreground">view {s.page} in the PDF</Link> : null;

export default function Bagua() {
  const [sp, setSp] = useSearchParams();
  const sel = (sp.get('sector') ?? 'SE') as Dir;
  const pick = (d: Dir) => { const n = new URLSearchParams(sp); n.set('sector', d); setSp(n, { replace: true }); };
  const thisYear = flyStars(annualCenter(2026));
  const kua = KUA_DIRECTIONS.find(k => k.dir === sel);
  const gua = BAGUA.find(b => (b.direction === 'Center' ? 'C' : b.direction) === sel)!;
  const rooms = ROOMS.filter(r => r.dirs.includes(sel));
  const crystals = CRYSTALS.filter(c => c.dirs.includes(sel));

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-4xl sm:text-5xl mt-2">The Bagua & Home Guide</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">{KUA_FOUNDATION.text}<Cite source={KUA_FOUNDATION.source} /></p>
        <div className="flex flex-wrap gap-4 text-sm mt-3"><Link to="/feng-shui/flying-stars" className="underline">Flying Stars by year →</Link><Link to="/feng-shui" className="underline">Feng Shui overview</Link><Link to={`/masterbook/pdf/${FS_DOC_ID}?page=114`} className="underline">Read Section 18 in the PDF</Link></div>
      </header>

      <section className="grid lg:grid-cols-[minmax(0,420px)_1fr] gap-8">
        <div>
          <div className="grid grid-cols-3 gap-1.5 aspect-square">
            {GRID_SOUTH_UP.flat().map(d => {
              const g = BAGUA.find(b => (b.direction === 'Center' ? 'C' : b.direction) === d)!;
              const k = KUA_DIRECTIONS.find(x => x.dir === d);
              return (
                <button key={d} onClick={() => pick(d)} aria-pressed={sel === d}
                  className={`rounded border-2 p-2 text-left transition ${k ? (k.auspicious ? 'border-gold/70 bg-gold/10' : 'border-oxblood/40 bg-oxblood/5') : 'border-border bg-muted/40'} ${sel === d ? 'ring-2 ring-foreground/70' : 'hover:ring-1 hover:ring-gold'}`}>
                  <div className="font-smallcaps text-[10px] text-muted-foreground">{DIR_NAME[d]} · {g.gua}</div>
                  <div className="font-display text-sm leading-tight mt-1">{g.lifeArea}</div>
                  <div className="text-[10px] mt-1">{g.element}</div>
                  {k && <div className={`text-[9px] font-smallcaps mt-1 ${k.auspicious ? 'text-gold' : 'text-oxblood'}`}>{k.name}</div>}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">South at top, the classical layout. Gold = April’s four good directions, red = the four to suppress.</p>
        </div>

        <div className="parchment p-5 space-y-4">
          <div className="flex justify-between items-start gap-3">
            <div><div className="font-smallcaps text-[10px] text-gold">{DIR_NAME[sel]} · {gua.gua} · {gua.element}</div><h2 className="text-2xl">{gua.lifeArea}</h2></div>
            <CopyLinkButton path={`/feng-shui/bagua?sector=${sel}`} label="Share" />
          </div>
          {kua && <div>
            <div className="font-smallcaps text-[10px] text-gold flex items-center gap-2">Kua 1 direction (PDF) <ConfidenceBadge compact level={kua.standardNote ? 'ambiguous' : 'confirmed'} note={kua.standardNote ?? 'Quoted verbatim from the direction table.'} /></div>
            <p className="mt-1"><b>{kua.name} — {kua.meaning}.</b> {kua.activation}<Cite source={{ doc: 'Complete Birth Chart Analysis & Feng Shui Guide', section: '18A · Direction table', page: 'pp. 115–116' }} /></p>
            {kua.standardNote && <p className="text-xs italic text-muted-foreground mt-1">{kua.standardNote}</p>}
          </div>}
          <div><div className="font-smallcaps text-[10px] text-gold">Bagua guidance</div><p className="mt-1 text-sm">{gua.guidance}</p><p className="text-xs text-muted-foreground mt-1">Colours: {gua.color}</p></div>
          <div className="text-sm"><span className="font-smallcaps text-[10px] text-gold mr-2">2026 annual star</span><Link className="underline" to={`/feng-shui/flying-stars?year=2026&sector=${sel}`}>{thisYear[sel]} · {STAR_INFO[thisYear[sel]].name}</Link></div>
          {rooms.length > 0 && <div><div className="font-smallcaps text-[10px] text-gold">Rooms for this sector</div>{rooms.map(r => <a key={r.id} href={`#${r.id}`} className="block text-sm underline">{r.name}</a>)}</div>}
          {crystals.length > 0 && <div><div className="font-smallcaps text-[10px] text-gold">Crystals placed here</div><div className="flex flex-wrap gap-1.5 mt-1">{crystals.map(c => <a key={c.id} href={`#${c.id}`} className="text-xs border rounded px-2 py-0.5 hover:bg-muted">{c.name}</a>)}</div></div>}
          <ReasoningPanel reasoning={{
            inputs: [{ label: 'Kua number', value: '1 (Water, East Group)', source: KUA_FOUNDATION.source }, { label: 'Sector', value: DIR_NAME[sel] }],
            steps: [{ label: 'Kua directions', detail: 'The PDF’s 18A table assigns each compass direction a quality for Kua 1.' }, { label: 'Bagua', detail: 'Compass Bagua: each trigram rules a direction, element and life area.' }, { label: 'Cross-links', detail: 'Rooms and crystals are linked to a sector when the PDF names that direction or placement.' }],
            output: `${DIR_NAME[sel]}: ${kua ? kua.name + ' — ' + kua.meaning : 'Tai Ji center'}; ${gua.lifeArea}.`,
            confidence: kua?.standardNote ? 'ambiguous' : 'confirmed',
            caveats: kua?.standardNote ? [kua.standardNote] : undefined,
          }} />
        </div>
      </section>

      <section id="elements">
        <h2 className="text-3xl">18B · Elemental profile</h2>
        <div className="flex flex-wrap items-center gap-2 my-4">
          {ELEMENT_PROFILE.cycle.map((e, i) => (
            <span key={e} className="flex items-center gap-2">
              <span className={`rounded-full border-2 px-3 py-1.5 text-sm ${e === 'Wood' ? 'border-dashed border-oxblood' : 'border-gold'}`} title={ELEMENT_PROFILE.present[e]}><b>{e}</b> <span className="text-[10px] text-muted-foreground">· {ELEMENT_PROFILE.present[e]}</span></span>
              {i < 4 && <span className="text-gold">→</span>}
            </span>
          ))}
        </div>
        {ELEMENT_PROFILE.paragraphs.map((p, i) => <p key={i} className="mb-3 max-w-3xl">{p}{i === 1 && <Cite source={ELEMENT_PROFILE.source} />}</p>)}
        <PdfLink s={ELEMENT_PROFILE.source} />
      </section>

      <section>
        <h2 className="text-3xl mb-4">18C · Room by room</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {ROOMS.map(r => (
            <article key={r.id} id={r.id} className="parchment p-4 scroll-mt-24">
              <div className="font-smallcaps text-[10px] text-gold">{r.dirs.map(d => DIR_NAME[d]).join(' · ')}</div>
              <h3 className="text-xl">{r.name}</h3>
              <p className="text-sm mt-2">{r.text}<Cite source={r.source} /></p>
              <div className="flex gap-3 mt-2">{r.dirs.map(d => <button key={d} onClick={() => { pick(d); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-[11px] underline">show {d} on the map</button>)}<PdfLink s={r.source} /></div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl mb-4">18D · Crystal master guide</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CRYSTALS.map(c => (
            <details key={c.id} id={c.id} className="parchment p-3 scroll-mt-24 group">
              <summary className="cursor-pointer list-none"><div className="font-display text-lg">{c.name}</div><div className="text-[11px] text-muted-foreground">{c.basis}</div></summary>
              <p className="text-sm mt-2"><b>Purpose:</b> {c.purpose}</p>
              <p className="text-sm"><b>Placement:</b> {c.placement}<Cite source={c.source} /></p>
              <PdfLink s={c.source} />
            </details>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl mb-4">18E · 12-week implementation</h2>
        <ol className="relative border-l-2 border-gold/50 ml-3 space-y-5">
          {TWELVE_WEEKS.map((w, i) => (
            <li key={i} id={`week-${i + 1}`} className="pl-5 relative scroll-mt-24">
              <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-gold" />
              <details open={i === 0}><summary className="cursor-pointer"><span className="font-smallcaps text-[10px] text-gold mr-2">{w.weeks}</span><span className="font-display text-lg">{w.focus}</span></summary>
                <p className="text-sm mt-1 max-w-3xl">{w.actions}<Cite source={w.source} /></p><PdfLink s={w.source} /></details>
            </li>
          ))}
        </ol>
      </section>
      <SourceChapters match={/bagua|feng shui|kua|sacred space|crystal/i} />
    </div>
  );
}
