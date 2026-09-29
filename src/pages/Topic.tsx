import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { TOPICS } from '@/content/topics';
import { loadCorpus, rank, type Passage } from '@/lib/corpus';

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
  const topic = TOPICS.find(t => t.slug === slug);
  const [index, setIndex] = useState<Entry[]>([]);
  const [passages, setPassages] = useState<Passage[] | null>(null);
  const [n, setN] = useState(12);

  useEffect(() => { fetch('/masterbook/index.json').then(r => r.json()).then(setIndex).catch(() => setIndex([])); }, []);
  useEffect(() => { setPassages(null); setN(12); loadCorpus().then(setPassages).catch(() => setPassages([])); }, [slug]);

  const chapters = useMemo(() => topic ? index.filter(e => topic.chapters.test(e.title)) : [], [index, topic]);
  const hits = useMemo(() => topic && passages ? rank(passages, topic.query, 40) : [], [passages, topic]);

  if (!topic) return <div className="p-12">Topic not found. <Link className="underline" to="/topics">All topics</Link></div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
      <header>
        <Link to="/topics" className="text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-primary">← Themes & Topics</Link>
        <h1 className="font-display text-4xl mt-2 mb-3">{topic.label}</h1>
        <p className="text-muted-foreground">{topic.intro}</p>
      </header>

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
            {hits.slice(0, n).map(p => (
              <article key={p.key} className="border-l-2 border-primary pl-4">
                <p className="text-sm leading-relaxed">{p.text}</p>
                <Link to={p.href} className="text-xs text-muted-foreground hover:text-primary">{p.source} — {p.loc} →</Link>
              </article>
            ))}
            {n < hits.length && <button onClick={() => setN(n + 12)} className="text-sm underline">Show more passages</button>}
          </div>
        )}
      </section>
    </div>
  );
}
