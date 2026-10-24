import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storefrontApiRequest, type ShopifyProduct } from '@/lib/shopify';

export interface CartItem {
  lineId: string | null;
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

type UserError = { field: string[] | null; message: string };

const CART_QUERY = `query cart($id: ID!) { cart(id: $id) { id totalQuantity } }`;
const LINES = `lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }`;
const CART_CREATE = `mutation cartCreate($input: CartInput!) { cartCreate(input: $input) { cart { id checkoutUrl ${LINES} } userErrors { field message } } }`;
const CART_ADD = `mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $cartId, lines: $lines) { cart { id ${LINES} } userErrors { field message } } }`;
const CART_UPDATE = `mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { id } userErrors { field message } } }`;
const CART_REMOVE = `mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) { cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { id } userErrors { field message } } }`;

export function formatCheckoutUrl(checkoutUrl: string): string {
  try { const url = new URL(checkoutUrl); url.searchParams.set('channel', 'online_store'); return url.toString(); } catch { return checkoutUrl; }
}
const notFound = (errs: UserError[]) => errs.some(e => /cart not found|does not exist/i.test(e.message));

async function createCart(item: CartItem) {
  const data = await storefrontApiRequest(CART_CREATE, { input: { lines: [{ quantity: item.quantity, merchandiseId: item.variantId }] } });
  if (data?.data?.cartCreate?.userErrors?.length) { console.error('Cart creation failed:', data.data.cartCreate.userErrors); return null; }
  const cart = data?.data?.cartCreate?.cart;
  const lineId = cart?.lines?.edges?.[0]?.node?.id;
  if (!cart?.checkoutUrl || !lineId) return null;
  return { cartId: cart.id as string, checkoutUrl: formatCheckoutUrl(cart.checkoutUrl), lineId: lineId as string };
}
async function addLine(cartId: string, item: CartItem) {
  const data = await storefrontApiRequest(CART_ADD, { cartId, lines: [{ quantity: item.quantity, merchandiseId: item.variantId }] });
  const errs: UserError[] = data?.data?.cartLinesAdd?.userErrors || [];
  if (notFound(errs)) return { success: false, cartNotFound: true };
  if (errs.length) return { success: false };
  const line = (data?.data?.cartLinesAdd?.cart?.lines?.edges || []).find((l: { node: { merchandise: { id: string } } }) => l.node.merchandise.id === item.variantId);
  return { success: true, lineId: line?.node?.id as string | undefined };
}
async function updateLine(cartId: string, lineId: string, quantity: number) {
  const data = await storefrontApiRequest(CART_UPDATE, { cartId, lines: [{ id: lineId, quantity }] });
  const errs: UserError[] = data?.data?.cartLinesUpdate?.userErrors || [];
  if (notFound(errs)) return { success: false, cartNotFound: true };
  return { success: errs.length === 0 };
}
async function removeLine(cartId: string, lineId: string) {
  const data = await storefrontApiRequest(CART_REMOVE, { cartId, lineIds: [lineId] });
  const errs: UserError[] = data?.data?.cartLinesRemove?.userErrors || [];
  if (notFound(errs)) return { success: false, cartNotFound: true };
  return { success: errs.length === 0 };
}

interface CartStore {
  items: CartItem[]; cartId: string | null; checkoutUrl: string | null; isLoading: boolean; isSyncing: boolean;
  addItem: (item: Omit<CartItem, 'lineId'>) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void; syncCart: () => Promise<void>; getCheckoutUrl: () => string | null;
}

export const useCartStore = create<CartStore>()(persist((set, get) => ({
  items: [], cartId: null, checkoutUrl: null, isLoading: false, isSyncing: false,
  addItem: async (item) => {
    const { items, cartId, clearCart } = get();
    const existing = items.find(i => i.variantId === item.variantId);
    set({ isLoading: true });
    try {
      if (!cartId) {
        const r = await createCart({ ...item, lineId: null });
        if (r) set({ cartId: r.cartId, checkoutUrl: r.checkoutUrl, items: [{ ...item, lineId: r.lineId }] });
      } else if (existing) {
        if (!existing.lineId) return;
        const q = existing.quantity + item.quantity;
        const r = await updateLine(cartId, existing.lineId, q);
        if (r.success) set({ items: get().items.map(i => i.variantId === item.variantId ? { ...i, quantity: q } : i) });
        else if (r.cartNotFound) clearCart();
      } else {
        const r = await addLine(cartId, { ...item, lineId: null });
        if (r.success) set({ items: [...get().items, { ...item, lineId: r.lineId ?? null }] });
        else if (r.cartNotFound) clearCart();
      }
    } catch (e) { console.error('Failed to add item:', e); } finally { set({ isLoading: false }); }
  },
  updateQuantity: async (variantId, quantity) => {
    if (quantity <= 0) return get().removeItem(variantId);
    const { items, cartId, clearCart } = get();
    const item = items.find(i => i.variantId === variantId);
    if (!item?.lineId || !cartId) return;
    set({ isLoading: true });
    try {
      const r = await updateLine(cartId, item.lineId, quantity);
      if (r.success) set({ items: get().items.map(i => i.variantId === variantId ? { ...i, quantity } : i) });
      else if (r.cartNotFound) clearCart();
    } catch (e) { console.error(e); } finally { set({ isLoading: false }); }
  },
  removeItem: async (variantId) => {
    const { items, cartId, clearCart } = get();
    const item = items.find(i => i.variantId === variantId);
    if (!item?.lineId || !cartId) return;
    set({ isLoading: true });
    try {
      const r = await removeLine(cartId, item.lineId);
      if (r.success) { const next = get().items.filter(i => i.variantId !== variantId); if (next.length) set({ items: next }); else clearCart(); }
      else if (r.cartNotFound) clearCart();
    } catch (e) { console.error(e); } finally { set({ isLoading: false }); }
  },
  clearCart: () => set({ items: [], cartId: null, checkoutUrl: null }),
  getCheckoutUrl: () => get().checkoutUrl,
  syncCart: async () => {
    const { cartId, isSyncing, clearCart } = get();
    if (!cartId || isSyncing) return;
    set({ isSyncing: true });
    try {
      const data = await storefrontApiRequest(CART_QUERY, { id: cartId });
      if (!data) return;
      const cart = data?.data?.cart;
      if (!cart || cart.totalQuantity === 0) clearCart();
    } catch (e) { console.error('Failed to sync cart:', e); } finally { set({ isSyncing: false }); }
  },
}), { name: 'shopify-cart', storage: createJSONStorage(() => localStorage), partialize: s => ({ items: s.items, cartId: s.cartId, checkoutUrl: s.checkoutUrl }) }));
