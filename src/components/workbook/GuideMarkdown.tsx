import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';

export type CitedPassage = { n: number; source: string; loc: string; text: string; href: string };

/** Markdown with in-app links and [n] citations that jump to a passage list. */
export function GuideMarkdown({ text, idPrefix = 'cite' }: { text: string; idPrefix?: string }) {
  return (
    <div className="mb-prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
        a: ({ href = '', children }) => {
          if (href.startsWith('#')) return <a href={href} className="text-gold align-super text-[0.7em] font-semibold px-0.5 no-underline hover:underline" aria-label={`Source ${String(children).replace(/\D/g, '')}`}>{children}</a>;
          if (href.startsWith('/')) return <Link to={href} className="text-primary underline underline-offset-2">{children}</Link>;
          return <a href={href} target="_blank" rel="noreferrer" className="underline">{children}<span className="sr-only"> (opens in a new tab)</span></a>;
        },
      }}>{text.replace(/\[(\d+)\](?!\()/g, `[[$1]](#${idPrefix}-$1)`)}</ReactMarkdown>
    </div>
  );
}

export function PassageList({ passages, text, idPrefix = 'cite', title = 'Source passages' }: { passages: CitedPassage[]; text: string; idPrefix?: string; title?: string }) {
  if (!passages.length) return null;
  const cited = new Set([...text.matchAll(/\[(\d+)\]/g)].map(m => +m[1]));
  const shown = passages.filter(p => cited.has(p.n));
  if (!shown.length) return null;
  return (
    <section aria-label={title} className="mt-6">
      <h2 className="text-xl mb-3">{title}</h2>
      <ol className="grid gap-3">
        {shown.map(p => (
          <li key={p.n} id={`${idPrefix}-${p.n}`} tabIndex={-1} className="parchment p-4 scroll-mt-24 outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
              <span><span className="text-gold font-semibold">[{p.n}]</span> <span className="font-smallcaps">{p.source}</span> · {p.loc}</span>
              {p.href && <Link to={p.href} className="underline shrink-0">Open in source</Link>}
            </div>
            <p className="text-sm mt-2 whitespace-pre-wrap line-clamp-6">{p.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
