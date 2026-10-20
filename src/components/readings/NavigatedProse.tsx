import { useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ReadingNavigator } from './ReadingNavigator';

export const headingId = (s: string) => s.toLowerCase().replace(/[*_`]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const clean = (s: string) => s.replace(/[*_`]/g, '').replace(/^\d+[.)]\s*/, '').trim();
/** The level-two headings of a markdown text, in order, with stable ids. */
export const markdownSections = (md: string) => [...md.matchAll(/^##\s+(.+)$/gm)].map(m => { const title = clean(m[1]); return { id: headingId(title), title }; });

/** Markdown reading with a pinned section list, progress and section bookmarks once it has three or more sections. */
export function NavigatedProse({ content, path, title }: { content: string; path: string; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const sections = useMemo(() => markdownSections(content), [content]);
  const prose = <div ref={ref} className="reading-prose"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{ h2: ({ children }) => { const t = clean(String(Array.isArray(children) ? children.join('') : children)); return <h2 id={headingId(t)} className="scroll-mt-24">{t}</h2>; } }}>{content}</ReactMarkdown></div>;
  if (sections.length < 3) return prose;
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_15rem]">
      <div><ReadingNavigator variant="bar" sections={sections} contentRef={ref} path={path} readingTitle={title} />{prose}</div>
      <ReadingNavigator variant="side" sections={sections} contentRef={ref} path={path} readingTitle={title} />
    </div>
  );
}
