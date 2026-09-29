import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Sparkles, Square } from 'lucide-react';
import { loadCorpus, rank, type Passage } from '@/lib/corpus';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const SUGGESTIONS = [
  'What does my anaretic Sagittarius Ascendant mean?',
  'What happens in my Saturn return and the years after?',
  'How should I arrange my home according to Feng Shui?',
  'What are my Gene Keys and what do they ask of me?',
  'What does the 2026 Solar Return emphasize?',
];

export default function Ask() {
  const [corpus, setCorpus] = useState<Passage[] | null>(null);
  const [q, setQ] = useState('');
  const [asked, setAsked] = useState('');
  const [hits, setHits] = useState<Passage[]>([]);
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);
  const [params, setParams] = useSearchParams();
  const doc = params.get('doc') ?? 'all';
  const docs = corpus ? [...new Map(corpus.map(p => [p.doc, p.source])).entries()] : [];
  const pool = corpus && doc !== 'all' ? corpus.filter(p => p.doc === doc) : corpus;

  useEffect(() => { loadCorpus().then(setCorpus); }, []);

  const ask = async (question: string) => {
    if (!pool || !question.trim() || busy) return;
    setAsked(question); setAnswer(''); setErr(null);
    const top = rank(pool, question, 12); setHits(top);
    if (!top.length) { setErr('No passages in the sources matched that question. Try different words.'); return; }
    setBusy(true); abort.current = new AbortController();
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ask-sources`, {
        method: 'POST', signal: abort.current.signal,
        headers: { 'Content-Type': 'application/json', apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ question, passages: top.map((p, i) => ({ n: i + 1, source: p.source, loc: p.loc, text: p.text })) }),
      });
      if (!res.ok || !res.body) { const j = await res.json().catch(() => ({})); throw new Error(j.error ?? 'Something went wrong.'); }
      const reader = res.body.getReader(); const dec = new TextDecoder();
      while (true) { const { done, value } = await reader.read(); if (done) break; setAnswer(a => a + dec.decode(value, { stream: true })); }
    } catch (e) { if ((e as Error).name !== 'AbortError') setErr((e as Error).message); }
    setBusy(false);
  };

  const cited = new Set([...answer.matchAll(/\[(\d+)\]/g)].map(m => +m[1]));
  const renderAnswer = (t: string) => (
    <div className="mb-prose">
      <ReactMarkdown components={{ a: ({ href, children }) => <a href={href} className="text-gold align-super text-[0.7em] font-semibold px-0.5 no-underline hover:underline">{children}</a> }}>
        {t.replace(/\[(\d+)\]/g, '[[$1]](#cite-$1)')}
      </ReactMarkdown>
    </div>
  );


  return (
    <div className="space-y-8">
      <header>
        <div className="font-smallcaps text-xs text-gold">The Oracle Desk · AI-powered</div>
        <h1 className="text-4xl sm:text-5xl mt-2">Ask the Sources</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">Ask anything about April’s chart. Answers come only from the uploaded documents, with every claim linked to the passage it came from.</p>
      </header>

      <form onSubmit={e => { e.preventDefault(); ask(q); }} className="parchment deckle p-5 space-y-3">
        <Textarea rows={3} placeholder="e.g. What does Venus in Leo in the 8th house say about love?" value={q} onChange={e => setQ(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) ask(q); }} />
        <div className="flex flex-wrap items-center gap-3">
          {busy ? <Button type="button" variant="outline" onClick={() => abort.current?.abort()}><Square className="w-4 h-4 mr-2" />Stop</Button>
            : <Button type="submit" disabled={!corpus || !q.trim()}><Sparkles className="w-4 h-4 mr-2" />{corpus ? 'Ask' : 'Loading sources…'}</Button>}
          {corpus && <select aria-label="Document to ask about" value={doc} onChange={e => { const v = e.target.value; setParams(v === 'all' ? {} : { doc: v }); }} className="text-sm border border-border rounded px-2 py-1.5 bg-background max-w-xs">
            <option value="all">All documents</option>
            {docs.map(([id, name]) => <option key={id} value={id}>{name}{id.startsWith('up:') ? ' (your upload)' : ''}</option>)}
          </select>}
          {pool && <span className="text-xs text-muted-foreground">Searching {pool.length.toLocaleString()} passages{doc === 'all' ? ' across all documents' : ' in this document'}</span>}
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {SUGGESTIONS.map(s => <button type="button" key={s} onClick={() => { setQ(s); ask(s); }} className="text-xs border border-border rounded-full px-3 py-1 hover:bg-muted">{s}</button>)}
        </div>
      </form>

      {asked && (
        <section className="space-y-6">
          <div>
            <div className="font-smallcaps text-[10px] text-gold">Question</div>
            <p className="font-display text-xl">{asked}</p>
          </div>
          {err && <p className="text-destructive text-sm">{err}</p>}
          {(answer || busy) && <div className="parchment p-5 leading-relaxed">{answer ? renderAnswer(answer) : <span className="text-muted-foreground italic">Reading the passages…</span>}</div>}
          {hits.length > 0 && (
            <div>
              <h2 className="text-2xl mb-3">Cited passages</h2>
              <ol className="grid gap-3">
                {hits.map((p, i) => (
                  <li key={p.key} id={`cite-${i + 1}`} className={`parchment p-4 scroll-mt-24 ${cited.has(i + 1) ? 'ring-1 ring-accent' : 'opacity-70'}`}>
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="text-xs"><span className="text-gold font-semibold">[{i + 1}]</span> <span className="font-smallcaps">{p.source}</span> · {p.loc}</div>
                      <Link to={p.href} className="text-xs underline shrink-0">Open in source</Link>
                    </div>
                    <p className="text-sm mt-2 whitespace-pre-wrap line-clamp-6">{p.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
