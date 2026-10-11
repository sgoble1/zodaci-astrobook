import { PageErrorBoundary } from '@/components/common/PageErrorBoundary';
import { VerifySources } from '@/components/common/VerifySources';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ParticleField from '@/components/fx/ParticleField';
import ScrollProgress from '@/components/fx/ScrollProgress';
import { FirstViewReveal } from '@/components/fx/FirstViewReveal';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useMyBirth } from '@/lib/myBirth';
import { useAprilSpace } from '@/hooks/useAprilSpace';
import { BIRTH } from '@/content/april';
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
import { APRIL_NAV_GROUPS, NAV_GROUPS, RELATIONSHIPS_GROUP, SHARED_GROUP, type NavGroup, type NavItem } from '@/content/navigation';
import { AstroBookLogo } from '@/components/brand/AstroBookLogo';

const GROUP_COLORS = ['--primary', '--oxblood', '--accent', '--candle', '--gold-bright', '--starlight', '--gold', '--glow-violet'];

export function AppShell() {
  const location = useLocation();
  const april = useAprilSpace();
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const openedRef = useRef(false);

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

  return (
    <PlayerProvider>
    <div className="min-h-screen flex text-foreground relative">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">Skip to content</a>
      <ScrollProgress /><FirstViewReveal />
      <ParticleField />
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-border/60 bg-card/40 backdrop-blur-xl sticky top-0 h-screen z-10">
        <SidebarInner />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-50 flex min-h-[64px] items-center justify-between gap-2 border-b border-border bg-background/95 px-3 py-2 backdrop-blur-xl pt-[max(0.5rem,env(safe-area-inset-top))]">
        <NavLink to="/" className="min-w-0 rounded focus-visible:outline-none"><AstroBookLogo compact /></NavLink>
        <div className="flex items-center gap-2"><AccountButton compact /><Button ref={menuButtonRef} type="button" size="icon" variant="ghost" onClick={() => setOpen(v => !v)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-menu" className="min-h-11 min-w-11">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button></div>
      </div>
      {open && (
        <div ref={mobileMenuRef} id="mobile-menu" role="dialog" aria-modal="true" aria-label="AstroBook menu" className="lg:hidden fixed inset-x-0 bottom-0 top-[64px] z-40 overflow-y-auto overscroll-contain bg-background pb-[env(safe-area-inset-bottom)]">
          <SidebarInner mobile onNavigate={() => setOpen(false)} />
        </div>
      )}

      {/* Main */}
      <main id="main-content" tabIndex={-1} className="flex-1 min-w-0 lg:pt-0 pt-[64px] relative z-10 outline-none">
        <div className="mx-auto max-w-5xl px-4 sm:px-8 py-8 sm:py-10 lg:py-14">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <PageErrorBoundary key={location.pathname}>{!april && <PublicWording />}{april === undefined && !isPublicPath(location.pathname) ? null : april || isPublicPath(location.pathname) ? <Outlet /> : <PublicChartFallback />}<VerifySources /></PageErrorBoundary>
          </motion.div>
        </div>
        <footer className="border-t border-border mt-16">
          <div className="mx-auto max-w-5xl px-5 sm:px-8 py-10 text-sm text-muted-foreground">
            <div className="gold-rule mb-6" />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="font-smallcaps text-xs">{april ? `Prepared for ${BIRTH.name} · ${BIRTH.date} · ${BIRTH.place}` : 'AstroBook · Your chart, your book'}</div>
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
  const myBirth = useMyBirth();
  const april = useAprilSpace();
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
  const shared = { ...SHARED_GROUP, items: SHARED_GROUP.items.map(item => ({ ...item, badge: item.to === '/shared/conversations' ? badges.chat : item.to === '/shared/wonderings' ? badges.wonderings : undefined })) };
  const relationships = { ...RELATIONSHIPS_GROUP, items: [...RELATIONSHIPS_GROUP.items, ...rels.map(r => ({ to: `/relationships/${r.id}`, label: `↳ ${r.name}${r.relation ? ` · ${r.relation}` : ''}` }))] };
  const baseGroups: NavGroup[] = (april ? [...APRIL_NAV_GROUPS.slice(0, 2), shared, relationships, ...APRIL_NAV_GROUPS.slice(2)] : [...NAV_GROUPS.slice(0, 2), relationships, ...NAV_GROUPS.slice(2)]);
  const allGroups = baseGroups.map(g => ({ ...g, items: [...g.items, ...custom.filter(c => c.menu_group === g.title).map(c => ({ to: `/p/${c.id}`, label: c.status === 'generating' ? `${c.title} · writing…` : c.title, created: true } as NavItem))] }));
  return (
    <div className={`flex min-h-full flex-col gap-6 overflow-x-hidden ${mobile ? 'px-4 pb-8 pt-4' : 'h-full overflow-y-auto p-6'}`}>
      <div>
        <div className="flex items-center justify-between gap-2"><AstroBookLogo />{!mobile && <AccountButton />}</div>
        {april ? (
          <>
            <div className="font-display text-2xl leading-tight mt-1">April</div>
            <div className="text-xs text-muted-foreground mt-1">{BIRTH.date} · {BIRTH.time}<br />{BIRTH.place}</div>
            <div className="gold-rule my-4" />
            <div className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-smallcaps text-[10px] text-foreground">Sun</span> ♍ Virgo H8 &middot;{' '}
              <span className="font-smallcaps text-[10px] text-foreground">Moon</span> ♈ Aries H3 &middot;{' '}
              <span className="font-smallcaps text-[10px] text-foreground">ASC</span> ♐ 29° Sag
            </div>
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
            <div className="font-display text-2xl leading-tight mt-1">Your AstroBook</div>
            <div className="text-xs text-muted-foreground mt-1">Enter your birth details to get your own chart and readings.</div>
            <div className="gold-rule my-4" />
            <NavLink to="/start" onClick={onNavigate} className="text-xs text-primary underline-offset-2 hover:underline">Get started →</NavLink>
          </>
        )}
      </div>

      <div className="pt-1 space-y-2"><CommandPaletteTrigger /><BookmarkButton /></div>

      <nav ref={navRef} aria-label="Site menu" className="flex flex-col gap-4 text-sm">
        {allGroups.map((g, gi) => (
          <div key={g.title} className={`flex flex-col gap-0.5 ${g.title === "April's Workbook" ? 'nav-workbook-section' : ''}${g.title === 'Themes & Topics' ? ' nav-topics-section' : ''}${g.title === 'Timing & Cycles' ? ' nav-timing-section' : ''}`}>
            <div className={`font-smallcaps text-[10px] px-3 py-1 mb-1 rounded border-l-2 font-semibold tracking-wider ${g.title === "April's Workbook" ? 'nav-workbook-title' : ''}`} style={g.title === "April's Workbook" ? undefined : { color: `hsl(var(${GROUP_COLORS[gi % GROUP_COLORS.length]}))`, borderColor: `hsl(var(${GROUP_COLORS[gi % GROUP_COLORS.length]}))`, background: `hsl(var(${GROUP_COLORS[gi % GROUP_COLORS.length]}) / 0.1)` }}>{g.title}</div>
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
            {g.submenus?.map(submenu => {
              const containsActiveRoute = submenu.items.some(item => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`));
              return (
                <details key={submenu.label} className="group/submenu" open={containsActiveRoute || undefined}>
                  <summary className="flex cursor-pointer list-none items-center justify-between rounded px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground [&::-webkit-details-marker]:hidden">
                    <span>{submenu.label}</span>
                    <ChevronDown className="h-4 w-4 transition-transform group-open/submenu:rotate-180" aria-hidden="true" />
                  </summary>
                  <div className="ml-3 flex flex-col gap-0.5 border-l border-border/70 pl-2">
                    {submenu.items.map(n => (
                      <NavLink
                        key={n.to} to={n.to} onClick={onNavigate} end={n.to === '/feng-shui'}
                        className={({ isActive }) =>
                          `flex min-h-11 items-center rounded border border-transparent px-3 py-2 text-xs transition-colors ${
                            isActive ? 'bg-accent/15 border-accent/30 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                          }`
                        }
                      >{n.label}</NavLink>
                    ))}
                  </div>
                </details>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="mt-auto text-[11px] text-muted-foreground leading-relaxed">
        {april ? "Every planet, house, aspect and phase in this site is drawn verbatim from April's uploaded reports. Click any element in a chart, table, timeline or bagua for the full interpretation." : 'Every chart here is calculated live from real birth details. Click any element in a chart, table or timeline for the full interpretation.'}
      </div>
    </div>
  );
}

export { MENU_SECTIONS } from '@/content/navigation';
