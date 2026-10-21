import { AdminEditionSwitch } from '@/components/common/AdminEditionSwitch';
import { PageErrorBoundary } from '@/components/common/PageErrorBoundary';
import { VerifySources } from '@/components/common/VerifySources';
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import ParticleField from '@/components/fx/ParticleField';
import ScrollProgress from '@/components/fx/ScrollProgress';
import { FirstViewReveal } from '@/components/fx/FirstViewReveal';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { GenerationProgress } from '@/components/readings/GenerationProgress';
import { founderPlace, orderFounderGroups } from '@/lib/founderEdition';
import { useAprilSpace, useClassicView, setClassicView } from '@/hooks/useAprilSpace';

/** April's breadcrumb (section › page) from her own menu; hidden on the first page of a section. */
function FounderTrail() {
  const { pathname } = useLocation();
  const place = founderPlace(APRIL_NAV_GROUPS, pathname);
  if (!place || place.home.to === pathname) return null;
  return <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted-foreground"><Link to={place.home.to} className="hover:text-foreground underline-offset-2 hover:underline">{place.section}</Link><span aria-hidden="true" className="mx-2">›</span><span className="text-foreground">{place.label}</span></nav>;
}

/** "Continue in this section": the next pages in April's own menu, so no page is a dead end. */
function FounderNext() {
  const { pathname } = useLocation();
  const place = founderPlace(APRIL_NAV_GROUPS, pathname);
  if (!place || !place.next.length) return null;
  return (
    <nav aria-labelledby="founder-next" className="mt-16 border-t border-border pt-8 print:hidden">
      <h2 id="founder-next" className="font-display text-2xl">Continue in {place.section}</h2>
      <ul className="mt-5 grid gap-3 sm:grid-cols-3">
        {place.next.map(n => <li key={n.to}><Link to={n.to} className="flex h-full items-center justify-between gap-2 rounded-xl border border-border bg-card/60 p-4 text-sm hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span>{n.label}</span><span aria-hidden="true">→</span></Link></li>)}
      </ul>
    </nav>
  );
}

/** Shown in classic view for founders: one click back to the full private edition. */
function ClassicViewBanner() {
  return (
    <div role="status" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm">
      <span>You're seeing the classic view — the same layout every member sees.</span>
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
import { NextStepPanel, WayfindingTop } from './Wayfinding';

function PlanGuard({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { plan, loading } = usePlan();
  const need = requiredPlan(pathname);
  if (need === 'free') return <>{children}</>;
  if (loading) return <p role="status" className="text-muted-foreground">Checking your plan…</p>;
  return planAllows(plan, need) ? <>{children}</> : <PlanLock need={need} />;
}

const KEEP_NAME_PATHS = ['/shared', '/our-charts', '/podcasts', '/shane', '/admin'];
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
        <header className="border-b border-border"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <Link to="/welcome"><ZodaciLogo /></Link>
          <nav aria-label="Public pages" className="flex flex-wrap gap-1">{[['/welcome', 'Zodaci'], ['/about', 'About'], ['/blog', 'Blog'], ['/community', 'Community'], ['/books', 'AstroBook'], ['/pricing', 'Pricing']].map(([to, label]) => <Button asChild variant="ghost" key={to}><Link to={to}>{label}</Link></Button>)}<Button asChild variant="outline"><Link to="/auth">Sign in</Link></Button></nav>
        </div></header>
        <main id="main-content" className="mx-auto max-w-5xl px-4 py-10 sm:px-8"><PageErrorBoundary key={location.pathname}><Outlet /></PageErrorBoundary></main>
      </div>
    );
  }
  // Founders can switch to the classic view: the same pages and menu every member sees.
  const founder = april && !classic;
  const page = <PageErrorBoundary key={location.pathname}>{!founder && !keepNames && <PublicWording />}{april === undefined && !isPublicPath(location.pathname) ? null : founder ? <Outlet /> : <PlanGuard>{isPublicPath(location.pathname) ? <Outlet /> : <PublicChartFallback />}</PlanGuard>}<VerifySources /></PageErrorBoundary>;
  if (!founder) return <MemberShell>{april && classic && <ClassicViewBanner />}{page}</MemberShell>;
  return <AprilShell>{page}</AprilShell>;
}

/** Member app: five-domain header with mega-menus, phone tab bar, quick-access row, breadcrumbs and next steps. */
function MemberShell({ children }: { children: ReactNode }) {
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
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0 }}>
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
function AprilShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const openedRef = useRef(false);
  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    if (!open && openedRef.current) menuButtonRef.current?.focus();
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
    <PlayerProvider>
    <div className="min-h-screen flex text-foreground relative">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">Skip to content</a>
      <ScrollProgress /><FirstViewReveal />
      <ParticleField />
      <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-border/60 bg-card/40 backdrop-blur-xl sticky top-0 h-screen z-10">
        <SidebarInner />
      </aside>
      <div className="lg:hidden fixed top-0 inset-x-0 z-50 flex min-h-[64px] items-center justify-between gap-2 border-b border-border bg-background/95 px-3 py-2 backdrop-blur-xl pt-[max(0.5rem,env(safe-area-inset-top))]">
        <NavLink to="/" className="min-w-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ZodaciLogo compact /></NavLink>
        <div className="flex items-center gap-2"><AccountButton compact /><Button ref={menuButtonRef} type="button" size="icon" variant="ghost" onClick={() => setOpen(v => !v)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-menu" className="min-h-11 min-w-11">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button></div>
      </div>
      {open && (
        <div ref={mobileMenuRef} id="mobile-menu" role="dialog" aria-modal="true" aria-label="Zodaci menu" className="lg:hidden fixed inset-x-0 bottom-0 top-[64px] z-40 overflow-y-auto overscroll-contain bg-background pb-[env(safe-area-inset-bottom)]">
          <SidebarInner mobile onNavigate={() => setOpen(false)} />
        </div>
      )}
      <main id="main-content" tabIndex={-1} className="flex-1 min-w-0 lg:pt-0 pt-[64px] relative z-10 outline-none">
        <div className="mx-auto max-w-5xl px-4 sm:px-8 py-8 sm:py-10 lg:py-14">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0 }}>
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
  );
}

function SidebarInner({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const { items: rels } = useRelationships();
  const custom = useCustomPages();
  const badges = useSharedBadges();
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
  const aprilGroups = APRIL_NAV_GROUPS; // private payload; re-read each render so late registration shows up
  const allGroups: NavGroup[] = useMemo(() => {
    const shared = { ...SHARED_GROUP, items: SHARED_GROUP.items.map(item => ({ ...item, badge: item.to === '/shared/conversations' ? badges.chat : item.to === '/shared/wonderings' ? badges.wonderings : undefined })) };
    const relationships = { ...RELATIONSHIPS_GROUP, items: [...RELATIONSHIPS_GROUP.items, ...rels.map(r => ({ to: `/relationships/${r.id}`, label: `↳ ${r.name}${r.relation ? ` · ${r.relation}` : ''}` }))] };
    return orderFounderGroups([...aprilGroups.slice(0, 2), shared, relationships, ...aprilGroups.slice(2)])
      .map(g => ({ ...g, items: [...g.items, ...custom.filter(c => c.menu_group === g.title).map(c => ({ to: `/p/${c.id}`, label: c.status === 'generating' ? `${c.title} · writing…` : c.title, created: true } as NavItem))] }));
  }, [aprilGroups, badges.chat, badges.wonderings, rels, custom]);
  useMenuTitleFallback(useMemo(() => allGroups.flatMap(g => [...g.items, ...(g.footer ?? []), ...(g.submenus ?? []).flatMap(s => s.items)]), [allGroups]));
  return (
    <div className={`founder-sidebar flex min-h-full flex-col gap-6 overflow-x-hidden ${mobile ? 'px-4 pb-8 pt-4' : 'h-full overflow-y-auto p-6'}`}>
      <div>
        <div className="flex items-center justify-between gap-2"><ZodaciLogo />{!mobile && <AccountButton compact />}</div>
        <div className="mt-3"><AdminEditionSwitch /></div>
        <div className="font-display text-2xl leading-tight mt-1">April</div>
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
        Every planet, house, aspect and phase in this site is drawn verbatim from April's uploaded reports. Click any element in a chart, table, timeline or bagua for the full interpretation.
      </div>
    </div>
  );
}

export { MENU_SECTIONS } from '@/content/navigation';
