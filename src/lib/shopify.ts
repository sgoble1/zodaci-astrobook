export const SHOPIFY_API_VERSION = '2026-10';
export const SHOPIFY_STORE_PERMANENT_DOMAIN = 'zodaci-astrobook-e3648-srr1g6qe.myshopify.com';
export const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
export const SHOPIFY_STOREFRONT_TOKEN = 'c01053a374f63c388088f3af943e9680';

export interface ShopifyProduct {
  node: {
    id: string; title: string; description: string; handle: string; productType?: string; availableForSale?: boolean; createdAt?: string; tags?: string[];
    priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
    images: { edges: Array<{ node: { url: string; altText: string | null } }> };
    variants: { edges: Array<{ node: { id: string; title: string; price: { amount: string; currencyCode: string }; availableForSale: boolean; selectedOptions: Array<{ name: string; value: string }> } }> };
    options: Array<{ name: string; values: string[] }>;
  };
}

const PRODUCT_FIELDS = `id title description handle productType availableForSale createdAt tags
  priceRange { minVariantPrice { amount currencyCode } }
  images(first: 10) { edges { node { url altText } } }
  variants(first: 100) { pageInfo { hasNextPage endCursor } edges { node { id title price { amount currencyCode } availableForSale selectedOptions { name value } } } }
  options { name values }`;

export const PRODUCTS_QUERY = `query GetProducts($first: Int!, $query: String, $after: String) { products(first: $first, query: $query, after: $after) { pageInfo { hasNextPage endCursor } edges { node { ${PRODUCT_FIELDS} } } } }`;

const VARIANT_NODE = 'id title price { amount currencyCode } availableForSale selectedOptions { name value }';
export const VARIANTS_PAGE_QUERY = `query MoreVariants($id: ID!, $after: String) { product(id: $id) { variants(first: 250, after: $after) { pageInfo { hasNextPage endCursor } edges { node { ${VARIANT_NODE} } } } } }`;
/** Safety cap on variant paging per product (250 per page). */
export const VARIANT_PAGE_LIMIT = 20;

/** Reads the remaining variant pages of a product with more than 100 variants; returns false if the cap stopped it. */
export async function completeVariants(p: ShopifyProduct, request: typeof storefrontApiRequest = storefrontApiRequest): Promise<boolean> {
  const v = p.node.variants as ShopifyProduct['node']['variants'] & { pageInfo?: { hasNextPage?: boolean; endCursor?: string | null } };
  const seen = new Set(v.edges.map(e => e.node.id));
  let info = v.pageInfo;
  for (let page = 0; info?.hasNextPage; page++) {
    if (page >= VARIANT_PAGE_LIMIT) return false;
    const d = await request(VARIANTS_PAGE_QUERY, { id: p.node.id, after: info.endCursor ?? null });
    const conn = d?.data?.product?.variants;
    if (!conn) throw new ShopUnavailableError();
    for (const e of conn.edges) if (!seen.has(e.node.id)) { seen.add(e.node.id); v.edges.push(e); }
    info = conn.pageInfo;
  }
  v.pageInfo = { hasNextPage: false, endCursor: null };
  return true;
}

/** What a buyer sees when the shop can't load. Owner-facing billing/plan detail is only shown in Admin (shopAdminDetail). */
export const SHOP_UNAVAILABLE_MESSAGE = 'The shop is unavailable right now. Please try again in a few minutes.';

export type ShopFailure = 'billing' | 'network' | 'timeout' | 'throttled' | 'error';
/** Raised when the shop can't be reached (plan lapsed, network, timeout or Shopify error) so pages can show a calm message. */
export class ShopUnavailableError extends Error {
  constructor(message = SHOP_UNAVAILABLE_MESSAGE, readonly reason: ShopFailure = 'error', readonly status?: number) { super(message); this.name = 'ShopUnavailableError'; }
}

/** Admin-only explanation of a shop failure (buyers always get SHOP_UNAVAILABLE_MESSAGE). */
export function shopAdminDetail(e: unknown): string {
  if (!(e instanceof ShopUnavailableError)) return `Shopify returned an error: ${(e as Error)?.message ?? 'unknown'}.`;
  switch (e.reason) {
    case 'billing': return 'Shopify answered 402 Payment required: the store needs an active Shopify plan before buyers can shop. Check billing at admin.shopify.com.';
    case 'timeout': return 'Shopify did not answer within the time limit after retrying. It may be a short outage; refresh in a minute.';
    case 'throttled': return 'Shopify is limiting requests right now (rate limit). Refresh in a minute.';
    case 'network': return 'The browser could not reach Shopify (network error).';
    default: return `Shopify returned an error${e.status ? ` (HTTP ${e.status})` : ''}: ${e.message}`;
  }
}

/** Safety cap on catalog paging (100 per page). Hitting it is reported as truncated, never silently. */
export const CATALOG_PAGE_LIMIT = 50;

/** Every product in the shop, page by page; `truncated` is true if the safety cap stopped paging or a product has more variants than were read. */
export async function fetchCatalog(): Promise<{ products: ShopifyProduct[]; truncated: boolean }> {
  const out: ShopifyProduct[] = []; let after: string | null = null; let truncated = false;
  for (let page = 0; ; page++) {
    if (page >= CATALOG_PAGE_LIMIT) { truncated = true; break; }
    const d = await storefrontApiRequest(PRODUCTS_QUERY, { first: 100, after });
    const conn = d?.data?.products;
    if (!conn) throw new ShopUnavailableError();
    out.push(...conn.edges);
    if (!conn.pageInfo?.hasNextPage) break;
    after = conn.pageInfo.endCursor;
  }
  for (const p of out) if ((p.node.variants as { pageInfo?: { hasNextPage?: boolean } }).pageInfo?.hasNextPage && !(await completeVariants(p))) truncated = true;
  if (truncated) console.warn('Shop catalog was read only in part (paging safety cap reached).');
  return { products: out, truncated };
}
/** Shopify is the catalog's source of truth; the shop reuses one read for 15 minutes so pages stay quick and edits in Shopify appear soon after. */
export const CATALOG_CACHE_MS = 15 * 60 * 1000;
let catalogCache: { at: number; p: Promise<ShopifyProduct[]> } | null = null;
export const fetchAllProducts = (now = Date.now()): Promise<ShopifyProduct[]> => {
  if (catalogCache && now - catalogCache.at < CATALOG_CACHE_MS) return catalogCache.p;
  const p = fetchCatalog().then(c => c.products);
  catalogCache = { at: now, p };
  p.catch(() => { if (catalogCache?.p === p) catalogCache = null; });
  return p;
};

/** True when at least one variant can be bought. */
export const inStock = (p: ShopifyProduct) => p.node.availableForSale ?? p.node.variants.edges.some(e => e.node.availableForSale);
export const PRODUCT_BY_HANDLE_QUERY = `query GetProduct($handle: String!) { product(handle: $handle) { ${PRODUCT_FIELDS} } }`;

export const SHOP_TIMEOUT_MS = 12000;
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const isMutation = (q: string) => /^\s*mutation\b/.test(q);

/**
 * One Storefront API call with a timeout. Reads retry up to twice on network errors, timeouts, 429 and 5xx (short backoff);
 * cart mutations never retry automatically, so a slow "add" can't be applied twice. Failures throw ShopUnavailableError.
 */
export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}, opts: { timeoutMs?: number; retries?: number } = {}) {
  const retries = opts.retries ?? (isMutation(query) ? 0 : 2);
  const timeoutMs = opts.timeoutMs ?? SHOP_TIMEOUT_MS;
  let last: ShopUnavailableError = new ShopUnavailableError();
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt) await sleep(400 * 2 ** (attempt - 1));
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    let response: Response;
    try {
      response = await fetch(SHOPIFY_STOREFRONT_URL, {
        method: 'POST', signal: ctrl.signal,
        headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN },
        body: JSON.stringify({ query, variables }),
      });
    } catch (e) {
      clearTimeout(timer);
      last = new ShopUnavailableError(SHOP_UNAVAILABLE_MESSAGE, (e as Error)?.name === 'AbortError' ? 'timeout' : 'network');
      continue;
    }
    clearTimeout(timer);
    if (response.status === 402) throw new ShopUnavailableError(SHOP_UNAVAILABLE_MESSAGE, 'billing', 402);
    if (response.status === 429 || response.status >= 500) { last = new ShopUnavailableError(SHOP_UNAVAILABLE_MESSAGE, response.status === 429 ? 'throttled' : 'error', response.status); continue; }
    if (!response.ok) throw new ShopUnavailableError(SHOP_UNAVAILABLE_MESSAGE, 'error', response.status);
    const data = await response.json();
    if (data.errors) {
      const throttled = data.errors.some((e: { extensions?: { code?: string } }) => e.extensions?.code === 'THROTTLED');
      last = new ShopUnavailableError(SHOP_UNAVAILABLE_MESSAGE, throttled ? 'throttled' : 'error');
      if (throttled) continue;
      console.error('Shopify error:', data.errors.map((e: { message: string }) => e.message).join(', '));
      throw last;
    }
    return data;
  }
  throw last;
}

export const formatMoney = (p: { amount: string; currencyCode: string }) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: p.currencyCode }).format(parseFloat(p.amount));
