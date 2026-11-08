const SIGN_WORDS = /aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces/;

export type ShopPresentationProduct = {
  title: string;
  productType?: string;
  tags?: string[];
  createdAt?: string;
};

/** Catalog tags are authoritative: several Atomic Zodiac books do not repeat the collection in their title. */
export function isAtomicZodiac(p: Pick<ShopPresentationProduct, 'title' | 'tags'>): boolean {
  return (p.tags ?? []).some(t => t.trim().toLowerCase() === 'atomic zodiac') || /atomic zodiac/i.test(p.title);
}

/** Featured merchandising order; explicit price/name sorts may override it. */
export function productPriority(title: string, type = '', tags: string[] = []): number {
  const text = `${title} ${type}`.toLowerCase();
  if (/astro\s*book|astro\s*comic/.test(text)) return 0;
  if (isAtomicZodiac({ title, tags })) return 1;
  if (/sticker/.test(text) && (/atomic|zodiac/.test(text) || SIGN_WORDS.test(text))) return 2;
  if (/\bbags?\b|\btotes?\b|backpack/.test(text)) return 3;
  return 4;
}

/** Shelf headings in featured order; the rest of the catalog follows by department. */
export const PRIORITY_SHELVES = [
  { priority: 0, title: 'AstroBooks & AstroComics', script: 'Your chart, bound and illustrated' },
  { priority: 1, title: 'The Atomic Zodiac Collection', script: 'Mid-century skies, collected for every sign' },
  { priority: 2, title: 'Zodiac stickers', script: 'Stick your sign on everything' },
  { priority: 3, title: 'Totes & bags', script: 'Carry the sky with you' },
] as const;

/**
 * Curator's display order for Atomic Zodiac: illustrated gallery pieces first, then small
 * collectibles and usable editions. Packaging-only concepts follow the illustrated products.
 * Newest catalog additions lead inside each visual group.
 */
export function atomicAestheticRank(title: string, type = ''): number {
  const text = `${title} ${type}`.toLowerCase();
  if (/packaging|gift wrap|gift box/.test(text)) return 90;
  if (/metal print|canvas|framed|poster|wall decal|\bprint\b|star chart/.test(text)) return 0;
  if (/sticker/.test(text)) return 10;
  if (/book|notebook|journal|almanac|oracle|tarot/.test(text)) return 20;
  if (/bag|tote|backpack|pouch|fanny/.test(text)) return 30;
  if (/tee|shirt|sweatshirt|headband/.test(text)) return 40;
  if (/mug/.test(text)) return 50;
  if (/rug|blanket|towel|pillow|lamp|mousepad/.test(text)) return 60;
  return 70;
}

export function compareAtomicAesthetic(a: ShopPresentationProduct, b: ShopPresentationProduct): number {
  return atomicAestheticRank(a.title, a.productType) - atomicAestheticRank(b.title, b.productType)
    || (b.createdAt ?? '').localeCompare(a.createdAt ?? '')
    || a.title.localeCompare(b.title);
}

/** Books and comics are shown in a portrait frame; everything else stays square. */
export const isPortraitProduct = (title: string, type = '', tags: string[] = []) => productPriority(title, type, tags) === 0;

/** Smallest positive issue not represented by the owner's confirmed orders. */
export function nextUnorderedIssue(ordered: number[]): number {
  const existing = new Set(ordered.filter(n => Number.isInteger(n) && n > 0));
  let next = 1;
  while (existing.has(next)) next += 1;
  return next;
}

/**
 * How the shop names the AstroComic issue card. Signed-out visitors see just "Issue #1" (every
 * buyer's first issue is their own, never the demo story). Signed-in buyers with confirmed
 * issues are pointed at the next issue they have not ordered.
 */
export function comicIssueTitle(opts: { signedIn: boolean; purchased: boolean; next: number }): { title: string; note: string } {
  if (!opts.signedIn) return { title: 'Issue #1', note: 'Your first issue, drawn from your own chart' };
  if (opts.purchased) return { title: `Issue #${opts.next}`, note: 'The next issue you haven’t ordered yet' };
  return { title: 'Issue #1', note: 'Your first issue, drawn from your own chart' };
}

/**
 * Product titles shown in the shop. The issue-one comic listing reads simply "AstroComic Issue #1"
 * (no demo story name, since each buyer's first issue is drawn from their own chart); a pre-order
 * note moves to a badge. Every other product keeps its catalog title.
 */
export function shopTitle(title: string, type = ''): { title: string; badge?: string } {
  if (!(/astro\s*comic/i.test(`${title} ${type}`) && /issue\s*#?\s*1\b/i.test(title))) return { title };
  return { title: 'AstroComic Issue #1', badge: /pre-?order/i.test(title) ? 'Pre-order' : undefined };
}

export type ChartSigns = { sun: string; moon?: string | null; rising?: string | null };
export type SignPick<T> = { product: T; role: 'Sun' | 'Moon' | 'Rising'; sign: string };

/** Whole-word sign match on catalog tags first, then the title (so "Leo" never matches "Leopard"). */
export function productSign<T extends ShopPresentationProduct>(p: T, sign: string): boolean {
  const word = new RegExp(`\\b${sign}\\b`, 'i');
  return (p.tags ?? []).some(t => t.trim().toLowerCase() === sign.toLowerCase()) || word.test(p.title);
}

/**
 * Up to `max` shop products for a member's own calculated signs: one for the Sun first, then the Moon, then the
 * Rising sign (only passed when the birth time is known), then more Sun picks to fill. Atomic Zodiac pieces lead,
 * in the curator's visual order; a product is never picked twice. Signs come only from the chart.
 */
export function signPicks<T extends ShopPresentationProduct>(products: T[], signs: ChartSigns, max = 3): SignPick<T>[] {
  const order: [SignPick<T>['role'], string | null | undefined][] = [['Sun', signs.sun], ['Moon', signs.moon], ['Rising', signs.rising]];
  const ranked = (sign: string) => products.filter(p => productSign(p, sign))
    .sort((a, b) => Number(isAtomicZodiac(b)) - Number(isAtomicZodiac(a)) || compareAtomicAesthetic(a, b));
  const used = new Set<T>(); const out: SignPick<T>[] = [];
  const take = (role: SignPick<T>['role'], sign: string) => { const p = ranked(sign).find(x => !used.has(x)); if (p) { used.add(p); out.push({ product: p, role, sign }); } };
  for (const [role, sign] of order) if (sign && out.length < max) take(role, sign);
  while (out.length < max) { const before = out.length; take('Sun', signs.sun); if (out.length === before) break; }
  return out;
}
