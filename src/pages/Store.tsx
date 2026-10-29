import { Fragment, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Loader2, Search, Store as StoreIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CartDrawer } from '@/components/store/CartDrawer';
import { PRODUCT_BY_HANDLE_QUERY, storefrontApiRequest, fetchAllProducts, formatMoney, inStock, type ShopifyProduct } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { usePageMeta } from '@/hooks/usePageMeta';

function useAdd() {
  const addItem = useCartStore(s => s.addItem);
  const loading = useCartStore(s => s.isLoading);
  const add = async (product: ShopifyProduct, variantId?: string) => {
    const v = product.node.variants.edges.find(e => e.node.id === variantId)?.node ?? product.node.variants.edges.find(e => e.node.availableForSale)?.node;
    if (!v || !v.availableForSale) { toast.error('That item is sold out right now.'); return; }
    await addItem({ product, variantId: v.id, variantTitle: v.title, price: v.price, quantity: 1, selectedOptions: v.selectedOptions });
    toast.success('Added to cart', { description: product.node.title, position: 'top-center' });
  };
  return { add, loading };
}

const SORTS = { featured: 'Featured', 'price-asc': 'Price: low to high', 'price-desc': 'Price: high to low', name: 'Name: A to Z', newest: 'Newest' } as const;
type Sort = keyof typeof SORTS;
const priceOf = (p: ShopifyProduct) => parseFloat(p.node.priceRange.minVariantPrice.amount);

function ShopOffline({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="parchment mx-auto max-w-lg space-y-3 p-8 text-center">
      <StoreIcon className="mx-auto h-8 w-8 text-gold" aria-hidden />
      <h2 className="font-display text-2xl">The shop is resting for a moment</h2>
      <p className="text-sm text-muted-foreground">We couldn’t reach the shop just now. Nothing in your cart is lost — please try again shortly.</p>
      <Button variant="outline" onClick={onRetry}>Try again</Button>
    </div>
  );
}

export default function Store() {
  usePageMeta('The Zodaci Shop: posters, stickers and notebooks', 'Astrology posters, sticker sheets and star-chart notebooks from Zodaci.');
  const [products, setProducts] = useState<ShopifyProduct[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [params, setParams] = useSearchParams();
  const type = params.get('type') ?? 'All';
  const q = params.get('q') ?? '';
  const sort = (params.get('sort') as Sort) in SORTS ? (params.get('sort') as Sort) : 'featured';
  const set = (k: string, v: string, empty: string) => { const n = new URLSearchParams(params); if (v === empty) n.delete(k); else n.set(k, v); setParams(n, { replace: true }); };
  const { add, loading } = useAdd();
  useEffect(() => {
    let on = true; setFailed(false); setProducts(null);
    fetchAllProducts().then(list => { if (on) setProducts(list); }).catch(() => { if (on) setFailed(true); });
    return () => { on = false; };
  }, [attempt]);
  const types = useMemo(() => ['All', ...new Set((products ?? []).map(p => p.node.productType).filter(Boolean) as string[])], [products]);
  const shown = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const list = (products ?? []).filter(p => (type === 'All' || p.node.productType === type)
      && words.every(w => `${p.node.title} ${p.node.description} ${p.node.productType ?? ''} ${(p.node.tags ?? []).join(' ')}`.toLowerCase().includes(w)));
    const sorted = [...list];
    if (sort === 'price-asc') sorted.sort((a, b) => priceOf(a) - priceOf(b));
    if (sort === 'price-desc') sorted.sort((a, b) => priceOf(b) - priceOf(a));
    if (sort === 'name') sorted.sort((a, b) => a.node.title.localeCompare(b.node.title));
    if (sort === 'newest') sorted.sort((a, b) => (b.node.createdAt ?? '').localeCompare(a.node.createdAt ?? ''));
    // Sold-out items stay visible but sink below what can be bought today.
    return sorted.sort((a, b) => Number(inStock(b)) - Number(inStock(a)));
  }, [products, type, q, sort]);
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="font-smallcaps text-xs text-gold">The Zodaci Shop</p><h1 className="mt-2 text-4xl sm:text-5xl">Posters, stickers & notebooks</h1><p className="mt-3 max-w-xl text-muted-foreground">Astrology art for your walls, laptop and journal, printed to order.</p></div>
        <CartDrawer />
      </header>
      {failed ? <ShopOffline onRetry={() => setAttempt(a => a + 1)} /> : <>
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative min-w-[220px] flex-1"><span className="sr-only">Search the shop</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden /><Input type="search" value={q} onChange={e => set('q', e.target.value, '')} placeholder="Search posters, signs, notebooks…" className="pl-9" /></label>
          <label className="flex items-center gap-2 text-sm"><span className="text-muted-foreground">Sort</span>
            <select value={sort} onChange={e => set('sort', e.target.value, 'featured')} className="h-10 rounded-md border border-input bg-background px-3 text-sm">{(Object.keys(SORTS) as Sort[]).map(k => <option key={k} value={k}>{SORTS[k]}</option>)}</select>
          </label>
        </div>
        {types.length > 2 && <div className="flex flex-wrap gap-2" role="group" aria-label="Product type">{types.map(t => <Button key={t} size="sm" aria-pressed={t === type} variant={t === type ? 'default' : 'outline'} onClick={() => set('type', t, 'All')}>{t}</Button>)}</div>}
        {!products && <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading the shop">{Array.from({ length: 6 }, (_, i) => <li key={i} className="parchment overflow-hidden"><div className="aspect-square animate-pulse bg-muted motion-reduce:animate-none" /><div className="space-y-2 p-4"><div className="h-5 w-2/3 rounded bg-muted" /><div className="h-4 w-full rounded bg-muted" /></div></li>)}</ul>}
        {products && <p className="text-sm text-muted-foreground" aria-live="polite">{shown.length} {shown.length === 1 ? 'item' : 'items'}{q && ` matching “${q}”`}</p>}
        {products && shown.length === 0 && <div className="parchment space-y-3 p-8 text-center"><p className="text-muted-foreground">{products.length ? 'Nothing matches that search.' : 'New pieces are on their way — check back soon.'}</p>{(q || type !== 'All') && <Button variant="outline" size="sm" onClick={() => setParams(new URLSearchParams(), { replace: true })}>Clear search and filters</Button>}</div>}
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map(p => {
            const available = inStock(p);
            return (
              <li key={p.node.id} className="parchment flex flex-col overflow-hidden">
                <Link to={`/product/${p.node.handle}`} className="relative block aspect-square bg-muted">
                  {p.node.images.edges[0] && <img src={p.node.images.edges[0].node.url} alt={p.node.images.edges[0].node.altText ?? p.node.title} loading="lazy" width={600} height={600} className={`h-full w-full object-cover ${available ? '' : 'opacity-60 grayscale'}`} />}
                  {!available && <span className="absolute left-3 top-3 rounded-full border border-border bg-background/90 px-2.5 py-0.5 text-xs">Sold out</span>}
                </Link>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <Link to={`/product/${p.node.handle}`} className="font-display text-xl hover:underline">{p.node.title}</Link>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{p.node.description}</p>
                  <div className="mt-auto flex items-center justify-between pt-2"><span className="font-semibold">{p.node.variants.edges.length > 1 ? 'From ' : ''}{formatMoney(p.node.priceRange.minVariantPrice)}</span>
                    {available ? <Button size="sm" onClick={() => add(p)} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" aria-label="Adding" /> : 'Add to cart'}</Button> : <Button size="sm" variant="outline" disabled>Sold out</Button>}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </>}
    </div>
  );
}

export function ProductDetail() {
  const { handle = '' } = useParams();
  const [product, setProduct] = useState<ShopifyProduct | null | undefined>(undefined);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [variantId, setVariantId] = useState('');
  const [image, setImage] = useState(0);
  const { add, loading } = useAdd();
  usePageMeta(product ? `${product.node.title} · Zodaci Shop` : 'Zodaci Shop', product?.node.description.slice(0, 150) || 'Zodaci Shop product.');
  useEffect(() => {
    let on = true; setFailed(false); setProduct(undefined); setImage(0);
    storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle }).then(d => {
      if (!on) return;
      if (!d) { setFailed(true); return; }
      const n = d.data?.product; setProduct(n ? { node: n } : null);
      setVariantId(n?.variants?.edges?.find((e: { node: { availableForSale: boolean } }) => e.node.availableForSale)?.node?.id ?? n?.variants?.edges?.[0]?.node?.id ?? '');
    }).catch(() => { if (on) setFailed(true); });
    return () => { on = false; };
  }, [handle, attempt]);
  if (failed) return <div className="px-4 py-10"><ShopOffline onRetry={() => setAttempt(a => a + 1)} /></div>;
  if (product === undefined) return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 md:grid-cols-2" aria-busy="true" aria-label="Loading product">
      <div className="aspect-square animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
      <div className="space-y-4"><div className="h-9 w-3/4 rounded bg-muted" /><div className="h-7 w-24 rounded bg-muted" /><div className="h-24 rounded bg-muted" /></div>
    </div>
  );
  if (!product) return <div className="mx-auto max-w-lg space-y-3 px-4 py-16 text-center"><h1 className="font-display text-3xl">This piece isn’t in the shop</h1><p className="text-muted-foreground">It may have sold out or been retired.</p><Button asChild variant="outline"><Link to="/store">Back to the shop</Link></Button></div>;
  const n = product.node;
  const v = n.variants.edges.find(e => e.node.id === variantId)?.node;
  const imgs = n.images.edges;
  const main = imgs[Math.min(image, imgs.length - 1)]?.node;
  const available = v ? v.availableForSale : inStock(product);
  const options = n.options.filter(o => !(o.name === 'Title' && o.values.length === 1 && o.values[0] === 'Default Title'));
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-10">
      <div className="flex items-center justify-between"><Link to="/store" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">← The shop</Link><CartDrawer /></div>
      <div className="grid gap-10 md:grid-cols-2">
        <div className="space-y-3">
          <div className="parchment overflow-hidden rounded-lg">{main ? <img src={main.url} alt={main.altText ?? n.title} width={900} height={900} className="aspect-square w-full object-cover" /> : <div className="aspect-square bg-muted" />}</div>
          {imgs.length > 1 && <div className="flex flex-wrap gap-2" role="group" aria-label="Product photos">{imgs.map((im, i) => <button key={i} type="button" onClick={() => setImage(i)} aria-label={`Photo ${i + 1} of ${imgs.length}`} aria-pressed={i === image} className={`h-16 w-16 overflow-hidden rounded border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${i === image ? 'border-gold' : 'border-border opacity-70 hover:opacity-100'}`}><img src={im.node.url} alt="" loading="lazy" width={64} height={64} className="h-full w-full object-cover" /></button>)}</div>}
        </div>
        <div className="space-y-5">
          {n.productType && <p className="font-smallcaps text-xs text-gold">{n.productType}</p>}
          <h1 className="text-4xl">{n.title}</h1>
          <p className="text-2xl font-semibold">{formatMoney(v?.price ?? n.priceRange.minVariantPrice)}</p>
          {n.variants.edges.length > 1 && <div className="space-y-2"><p className="text-sm text-muted-foreground">{options.map(o => o.name).join(' / ') || 'Option'}</p><div className="flex flex-wrap gap-2">{n.variants.edges.map(e => <Button key={e.node.id} size="sm" aria-pressed={e.node.id === variantId} variant={e.node.id === variantId ? 'default' : 'outline'} disabled={!e.node.availableForSale} onClick={() => setVariantId(e.node.id)}>{e.node.title}{!e.node.availableForSale && ' · sold out'}</Button>)}</div></div>}
          {available ? <Button size="lg" onClick={() => add(product, variantId)} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" aria-label="Adding" /> : 'Add to cart'}</Button> : <Button size="lg" variant="outline" disabled>Sold out</Button>}
          <p className="whitespace-pre-line text-muted-foreground">{n.description}</p>
          {(options.length > 0 || v) && <section aria-labelledby="specs" className="space-y-2 border-t border-border pt-4">
            <h2 id="specs" className="font-smallcaps !text-xs text-gold">Details</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              {n.productType && <><dt className="text-muted-foreground">Type</dt><dd>{n.productType}</dd></>}
              {options.map(o => <Fragment key={o.name}><dt className="text-muted-foreground">{o.name}</dt><dd>{v?.selectedOptions.find(s => s.name === o.name)?.value ?? o.values.join(', ')}</dd></Fragment>)}
            </dl>
          </section>}
          <section aria-labelledby="shipping" className="space-y-1 border-t border-border pt-4 text-sm">
            <h2 id="shipping" className="font-smallcaps !text-xs text-gold">Shipping</h2>
            <p className="text-muted-foreground">Printed to order. Shipping and any sales tax are calculated at checkout, where you’ll see delivery options before you pay.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
