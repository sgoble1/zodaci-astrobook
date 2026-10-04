import { useState } from 'react';
import { VOL2_SECTIONS, VOL2_SOURCE, type Vol2Entry } from '@/content/volume2';
import { SourceRefPanel } from '@/components/common/SourceRefPanel';
import { CopyLinkButton } from '@/components/common/CopyLinkButton';
import { useDetailDrawer } from '@/components/common/DetailDrawer';
import { SourceChapters } from '@/components/common/SourceChapters';

export default function Volume2() {
  const drawer = useDetailDrawer();
  const [q, setQ] = useState('');

  const filtered = (entries: Vol2Entry[]) =>
    q ? entries.filter(e => (e.title + e.body + e.eyebrow).toLowerCase().includes(q.toLowerCase())) : entries;

  return (
    <article className="space-y-14">
      <header>
        <div className="font-smallcaps text-[11px] text-gold">Companion Document · Volume II</div>
        <h1 className="font-display mt-2">The Supplementary Guide.</h1>
        <div className="gold-rule my-5 max-w-xs" />
        <p className="max-w-2xl text-lg text-foreground/85 leading-relaxed">
          Nineteen sections that extend the primary compendium — past-life karma, progressed chart, solar return 2026, decan analysis, dispositor chain, gene keys, chakra alignment. Click any card for the full entry with citation and copy-link.
        </p>
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="Filter within Volume II…"
          className="mt-6 w-full max-w-md px-3 py-2 rounded border border-border bg-card text-sm focus:outline-none focus:border-gold/60"
        />
      </header>

      {VOL2_SECTIONS.map(({ section, entries }) => {
        const f = filtered(entries);
        if (f.length === 0) return null;
        return (
          <section key={section}>
            <h2 className="font-display mb-4">{section}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {f.map(e => (
                <button
                  id={e.id} key={e.id}
                  onClick={() => drawer.open({
                    id: e.id, eyebrow: e.eyebrow, title: e.title, subtitle: e.section,
                    body: (<>
                      <p>{e.body}</p>
                      {e.extras && e.extras.map((x, i) => (
                        <div key={i} className="mt-3 p-3 border-l-2 border-gold/60 bg-muted/30">
                          <div className="font-smallcaps text-[10px] text-gold">{x.label}</div>
                          <p className="text-sm mt-1">{x.detail}</p>
                        </div>
                      ))}
                    </>),
                    source: e.source, route: '/volume-2',
                  })}
                  className="text-left p-5 border border-border rounded bg-card/70 hover:border-gold transition-colors"
                >
                  <div className="font-smallcaps text-[10px] text-gold">{e.eyebrow}</div>
                  <div className="font-display text-lg mt-1 leading-tight">{e.title}</div>
                  <p className="text-xs mt-2 text-foreground/70 line-clamp-3 leading-relaxed">{e.body}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground italic">{e.source.page}</span>
                    <CopyLinkButton hash={e.id} label="Share" />
                  </div>
                </button>
              ))}
            </div>
          </section>
        );
      })}

      <SourceRefPanel source={VOL2_SOURCE} />
      <SourceChapters ids={Array.from({ length: 19 }, (_, index) => `v2-${String(index + 1).padStart(2, '0')}`)} title="Volume II — complete extracted text" />
    </article>
  );
}
