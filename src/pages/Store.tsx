import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CartDrawer } from '@/components/store/CartDrawer';
import { PRODUCTS_QUERY, PRODUCT_BY_HANDLE_QUERY, storefrontApiRequest, formatMoney, type ShopifyProduct } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { usePageMeta } from '@/hooks/usePageMeta';

function useAdd() {
  const addItem = useCartStore(s => s.addItem);
  const loading = useCartStore(s => s.isLoading);
  const add = async (product: ShopifyProduct, variantId?: string) => {
    const v = product.node.variants.edges.find(e => e.node.id === variantId)?.node ?? product.node.variants.edges[0]?.node;
    if (!v) return;
    await addItem({ product, variantId: v.id, variantTitle: v.title, price: v.price, quantity: 1, selectedOptions: v.selectedOptions });
    toast.success('Added to cart', { description: product.node.title, position: 'top-center' });
  };
  return { add, loading };
}

export default function Store() {
  usePageMeta({ title: 'The Zodaci Shop: posters, stickers and notebooks', description: 'Astrology posters, sticker sheets and star-chart notebooks from Zodaci.' });
  const [products, setProducts] = useState<ShopifyProduct[] | null>(null);
  const [error, setError] = useState('');
  const [type, setType] = useState('All');
  const { add, loading } = useAdd();
  useEffect(() => {
    storefrontApiRequest(PRODUCTS_QUERY, { first: 50 }).then(d => setProducts(d?.data?.products?.edges ?? [])).catch(() => setError('The shop could not load. Please try again.'));
  }, []);
  const types = useMemo(() => ['All', ...new Set((products ?? []).map(p => p.node.productType).filter(Boolean) as string[])], [products]);
  const shown = (products ?? []).filter(p => type === 'All' || p.node.productType === type);
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="font-smallcaps text-xs text-gold">The Zodaci Shop</p><h1 className="mt-2 text-4xl sm:text-5xl">Posters, stickers & notebooks</h1><p className="mt-3 max-w-xl text-muted-foreground">Astrology art for your walls, laptop and journal, printed to order.</p></div>
        <CartDrawer />
      </header>
      {types.length > 2 && <div className="flex flex-wrap gap-2" role="tablist">{types.map(t => <Button key={t} size="sm" variant={t === type ? 'default' : 'outline'} onClick={() => setType(t)}>{t}</Button>)}</div>}
      {error && <p role="alert" className="text-destructive">{error}</p>}
      {!products && !error && <p role="status" className="text-muted-foreground">Loading the shop…</p>}
      {products && shown.length === 0 && <p className="parchment p-8 text-center text-muted-foreground">No products found.</p>}
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map(p => (
          <li key={p.node.id} className="parchment flex flex-col overflow-hidden">
            <Link to={`/product/${p.node.handle}`} className="block aspect-square bg-muted">{p.node.images.edges[0] && <img src={p.node.images.edges[0].node.url} alt={p.node.images.edges[0].node.altText ?? p.node.title} loading="lazy" className="h-full w-full object-cover" />}</Link>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <Link to={`/product/${p.node.handle}`} className="font-display text-xl hover:underline">{p.node.title}</Link>
              <p className="line-clamp-2 text-sm text-muted-foreground">{p.node.description}</p>
              <div className="mt-auto flex items-center justify-between pt-2"><span className="font-semibold">{formatMoney(p.node.priceRange.minVariantPrice)}</span><Button size="sm" onClick={() => add(p)} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add to cart'}</Button></div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProductDetail() {
  const { handle = '' } = useParams();
  const [product, setProduct] = useState<ShopifyProduct | null | undefined>(undefined);
  const [variantId, setVariantId] = useState('');
  const { add, loading } = useAdd();
  usePageMeta({ title: product ? `${product.node.title} · Zodaci Shop` : 'Zodaci Shop', description: product?.node.description.slice(0, 150) || 'Zodaci Shop product.' });
  useEffect(() => {
    storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle }).then(d => { const n = d?.data?.product; setProduct(n ? { node: n } : null); setVariantId(n?.variants?.edges?.[0]?.node?.id ?? ''); }).catch(() => setProduct(null));
  }, [handle]);
  if (product === undefined) return <p role="status" className="p-10 text-muted-foreground">Loading…</p>;
  if (!product) return <div className="p-10"><p>This product was not found.</p><Link to="/store" className="underline">Back to the shop</Link></div>;
  const v = product.node.variants.edges.find(e => e.node.id === variantId)?.node;
  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 md:grid-cols-2">
      <div className="space-y-3">{product.node.images.edges.map((im, i) => <img key={i} src={im.node.url} alt={im.node.altText ?? product.node.title} className="w-full rounded-lg" />)}</div>
      <div className="space-y-5">
        <div className="flex items-center justify-between"><Link to="/store" className="text-sm underline">← The shop</Link><CartDrawer /></div>
        <h1 className="text-4xl">{product.node.title}</h1>
        <p className="text-2xl font-semibold">{formatMoney(v?.price ?? product.node.priceRange.minVariantPrice)}</p>
        {product.node.variants.edges.length > 1 && <div className="flex flex-wrap gap-2">{product.node.variants.edges.map(e => <Button key={e.node.id} size="sm" variant={e.node.id === variantId ? 'default' : 'outline'} disabled={!e.node.availableForSale} onClick={() => setVariantId(e.node.id)}>{e.node.title}</Button>)}</div>}
        <p className="whitespace-pre-line text-muted-foreground">{product.node.description}</p>
        <Button size="lg" onClick={() => add(product, variantId)} disabled={loading || (v ? !v.availableForSale : false)}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add to cart'}</Button>
        <p className="text-sm text-muted-foreground">No reviews yet.</p>
      </div>
    </div>
  );
}
