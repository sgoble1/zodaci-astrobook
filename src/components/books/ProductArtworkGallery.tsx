import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BOOK_PRODUCT_SAMPLES, PRODUCT_ART } from '@/content/productArtwork';

export function ProductArtworkGallery({ comic = false }: { comic?: boolean }) {
  const samples = comic ? [{ ...PRODUCT_ART.comic, label: 'AstroComic · story preview' }, { ...PRODUCT_ART.collection, label: 'The print collection' }] : [...BOOK_PRODUCT_SAMPLES, { ...PRODUCT_ART.collection, label: 'The print collection' }];
  const [index, setIndex] = useState(0);
  const sample = samples[index] ?? samples[0];
  return <figure className="product-art-gallery">
    <div className="product-art-stage"><img src={sample.src} alt={sample.alt} width={1024} height={1024} className="h-full w-full object-contain" /></div>
    <div className="mt-3 flex justify-center gap-2" role="group" aria-label={comic ? 'AstroComic sample images' : 'AstroBook sample images'}>
      {samples.map((s, i) => <Button key={s.label} variant="ghost" className="product-art-thumb" aria-label={`Show ${s.label}`} aria-pressed={i === index} onClick={() => setIndex(i)}><img src={s.src} alt="" width={64} height={64} className="h-full w-full object-contain" /></Button>)}
    </div>
    <figcaption className="mt-3 text-center text-xs text-muted-foreground">{sample.label} · illustrative shop sample</figcaption>
  </figure>;
}