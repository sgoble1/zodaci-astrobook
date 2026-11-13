import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ThemeArt, artFor } from '@/components/common/ThemeArt';
import { BoxArt } from '@/components/common/BoxArt';
import { CATEGORIES, catsFor, minutesToRead } from '@/lib/chapterTopics';

/** The fields every founder edition's chapter index shares. */
export type EditionChapter = { id: string; label: string; title: string; part: string; words: number; sections: string[]; excerpt?: string };

const chip = (on: boolean) => `inline-flex min-h-8 items-center gap-1 rounded-full border px-3 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${on ? 'border-accent bg-accent/15 text-foreground' : 'border-border text-muted-foreground hover:border-[hsl(var(--brass)/0.75)] hover:text-foreground'}`;

/** "All" plus every topic that has at least one chapter, with counts. Shared by April's, Shane's and Zac's editions. */
export function TopicFilter({ entries, value, onChange }: { entries: EditionChapter[]; value: string | null; onChange: (topic: string | null) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter chapters by topic">
      <button type="button" aria-pressed={!value} onClick={() => onChange(null)} className={chip(!value)}>All</button>
      {CATEGORIES.map(([c]) => {
        const n = entries.filter(e => catsFor(e).includes(c)).length;
        return n ? <button key={c} type="button" aria-pressed={value === c} onClick={() => onChange(value === c ? null : c)} className={chip(value === c)}>{c} <span className="text-muted-foreground">{n}</span></button> : null;
      })}
    </div>
  );
}

/** Book order / Topic switch used above every edition's contents. */
export function ArrangeToggle({ value, onChange }: { value: 'parts' | 'topics'; onChange: (v: 'parts' | 'topics') => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Arrange chapters">
      <span className="mr-1 font-label text-[10px] tracking-[0.14em] text-primary">Arrange by</span>
      {(['parts', 'topics'] as const).map(v => <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)} className={chip(value === v)}>{v === 'parts' ? 'Book order' : 'Topic'}</button>)}
    </div>
  );
}

/** One chapter card: printed box plate, reading time, title, a short excerpt and its topics. */
export function ChapterCard({ to, entry, seed }: { to: string; entry: EditionChapter; seed: string }) {
  const topics = catsFor(entry).slice(0, 3);
  const blurb = entry.excerpt || entry.sections.slice(0, 4).join(' · ');
  return (
    // content-visibility lets the browser skip drawing cards that are off screen (editions run to hundreds of chapters).
    <Link to={to} className="parchment group block overflow-hidden transition-colors [contain-intrinsic-size:auto_190px] [content-visibility:auto] hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <BoxArt seed={seed} label={entry.title} className="h-16 w-full" />
      <div className="p-4">
        <div className="font-label text-[10px] tracking-[0.14em] text-primary">{entry.label} · {minutesToRead(entry.words)} min read</div>
        <div className="mt-1 font-display text-lg leading-snug">{entry.title}</div>
        {blurb && <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{blurb}</p>}
        {(topics.length > 0 || entry.sections.length > 0) && (
          <div className="mt-2 flex flex-wrap gap-1">
            {topics.map(c => <span key={c} className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">{c}</span>)}
            {entry.sections.length > 0 && <span className="px-1 py-0.5 text-[10px] text-muted-foreground">{entry.sections.length} sections</span>}
          </div>
        )}
      </div>
    </Link>
  );
}

/**
 * A part (or topic) of an edition: drawn icon, title, chapter count, and the chapter cards. Opens on click.
 * Cards mount the first time a part opens, so a closed part of a long edition costs only its header.
 */
export function ChapterPart({ title, count, open, children }: { title: string; count: number; open?: boolean; children: ReactNode }) {
  const [seen, setSeen] = useState(!!open);
  useEffect(() => { if (open) setSeen(true); }, [open]);
  return (
    <details open={open} onToggle={e => { if (e.currentTarget.open) setSeen(true); }} className="group vellum deckle p-5 sm:p-7">
      <summary className="flex cursor-pointer list-none items-center gap-4 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <ThemeArt label={title} kind={artFor(title)} className="h-14 w-14 shrink-0" />
        <span className="min-w-0 flex-1">
          <span className="block font-display text-2xl leading-tight">{title}</span>
          <span className="text-xs text-muted-foreground">{count === 1 ? '1 chapter' : `${count} chapters`}</span>
        </span>
        <span aria-hidden="true" className="text-xl text-gold transition-transform group-open:rotate-90">›</span>
      </summary>
      {seen && <div className="mt-5 grid gap-3 md:grid-cols-2">{children}</div>}
    </details>
  );
}

export type EditionModule = { to: string; title: string; desc: string };

/** "Around the book" destinations, drawn the same way in every founder edition. */
export function EditionModules({ id, heading, modules }: { id: string; heading: string; modules: EditionModule[] }) {
  if (!modules.length) return null;
  return (
    <section className="gentle-fade" aria-labelledby={id}>
      <div className="mb-2 font-label text-xs tracking-[0.16em] text-primary">Explore</div>
      <h2 id={id} className="font-display mb-6">{heading}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map(m => (
          <Link key={m.to} to={m.to} className="group flex gap-4 rounded-sm border border-[hsl(var(--brass)/0.4)] bg-card/60 p-5 transition-all hover:border-[hsl(var(--brass)/0.75)] hover:shadow-[4px_4px_0_hsl(var(--accent)/0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <ThemeArt label={m.title} className="h-14 w-14 shrink-0" />
            <span className="min-w-0"><span className="block font-display text-xl leading-tight">{m.title}</span><span className="gold-rule my-2 block w-10" /><span className="block text-sm leading-relaxed text-muted-foreground">{m.desc}</span></span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** The opening words of an edition: eyebrow, name, script tagline and printed rule. */
export function EditionTitle({ eyebrow, name, tagline, as: Tag = 'h2' }: { eyebrow: string; name: string; tagline: string; as?: 'h1' | 'h2' }) {
  return (
    <>
      <div className="mb-4 font-label text-xs tracking-[0.16em] text-primary">{eyebrow}</div>
      <Tag className="font-display leading-[0.95]">{name}.<br /><span className="font-script text-primary">{tagline}</span></Tag>
      <div className="gold-rule my-6 max-w-md" />
    </>
  );
}

/** Born / Time / Place / fourth fact row used under every edition title. */
export function BirthFacts({ facts }: { facts: [string, string][] }) {
  return (
    <dl className="mt-8 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
      {facts.map(([k, v]) => <div key={k}><dt className="font-label text-[10px] tracking-[0.14em] text-muted-foreground">{k}</dt><dd className="mt-1 text-foreground">{v}</dd></div>)}
    </dl>
  );
}
