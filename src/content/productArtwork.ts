import collector from '@/assets/products/collector-taurus.jpg.asset.json';
import signature from '@/assets/products/signature-gemini.jpg.asset.json';
import pocket from '@/assets/products/pocket-gemini.jpg.asset.json';
import comic from '@/assets/products/astrocomic-opening.jpg.asset.json';
import collection from '@/assets/products/observatory-print-collection.jpg';

/** Promotional shop samples only; never replace a member's designed cover or private issue. */
export const PRODUCT_ART = {
  book: { src: collector.url, alt: 'Collector AstroBook sample: Taurus in a golden atomic orbit, cream cover and red title band' },
  signature: { src: signature.url, alt: 'Signature AstroBook sample: Gemini couple with golden orbit rings on a cream cover' },
  pocket: { src: pocket.url, alt: 'Pocket AstroBook sample: Gemini twins in navy ink with a red title band' },
  comic: { src: comic.url, alt: 'AstroComic sample story page: The Midnight Signal, six golden-age panels with a brass celestial compass' },
  collection: { src: collection, alt: 'Illustrative AstroBook and AstroComic collection on a lamp-lit observatory desk, with Taurus and Gemini books and an open comic' },
};

export const BOOK_PRODUCT_SAMPLES = [
  { ...PRODUCT_ART.pocket, label: 'Pocket · Gemini' },
  { ...PRODUCT_ART.signature, label: 'Signature · Gemini' },
  { ...PRODUCT_ART.book, label: 'Collector · Taurus' },
];