import { describe, it, expect } from 'vitest';
import { completeVariants, type ShopifyProduct } from './shopify';

const v = (id: string) => ({ node: { id, title: id, price: { amount: '1', currencyCode: 'USD' }, availableForSale: true, selectedOptions: [] } });
const product = (): ShopifyProduct => ({ node: { id: 'p1', title: 'AstroBook', description: '', handle: 'a', priceRange: { minVariantPrice: { amount: '1', currencyCode: 'USD' } }, images: { edges: [] }, options: [],
  variants: { edges: Array.from({ length: 100 }, (_, i) => v(`v${i}`)), pageInfo: { hasNextPage: true, endCursor: 'c1' } } as never } });

describe('variant paging', () => {
  it('reads every variant past the first 100 (360-variant product)', async () => {
    const p = product();
    const pages: Record<string, { edges: ReturnType<typeof v>[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } }> = {
      c1: { edges: Array.from({ length: 250 }, (_, i) => v(`v${100 + i}`)), pageInfo: { hasNextPage: true, endCursor: 'c2' } },
      c2: { edges: [...Array.from({ length: 10 }, (_, i) => v(`v${350 + i}`)), v('v0')], pageInfo: { hasNextPage: false, endCursor: null } },
    };
    const ok = await completeVariants(p, (async (_q: string, vars: Record<string, unknown>) => ({ data: { product: { variants: pages[vars.after as string] } } })) as never);
    expect(ok).toBe(true);
    expect(p.node.variants.edges).toHaveLength(360);
  });
});
