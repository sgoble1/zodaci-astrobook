import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SpotArt } from '@/components/art/SpotArt';
import { PRODUCT_ART } from '@/content/productArtwork';

/** Public examples of supported depth, never excerpts from private founder biographies. */
export function PersonalizationStory() {
  return <section aria-labelledby="personal-depth" className="product-story-band">
    <div className="product-story-art"><img src={PRODUCT_ART.collection.src} alt={PRODUCT_ART.collection.alt} loading="lazy" width={1536} height={1024} /><p className="mt-3 text-xs text-muted-foreground">Illustrative shop collection · every reader’s content is different.</p></div>
    <div className="min-w-0 space-y-5">
      <p className="font-label text-primary">Beyond your Sun sign</p>
      <h2 id="personal-depth" className="plate-title">Your chart. Your context. Your questions.</h2>
      <p className="leading-relaxed text-muted-foreground">A placement is only the beginning. Your chart connects signs, exact degrees, houses, rulers and aspects. A chapter can explore how those pieces interact — not just give you a list of traits.</p>
      <div className="flex items-start gap-4"><SpotArt kind="written" className="h-16 w-16 shrink-0" orbit={false} /><div><h3 className="font-label text-xl">Bring your real life into the reading</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Add an experience, a creative question or a relationship situation in your private context. You choose whether it may inform future generated chapters and podcasts. Your experiences come from you; astrology never invents them.</p></div></div>
      <div className="flex items-start gap-4"><SpotArt kind="book" className="h-16 w-16 shrink-0" orbit={false} /><div><h3 className="font-label text-xl">Build the chapters that matter to you</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Request a chapter around your own topic. Finished readings can be woven into your AstroBook; up to two additional finished sections can be selected at the listed extra-section price. Review the actual manuscript before paying.</p></div></div>
      <p className="text-xs leading-relaxed text-muted-foreground">For example: explore creative drive through the Sun, emotional steadiness through the Moon, then their relationship to your work and daily habits. Interpretations are reflective possibilities, not proven facts about your life. Available depth varies by book version; generated work uses AI credits. Changing context does not automatically rewrite existing pages.</p>
      <div className="flex flex-wrap gap-3"><Button asChild variant="outline"><Link to="/personal-context">Add your context</Link></Button><Button asChild variant="outline"><Link to="/my-masterbook">Explore your chapters</Link></Button></div>
    </div>
  </section>;
}