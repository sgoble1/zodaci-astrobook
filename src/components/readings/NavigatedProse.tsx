import { useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ReadingNavigator } from './ReadingNavigator';

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
export function NavigatedProse({ content, path, title, headingLevel = 2, idPrefix = '' }: { content: string; path: string; title: string; headingLevel?: 2 | 3; idPrefix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const entries = useMemo(() => headingEntries(content, headingLevel, idPrefix), [content, headingLevel, idPrefix]);
  const sections = useMemo(() => entries.map(({ id, title }) => ({ id, title })), [entries]);
  const anchor = (line?: number) => entries.find(entry => entry.line === line)?.id;
  const prose = <div ref={ref} className="reading-prose min-w-0"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{
    h2: ({ children, node }) => <h2 id={headingLevel === 2 ? anchor(node?.position?.start.line) : undefined} className="scroll-mt-24">{children}</h2>,
    h3: ({ children, node }) => <h3 id={headingLevel === 3 ? anchor(node?.position?.start.line) : undefined} className="scroll-mt-24">{children}</h3>,
  }}>{content}</ReactMarkdown></div>;
  if (sections.length < 3) return prose;
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_15rem]">
      <div className="min-w-0"><ReadingNavigator variant="bar" sections={sections} contentRef={ref} path={path} readingTitle={title} />{prose}</div>
      <ReadingNavigator variant="side" sections={sections} contentRef={ref} path={path} readingTitle={title} />
    </div>
  );
}
