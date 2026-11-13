import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { markdownSections, NavigatedProse } from '@/components/readings/NavigatedProse';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { loadProtectedJson, loadProtectedText, ContentLockedError, ACCESS_CHANGED_EVENT } from '@/lib/protectedContent';
import type { MbEntry } from './Masterbook';
import { CATEGORIES, catsFor } from '@/lib/chapterTopics';
import { ArrangeToggle, BirthFacts, ChapterCard, ChapterPart, EditionModules, EditionTitle, TopicFilter } from '@/components/observatory/EditionPieces';
import { NoEditionAccess, PrivateEditionGate } from '@/components/common/PrivateEditionGate';
import { FounderAccuracy } from '@/components/readings/FounderAccuracy';
import { useSession } from '@/hooks/useLibrary';
import { usePageMeta } from '@/hooks/usePageMeta';
import { onAccountChange } from '@/lib/authEvents';
import { useOwnsEdition, useWholeEditionAccess } from '@/lib/editionSharing';
import { EditionSharingPanel, ShareChapterButton, SharedByNote } from '@/components/sharing/EditionSharing';
import { officialChartInput, useOfficialEditions } from '@/lib/officialEditions';
import { computeChart, fmtLon, type ChartResult } from '@/lib/astro';
import { chartTitle, dominantElement } from '@/lib/chartTitle';
import { balance } from '@/lib/resultsEngine';
import { ChartWheel } from '@/components/chart/ChartWheel';
import { PlanetOrb } from '@/components/chart/PlanetOrb';
import { ThemeArt } from '@/components/common/ThemeArt';
import { DashboardMosaic } from '@/components/observatory/DashboardMosaic';
import { CurrentChapterPanel } from '@/components/observatory/CurrentChapterPanel';
import { FounderNews } from '@/components/common/FounderNews';
import { ChartWheelIcon, TelevisionIcon, LibraryIcon, StorefrontIcon, PressIcon } from '@/components/icons/RetroIcons';

type EditionKey = 'shane' | 'zac';
const caches: Partial<Record<EditionKey, Promise<MbEntry[]>>> = {};
/** Chapter list for a founder edition. The server returns every chapter to the owner and to whole-edition readers, and only the shared chapters to anyone else. */
export const loadEditionIndex = (area: EditionKey) => (caches[area] ??= loadProtectedJson<MbEntry[]>(area, 'index.json').catch(e => { delete caches[area]; throw e; }));
export const loadShaneIndex = () => loadEditionIndex('shane');
const clearCaches = () => { delete caches.shane; delete caches.zac; };
onAccountChange(clearCaches);
if (typeof window !== 'undefined') window.addEventListener(ACCESS_CHANGED_EVENT, clearCaches);

type Module = { to: string; title: string; desc: string; full?: boolean; owner?: boolean };
export const EDITION_COPY: Record<EditionKey, { name: string; base: string; title: string; blurb: string; source: string; note: string; eyebrow: string; tagline: string; modules: Module[] }> = {
  shane: {
    name: 'Shane', base: '/shane', title: 'Shane’s Astrological Masterbook', eyebrow: 'Zodaci · Shane’s Masterbook',
    tagline: 'A complete map of the sky at the moment of his birth.',
    blurb: 'from natal foundations and houses to Vedic, karmic, relationship and timing volumes.',
    source: 'Shane’s Astrological Masterbook — transcribed in full.',
    note: 'Original uploaded text, preserved unchanged. Some source placements conflict with Shane’s calculated chart; this chapter is not a verified report. Medical, family-history and past-life claims are not established by astrology.',
    modules: [
      { to: '/official-astrobook/illustrated', title: 'Zodaci Illustrated · October 2026', desc: 'The illustrated edition, read page by page from private storage.', full: true },
      { to: '/official-astrobook', title: 'The Official AstroBook', desc: 'Print editions, covers and the comic built from this chart.', full: true },
      { to: '/my-chart', title: 'The calculated chart', desc: 'Every placement recalculated from the saved birth details, with house systems and orbs.', owner: true },
      { to: '/relationships', title: 'Relationships', desc: 'Synastry, composite and timing with the people in your life.', owner: true },
      { to: '/timeline', title: 'Timing & transits', desc: 'Current transits, profections and retrogrades for this chart.', owner: true },
      { to: '/counselors', title: 'Chart-informed counselors', desc: 'Private sessions that read from this chart, never from anyone else’s.', owner: true },
    ],
  },
  zac: {
    name: 'Zac', base: '/zac', title: 'Zac’s Astrological Library', eyebrow: 'Zodaci · Zac’s Astrological Library',
    tagline: 'Six volumes drawn from one noon sky — July 10, 1987.',
    blurb: 'six volumes: the natal chart, Vedic and Chinese systems, family and career, world traditions, the 360° life map and the road ahead.',
    source: 'Zachary — Volumes I–VI, a gift from Shane, transcribed in full.',
    note: 'Original text from Zac’s six volumes, preserved unchanged. Placements are checked against his calculated chart from the confirmed birth time in Volume I. Medical, family-history and past-life claims are not established by astrology.',
    modules: [
      { to: '/investors', title: 'Investor overview', desc: 'What Zodaci is, what is built so far and what comes next, in plain language.', owner: true },
      { to: '/zac/workbook', title: 'Zac’s Workbook', desc: 'A private notebook beside his chart, for his own thoughts whenever he wants it.', full: true },
      { to: '/official-astrobook', title: 'The Official AstroBook', desc: 'Print editions, covers and the comic built from this chart.', full: true },
      { to: '/my-chart', title: 'The calculated chart', desc: 'Every placement recalculated from the saved birth details.', owner: true },
      { to: '/counselors', title: 'Chart-informed counselors', desc: 'Private sessions that read from this chart, never from anyone else’s.', owner: true },
      { to: '/timeline', title: 'Timing & transits', desc: 'Current transits, profections and retrogrades for this chart.', owner: true },
    ],
  },
};

export default function ShaneEdition() { return <PrivateEditionGate><EditionInner area="shane" /></PrivateEditionGate>; }
export function ZacEdition() { return <PrivateEditionGate><EditionInner area="zac" /></PrivateEditionGate>; }

/** The edition's chart, calculated from its saved birth facts (only returned to people allowed to read the whole edition). */
function useEditionChart(area: EditionKey, enabled: boolean): ChartResult | null {
  const { rows } = useOfficialEditions();
  const birth = enabled ? rows?.find(r => r.edition === area)?.birth ?? null : null;
  return useMemo(() => {
    if (!birth) return null;
    try { return computeChart(officialChartInput(birth)); } catch { return null; }
  }, [birth]);
}

function EditionInner({ area }: { area: EditionKey }) {
  const copy = EDITION_COPY[area];
  const session = useSession();
  const { id } = useParams();
  const owns = useOwnsEdition(area);
  const full = useWholeEditionAccess(area);
  const [entries, setEntries] = useState<MbEntry[] | null>(null);
  const [denied, setDenied] = useState(false);
  const [err, setErr] = useState('');
  const [text, setText] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  usePageMeta(id && entries ? `${entries.find(e => e.id === id)?.title ?? copy.title} · ${copy.name}` : `${copy.title} · Zodaci`, `${copy.name}’s private Masterbook.`);
  useEffect(() => {
    const again = () => setRetry(v => v + 1);
    window.addEventListener(ACCESS_CHANGED_EVENT, again);
    return () => window.removeEventListener(ACCESS_CHANGED_EVENT, again);
  }, []);
  useEffect(() => {
    let active = true;
    setEntries(null); setErr(''); setDenied(false);
    if (session) void loadEditionIndex(area).then(e => { if (active) setEntries(e); }).catch(e => {
      if (!active) return;
      if (e instanceof ContentLockedError) setDenied(true);
      else setErr(`${copy.name}’s edition couldn’t be opened. Check your connection and try again.`);
    });
    return () => { active = false; };
  }, [session?.user.id, retry, area]);
  useEffect(() => {
    let active = true;
    setText(null);
    if (id && session) void loadProtectedText(area, `${id}.md`).then(t => { if (active) setText(t); }).catch(e => { if (active) setText(e instanceof ContentLockedError ? 'denied' : ''); });
    if (!window.location.hash) window.scrollTo(0, 0);
    return () => { active = false; };
  }, [id, session?.user.id, retry, area]);

  if (denied) return <div className="space-y-4"><h1 className="text-4xl">{copy.title}</h1><NoEditionAccess owner={copy.name} onRetry={() => setRetry(v => v + 1)} /></div>;
  if (err) return <div className="space-y-4"><h1 className="text-4xl">{copy.title}</h1><p role="alert" className="text-muted-foreground">{err}</p><Button variant="outline" onClick={() => setRetry(v => v + 1)}>Try again</Button></div>;
  if (id) return <ChapterView area={area} id={id} entries={entries} text={text} owns={owns === true} full={full === true} onRetry={() => setRetry(v => v + 1)} />;
  return <EditionHome area={area} entries={entries} owns={owns === true} full={full} />;
}

function ChapterView({ area, id, entries, text, owns, full, onRetry }: { area: EditionKey; id: string; entries: MbEntry[] | null; text: string | null; owns: boolean; full: boolean; onRetry: () => void }) {
  const copy = EDITION_COPY[area];
  const i = (entries ?? []).findIndex(e => e.id === id);
  const e = entries?.[i]; const prev = i > 0 ? entries?.[i - 1] : undefined; const next = i >= 0 ? entries?.[i + 1] : undefined;
  const headingLevel = markdownSections(text ?? '', 3).length > 1 ? 3 : 2;
  // The index lists every chapter this account may open, so an id outside it is a wrong address, not a connection problem.
  if (entries && i < 0) return (
    <article className="min-w-0 space-y-4">
      <Link to={copy.base} className="font-smallcaps text-xs text-muted-foreground hover:text-foreground">← {full ? copy.title : `Shared from ${copy.name}’s Masterbook`}</Link>
      <h1 className="text-3xl">Chapter not found</h1>
      <p className="text-muted-foreground">{full ? `There is no chapter at this address in ${copy.name}’s edition.` : `This chapter isn’t one ${copy.name} has shared with you.`}</p>
      <Button asChild variant="outline"><Link to={copy.base}>See the chapters</Link></Button>
    </article>
  );
  return (
    <article className="min-w-0">
      <Link to={copy.base} className="font-smallcaps text-xs text-muted-foreground hover:text-foreground">← {full ? copy.title : `Shared from ${copy.name}’s Masterbook`}</Link>
      {e && <><div className="mt-4 font-label text-xs tracking-[0.16em] text-primary">{e.part} · {e.label}</div><h1 className="mt-2 text-3xl sm:text-4xl">{e.title}</h1></>}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {owns && e && <ShareChapterButton edition={area} chapter={{ id: e.id, title: e.title }} />}
        {!owns && e && <SharedByNote ownerName={copy.name} scope={full ? 'edition' : 'chapter'} />}
      </div>
      <div className="gold-rule my-6" />
      <p role="note" className="mb-6 border-l-2 border-accent pl-4 text-sm text-muted-foreground">{copy.note}</p>
      {text === null ? <p role="status" className="text-muted-foreground">Opening the chapter…</p>
        : text === 'denied' ? <NoEditionAccess owner={copy.name} onRetry={onRetry} />
        : text === '' ? <div className="space-y-3"><p role="alert">This chapter couldn’t be opened. Check your connection and try again.</p><Button variant="outline" onClick={onRetry}>Try again</Button></div>
        : <NavigatedProse content={text} path={`${copy.base}/${id}`} title={e?.title ?? `${copy.name}’s chapter`} headingLevel={headingLevel} insights />}
      <p className="parchment mt-10 p-4 text-xs text-muted-foreground"><span className="font-label tracking-[0.14em] text-primary">Source</span> · {copy.source}</p>
      <nav className="mt-8 flex justify-between gap-4" aria-label="Chapters">
        {prev ? <Link to={`${copy.base}/${prev.id}`} className="parchment flex max-w-[48%] items-center gap-2 p-3 text-sm"><ChevronLeft className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="truncate">{prev.title}</span></Link> : <span />}
        {next && <Link to={`${copy.base}/${next.id}`} className="parchment flex max-w-[48%] items-center gap-2 p-3 text-right text-sm"><span className="truncate">{next.title}</span><ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" /></Link>}
      </nav>
    </article>
  );
}

const ORB_KEYS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'northNode'];

function EditionHome({ area, entries, owns, full }: { area: EditionKey; entries: MbEntry[] | null; owns: boolean; full: boolean | undefined }) {
  const copy = EDITION_COPY[area];
  const chart = useEditionChart(area, full === true);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string | null>(null);
  const [view, setView] = useState<'parts' | 'topics'>('parts');
  const list = useMemo(() => (entries ?? []).filter(e => (!cat || catsFor(e).includes(cat)) && (e.title + ' ' + e.label + ' ' + e.sections.join(' ') + ' ' + (e.excerpt ?? '')).toLowerCase().includes(q.toLowerCase())), [entries, q, cat]);
  const total = (entries ?? []).reduce((a, e) => a + e.words, 0);
  const groups = useMemo(() => {
    const m = new Map<string, MbEntry[]>();
    list.forEach(e => { const keys = view === 'parts' ? [e.part] : (catsFor(e).length ? catsFor(e) : ['Other']); keys.forEach(k => m.set(k, [...(m.get(k) ?? []), e])); });
    const out = [...m.entries()];
    if (view === 'topics') out.sort((a, b) => { const o = (k: string) => { const i = CATEGORIES.findIndex(c => c[0] === k); return i < 0 ? 99 : i; }; return o(a[0]) - o(b[0]); });
    return out;
  }, [list, view]);
  const sun = chart?.bodies.find(b => b.key === 'sun');
  const moon = chart?.bodies.find(b => b.key === 'moon');
  const rising = chart?.asc != null ? fmtLon(chart.asc) : null;
  const named = chart && sun ? chartTitle({ sun: sun.sign, moon: moon?.sign, rising: rising?.sign, dominant: dominantElement(balance(chart).el) }) : null;
  const birth = chart?.input;
  const modules = copy.modules.filter(m => (!m.owner || owns) && (!m.full || full));
  const chapterOnly = full === false;

  if (chapterOnly) return (
    <div className="space-y-8">
      <header>
        <div className="font-label text-xs tracking-[0.16em] text-primary">{copy.eyebrow}</div>
        <h1 className="mt-2 text-4xl sm:text-5xl">Shared from {copy.name}’s Masterbook</h1>
        <div className="mt-3"><SharedByNote ownerName={copy.name} scope="chapter" /></div>
        <p className="mt-3 max-w-2xl text-muted-foreground">{copy.name} shared {entries ? (entries.length === 1 ? 'one chapter' : `${entries.length} chapters`) : 'chapters'} with you. The rest of the book stays private.</p>
      </header>
      {!entries ? <p role="status" className="text-muted-foreground">Opening what {copy.name} shared…</p> : <ChapterGrid area={area} entries={entries} />}
    </div>
  );

  return (
    <div className="space-y-14">
      {full === true && chart && <>
        <DashboardMosaic chart={chart} name={copy.name} hasTime={Boolean(birth?.time)} primary={{ to: `${copy.base}#${area}-contents`, label: 'Browse the volumes' }} secondary={{ to: '/my-chart', label: 'View chart' }} onAir={{ cta: { to: '#edition-broadcast', label: 'Tune in' } }} press={{ book: { to: '/official-astrobook', label: 'Official AstroBook' }, comic: { to: `/official-astrobook/comic/${area}`, label: 'Official AstroComic' } }} destinations={[
          { to: `${copy.base}#${area}-contents`, title: 'Edition library', text: '', cta: 'Open', icon: LibraryIcon },
          { to: '#edition-broadcast', title: 'Broadcast Studio', text: '', cta: 'Open', icon: TelevisionIcon },
          { to: '/my-chart', title: 'Calculated chart', text: '', cta: 'Open', icon: ChartWheelIcon },
          area === 'zac' && owns ? { to: '/investors', title: 'Investor overview', text: '', cta: 'Open', icon: PressIcon } : { to: '/store', title: 'Gift shop', text: '', cta: 'Open', icon: StorefrontIcon },
        ]} />
        <div id="edition-broadcast" className="scroll-mt-24"><CurrentChapterPanel chart={chart} name={copy.name} /></div>
        <FounderNews edition={area} owns={owns} count={3} />
      </>}
      <section className="gentle-fade grid items-center gap-10 lg:grid-cols-[1.1fr,0.9fr]">
        <div>
          <EditionTitle eyebrow={copy.eyebrow} name={copy.name} tagline={copy.tagline} as={full === true && chart ? 'h2' : 'h1'} />
          {!owns && <div className="mb-4"><SharedByNote ownerName={copy.name} scope="edition" /></div>}
          <p className="max-w-xl text-lg leading-relaxed text-foreground/85">The complete book{entries ? ` — ${entries.length} chapters, about ${Math.round(total / 1000)}k words —` : ''} {copy.blurb}</p>
          {named && <p className="mt-6 font-display text-2xl text-gold">{named.title}</p>}
          {named && <p className="mt-1 max-w-xl text-sm text-muted-foreground" title={named.why}>{named.subtitle}</p>}
          {birth && <BirthFacts facts={[['Born', birth.date], ['Time', birth.time ?? 'Unknown'], ['Place', birth.placeLabel], ['Rising', rising ? `${rising.sign} ${rising.deg}°` : '—']]} />}
          <div className="mt-8 flex flex-wrap gap-3">
            {entries?.[0] && <Button asChild><Link to={`${copy.base}/${entries[0].id}`} className="font-smallcaps text-xs">Begin reading</Link></Button>}
            <Button variant="outline" className="font-smallcaps text-xs" onClick={() => document.getElementById(`${area}-contents`)?.scrollIntoView({ behavior: 'smooth' })}>Contents</Button>
          </div>
        </div>
        {chart ? (
          <div className="vellum deckle p-3 sm:p-5" aria-label={`${copy.name}’s calculated natal wheel`}>
            <ChartWheel r={chart} />
          </div>
        ) : (
          <div className="deckle vellum flex aspect-square items-center justify-center p-8" aria-hidden="true"><ThemeArt kind="chart" className="h-40 w-40" /></div>
        )}
      </section>

      {chart && (
        <section aria-labelledby={`${area}-planets`} className="gentle-fade">
          <div className="font-label text-xs tracking-[0.16em] text-primary">The planets</div>
          <h2 id={`${area}-planets`} className="font-display mt-1">Every placement, and where the book discusses it.</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Tap a planet to show the chapters that mention it. Placements are calculated from {copy.name}’s saved birth details.</p>
          <ul className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {ORB_KEYS.flatMap(k => { const b = chart.bodies.find(body => body.key === k); return b ? [b] : []; }).map(b => (
              <li key={b.key}>
                <Button variant="outline" onClick={() => { setQ(b.name); setCat(null); document.getElementById(`${area}-contents`)?.scrollIntoView({ behavior: 'smooth' }); }} aria-label={`Show chapters about ${b.name} in ${b.sign}`} className="h-auto w-full flex-col gap-2 whitespace-normal p-3 text-center">
                  <PlanetOrb planet={b.key} size={48} />
                  <span className="text-sm">{b.name}</span>
                  <span className="text-xs text-muted-foreground">{b.sign} {b.deg}°{b.house ? ` · H${b.house}` : ''}{b.retro && b.key !== 'northNode' ? ' ℞' : ''}</span>
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {area === 'shane' && full && <FounderAccuracy />}

      <EditionModules id={`${area}-explore`} heading="Around the book." modules={modules} />

      {owns && <EditionSharingPanel edition={area} />}

      <section id={`${area}-contents`} aria-labelledby={`${area}-contents-h`} className="scroll-mt-24 space-y-8">
        <div>
          <div className="font-label text-xs tracking-[0.16em] text-primary">Contents</div>
          <h2 id={`${area}-contents-h`} className="font-display mt-1">The volumes.</h2>
          <div className="relative mt-5 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input aria-label="Search chapters and sections" placeholder="Search chapters and sections…" value={q} onChange={e => setQ(e.target.value)} className="pl-9" />
          </div>
          <div className="mt-4"><ArrangeToggle value={view} onChange={setView} /></div>
          <div className="mt-3"><TopicFilter entries={entries ?? []} value={cat} onChange={setCat} /></div>
        </div>
        {!entries && <p role="status" className="text-muted-foreground">Opening {copy.name}’s edition…</p>}
        {entries && list.length === 0 && <div className="glass-card max-w-md p-5 text-sm"><p>No chapters match “{q}”.</p><Button size="sm" variant="outline" className="mt-3" onClick={() => { setQ(''); setCat(null); }}>Clear search</Button></div>}
        <div className="space-y-5">
          {groups.map(([g, items], idx) => (
            <ChapterPart key={g} title={g} count={items.length} open={idx === 0 || !!q || !!cat}>
              {items.map(e => <ChapterCard key={e.id} to={`${copy.base}/${e.id}`} entry={e} seed={`${area}-${e.id}`} />)}
            </ChapterPart>
          ))}
        </div>
      </section>
    </div>
  );
}

function ChapterGrid({ area, entries }: { area: EditionKey; entries: MbEntry[] }) {
  const base = EDITION_COPY[area].base;
  return <div className="grid gap-3 md:grid-cols-2">{entries.map(e => <ChapterCard key={e.id} to={`${base}/${e.id}`} entry={e} seed={`${area}-${e.id}`} />)}</div>;
}
