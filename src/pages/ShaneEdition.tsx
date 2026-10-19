import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { loadProtectedJson, loadProtectedText, ContentLockedError } from '@/lib/protectedContent';
import { CATEGORIES, catsFor, type MbEntry } from './Masterbook';

const APRIL_EMAIL = 'babybluepuppet@gmail.com';
const SHANE_EMAILS = ['shanegoble@gmail.com', 'shanealecompte@gmail.com'];
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

let cache: Promise<MbEntry[]> | null = null;
const loadIndex = () => (cache ??= loadProtectedJson<MbEntry[]>('shane', 'index.json').catch(e => { cache = null; throw e; }));
supabase.auth.onAuthStateChange(() => { cache = null; });

/** Shane's sharing switch: lets April read his full edition. Enforced server-side by can_read_shane_edition(). */
function ShareSwitch() {
  const [uid, setUid] = useState<string | null>(null);
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(true);
  useEffect(() => { (async () => {
    const { data } = await supabase.auth.getUser();
    const u = data.user; if (!u || !SHANE_EMAILS.includes((u.email ?? '').toLowerCase())) { setBusy(false); return; }
    setUid(u.id);
    const { data: row } = await supabase.from('chart_shares').select('enabled').eq('owner_id', u.id).eq('viewer_email', APRIL_EMAIL).maybeSingle();
    setOn(!!row?.enabled); setBusy(false);
  })(); }, []);
  if (!uid) return null;
  const toggle = async (v: boolean) => {
    setBusy(true); setOn(v);
    const { error } = await supabase.from('chart_shares').upsert({ owner_id: uid, viewer_email: APRIL_EMAIL, enabled: v, updated_at: new Date().toISOString() });
    if (error) setOn(!v);
    setBusy(false);
  };
  return (
    <label className="glass-card flex items-center justify-between gap-4 p-4 max-w-xl mt-5 cursor-pointer">
      <span><span className="block font-medium">Share my chart with April</span><span className="text-sm text-muted-foreground">{on ? 'April can read every chapter of your edition.' : 'Only you can read your edition.'}</span></span>
      <Switch checked={on} disabled={busy} onCheckedChange={toggle} aria-label="Share my chart with April" />
    </label>
  );
}

export default function ShaneEdition() {
  const { id } = useParams();
  const [entries, setEntries] = useState<MbEntry[] | null>(null);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(null);
  useEffect(() => { loadIndex().then(setEntries).catch(e => setErr(e instanceof ContentLockedError ? 'Unlock the private edition with the site password first.' : 'Shane hasn’t shared his edition with you, or it couldn’t be opened.')); }, []);
  useEffect(() => { if (!id) return; setText(null); loadProtectedText('shane', `${id}.md`).then(setText).catch(() => setText('')); window.scrollTo(0, 0); }, [id]);
  const list = useMemo(() => (entries ?? []).filter(e => (!cat || catsFor(e).includes(cat)) && (e.title + e.sections.join(' ')).toLowerCase().includes(q.toLowerCase())), [entries, q, cat]);

  if (err) return <div className="space-y-4"><h1 className="text-4xl">Shane’s Masterbook</h1><p className="text-muted-foreground">{err}</p></div>;

  if (id) {
    const i = (entries ?? []).findIndex(e => e.id === id); const e = entries?.[i]; const prev = entries?.[i - 1]; const next = entries?.[i + 1];
    const toc = (text ?? '').split('\n').filter(l => l.startsWith('### ')).map(l => l.slice(4));
    return (
      <div className="grid xl:grid-cols-[1fr_220px] gap-10">
        <article>
          <Link to="/shane" className="text-xs font-smallcaps text-muted-foreground hover:text-foreground">← Shane’s Masterbook</Link>
          {e && <><div className="font-smallcaps text-xs text-gold mt-4">{e.part} · {e.label}</div><h1 className="text-3xl sm:text-4xl mt-2">{e.title}</h1></>}
          <div className="gold-rule my-6" />
          {text === null ? <p className="text-muted-foreground">Opening the chapter…</p> : text === '' ? <p>This chapter couldn’t be opened.</p> : (
            <div className="mb-prose"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{ h3: ({ children }) => <h3 id={slug(String(children))} className="scroll-mt-24">{children}</h3> }}>{text}</ReactMarkdown></div>
          )}
          <p className="parchment p-4 mt-10 text-xs text-muted-foreground"><span className="font-smallcaps text-gold">Source</span> · Shane’s Astrological Masterbook — transcribed in full.</p>
          <nav className="flex justify-between gap-4 mt-8">
            {prev ? <Link to={`/shane/${prev.id}`} className="parchment p-3 flex items-center gap-2 text-sm max-w-[48%]"><ChevronLeft className="w-4 h-4 shrink-0" /><span className="truncate">{prev.title}</span></Link> : <span />}
            {next && <Link to={`/shane/${next.id}`} className="parchment p-3 flex items-center gap-2 text-sm max-w-[48%] text-right"><span className="truncate">{next.title}</span><ChevronRight className="w-4 h-4 shrink-0" /></Link>}
          </nav>
        </article>
        {toc.length > 1 && <aside className="hidden xl:block"><div className="sticky top-6 max-h-[85vh] overflow-y-auto text-xs space-y-1"><div className="font-smallcaps text-[10px] text-gold mb-2">On this page</div>{toc.map(t => <a key={t} href={`#${slug(t)}`} className="block text-muted-foreground hover:text-foreground py-0.5">{t}</a>)}</div></aside>}
      </div>
    );
  }

  const total = (entries ?? []).reduce((a, e) => a + e.words, 0);
  const parts = [...new Set(list.map(e => e.part))];
  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl sm:text-5xl">Shane’s Astrological Masterbook</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">The complete book — {entries?.length ?? '…'} chapters, about {Math.round(total / 1000)}k words — from natal foundations and houses to Vedic, karmic, relationship and timing volumes.</p>
        <ShareSwitch />
        <Input placeholder="Search chapters and sections…" value={q} onChange={e => setQ(e.target.value)} className="max-w-md mt-5" />
        <div className="flex flex-wrap gap-2 mt-3 text-xs">
          <button onClick={() => setCat(null)} className={`px-3 py-1 rounded-full border ${!cat ? 'border-accent bg-accent/15' : 'border-border hover:bg-muted'}`}>All</button>
          {CATEGORIES.map(([c]) => { const n = (entries ?? []).filter(e => catsFor(e).includes(c)).length; return n ? <button key={c} onClick={() => setCat(cat === c ? null : c)} className={`px-3 py-1 rounded-full border ${cat === c ? 'border-accent bg-accent/15' : 'border-border hover:bg-muted'}`}>{c} <span className="text-muted-foreground">{n}</span></button> : null; })}
        </div>
      </header>
      {!entries && <p className="text-muted-foreground">Opening Shane’s edition…</p>}
      {parts.map(p => (
        <section key={p}>
          <h2 className="text-2xl mb-4">{p}</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {list.filter(e => e.part === p).map(e => (
              <Link key={e.id} to={`/shane/${e.id}`} className="parchment p-4 hover:border-accent transition-colors block">
                <div className="text-xs text-muted-foreground">{e.label} · {e.words.toLocaleString()} words</div>
                <div className="font-medium mt-1">{e.title}</div>
                {e.sections.length > 0 && <div className="text-xs text-muted-foreground mt-2 line-clamp-2">{e.sections.slice(0, 4).join(' · ')}</div>}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
