import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, Lock, LogOut, Search, UserRound } from 'lucide-react';
import { useSession, useIsAdmin } from '@/hooks/useLibrary';
import { usePlan } from '@/hooks/usePlan';
import { useShaneAccount } from '@/hooks/useShaneAccount';
import { useSharedSpaceMember } from '@/hooks/useSharedSpaceMember';
import { useRelationships } from '@/hooks/useRelationships';
import { useSharedEditions } from '@/lib/editionSharing';
import { useCustomPages, NEW_PAGE_HIGHLIGHT_KEY, type CustomPage } from '@/hooks/useCustomPages';
import { useMyBirth, toChartInput, type MyBirth } from '@/lib/myBirth';
import { computeChart } from '@/lib/astro';
import { readingVisitKey, type ReadingVisit } from '@/lib/readingExperience';
import type { Plan } from '@/content/navigation';
import {
  ACCOUNT_MENU, ADMIN_MENU, ADMIN_PATHS, MEMBER_DOMAINS, domainById, domainFor, domainForMenuGroup, itemLock, memberDestinations, visibleColumns, withSharedEditions,
  type DomainId, type MemberDomain, type MemberNavColumn, type MemberNavItem,
} from '@/content/memberNav';
import { ZodaciLogo } from '@/components/brand/ZodaciLogo';
import { AccountButton, AccountSummary, useAccountMenu } from '@/components/common/AccountButton';
import { BookmarkButton } from '@/components/common/BookmarkButton';
import { ChatAboutButton } from '@/components/common/ChatAboutButton';
import { PLAN_LABEL } from '@/components/common/PlanLock';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

type Rel = { id: string; name: string; relation?: string | null };
type NavState = {
  plan: Plan; planLoading: boolean; admin: boolean; shane: boolean; shared: boolean; signedIn: boolean;
  birth: MyBirth | null | undefined; moonSign?: string; rels: Rel[]; custom: CustomPage[]; lastVisit: ReadingVisit | null; sharedEditions: string[];
  openMenu: DomainId | null; setOpenMenu: (id: DomainId | null) => void;
  sheet: DomainId | 'account' | null; setSheet: (id: DomainId | 'account' | null) => void;
  newPageId: string | null;
  lock: (to: string) => Plan | null;
};
const NavStateContext = createContext<NavState | null>(null);
export function useNavState() {
  const v = useContext(NavStateContext);
  if (!v) throw new Error('useNavState must be used inside MemberNavProvider');
  return v;
}

/** One place that resolves who the member is for every navigation surface (header, tabs, wayfinding). */
export function MemberNavProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const session = useSession();
  const admin = useIsAdmin(session);
  const shane = useShaneAccount();
  const shared = useSharedSpaceMember() === true;
  const { plan, loading: planLoading } = usePlan();
  const birth = useMyBirth();
  const { items: rels } = useRelationships();
  const custom = useCustomPages();
  const sharedEditions = useSharedEditions();
  const [openMenu, setOpenMenu] = useState<DomainId | null>(null);
  const [sheet, setSheet] = useState<DomainId | 'account' | null>(null);
  const [lastVisit, setLastVisit] = useState<ReadingVisit | null>(null);
  const [newPageId, setNewPageId] = useState<string | null>(null);
  const moonSign = useMemo(() => { if (!birth) return undefined; try { return computeChart(toChartInput(birth)).bodies.find(b => b.key === 'moon')?.sign; } catch { return undefined; } }, [birth]);
  // Route change: close every menu and refresh the "continue reading" pointer.
  useEffect(() => {
    setOpenMenu(null); setSheet(null);
    if (!session) { setLastVisit(null); return; }
    try { setLastVisit(JSON.parse(localStorage.getItem(readingVisitKey(session.user.id)) ?? 'null')); } catch { setLastVisit(null); }
  }, [pathname, session?.user.id]); // eslint-disable-line react-hooks/exhaustive-deps
  // A just-created page glows in its domain menu until it is opened.
  useEffect(() => {
    const id = sessionStorage.getItem(NEW_PAGE_HIGHLIGHT_KEY);
    if (id && custom.some(c => c.id === id)) setNewPageId(id);
    if (id && pathname === `/p/${id}`) { sessionStorage.removeItem(NEW_PAGE_HIGHLIGHT_KEY); setNewPageId(null); }
  }, [custom, pathname]);
  const lock = useCallback((to: string) => planLoading ? null : itemLock(plan, to), [plan, planLoading]);
  const value: NavState = { plan, planLoading, admin, shane, shared, signedIn: !!session, birth, moonSign, rels: rels as Rel[], custom, lastVisit, sharedEditions, openMenu, setOpenMenu, sheet, setSheet, newPageId, lock };
  useMenuTitleFallback(useMemo(() => [...memberDestinations({ shane, shared }), ...custom.map(c => ({ to: `/p/${c.id}`, label: c.title }))], [shane, shared, custom]));
  return <NavStateContext.Provider value={value}>{children}</NavStateContext.Provider>;
}

/** Pages without their own page title get one from their menu label (or heading) instead of keeping the previous page's title. */
export function useMenuTitleFallback(items: { to: string; label: string }[]) {
  const { pathname } = useLocation();
  useEffect(() => {
    let tries = 0; let t = 0;
    const apply = () => {
      if (document.documentElement.dataset.metaPath === pathname) return;
      const heading = document.querySelector('main h1, h1')?.textContent?.trim().replace(/\s+/g, ' ').slice(0, 60);
      const label = items.find(i => i.to === pathname)?.label ?? heading;
      if (!label && ++tries < 8) { t = window.setTimeout(apply, 400); return; }
      document.title = label ? `${label} · Zodaci` : 'Zodaci · Your sky, your story';
    };
    t = window.setTimeout(apply, 400);
    return () => window.clearTimeout(t);
  }, [pathname, items]);
}

function LockBadge({ need }: { need: Plan | null }) {
  if (!need) return null;
  return <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground" title={`Available with ${PLAN_LABEL[need]}`}><Lock className="h-2.5 w-2.5" aria-hidden="true" />{PLAN_LABEL[need]}<span className="sr-only"> plan needed</span></span>;
}
function ItemBadge({ badge }: { badge?: string }) {
  if (!badge) return null;
  return <span className="shrink-0 rounded-full bg-gold/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gold">{badge}</span>;
}

/** Columns for a domain, with live people, created pages and founder items resolved for this account. */
function useDomainColumns(domain: MemberDomain): MemberNavColumn[] {
  const s = useNavState();
  return useMemo(() => {
    const cols = visibleColumns(domain, { shane: s.shane, shared: s.shared }).map(c => c.title === 'Relationships'
      ? { ...c, items: [...c.items, ...s.rels.slice(0, 3).map(r => ({ to: `/relationships/${r.id}`, label: r.name, description: r.relation ? `${r.relation} · chart and reading` : 'Chart, reading and timeline', icon: c.items[0].icon }))], more: s.rels.length > 3 ? { to: '/relationships', label: `All ${s.rels.length} people` } : c.more }
      : c);
    if (domain.id === 'book' && s.sharedEditions.length) cols.splice(0, cols.length, ...withSharedEditions(cols, s.sharedEditions));
    const mine = s.custom.filter(p => domainForMenuGroup(p.menu_group) === domain.id);
    if (mine.length) cols.push({ title: 'Your pages', more: mine.length > 5 ? { to: '/my-astrobook', label: `All ${mine.length} created pages` } : undefined, items: mine.slice(0, 5).map(p => ({ to: `/p/${p.id}`, label: p.status === 'generating' ? `${p.title} · writing…` : p.title, description: 'A page you created', icon: domain.icon, badge: p.id === s.newPageId ? 'New' : undefined })) });
    return cols;
  }, [domain, s.shane, s.shared, s.rels, s.custom, s.newPageId, s.sharedEditions]);
}

function MenuItemLink({ item, onNavigate, dense }: { item: MemberNavItem; onNavigate?: () => void; dense?: boolean }) {
  const { lock, newPageId } = useNavState();
  const Icon = item.icon;
  const glowing = !!newPageId && item.to === `/p/${newPageId}`;
  return (
    <NavLink to={item.to} end onClick={onNavigate} data-mega-item
      className={({ isActive }) => `group flex min-h-11 items-start gap-3 rounded-lg border border-transparent ${dense ? 'p-2' : 'p-2.5'} transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isActive ? 'border-primary/30 bg-primary/10' : 'hover:bg-muted/60'}${glowing ? ' nav-new-glow' : ''}${lock(item.to) ? ' opacity-75' : ''}`}>
      {({ isActive }) => <>
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border bg-card/70 text-gold"><Icon className="h-4 w-4" aria-hidden="true" /></span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-foreground">{item.label}<ItemBadge badge={item.badge} /><LockBadge need={lock(item.to)} />{isActive && <span className="sr-only">(current page)</span>}</span>
          <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{item.description}</span>
        </span>
      </>}
    </NavLink>
  );
}

const COLS: Record<number, string> = { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5' };

function MegaPanel({ domain, onClose }: { domain: MemberDomain; onClose: () => void }) {
  const columns = useDomainColumns(domain);
  const { birth } = useNavState();
  const ref = useRef<HTMLDivElement>(null);
  const onKeyDown = (e: ReactKeyboardEvent) => {
    const links = Array.from(ref.current?.querySelectorAll<HTMLElement>('[data-mega-item], [data-mega-more]') ?? []);
    const at = links.indexOf(document.activeElement as HTMLElement);
    if (at < 0) return;
    const colOf = (el: HTMLElement) => el.closest('[data-mega-col]');
    const go = (i: number) => { e.preventDefault(); links[(i + links.length) % links.length]?.focus(); };
    if (e.key === 'ArrowDown') go(at + 1);
    else if (e.key === 'ArrowUp') go(at - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(links.length - 1);
    else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const cols = Array.from(ref.current?.querySelectorAll('[data-mega-col]') ?? []);
      const ci = cols.indexOf(colOf(links[at]) as Element);
      const next = cols[(ci + (e.key === 'ArrowRight' ? 1 : -1) + cols.length) % cols.length];
      const first = next?.querySelector<HTMLElement>('[data-mega-item], [data-mega-more]');
      if (first) { e.preventDefault(); first.focus(); }
    }
  };
  return (
    <div ref={ref} id={`mega-${domain.id}`} role="region" aria-label={`${domain.label} menu`} onKeyDown={onKeyDown}
      className="mega-fade absolute inset-x-0 top-full max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-border bg-background/95 shadow-2xl backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
        <div className="space-y-3">
          <p className="font-display text-2xl leading-tight">{domain.label}</p>
          <p className="text-sm text-muted-foreground">{domain.description}</p>
          {domain.id === 'chart' && birth && <p className="text-xs text-muted-foreground">Calculated from {birth.date}{birth.time ? ` · ${birth.time}` : ' · time unknown'} · {birth.placeLabel}</p>}
          <Button asChild size="sm"><Link to={domain.hub} onClick={onClose} data-mega-more>{domain.hubLabel}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></Button>
        </div>
        <div className={`grid gap-6 md:grid-cols-2 ${COLS[Math.min(columns.length, 5)]}`}>
          {columns.map(col => (
            <div key={col.title} data-mega-col className="min-w-0">
              <p className="mb-2 px-2.5 font-smallcaps text-xs text-gold">{col.title}</p>
              <ul className="space-y-0.5">{col.items.map(item => <li key={item.to}><MenuItemLink item={item} onNavigate={onClose} /></li>)}</ul>
              {col.more && <Link to={col.more.to} onClick={onClose} data-mega-more className="mt-2 inline-flex min-h-11 items-center gap-1 rounded px-2.5 text-xs text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{col.more.label}<ArrowRight className="h-3 w-3" aria-hidden="true" /></Link>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SearchIconButton() {
  return <Button type="button" variant="ghost" size="icon" className="min-h-11 min-w-11" aria-label="Find pages and readings (Ctrl or Cmd + K)" title="Search (⌘K)"
    onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}><Search className="h-4 w-4" /></Button>;
}

/** Sticky header: five domain mega-menus on tablet/desktop; logo and page actions on phones. */
export function MemberHeader() {
  const { pathname } = useLocation();
  const s = useNavState();
  const headerRef = useRef<HTMLElement>(null);
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const active = domainFor(pathname);
  const open = s.openMenu;
  const close = useCallback((focusTrigger = false) => {
    const was = s.openMenu; s.setOpenMenu(null);
    if (focusTrigger && was) triggers.current[was]?.focus();
  }, [s]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!headerRef.current?.contains(e.target as Node)) s.setOpenMenu(null); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); close(true); } };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open, close, s]);
  const focusFirst = (id: DomainId) => requestAnimationFrame(() => document.querySelector<HTMLElement>(`#mega-${id} [data-mega-item]`)?.focus());
  const onTriggerKey = (e: ReactKeyboardEvent, id: DomainId, index: number) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); s.setOpenMenu(id); focusFirst(id); }
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = MEMBER_DOMAINS[(index + (e.key === 'ArrowRight' ? 1 : -1) + MEMBER_DOMAINS.length) % MEMBER_DOMAINS.length];
      triggers.current[next.id]?.focus();
      if (open) s.setOpenMenu(next.id);
    }
  };
  const domain = open ? domainById(open) : null;
  const newPageDomain = s.newPageId ? s.custom.find(c => c.id === s.newPageId) : undefined;
  return (
    <header ref={headerRef} onBlur={e => { if (open && !headerRef.current?.contains(e.relatedTarget as Node)) s.setOpenMenu(null); }}
      className="sticky top-0 z-40 border-b border-border bg-background/85 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-3 sm:px-6">
        <NavLink to="/dashboard" className="mr-1 min-w-0 shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Zodaci dashboard"><span className="lg:hidden"><ZodaciLogo compact /></span><span className="hidden lg:inline"><ZodaciLogo /></span></NavLink>
        <nav aria-label="Main menu" className="hidden min-w-0 items-center gap-0.5 md:flex">
          {MEMBER_DOMAINS.map((d, i) => {
            const isOpen = open === d.id; const isActive = active === d.id;
            const hasNew = newPageDomain && domainForMenuGroup(newPageDomain.menu_group) === d.id;
            return (
              <button key={d.id} ref={el => { triggers.current[d.id] = el; }} type="button" aria-expanded={isOpen} aria-controls={`mega-${d.id}`} aria-haspopup="true"
                onClick={() => s.setOpenMenu(isOpen ? null : d.id)} onKeyDown={e => onTriggerKey(e, d.id, i)}
                onPointerEnter={e => { if (e.pointerType === 'mouse' && open && open !== d.id) s.setOpenMenu(d.id); }}
                className={`relative inline-flex min-h-11 items-center gap-1 rounded-md px-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:px-3 ${isOpen ? 'bg-muted text-foreground' : isActive ? 'text-foreground' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}`}>
                {d.label}<ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                {isActive && <span className="absolute inset-x-2.5 -bottom-[13px] h-0.5 rounded-full bg-gold" aria-hidden="true" />}
                {isActive && <span className="sr-only">(current section)</span>}
                {hasNew && <span className="absolute right-1 top-2 h-1.5 w-1.5 rounded-full bg-created" aria-label="new page added" />}
              </button>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-0.5">
          {!s.planLoading && s.plan === 'free' && <Button asChild variant="outline" size="sm" className="mr-1 hidden xl:inline-flex"><Link to="/pricing">Free plan · Upgrade</Link></Button>}
          <SearchIconButton />
          <BookmarkButton icon />
          <span className="hidden sm:inline-flex"><ChatAboutButton icon /></span>
          <span className="ml-1"><AccountButton compact /></span>
        </div>
      </div>
      {domain && <MegaPanel domain={domain} onClose={() => s.setOpenMenu(null)} />}
    </header>
  );
}

function SheetList({ columns, onNavigate }: { columns: MemberNavColumn[]; onNavigate: () => void }) {
  return <div className="space-y-6">{columns.map(col => (
    <section key={col.title} aria-label={col.title}>
      <h3 className="mb-1 px-2 font-smallcaps text-xs text-gold">{col.title}</h3>
      <ul className="space-y-0.5">{col.items.map(item => <li key={item.to}><MenuItemLink item={item} onNavigate={onNavigate} dense /></li>)}</ul>
      {col.more && <Link to={col.more.to} onClick={onNavigate} className="mt-1 inline-flex min-h-11 items-center gap-1 px-2 text-xs text-primary">{col.more.label}<ArrowRight className="h-3 w-3" aria-hidden="true" /></Link>}
    </section>
  ))}</div>;
}

function DomainSheetBody({ domain, onNavigate }: { domain: MemberDomain; onNavigate: () => void }) {
  const columns = useDomainColumns(domain);
  return <>
    <SheetHeader className="text-left"><SheetTitle className="font-display text-2xl">{domain.label}</SheetTitle><SheetDescription>{domain.description}</SheetDescription></SheetHeader>
    <Button asChild className="my-4 w-full"><Link to={domain.hub} onClick={onNavigate}>{domain.hubLabel}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></Button>
    <SheetList columns={columns} onNavigate={onNavigate} />
  </>;
}

function AccountSheetBody({ onNavigate }: { onNavigate: () => void }) {
  const menu = useAccountMenu();
  const learn = useDomainColumns(domainById('learn'));
  const link = (to: string, label: string, Icon: typeof UserRound) => <li key={to}><Link to={to} onClick={onNavigate} className="flex min-h-11 items-center gap-3 rounded-lg px-2 text-sm hover:bg-muted/60"><Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />{label}<span className="ml-auto"><LockBadge need={menu.lock(to)} /></span></Link></li>;
  return <>
    <SheetHeader className="text-left"><SheetTitle className="sr-only">Account</SheetTitle><SheetDescription className="sr-only">Account, help and learning</SheetDescription><AccountSummary menu={menu} /></SheetHeader>
    {!menu.planLoading && <Link to="/pricing" onClick={onNavigate} className="my-4 flex items-center justify-between rounded-xl border border-primary/40 bg-primary/10 p-3 text-sm"><span>{PLAN_LABEL[menu.plan]} plan</span>{menu.plan !== 'creator' && <span className="text-primary">Upgrade →</span>}</Link>}
    <div className="space-y-6">
      <section aria-label="Account"><h3 className="mb-1 px-2 font-smallcaps text-xs text-gold">Account</h3><ul>{ACCOUNT_MENU.map(a => link(a.to, a.label, a.icon))}</ul></section>
      <section aria-label="Learn"><h3 className="mb-1 px-2 font-smallcaps text-xs text-gold">Learn</h3><SheetList columns={learn.map(c => ({ ...c, title: '' }))} onNavigate={onNavigate} /></section>
      {(menu.admin || menu.editionSwitch.length > 0) && <section aria-label="Admin"><h3 className="mb-1 px-2 font-smallcaps text-xs text-gold">Admin</h3><ul>
        {menu.admin && ADMIN_MENU.map(a => link(a.to, a.label, a.icon))}
        {menu.editionSwitch.map(({ label, icon: Icon, run }) => <li key={label}><button type="button" onClick={run} data-keep-wording className="flex min-h-11 w-full items-center gap-3 rounded-lg px-2 text-left text-sm hover:bg-muted/60"><Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />{label}</button></li>)}
      </ul></section>}
      <button type="button" onClick={() => { onNavigate(); void menu.signOut(); }} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-2 text-left text-sm hover:bg-muted/60"><LogOut className="h-4 w-4 text-muted-foreground" aria-hidden="true" />Sign out</button>
    </div>
  </>;
}

const TABS: { id: DomainId | 'account'; label: string }[] = [{ id: 'chart', label: 'Chart' }, { id: 'readings', label: 'Readings' }, { id: 'book', label: 'Book' }, { id: 'explore', label: 'Explore' }, { id: 'account', label: 'Account' }];
export const hidesTabBar = (path: string) => ADMIN_PATHS.some(p => path === p || path.startsWith(`${p}/`));

/** Phone navigation: five fixed tabs; each opens a sheet with the hub and every item in that domain. */
export function MobileTabBar() {
  const { pathname } = useLocation();
  const s = useNavState();
  const current = domainFor(pathname);
  const activeTab = current === 'learn' ? 'account' : current;
  const close = () => s.setSheet(null);
  const go = useNavigate();
  const tap = (id: DomainId | 'account', active: boolean) => {
    if (id === 'account' || active) { s.setSheet(s.sheet === id ? null : id); return; }
    s.setSheet(null); go(domainById(id).hub);
  };
  return <>
    <nav aria-label="Main tabs" data-mobile-tabbar className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <ul className="grid h-16 grid-cols-5">
        {TABS.map(t => {
          const Icon = t.id === 'account' ? UserRound : domainById(t.id).icon;
          const isActive = activeTab === t.id;
          return <li key={t.id} className="contents"><button type="button" onClick={() => tap(t.id, isActive)} aria-haspopup={t.id === 'account' || isActive ? 'dialog' : undefined} aria-expanded={s.sheet === t.id}
            className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${isActive ? 'text-gold' : 'text-muted-foreground'}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />{t.label}{isActive && <span className="sr-only">(current section)</span>}
          </button></li>;
        })}
      </ul>
    </nav>
    <Sheet open={s.sheet !== null} onOpenChange={o => { if (!o) close(); }}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:hidden">
        {s.sheet === 'account' ? <AccountSheetBody onNavigate={close} /> : s.sheet ? <DomainSheetBody domain={domainById(s.sheet)} onNavigate={close} /> : null}
      </SheetContent>
    </Sheet>
  </>;
}
