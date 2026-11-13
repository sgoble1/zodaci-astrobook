import { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { breadcrumbsFor } from '@/content/memberNav';
import { useCurrentPageTitle } from '@/hooks/useCurrentPageTitle';

/** Public detail pages that get a Learn › Section › Page trail (same rules as the member trail, public wording). */
export const PUBLIC_TRAIL = /^\/(academy|learn|reading-room|themes)\/[\w-]+$/;

/** Breadcrumbs above public lessons, articles, guides and core themes. The last crumb is the page's own title. */
export function PublicBreadcrumbs() {
  const { pathname } = useLocation();
  const title = useCurrentPageTitle();
  if (!PUBLIC_TRAIL.test(pathname)) return null;
  const crumbs = breadcrumbsFor(pathname, { title });
  if (!crumbs) return null;
  const shown = crumbs.map((c, i) => (i === 0 ? { label: 'Learn', to: '/learn' } : c));
  return (
    <Breadcrumb aria-label="Breadcrumb" className="mb-6">
      <BreadcrumbList className="text-xs sm:text-sm">
        {shown.map((c, i) => <Fragment key={`${c.label}-${i}`}>
          {i > 0 && <BreadcrumbSeparator />}
          <BreadcrumbItem>{c.to ? <BreadcrumbLink asChild><Link to={c.to} className="inline-flex min-h-8 items-center">{c.label}</Link></BreadcrumbLink> : <BreadcrumbPage className="max-w-[18rem] truncate">{c.label}</BreadcrumbPage>}</BreadcrumbItem>
        </Fragment>)}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
