/** Group catalog types without replacing their original names or collection tags. */
export const SHOP_DEPARTMENTS = [
  { id: 'books', name: 'Books & comics', pattern: /book|comic|reading|pdf/i },
  { id: 'stickers', name: 'Stickers & small gifts', pattern: /sticker|pin|magnet|patch|keychain|keyring/i },
  { id: 'bags', name: 'Bags & accessories', pattern: /bag|tote|backpack|pouch|wallet|hat|cap|scarf|accessor/i },
  { id: 'clothing', name: 'Clothing', pattern: /shirt|tee|hoodie|sweat|jacket|tank|dress|legging|sock|apparel|clothing/i },
  { id: 'home', name: 'Home & drinkware', pattern: /mug|cup|bottle|tumbler|pillow|blanket|towel|coaster|candle|home|drink/i },
  { id: 'paper', name: 'Prints & stationery', pattern: /poster|print|canvas|notebook|journal|planner|card|stationery|art/i },
  { id: 'other', name: 'Other goods', pattern: /./ },
] as const;
export function departmentFor(type: string): string {
  return SHOP_DEPARTMENTS.find(d => d.pattern.test(type))?.id ?? 'other';
}
export function matchesShopType(type: string, selected: string): boolean {
  return selected === 'All' || (selected.startsWith('dept:') ? departmentFor(type) === selected.slice(5) : type === selected);
}
export function shopFilterLabel(selected: string): string {
  return SHOP_DEPARTMENTS.find(d => `dept:${d.id}` === selected)?.name ?? selected;
}