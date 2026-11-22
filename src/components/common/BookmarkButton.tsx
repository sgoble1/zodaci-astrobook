import { useLocation, Link } from 'react-router-dom';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { ChatAboutButton } from './ChatAboutButton';
import { Button } from '@/components/ui/button';
import { usePendingAction } from '@/hooks/usePendingAction';
import { confirmAction } from './ConfirmHost';
import { toast } from 'sonner';

/** Bookmarks the page currently open, or a specific item when `path`/`label` are given. */
export function BookmarkButton({ path: fixedPath, label, compact, icon }: { path?: string; label?: string; compact?: boolean; icon?: boolean } = {}) {
  const { pathname, hash } = useLocation();
  const path = fixedPath ?? pathname + hash;
  const { items, signedIn, add, remove } = useBookmarks();
  const action = usePendingAction(path);
  if (!signedIn && (compact || icon)) return null;
  if (!signedIn) return <Link to="/dashboard" className="text-xs text-muted-foreground underline hover:text-foreground">Sign in to bookmark pages</Link>;
  const existing = items.find(b => b.path === path);
  const title = () => label || document.querySelector('main h1')?.textContent?.trim() || document.title || path;
  const toggle = () => action.run('bookmark', async current => {
    if (existing) {
      if (!await confirmAction('Remove this bookmark and its saved note?', 'Remove bookmark') || !current()) return;
      await remove(existing.id);
    } else await add(path, title());
    if (current()) toast.success(existing ? 'Bookmark removed.' : 'Bookmark saved.');
  }, 'The bookmark could not be changed. Please try again.');
  if (icon) return (
    <Button type="button" variant="ghost" size="icon" aria-pressed={!!existing} aria-label={existing ? 'Remove bookmark from this page' : 'Bookmark this page'} title={existing ? 'Bookmarked — remove' : 'Bookmark this page'}
      disabled={action.pending('bookmark')} onClick={toggle} className="min-h-11 min-w-11">
      {existing ? <BookmarkCheck className="h-4 w-4 text-gold" /> : <Bookmark className="h-4 w-4" />}
    </Button>
  );
  if (compact) return (<span className="inline-flex flex-wrap items-center gap-3">
    <Button type="button" variant="link" size="sm" disabled={action.pending('bookmark')} onClick={toggle} title={existing ? 'Remove bookmark' : 'Bookmark this'} className="min-h-11 p-0 text-xs">
      {existing ? <BookmarkCheck className="h-3.5 w-3.5 text-accent" /> : <Bookmark className="h-3.5 w-3.5" />}{existing ? 'Bookmarked' : 'Bookmark'}
    </Button><ChatAboutButton compact path={fixedPath} label={label} /></span>
  );
  return (<div className="space-y-2">
    <Button type="button" variant="outline" size="sm"
      disabled={action.pending('bookmark')} onClick={toggle}
      className="w-full justify-start text-xs"
    >
      {existing ? <BookmarkCheck className="h-3.5 w-3.5 text-accent" /> : <Bookmark className="h-3.5 w-3.5" />}
      {existing ? 'Bookmarked — remove' : 'Bookmark this page'}
    </Button><ChatAboutButton path={fixedPath} label={label} /></div>
  );
}
