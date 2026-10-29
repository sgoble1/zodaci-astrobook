import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PrintPartnerMatrix } from '@/components/common/PrintPartnerMatrix';
import { SHOPIFY_STORE_PERMANENT_DOMAIN, fetchAllProducts, formatMoney, inStock, type ShopifyProduct } from '@/lib/shopify';

const STORE_HANDLE = SHOPIFY_STORE_PERMANENT_DOMAIN.replace('.myshopify.com', '');
export const SHOPIFY_ADMIN = `https://admin.shopify.com/store/${STORE_HANDLE}`;
const LINKS: [string, string, string][] = [
  ['Orders', '/orders', 'Paid shop orders, fulfilment and refunds'],
  ['Products', '/products', 'Edit titles, photos, prices and variants'],
  ['Inventory', '/products/inventory', 'Stock levels and sold-out items'],
  ['Customers', '/customers', 'Shop buyers and their order history'],
  ['Discounts', '/discounts', 'Codes and automatic discounts'],
  ['Analytics', '/analytics', 'Sales, sessions and conversion'],
  ['Apps & print partners', '/apps', 'Print-on-demand fulfilment apps'],
  ['Payments & checkout', '/settings/payments', 'Payout account and checkout settings'],
];
const numericId = (gid: string) => gid.split('/').pop() ?? '';

/** Admin → Shop & print: shortcuts into Shopify, a live product check and the print partner matrix. */
export function ShopAdmin() {
  const [products, setProducts] = useState<ShopifyProduct[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let on = true; setFailed(false); setProducts(null);
    fetchAllProducts().then(p => { if (on) setProducts(p); }).catch(() => { if (on) setFailed(true); });
    return () => { on = false; };
  }, [attempt]);
  const soldOut = useMemo(() => (products ?? []).filter(p => !inStock(p)), [products]);
  return (
    <div className="space-y-10">
      <section aria-labelledby="shop-links" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><h2 id="shop-links" className="text-2xl">Shop</h2><p className="text-sm text-muted-foreground">Shop orders are paid and recorded in Shopify. Open a section to fulfil, refund or edit.</p></div>
          <Button asChild variant="outline" size="sm"><a href={SHOPIFY_ADMIN} target="_blank" rel="noreferrer">Open Shopify admin<ExternalLink className="ml-1 h-3 w-3" aria-hidden /></a></Button>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {LINKS.map(([label, path, note]) => (
            <li key={path}><a href={`${SHOPIFY_ADMIN}${path}`} target="_blank" rel="noreferrer" className="parchment block h-full p-4 transition-colors hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className="flex items-center justify-between gap-2 font-display text-lg">{label}<ExternalLink className="h-3.5 w-3.5 text-muted-foreground" aria-hidden /></span>
              <span className="mt-1 block text-xs text-muted-foreground">{note}</span>
            </a></li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="shop-live" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="shop-live" className="text-2xl">What shoppers see now</h2>
          <Button size="sm" variant="outline" onClick={() => setAttempt(a => a + 1)} disabled={!products && !failed}><RefreshCw className="mr-1 h-3 w-3" aria-hidden />Refresh</Button>
        </div>
        {failed && <p role="alert" className="text-destructive">The shop could not be reached. Check that the Shopify plan is active, then refresh.</p>}
        {!products && !failed && <div role="status" aria-label="Loading products" className="h-32 animate-pulse rounded bg-muted motion-reduce:animate-none" />}
        {products && <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[['Products listed', String(products.length)], ['In stock', String(products.length - soldOut.length)], ['Sold out', String(soldOut.length)], ['Types', String(new Set(products.map(p => p.node.productType).filter(Boolean)).size)]].map(([k, v]) => <div key={k} className="parchment p-3"><div className="text-xs text-muted-foreground">{k}</div><div className="text-lg">{v}</div></div>)}
          </div>
          <div className="parchment overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th className="p-3 font-normal">Product</th><th className="p-3 font-normal">Type</th><th className="p-3 font-normal">Price</th><th className="p-3 font-normal">Options</th><th className="p-3 font-normal">Status</th><th className="p-3"><span className="sr-only">Edit</span></th></tr></thead>
              <tbody className="divide-y divide-border">
                {products.map(p => (
                  <tr key={p.node.id}>
                    <td className="p-3">{p.node.title}</td>
                    <td className="p-3 text-muted-foreground">{p.node.productType || '—'}</td>
                    <td className="p-3">{formatMoney(p.node.priceRange.minVariantPrice)}</td>
                    <td className="p-3 text-muted-foreground">{p.node.variants.edges.length}</td>
                    <td className="p-3">{inStock(p) ? 'In stock' : <span className="text-destructive">Sold out</span>}</td>
                    <td className="p-3 text-right"><a href={`${SHOPIFY_ADMIN}/products/${numericId(p.node.id)}`} target="_blank" rel="noreferrer" className="text-xs underline underline-offset-4">Edit<span className="sr-only"> {p.node.title} in Shopify</span></a></td>
                  </tr>
                ))}
                {!products.length && <tr><td colSpan={6} className="p-4 text-muted-foreground">No products are published to the shop yet.</td></tr>}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">Prices are what the shop charges today. Margins still need your sign-off against each partner’s confirmed cost.</p>
        </>}
      </section>

      <PrintPartnerMatrix />
    </div>
  );
}
