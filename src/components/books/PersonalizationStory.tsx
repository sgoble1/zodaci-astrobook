import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SpotArt } from '@/components/art/SpotArt';
import { PRODUCT_ART } from '@/content/productArtwork';
import { SpecificityExamples } from '@/components/books/SpecificityExamples';
import { cn } from '@/lib/utils';

/** Public examples of supported depth, never excerpts from private founder biographies. */
export function PersonalizationStory({ className, examples = true }: { className?: string; examples?: boolean }) {
  return <section aria-labelledby="personal-depth" className={cn('product-story-band', className)}>
    <div className="product-story-art"><img src={PRODUCT_ART.collection.src} alt={PRODUCT_ART.collection.alt} loading="lazy" width={1536} height={1024} /><p className="mt-3 text-xs text-muted-foreground">Illustrative shop collection · every reader’s content is different.</p></div>
    <div className="min-w-0 space-y-5">
      <p className="font-label text-primary">Beyond your Sun sign</p>
      <h2 id="personal-depth" className="plate-title">Your whole chart, and your own questions</h2>
      <p className="leading-relaxed text-muted-foreground">Your Sun sign is one placement out of dozens. A chapter looks at how your signs, degrees, houses, rulers and aspects work together, instead of listing traits for one sign.</p>
      <div className="flex items-start gap-4"><SpotArt kind="written" className="h-16 w-16 shrink-0" orbit={false} /><div><h3 className="font-label text-xl">Add your own context</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Write down a situation you’re in, a creative question or something about a relationship. It stays private, and you decide whether new chapters and podcasts may use it. It never changes your chart, and we never make up events from astrology.</p></div></div>
      <div className="flex items-start gap-4"><SpotArt kind="book" className="h-16 w-16 shrink-0" orbit={false} /><div><h3 className="font-label text-xl">Ask for a chapter on your topic</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Request a chapter about something specific. Finished readings can go into your AstroBook, and you can add up to two extra sections at the listed price. You read the actual manuscript before you pay.</p></div></div>
      <p className="text-xs leading-relaxed text-muted-foreground">For example, a chapter could look at creative drive through your Sun and emotional steadiness through your Moon, then at how both show up in your work. These are interpretations to think about, not facts about your life. How deep a book goes depends on the version, and writing new chapters uses AI credits. Changing your context later doesn’t rewrite pages you already have.</p>
      <div className="flex flex-wrap gap-3"><Button asChild variant="outline"><Link to="/personal-context">Add your context</Link></Button><Button asChild variant="outline"><Link to="/my-masterbook">Explore your chapters</Link></Button></div>
    </div>
    {examples && <SpecificityExamples className="product-story-examples" />}
  </section>;
}

/** Short callout for product pages: links to the full story on the AstroBook page. */
export function PersonalizationCallout({ product = 'book', className }: { product?: 'book' | 'comic'; className?: string }) {
  return <aside aria-label="Made from your chart" className={cn('personal-callout', className)}>
    <SpotArt kind={product === 'comic' ? 'tv' : 'written'} className="h-16 w-16 shrink-0" orbit={false} />
    <div className="min-w-0">
      <p className="font-label text-lg tracking-[0.08em]">{product === 'comic' ? 'Drawn from your own chart' : 'Written from your own chart'}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{product === 'comic'
        ? 'Each issue starts from your saved placements and the month’s real transits. Your first issue is your own story, never the sample comic.'
        : 'Every chapter names the exact sign, degree, house and aspect behind it. Add private context and request chapters on the topics that matter to you.'}</p>
      <Link to="/astrobook#personal-depth" className="mt-2 inline-block font-label text-sm tracking-[0.14em] text-accent underline-offset-4 hover:underline">See the difference →</Link>
    </div>
  </aside>;
}