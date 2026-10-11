import { SourceChapters } from '@/components/common/SourceChapters';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { TOPICS } from '@/content/topics';
import { LIBRARY_TOPICS } from '@/content/libraryTopics';
import ReactMarkdown from 'react-markdown';
import { loadCorpus, rank, aprilOnly, SHANE_RE, type Passage } from '@/lib/corpus';
import { loadProtectedJson } from '@/lib/protectedContent';
import { Button } from '@/components/ui/button';

type Entry = { id: string; label: string; title: string };

export function TopicsIndex() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Themes & Topics</p>
      <h1 className="font-display text-4xl mt-2 mb-4">Explore by life theme</h1>
      <p className="text-muted-foreground mb-8 max-w-2xl">Each theme gathers every matching chapter and the most relevant passages from all source documents, with links back to where they came from.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {TOPICS.map(t => (
          <Link key={t.slug} to={`/topics/${t.slug}`} className="block border border-border rounded-lg p-5 bg-card hover:border-primary transition-colors">
            <h2 className="font-display text-xl mb-1">{t.label}</h2>
            <p className="text-sm text-muted-foreground">{t.intro}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Topic() {
  const { slug } = useParams();
  const topic = [...TOPICS, ...LIBRARY_TOPICS].find(t => t.slug === slug);
  const isLibraryTopic = LIBRARY_TOPICS.some(t => t.slug === slug);
  const [index, setIndex] = useState<Entry[]>([]);
  const [passages, setPassages] = useState<Passage[] | null>(null);
  const [n, setN] = useState(12);
  const [sum, setSum] = useState(''); const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null);

  useEffect(() => { loadProtectedJson<Entry[]>('masterbook', 'index.json').then(setIndex).catch(() => setIndex([])); }, []);
  useEffect(() => { setPassages(null); setN(12); setSum(''); setErr(null); loadCorpus().then(ps => setPassages(aprilOnly(ps))).catch(() => setPassages([])); }, [slug]);

  const chapters = useMemo(() => topic ? index.filter(e => !SHANE_RE.test(e.title) && !/relationship/i.test(e.title)).filter(e => topic.chapters.test(e.title) || topic.sourceIds?.includes(e.id)) : [], [index, topic]);
  const hits = useMemo(() => topic && passages ? rank(passages, topic.query, 40) : [], [passages, topic]);

  const summarize = async () => {
    if (!topic || busy || !hits.length) return;
    setBusy(true); setSum(''); setErr(null);
    const top = hits.slice(0, 14);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ask-sources`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ question: `Write a clear, well-organised overview of "${topic.label}" for April only. Use only April's verified birth-chart placements and the supplied passages. Never infer or mention named relatives, surnames, ancestry, family lineage, inherited trauma, or biographical family events. For Family & Home, discuss only chart symbolism and home-setting ideas. Use short headed sections: key placements, recurring patterns, challenges, and practical guidance.`, passages: top.map((p, i) => ({ n: i + 1, source: p.source, loc: p.loc, text: p.text })) }),
      });
      if (!res.ok || !res.body) { const j = await res.json().catch(() => ({})); throw new Error(j.error ?? 'Something went wrong.'); }
      const r = res.body.getReader(); const d = new TextDecoder();
      while (true) { const { done, value } = await r.read(); if (done) break; setSum(a => a + d.decode(value, { stream: true })); }
    } catch (e) { setErr((e as Error).message); }
    setBusy(false);
  };

  if (!topic) return <div className="p-12">Topic not found. <Link className="underline" to="/topics">All topics</Link></div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
      <header>
        <Link to={isLibraryTopic ? '/instructions#library' : '/topics'} className="text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-primary">{isLibraryTopic ? '← Library' : '← Themes & Topics'}</Link>
        <h1 className="font-display text-4xl mt-2 mb-3">{topic.label}</h1>
        <p className="text-muted-foreground">{topic.intro}</p>
      </header>

      {topic.guide && <section aria-labelledby="topic-reading" className="space-y-5">
        <h2 id="topic-reading" className="font-display text-2xl">What this could mean for April</h2>
        <p className="text-sm text-muted-foreground">Based on September 6, 1990 · 3:38 PM EDT · Geneva, New York. House placements use the source-aligned Placidus chart. The readings below are editorial interpretations of April’s chart, not source quotations, proven personality traits, or predictions.</p>
        {topic.guide.map(section => <div key={section.title} className="border-l-2 border-primary pl-4 space-y-2">
          <h3 className="font-display text-xl">{section.title}</h3>
          <p className="text-sm leading-relaxed">{section.text}</p>
          <Link to={section.to} className="text-xs underline text-muted-foreground hover:text-primary">{section.cite} →</Link>
        </div>)}
      </section>}

      {topic.reflection && <section aria-labelledby="topic-reflections" className="space-y-3">
        <h2 id="topic-reflections" className="font-display text-2xl">Questions to reflect on</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm">{topic.reflection.map(question => <li key={question}>{question}</li>)}</ul>
      </section>}

      {topic.facts && (
        <section>
          <h2 className="font-display text-2xl mb-3">Key facts from the sources</h2>
          <ul className="space-y-3">
            {topic.facts.map(f => <li key={f.text} className="border-l-2 border-primary pl-4"><p className="text-sm">{f.text}</p><Link to={f.to} className="text-xs text-muted-foreground hover:text-primary">{f.cite} →</Link></li>)}
          </ul>
        </section>
      )}

      {topic.pages && (
        <section>
          <h2 className="font-display text-2xl mb-3">Start here</h2>
          <div className="flex flex-wrap gap-2">
            {topic.pages.map(p => <Link key={p.to} to={p.to} className="px-3 py-1.5 rounded-full border border-primary text-sm hover:bg-primary hover:text-primary-foreground">{p.label}</Link>)}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-display text-2xl mb-3">Chapters on this theme ({chapters.length})</h2>
        {chapters.length === 0 ? <p className="text-sm text-muted-foreground">No chapter titles match; see the passages below.</p> : (
          <ul className="grid sm:grid-cols-2 gap-2">
            {chapters.map(c => <li key={c.id}><Link to={`/masterbook/${c.id}`} className="block border border-border rounded p-3 hover:border-primary text-sm"><span className="text-muted-foreground">{c.label}</span> · {c.title}</Link></li>)}
          </ul>
        )}
      </section>

      <section className="border border-border rounded-lg p-5 bg-card">
        <div className="flex items-center justify-between gap-3 mb-2">
          <h2 className="font-display text-2xl">Theme summary</h2>
          <Button onClick={summarize} disabled={busy || !passages} size="sm">{busy ? 'Writing…' : sum ? 'Rewrite' : 'Summarise from the sources'}</Button>
        </div>
        {!sum && !err && <p className="text-sm text-muted-foreground">A cited overview written only from the passages below. Numbers like [3] match passage 3.</p>}
        {err && <p className="text-sm text-destructive">{err}</p>}
        {sum && <div className="mb-prose text-sm"><ReactMarkdown>{sum}</ReactMarkdown></div>}
      </section>

      <section>
        <h2 className="font-display text-2xl mb-3">Ask about {topic.label.toLowerCase()}</h2>
        <div className="flex flex-wrap gap-2">
          {topic.questions.map(q => <Link key={q} to={`/ask?q=${encodeURIComponent(q)}`} className="px-3 py-1.5 rounded border border-border text-sm hover:border-primary">{q}</Link>)}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl mb-3">What the sources say</h2>
        {!passages ? <p className="text-sm text-muted-foreground">Gathering passages from every document…</p> : (
          <div className="space-y-4">
            {hits.slice(0, n).map((p, i) => (
              <article key={p.key} className="border-l-2 border-primary pl-4">
                <p className="text-xs font-semibold text-primary">[{i + 1}]</p>
                <p className="text-sm leading-relaxed">{p.text}</p>
                <Link to={p.href} className="text-xs text-muted-foreground hover:text-primary">{p.source} — {p.loc} →</Link>
              </article>
            ))}
            {n < hits.length && <Button onClick={() => setN(n + 12)} variant="link">Show more passages</Button>}
          </div>
        )}
      </section>
      <SourceChapters exclude={/Shane|Gobles?|LeComptes?|relationship|synastry|ancestor|ancestry|lineage/i} match={topic.chapters} ids={topic.sourceIds} title={`${topic.label} — the full source chapters`} />
    </div>
  );
}
