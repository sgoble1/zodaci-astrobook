import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { OpenBook } from '@/components/books/OpenBook';
import { useSession } from '@/hooks/useLibrary';
import { useMyBirth } from '@/lib/myBirth';
import { Button } from '@/components/ui/button';
import { memberBookLeaves, memberComicLeaves, sampleBookLeaves, sampleComicLeaves, SAMPLE_READER } from '@/content/sampleBookLeaves';

/**
 * The openable AstroBook. Everyone can open the fictional sample reader's Collector edition; a signed-in member with
 * saved birth details can switch to a chart-only book built in the browser from their own chart (nothing is saved).
 */
export function OpenAstroBook({ layout = 'side', next = '/astrobook#full-edition', startMine = false }: { layout?: 'side' | 'stacked'; next?: string; /** Open the member's own book first when their birth details are saved. */ startMine?: boolean }) {
  const session = useSession();
  const birth = useMyBirth();
  const [mine, setMine] = useState(startMine);
  const own = session && mine && birth ? birth : null;
  const sample = useMemo(() => sampleBookLeaves(), []);
  const memberLeaves = useMemo(() => { try { return own ? memberBookLeaves(own) : null; } catch { return null; } }, [own]);
  if (own && !memberLeaves) return <div role="alert" className="space-y-3"><p>Your saved birth details could not be calculated.</p><Button asChild variant="outline"><Link to="/start">Review birth details</Link></Button></div>;
  const leaves = memberLeaves ?? sample;
  const switcher = session && birth ? (
    <div role="radiogroup" aria-label="Which book to open" className="mt-4 flex flex-wrap justify-center gap-2">
      {[{ on: !mine, label: `${SAMPLE_READER.name.split(' ')[0]}’s sample`, set: false }, { on: mine, label: `Built from ${birth.name ? `${birth.name.split(' ')[0]}’s` : 'my'} chart`, set: true }].map(o => (
        <Button key={o.label} variant="outline" size="sm" type="button" role="radio" aria-checked={o.on} onClick={() => setMine(o.set)} className={o.on ? 'border-primary bg-primary/15' : 'border-border'}>{o.label}</Button>
      ))}
    </div>
  ) : (
    <p className="mt-4 text-center text-sm text-muted-foreground">
      {session ? <><Link to="/start" className="text-primary underline underline-offset-4">Add your birth details</Link> to open one built from your own chart.</> : <><Link to={`/auth?mode=signup&next=${encodeURIComponent(next)}`} className="text-primary underline underline-offset-4">Sign in</Link> to open one built from your own chart.</>}
    </p>
  );
  const note = own
    ? <p className="mt-2 text-center text-xs text-muted-foreground">25 numbered pages from your saved chart{own.time ? '' : '; without a birth time, houses and angles are left out and the Moon is provisional'}. Artwork is illustrative. Nothing here is saved.</p>
    : <p className="mt-2 text-center text-xs text-muted-foreground">{SAMPLE_READER.name} is fictional. Every position in her book is calculated for {SAMPLE_READER.printed.born.replace(/^Born /, '')}.</p>;
  return <OpenBook key={own ? 'mine' : 'sample'} leaves={leaves} label={own ? 'Your AstroBook, built from your chart' : `Sample Collector AstroBook for ${SAMPLE_READER.name}`} layout={layout} spine={{ title: 'Zodaci AstroBook', name: own ? own.name || undefined : SAMPLE_READER.name }} footer={<>{switcher}{note}</>} />;
}

/** The sample AstroComic digest for the same fictional reader, opened and turned like a printed comic. */
export function OpenComicDigest({ layout = 'stacked', next = '/astrocomic#preview' }: { layout?: 'side' | 'stacked'; next?: string }) {
  const session = useSession();
  const birth = useMyBirth();
  const [mine, setMine] = useState(false);
  const own = mine && birth ? birth : null;
  const sample = useMemo(() => sampleComicLeaves(), []);
  const memberLeaves = useMemo(() => { try { return own ? memberComicLeaves(own) : null; } catch { return null; } }, [own]);
  const leaves = memberLeaves ?? sample;
  const switcher = session && birth ? (
    <div role="radiogroup" aria-label="Which comic to open" className="mt-4 flex flex-wrap justify-center gap-2">
      {[{ on: !mine, label: `${SAMPLE_READER.name.split(' ')[0]}’s sample`, set: false }, { on: mine, label: `Built from ${birth.name ? `${birth.name.split(' ')[0]}’s` : 'my'} chart`, set: true }].map(o => (
        <button key={o.label} type="button" role="radio" aria-checked={o.on} onClick={() => setMine(o.set)} className={`rounded-full border px-3 py-1 text-sm transition-colors duration-500 ${o.on ? 'border-primary bg-primary/15' : 'border-border hover:border-primary/60'}`}>{o.label}</button>
      ))}
    </div>
  ) : (
    <p className="mt-4 text-center text-sm text-muted-foreground">
      {session ? <><Link to="/start" className="text-primary underline underline-offset-4">Add your birth details</Link> to open an issue built from your own chart.</> : <><Link to={`/auth?mode=signup&next=${encodeURIComponent(next)}`} className="text-primary underline underline-offset-4">Sign in</Link> to open an issue built from your own chart.</>}
    </p>
  );
  const note = own
    ? 'Your Issue #1 opening pages, scripted in your browser from your chart and this month’s sky. Nothing is saved.'
    : 'A fictional reader, a real calculation';
  return <OpenBook key={own ? 'mine' : 'sample'} kind="comic" leaves={leaves} label={own ? 'Your AstroComic, built from your chart' : `Sample AstroComic digest starring ${SAMPLE_READER.name}`} layout={layout} spine={{ title: 'AstroComic · Issue 1', name: own ? own.name || undefined : SAMPLE_READER.name }} footer={<>{switcher}<p className="mt-2 text-center text-xs text-muted-foreground">5.5 × 8.5 in digest · {note}</p></>} />;
}
