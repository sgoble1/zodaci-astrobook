import aspects from '@/assets/shop/books/aspects.webp';
import fieldGuide from '@/assets/shop/books/field-guide.webp';
import houses from '@/assets/shop/books/houses.webp';
import moon from '@/assets/shop/books/moon.webp';
import numerology from '@/assets/shop/books/numerology.webp';
import regulus from '@/assets/shop/books/regulus.webp';
import retrograde from '@/assets/shop/books/retrograde.webp';
import stargazer from '@/assets/shop/books/stargazer.webp';
import synchronicity from '@/assets/shop/books/synchronicity.webp';
import tarot from '@/assets/shop/books/tarot.webp';
import posters from '@/assets/shop/departments/posters.webp';
import tees from '@/assets/shop/departments/tees.webp';
import mugs from '@/assets/shop/departments/mugs.webp';
import totes from '@/assets/shop/departments/totes.webp';
import stickers from '@/assets/shop/departments/stickers.webp';
import notebooks from '@/assets/shop/departments/notebooks.webp';
import necklaces from '@/assets/shop/departments/necklaces.webp';
import books from '@/assets/shop/departments/books.webp';
import leoPoster from '@/assets/shop/departments/leo-poster.webp';
import leoTee from '@/assets/shop/departments/leo-tee.webp';
import leoMug from '@/assets/shop/departments/leo-mug.webp';
import leoStickers from '@/assets/shop/departments/leo-stickers.webp';

/**
 * Real shop product photos, cut out of their studio backgrounds (see scripts/cutout-shop-products.py) so they can sit
 * on 1950s atomic backdrops. Each one links to the live listing by its shop handle.
 */
export type ShowcaseImage = { src: string; width: number; height: number };
export type ArchiveBook = { handle: string; title: string; img: ShowcaseImage };

/** Reference books from the gift shop's Cosmic Archive line, shown on the home shelf beside the AstroBooks. */
export const ARCHIVE_BOOKS: ArchiveBook[] = [
  { handle: 'cosmic-archive-the-houses-personalized', title: 'The Houses', img: { src: houses, width: 456, height: 760 } },
  { handle: 'cosmic-archive-aspects-patterns-personalized', title: 'Aspects & Patterns', img: { src: aspects, width: 456, height: 760 } },
  { handle: 'cosmic-archive-the-zodiac-field-guide', title: 'The Zodiac Field Guide', img: { src: fieldGuide, width: 513, height: 760 } },
  { handle: 'cosmic-archive-moon-cycles', title: 'Moon Cycles', img: { src: moon, width: 528, height: 760 } },
  { handle: 'cosmic-archive-the-stargazer-s-handbook', title: 'The Stargazer’s Handbook', img: { src: stargazer, width: 491, height: 760 } },
  { handle: 'regulus-the-king-star-atomic-zodiac', title: 'Regulus: The King Star', img: { src: regulus, width: 539, height: 760 } },
  { handle: 'retrograde-guide-atomic-zodiac', title: 'Retrograde Guide', img: { src: retrograde, width: 503, height: 760 } },
  { handle: 'the-synchronicity-book-atomic-zodiac', title: 'The Synchronicity Book', img: { src: synchronicity, width: 516, height: 760 } },
  { handle: 'cosmic-archive-numerology', title: 'Numerology', img: { src: numerology, width: 527, height: 760 } },
  { handle: 'cosmic-archive-tarot-reflection', title: 'Tarot & Reflection', img: { src: tarot, width: 537, height: 760 } },
];

export type DepartmentBackdrop = 'rays-red' | 'rays-mustard' | 'orbit-navy' | 'orbit-cream';
export type ShopDepartment = {
  id: string;
  label: string;
  /** Shop productType values this tile opens (the first is used in the link). */
  types: string[];
  backdrop: DepartmentBackdrop;
  img: ShowcaseImage;
};

/** The featured Atomic Zodiac tile: a Leo set arranged together, like a shop window. */
export const FEATURED_SET: { label: string; note: string; pieces: { img: ShowcaseImage; alt: string; slot: 'poster' | 'tee' | 'mug' | 'stickers' }[] } = {
  label: 'Atomic Zodiac',
  note: 'Every sign, drawn in one atomic-age style',
  pieces: [
    { slot: 'poster', alt: 'Leo lion poster', img: { src: leoPoster, width: 394, height: 534 } },
    { slot: 'stickers', alt: 'Leo sticker sheet', img: { src: leoStickers, width: 523, height: 705 } },
    { slot: 'tee', alt: 'Leo lion tee', img: { src: leoTee, width: 463, height: 556 } },
    { slot: 'mug', alt: 'Leo lion mug', img: { src: leoMug, width: 633, height: 537 } },
  ],
};

export const SHOP_DEPARTMENTS: ShopDepartment[] = [
  { id: 'posters', label: 'Posters', types: ['Posters'], backdrop: 'rays-mustard', img: { src: posters, width: 479, height: 621 } },
  { id: 'tees', label: 'T-shirts', types: ['T-Shirts'], backdrop: 'orbit-cream', img: { src: tees, width: 516, height: 616 } },
  { id: 'mugs', label: 'Mugs', types: ['Mugs'], backdrop: 'orbit-navy', img: { src: mugs, width: 460, height: 378 } },
  { id: 'totes', label: 'Tote bags', types: ['Tote Bags'], backdrop: 'rays-red', img: { src: totes, width: 432, height: 724 } },
  { id: 'stickers', label: 'Stickers', types: ['Stickers'], backdrop: 'rays-red', img: { src: stickers, width: 492, height: 649 } },
  { id: 'notebooks', label: 'Notebooks & journals', types: ['Notebooks'], backdrop: 'rays-mustard', img: { src: notebooks, width: 326, height: 544 } },
  { id: 'necklaces', label: 'Necklaces', types: ['Necklaces'], backdrop: 'orbit-cream', img: { src: necklaces, width: 595, height: 754 } },
  { id: 'books', label: 'Books', types: ['Books', 'Personalized Books'], backdrop: 'orbit-navy', img: { src: books, width: 491, height: 760 } },
];

/** Shop link for a department inside the Atomic Zodiac Collection. */
export const departmentHref = (d: Pick<ShopDepartment, 'types'>) => `/store?collection=atomic&type=${encodeURIComponent(d.types[0])}`;

/** Departments in the admin-chosen order (shop.layout); unknown ids are ignored, unlisted ones keep their default place after. */
export function orderDepartments(order: string[], list: ShopDepartment[] = SHOP_DEPARTMENTS): ShopDepartment[] {
  const rank = (id: string) => { const i = order.indexOf(id); return i < 0 ? order.length + list.findIndex(d => d.id === id) : i; };
  return [...list].sort((a, b) => rank(a.id) - rank(b.id));
}
