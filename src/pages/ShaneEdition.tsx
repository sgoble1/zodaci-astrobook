import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { markdownSections, NavigatedProse } from '@/components/readings/NavigatedProse';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { loadProtectedJson, loadProtectedText, ContentLockedError, ACCESS_CHANGED_EVENT } from '@/lib/protectedContent';
import { CATEGORIES, catsFor, type MbEntry } from './Masterbook';
import { NoEditionAccess, PrivateEditionGate } from '@/components/common/PrivateEditionGate';
import { FounderAccuracy } from '@/components/readings/FounderAccuracy';
import { useSession } from '@/hooks/useLibrary';
import { usePageMeta } from '@/hooks/usePageMeta';
import { onAccountChange } from '@/lib/authEvents';
import { useOwnsEdition } from '@/lib/editionSharing';
import { EditionSharingPanel, ShareChapterButton, SharedByNote } from '@/components/sharing/EditionSharing';
import { officialChartInput, useOfficialEditions } from '@/lib/officialEditions';
import { computeChart, fmtLon, type ChartResult } from '@/lib/astro';
import { chartTitle, dominantElement } from '@/lib/chartTitle';
import { balance } from '@/lib/resultsEngine';
import { ChartWheel } from '@/components/chart/ChartWheel';
import { PlanetOrb } from '@/components/chart/PlanetOrb';
import { ThemeArt, artFor } from '@/components/common/ThemeArt';
import { BoxArt } from '@/components/common/BoxArt';

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
    name: 'Zac', base: '/zac', title: 'Zac’s Astrological Library', eyebrow: 'Zodaci · Zac’s Library',
    tagline: 'Six volumes drawn from one noon sky — July 10, 1987.',
    blurb: 'six volumes: the natal chart, Vedic and Chinese systems, family and career, world traditions, the 360° life map and the road ahead.',
    source: 'Zachary — Volumes I–VI, a gift from Shane, transcribed in full.',
    note: 'Original text from Zac’s six volumes, preserved unchanged. Placements are checked against his calculated chart from the confirmed birth time in Volume I. Medical, family-history and past-life claims are not established by astrology.',
    modules: [
      { to: '/zac/workbook', title: 'Zac’s Workbook', desc: 'Prompts and exercises tuned to his chart, saved privately as he writes.', full: true },
      { to: '/official-astrobook', title: 'The Official AstroBook', desc: 'Print editions, covers and the comic built from this chart.', full: true },
      { to: '/my-chart', title: 'The calculated chart', desc: 'Every placement recalculated from the saved birth details.', owner: true },
      { to: '/counselors', title: 'Chart-informed counselors', desc: 'Private sessions that read from this chart, never from anyone else’s.', owner: true },
      { to: '/timeline', title: 'Timing & transits', desc: 'Current transits, profections and retrogrades for this chart.', owner: true },
    ],
  },
};

export default function ShaneEdition() { return <PrivateEditionGate><EditionInner area="shane" /></PrivateEditionGate>; }
export function ZacEdition() { return <PrivateEditionGate><EditionInner area="zac" /></PrivateEditionGate>; }

/** Whole-edition access for this account (owner or shared the whole book); chapter-only readers get false. */
function useFullAccess(area: EditionKey) {
  const [full, setFull] = useState<boolean | undefined>(undefined);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let on = true;
    void supabase.rpc('can_open_edition', { _edition: area }).then(({ data, error }) => { if (on) setFull(!error && data === true); });
    return () => { on = false; };
  }, [area, attempt]);
  useEffect(() => {
    const reload = () => setAttempt(a => a + 1);
    window.addEventListener(ACCESS_CHANGED_EVENT, reload);
    return () => window.removeEventListener(ACCESS_CHANGED_EVENT, reload);
  }, []);
  return full;
}

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
  const full = useFullAccess(area);
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
  return (
    <article className="min-w-0">
      <Link to={copy.base} className="font-smallcaps text-xs text-muted-foreground hover:text-foreground">← {full ? copy.title : `Shared from ${copy.name}’s Masterbook`}</Link>
      {e && <><div className="mt-4 font-smallcaps text-xs text-gold">{e.part} · {e.label}</div><h1 className="mt-2 text-3xl sm:text-4xl">{e.title}</h1></>}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {owns && e && <ShareChapterButton edition={area} chapter={{ id: e.id, title: e.title }} />}
        {!owns && e && <SharedByNote ownerName={copy.name} scope={full ? 'edition' : 'chapter'} />}
      </div>
      <div className="gold-rule my-6" />
      <p role="note" className="mb-6 border-l-2 border-accent pl-4 text-sm text-muted-foreground">{copy.note}</p>
      {text === null ? <p role="status" className="text-muted-foreground">Opening the chapter…</p>
        : text === 'denied' ? <NoEditionAccess owner={copy.name} onRetry={onRetry} />
        : text === '' ? <div className="space-y-3"><p role="alert">This chapter couldn’t be opened. Check your connection and try again.</p><Button variant="outline" onClick={onRetry}>Try again</Button></div>
        : <NavigatedProse content={text} path={`${copy.base}/${id}`} title={e?.title ?? `${copy.name}’s chapter`} headingLevel={headingLevel} />}
      <p className="parchment mt-10 p-4 text-xs text-muted-foreground"><span className="font-smallcaps text-gold">Source</span> · {copy.source}</p>
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
  const list = useMemo(() => (entries ?? []).filter(e => (!cat || catsFor(e).includes(cat)) && (e.title + ' ' + e.sections.join(' ')).toLowerCase().includes(q.toLowerCase())), [entries, q, cat]);
  const total = (entries ?? []).reduce((a, e) => a + e.words, 0);
  const parts = [...new Set(list.map(e => e.part))];
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
        <div className="font-smallcaps text-[11px] text-gold">{copy.eyebrow}</div>
        <h1 className="mt-2 text-4xl sm:text-5xl">Shared from {copy.name}’s Masterbook</h1>
        <div className="mt-3"><SharedByNote ownerName={copy.name} scope="chapter" /></div>
        <p className="mt-3 max-w-2xl text-muted-foreground">{copy.name} shared {entries ? (entries.length === 1 ? 'one chapter' : `${entries.length} chapters`) : 'chapters'} with you. The rest of the book stays private.</p>
      </header>
      {!entries ? <p role="status" className="text-muted-foreground">Opening what {copy.name} shared…</p> : <ChapterGrid area={area} entries={entries} />}
    </div>
  );

  return (
    <div className="space-y-14">
      <section className="gentle-fade grid items-center gap-10 lg:grid-cols-[1.1fr,0.9fr]">
        <div>
          <div className="mb-4 font-smallcaps text-[11px] text-gold">{copy.eyebrow}</div>
          <h1 className="font-display leading-[0.95]">{copy.name}.<br /><span className="italic text-muted-foreground">{copy.tagline}</span></h1>
          <div className="gold-rule my-6 max-w-md" />
          {!owns && <div className="mb-4"><SharedByNote ownerName={copy.name} scope="edition" /></div>}
          <p className="max-w-xl text-lg leading-relaxed text-foreground/85">The complete book{entries ? ` — ${entries.length} chapters, about ${Math.round(total / 1000)}k words —` : ''} {copy.blurb}</p>
          {named && <p className="mt-6 font-display text-2xl text-gold">{named.title}</p>}
          {named && <p className="mt-1 max-w-xl text-sm text-muted-foreground" title={named.why}>{named.subtitle}</p>}
          {birth && (
            <dl className="mt-8 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
              {[['Born', birth.date], ['Time', birth.time ?? 'Unknown'], ['Place', birth.placeLabel], ['Rising', rising ? `${rising.sign} ${rising.deg}°` : '—']].map(([k, v]) => (
                <div key={k}><dt className="font-smallcaps text-[10px] text-muted-foreground">{k}</dt><dd className="mt-1 text-foreground">{v}</dd></div>
              ))}
            </dl>
          )}
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
          <div className="font-smallcaps text-[11px] text-gold">The planets</div>
          <h2 id={`${area}-planets`} className="font-display mt-1">Every placement, and where the book discusses it.</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Tap a planet to show the chapters that mention it. Placements are calculated from {copy.name}’s saved birth details.</p>
          <ul className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {ORB_KEYS.map(k => chart.bodies.find(b => b.key === k)).filter(Boolean).map(b => (
              <li key={b!.key}>
                <button type="button" onClick={() => { setQ(b!.name); setCat(null); document.getElementById(`${area}-contents`)?.scrollIntoView({ behavior: 'smooth' }); }} aria-label={`Show chapters about ${b!.name} in ${b!.sign}`} className="flex w-full flex-col items-center gap-2 rounded-xl border border-border bg-card/60 p-3 text-center transition-colors hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <PlanetOrb planet={b!.key} size={48} />
                  <span className="text-sm">{b!.name}</span>
                  <span className="text-xs text-muted-foreground">{b!.sign} {b!.deg}°{b!.house ? ` · H${b!.house}` : ''}{b!.retro && b!.key !== 'northNode' ? ' ℞' : ''}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {area === 'shane' && full && <FounderAccuracy />}

      {modules.length > 0 && (
        <section className="gentle-fade" aria-labelledby={`${area}-explore`}>
          <div className="mb-2 font-smallcaps text-[11px] text-gold">Explore</div>
          <h2 id={`${area}-explore`} className="font-display mb-6">Around the book.</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map(m => (
              <Link key={m.to} to={m.to} className="group flex gap-4 rounded border border-border bg-card/60 p-5 transition-all hover:border-gold hover:shadow-[var(--shadow-gold)]">
                <ThemeArt label={m.title} className="h-14 w-14" />
                <span className="min-w-0"><span className="block font-display text-xl leading-tight">{m.title}</span><span className="gold-rule my-2 block w-10" /><span className="block text-sm leading-relaxed text-muted-foreground">{m.desc}</span></span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {owns && <EditionSharingPanel edition={area} />}

      <section id={`${area}-contents`} aria-labelledby={`${area}-contents-h`} className="scroll-mt-24 space-y-8">
        <div>
          <div className="font-smallcaps text-[11px] text-gold">Contents</div>
          <h2 id={`${area}-contents-h`} className="font-display mt-1">The volumes.</h2>
          <div className="relative mt-5 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input aria-label="Search chapters and sections" placeholder="Search chapters and sections…" value={q} onChange={e => setQ(e.target.value)} className="pl-9" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Button size="sm" variant={!cat ? 'secondary' : 'outline'} onClick={() => setCat(null)}>All</Button>
            {CATEGORIES.map(([c]) => { const n = (entries ?? []).filter(e => catsFor(e).includes(c)).length; return n ? <Button key={c} size="sm" variant={cat === c ? 'secondary' : 'outline'} onClick={() => setCat(cat === c ? null : c)}>{c} <span className="ml-1 text-muted-foreground">{n}</span></Button> : null; })}
          </div>
        </div>
        {!entries && <p role="status" className="text-muted-foreground">Opening {copy.name}’s edition…</p>}
        {entries && list.length === 0 && <div className="glass-card max-w-md p-5 text-sm"><p>No chapters match “{q}”.</p><Button size="sm" variant="outline" className="mt-3" onClick={() => { setQ(''); setCat(null); }}>Clear search</Button></div>}
        {parts.map(p => (
          <section key={p} aria-label={p} className="vellum deckle p-5 sm:p-7">
            <div className="mb-5 flex items-center gap-4">
              <ThemeArt label={p} kind={artFor(p)} className="h-14 w-14" />
              <div><h3 className="font-display text-2xl">{p}</h3><p className="text-xs text-muted-foreground">{list.filter(e => e.part === p).length} chapters</p></div>
            </div>
            <ChapterGrid area={area} entries={list.filter(e => e.part === p)} />
          </section>
        ))}
      </section>
    </div>
  );
}

function ChapterGrid({ area, entries }: { area: EditionKey; entries: MbEntry[] }) {
  const base = EDITION_COPY[area].base;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {entries.map(e => (
        <Link key={e.id} to={`${base}/${e.id}`} className="parchment block overflow-hidden transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <BoxArt seed={`${area}-${e.id}`} label={e.title} className="h-16 w-full" />
          <div className="p-4">
            <div className="text-xs text-muted-foreground">{e.label} · {e.words.toLocaleString()} words</div>
            <div className="mt-1 font-medium">{e.title}</div>
            {e.sections.length > 0 && <div className="mt-2 line-clamp-2 text-xs text-muted-foreground">{e.sections.slice(0, 4).join(' · ')}</div>}
          </div>
        </Link>
      ))}
    </div>
  );
}
