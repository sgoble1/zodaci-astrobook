import { Link } from 'react-router-dom';
import { BookOpen, FileText, Loader2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useSession } from '@/hooks/useLibrary';
import { EDITION_OWNER_NAME, sharedHref, useSharedWithMe, type SharedWithMe as Item } from '@/lib/editionSharing';
import { viewAprilEditionInApp, viewZacEditionInApp } from '@/hooks/useAprilSpace';

const fmt = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

/** Everything other people have shared with this account: whole editions and single chapters, grouped by who shared them. */
export default function SharedWithMe() {
  usePageMeta('Shared with me · Zodaci', 'Masterbooks and chapters other people have shared with you.', { noindex: true });
  const session = useSession();
  const { items, error, retry } = useSharedWithMe();
  if (!session) return (
    <article className="mx-auto max-w-xl space-y-4 py-12 text-center">
      <h1 className="text-4xl">Shared with me</h1>
      <p className="text-muted-foreground">Sign in to see the Masterbooks and chapters people have shared with you.</p>
      <Button asChild><Link to="/auth?next=/shared-with-me">Sign in</Link></Button>
    </article>
  );
  const owners = [...new Set((items ?? []).map(i => i.owner_name || EDITION_OWNER_NAME[i.edition]))];
  return (
    <article className="space-y-8">
      <header>
        <h1 className="text-4xl sm:text-5xl">Shared with me</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">Masterbooks and chapters that their owners chose to share with your account. They can stop sharing at any time, and the page updates the next time you open it.</p>
      </header>
      {items === null && <p role="status" className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />Checking what’s been shared with you…</p>}
      {error && <div role="alert" className="flex flex-wrap items-center gap-3 text-destructive">{error}<Button size="sm" variant="outline" onClick={retry}>Try again</Button></div>}
      {items && items.length === 0 && !error && (
        <div className="glass-card max-w-xl space-y-3 p-6">
          <Share2 className="h-6 w-6 text-gold" aria-hidden="true" />
          <h2 className="text-2xl">Nothing shared yet</h2>
          <p className="text-sm text-muted-foreground">When someone shares their Masterbook or a chapter with {session.user.email}, it will appear here.</p>
          <Button asChild variant="outline"><Link to="/">Back to your dashboard</Link></Button>
        </div>
      )}
      {owners.map(owner => {
        const mine = (items ?? []).filter(i => (i.owner_name || EDITION_OWNER_NAME[i.edition]) === owner);
        const whole = mine.filter(i => i.scope === 'edition');
        const chapters = mine.filter(i => i.scope === 'chapter' && !whole.some(w => w.edition === i.edition));
        return (
          <section key={owner} aria-labelledby={`from-${owner}`} className="space-y-4">
            <h2 id={`from-${owner}`} className="text-2xl">From {owner}</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {whole.map(i => <EditionCard key={i.id} item={i} owner={owner} />)}
              {chapters.map(i => (
                <Link key={i.id} to={sharedHref(i)} className="parchment flex items-start gap-3 p-4 transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <FileText className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
                  <span className="min-w-0"><span className="block font-medium">{i.chapter_title || 'Shared chapter'}</span><span className="block text-xs text-muted-foreground">One chapter of {owner}’s Masterbook · shared {fmt(i.created_at)}</span></span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </article>
  );
}

function EditionCard({ item, owner }: { item: Item; owner: string }) {
  const openInApp = item.edition === 'april' ? viewAprilEditionInApp : item.edition === 'zac' ? viewZacEditionInApp : null;
  return (
    <div className="glass-card flex flex-col gap-3 p-5">
      <div className="flex items-start gap-3">
        <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
        <div><div className="font-display text-xl">{owner}’s complete Masterbook</div><div className="text-xs text-muted-foreground">Every chapter · shared {fmt(item.created_at)}</div></div>
      </div>
      <div className="mt-auto flex flex-wrap gap-2">
        {openInApp ? <Button size="sm" onClick={openInApp}>Open {owner}’s edition</Button> : <Button size="sm" asChild><Link to={sharedHref(item)}>Open {owner}’s edition</Link></Button>}
        {item.edition === 'april' && <Button size="sm" variant="outline" asChild><Link to="/april">Read the shared report</Link></Button>}
      </div>
    </div>
  );
}
