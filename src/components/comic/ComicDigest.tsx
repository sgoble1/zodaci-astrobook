import { useMemo, type ReactNode } from 'react';
import { OpenBook } from '@/components/books/OpenBook';
import type { ComicIssue } from '@/lib/comic';
import { comicIssueLeaves, type BookLeaf } from '@/content/sampleBookLeaves';

type DigestProps = {
  layout?: 'side' | 'stacked'; label?: string; footer?: ReactNode;
} & ({ issue: ComicIssue; leaves?: never; reader?: never } | { leaves: BookLeaf[]; reader: string; issue?: never });

/** One turnable digest and one side-reader/export path for public, member and authorized edition previews. */
export function ComicDigest({ issue, leaves, reader, layout = 'stacked', label, footer }: DigestProps) {
  const pages = useMemo(() => issue ? comicIssueLeaves(issue) : leaves, [issue, leaves]);
  const name = issue?.reader ?? reader;
  if (!pages) return null;
  return <OpenBook kind="comic" leaves={pages} layout={layout} trimPt={[396, 612]}
    label={label ?? `${name} · 24-page AstroComic`} spine={{ title: 'AstroComic', name }} footer={footer} />;
}