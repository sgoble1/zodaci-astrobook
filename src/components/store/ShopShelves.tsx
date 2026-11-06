import { useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatMoney, inStock, type ShopifyProduct } from '@/lib/shopify';
import { isAtomicZodiac, isPortraitProduct, shopTitle } from '@/lib/shopPresentation';
import { cn } from '@/lib/utils';

type Add = (p: ShopifyProduct) => void;

/** One catalog product as a gift-shop card. Books and comics use a portrait frame. */
export function ProductCard({ p, onAdd, adding, className }: { p: ShopifyProduct; onAdd: Add; adding: boolean; className?: string }) {
  const available = inStock(p);
  const portrait = isPortraitProduct(p.node.title, p.node.productType ?? '', p.node.tags);
  const atomic = isAtomicZodiac(p.node);
  const { title, badge } = shopTitle(p.node.title, p.node.productType ?? '');
  const img = p.node.images.edges[0]?.node;
  return (
    <article className={cn('parchment flex h-full flex-col overflow-hidden', className)}>
      <Link to={`/product/${p.node.handle}`} className={cn('relative block bg-muted', portrait ? 'aspect-[3/4]' : 'aspect-square')} aria-label={title}>
        {img && <img src={img.url} alt={img.altText ?? title} loading="lazy" decoding="async" width={600} height={portrait ? 800 : 600} className={cn('h-full w-full', portrait ? 'object-cover' : 'object-contain', !available && 'opacity-60 grayscale')} />}
        {!available && <span className="absolute left-3 top-3 rounded-full border border-border bg-background/90 px-2.5 py-0.5 text-xs">Sold out</span>}
        {available && badge && <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-0.5 font-label text-xs tracking-wider text-accent-foreground">{badge}</span>}
        {atomic && <span className="absolute bottom-3 left-3 rounded-full border border-[hsl(var(--brass)/0.7)] bg-background/90 px-2.5 py-0.5 font-label text-xs tracking-wider text-primary">Atomic Zodiac</span>}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link to={`/product/${p.node.handle}`} className="font-display text-lg leading-snug hover:underline">{title}</Link>
        {atomic && <p className="font-label text-xs tracking-[0.14em] text-accent">Atomic Zodiac edition</p>}
        <p className="line-clamp-2 text-sm text-muted-foreground">{p.node.description}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="font-label text-lg tracking-wider text-primary">{p.node.variants.edges.length > 1 ? 'From ' : ''}{formatMoney(p.node.priceRange.minVariantPrice)}</span>
          {available
            ? <Button size="sm" variant="signal" onClick={() => onAdd(p)} disabled={adding} aria-label={`Add ${title} to cart`}>{adding ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : 'Add to cart'}</Button>
            : <Button size="sm" variant="outline" disabled>Sold out</Button>}
        </div>
      </div>
    </article>
  );
}

/** A department as a side-scrolling shelf, with arrow buttons on wide screens and "See all". */
export function ShopShelf({ id, title, script, items, onAdd, adding, onSeeAll, lead }: {
  id: string; title: string; script?: string; items: ShopifyProduct[]; onAdd: Add; adding: boolean; onSeeAll?: () => void; lead?: ReactNode;
}) {
  const track = useRef<HTMLUListElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = track.current; if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: reduce ? 'auto' : 'smooth' });
  };
  if (!items.length && !lead) return null;
  return (
    <section aria-labelledby={`shelf-${id}`} className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-dashed border-[hsl(var(--brass)/0.5)] pb-2">
        <div>
          <h2 id={`shelf-${id}`} className="font-label text-2xl tracking-[0.12em] text-primary">{title}</h2>
          {script && <p className="font-script text-xl leading-tight text-foreground/80">{script}</p>}
        </div>
        <div className="flex items-center gap-2">
          {onSeeAll && <Button variant="ghost" size="sm" onClick={onSeeAll}>See all {items.length}<ArrowRight className="h-4 w-4" aria-hidden /></Button>}
          <Button variant="outline" size="icon" className="hidden h-9 w-9 sm:inline-flex" onClick={() => scroll(-1)} aria-label={`Scroll ${title} left`}><ChevronLeft className="h-4 w-4" aria-hidden /></Button>
          <Button variant="outline" size="icon" className="hidden h-9 w-9 sm:inline-flex" onClick={() => scroll(1)} aria-label={`Scroll ${title} right`}><ChevronRight className="h-4 w-4" aria-hidden /></Button>
        </div>
      </div>
      <ul ref={track} className="shop-shelf -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-3" aria-label={`${title}, scroll sideways for more`}>
        {lead}
        {items.map(p => <li key={p.node.id} className="w-[min(16rem,72vw)] shrink-0 snap-start"><ProductCard p={p} onAdd={onAdd} adding={adding} /></li>)}
      </ul>
    </section>
  );
}

/** Lead cards for the in-house printed products (ordered on their own pages, not through the cart). */
export function SpotlightCard({ to, image, alt, eyebrow, title, note, price, cta }: { to: string; image: string; alt: string; eyebrow: string; title: string; note: string; price: string; cta: string }) {
  return (
    <li className="w-[min(16rem,72vw)] shrink-0 snap-start">
      <article className="parchment flex h-full flex-col overflow-hidden ring-2 ring-[hsl(var(--brass)/0.55)]">
        <Link to={to} className="relative block aspect-[3/4] bg-muted" aria-label={`${title}: ${cta}`}>
          <img src={image} alt={alt} loading="lazy" decoding="async" width={600} height={800} className="h-full w-full object-cover" />
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-0.5 font-label text-xs tracking-wider text-primary-foreground">{eyebrow}</span>
        </Link>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <Link to={to} className="font-display text-lg leading-snug hover:underline">{title}</Link>
          <p className="text-sm text-muted-foreground">{note}</p>
          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <span className="font-label text-lg tracking-wider text-primary">{price}</span>
            <Button asChild size="sm" variant="signal"><Link to={to}>{cta}</Link></Button>
          </div>
        </div>
      </article>
    </li>
  );
}
