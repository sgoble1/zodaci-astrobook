import { useState } from 'react';
import { Book3D } from '@/components/books/Book3D';
import { COVER_SAMPLES } from '@/content/coverSamples';
import { PRODUCT_ART } from '@/content/productArtwork';

/**
 * Promotional product gallery. AstroBook pages open on a turnable 3D book showing a sample cover printed with an
 * invented reader's name and birth details; the chips switch edition and reader. AstroComic pages show the comic
 * samples. Members' own covers never appear here.
 */
export function ProductArtworkGallery({ comic = false }: { comic?: boolean }) {
  if (comic) return <ComicGallery />;
  return <BookGallery />;
}

function BookGallery() {
  const [index, setIndex] = useState(0);
  const sample = COVER_SAMPLES[index] ?? COVER_SAMPLES[0];
  return <figure className="product-art-gallery">
    <div className="product-art-stage product-art-stage-3d">
      <Book3D key={sample.id} pages={sample.id === 'pocket' ? 100 : 200} hardcover={sample.id !== 'pocket'} coverSrc={sample.src} label={`${sample.edition} AstroBook · sample cover`} />
    </div>
    <div className="mt-3 flex justify-center gap-2" role="radiogroup" aria-label="Sample covers">
      {COVER_SAMPLES.map((s, i) => (
        <button key={s.id} type="button" role="radio" aria-checked={i === index} onClick={() => setIndex(i)} className="product-art-thumb product-art-thumb-cover" aria-label={`${s.edition} · ${s.sign}, printed for ${s.name}`}>
          <img src={s.src} alt="" width={64} height={96} className="h-full w-full object-cover" />
        </button>
      ))}
    </div>
    <figcaption className="mt-3 text-center text-sm text-muted-foreground" aria-live="polite">
      <span className="block font-label tracking-[0.12em] text-primary">Printed for {sample.name}</span>
      <span className="block">{sample.printed.born}</span>
      <span className="block text-xs">{sample.printed.placements} · a fictional reader, a real calculation</span>
    </figcaption>
  </figure>;
}

function ComicGallery() {
  const samples = [{ ...PRODUCT_ART.comic, label: 'AstroComic · story preview' }, { ...PRODUCT_ART.collection, label: 'The print collection' }];
  const [index, setIndex] = useState(0);
  const sample = samples[index] ?? samples[0];
  return <figure className="product-art-gallery">
    <div className="product-art-stage"><img src={sample.src} alt={sample.alt} width={1024} height={1024} className="h-full w-full object-contain" /></div>
    <div className="mt-3 flex justify-center gap-2" role="radiogroup" aria-label="AstroComic sample images">
      {samples.map((s, i) => <button key={s.label} type="button" role="radio" aria-checked={i === index} className="product-art-thumb" aria-label={`Show ${s.label}`} onClick={() => setIndex(i)}><img src={s.src} alt="" width={64} height={64} className="h-full w-full object-contain" /></button>)}
    </div>
    <figcaption className="mt-3 text-center text-xs text-muted-foreground">{sample.label} · illustrative shop sample</figcaption>
  </figure>;
}
