import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';

export type MbEntry = { id: string; label: string; title: string; part: string; words: number; sections: string[]; excerpt: string };

let cache: Promise<MbEntry[]> | null = null;
export const loadIndex = () => (cache ??= fetch('/masterbook/index.json').then(r => r.json()));

export default function Masterbook() {
  const [entries, setEntries] = useState<MbEntry[]>([]);
  const [q, setQ] = useState('');
  useEffect(() => { loadIndex().then(setEntries); }, []);
  const parts = useMemo(() => {
    const m = new Map<string, MbEntry[]>();
    entries.filter(e => (e.title + e.label + e.sections.join(' ') + e.excerpt).toLowerCase().includes(q.toLowerCase()))
      .forEach(e => { m.set(e.part, [...(m.get(e.part) ?? []), e]); });
    return [...m.entries()];
  }, [entries, q]);
  const total = entries.reduce((a, e) => a + e.words, 0);

  return (
    <div className="space-y-10">
      <header>
        <div className="font-smallcaps text-xs text-gold">The Masterbook · complete text</div>
        <h1 className="text-4xl sm:text-5xl mt-2">April’s Astrological Masterbook</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">Every chapter, appendix, extended analysis and illustration plate from the Masterbook, reproduced in full — {entries.length} sections, about {Math.round(total / 1000)}k words. Pick any entry to read it.</p>
        <Input placeholder="Search chapter titles and section headings…" value={q} onChange={e => setQ(e.target.value)} className="max-w-md mt-4" />
      </header>
      {parts.map(([part, list]) => (
        <section key={part}>
          <h2 className="text-2xl mb-1">{part}</h2>
          <div className="gold-rule mb-4" />
          <div className="grid sm:grid-cols-2 gap-3">
            {list.map(e => (
              <Link key={e.id} to={`/masterbook/${e.id}`} className="parchment p-4 hover:ring-1 hover:ring-accent transition block">
                <div className="font-smallcaps text-[10px] text-gold">{e.label} · {Math.max(1, Math.round(e.words / 230))} min read</div>
                <div className="font-display text-lg leading-snug mt-1">{e.title}</div>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{e.excerpt}</p>
                {e.sections.length > 0 && <div className="text-[11px] text-muted-foreground mt-2">{e.sections.length} sections</div>}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
