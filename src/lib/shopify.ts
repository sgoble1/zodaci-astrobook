import { toast } from 'sonner';

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
  variants(first: 20) { edges { node { id title price { amount currencyCode } availableForSale selectedOptions { name value } } } }
  options { name values }`;

export const PRODUCTS_QUERY = `query GetProducts($first: Int!, $query: String, $after: String) { products(first: $first, query: $query, after: $after) { pageInfo { hasNextPage endCursor } edges { node { ${PRODUCT_FIELDS} } } } }`;

/** Raised when the shop can't be reached (plan lapsed, network, or Shopify error) so pages can show a calm message. */
export class ShopUnavailableError extends Error {}

/** Every product in the shop, page by page (no 50-item ceiling). Stops after 20 pages as a safety net. */
export async function fetchAllProducts(): Promise<ShopifyProduct[]> {
  const out: ShopifyProduct[] = []; let after: string | null = null;
  for (let page = 0; page < 20; page++) {
    const d = await storefrontApiRequest(PRODUCTS_QUERY, { first: 100, after });
    const conn = d?.data?.products;
    if (!conn) throw new ShopUnavailableError('The shop is unavailable');
    out.push(...conn.edges);
    if (!conn.pageInfo?.hasNextPage) break;
    after = conn.pageInfo.endCursor;
  }
  return out;
}

/** True when at least one variant can be bought. */
export const inStock = (p: ShopifyProduct) => p.node.availableForSale ?? p.node.variants.edges.some(e => e.node.availableForSale);
export const PRODUCT_BY_HANDLE_QUERY = `query GetProduct($handle: String!) { product(handle: $handle) { ${PRODUCT_FIELDS} } }`;

export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  if (response.status === 402) {
    toast.error('Shopify: Payment required', { description: 'The shop needs an active Shopify plan before it can load. Visit admin.shopify.com to upgrade.' });
    return;
  }
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  if (data.errors) throw new Error(`Error calling Shopify: ${data.errors.map((e: { message: string }) => e.message).join(', ')}`);
  return data;
}

export const formatMoney = (p: { amount: string; currencyCode: string }) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: p.currencyCode }).format(parseFloat(p.amount));
