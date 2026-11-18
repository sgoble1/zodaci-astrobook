import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { OpenBook } from '@/components/books/OpenBook';
import { useSession } from '@/hooks/useLibrary';
import { useMyBirth } from '@/lib/myBirth';
import { Button } from '@/components/ui/button';
import { memberBookLeaves, memberComicLeaves, sampleBookLeaves, sampleComicLeaves, SAMPLE_READER } from '@/content/sampleBookLeaves';
import { previewName } from '@/lib/comicNarrative';
import { versionOf, type Edition } from '@/lib/books';
import type { Tone } from '@/lib/perception';
import type { MyBirth } from '@/lib/myBirth';
import { useCoverImage } from '@/hooks/useCoverImage';
import { DEFAULT_CROP } from '@/lib/coverLayout';
import { coverByKey } from '@/content/coverDesigns';

export interface OpenAstroBookProps {
  layout?: 'side' | 'stacked'; next?: string; startMine?: boolean;
  edition?: Edition; coverSrc?: string; coverChoice?: string; coverName?: string;
  dedication?: string; tone?: Tone;
  /** Authorized recipient selected by the order customizer; never a public/sample chart substitute. */
  previewBirth?: MyBirth | null;
}

/**
 * The openable AstroBook. Everyone can open the fictional sample reader's Collector edition; a signed-in member with
 * saved birth details can switch to a chart-only book built in the browser from their own chart (nothing is saved).
 */
export function OpenAstroBook({ layout = 'side', next = '/astrobook#full-edition', startMine = false, edition, coverSrc, coverChoice, coverName, dedication, tone, previewBirth }: OpenAstroBookProps) {
  const session = useSession();
  const birth = useMyBirth();
  const [mine, setMine] = useState(startMine);
  const controlled = previewBirth !== undefined;
  const own = session ? controlled ? previewBirth : mine && birth ? birth : null : null;
  const choiceKey = coverChoice?.replace(/^design:/, '');
  const design = choiceKey ? coverByKey(choiceKey) : undefined;
  const generatedCover = useCoverImage(!coverSrc && design ? { source: { kind: 'design', key: design.key }, crop: DEFAULT_CROP, name: coverName ?? own?.name ?? SAMPLE_READER.name, trimPt: versionOf(edition ?? 'classic')?.trimPt ?? [432, 648] } : null);
  const options = useMemo(() => edition !== undefined || coverSrc !== undefined || coverChoice !== undefined || coverName !== undefined || dedication !== undefined || tone !== undefined ? { edition, coverSrc: coverSrc || generatedCover || undefined, coverChoice, coverName, dedication, tone } : undefined, [edition, coverSrc, generatedCover, coverChoice, coverName, dedication, tone]);
  const sample = useMemo(() => sampleBookLeaves(options), [options]);
  const memberLeaves = useMemo(() => { try { return own ? memberBookLeaves(own, options) : null; } catch { return null; } }, [own, options]);
  if (own && !memberLeaves) return <div role="alert" className="space-y-3"><p>Your saved birth details could not be calculated.</p><Button asChild variant="outline"><Link to="/start">Review birth details</Link></Button></div>;
  const leaves = memberLeaves ?? sample;
  const switcher = controlled ? null : session && birth ? (
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
    ? <p className="mt-2 text-center text-xs text-muted-foreground">28 numbered pages from your saved chart{own.time ? '' : '; without a birth time, houses and angles are left out and the Moon is provisional'}. Artwork is illustrative. Nothing here is saved.</p>
    : <p className="mt-2 text-center text-xs text-muted-foreground">{SAMPLE_READER.name} is fictional. Every position in her book is calculated for {SAMPLE_READER.printed.born.replace(/^Born /, '')}.</p>;
  return <OpenBook key={own ? `mine:${own.date}:${own.name}` : 'sample'} leaves={leaves} label={own ? 'Your AstroBook, built from your chart' : `Sample AstroBook for ${SAMPLE_READER.name}`} layout={layout} trimPt={versionOf(edition ?? 'classic')?.trimPt} spine={{ title: 'Zodaci AstroBook', name: coverName ?? (own ? own.name || undefined : SAMPLE_READER.name) }} footer={<>{switcher}{note}</>} />;
}

/** The sample AstroComic digest for the same fictional reader, opened and turned like a printed comic. */
export function OpenComicDigest({ layout = 'stacked', next = '/astrocomic#preview' }: { layout?: 'side' | 'stacked'; next?: string }) {
  const session = useSession();
  const birth = useMyBirth();
  const [mine, setMine] = useState(false);
  const own = session && mine && birth ? birth : null;
  const sample = useMemo(() => sampleComicLeaves(), []);
  const memberLeaves = useMemo(() => { try { return own ? memberComicLeaves(own) : null; } catch { return null; } }, [own]);
  if (own && !memberLeaves) return <div role="alert"><p>Your comic could not be calculated from the saved birth details.</p><Button asChild variant="outline"><Link to="/start">Review birth details</Link></Button></div>;
  const leaves = memberLeaves ?? sample;
  const switcher = session && birth ? (
    <div role="radiogroup" aria-label="Which comic to open" className="mt-4 flex flex-wrap justify-center gap-2">
      {[{ on: !mine, label: `${SAMPLE_READER.name.split(' ')[0]}’s sample`, set: false }, { on: mine, label: `Built from ${birth.name ? `${birth.name.split(' ')[0]}’s` : 'my'} chart`, set: true }].map(o => (
        <Button key={o.label} variant="outline" size="sm" type="button" role="radio" aria-checked={o.on} onClick={() => setMine(o.set)}>{o.label}</Button>
      ))}
    </div>
  ) : (
    <p className="mt-4 text-center text-sm text-muted-foreground">
      {session ? <><Link to="/start" className="text-primary underline underline-offset-4">Add your birth details</Link> to open an issue built from your own chart.</> : <><Link to={`/auth?mode=signup&next=${encodeURIComponent(next)}`} className="text-primary underline underline-offset-4">Sign in</Link> to open an issue built from your own chart.</>}
    </p>
  );
  const note = own
    ? 'Your complete 24-page story preview, with a separate calculation ledger. Illustrative artwork, not a print-ready buyer issue. Nothing is saved.'
    : 'A fictional reader, a real calculation';
  return <OpenBook key={own ? 'mine' : 'sample'} kind="comic" leaves={leaves} label={own ? 'Your AstroComic, built from your chart' : `Sample AstroComic digest starring ${SAMPLE_READER.name}`} layout={layout} spine={{ title: 'AstroComic · Issue 1', name: own ? previewName(own.name) || undefined : SAMPLE_READER.name }} footer={<>{switcher}<p className="mt-2 text-center text-xs text-muted-foreground">5.5 × 8.5 in digest · {note}</p></>} />;
}
