import { SIGNS, SIGN_GLYPH } from '@/lib/astro';
import { iconForProductType } from '@/components/icons/registry';
import { ChartWheelIcon, RetroEmblem, StorefrontIcon } from '@/components/icons/RetroIcons';
import { cn } from '@/lib/utils';

export const PRICE_BANDS = [
  { id: 'under-20', label: 'Under $20', min: 0, max: 20 },
  { id: '20-40', label: '$20 – $40', min: 20, max: 40 },
  { id: '40-plus', label: '$40 and up', min: 40, max: Infinity },
] as const;
export type PriceBand = (typeof PRICE_BANDS)[number]['id'];

export type ShopFilters = { collection: 'all' | 'atomic'; type: string; sign: string; price: PriceBand | 'all'; inStock: boolean };

type Props = {
  types: { name: string; count: number }[];
  signs: { name: string; count: number }[];
  total: number;
  atomicCount: number;
  filters: ShopFilters;
  onChange: (key: keyof ShopFilters, value: string | boolean) => void;
  onClear: () => void;
  onPick?: () => void;
};

/** Gift-shop departments: product types, sign editions, price bands and availability. */
export function ShopSidebar({ types, signs, total, atomicCount, filters, onChange, onClear, onPick }: Props) {
  const pick = (key: keyof ShopFilters, value: string | boolean) => { onChange(key, value); onPick?.(); };
  const filtered = filters.collection !== 'all' || filters.type !== 'All' || filters.sign !== 'All' || filters.price !== 'all' || filters.inStock;
  return (
    <nav aria-label="Shop departments" className="shop-sidebar space-y-6">
      <div>
        <h2 className="shop-sidebar-h">Collections</h2>
        <ul className="mt-2 space-y-0.5">
          <li><DeptButton active={filters.collection === 'all'} onClick={() => pick('collection', 'all')} icon={StorefrontIcon} label="All collections" count={total} /></li>
          <li><DeptButton active={filters.collection === 'atomic'} onClick={() => pick('collection', 'atomic')} icon={ChartWheelIcon} label="Atomic Zodiac" count={atomicCount} /></li>
        </ul>
      </div>
      <div>
        <h2 className="shop-sidebar-h">Departments</h2>
        <ul className="mt-2 space-y-0.5">
          <li><DeptButton active={filters.type === 'All'} onClick={() => pick('type', 'All')} icon={StorefrontIcon} label="Everything" count={total} /></li>
          {types.map(t => <li key={t.name}><DeptButton active={filters.type === t.name} onClick={() => pick('type', t.name)} icon={iconForProductType(t.name)} label={t.name} count={t.count} /></li>)}
        </ul>
      </div>
      {signs.length > 0 && <div>
        <h2 className="shop-sidebar-h">Sign editions</h2>
        <div className="mt-3 grid grid-cols-4 gap-1.5" role="group" aria-label="Sign edition">
          {signs.map(s => {
            const i = SIGNS.findIndex(n => n.toLowerCase() === s.name.toLowerCase());
            const on = filters.sign === s.name;
            return <button key={s.name} type="button" aria-pressed={on} onClick={() => pick('sign', on ? 'All' : s.name)} title={`${s.name} · ${s.count}`} className={cn('shop-sign', on && 'shop-sign-on')}><span aria-hidden className="text-lg leading-none">{i >= 0 ? `${SIGN_GLYPH[i]}\uFE0E` : '✦'}</span><span className="text-[0.62rem] leading-none">{s.name.slice(0, 3)}</span></button>;
          })}
        </div>
      </div>}
      <div>
        <h2 className="shop-sidebar-h">Price</h2>
        <div className="mt-2 space-y-0.5" role="group" aria-label="Price">
          {PRICE_BANDS.map(b => <button key={b.id} type="button" aria-pressed={filters.price === b.id} onClick={() => pick('price', filters.price === b.id ? 'all' : b.id)} className={cn('shop-dept', filters.price === b.id && 'shop-dept-on')}><span className="shop-dot" aria-hidden />{b.label}</button>)}
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-3 text-sm"><input type="checkbox" checked={filters.inStock} onChange={e => pick('inStock', e.target.checked)} className="h-4 w-4 accent-[hsl(var(--primary))]" />Ready to order only</label>
      {filtered && <button type="button" onClick={() => { onClear(); onPick?.(); }} className="font-label text-sm text-accent underline-offset-4 hover:underline">Clear all filters</button>}
    </nav>
  );
}

function DeptButton({ active, onClick, icon, label, count }: { active: boolean; onClick: () => void; icon: Parameters<typeof RetroEmblem>[0]['icon']; label: string; count: number }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={cn('shop-dept', active && 'shop-dept-on')}>
      <RetroEmblem icon={icon} size={30} active={active} />
      <span className="min-w-0 flex-1 truncate text-left">{label}</span>
      <span className="font-label text-xs text-muted-foreground">{count}</span>
    </button>
  );
}
