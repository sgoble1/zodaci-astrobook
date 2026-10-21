import { useLocation, Link } from 'react-router-dom';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { ChatAboutButton } from './ChatAboutButton';
import { Button } from '@/components/ui/button';

/** Bookmarks the page currently open, or a specific item when `path`/`label` are given. */
export function BookmarkButton({ path: fixedPath, label, compact, icon }: { path?: string; label?: string; compact?: boolean; icon?: boolean } = {}) {
  const { pathname, hash } = useLocation();
  const path = fixedPath ?? pathname + hash;
  const { items, signedIn, add, remove } = useBookmarks();
  if (!signedIn && (compact || icon)) return null;
  if (!signedIn) return <Link to="/dashboard" className="text-xs text-muted-foreground underline hover:text-foreground">Sign in to bookmark pages</Link>;
  const existing = items.find(b => b.path === path);
  const title = () => label || document.querySelector('main h1')?.textContent?.trim() || document.title || path;
  if (icon) return (
    <Button type="button" variant="ghost" size="icon" aria-pressed={!!existing} aria-label={existing ? 'Remove bookmark from this page' : 'Bookmark this page'} title={existing ? 'Bookmarked — remove' : 'Bookmark this page'}
      onClick={() => existing ? remove(existing.id) : add(path, title())} className="min-h-11 min-w-11">
      {existing ? <BookmarkCheck className="h-4 w-4 text-gold" /> : <Bookmark className="h-4 w-4" />}
    </Button>
  );
  if (compact) return (<span className="inline-flex flex-wrap items-center gap-3">
    <Button type="button" variant="link" size="sm" onClick={() => existing ? remove(existing.id) : add(path, title())} title={existing ? 'Remove bookmark' : 'Bookmark this'} className="h-auto p-0 text-xs">
      {existing ? <BookmarkCheck className="h-3.5 w-3.5 text-accent" /> : <Bookmark className="h-3.5 w-3.5" />}{existing ? 'Bookmarked' : 'Bookmark'}
    </Button><ChatAboutButton compact path={fixedPath} label={label} /></span>
  );
  return (<div className="space-y-2">
    <Button type="button" variant="outline" size="sm"
      onClick={() => existing ? remove(existing.id) : add(path, title())}
      className="w-full justify-start text-xs"
    >
      {existing ? <BookmarkCheck className="h-3.5 w-3.5 text-accent" /> : <Bookmark className="h-3.5 w-3.5" />}
      {existing ? 'Bookmarked — remove' : 'Bookmark this page'}
    </Button><ChatAboutButton path={fixedPath} label={label} /></div>
  );
}
