/** Temporary storefront visibility only; Shopify catalog and existing orders stay intact. */
export function isPublication(node: { title: string; productType?: string | null }): boolean {
  const text = `${node.title} ${node.productType ?? ''}`;
  if (/\b(stickers?|posters?|notebooks?|journals?|tees?|t-shirts?|mugs?|totes?|bags?|certificates?|scrolls?|stationery|clothing)\b/i.test(text)) return false;
  return /\b(astro\s*books?|astro\s*comics?|books?|comics?)\b/i.test(text);
}