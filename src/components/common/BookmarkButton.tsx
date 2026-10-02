import { useLocation, Link } from 'react-router-dom';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useBookmarks } from '@/hooks/useBookmarks';

/** Bookmarks the page currently open. */
export function BookmarkButton() {
  const { pathname, hash } = useLocation();
  const path = pathname + hash;
  const { items, signedIn, add, remove } = useBookmarks();
  if (!signedIn) return <Link to="/dashboard" className="text-xs text-muted-foreground underline hover:text-foreground">Sign in to bookmark pages</Link>;
  const existing = items.find(b => b.path === path);
  const title = () => document.querySelector('main h1')?.textContent?.trim() || document.title || path;
  return (
    <button
      onClick={() => existing ? remove(existing.id) : add(path, title())}
      className="flex items-center gap-2 text-xs px-3 py-1.5 rounded border border-border hover:bg-muted/60 w-full"
    >
      {existing ? <BookmarkCheck className="h-3.5 w-3.5 text-accent" /> : <Bookmark className="h-3.5 w-3.5" />}
      {existing ? 'Bookmarked — remove' : 'Bookmark this page'}
    </button>
  );
}
