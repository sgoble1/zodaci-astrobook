import { describe, it, expect, vi, beforeEach } from 'vitest';

const calls: { query: string; vars: Record<string, unknown> }[] = [];
let responder: (query: string, vars: Record<string, unknown>) => unknown = () => ({});
vi.mock('@/lib/shopify', async (orig) => {
  const real = await orig<typeof import('@/lib/shopify')>();
  return { ...real, storefrontApiRequest: vi.fn(async (query: string, vars: Record<string, unknown>) => { calls.push({ query, vars }); const r = await responder(query, vars); if (r instanceof Error) throw r; return r; }) };
});
vi.mock('sonner', () => ({ toast: Object.assign(vi.fn(), { error: vi.fn(), info: vi.fn(), success: vi.fn() }) }));

import { reconcileItems, useCartStore, type CartItem, type RemoteLine } from './cartStore';
import { toast } from 'sonner';

const product = { node: { id: 'p1', title: 'Poster', description: '', handle: 'poster', priceRange: { minVariantPrice: { amount: '20.0', currencyCode: 'USD' } }, images: { edges: [] }, variants: { edges: [] }, options: [] } };
const item = (variantId = 'v1', quantity = 1): Omit<CartItem, 'lineId'> => ({ product, variantId, variantTitle: 'Default', price: { amount: '20.0', currencyCode: 'USD' }, quantity, selectedOptions: [] });
const lineNode = (id: string, variantId: string, quantity: number, amount = '20.0') => ({ node: { id, quantity, attributes: [], cost: { amountPerQuantity: { amount, currencyCode: 'USD' } }, merchandise: { id: variantId } } });
const cart = (field: string, lines: unknown[], id = 'cart-1') => ({ data: { [field]: { cart: { id, checkoutUrl: 'https://shop.example/c', lines: { pageInfo: { hasNextPage: false }, edges: lines } }, userErrors: [] } } });

beforeEach(() => { calls.length = 0; useCartStore.setState({ items: [], cartId: null, checkoutUrl: null, isLoading: false, isSyncing: false, lastError: null }); vi.mocked(toast.error).mockClear(); vi.mocked(toast.info).mockClear(); });

describe('reconcileItems', () => {
  const local = { ...item(), lineId: null } as CartItem;
  it('fills a missing line id and takes Shopify quantity and price', () => {
    const r = reconcileItems([local], [{ id: 'L1', variantId: 'v1', quantity: 3, attributes: [], price: { amount: '22.0', currencyCode: 'USD' } } as RemoteLine]);
    expect(r.items[0]).toMatchObject({ lineId: 'L1', quantity: 3, price: { amount: '22.0' } });
    expect(r.priceChanged).toBe(true);
  });
  it('drops items Shopify no longer has', () => {
    const r = reconcileItems([local], []);
    expect(r.items).toHaveLength(0);
    expect(r.dropped).toBe(1);
  });
});

describe('cart store', () => {
  it('tells the buyer and returns false when Shopify rejects an add', async () => {
    useCartStore.setState({ cartId: 'cart-1', items: [] });
    responder = () => ({ data: { cartLinesAdd: { cart: null, userErrors: [{ field: null, message: 'Only 0 left in stock.' }] } } });
    const ok = await useCartStore.getState().addItem(item());
    expect(ok).toBe(false);
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().lastError).toBe('Only 0 left in stock.');
  });

  it('recreates an expired cart with the existing items and repeats the add', async () => {
    useCartStore.setState({ cartId: 'old', items: [{ ...item('v1'), lineId: 'L1', key: 'v1' }] });
    responder = (q) => {
      if (q.includes('cartLinesAdd')) return calls.filter(c => c.query.includes('cartLinesAdd')).length === 1
        ? { data: { cartLinesAdd: { cart: null, userErrors: [{ field: null, message: 'The specified cart does not exist.' }] } } }
        : cart('cartLinesAdd', [lineNode('N1', 'v1', 1), lineNode('N2', 'v2', 1)], 'new');
      if (q.includes('cartCreate')) return cart('cartCreate', [lineNode('N1', 'v1', 1)], 'new');
      return {};
    };
    const ok = await useCartStore.getState().addItem(item('v2'));
    expect(ok).toBe(true);
    const s = useCartStore.getState();
    expect(s.cartId).toBe('new');
    expect(s.items.map(i => [i.variantId, i.lineId])).toEqual([['v1', 'N1'], ['v2', 'N2']]);
  });

  it('runs overlapping clicks one after another on fresh data', async () => {
    let qty = 1;
    useCartStore.setState({ cartId: 'cart-1', items: [{ ...item('v1'), lineId: 'L1', key: 'v1' }] });
    responder = async (q, vars) => {
      await new Promise(r => setTimeout(r, 5));
      if (q.includes('cartLinesUpdate')) { qty = (vars.lines as { quantity: number }[])[0].quantity; return cart('cartLinesUpdate', [lineNode('L1', 'v1', qty)]); }
      return {};
    };
    await Promise.all([useCartStore.getState().addItem(item('v1')), useCartStore.getState().addItem(item('v1'))]);
    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it('gives a saved line without a Shopify id its id before changing quantity', async () => {
    useCartStore.setState({ cartId: 'cart-1', items: [{ ...item('v1'), lineId: null, key: 'v1' }] });
    responder = (q) => {
      if (q.startsWith('query cart')) return { data: { cart: { id: 'cart-1', checkoutUrl: 'https://shop.example/c', lines: { pageInfo: { hasNextPage: false }, edges: [lineNode('L9', 'v1', 1)] } } } };
      if (q.includes('cartLinesUpdate')) return cart('cartLinesUpdate', [lineNode('L9', 'v1', 4)]);
      return {};
    };
    expect(await useCartStore.getState().updateQuantity('v1', 4)).toBe(true);
    expect(useCartStore.getState().items[0]).toMatchObject({ lineId: 'L9', quantity: 4 });
  });

  it('sync refreshes prices from Shopify and rebuilds an expired cart', async () => {
    useCartStore.setState({ cartId: 'cart-1', items: [{ ...item('v1'), lineId: 'L1', key: 'v1' }] });
    responder = () => ({ data: { cart: { id: 'cart-1', checkoutUrl: 'https://shop.example/c', lines: { pageInfo: { hasNextPage: false }, edges: [lineNode('L1', 'v1', 1, '25.0')] } } } });
    await useCartStore.getState().syncCart();
    expect(useCartStore.getState().items[0].price.amount).toBe('25.0');
    expect(toast.info).toHaveBeenCalled();

    responder = (q) => q.includes('cartCreate') ? cart('cartCreate', [lineNode('R1', 'v1', 1, '25.0')], 'rebuilt') : { data: { cart: null } };
    await useCartStore.getState().syncCart();
    expect(useCartStore.getState().cartId).toBe('rebuilt');
    expect(useCartStore.getState().items).toHaveLength(1);
  });
});
