import { AdminEditionSwitch } from '@/components/common/AdminEditionSwitch';
import { PageErrorBoundary } from '@/components/common/PageErrorBoundary';
import { VerifySources } from '@/components/common/VerifySources';
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion, useReducedMotion } from 'framer-motion';
import ParticleField from '@/components/fx/ParticleField';
import ScrollProgress from '@/components/fx/ScrollProgress';
import { FirstViewReveal } from '@/components/fx/FirstViewReveal';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { GenerationProgress } from '@/components/readings/GenerationProgress';
import { founderPlace, onlyInFullEdition, orderFounderGroups } from '@/lib/founderEdition';
import { domainFor } from '@/content/memberNav';
import { useShaneAccount } from '@/hooks/useShaneAccount';
import { loadEditionIndex } from '@/pages/ShaneEdition';
import { useZacAccount } from '@/hooks/useZacAccount';
import { viewingSharedEdition } from '@/hooks/useAprilSpace';
import { useSession } from '@/hooks/useLibrary';
import { useAprilSpace, useAprilSpaceError, retryAprilSpace, useClassicView, setClassicView } from '@/hooks/useAprilSpace';

/** April's full menu exactly as the sidebar shows it: her sections plus Shared, Relationships and pages she created. */
const ADMIN_ONLY = ['/admin', '/dispatch', '/data-quality'];
const FounderGroupsContext = createContext<NavGroup[] | null>(null);
function useFounderGroups(): NavGroup[] {
  const { items: rels } = useRelationships();
  const custom = useCustomPages();
  const badges = useSharedBadges();
  const aprilGroups = APRIL_NAV_GROUPS; // private payload; re-read each render so late registration shows up
  return useMemo(() => {
    const shared = { ...SHARED_GROUP, items: SHARED_GROUP.items.map(item => ({ ...item, badge: item.to === '/shared/conversations' ? badges.chat : item.to === '/shared/wonderings' ? badges.wonderings : undefined })) };
    const relationships = { ...RELATIONSHIPS_GROUP, items: [...RELATIONSHIPS_GROUP.items, ...rels.map(r => ({ to: `/relationships/${r.id}`, label: `↳ ${r.name}${r.relation ? ` · ${r.relation}` : ''}` }))] };
    // Admin pages never appear in April's menu; the admin opens her edition from his own account.
    const noAdmin = (gs: NavGroup[]) => gs.map(g => ({ ...g, items: g.items.filter(i => !ADMIN_ONLY.includes(i.to)), submenus: g.submenus?.map(sm => ({ ...sm, items: sm.items.filter(i => !ADMIN_ONLY.includes(i.to)) })) })).filter(g => g.items.length || g.submenus?.length);
    // Her own Official AstroBook section: only her Masterbook and her AstroComic (the server lists nothing else for her).
    const official: NavGroup = { title: 'Official AstroBook', items: [{ to: '/official-astrobook', label: 'My Official AstroBook' }, { to: '/official-astrobook/comic/april', label: 'My Official AstroComic' }] };
    return orderFounderGroups(noAdmin([...aprilGroups.slice(0, 2), shared, relationships, ...aprilGroups.slice(2), official]))
      .map(g => ({ ...g, items: [...g.items, ...custom.filter(c => c.menu_group === g.title).map(c => ({ to: `/p/${c.id}`, label: c.status === 'generating' ? `${c.title} · writing…` : c.title, created: true } as NavItem))] }));
  }, [aprilGroups, badges.chat, badges.wonderings, rels, custom]);
}
/** Shane's full edition menu: his own edition and chapters, shared pages, relationships and admin tools. */
function useShaneGroups(enabled: boolean, area: 'shane' | 'zac' = 'shane'): NavGroup[] {
  const { items: rels } = useRelationships();
  const badges = useSharedBadges();
  const [chapters, setChapters] = useState<{ id: string; label: string; title?: string; part: string }[] | null>(null);
  const { pathname } = useLocation();
  const listed = !!chapters?.length;
  // Retry after navigation so chapters appear once the edition is unlocked.
  useEffect(() => { if (!enabled || listed) return; let on = true; loadEditionIndex(area).then(e => { if (on) setChapters(e); }).catch(() => { if (on) setChapters([]); }); return () => { on = false; }; }, [enabled, listed, pathname, area]);
  return useMemo(() => {
    const parts = new Map<string, NavItem[]>();
    for (const c of chapters ?? []) parts.set(c.part || 'Chapters', [...(parts.get(c.part || 'Chapters') ?? []), { to: `/${area}/${c.id}`, label: c.title || c.label }]);
    const shared = { ...SHARED_GROUP, items: SHARED_GROUP.items.map(item => ({ ...item, badge: item.to === '/shared/conversations' ? badges.chat : item.to === '/shared/wonderings' ? badges.wonderings : undefined })) };
    const relationships = { ...RELATIONSHIPS_GROUP, items: [...RELATIONSHIPS_GROUP.items, ...rels.map(r => ({ to: `/relationships/${r.id}`, label: `↳ ${r.name}${r.relation ? ` · ${r.relation}` : ''}` }))] };
    const chapterGroup = { title: area === 'zac' ? 'Library Chapters' : 'Masterbook Chapters', items: chapters === null ? [{ to: `/${area}`, label: 'Loading chapters…' }] : chapters.length ? [] : [{ to: `/${area}`, label: 'Chapters couldn’t load — open the edition' }], submenus: [...parts.entries()].map(([label, items]) => ({ label, items })) } as NavGroup;
    if (area === 'zac') return [
      { title: 'My Edition', items: [{ to: '/dashboard', label: 'Home' }, { to: '/zac', label: 'My Astrological Library' }, { to: '/zac/workbook', label: 'My Workbook' }, { to: '/my-chart', label: 'My chart' }, { to: '/transits', label: 'Transits' }, { to: '/counselors', label: 'Counselors' }] },
      chapterGroup,
      { title: 'Official AstroBook', items: [{ to: '/official-astrobook', label: 'My Official AstroBook' }, { to: '/official-astrobook/comic/zac', label: 'My Official AstroComic' }, { to: '/investors', label: 'Investor overview' }, { to: '/store', label: 'Shop' }] },
    ] as NavGroup[];
    return [
      { title: 'My Edition', items: [{ to: '/dashboard', label: 'Home' }, { to: '/shane', label: 'My Masterbook' }, { to: '/my-chart', label: 'My chart' }, { to: '/my-readings', label: 'My readings' }, { to: '/transits', label: 'Transits' }] },
      chapterGroup,
      shared, relationships,
      { title: 'Official AstroBook', items: [{ to: '/official-astrobook', label: 'All Official AstroBooks' }, { to: '/official-astrobook/comic/shane', label: 'My Official AstroComic' }, { to: '/official-astrobook/illustrated', label: 'Zodaci Illustrated · Oct 2026' }] },
      { title: 'Together & Media', items: [{ to: '/our-charts', label: 'Our charts' }, { to: '/podcasts', label: 'Podcasts' }, { to: '/investors', label: 'Investor overview' }, { to: '/store', label: 'Shop' }] },
      { title: 'Family Editions', items: [{ to: '/zac', label: 'Zac’s Astrological Library' }, { to: '/zac/workbook', label: 'Zac’s Workbook' }, { to: '/official-astrobook/comic/zac', label: 'Zac’s AstroComic' }, { to: '/official-astrobook/comic/april', label: 'April’s AstroComic' }] },
      { title: 'Admin', items: [{ to: '/admin', label: 'Admin dashboard' }, { to: '/dispatch', label: 'Dispatch' }] },
    ] as NavGroup[];
  }, [chapters, rels, badges.chat, badges.wonderings, area]);
}
type FounderEditionName = 'april' | 'shane' | 'zac';
const EditionContext = createContext<FounderEditionName>('april');

const cleanLabel = (l: string) => l.replace(/^↳\s*/, '');

/** April's breadcrumb (section › page) from her own menu; hidden on the first page of a section. */
function FounderTrail() {
  const { pathname } = useLocation();
  const groups = useContext(FounderGroupsContext) ?? APRIL_NAV_GROUPS;
  const place = founderPlace(groups, pathname);
  if (!place || (!place.parent && place.home.to === pathname)) return null;
  const crumb = 'hover:text-foreground underline-offset-2 hover:underline';
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted-foreground">
      <Link to={place.home.to} className={crumb}>{place.section}</Link>
      <span aria-hidden="true" className="mx-2">›</span>
      {place.parent
        ? <><Link to={place.parent.to} className={crumb}>{cleanLabel(place.parent.label)}</Link><span aria-hidden="true" className="mx-2">›</span><span className="text-foreground" aria-current="page">This page</span></>
        : <span className="text-foreground" aria-current="page">{cleanLabel(place.label)}</span>}
    </nav>
  );
}

/** "Continue in this section": the next pages in April's own menu, so no page is a dead end. */
function FounderNext() {
  const { pathname } = useLocation();
  const groups = useContext(FounderGroupsContext) ?? APRIL_NAV_GROUPS;
  const place = founderPlace(groups, pathname);
  if (!place || !place.next.length) return null;
  return (
    <nav aria-labelledby="founder-next" className="mt-16 border-t border-border pt-8 print:hidden">
      <h2 id="founder-next" className="font-display text-2xl">Continue in {place.section}</h2>
      <ul className="mt-5 grid gap-3 sm:grid-cols-3">
        {place.next.map(n => <li key={n.to}><Link to={n.to} className="flex h-full items-center justify-between gap-2 rounded-xl border border-border bg-card/60 p-4 text-sm hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span>{place.parent?.to === n.to ? `Back to ${cleanLabel(n.label)}` : cleanLabel(n.label)}</span><span aria-hidden="true">→</span></Link></li>)}
      </ul>
    </nav>
  );
}

/** Shown in classic view for founders: one click back to the full private edition. */
function ClassicViewBanner() {
  const { pathname } = useLocation();
  const fullOnly = onlyInFullEdition(APRIL_NAV_GROUPS, pathname, domainFor(pathname) !== null);
  return (
    <div role="status" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm">
      <span>{fullOnly ? "This page is part of your full edition — the classic menu doesn't list it, so it opens as written for you." : "You're seeing the classic view — the same pages and menus every member sees."}</span>
      <Button size="sm" variant="outline" onClick={() => setClassicView(false)}>Back to your full edition</Button>
    </div>
  );
}
import { useSharedSpaceMember } from '@/hooks/useSharedSpaceMember';
import { PublicWording } from '@/components/common/PublicWording';
import { PublicChartFallback, isPublicPath } from '@/components/common/PublicChartFallback';
import { useRelationships } from '@/hooks/useRelationships';
import { CommandPaletteTrigger } from '@/components/common/CommandPalette';
import { BookmarkButton } from '@/components/common/BookmarkButton';
import { PlayerProvider } from '@/components/podcast/PlayerContext';
import { AccountButton } from '@/components/common/AccountButton';
import { useCustomPages, NEW_PAGE_HIGHLIGHT_KEY } from '@/hooks/useCustomPages';
import { useSharedBadges } from '@/hooks/useSharedBadges';
import { Button } from '@/components/ui/button';
import { APRIL_NAV_GROUPS, RELATIONSHIPS_GROUP, SHARED_GROUP, planAllows, requiredPlan, type NavGroup, type NavItem } from '@/content/navigation';
import { usePlan } from '@/hooks/usePlan';
import { PlanLock } from '@/components/common/PlanLock';
import type { ReactNode } from 'react';
import { ZodaciLogo } from '@/components/brand/ZodaciLogo';
import { WelcomeTour } from '@/components/common/WelcomeTour';
import { MemberHeader, MemberNavProvider, MobileTabBar, hidesTabBar, useMenuTitleFallback } from './MemberNav';
import { PublicHeader } from '@/components/brand/PublicHeader';
import { GlobalFooter } from '@/components/brand/GlobalFooter';
import { NextStepPanel, WayfindingTop } from './Wayfinding';

function PlanGuard({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { plan, loading } = usePlan();
  const need = requiredPlan(pathname);
  if (need === 'free') return <>{children}</>;
  if (loading) return <p role="status" className="text-muted-foreground">Checking your plan…</p>;
  return planAllows(plan, need) ? <>{children}</> : <PlanLock need={need} />;
}

const KEEP_NAME_PATHS = ['/shared', '/our-charts', '/podcasts', '/shane', '/zac', '/admin', '/investors', '/official-astrobook'];
const SIGNED_OUT_PATHS = ['/auth', '/pricing', '/books', '/reset-password'];
const GROUP_COLORS = ['--primary', '--oxblood', '--accent', '--candle', '--gold-bright', '--starlight', '--gold', '--glow-violet'];

/** Route change: scroll to the top (or the linked section) and move keyboard focus from the menu to the page. */
function useRouteChangeFocus() {
  const { pathname, hash } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    if (hash) {
      let tries = 0;
      const t = window.setInterval(() => {
        const el = document.getElementById(decodeURIComponent(hash.slice(1)));
        if (el) { el.scrollIntoView({ block: 'start' }); window.clearInterval(t); } else if (++tries > 15) window.clearInterval(t);
      }, 150);
      return () => window.clearInterval(t);
    }
    if (first.current) { first.current = false; return; }
    const active = document.activeElement;
    const inChrome = !active || active === document.body || !!active.closest('header, nav, [role="dialog"], aside');
    if (inChrome) document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [pathname, hash]);
}

export function AppShell() {
  const location = useLocation();
  const april = useAprilSpace();
  const classic = useClassicView();
  const editionFailed = useAprilSpaceError();
  const shane = useShaneAccount();
  const zacOwn = useZacAccount();
  const zac = zacOwn || viewingSharedEdition() === 'zac';
  // April and Shane's joint pages and admin tools keep real names; elsewhere April-written copy reads as "you".
  const founderState = useSharedSpaceMember();
  // Wait for the membership answer so names are never rewritten before it arrives.
  const keepNames = founderState !== false && KEEP_NAME_PATHS.some(p => location.pathname === p || location.pathname.startsWith(`${p}/`));
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session)).catch(() => setSignedIn(false));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => data.subscription.unsubscribe();
  }, []);
  useRouteChangeFocus();

  if (signedIn === null) return <div role="status" className="p-8 text-muted-foreground">Opening Zodaci…</div>;
  // Signed-out visitors never see the member menu: open pages get the public header, everything else asks to sign in first.
  if (!signedIn) {
    if (location.pathname === '/') return <Navigate to="/welcome" replace />;
    if (!SIGNED_OUT_PATHS.includes(location.pathname)) return <Navigate to={`/auth?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
    return (
      <div className="min-h-screen bg-background text-foreground">
        <PublicHeader />
        <main id="main-content" className="mx-auto max-w-5xl px-4 py-10 sm:px-8"><PageErrorBoundary key={location.pathname}><Outlet /></PageErrorBoundary></main>
        <GlobalFooter />
      </div>
    );
  }
  // Founders can switch to the classic view: the same pages and menu every member sees.
  const founder = april && !classic;
  const shaneFull = !april && shane && !classic;
  const zacFull = !april && !shane && zac && !classic;
  // Classic view shows the member version of every page the member menu lists; pages that exist only in
  // April's full edition keep their original content rather than falling back to unrelated member pages.
  const ownPage = !!april && classic && onlyInFullEdition(APRIL_NAV_GROUPS, location.pathname, domainFor(location.pathname) !== null);
  const page = <PageErrorBoundary key={location.pathname}>{editionFailed && <div role="alert" className="mb-4 rounded-2xl border border-gold/40 bg-card/60 p-4 text-sm"><p className="font-medium text-foreground">Your private edition couldn't open.</p><p className="mt-1 text-muted-foreground">Your connection may have dropped, so you're seeing the member view for now.</p><Button size="sm" variant="outline" className="mt-3" onClick={retryAprilSpace}>Try again</Button></div>}{!founder && !keepNames && !ownPage && <PublicWording />}{april === undefined && !isPublicPath(location.pathname) ? null : founder || ownPage ? <Outlet /> : <PlanGuard>{isPublicPath(location.pathname) ? <Outlet /> : <PublicChartFallback />}</PlanGuard>}<VerifySources /></PageErrorBoundary>;
  if (zacFull) return <AprilShell edition="zac">{page}</AprilShell>;
  if (shaneFull) return <AprilShell edition="shane">{page}</AprilShell>;
  if (!founder) return <MemberShell>{(april || shane || zac) && classic && <ClassicViewBanner />}{page}</MemberShell>;
  return <AprilShell>{page}</AprilShell>;
}

/** Member app: five-domain header with mega-menus, phone tab bar, quick-access row, breadcrumbs and next steps. */
function MemberShell({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const location = useLocation();
  const tabs = !hidesTabBar(location.pathname);
  return (
    <PlayerProvider>
    <MemberNavProvider>
    <div className="member-experience relative flex min-h-screen flex-col text-foreground">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">Skip to content</a>
      <ScrollProgress /><FirstViewReveal />
      <ParticleField />
      <MemberHeader />
      <main id="main-content" tabIndex={-1} className={`relative z-10 flex-1 outline-none ${tabs ? 'pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0' : ''}`}>
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-10 lg:py-12">
          <WayfindingTop />
          <motion.div key={location.pathname} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.9, ease: [0.2, 0.7, 0.2, 1] }}>
            {children}
          </motion.div>
          <NextStepPanel />
          <GenerationProgress /><WelcomeTour />
        </div>
        <footer className="mt-16 border-t border-border">
          <div className="mx-auto max-w-5xl px-5 py-10 text-sm text-muted-foreground sm:px-8">
            <div className="gold-rule mb-6" />
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="font-smallcaps text-xs">Zodaci · Your sky, your story</div>
              <nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-2 text-xs">{[['/instructions', 'Help'], ['/faq', 'FAQ'], ['/about', 'About'], ['/privacy', 'Privacy'], ['/terms', 'Terms']].map(([to, label]) => <Link key={to} to={to} className="hover:text-foreground">{label}</Link>)}</nav>
            </div>
          </div>
        </footer>
      </main>
      {tabs && <MobileTabBar />}
    </div>
    </MemberNavProvider>
    </PlayerProvider>
  );
}

/** April's private edition keeps her original sidebar menu and colour-coded groups. */
function AprilShell({ children, edition = 'april' }: { children: ReactNode; edition?: FounderEditionName }) {
  const reduceMotion = useReducedMotion();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const openedRef = useRef(false);
  const navigatedRef = useRef(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const aprilGroups = useFounderGroups();
  const shaneGroups = useShaneGroups(edition !== 'april', edition === 'zac' ? 'zac' : 'shane');
  const groups = edition !== 'april' ? shaneGroups : aprilGroups;
  // The phone top bar grows with notches and larger text; the menu and page start right below its real height.
  const [headerH, setHeaderH] = useState(64);
  useEffect(() => {
    const el = headerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setHeaderH(Math.ceil(el.getBoundingClientRect().height) || 64));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    // While the phone menu is open, the page behind it can't be reached by keyboard or screen reader.
    for (const el of [mainRef.current, asideRef.current]) { if (open) el?.setAttribute('inert', ''); else el?.removeAttribute('inert'); }
    // Dismissing returns focus to the menu button; choosing a page leaves focus on the new page instead.
    if (!open && openedRef.current && !navigatedRef.current) menuButtonRef.current?.focus();
    if (!open && navigatedRef.current) requestAnimationFrame(() => { if (document.activeElement === document.body) mainRef.current?.focus({ preventScroll: true }); });
    navigatedRef.current = false;
    openedRef.current = open;
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const panel = mobileMenuRef.current;
    panel?.querySelector<HTMLElement>('a, button')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); menuButtonRef.current?.focus(); return; }
      if (e.key !== 'Tab' || !panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  return (
    <EditionContext.Provider value={edition}>
    <FounderGroupsContext.Provider value={groups}>
    <PlayerProvider>
    <div className="min-h-screen flex text-foreground relative" style={{ ['--founder-header-h' as string]: `${headerH}px` }}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">Skip to content</a>
      <ScrollProgress /><FirstViewReveal />
      <ParticleField />
      <aside ref={asideRef} className="hidden lg:flex w-72 shrink-0 flex-col border-r border-border/60 bg-card/40 backdrop-blur-xl sticky top-0 h-screen z-10">
        <SidebarInner />
      </aside>
      <div ref={headerRef} className="lg:hidden fixed top-0 inset-x-0 z-50 flex min-h-[64px] items-center justify-between gap-2 border-b border-border bg-background/95 px-3 py-2 backdrop-blur-xl pt-[max(0.5rem,env(safe-area-inset-top))]">
        <NavLink to="/" className="min-w-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ZodaciLogo compact /></NavLink>
        <div className="flex items-center gap-2"><AccountButton compact /><Button ref={menuButtonRef} type="button" size="icon" variant="ghost" onClick={() => setOpen(v => !v)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-menu" className="min-h-11 min-w-11">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button></div>
      </div>
      {open && (
        <div ref={mobileMenuRef} id="mobile-menu" role="dialog" aria-modal="true" aria-label="Zodaci menu" className="lg:hidden fixed inset-x-0 bottom-0 top-[var(--founder-header-h,64px)] z-40 overflow-y-auto overscroll-contain bg-background pb-[env(safe-area-inset-bottom)]">
          <div className="sticky top-0 z-10 flex justify-end border-b border-border/60 bg-background/95 px-3 py-2 backdrop-blur-xl">
            <Button type="button" variant="ghost" size="sm" className="min-h-11" onClick={() => setOpen(false)}><X className="h-4 w-4" aria-hidden="true" />Close menu</Button>
          </div>
          <SidebarInner mobile onNavigate={() => { navigatedRef.current = true; setOpen(false); }} />
        </div>
      )}
      <main ref={mainRef} id="main-content" tabIndex={-1} className="flex-1 min-w-0 lg:pt-0 pt-[var(--founder-header-h,64px)] relative z-10 outline-none">
        <div className="mx-auto max-w-5xl px-4 sm:px-8 py-8 sm:py-10 lg:py-14">
          <motion.div key={location.pathname} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.9, ease: [0.2, 0.7, 0.2, 1] }}>
            <FounderTrail />
            {children}
            <FounderNext />
          </motion.div>
        </div>
        <footer className="border-t border-border mt-16">
          <div className="mx-auto max-w-5xl px-5 sm:px-8 py-10 text-sm text-muted-foreground">
            <div className="gold-rule mb-6" />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="font-smallcaps text-xs">Your private edition</div>
              <div className="font-smallcaps text-xs">An Illuminated Compendium · Ink on Vellum · Touched with Gold</div>
            </div>
          </div>
        </footer>
      </main>
    </div>
    </PlayerProvider>
    </FounderGroupsContext.Provider>
    </EditionContext.Provider>
  );
}

function SidebarInner({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const custom = useCustomPages();
  const navRef = useRef<HTMLElement>(null);
  const [glowId, setGlowId] = useState<string | null>(null);
  // After a page is created: scroll its new menu item into view and make it glow.
  useEffect(() => {
    const id = sessionStorage.getItem(NEW_PAGE_HIGHLIGHT_KEY);
    if (!id || !custom.some(c => c.id === id)) return;
    const raf = requestAnimationFrame(() => {
      const el = navRef.current?.querySelector<HTMLElement>(`[data-nav-to="/p/${id}"]`);
      if (!el || !el.offsetParent) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setGlowId(id);
      sessionStorage.removeItem(NEW_PAGE_HIGHLIGHT_KEY);
      window.setTimeout(() => setGlowId(null), 8500);
    });
    return () => cancelAnimationFrame(raf);
  }, [custom]);
  const allGroups = useContext(FounderGroupsContext) ?? APRIL_NAV_GROUPS;
  const edition = useContext(EditionContext);
  useMenuTitleFallback(useMemo(() => allGroups.flatMap(g => [...g.items, ...(g.footer ?? []), ...(g.submenus ?? []).flatMap(s => s.items)]), [allGroups]));
  return (
    <div className={`founder-sidebar flex min-h-full flex-col gap-6 overflow-x-hidden ${mobile ? 'px-4 pb-8 pt-4' : 'h-full overflow-y-auto p-6'}`}>
      <div>
        <div className="flex items-center justify-between gap-2"><ZodaciLogo />{!mobile && <AccountButton compact />}</div>
        <div className="mt-3"><AdminEditionSwitch fullEdition /></div>
        <div className="font-display text-2xl leading-tight mt-1">{edition === 'shane' ? 'Shane' : edition === 'zac' ? 'Zac' : 'April'}</div>
        <div className="text-xs text-muted-foreground mt-1">Private edition</div>
        <div className="gold-rule my-4" />
      </div>
      <div className="pt-1 space-y-2"><CommandPaletteTrigger label="Search the compendium" /><BookmarkButton /></div>
      <nav ref={navRef} aria-label="Site menu" className="flex flex-col gap-4 text-sm">
        {allGroups.map((g, gi) => (
          <div key={g.title} className={`flex flex-col gap-0.5 ${g.title === "April's Workbook" ? 'nav-workbook-section' : ''}${g.title === 'Themes & Topics' ? ' nav-topics-section' : ''}${g.title === 'Timing & Cycles' ? ' nav-timing-section' : ''}`}>
            <div className={`font-smallcaps text-xs px-3 py-2 mb-1 rounded border-l-2 font-semibold tracking-wider ${g.title === "April's Workbook" ? 'nav-workbook-title' : ''}`} style={g.title !== "April's Workbook" ? { color: `hsl(var(${GROUP_COLORS[gi % GROUP_COLORS.length]}))`, borderColor: `hsl(var(${GROUP_COLORS[gi % GROUP_COLORS.length]}))`, background: `hsl(var(${GROUP_COLORS[gi % GROUP_COLORS.length]}) / 0.1)` } : undefined}>{g.title}</div>
            {g.items.map(n => (
              <NavLink
                key={n.to} to={n.to} onClick={onNavigate} data-nav-to={n.to} end={n.to === '/' || n.to === '/masterbook' || n.to === '/relationships' || n.to === '/workbook' || n.to === '/shared'}
                className={({ isActive }) =>
                  `flex min-h-11 items-center justify-between gap-2 rounded border border-transparent px-3 py-2 transition-colors ${
                    isActive ? 'bg-accent/15 border-accent/30 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }${n.created ? ' bg-created/20 text-foreground' : ''}${n.to === '/create' ? ' nav-create-glow' : ''}${glowId && n.to === `/p/${glowId}` ? ' nav-new-glow' : ''}`
                }
              ><span>{n.label}{n.created ? <span className="sr-only"> (created page)</span> : null}{glowId && n.to === `/p/${glowId}` ? <span className="sr-only"> — just added</span> : null}</span>{n.badge ? <span className="min-w-5 rounded-full bg-primary px-1.5 text-center text-[10px] text-primary-foreground" aria-label={`${n.badge} new`}>{n.badge}</span> : null}</NavLink>
            ))}
            {g.submenus?.map(submenu => (
                <div key={submenu.label}>
                  <p className="px-3 py-2 text-xs font-medium text-muted-foreground">{submenu.label}</p>
                  <div className="ml-3 flex flex-col gap-0.5 border-l border-border/70 pl-2">
                    {submenu.items.map(n => (
                      <NavLink
                        key={n.to} to={n.to} onClick={onNavigate} end={n.to === '/feng-shui'}
                        className={({ isActive }) =>
                          `flex min-h-11 items-center rounded border border-transparent px-3 py-2 text-xs transition-colors ${
                            isActive ? 'bg-accent/15 border-accent/30 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                          }`
                        }
                      ><span>{n.label}</span></NavLink>
                    ))}
                  </div>
                </div>
            ))}
            {g.footer?.map(n => <NavLink key={n.to} to={n.to} onClick={onNavigate} className="mt-1 flex min-h-11 items-center gap-2 rounded border border-transparent px-3 py-2 text-muted-foreground hover:text-foreground nav-create-glow"><span>{n.label}</span></NavLink>)}
          </div>
        ))}
      </nav>

      <div className="mt-auto text-[11px] text-muted-foreground leading-relaxed">
        {edition !== 'april' ? "Every chapter is listed here. Your Masterbook is private to your account; share it, or single chapters, from the edition home." : "Every planet, house, aspect and phase in this site is drawn verbatim from April's uploaded reports."} {edition !== 'april' ? null : ' Click any element in a chart, table, timeline or bagua for the full interpretation.'}
      </div>
    </div>
  );
}

export { MENU_SECTIONS } from '@/content/navigation';
