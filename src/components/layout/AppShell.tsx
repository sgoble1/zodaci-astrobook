import { AdminEditionSwitch } from '@/components/common/AdminEditionSwitch';
import { PageErrorBoundary } from '@/components/common/PageErrorBoundary';
import { VerifySources } from '@/components/common/VerifySources';
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import ParticleField from '@/components/fx/ParticleField';
import ScrollProgress from '@/components/fx/ScrollProgress';
import { FirstViewReveal } from '@/components/fx/FirstViewReveal';
import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { GenerationProgress } from '@/components/readings/GenerationProgress';
import { useMyBirth } from '@/lib/myBirth';
import { useAprilSpace } from '@/hooks/useAprilSpace';
import { useShaneAccount } from '@/hooks/useShaneAccount';
import { useSharedSpaceMember } from '@/hooks/useSharedSpaceMember';
import { PublicWording } from '@/components/common/PublicWording';
import { PublicChartFallback, isPublicPath } from '@/components/common/PublicChartFallback';
import { useRelationships } from '@/hooks/useRelationships';
import { CommandPaletteTrigger } from '@/components/common/CommandPalette';
import { BookmarkButton } from '@/components/common/BookmarkButton';
import { PlayerProvider } from '@/components/podcast/PlayerContext';
import { AccountButton } from '@/components/common/AccountButton';
import { useSession, useIsAdmin } from '@/hooks/useLibrary';
import { useCustomPages, NEW_PAGE_HIGHLIGHT_KEY } from '@/hooks/useCustomPages';
import { useSharedBadges } from '@/hooks/useSharedBadges';
import { Button } from '@/components/ui/button';
import { APRIL_NAV_GROUPS, NAV_GROUPS, MEMBER_SECTIONS, RELATIONSHIPS_GROUP, SHARED_GROUP, planAllows, requiredPlan, type NavGroup, type NavItem } from '@/content/navigation';
import { usePlan } from '@/hooks/usePlan';
import { PlanLock, PLAN_LABEL } from '@/components/common/PlanLock';
import { Lock } from 'lucide-react';
import type { ReactNode } from 'react';

function PlanGuard({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { plan, loading } = usePlan();
  const need = requiredPlan(pathname);
  if (need === 'free') return <>{children}</>;
  if (loading) return <p role="status" className="text-muted-foreground">Checking your plan…</p>;
  return planAllows(plan, need) ? <>{children}</> : <PlanLock need={need} />;
}
import { ZodaciLogo } from '@/components/brand/ZodaciLogo';

const KEEP_NAME_PATHS = ['/shared', '/our-charts', '/podcasts', '/shane', '/admin'];
import { WelcomeTour } from '@/components/common/WelcomeTour';

const SIGNED_OUT_PATHS = ['/auth', '/pricing', '/books', '/reset-password'];
const GROUP_COLORS = ['--primary', '--oxblood', '--accent', '--candle', '--gold-bright', '--starlight', '--gold', '--glow-violet'];

export function AppShell() {
  const location = useLocation();
  const april = useAprilSpace();
  // April and Shane's joint pages and admin tools keep real names; elsewhere April-written copy reads as "you".
  const founderState = useSharedSpaceMember();
  // Wait for the membership answer so names are never rewritten before it arrives.
  const keepNames = founderState !== false && KEEP_NAME_PATHS.some(p => location.pathname === p || location.pathname.startsWith(`${p}/`));
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const openedRef = useRef(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => { setOpen(false); window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }, [location.pathname]);
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
  return (
    <PlayerProvider>
    <div className={`min-h-screen flex text-foreground relative ${april ? '' : 'member-experience'}`}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">Skip to content</a>
      <ScrollProgress /><FirstViewReveal />
      <ParticleField />
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-border/60 bg-card/40 backdrop-blur-xl sticky top-0 h-screen z-10">
        <SidebarInner />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-50 flex min-h-[64px] items-center justify-between gap-2 border-b border-border bg-background/95 px-3 py-2 backdrop-blur-xl pt-[max(0.5rem,env(safe-area-inset-top))]">
        <NavLink to="/" className="min-w-0 rounded focus-visible:outline-none"><ZodaciLogo compact /></NavLink>
        <div className="flex items-center gap-2"><AccountButton compact /><Button ref={menuButtonRef} type="button" size="icon" variant="ghost" onClick={() => setOpen(v => !v)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-menu" className="min-h-11 min-w-11">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button></div>
      </div>
      {open && (
        <div ref={mobileMenuRef} id="mobile-menu" role="dialog" aria-modal="true" aria-label="Zodaci menu" className="lg:hidden fixed inset-x-0 bottom-0 top-[64px] z-40 overflow-y-auto overscroll-contain bg-background pb-[env(safe-area-inset-bottom)]">
          <SidebarInner mobile onNavigate={() => setOpen(false)} />
        </div>
      )}

      {/* Main */}
      <main id="main-content" tabIndex={-1} className="flex-1 min-w-0 lg:pt-0 pt-[64px] relative z-10 outline-none">
        <div className="mx-auto max-w-5xl px-4 sm:px-8 py-8 sm:py-10 lg:py-14">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0 }}>
            <PageErrorBoundary key={location.pathname}>{!april && !keepNames && <PublicWording />}{april === undefined && !isPublicPath(location.pathname) ? null : april ? <Outlet /> : <PlanGuard>{isPublicPath(location.pathname) ? <Outlet /> : <PublicChartFallback />}</PlanGuard>}<VerifySources /></PageErrorBoundary>
          </motion.div>
          {april === false && <><GenerationProgress /><WelcomeTour /></>}
        </div>
        <footer className="border-t border-border mt-16">
          <div className="mx-auto max-w-5xl px-5 sm:px-8 py-10 text-sm text-muted-foreground">
            <div className="gold-rule mb-6" />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="font-smallcaps text-xs">{april ? 'Your private edition' : 'Zodaci · Your sky, your story'}</div>
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
  const location = useLocation();
  const session = useSession();
  const admin = useIsAdmin(session);
  const myBirth = useMyBirth();
  const april = useAprilSpace();
  const shane = useShaneAccount();
  const { items: rels } = useRelationships();
  const custom = useCustomPages();
  const badges = useSharedBadges();
  const { plan, loading: planLoading } = usePlan();
  const locked = (to: string) => !april && !planLoading && !planAllows(plan, requiredPlan(to));
  const lockTag = (to: string) => locked(to) ? <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-wide"><Lock className="h-2.5 w-2.5" aria-hidden="true" />{PLAN_LABEL[requiredPlan(to)]}</span> : null;
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
  const shared = { ...SHARED_GROUP, items: SHARED_GROUP.items.map(item => ({ ...item, badge: item.to === '/shared/conversations' ? badges.chat : item.to === '/shared/wonderings' ? badges.wonderings : undefined })) };
  const relationships = { ...RELATIONSHIPS_GROUP, items: [...RELATIONSHIPS_GROUP.items, ...rels.map(r => ({ to: `/relationships/${r.id}`, label: `↳ ${r.name}${r.relation ? ` · ${r.relation}` : ''}` }))] };
  const baseGroups: NavGroup[] = (april ? [...APRIL_NAV_GROUPS.slice(0, 2), shared, relationships, ...APRIL_NAV_GROUPS.slice(2)] : [...NAV_GROUPS.slice(0, 2), relationships, ...NAV_GROUPS.slice(2)]);
  const allGroups = baseGroups.map(g => ({ ...g, items: [...g.items, ...custom.filter(c => c.menu_group === g.title).map(c => ({ to: `/p/${c.id}`, label: c.status === 'generating' ? `${c.title} · writing…` : c.title, created: true } as NavItem))] }));
  const memberGroups = MEMBER_SECTIONS.map(section => ({ title: section.title, items: section.title === 'Readings' ? [{ to: '/my-readings', label: 'All readings' }, { to: '/wonderings', label: 'Wonderings' }] : [], submenus: allGroups.filter(g => section.groupTitles.includes(g.title)).flatMap(g => [{ label: g.title, items: [...g.items, ...(g.footer ?? [])] }, ...(g.submenus ?? [])]) }));
  const displayGroups = april ? allGroups : memberGroups;
  // Pages without their own usePageMeta get a title from their menu label instead of keeping the previous page's title.
  useEffect(() => {
    const path = location.pathname;
    let tries = 0; let t = 0;
    const apply = () => {
      if (document.documentElement.dataset.metaPath === path) return;
      const items = allGroups.flatMap(g => [...g.items, ...(g.footer ?? []), ...(g.submenus ?? []).flatMap(s => s.items)]);
      const heading = document.querySelector('main h1, h1')?.textContent?.trim().replace(/\s+/g, ' ').slice(0, 60);
      const label = items.find(i => i.to === path)?.label ?? heading;
      if (!label && ++tries < 8) { t = window.setTimeout(apply, 400); return; }
      document.title = label ? `${label} · Zodaci` : 'Zodaci · Your sky, your story';
    };
    t = window.setTimeout(apply, 400);
    return () => window.clearTimeout(t);
  }, [location.pathname, allGroups]);
  return (
    <div className={`flex min-h-full flex-col gap-6 overflow-x-hidden ${mobile ? 'px-4 pb-8 pt-4' : 'h-full overflow-y-auto p-6'}`}>
      <div>
        <div className="flex items-center justify-between gap-2"><ZodaciLogo />{!mobile && <AccountButton compact />}</div>
        <div className="mt-3"><AdminEditionSwitch /></div>
        {april ? (
          <>
            <div className="font-display text-2xl leading-tight mt-1">April</div>
            <div className="text-xs text-muted-foreground mt-1">Private edition</div>
            <div className="gold-rule my-4" />
          </>
        ) : myBirth ? (
          <>
            <div className="font-display text-2xl leading-tight mt-1">{myBirth.name}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {myBirth.date}{myBirth.time ? ` · ${myBirth.time}` : ' · time unknown'}<br />{myBirth.placeLabel}
            </div>
            <div className="gold-rule my-4" />
            <NavLink to="/my-chart" onClick={onNavigate} className="text-xs text-primary underline-offset-2 hover:underline">Open my chart →</NavLink>
          </>
        ) : (
          <>
            <div className="font-display text-2xl leading-tight mt-1">Your Zodaci</div>
            <div className="text-xs text-muted-foreground mt-1">Enter your birth details to get your own chart and readings.</div>
            <div className="gold-rule my-4" />
            <NavLink to="/start" onClick={onNavigate} className="text-xs text-primary underline-offset-2 hover:underline">Get started →</NavLink>
          </>
        )}
      </div>

      {!april && !planLoading && plan === 'free' && <NavLink to="/pricing" onClick={onNavigate} className="block rounded-xl border border-primary/40 bg-primary/10 p-3 text-xs"><span className="font-semibold text-foreground">Free plan</span> · 2 full readings and first-section core previews. Items marked <Lock className="inline h-3 w-3" aria-label="locked" /> need Pro. <span className="text-primary underline">Upgrade →</span></NavLink>}
      <div className="pt-1 space-y-2"><CommandPaletteTrigger label={april ? "Search the compendium" : "Find pages & readings"} /><BookmarkButton /></div>

      {!april && <nav aria-label="Main destinations" className="grid gap-1">{[['/dashboard', 'Dashboard'], ['/my-chart', 'My Chart'], ['/my-readings', 'Readings'], ['/explore', 'Explore'], ['/my-astrobook', 'My Library'], ...(plan === 'creator' ? [['/creator', 'Cosmic Studio']] : []), ...(admin ? [['/admin', 'Admin']] : [])].map(([to, label]) => <Button key={to} asChild variant={location.pathname === to ? 'secondary' : 'ghost'} className="justify-start"><NavLink to={to} onClick={onNavigate}>{label}</NavLink></Button>)}</nav>}
      {shane && <nav aria-label="Shane’s private edition" className="grid gap-1" data-keep-wording>{[['/shane', 'Shane’s Full Masterbook'], ['/topics', 'All Themes & Topics'], ['/workbook', 'My Guided Workbook'], ['/shared', 'Our Shared Space']].map(([to, label]) => <Button key={to} asChild variant="outline" className="justify-start"><Link to={to} onClick={onNavigate}>{label}</Link></Button>)}</nav>}
      <nav ref={navRef} aria-label="Site menu" className="flex flex-col gap-4 text-sm">
        {displayGroups.map((g, gi) => {
          const Group = april ? 'div' : 'details';
          const Heading = april ? 'div' : 'summary';
          return (
          <Group key={g.title} {...(april ? {} : { open: g.submenus?.some(sub => sub.items.some(item => item.to === location.pathname)) })} className={`flex flex-col gap-0.5 ${g.title === "April's Workbook" ? 'nav-workbook-section' : ''}${g.title === 'Themes & Topics' ? ' nav-topics-section' : ''}${g.title === 'Timing & Cycles' ? ' nav-timing-section' : ''}`}>
            <Heading className={`cursor-pointer font-smallcaps text-xs px-3 py-2 mb-1 rounded border-l-2 font-semibold tracking-wider ${g.title === "April's Workbook" ? 'nav-workbook-title' : ''}`} style={april && g.title !== "April's Workbook" ? { color: `hsl(var(${GROUP_COLORS[gi % GROUP_COLORS.length]}))`, borderColor: `hsl(var(${GROUP_COLORS[gi % GROUP_COLORS.length]}))`, background: `hsl(var(${GROUP_COLORS[gi % GROUP_COLORS.length]}) / 0.1)` } : undefined}>{g.title}</Heading>
            {g.items.map(n => (
              <NavLink
                key={n.to} to={n.to} onClick={onNavigate} data-nav-to={n.to} end={n.to === '/' || n.to === '/masterbook' || n.to === '/relationships' || n.to === '/workbook' || n.to === '/shared'}
                className={({ isActive }) =>
                  `flex min-h-11 items-center justify-between gap-2 rounded border border-transparent px-3 py-2 transition-colors ${
                    isActive ? 'bg-accent/15 border-accent/30 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }${locked(n.to) ? ' opacity-60' : ''}${n.created ? ' bg-created/20 text-foreground' : ''}${n.to === '/create' ? ' nav-create-glow' : ''}${glowId && n.to === `/p/${glowId}` ? ' nav-new-glow' : ''}`
                }
              ><span>{n.label}{n.created ? <span className="sr-only"> (created page)</span> : null}{glowId && n.to === `/p/${glowId}` ? <span className="sr-only"> — just added</span> : null}</span>{lockTag(n.to)}{n.badge ? <span className="min-w-5 rounded-full bg-primary px-1.5 text-center text-[10px] text-primary-foreground" aria-label={`${n.badge} new`}>{n.badge}</span> : null}</NavLink>
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
                          }${locked(n.to) ? ' opacity-60' : ''}`
                        }
                      ><span>{n.label}</span>{lockTag(n.to)}</NavLink>
                    ))}
                  </div>
                </div>
            ))}
            {g.footer?.map(n => <NavLink key={n.to} to={n.to} onClick={onNavigate} className={`mt-1 flex min-h-11 items-center gap-2 rounded border border-transparent px-3 py-2 text-muted-foreground hover:text-foreground nav-create-glow${locked(n.to) ? ' opacity-60' : ''}`}><span>{n.label}</span>{lockTag(n.to)}</NavLink>)}
          </Group>
        ); })}
      </nav>

      <div className="mt-auto text-[11px] text-muted-foreground leading-relaxed">
        {april ? "Every planet, house, aspect and phase in this site is drawn verbatim from April's uploaded reports. Click any element in a chart, table, timeline or bagua for the full interpretation." : 'Every chart here is calculated live from real birth details. Click any element in a chart, table or timeline for the full interpretation.'}
      </div>
    </div>
  );
}

export { MENU_SECTIONS } from '@/content/navigation';
