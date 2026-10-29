import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { entries } from '@/content/privateToc';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Entry = { id: string; label?: string; title: string; part?: string; words?: number; sections?: string[] };

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#contents-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">Skip to content</a>
      <header className="border-b border-border"><div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-5 py-4"><Link to="/contents" className="font-display text-lg">Masterbook · Contents</Link><Button asChild size="sm" variant="outline"><Link to="/">Enter the site</Link></Button></div></header>
      <main id="contents-main" tabIndex={-1} className="mx-auto max-w-4xl px-5 py-10 outline-none">{children}</main>
    </div>
  );
}

export function MasterbookContents() {
  const [q, setQ] = useState('');
  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const map = new Map<string, Entry[]>();
    for (const e of entries) {
      if (needle && !`${e.title} ${e.label ?? ''} ${(e.sections ?? []).join(' ')}`.toLowerCase().includes(needle)) continue;
      const k = e.part ?? 'Other';
      map.set(k, [...(map.get(k) ?? []), e]);
    }
    return [...map.entries()];
  }, [q]);
  return (
    <Shell>
      <h1 className="text-4xl">Masterbook Contents</h1>
      <p className="mt-2 text-muted-foreground">Every chapter and section. The full text opens only for the edition's owner and the people she shares it with.</p>
      <Input className="mt-6" aria-label="Search chapters and sections" placeholder="Search chapters and sections…" value={q} onChange={e => setQ(e.target.value)} />
      <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">{groups.reduce((n, [, l]) => n + l.length, 0)} entries</p>
      {groups.map(([part, list]) => (
        <section key={part} className="mt-8" aria-labelledby={`part-${part}`}>
          <h2 id={`part-${part}`} className="text-xl text-gold">{part}</h2>
          <ul className="mt-3 divide-y divide-border/60">
            {list.map(e => <li key={e.id}><Link to={`/contents/${e.id}`} className="flex min-h-11 items-center justify-between gap-3 py-2 hover:text-primary focus-visible:text-primary"><span>{e.label && e.label !== e.title ? <span className="text-muted-foreground">{e.label} · </span> : null}{e.title}</span><span className="shrink-0 text-xs text-muted-foreground">{e.sections?.length ?? 0} sections</span></Link></li>)}
          </ul>
        </section>
      ))}
    </Shell>
  );
}

export function MasterbookContentsEntry() {
  const { id } = useParams();
  const i = entries.findIndex(e => e.id === id);
  const e = entries[i];
  if (!e) return <Shell><p>That chapter was not found. <Link className="underline" to="/contents">Back to contents</Link></p></Shell>;
  const prev = entries[i - 1]; const next = entries[i + 1];
  return (
    <Shell>
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground"><Link className="underline" to="/contents">Contents</Link> / {e.part}</nav>
      <h1 className="mt-3 text-4xl">{e.title}</h1>
      {e.words ? <p className="mt-1 text-sm text-muted-foreground">{e.words.toLocaleString()} words</p> : null}
      <Button asChild className="mt-5"><Link to={`/masterbook/${e.id}`}>Read the full text</Link></Button>
      <h2 className="mt-8 text-xl">Sections</h2>
      <ol className="mt-3 list-decimal space-y-1 pl-6">{(e.sections ?? []).map((s, k) => <li key={k}>{s}</li>)}</ol>
      <nav aria-label="Chapter navigation" className="mt-10 flex flex-wrap justify-between gap-3">
        {prev ? <Button asChild variant="outline"><Link to={`/contents/${prev.id}`}>← {prev.title}</Link></Button> : <span />}
        {next && <Button asChild variant="outline"><Link to={`/contents/${next.id}`}>{next.title} →</Link></Button>}
      </nav>
    </Shell>
  );
}
