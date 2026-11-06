import { Fragment, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Loader2, Search, SlidersHorizontal, Store as StoreIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CartDrawer } from '@/components/store/CartDrawer';
import { PRICE_BANDS, ShopSidebar, type PriceBand, type ShopFilters } from '@/components/store/ShopSidebar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { PRODUCT_BY_HANDLE_QUERY, storefrontApiRequest, fetchAllProducts, formatMoney, inStock, type ShopifyProduct } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { PRIORITY_SHELVES, comicIssueTitle, compareAtomicAesthetic, isAtomicZodiac, isPortraitProduct, productPriority, shopTitle } from '@/lib/shopPresentation';
import { PersonalizationCallout } from '@/components/books/PersonalizationStory';
import { ProductCard, ShopShelf, SpotlightCard } from '@/components/store/ShopShelves';
import { useNextComicIssue } from '@/hooks/useNextComicIssue';
import { useSession } from '@/hooks/useLibrary';
import { PRODUCT_ART } from '@/content/productArtwork';
import { BOOK_VERSIONS, money } from '@/lib/books';
import { COMIC_PLANS } from '@/lib/comic';
import { usePageMeta } from '@/hooks/usePageMeta';
import { StaffPortrait } from '@/components/observatory/StaffPortrait';
import heads from '@/assets/home-heads-hero.jpg';

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
  usePageMeta('The Zodaci Shop: AstroBooks, AstroComics and atomic zodiac goods', 'Your chart as an AstroBook or AstroComic, plus atomic zodiac stickers, totes, posters and notebooks from the Zodaci gift shop.');
  const session = useSession();
  const issue = useNextComicIssue();
  const comicCard = comicIssueTitle({ signedIn: !!session, purchased: issue.purchased, next: issue.next });
  const bookFrom = money(Math.min(...BOOK_VERSIONS.map(v => v.price)));
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
  const [sheet, setSheet] = useState(false);
  const collection = params.get('collection') === 'atomic' ? 'atomic' : 'all';
  const atomicCount = useMemo(() => (products ?? []).filter(p => isAtomicZodiac(p.node)).length, [products]);
  // Collection selection scopes both department and sign counts to the editions being browsed.
  const catalog = useMemo(() => (products ?? []).filter(p => collection === 'all' || isAtomicZodiac(p.node)), [products, collection]);
  const types = useMemo(() => {
    const count = new Map<string, number>();
    for (const p of catalog) if (p.node.productType) count.set(p.node.productType, (count.get(p.node.productType) ?? 0) + 1);
    return [...count.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([name, n]) => ({ name, count: n }));
  }, [catalog]);
  const sign = params.get('sign') ?? 'All';
  const priceParam = params.get('price');
  const price: PriceBand | 'all' = PRICE_BANDS.some(b => b.id === priceParam) ? (priceParam as PriceBand) : 'all';
  const inStockOnly = params.get('stock') === '1';
  const signOf = (p: ShopifyProduct) => (p.node.tags ?? []).find(t => t.startsWith('sign:'))?.slice(5);
  const signs = useMemo(() => {
    const count = new Map<string, number>();
    for (const p of catalog) { const s = signOf(p); if (s) { const n = s[0].toUpperCase() + s.slice(1); count.set(n, (count.get(n) ?? 0) + 1); } }
    return [...count.entries()].map(([name, n]) => ({ name, count: n }));
  }, [catalog]);
  const filters: ShopFilters = { collection, type, sign, price, inStock: inStockOnly };
  const change = (k: keyof ShopFilters, v: string | boolean) => {
    if (k === 'collection') {
      const n = new URLSearchParams(params);
      if (v === 'atomic') n.set('collection', 'atomic'); else n.delete('collection');
      n.delete('type'); n.delete('sign');
      setParams(n, { replace: true });
    } else if (k === 'inStock') set('stock', v ? '1' : '', ''); else set(k, String(v), k === 'price' ? 'all' : 'All');
  };
  const clearFilters = () => { const n = new URLSearchParams(); if (q) n.set('q', q); if (sort !== 'featured') n.set('sort', sort); setParams(n, { replace: true }); };
  const band = PRICE_BANDS.find(b => b.id === price);
  const shown = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const list = (products ?? []).filter(p => (collection === 'all' || isAtomicZodiac(p.node))
      && (type === 'All' || p.node.productType === type)
      && (sign === 'All' || signOf(p) === sign.toLowerCase())
      && (!band || (priceOf(p) >= band.min && priceOf(p) < band.max))
      && (!inStockOnly || inStock(p))
      && words.every(w => `${p.node.title} ${p.node.description} ${p.node.productType ?? ''} ${(p.node.tags ?? []).join(' ')}`.toLowerCase().includes(w)));
    const sorted = [...list];
    if (sort === 'price-asc') sorted.sort((a, b) => priceOf(a) - priceOf(b));
    if (sort === 'price-desc') sorted.sort((a, b) => priceOf(b) - priceOf(a));
    if (sort === 'name') sorted.sort((a, b) => a.node.title.localeCompare(b.node.title));
    if (sort === 'newest') sorted.sort((a, b) => Number(isAtomicZodiac(b.node)) - Number(isAtomicZodiac(a.node)) || (b.node.createdAt ?? '').localeCompare(a.node.createdAt ?? ''));
    // Featured: books/comics, Atomic Zodiac, other stickers, bags, then the remaining catalog.
    if (sort === 'featured') sorted.sort((a, b) => productPriority(a.node.title, a.node.productType ?? '', a.node.tags) - productPriority(b.node.title, b.node.productType ?? '', b.node.tags)
      || (isAtomicZodiac(a.node) && isAtomicZodiac(b.node) ? compareAtomicAesthetic(a.node, b.node) : 0));
    // Sold-out items stay visible but sink below what can be bought today.
    return sorted.sort((a, b) => Number(inStock(b)) - Number(inStock(a)));
  }, [products, collection, type, sign, q, sort, band, inStockOnly]);
  // Default view: side-scrolling shelves in merchandising order. Any search, filter or sort shows the full grid.
  const browsing = !q && collection === 'all' && type === 'All' && sign === 'All' && !band && !inStockOnly && sort === 'featured';
  const shelves = useMemo(() => {
    const list = products ?? [];
    const pri = (p: ShopifyProduct) => productPriority(p.node.title, p.node.productType ?? '', p.node.tags);
    const top = PRIORITY_SHELVES.map(sh => ({ id: `p${sh.priority}`, title: sh.title, script: sh.script, items: list.filter(p => pri(p) === sh.priority), seeAll: sh.priority === 1 ? 'atomic' : undefined as string | undefined }));
    const rest = types.map(t => ({ id: t.name.toLowerCase().replace(/\W+/g, '-'), title: t.name, script: undefined as string | undefined, items: list.filter(p => pri(p) === 4 && p.node.productType === t.name), seeAll: t.name })).filter(sh => sh.items.length);
    return [...top, ...rest].map(sh => ({ ...sh, items: [...sh.items].sort((a, b) => Number(inStock(b)) - Number(inStock(a)) || (sh.id === 'p1' ? compareAtomicAesthetic(a.node, b.node) : 0)) }));
  }, [products, types]);
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10">
      <header className="obs-panel relative isolate overflow-hidden">
        <img src={heads} alt="" aria-hidden width={1920} height={1088} className="absolute inset-x-0 bottom-0 -z-20 h-full w-full object-cover object-bottom opacity-70" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background/80 to-background/10" />
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6"><CartDrawer /></div>
        <div className="px-5 pb-28 pt-8 pr-16 sm:px-10 sm:pb-40 sm:pt-10 sm:pr-20">
          <div className="flex items-start gap-4">
            <StaffPortrait id="curator" size={64} className="hidden sm:block" />
            <div><p className="font-label text-sm tracking-[0.2em] text-primary">The Observatory Gift Shop</p><h1 className="mt-2 font-display text-4xl uppercase leading-none sm:text-6xl">Books, comics &amp; souvenirs</h1><p className="mt-2 font-script text-2xl text-primary sm:text-3xl">Souvenirs from your own sky</p><p className="mt-3 max-w-xl text-foreground/85">Your chart as an AstroBook or AstroComic first, then atomic zodiac stickers, totes, posters, tees, mugs and notebooks — a core collection plus sign editions.</p></div>
          </div>
        </div>
      </header>
      {failed ? <ShopOffline onRetry={() => setAttempt(a => a + 1)} /> : <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="hidden lg:block"><div className="obs-panel sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto p-4">{products ? <ShopSidebar types={types} signs={signs} total={products.length} atomicCount={atomicCount} filters={filters} onChange={change} onClear={clearFilters} /> : <div className="space-y-3" aria-hidden>{Array.from({ length: 8 }, (_, i) => <div key={i} className="h-8 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />)}</div>}</div></aside>
        <div className="min-w-0 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Sheet open={sheet} onOpenChange={setSheet}>
            <SheetTrigger asChild><Button variant="outline" className="lg:hidden" disabled={!products}><SlidersHorizontal />Departments</Button></SheetTrigger>
            <SheetContent side="left" className="w-[85vw] max-w-sm overflow-y-auto">
              <SheetHeader><SheetTitle className="font-display">Browse the shop</SheetTitle></SheetHeader>
              {products && <div className="mt-5"><ShopSidebar types={types} signs={signs} total={products.length} atomicCount={atomicCount} filters={filters} onChange={change} onClear={clearFilters} onPick={() => setSheet(false)} /></div>}
            </SheetContent>
          </Sheet>
          <label className="relative min-w-[200px] flex-1"><span className="sr-only">Search the shop</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden /><Input type="search" value={q} onChange={e => set('q', e.target.value, '')} placeholder="Search posters, signs, notebooks…" className="pl-9" /></label>
          <label className="flex items-center gap-2 text-sm"><span className="text-muted-foreground">Sort</span>
            <select value={sort} onChange={e => set('sort', e.target.value, 'featured')} className="h-10 rounded-md border border-input bg-background px-3 text-sm">{(Object.keys(SORTS) as Sort[]).map(k => <option key={k} value={k}>{SORTS[k]}</option>)}</select>
          </label>
        </div>
        {(collection !== 'all' || type !== 'All' || sign !== 'All' || band || inStockOnly) && <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
          {collection !== 'all' && <Chip label="Atomic Zodiac Collection" onClear={() => change('collection', 'all')} />}
          {type !== 'All' && <Chip label={type} onClear={() => change('type', 'All')} />}
          {sign !== 'All' && <Chip label={`${sign} edition`} onClear={() => change('sign', 'All')} />}
          {band && <Chip label={band.label} onClear={() => change('price', 'all')} />}
          {inStockOnly && <Chip label="Ready to order" onClear={() => change('inStock', false)} />}
        </div>}
        {!products && <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading the shop">{Array.from({ length: 6 }, (_, i) => <li key={i} className="parchment overflow-hidden"><div className="aspect-square animate-pulse bg-muted motion-reduce:animate-none" /><div className="space-y-2 p-4"><div className="h-5 w-2/3 rounded bg-muted" /><div className="h-4 w-full rounded bg-muted" /></div></li>)}</ul>}
        {products && !browsing && <p className="text-sm text-muted-foreground" aria-live="polite">{shown.length} {shown.length === 1 ? 'item' : 'items'}{q && ` matching “${q}”`}</p>}
        {products && shown.length === 0 && <div className="parchment space-y-3 p-8 text-center"><p className="text-muted-foreground">{products.length ? 'Nothing matches that search.' : 'New pieces are on their way — check back soon.'}</p>{(q || type !== 'All' || sign !== 'All' || band || inStockOnly) && <Button variant="outline" size="sm" onClick={() => setParams(new URLSearchParams(), { replace: true })}>Clear search and filters</Button>}</div>}
        {products && browsing && <div className="space-y-10">
          {shelves.map((sh, i) => <ShopShelf key={sh.id} id={sh.id} title={sh.title} script={sh.script} items={sh.items} onAdd={add} adding={loading}
            onSeeAll={sh.seeAll ? () => sh.seeAll === 'atomic' ? change('collection', 'atomic') : change('type', sh.seeAll!) : undefined}
            lead={i === 0 ? <>
              <SpotlightCard to="/astrobook" image={PRODUCT_ART.book.src} alt={PRODUCT_ART.book.alt} eyebrow="Written for you" title="The AstroBook" note="Your whole chart as a printed book: six volumes calculated from your birth moment, with the context you add." price={`From ${bookFrom}`} cta="Choose an edition" />
              <SpotlightCard to="/astrocomic" image={PRODUCT_ART.comic.src} alt={PRODUCT_ART.comic.alt} eyebrow={issue.purchased && session ? 'Your next issue' : 'Drawn for you'} title={`AstroComic ${comicCard.title}`} note={comicCard.note} price={COMIC_PLANS.single.label} cta={issue.purchased && session ? 'Order this issue' : 'See the comic'} />
            </> : undefined} />)}
        </div>}
        {(!browsing || !products) && <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map(p => <li key={p.node.id}><ProductCard p={p} onAdd={add} adding={loading} /></li>)}
        </ul>}
        </div>
      </div>}
    </div>
  );
}

function Chip({ label, onClear }: { label: string; onClear: () => void }) {
  return <button type="button" onClick={onClear} className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--brass)/0.6)] bg-secondary px-3 py-1 text-sm transition-colors duration-700 hover:border-accent" aria-label={`Remove filter: ${label}`}>{label}<X aria-hidden className="h-3.5 w-3.5" /></button>;
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
  const portrait = isPortraitProduct(n.title, n.productType ?? '', n.tags);
  const shown = shopTitle(n.title, n.productType ?? '');
  const isComic = /astro\s*comic/i.test(`${n.title} ${n.productType ?? ''}`);
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-10">
      <div className="flex items-center justify-between"><Link to="/store" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">← The shop</Link><CartDrawer /></div>
      <div className="grid gap-10 md:grid-cols-2">
        <div className="space-y-3">
          <div className="parchment overflow-hidden rounded-md">{main ? <img src={main.url} alt={main.altText ?? n.title} width={900} height={portrait ? 1200 : 900} className={`w-full ${portrait ? 'aspect-[3/4] object-cover' : 'aspect-square object-contain'}`} /> : <div className={`${portrait ? 'aspect-[3/4]' : 'aspect-square'} bg-muted`} />}</div>
          {imgs.length > 1 && <div className="flex flex-wrap gap-2" role="group" aria-label="Product photos">{imgs.map((im, i) => <button key={i} type="button" onClick={() => setImage(i)} aria-label={`Photo ${i + 1} of ${imgs.length}`} aria-pressed={i === image} className={`h-16 w-16 overflow-hidden rounded border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${i === image ? 'border-gold' : 'border-border opacity-70 hover:opacity-100'}`}><img src={im.node.url} alt="" loading="lazy" width={64} height={64} className="h-full w-full object-cover" /></button>)}</div>}
        </div>
        <div className="space-y-5">
          {n.productType && <p className="font-smallcaps text-xs text-gold">{n.productType}</p>}
          <h1 className="text-4xl">{shown.title}</h1>
          {shown.badge && <p className="inline-block rounded-full bg-accent px-3 py-0.5 font-label text-sm tracking-wider text-accent-foreground">{shown.badge}</p>}
          <p className="text-2xl font-semibold">{formatMoney(v?.price ?? n.priceRange.minVariantPrice)}</p>
          {n.variants.edges.length > 1 && <div className="space-y-2"><p className="text-sm text-muted-foreground">{options.map(o => o.name).join(' / ') || 'Option'}</p><div className="flex flex-wrap gap-2">{n.variants.edges.map(e => <Button key={e.node.id} size="sm" aria-pressed={e.node.id === variantId} variant={e.node.id === variantId ? 'default' : 'outline'} disabled={!e.node.availableForSale} onClick={() => setVariantId(e.node.id)}>{e.node.title}{!e.node.availableForSale && ' · sold out'}</Button>)}</div></div>}
          {available ? <Button size="lg" onClick={() => add(product, variantId)} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" aria-label="Adding" /> : 'Add to cart'}</Button> : <Button size="lg" variant="outline" disabled>Sold out</Button>}
          <p className="whitespace-pre-line text-muted-foreground">{n.description}</p>
          {portrait && <PersonalizationCallout product={isComic ? 'comic' : 'book'} />}
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
