import { LoadFailed } from '@/components/common/LoadFailed';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { useLibrary } from '@/hooks/useLibrary';
import { loadProtectedJson } from '@/lib/protectedContent';

export type MbEntry = { id: string; label: string; title: string; part: string; words: number; sections: string[]; excerpt: string; doc?: string; page?: number };

let cache: Promise<MbEntry[]> | null = null;
export const loadIndex = () => (cache ??= loadProtectedJson<MbEntry[]>('masterbook', 'index.json').catch(e => { cache = null; throw e; }));

export const CATEGORIES: [string, RegExp][] = [
  ['Planets & Points', /\b(sun|moon|mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto|node|chiron|lilith|vertex|ascendant|rising|midheaven|fortune|stellium)\b/i],
  ['Houses', /\bhouse/i],
  ['Aspects & Techniques', /aspect|harmonic|midpoint|antiscia|dispositor|sect|decan|arabic|sabian|fixed star|asteroid/i],
  ['Timing & Forecasts', /transit|progress|solar (return|arc)|profection|eclipse|retrograde|timeline|year|forecast|20\d\d|return/i],
  ['Love & Relationships', /love|relationship|compatib|partner|marriage/i],
  ['Career & Purpose', /career|vocation|purpose|mission|professional|strateg/i],
  ['Health & Body', /health|body|wellness|healing|chakra|color|sound/i],
  ['Soul & Spirit', /past li|karmic|soul|spirit|metaphysic|meditat|dream|shadow|gene key|human design/i],
  ['Other Systems', /numerolog|chinese|tarot|feng shui|life path/i],
  ['Practices & Affirmations', /journal|ritual|affirmation|prompt|practice/i],
  ['Letters & Synthesis', /letter|synthesis|final|closing|dedication|foreword|introduction|whole point|reflection/i],
  ['Reference & Art', /appendix|glossary|reference|table|illustration|style guide|resources/i],
];
export const catsFor = (e: { title: string; label: string }) => CATEGORIES.filter(([, r]) => r.test(e.title + ' ' + e.label)).map(([c]) => c);

export default function Masterbook() {
  const [entries, setEntries] = useState<MbEntry[]>([]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string | null>(null);
  const [view, setView] = useState<'parts' | 'topics'>('parts');
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => { setFailed(false); loadIndex().then(setEntries).catch(() => setFailed(true)); }, [attempt]);
  const parts = useMemo(() => {
    const m = new Map<string, MbEntry[]>();
    entries.filter(e => (!cat || catsFor(e).includes(cat)) && (e.title + e.label + e.sections.join(' ') + e.excerpt).toLowerCase().includes(q.toLowerCase()))
      .forEach(e => { const keys = view === 'parts' ? [e.part] : (catsFor(e).length ? catsFor(e) : ['Other']); keys.forEach(k => m.set(k, [...(m.get(k) ?? []), e])); });
    return view === 'parts' ? [...m.entries()] : [...m.entries()].sort((a, b) => { const o = (k: string) => { const i = CATEGORIES.findIndex(c => c[0] === k); return i < 0 ? 99 : i; }; return o(a[0]) - o(b[0]); });
  }, [entries, q, cat, view]);
  const uploads = useLibrary('masterbook');
  const total = entries.reduce((a, e) => a + e.words, 0);

  return (
    <div className="space-y-10">
      <header>
        <div className="font-smallcaps text-xs text-gold">The Masterbook · complete text</div>
        <h1 className="text-4xl sm:text-5xl mt-2">April’s Astrological Masterbook</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">Every chapter, appendix, extended analysis and illustration plate from the Masterbook, reproduced in full{entries.length ? ` — ${entries.length} sections, about ${Math.round(total / 1000)}k words` : ''}. Pick any entry to read it.</p>
        <div className="flex flex-wrap gap-4 text-sm mt-3"><Link to="/masterbook/index" className="underline">Document index — every source & section</Link><Link to="/masterbook/upload" className="underline">Upload your own PDFs & spreadsheets</Link><Link to="/reading" className="underline">The complete reading</Link><Link to="/chart-calculator" className="underline">Chart calculator</Link><Link to="/feng-shui/bagua" className="underline">Feng Shui · Bagua & home</Link><Link to="/feng-shui/flying-stars" className="underline">Feng Shui · Flying Stars</Link></div>
        <Input placeholder="Search chapter titles and section headings…" value={q} onChange={e => setQ(e.target.value)} className="max-w-md mt-4" />
        <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
          <span className="font-smallcaps text-[10px] text-gold mr-1">Arrange by</span>
          {(['parts', 'topics'] as const).map(v => <button key={v} onClick={() => setView(v)} className={`px-3 py-1 rounded-full border ${view === v ? 'border-accent bg-accent/15' : 'border-border hover:bg-muted'}`}>{v === 'parts' ? 'Book order' : 'Topic'}</button>)}
        </div>
        <div className="flex flex-wrap gap-2 mt-3 text-xs">
          <button onClick={() => setCat(null)} className={`px-3 py-1 rounded-full border ${!cat ? 'border-accent bg-accent/15' : 'border-border hover:bg-muted'}`}>All</button>
          {CATEGORIES.map(([c]) => <button key={c} onClick={() => setCat(cat === c ? null : c)} className={`px-3 py-1 rounded-full border ${cat === c ? 'border-accent bg-accent/15' : 'border-border hover:bg-muted'}`}>{c} <span className="text-muted-foreground">{entries.filter(e => catsFor(e).includes(c)).length}</span></button>)}
        </div>
      </header>
      {failed && <LoadFailed what="The Masterbook contents" onRetry={() => setAttempt(a => a + 1)} />}
      {!failed && entries.length > 0 && parts.length === 0 && <p className="text-sm text-muted-foreground">No sections match. Clear the search or choose another topic.</p>}
      {parts.map(([part, list], idx) => (
        <details key={part} open={idx === 0 || !!q || !!cat} className="group">
          <summary className="cursor-pointer list-none rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><h2 className="text-2xl mb-1 inline-flex items-baseline gap-2"><span aria-hidden="true" className="text-gold text-base transition-transform group-open:rotate-90">›</span>{part} <span className="text-sm text-muted-foreground font-sans">· {list.length}</span></h2></summary>
          <div className="gold-rule mb-4" />
          <div className="grid sm:grid-cols-2 gap-3">
            {list.map(e => (
              <Link key={e.id} to={`/masterbook/${e.id}`} className="parchment p-4 hover:ring-1 hover:ring-accent transition block">
                <div className="font-smallcaps text-[10px] text-gold">{e.label} · {Math.max(1, Math.round(e.words / 230))} min read</div>
                <div className="font-display text-lg leading-snug mt-1">{e.title}</div>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{e.excerpt}</p>
                <div className="flex flex-wrap gap-1 mt-2">{catsFor(e).slice(0, 3).map(c => <span key={c} className="text-[10px] border border-border rounded-full px-2 py-0.5 text-muted-foreground">{c}</span>)}{e.sections.length > 0 && <span className="text-[10px] text-muted-foreground px-1 py-0.5">{e.sections.length} sections</span>}</div>
              </Link>
            ))}
          </div>
        </details>
      ))}
      {uploads.items.length > 0 && !cat && (
        <section>
          <h2 className="text-2xl mb-1">Your Uploaded Documents <span className="text-sm text-muted-foreground font-sans">· {uploads.items.length}</span></h2>
          <div className="gold-rule mb-4" />
          <div className="grid sm:grid-cols-2 gap-3">
            {uploads.items.filter(u => (u.title + (u.category ?? '')).toLowerCase().includes(q.toLowerCase())).map(u => {
              const secs = (u.sections as { title: string }[] | null) ?? [];
              return (
                <div key={u.id} className="parchment p-4">
                  <div className="font-smallcaps text-[10px] text-gold">{u.category} · {secs.length} sections</div>
                  <Link to={`/masterbook/u/${u.id}`} className="font-display text-lg leading-snug mt-1 block hover:underline">{u.title}</Link>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs">{secs.slice(0, 6).map((s, i) => <Link key={i} to={`/masterbook/u/${u.id}#s${i}`} className="text-muted-foreground hover:text-foreground underline">{s.title.slice(0, 40)}</Link>)}{secs.length > 6 && <span className="text-muted-foreground">+{secs.length - 6} more</span>}</div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
