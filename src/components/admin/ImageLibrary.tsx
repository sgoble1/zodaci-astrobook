import { useMemo, useState } from 'react';
import { Download, Eye, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

/** Every image bundled with the site (URLs only, no bytes) plus CDN-hosted pointers. */
const LOCAL = import.meta.glob('/src/assets/**/*.{jpg,jpeg,png,webp,svg}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const POINTERS = import.meta.glob('/src/assets/**/*.asset.json', { eager: true, import: 'default' }) as Record<string, { url?: string; content_type?: string }>;

/** Folder → area name and where those images appear. */
const AREAS: Record<string, [string, string]> = {
  home: ['Homepage', 'Home slideshow, mosaic tiles and the gift-shop banner'],
  pages: ['About & Investors', 'About hero and story, Investors page, mosaic tiles'],
  products: ['AstroBooks & AstroComic', 'Sample covers, 3D book, product pages and the press slide'],
  shop: ['Shop cut-outs', 'Gift-shop department window and the Cosmic Archive shelf'],
  spots: ['Box illustrations', 'Feature boxes, number badges and medallions across the site'],
  places: ['Observatory places', 'Member page banners for each place'],
  staff: ['Staff portraits', 'Specialist hosts on member pages and the TV'],
  channels: ['TV channels', 'Broadcast Studio channel art'],
  explore: ['Explore', 'Explore hub and topic cards'],
  learn: ['Learn', 'Learn articles and guides'],
  'reading-room': ['Reading Room', 'Illustrated articles'],
  forecast: ['Forecast', 'Forecast Center illustrations'],
  plates: ['Book plates', 'AstroBook sample plates and showcase pages'],
  compendium: ['Compendium', 'Compendium and reference pages'],
  empty: ['Empty states', 'Pages with nothing saved yet'],
  mystic: ['Earlier art', 'Older art direction samples kept for reference'],
  '': ['Site-wide', 'Logos, heroes and older shared artwork'],
};

type Img = { path: string; name: string; folder: string; url: string; cdn: boolean };

function collect(): Img[] {
  const out: Img[] = [];
  const add = (path: string, url: string, cdn: boolean) => {
    const rel = path.replace('/src/assets/', '');
    const parts = rel.split('/');
    const folder = parts.length > 1 ? parts[0] : '';
    if (folder === 'fonts' || folder === 'videos') return;
    out.push({ path: rel, name: parts[parts.length - 1].replace(/\.asset\.json$/, ''), folder, url, cdn });
  };
  for (const [p, url] of Object.entries(LOCAL)) add(p, url, false);
  for (const [p, ptr] of Object.entries(POINTERS)) if (ptr?.url && (ptr.content_type ?? '').startsWith('image/')) add(p, ptr.url, true);
  return out.sort((a, b) => a.folder.localeCompare(b.folder) || a.name.localeCompare(b.name));
}

/** Admin → Image library: every site image by area, with file name, where it is used, and View / Download. */
export function ImageLibrary() {
  const all = useMemo(collect, []);
  const [area, setArea] = useState<string>('home');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Img | null>(null);
  const counts = useMemo(() => all.reduce((m, i) => m.set(i.folder, (m.get(i.folder) ?? 0) + 1), new Map<string, number>()), [all]);
  const areas = Object.keys(AREAS).filter(k => counts.get(k));
  const shown = all.filter(i => (q ? `${i.path}`.toLowerCase().includes(q.toLowerCase()) : i.folder === area));
  return (
    <section aria-labelledby="img-lib-h" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h2 id="img-lib-h" className="plate-title !text-3xl">Image library</h2><p className="text-sm text-muted-foreground">{all.length} images used on the site, grouped by where they appear.</p></div>
        <label className="relative w-full max-w-xs"><span className="sr-only">Search images by file name</span><Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search file names…" className="pl-9" /></label>
      </div>
      {!q && <div role="tablist" aria-label="Image areas" className="flex flex-wrap gap-2">
        {areas.map(k => <button key={k} type="button" role="tab" aria-selected={area === k} onClick={() => setArea(k)} className={cn('rounded-[var(--cut-chip)] border px-3 py-1.5 font-label text-sm tracking-[0.1em] transition-colors duration-700', area === k ? 'border-primary bg-primary text-primary-foreground' : 'border-[hsl(var(--brass)/0.5)] hover:border-primary')}>{AREAS[k][0]} ({counts.get(k)})</button>)}
      </div>}
      {!q && <p className="text-sm text-muted-foreground">Used in: {AREAS[area]?.[1]}</p>}
      {shown.length === 0 ? <p className="obs-paper p-6 text-center text-muted-foreground">No images match “{q}”.</p> :
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map(i => (
          <li key={i.path} className="obs-paper flex flex-col overflow-hidden p-2">
            <button type="button" onClick={() => setOpen(i)} className="block aspect-[4/3] overflow-hidden rounded-[var(--cut-card)] bg-[hsl(var(--comic-navy)/0.08)]" aria-label={`View ${i.name}`}>
              <img src={i.url} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" />
            </button>
            <div className="flex flex-1 flex-col gap-1 p-2">
              <p className="break-all text-sm font-semibold">{i.name}</p>
              <p className="text-xs text-muted-foreground">{AREAS[i.folder]?.[0] ?? i.folder}{i.cdn ? ' · CDN' : ''} · {i.path}</p>
              <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
                <Button size="sm" variant="outline" className="w-full gap-1 px-1.5 text-xs" onClick={() => setOpen(i)}><Eye aria-hidden className="h-4 w-4" />View</Button>
                <Button size="sm" variant="outline" className="w-full gap-1 px-1.5 text-xs" asChild><a href={i.url} download={i.name} aria-label={`Download ${i.name}`}><Download aria-hidden className="h-4 w-4" />Download</a></Button>
              </div>
            </div>
          </li>
        ))}
      </ul>}
      <Dialog open={!!open} onOpenChange={v => !v && setOpen(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle className="break-all">{open?.name}</DialogTitle><DialogDescription>{open && `${AREAS[open.folder]?.[0] ?? open.folder} · used in: ${AREAS[open.folder]?.[1] ?? 'site pages'}`}</DialogDescription></DialogHeader>
          {open && <img src={open.url} alt="" className="max-h-[70vh] w-full object-contain" />}
        </DialogContent>
      </Dialog>
    </section>
  );
}
