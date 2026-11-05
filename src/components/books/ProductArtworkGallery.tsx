import { useState } from 'react';
import { Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Book3D } from '@/components/books/Book3D';
import { BOOK_PRODUCT_SAMPLES, PRODUCT_ART, PROMO_3D_COVER } from '@/content/productArtwork';

/**
 * Promotional product gallery. AstroBook pages open on a turnable 3D Collector Taurus book, then the
 * flat shop samples; AstroComic pages show the comic samples. Members' own covers never appear here.
 */
export function ProductArtworkGallery({ comic = false }: { comic?: boolean }) {
  const samples = comic ? [{ ...PRODUCT_ART.comic, label: 'AstroComic · story preview' }, { ...PRODUCT_ART.collection, label: 'The print collection' }] : [...BOOK_PRODUCT_SAMPLES, { ...PRODUCT_ART.collection, label: 'The print collection' }];
  const [index, setIndex] = useState(comic ? 0 : -1);
  const sample = index >= 0 ? samples[index] ?? samples[0] : null;
  return <figure className="product-art-gallery">
    <div className="product-art-stage">{sample ? <img src={sample.src} alt={sample.alt} width={1024} height={1024} className="h-full w-full object-contain" /> : <Book3D pages={200} hardcover coverSrc={PROMO_3D_COVER.src} label="Collector AstroBook · shop sample cover" />}</div>
    <div className="mt-3 flex justify-center gap-2" role="group" aria-label={comic ? 'AstroComic sample images' : 'AstroBook sample images'}>
      {!comic && <Button variant="ghost" className="product-art-thumb" aria-label="Show the turnable 3D book" aria-pressed={index === -1} onClick={() => setIndex(-1)}><Box className="h-6 w-6" aria-hidden /><span className="sr-only">3D</span></Button>}
      {samples.map((s, i) => <Button key={s.label} variant="ghost" className="product-art-thumb" aria-label={`Show ${s.label}`} aria-pressed={i === index} onClick={() => setIndex(i)}><img src={s.src} alt="" width={64} height={64} className="h-full w-full object-contain" /></Button>)}
    </div>
    <figcaption className="mt-3 text-center text-xs text-muted-foreground">{sample ? `${sample.label} · illustrative shop sample` : 'Turn the book to see the spine · illustrative shop sample'}</figcaption>
  </figure>;
}
