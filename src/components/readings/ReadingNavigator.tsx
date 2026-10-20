import { useEffect, useMemo, useState, type RefObject } from 'react';
import { Bookmark, BookmarkCheck, ChevronDown, List } from 'lucide-react';
import { toast } from 'sonner';
import { useBookmarks } from '@/hooks/useBookmarks';

export type NavSection = { id: string; title: string };

/** Share of the reading scrolled past, 0–100, for a content block's position relative to the window. */
export function readProgress(top: number, height: number, viewport: number): number {
  const total = height - viewport;
  if (total <= 0) return top <= 0 ? 100 : 0;
  return Math.max(0, Math.min(100, Math.round((-top / total) * 100)));
}

/** Sticky section list for long readings: highlights the section in view, shows reading progress and lets members bookmark sections. */
export function ReadingNavigator({ sections, contentRef, path, readingTitle, variant }: { sections: NavSection[]; contentRef: RefObject<HTMLElement>; path: string; readingTitle: string; variant: 'bar' | 'side' }) {
  const [active, setActive] = useState(sections[0]?.id ?? '');
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const { items, signedIn, add, remove } = useBookmarks();
  const marked = useMemo(() => new Map(items.filter(b => b.path.startsWith(`${path}#`)).map(b => [b.path.slice(path.length + 1), b.id])), [items, path]);

  useEffect(() => {
    const onScroll = () => {
      const el = contentRef.current; if (!el) return;
      const r = el.getBoundingClientRect();
      setProgress(readProgress(r.top, r.height, window.innerHeight));
      // The active section is the last heading whose top has passed the upper third of the screen.
      let current = sections[0]?.id ?? '';
      for (const s of sections) { const h = document.getElementById(s.id); if (h && h.getBoundingClientRect().top < window.innerHeight / 3) current = s.id; }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [sections, contentRef]);

  const jump = (id: string) => {
    const h = document.getElementById(id); if (!h) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    h.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
    setOpen(false);
  };
  const toggle = async (s: NavSection) => {
    if (!signedIn) { toast.error('Sign in to bookmark sections.'); return; }
    const existing = marked.get(s.id);
    try {
      if (existing) { await remove(existing); toast.success('Bookmark removed'); }
      else { await add(`${path}#${s.id}`, `${readingTitle} · ${s.title}`); toast.success('Section bookmarked'); }
    } catch { toast.error('Could not update the bookmark.'); }
  };
  const activeTitle = sections.find(s => s.id === active)?.title ?? sections[0]?.title;

  const list = (
    <ol className="space-y-0.5 text-sm">
      {sections.map(s => { const on = s.id === active; const isMarked = marked.has(s.id); return (
        <li key={s.id} className="group flex items-center gap-1">
          <a href={`#${s.id}`} onClick={e => { e.preventDefault(); jump(s.id); }} aria-current={on ? 'location' : undefined}
            className={`flex min-h-9 flex-1 items-center gap-2 rounded px-2 py-1.5 transition-colors duration-500 ${on ? 'bg-primary/15 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            <span aria-hidden className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-500 ${on ? 'bg-primary' : 'bg-border'}`} />
            <span className="leading-snug">{s.title}</span>
            {isMarked && <span className="sr-only"> (bookmarked)</span>}
          </a>
          <button type="button" onClick={() => void toggle(s)} aria-label={isMarked ? `Remove bookmark: ${s.title}` : `Bookmark section: ${s.title}`} aria-pressed={isMarked}
            className={`grid h-8 w-8 shrink-0 place-items-center rounded transition-opacity duration-300 hover:bg-muted ${isMarked ? 'text-gold' : 'text-muted-foreground opacity-60 group-hover:opacity-100 focus-visible:opacity-100'}`}>
            {isMarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>
        </li>
      ); })}
    </ol>
  );

  // Place 'bar' inside the tall content column (small screens) and 'side' in the side column (large screens), so each can stick.
  if (variant === 'bar') return (
      <div className="sticky top-0 z-20 -mx-2 mb-6 lg:hidden">
        <div className="vellum px-3 py-2">
          <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-controls="reading-nav-mobile" className="flex w-full items-center gap-2 text-left text-sm">
            <List aria-hidden className="h-4 w-4 shrink-0 text-gold" /><span className="min-w-0 flex-1 truncate">{activeTitle}</span><span className="tabular-nums text-xs text-muted-foreground">{progress}%</span><ChevronDown aria-hidden className={`h-4 w-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
          </button>
          <div className="mt-2 h-0.5 rounded-full bg-muted" aria-hidden><div className="h-0.5 rounded-full bg-primary transition-[width] duration-300" style={{ width: `${progress}%` }} /></div>
          {open && <nav id="reading-nav-mobile" aria-label="Sections in this reading" className="mt-2 max-h-[60vh] overflow-y-auto">{list}</nav>}
        </div>
      </div>
  );
  return (
      <nav aria-label="Sections in this reading" className="hidden h-full lg:block">
        <div className="vellum sticky top-24 flex gap-3 p-4">
          <div className="relative w-0.5 shrink-0 rounded-full bg-muted" role="progressbar" aria-label="Reading progress" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="absolute inset-x-0 top-0 rounded-full bg-primary transition-[height] duration-300" style={{ height: `${progress}%` }} />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="flex items-center justify-between font-smallcaps text-xs text-gold"><span>In this reading</span><span className="tabular-nums text-muted-foreground">{progress}%</span></p>
            {list}
            {marked.size > 0 && <p className="border-t border-border pt-2 text-xs text-muted-foreground">{marked.size} bookmarked · find them under Bookmarks in the menu</p>}
          </div>
        </div>
      </nav>
  );
}
