import { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { breadcrumbsFor } from '@/content/memberNav';
import { useCurrentPageTitle } from '@/hooks/useCurrentPageTitle';
import { PUBLIC_PILLARS } from './PublicHeader';

/** Public detail pages that get a Learn › Section › Page trail (same rules as the member trail, public wording). */
export const PUBLIC_TRAIL = /^\/(academy|learn|reading-room|themes|articles|planets|houses|compendium|sources|books|book-preview)(?:\/[^/]+)+\/?$/;

export function publicTrailFor(pathname: string, title?: string | null) {
  const pillar = PUBLIC_PILLARS.find(p => p.items.some(i => pathname === i.to.split('#')[0] || pathname.startsWith(`${i.to.split('#')[0]}/`)));
  const registered = breadcrumbsFor(pathname, { title });
  if (PUBLIC_TRAIL.test(pathname) && registered) return registered.map((c, i) => i === 0 ? { label: pillar?.label ?? 'Learn', to: pillar?.to ?? '/learn' } : c);
  if (!pillar && !PUBLIC_TRAIL.test(pathname)) return null;
  const parent = pillar?.items.find(i => pathname.startsWith(`${i.to.split('#')[0]}/`));
  return [{ label: 'Zodaci', to: '/welcome' }, ...(parent ? [{ label: parent.label, to: parent.to }] : []), { label: title?.replace(/\s*[·|–—].*$/, '') || pillar?.items.find(i => i.to === pathname)?.label || 'Page' }];
}

/** Breadcrumbs above public lessons, articles, guides and core themes. The last crumb is the page's own title. */
export function PublicBreadcrumbs() {
  const { pathname } = useLocation();
  const title = useCurrentPageTitle();
  const shown = publicTrailFor(pathname, title);
  if (!shown) return null;
  return (
    <Breadcrumb aria-label="Breadcrumb" className="mb-6">
      <BreadcrumbList className="text-xs sm:text-sm">
        {shown.map((c, i) => <Fragment key={`${c.label}-${i}`}>
          {i > 0 && <BreadcrumbSeparator />}
          <BreadcrumbItem>{'to' in c && c.to ? <BreadcrumbLink asChild><Link to={c.to} className="inline-flex min-h-11 items-center">{c.label}</Link></BreadcrumbLink> : <BreadcrumbPage className="max-w-[18rem] break-words">{c.label}</BreadcrumbPage>}</BreadcrumbItem>
        </Fragment>)}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
