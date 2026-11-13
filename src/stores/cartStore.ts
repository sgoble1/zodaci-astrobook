import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';
import { storefrontApiRequest, SHOP_UNAVAILABLE_MESSAGE, type ShopifyProduct } from '@/lib/shopify';
import { lineKey, sameAttributes, type CartAttribute } from '@/lib/shopifyCart';

export interface CartItem {
  lineId: string | null;
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
  /** Fulfilment details for personalised items (see lib/shopifyCart). */
  attributes?: CartAttribute[];
  /** Cart identity: variant plus attributes. Older saved carts fall back to the variant id. */
  key?: string;
}

export const keyOf = (i: Pick<CartItem, 'key' | 'variantId' | 'attributes'>) => i.key ?? lineKey(i.variantId, i.attributes);

type UserError = { field: string[] | null; message: string };
/** One line as Shopify reports it (current quantity and price). */
export type RemoteLine = { id: string; quantity: number; attributes?: CartAttribute[]; variantId: string; price?: { amount: string; currencyCode: string } };

const LINE_FIELDS = `id quantity attributes { key value } cost { amountPerQuantity { amount currencyCode } } merchandise { ... on ProductVariant { id } }`;
const LINES = `lines(first: 100) { pageInfo { hasNextPage endCursor } edges { node { ${LINE_FIELDS} } } }`;
const CART_LINES_QUERY = `query cart($id: ID!, $after: String) { cart(id: $id) { id checkoutUrl lines(first: 100, after: $after) { pageInfo { hasNextPage endCursor } edges { node { ${LINE_FIELDS} } } } } }`;
const CART_CREATE = `mutation cartCreate($input: CartInput!) { cartCreate(input: $input) { cart { id checkoutUrl ${LINES} } userErrors { field message } } }`;
const CART_ADD = `mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $cartId, lines: $lines) { cart { id ${LINES} } userErrors { field message } } }`;
const CART_UPDATE = `mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { id ${LINES} } userErrors { field message } } }`;
const CART_REMOVE = `mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) { cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { id ${LINES} } userErrors { field message } } }`;

export function formatCheckoutUrl(checkoutUrl: string): string {
  try { const url = new URL(checkoutUrl); url.searchParams.set('channel', 'online_store'); return url.toString(); } catch { return checkoutUrl; }
}
const lineInput = (item: Pick<CartItem, 'quantity' | 'variantId' | 'attributes'>) => ({ quantity: item.quantity, merchandiseId: item.variantId, ...(item.attributes?.length ? { attributes: item.attributes } : {}) });
type LineNode = { node: { id: string; quantity: number; attributes?: CartAttribute[]; cost?: { amountPerQuantity?: { amount: string; currencyCode: string } }; merchandise: { id: string } } };
type LineConn = { pageInfo?: { hasNextPage?: boolean; endCursor?: string | null }; edges?: LineNode[] };
const toRemote = (l: LineNode): RemoteLine => ({ id: l.node.id, quantity: l.node.quantity, attributes: l.node.attributes ?? [], variantId: l.node.merchandise?.id, price: l.node.cost?.amountPerQuantity });
const notFound = (errs: UserError[]) => errs.some(e => /cart not found|does not exist/i.test(e.message));

/** A cart action that Shopify refused or that could not reach Shopify. `expired` means the cart itself is gone. */
export class CartError extends Error { constructor(message: string, readonly expired = false) { super(message); this.name = 'CartError'; } }

/**
 * Matches local basket items to Shopify's lines (same variant + same attributes): fills missing line IDs, takes Shopify's
 * quantity and current price, and drops items Shopify no longer has. Pure, so it is tested directly.
 */
export function reconcileItems(items: CartItem[], lines: RemoteLine[]): { items: CartItem[]; priceChanged: boolean; dropped: number } {
  const used = new Set<string>(); let priceChanged = false; let dropped = 0;
  const out: CartItem[] = [];
  for (const item of items) {
    const line = lines.find(l => !used.has(l.id) && (l.id === item.lineId || (l.variantId === item.variantId && sameAttributes(l.attributes, item.attributes))));
    if (!line) { dropped++; continue; }
    used.add(line.id);
    const price = line.price ?? item.price;
    if (line.price && (line.price.amount !== item.price.amount || line.price.currencyCode !== item.price.currencyCode)) priceChanged = true;
    out.push({ ...item, key: keyOf(item), lineId: line.id, quantity: line.quantity, price });
  }
  return { items: out, priceChanged, dropped };
}

async function readAllLines(first: LineConn | undefined, cartId: string): Promise<RemoteLine[]> {
  const lines = (first?.edges ?? []).map(toRemote);
  let page = first?.pageInfo; let guard = 0;
  while (page?.hasNextPage && guard++ < 20) {
    const d = await storefrontApiRequest(CART_LINES_QUERY, { id: cartId, after: page.endCursor });
    const conn: LineConn | undefined = d?.data?.cart?.lines;
    if (!conn) break;
    lines.push(...(conn.edges ?? []).map(toRemote));
    page = conn.pageInfo;
  }
  return lines;
}

/** Current lines of a cart, or null when Shopify no longer has the cart (expired or completed). */
export async function fetchCartLines(cartId: string): Promise<{ checkoutUrl: string; lines: RemoteLine[] } | null> {
  const d = await storefrontApiRequest(CART_LINES_QUERY, { id: cartId });
  const cart = d?.data?.cart;
  if (!cart) return null;
  return { checkoutUrl: formatCheckoutUrl(cart.checkoutUrl), lines: await readAllLines(cart.lines, cartId) };
}

async function mutate(query: string, vars: Record<string, unknown>, field: string, cartId?: string): Promise<{ cartId: string; checkoutUrl?: string; lines: RemoteLine[] }> {
  const data = await storefrontApiRequest(query, vars);
  const payload = data?.data?.[field];
  const errs: UserError[] = payload?.userErrors ?? [];
  if (notFound(errs)) throw new CartError('Your basket expired.', true);
  if (errs.length) throw new CartError(errs.map(e => e.message).join(' '));
  const cart = payload?.cart;
  if (!cart?.id) throw new CartError(SHOP_UNAVAILABLE_MESSAGE);
  return { cartId: cart.id, checkoutUrl: cart.checkoutUrl ? formatCheckoutUrl(cart.checkoutUrl) : undefined, lines: await readAllLines(cart.lines, cartId ?? cart.id) };
}

const createCart = (items: CartItem[]) => mutate(CART_CREATE, { input: { lines: items.map(lineInput) } }, 'cartCreate');

interface CartStore {
  items: CartItem[]; cartId: string | null; checkoutUrl: string | null; isLoading: boolean; isSyncing: boolean;
  /** Last failed action, for the basket's own retry button. */
  lastError: string | null;
  /** Resolves true when Shopify accepted the change; on failure the buyer has already been told (with a retry). */
  addItem: (item: Omit<CartItem, 'lineId'>) => Promise<boolean>;
  /** Lines are addressed by keyOf(item), so the same variant made for two people stays separate. */
  updateQuantity: (key: string, quantity: number) => Promise<boolean>;
  removeItem: (key: string) => Promise<boolean>;
  clearCart: () => void; syncCart: () => Promise<void>; getCheckoutUrl: () => string | null;
}

/** Cart actions run one at a time, each reading the store fresh, so overlapping clicks never act on stale lines. */
let queue: Promise<unknown> = Promise.resolve();
const enqueue = <T,>(fn: () => Promise<T>): Promise<T> => { const run = queue.then(fn, fn); queue = run.catch(() => undefined); return run; };

const friendly = (e: unknown) => e instanceof CartError && !e.expired ? e.message : SHOP_UNAVAILABLE_MESSAGE;

export const useCartStore = create<CartStore>()(persist((set, get) => {
  /** Applies Shopify's answer to the local basket. */
  const apply = (r: { cartId: string; checkoutUrl?: string; lines: RemoteLine[] }, extra: CartItem[] = []) => {
    const base = [...get().items, ...extra];
    const { items, priceChanged } = reconcileItems(base, r.lines);
    set({ cartId: r.cartId, checkoutUrl: r.checkoutUrl ?? get().checkoutUrl, items, lastError: null });
    if (priceChanged) toast.info('Prices in your basket were updated to match the shop.');
    if (!items.length) set({ cartId: null, checkoutUrl: null });
  };

  /** Rebuilds an expired cart from what the buyer has, then lets the action continue on the new cart. */
  const recreate = async (items: CartItem[]) => {
    if (!items.length) { set({ items: [], cartId: null, checkoutUrl: null }); return null; }
    const r = await createCart(items);
    set({ cartId: r.cartId, checkoutUrl: r.checkoutUrl ?? null });
    const { items: next } = reconcileItems(items, r.lines);
    set({ items: next });
    return r;
  };

  /** Runs one action; on an expired cart it recreates the cart and tries once more; failures tell the buyer with a retry. */
  const run = (label: string, action: () => Promise<void>, retry: () => Promise<boolean>) => enqueue(async (): Promise<boolean> => {
    set({ isLoading: true });
    try {
      try { await action(); return true; }
      catch (e) {
        if (!(e instanceof CartError && e.expired)) throw e;
        await recreate(get().items);
        await action();
        return true;
      }
    } catch (e) {
      console.error(`Cart ${label} failed:`, e);
      const message = friendly(e);
      set({ lastError: message });
      toast.error(`Couldn't ${label}`, { description: message, action: { label: 'Try again', onClick: () => void retry() } });
      return false;
    } finally { set({ isLoading: false }); }
  });

  /** Gives a line its Shopify ID when an older saved basket lost it. */
  const ensureLineId = async (key: string): Promise<CartItem | undefined> => {
    const item = get().items.find(i => keyOf(i) === key);
    if (!item || item.lineId) return item;
    const cartId = get().cartId;
    if (!cartId) return item;
    const remote = await fetchCartLines(cartId);
    if (!remote) throw new CartError('Your basket expired.', true);
    const line = remote.lines.find(l => l.variantId === item.variantId && sameAttributes(l.attributes, item.attributes));
    if (!line) {
      // Not in Shopify's cart at all: add it back so the basket and checkout match again.
      const r = await mutate(CART_ADD, { cartId, lines: [lineInput(item)] }, 'cartLinesAdd', cartId);
      apply(r);
    } else set({ items: get().items.map(i => keyOf(i) === key ? { ...i, lineId: line.id } : i) });
    return get().items.find(i => keyOf(i) === key);
  };

  const store: CartStore = {
    items: [], cartId: null, checkoutUrl: null, isLoading: false, isSyncing: false, lastError: null,
    addItem: (item) => run('add this to your basket', async () => {
      const key = lineKey(item.variantId, item.attributes);
      const fresh: CartItem = { ...item, key, lineId: null };
      const { cartId, items } = get();
      if (!cartId) { const r = await createCart([...items, fresh]); set({ cartId: r.cartId, checkoutUrl: r.checkoutUrl ?? null }); apply(r, [fresh]); return; }
      const existing = items.find(i => keyOf(i) === key);
      if (existing) {
        const withId = await ensureLineId(key);
        const cid = get().cartId!;
        if (!withId?.lineId) throw new CartError(SHOP_UNAVAILABLE_MESSAGE);
        apply(await mutate(CART_UPDATE, { cartId: cid, lines: [{ id: withId.lineId, quantity: withId.quantity + item.quantity }] }, 'cartLinesUpdate', cid));
      } else {
        apply(await mutate(CART_ADD, { cartId, lines: [lineInput(fresh)] }, 'cartLinesAdd', cartId), [fresh]);
      }
    }, () => get().addItem(item)),
    updateQuantity: (key, quantity) => {
      if (quantity <= 0) return get().removeItem(key);
      return run('change the quantity', async () => {
        const item = await ensureLineId(key);
        const cartId = get().cartId;
        if (!item || !cartId) return;
        if (!item.lineId) throw new CartError(SHOP_UNAVAILABLE_MESSAGE);
        apply(await mutate(CART_UPDATE, { cartId, lines: [{ id: item.lineId, quantity }] }, 'cartLinesUpdate', cartId));
      }, () => get().updateQuantity(key, quantity));
    },
    removeItem: (key) => run('remove this item', async () => {
      const cartId = get().cartId;
      const item = get().items.find(i => keyOf(i) === key);
      if (!item) return;
      if (!cartId) { set({ items: get().items.filter(i => keyOf(i) !== key) }); return; }
      const withId = await ensureLineId(key);
      if (!withId?.lineId) { set({ items: get().items.filter(i => keyOf(i) !== key) }); return; }
      apply(await mutate(CART_REMOVE, { cartId, lineIds: [withId.lineId] }, 'cartLinesRemove', cartId));
    }, () => get().removeItem(key)),
    clearCart: () => set({ items: [], cartId: null, checkoutUrl: null, lastError: null }),
    getCheckoutUrl: () => get().checkoutUrl,
    /** Refreshes lines, quantities and prices from Shopify; an expired cart is rebuilt from the buyer's items. */
    syncCart: () => {
      if (!get().cartId || get().isSyncing) return Promise.resolve();
      set({ isSyncing: true });
      return enqueue(async () => {
        try {
          const cartId = get().cartId;
          if (!cartId) return;
          const remote = await fetchCartLines(cartId);
          if (!remote) { await recreate(get().items); return; }
          apply({ cartId, checkoutUrl: remote.checkoutUrl, lines: remote.lines });
        } catch (e) { console.error('Failed to sync cart:', e); } finally { set({ isSyncing: false }); }
      });
    },
  };
  return store;
}, { name: 'shopify-cart', storage: createJSONStorage(() => localStorage), partialize: s => ({ items: s.items, cartId: s.cartId, checkoutUrl: s.checkoutUrl }) }));
