import { Link } from 'react-router-dom';
import { BookOpenText, FolderSearch, Landmark, Wrench } from 'lucide-react';
import { relatedFor, type RelatedLink } from '@/content/relatedContent';

const ICON: Record<RelatedLink['kind'], typeof BookOpenText> = { reading: BookOpenText, case: FolderSearch, gallery: Landmark, tool: Wrench };

/** "Related" links for a reading: sibling readings plus the matching case file, gallery and tool. Titles only. */
export function RelatedPanel({ slug }: { slug: string }) {
  const { readings, places } = relatedFor(slug);
  if (!readings.length && !places.length) return null;
  const item = (l: RelatedLink) => { const I = ICON[l.kind]; return (
    <li key={l.to}><Link to={l.to} className="flex min-h-11 items-center gap-3 rounded border border-border bg-card px-3 py-2 text-sm transition-colors duration-500 hover:border-primary/60 hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"><I className="h-4 w-4 shrink-0 text-primary" aria-hidden />{l.label}</Link></li>
  ); };
  return (
    <aside aria-labelledby="related-h" className="space-y-4 print:hidden">
      <h2 id="related-h" className="font-display !text-2xl">Related</h2>
      <div className="grid gap-5 md:grid-cols-2">
        {readings.length > 0 && <div><h3 className="font-label !text-xs tracking-[0.16em] text-muted-foreground">Readings on the same theme</h3><ul className="mt-2 space-y-2">{readings.map(item)}</ul></div>}
        {places.length > 0 && <div><h3 className="font-label !text-xs tracking-[0.16em] text-muted-foreground">Look closer</h3><ul className="mt-2 space-y-2">{places.map(item)}</ul></div>}
      </div>
    </aside>
  );
}
