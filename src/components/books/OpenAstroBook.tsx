import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { OpenBook } from '@/components/books/OpenBook';
import { useSession } from '@/hooks/useLibrary';
import { useMyBirth } from '@/lib/myBirth';
import { useCoverImage } from '@/hooks/useCoverImage';
import { COVER_DESIGNS, coverSrc } from '@/content/coverDesigns';
import { DEFAULT_CROP } from '@/lib/coverLayout';
import { birthLineOf } from '@/lib/bookLeaves';
import { memberBookLeaves, sampleBookLeaves, sampleComicLeaves, SAMPLE_READER } from '@/content/sampleBookLeaves';

/**
 * The openable AstroBook. Everyone can open the fictional sample reader's Collector edition; a signed-in member with
 * saved birth details can switch to a chart-only book built in the browser from their own chart (nothing is saved).
 */
export function OpenAstroBook({ layout = 'side', next = '/astrobook#full-edition' }: { layout?: 'side' | 'stacked'; next?: string }) {
  const session = useSession();
  const birth = useMyBirth();
  const [mine, setMine] = useState(false);
  const design = COVER_DESIGNS[0];
  const own = mine && birth ? birth : null;
  const designed = useCoverImage(own ? { source: { kind: 'design', key: design.key }, crop: DEFAULT_CROP, name: own.name || 'Your AstroBook', trimPt: [432, 648], detail: birthLineOf(own.date, own.time, own.placeLabel).replace(/^Born /, '') } : null, 40);
  const sample = useMemo(() => sampleBookLeaves(), []);
  const memberLeaves = useMemo(() => (own ? memberBookLeaves(own, designed || coverSrc(design)) : null), [own, designed, design]);
  const leaves = memberLeaves ?? sample;
  const switcher = session && birth ? (
    <div role="radiogroup" aria-label="Which book to open" className="mt-4 flex flex-wrap justify-center gap-2">
      {[{ on: !mine, label: `${SAMPLE_READER.name.split(' ')[0]}’s sample`, set: false }, { on: mine, label: `Built from ${birth.name ? `${birth.name.split(' ')[0]}’s` : 'my'} chart`, set: true }].map(o => (
        <button key={o.label} type="button" role="radio" aria-checked={o.on} onClick={() => setMine(o.set)} className={`rounded-full border px-3 py-1 text-sm transition-colors duration-500 ${o.on ? 'border-primary bg-primary/15' : 'border-border hover:border-primary/60'}`}>{o.label}</button>
      ))}
    </div>
  ) : (
    <p className="mt-4 text-center text-sm text-muted-foreground">
      {session ? <><Link to="/start" className="text-primary underline underline-offset-4">Add your birth details</Link> to open one built from your own chart.</> : <><Link to={`/auth?mode=signup&next=${encodeURIComponent(next)}`} className="text-primary underline underline-offset-4">Sign in</Link> to open one built from your own chart.</>}
    </p>
  );
  const note = own
    ? <p className="mt-2 text-center text-xs text-muted-foreground">Calculated in your browser from your saved birth details{own.time ? '' : '; with no birth time, houses and angles are left out'}. Chapters are added from your own readings when you order. Nothing here is saved.</p>
    : <p className="mt-2 text-center text-xs text-muted-foreground">{SAMPLE_READER.name} is fictional. Every position in her book is calculated for {SAMPLE_READER.printed.born.replace(/^Born /, '')}.</p>;
  return <OpenBook key={own ? 'mine' : 'sample'} leaves={leaves} label={own ? 'Your AstroBook, built from your chart' : `Sample Collector AstroBook for ${SAMPLE_READER.name}`} layout={layout} footer={<>{switcher}{note}</>} />;
}

/** The sample AstroComic digest for the same fictional reader, opened and turned like a printed comic. */
export function OpenComicDigest({ layout = 'stacked' }: { layout?: 'side' | 'stacked' }) {
  const leaves = useMemo(() => sampleComicLeaves(), []);
  return <OpenBook kind="comic" leaves={leaves} label={`Sample AstroComic digest starring ${SAMPLE_READER.name}`} layout={layout} footer={<p className="mt-2 text-center text-xs text-muted-foreground">5.5 × 8.5 in digest · a fictional reader, a real calculation</p>} />;
}
