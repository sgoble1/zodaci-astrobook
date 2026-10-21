import { Fragment, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { BoxArt } from '@/components/common/BoxArt';
import { PLAN_LABEL } from '@/components/common/PlanLock';
import { MEMBER_DOMAINS, breadcrumbsFor, domainById, domainFor, nextStepsFor, type MemberNavItem } from '@/content/memberNav';
import { useNavState } from './MemberNav';

function tabLabel(to: string) {
  for (const d of MEMBER_DOMAINS) { if (d.hub === to) return d.columns.flatMap(c => c.items).find(i => i.to === to)?.label ?? d.label; }
  return MEMBER_DOMAINS.flatMap(d => d.columns.flatMap(c => c.items)).find(i => i.to === to)?.label ?? to;
}
const findItem = (to: string): MemberNavItem | undefined => MEMBER_DOMAINS.flatMap(d => d.columns.flatMap(c => c.items)).find(i => i.to === to);

/** Horizontal quick-access row for the current domain (hubs and section pages). Scrolls sideways on phones. */
function DomainTabs({ path }: { path: string }) {
  const s = useNavState();
  const id = domainFor(path);
  const ref = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const check = () => setOverflow(el.scrollWidth - el.clientWidth - el.scrollLeft > 8);
    check(); el.addEventListener('scroll', check, { passive: true }); window.addEventListener('resize', check);
    el.querySelector<HTMLElement>('[aria-current="page"]')?.scrollIntoView({ block: 'nearest', inline: 'center' });
    return () => { el.removeEventListener('scroll', check); window.removeEventListener('resize', check); };
  }, [path]);
  if (!id || id === 'account') return null;
  const domain = domainById(id);
  const tabs = domain.tabs.filter(to => { const item = findItem(to); return !item?.audience || (item.audience === 'shane' ? s.shane : s.shared); });
  return (
    <div className="relative -mx-4 mb-8 sm:mx-0">
      <div ref={ref} className="overflow-x-auto px-4 [scrollbar-width:none] sm:px-0 [&::-webkit-scrollbar]:hidden">
        <nav aria-label={`${domain.label} sections`}>
          <ul className="flex w-max gap-2">
            {tabs.map(to => {
              const need = s.lock(to);
              return <li key={to}><NavLink to={to} end className={({ isActive }) => `inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isActive ? 'border-primary bg-primary/15 text-foreground' : 'border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground'}`}>
                {tabLabel(to)}{need && <Lock className="h-3 w-3" aria-label={`${PLAN_LABEL[need]} plan`} />}
              </NavLink></li>;
            })}
          </ul>
        </nav>
      </div>
      {overflow && <div className="pointer-events-none absolute inset-y-0 right-0 flex w-12 items-center justify-end bg-gradient-to-l from-background to-transparent pr-1 text-muted-foreground sm:-right-1" aria-hidden="true"><ArrowRight className="h-4 w-4" /></div>}
    </div>
  );
}

function PageBreadcrumbs({ path }: { path: string }) {
  const s = useNavState();
  const crumbs = breadcrumbsFor(path, {
    relationship: id => s.rels.find(r => r.id === id)?.name,
    page: id => s.custom.find(p => p.id === id),
  });
  if (!crumbs) return null;
  return (
    <Breadcrumb aria-label="Breadcrumb" className="mb-6">
      <BreadcrumbList className="text-xs sm:text-sm">
        {crumbs.map((c, i) => <Fragment key={`${c.label}-${i}`}>
          {i > 0 && <BreadcrumbSeparator />}
          <BreadcrumbItem>{c.to ? <BreadcrumbLink asChild><Link to={c.to} className="inline-flex min-h-8 items-center">{c.label}</Link></BreadcrumbLink> : <BreadcrumbPage className="max-w-[16rem] truncate">{c.label}</BreadcrumbPage>}</BreadcrumbItem>
        </Fragment>)}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

/** Top of every member page: breadcrumbs on detail pages, otherwise the domain's quick-access row. */
export function WayfindingTop() {
  const { pathname } = useLocation();
  const crumbs = breadcrumbsFor(pathname);
  return crumbs ? <PageBreadcrumbs path={pathname} /> : <DomainTabs path={pathname} />;
}

/** Bottom of every member page: three "Continue exploring" steps, the first personalised when possible. */
export function NextStepPanel() {
  const { pathname } = useLocation();
  const s = useNavState();
  if (s.birth === undefined) return null;
  const steps = nextStepsFor(pathname, { plan: s.plan, hasChart: !!s.birth, moonSign: s.moonSign, lastVisit: s.lastVisit?.path?.startsWith('/my-readings/topic/') ? { path: s.lastVisit.path, title: s.lastVisit.title } : null });
  const back = new Set((breadcrumbsFor(pathname) ?? []).map(c => c.to).filter(Boolean));
  const shown = steps.filter(st => !back.has(st.to));
  if (!shown.length) return null;
  return (
    <section aria-labelledby="continue-exploring" className="mt-16 border-t border-border pt-8 print:hidden">
      <h2 id="continue-exploring" className="font-display text-2xl">Continue exploring</h2>
      <ul className="mt-5 grid gap-4 sm:grid-cols-3">
        {shown.map(step => {
          const need = s.lock(step.to);
          return <li key={step.to}>
            <Link to={step.to} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-md transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <BoxArt seed={step.to} label={step.label} className="h-16 w-full" />
              <span className="flex flex-1 flex-col gap-1.5 p-4">
                <span className="flex flex-wrap items-center gap-2">
                  {step.badge && <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-gold">{step.badge}</span>}
                  {need && <span className="inline-flex items-center gap-1 rounded-full border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground"><Lock className="h-2.5 w-2.5" aria-hidden="true" />{PLAN_LABEL[need]}</span>}
                </span>
                <span className="font-display text-lg leading-tight">{step.label}</span>
                <span className="text-sm text-muted-foreground">{step.description}</span>
                <span className="mt-auto inline-flex items-center gap-1 pt-2 text-xs text-primary">Open<ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
              </span>
            </Link>
          </li>;
        })}
      </ul>
    </section>
  );
}
