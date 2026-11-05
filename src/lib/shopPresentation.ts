/** Featured merchandising order; explicit price/name sorts may override it. */
export function productPriority(title: string, type = ''): number {
  const text = `${title} ${type}`.toLowerCase();
  if (/astro\s*book|astro\s*comic/.test(text)) return 0;
  if (/atomic/.test(text) && /zodiac/.test(text) && /sticker/.test(text)) return 1;
  if (/\bbags?\b|\btotes?\b|backpack/.test(text)) return 2;
  return 3;
}

/** Smallest positive issue not represented by the owner's confirmed orders. */
export function nextUnorderedIssue(ordered: number[]): number {
  const existing = new Set(ordered.filter(n => Number.isInteger(n) && n > 0));
  let next = 1;
  while (existing.has(next)) next += 1;
  return next;
}