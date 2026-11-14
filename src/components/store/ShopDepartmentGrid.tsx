import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FEATURED_SET, departmentHref, orderDepartments, type ShopDepartment } from '@/content/shopShowcase';
import { useSiteSettings } from '@/hooks/useSiteSettings';

/**
 * Gift-shop window: each department shows a real product, cut out and set on a 1950s atomic backdrop
 * (sunburst rays or orbit rings), with a navy label strip. The large tile opens the Atomic Zodiac Collection.
 * `counts` (product type → number in the collection) adds item counts when the catalog is loaded.
 */
export function ShopDepartmentGrid({ counts, compact = false, className, headingId }: { counts?: Map<string, number>; compact?: boolean; className?: string; headingId?: string }) {
  const ordered = orderDepartments(useSiteSettings().shopOrder);
  const departments = compact ? ordered.slice(0, 2) : ordered;
  const countFor = (d: ShopDepartment) => counts ? d.types.reduce((n, t) => n + (counts.get(t) ?? 0), 0) : undefined;
  const total = counts ? [...counts.values()].reduce((a, b) => a + b, 0) : undefined;
  return (
    <ul className={cn('dept-grid', compact && 'dept-grid-compact', className)} aria-labelledby={headingId} aria-label={headingId ? undefined : 'Shop departments'}>
      <li className="dept-featured">
        <Link to="/store?collection=atomic" className="dept-tile dept-rays-red group">
          <span className="dept-set" aria-hidden="true">
            {FEATURED_SET.pieces.map(p => <img key={p.slot} src={p.img.src} alt="" width={p.img.width} height={p.img.height} loading="lazy" decoding="async" className={`dept-set-${p.slot}`} />)}
          </span>
          <DeptLabel label={FEATURED_SET.label} note={total ? `${total} pieces · ${FEATURED_SET.note}` : FEATURED_SET.note} big />
        </Link>
      </li>
      {departments.map(d => {
        const n = countFor(d);
        if (n === 0) return null;
        return (
          <li key={d.id}>
            <Link to={departmentHref(d)} className={cn('dept-tile group', `dept-${d.backdrop}`)}>
              <span className="dept-product" aria-hidden="true"><img src={d.img.src} alt="" width={d.img.width} height={d.img.height} loading="lazy" decoding="async" /></span>
              <DeptLabel label={d.label} note={n !== undefined ? `${n} ${n === 1 ? 'piece' : 'pieces'}` : undefined} />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function DeptLabel({ label, note, big }: { label: string; note?: string; big?: boolean }) {
  return (
    <span className={cn('dept-label', big && 'dept-label-big')}>
      <span className="min-w-0">
        <span className="dept-label-title">{label}</span>
        {note && <span className="dept-label-note">{note}</span>}
      </span>
      <span className="dept-go" aria-hidden="true"><ArrowRight className="h-4 w-4" /></span>
    </span>
  );
}
