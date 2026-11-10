import { useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CheckCircle2, CornerDownRight } from 'lucide-react';
import { ReadingNavigator } from './ReadingNavigator';
import { ReadingInsights } from './ReadingInsights';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { continueTarget, isFinished } from '@/lib/readingProgress';

/** "Continue from …" and "Finished" for a reader who has been here before; nothing for first visits or signed-out readers. */
function ProgressStrip({ saved, current, here, sections }: { saved: ReturnType<typeof useReadingProgress>['saved']; current: number; here: number; sections: { id: string; title: string }[] }) {
  const target = continueTarget(saved, sections, typeof window === 'undefined' ? '' : window.location.hash);
  const done = isFinished(Math.max(saved?.progress ?? 0, current));
  if (!target && !done) return null;
  const jump = () => {
    const h = target && document.getElementById(target.id); if (!h) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    h.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', `#${target.id}`);
  };
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
      {done && <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/60 px-3 py-1 font-label text-xs tracking-[0.14em] text-primary"><CheckCircle2 aria-hidden className="h-3.5 w-3.5" />Finished</span>}
      {target && here < 5 && <button type="button" onClick={jump} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-foreground transition-colors duration-500 hover:border-primary"><CornerDownRight aria-hidden className="h-3.5 w-3.5 text-primary" />Continue from “{target.title}”</button>}
    </div>
  );
}

export const headingId = (s: string) => s.toLowerCase().replace(/[*_`]/g, '').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'section';
const clean = (s: string) => s.replace(/[*_`]/g, '').replace(/^\d+[.)]\s*/, '').trim();
function headingEntries(md: string, level: 2 | 3, prefix: string) {
  const seen = new Map<string, number>();
  let fence = '';
  return md.split('\n').flatMap((line, index) => {
    const marker = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (marker) { if (!fence) fence = marker[1]; else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = ''; return []; }
    if (fence) return [];
    const match = line.match(new RegExp(`^ {0,3}#{${level}}\\s+(.+?)\\s*$`));
    if (!match) return [];
    const title = clean(match[1].replace(/\s+#+$/, ''));
    const base = `${prefix}${headingId(title)}`;
    const count = (seen.get(base) ?? 0) + 1; seen.set(base, count);
    return [{ id: count === 1 ? base : `${base}-${count}`, title, line: index + 1 }];
  });
}
/** Stable, unique anchors for chapter headings; fenced examples are not sections. */
export const markdownSections = (md: string, level: 2 | 3 = 2, prefix = '') => headingEntries(md, level, prefix).map(({ id, title }) => ({ id, title }));

/** Markdown reading with a pinned section list, progress and section bookmarks once it has three or more sections. */
export function NavigatedProse({ content, path, title, headingLevel = 2, idPrefix = '', insights = false }: { content: string; path: string; title: string; headingLevel?: 2 | 3; idPrefix?: string; insights?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const entries = useMemo(() => headingEntries(content, headingLevel, idPrefix), [content, headingLevel, idPrefix]);
  const sections = useMemo(() => entries.map(({ id, title }) => ({ id, title })), [entries]);
  const anchor = (line?: number) => entries.find(entry => entry.line === line)?.id;
  const { saved, current, here } = useReadingProgress({ path, title, contentRef: ref, sections });
  const prose = <div ref={ref} className="reading-prose min-w-0"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{
    h2: ({ children, node }) => <h2 id={headingLevel === 2 ? anchor(node?.position?.start.line) : undefined} className="scroll-mt-24">{children}</h2>,
    h3: ({ children, node }) => <h3 id={headingLevel === 3 ? anchor(node?.position?.start.line) : undefined} className="scroll-mt-24">{children}</h3>,
  }}>{content}</ReactMarkdown></div>;
  if (sections.length < 3) return <><ProgressStrip saved={saved} current={current} here={here} sections={sections} />{prose}{insights && <ReadingInsights content={content} sections={sections.length} className="mt-10" />}</>;
  // Three columns (sections · reading · insights) only on very wide screens, widened past the page column so the
  // reading column keeps ~36rem; narrower screens keep sections beside or above the text and the insights card after it.
  return (
    <div className={`grid gap-10 lg:grid-cols-[minmax(0,1fr)_15rem] ${insights ? '2xl:-mx-20 2xl:grid-cols-[13rem_minmax(0,1fr)_14rem] 2xl:gap-8' : ''}`}>
      <div className={`min-w-0 ${insights ? '2xl:order-2' : ''}`}><ReadingNavigator variant="bar" sections={sections} contentRef={ref} path={path} readingTitle={title} /><ProgressStrip saved={saved} current={current} here={here} sections={sections} />{prose}{insights && <ReadingInsights content={content} sections={sections.length} className="mt-10 2xl:hidden" />}</div>
      <div className={`hidden lg:block ${insights ? '2xl:order-1' : ''}`}><ReadingNavigator variant="side" sections={sections} contentRef={ref} path={path} readingTitle={title} /></div>
      {insights && <div className="hidden 2xl:order-3 2xl:block"><ReadingInsights content={content} sections={sections.length} sticky /></div>}
    </div>
  );
}
