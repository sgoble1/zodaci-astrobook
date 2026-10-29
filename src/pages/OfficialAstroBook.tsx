import { Link } from 'react-router-dom';
import { BookOpen, Sparkles } from 'lucide-react';
import { Book3D } from '@/components/books/Book3D';
import { Button } from '@/components/ui/button';
import { usePageMeta } from '@/hooks/usePageMeta';
import { OFFICIAL_BOOKS, ownerLabel, useOfficialEditions, type OfficialEditionRow } from '@/lib/officialEditions';
import comicCover from '@/assets/astrocomic-cover.jpg';
import opener from '@/assets/mystic/pisces-opener.jpg';

/**
 * The Official AstroBook section. Each founder sees only their own Masterbook and AstroComic; the admin sees every
 * edition. The list comes from my_official_editions() on the server, and every linked page checks access again.
 */
export default function OfficialAstroBook() {
  usePageMeta('Official AstroBook · Zodaci', 'Your official AstroBook edition: Masterbook, AstroComic and companion books.');
  const { rows, error, retry } = useOfficialEditions();
  const viewingAll = !!rows && rows.some(r => !r.is_own);
  return (
    <article className="space-y-12">
      <header className="grid items-center gap-8 md:grid-cols-[1fr_18rem]">
        <div>
          <div className="font-smallcaps text-xs text-gold">Official AstroBook</div>
          <h1 className="text-4xl sm:text-5xl">{viewingAll ? 'The Official AstroBooks' : 'Your Official AstroBook'}</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {viewingAll
              ? 'Every founding edition, as the admin sees them. Each owner sees only their own Masterbook and AstroComic.'
              : 'Your Masterbook and your own AstroComic, read in full here and printable as an AstroBook. Only you, and the people you share it with, can open it.'}
          </p>
        </div>
        <img src={opener} alt="Mystic Ink chapter opener: two luminous fish circling a gold constellation inside an astrolabe frame" width={1200} height={1200} className="mx-auto w-56 rounded-full border border-mystic-gold/50 shadow-[0_0_60px_-20px_hsl(var(--mi-gold))] md:w-full" />
      </header>

      {!rows && !error && <p role="status" className="text-muted-foreground">Checking your editions…</p>}
      {error && <div role="alert" className="flex flex-wrap items-center gap-3 text-destructive">{error}<Button size="sm" variant="outline" onClick={retry}>Try again</Button></div>}
      {rows && !rows.length && (
        <div className="parchment space-y-3 p-8 text-center">
          <p className="text-muted-foreground">No official edition belongs to this account.</p>
          <Button asChild variant="outline"><Link to="/my-astrobook">Open my library</Link></Button>
        </div>
      )}
      {rows?.map(r => <EditionShelf key={r.edition} row={r} />)}
    </article>
  );
}

function EditionShelf({ row }: { row: OfficialEditionRow }) {
  const book = OFFICIAL_BOOKS[row.edition];
  const comicTo = `/official-astrobook/comic/${row.edition}`;
  return (
    <section aria-labelledby={`ed-${row.edition}`} className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-2">
        <h2 id={`ed-${row.edition}`} className="text-3xl">{row.is_own ? 'Your books' : `${row.display_name}’s books`}</h2>
        <span className="font-smallcaps text-xs text-gold">{ownerLabel(row)}</span>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="parchment flex flex-col gap-4 p-5 sm:flex-row">
          <div className="mx-auto shrink-0"><Book3D pages={book.pages} label="Official edition · 6″ × 9″" hardcover design="midnight-stars" name={row.display_name} /></div>
          <div className="flex flex-1 flex-col gap-3">
            <div className="font-smallcaps text-xs text-gold">Official Masterbook</div>
            <h3 className="text-2xl leading-tight">{book.masterbookTitle}</h3>
            <p className="flex-1 text-sm text-muted-foreground">{book.detail}</p>
            <div className="flex flex-wrap gap-2">
              <Button asChild><Link to={book.masterbook}><BookOpen className="mr-1.5 h-4 w-4" aria-hidden="true" />{book.readLabel}</Link></Button>
              {row.is_own && <Button asChild variant="outline"><Link to="/books">Order a print</Link></Button>}
            </div>
          </div>
        </div>
        <div className="parchment flex flex-col gap-4 p-5 sm:flex-row">
          <Link to={comicTo} className="mx-auto block w-40 shrink-0 overflow-hidden rounded-sm border-2 border-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Open ${row.is_own ? 'your' : `${row.display_name}’s`} Official AstroComic`}>
            <img src={comicCover} alt="" width={1024} height={1584} loading="lazy" className="aspect-[11/17] w-full object-cover" />
          </Link>
          <div className="flex flex-1 flex-col gap-3">
            <div className="font-smallcaps text-xs text-gold">Official AstroComic</div>
            <h3 className="text-2xl leading-tight">{row.is_own ? 'Your AstroComic' : `${row.display_name}’s AstroComic`}</h3>
            <p className="flex-1 text-sm text-muted-foreground">A 24-page issue drawn from {row.is_own ? 'your' : `${row.display_name}’s`} own chart and this month’s sky, in the Lantern &amp; Ink comic style.{row.birth ? '' : ' Birth details are needed before it can be drawn.'}</p>
            <div><Button asChild variant={row.birth ? 'default' : 'outline'}><Link to={comicTo}><Sparkles className="mr-1.5 h-4 w-4" aria-hidden="true" />Read the AstroComic</Link></Button></div>
          </div>
        </div>
      </div>
      <Link to={`/official-astrobook/showcase/${row.edition}`} className="vellum flex flex-col gap-1 p-5 hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <span className="font-smallcaps text-xs text-gold">New · Illustrated showcase</span>
        <span className="font-display text-2xl">{row.is_own ? 'Your' : `${row.display_name}’s`} four illustrated pages</span>
        <span className="text-sm text-muted-foreground">Rising sign, Sun, Moon and a signature pattern, each with its own plate and calculated facts — plus the next chapters in script.</span>
      </Link>
      {book.extras.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {book.extras.map(x => (
            <li key={x.to}><Link to={x.to} className="flex h-full flex-col gap-1 rounded-xl border border-border bg-card/60 p-4 hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className="font-display text-lg">{x.title}</span><span className="text-sm text-muted-foreground">{x.detail}</span>
            </Link></li>
          ))}
        </ul>
      )}
    </section>
  );
}
