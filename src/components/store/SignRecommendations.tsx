import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fmtLon, type ChartResult } from '@/lib/astro';
import { fetchAllProducts, formatMoney, inStock, type ShopifyProduct } from '@/lib/shopify';
import { signPicks, type ChartSigns } from '@/lib/shopPresentation';
import { useCartStore } from '@/stores/cartStore';
import { needsBirthDetails } from '@/lib/shopifyCart';

/** The member's own calculated signs. Rising only when the birth time is known; never guessed from anything else. */
export function chartSigns(chart: ChartResult, timed: boolean): ChartSigns | null {
  const sun = chart.bodies.find(b => b.key === 'sun')?.sign;
  if (!sun) return null;
  return { sun, moon: timed ? chart.bodies.find(b => b.key === 'moon')?.sign ?? null : null, rising: timed && chart.asc != null ? fmtLon(chart.asc).sign : null };
}

let cache: Promise<ShopifyProduct[]> | null = null;
const loadShop = () => (cache ??= fetchAllProducts().catch(e => { cache = null; throw e; }));

/**
 * "Made for your signs": up to three in-stock shop pieces tagged with the member's Sun, Moon or Rising sign. Untimed
 * charts use the Sun only (the Moon can change sign during an untimed day). Hidden when the shop can't be reached or
 * nothing matches, so the dashboard never shows an empty or broken shelf.
 */
export function SignRecommendations({ chart, timed }: { chart: ChartResult; timed: boolean }) {
  const signs = useMemo(() => chartSigns(chart, timed), [chart, timed]);
  const [products, setProducts] = useState<ShopifyProduct[] | null>(null);
  const addItem = useCartStore(s => s.addItem);
  const adding = useCartStore(s => s.isLoading);
  useEffect(() => {
    let on = true;
    loadShop().then(list => { if (on) setProducts(list.filter(inStock)); }).catch(() => { if (on) setProducts([]); });
    return () => { on = false; };
  }, []);
  const picks = useMemo(() => {
    if (!signs || !products) return [];
    const flat = products.map(p => ({ title: p.node.title, productType: p.node.productType, tags: p.node.tags, createdAt: p.node.createdAt, p }));
    return signPicks(flat, signs, 3);
  }, [signs, products]);
  if (!signs || !products || picks.length === 0) return null;
  const add = async (product: ShopifyProduct) => {
    const v = product.node.variants.edges.find(e => e.node.availableForSale)?.node;
    if (!v) { toast.error('That item is sold out right now.'); return; }
    if (!(await addItem({ product, variantId: v.id, variantTitle: v.title, price: v.price, quantity: 1, selectedOptions: v.selectedOptions }))) return;
    toast.success('Added to cart', { description: product.node.title, position: 'top-center' });
  };
  return (
    <section aria-labelledby="sign-picks" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-label text-xs tracking-[0.16em] text-primary">For your chart</p>
          <h2 id="sign-picks" className="font-display text-2xl sm:text-3xl">Made for your signs</h2>
          <p className="mt-1 text-sm text-muted-foreground">Sun in {signs.sun}{signs.moon ? `, Moon in ${signs.moon}` : ''}{signs.rising ? `, ${signs.rising} rising` : ''}. Picked from the gift shop by sign.</p>
        </div>
        <Button asChild variant="ghost"><Link to={`/store?sign=${encodeURIComponent(signs.sun)}`}>All {signs.sun} pieces<ArrowRight className="h-4 w-4" /></Link></Button>
      </div>
      <ul className="grid gap-4 sm:grid-cols-3">
        {picks.map(({ product: { p }, role, sign }) => {
          const img = p.node.images.edges[0]?.node;
          return (
            <li key={p.node.id} className="obs-paper flex flex-col overflow-hidden">
              <Link to={`/product/${p.node.handle}`} className="block">
                {img ? <img src={img.url} alt={img.altText ?? p.node.title} loading="lazy" decoding="async" className="aspect-square w-full object-cover" /> : <div className="aspect-square w-full bg-muted" />}
              </Link>
              <div className="flex flex-1 flex-col gap-1 p-4">
                <p className="font-label text-xs tracking-[0.14em] text-primary">Your {role} sign · {sign}</p>
                <Link to={`/product/${p.node.handle}`} className="font-display text-lg leading-snug hover:underline">{p.node.title}</Link>
                <p className="text-sm text-muted-foreground">{formatMoney(p.node.priceRange.minVariantPrice)}</p>
                {needsBirthDetails(p.node) ? <Button asChild size="sm" variant="outline" className="mt-auto w-fit"><Link to={`/product/${p.node.handle}`}>Personalise</Link></Button> : <Button size="sm" variant="outline" className="mt-auto w-fit" disabled={adding} onClick={() => void add(p)}>Add to cart</Button>}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
