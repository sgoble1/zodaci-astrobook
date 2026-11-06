import collector from '@/assets/products/collector-taurus.jpg.asset.json';
import signature from '@/assets/products/signature-gemini.jpg.asset.json';
import pocket from '@/assets/products/pocket-gemini.jpg.asset.json';
import comic from '@/assets/products/astrocomic-opening.jpg.asset.json';
import collection from '@/assets/products/observatory-print-collection.jpg';
import { COVER_SAMPLES, LEAD_COVER } from '@/content/coverSamples';

/** Promotional shop samples only; never replace a member's designed cover or private issue. */
export const PRODUCT_ART = {
  /** The lead sample cover, printed with a fictional reader's name and birth details. */
  book: { src: LEAD_COVER.src, alt: LEAD_COVER.alt },
  /** Shop photography of the same editions (studio mockups, no reader details). */
  bookPhoto: { src: collector.url, alt: 'Collector AstroBook shop photo: Taurus in a golden atomic orbit, cream cover and red title band' },
  signature: { src: signature.url, alt: 'Signature AstroBook sample: Gemini couple with golden orbit rings on a cream cover' },
  pocket: { src: pocket.url, alt: 'Pocket AstroBook sample: Gemini twins in navy ink with a red title band' },
  comic: { src: comic.url, alt: 'AstroComic sample story page: The Midnight Signal, six golden-age panels with a brass celestial compass' },
  collection: { src: collection, alt: 'Illustrative AstroBook and AstroComic collection on a lamp-lit observatory desk, with Taurus and Gemini books and an open comic' },
};

/** Sample covers in edition order, each printed for a different fictional reader. */
export const BOOK_PRODUCT_SAMPLES = [...COVER_SAMPLES].reverse().map(s => ({ src: s.src, alt: s.alt, label: `${s.edition} · ${s.sign}`, sample: s }));
/** Flat 2:3 Collector Taurus front cover with the sample reader's details, wrapped onto promotional 3D book previews. */
export const PROMO_3D_COVER = { src: LEAD_COVER.src, alt: LEAD_COVER.alt };
