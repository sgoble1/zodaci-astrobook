import { PageErrorBoundary } from '@/components/common/PageErrorBoundary';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ParticleField from '@/components/fx/ParticleField';
import ScrollProgress from '@/components/fx/ScrollProgress';
import { FirstViewReveal } from '@/components/fx/FirstViewReveal';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { BIRTH } from '@/content/april';
import { TOPICS } from '@/content/topics';
import { useRelationships } from '@/hooks/useRelationships';
import { CommandPaletteTrigger } from '@/components/common/CommandPalette';
import { BookmarkButton } from '@/components/common/BookmarkButton';
import { PlayerProvider } from '@/components/podcast/PlayerContext';
import { AccountButton } from '@/components/common/AccountButton';
import { useCustomPages, NEW_PAGE_HIGHLIGHT_KEY } from '@/hooks/useCustomPages';
import { WORKBOOK_MODULES } from '@/content/workbook';
import { useSharedBadges } from '@/hooks/useSharedBadges';
import { Button } from '@/components/ui/button';

const GROUP_COLORS = ['--primary', '--oxblood', '--accent', '--candle', '--gold-bright', '--starlight', '--gold', '--glow-violet'];

type NavItem = { to: string; label: string; created?: boolean; badge?: number };
type NavSubmenu = { label: string; items: NavItem[] };
type NavGroup = { title: string; items: NavItem[]; submenus?: NavSubmenu[] };

const groups: NavGroup[] = [
  { title: 'Begin', items: [{ to: '/', label: 'Home' }, { to: '/dashboard', label: 'My Dashboard & Bookmarks' }, { to: '/ask', label: 'Ask the Sources' }, { to: '/chat', label: 'SmarChat' }, { to: '/reading', label: 'The Complete Reading' }, { to: '/chart-elements', label: 'Chart Elements & Meanings' }, { to: '/create', label: '+ Create a Topic & Page' }] },
  { title: "April's Workbook", items: [{ to: '/workbook', label: 'Workbook Overview' }, { to: '/workbook/companion', label: 'The Oracle Within · Therapy Chat' }, { to: '/workbook/check-in', label: 'Daily Check-in' }, { to: '/workbook/reframe', label: 'Thought Reframe' }, { to: '/workbook/journal', label: 'Journal & Patterns' }, ...WORKBOOK_MODULES.map(m => ({ to: `/workbook/module/${m.slug}`, label: `↳ ${m.title}` }))] },
  { title: 'Sources & Documents', items: [{ to: '/masterbook', label: 'The Masterbook · Full Text' }, { to: '/masterbook/index', label: 'Document Index' }, { to: '/contents', label: 'Masterbook Contents (open)' }, { to: '/read', label: 'Sources Reading Room' }, { to: '/sources', label: 'Source Files' }, { to: '/masterbook/upload', label: 'Upload to the Masterbook' }, { to: '/admin', label: 'My Workspace · Upload & Edit' }] },
  { title: 'Themes & Topics', items: [{ to: '/topics', label: 'All Themes' }, ...TOPICS.map(t => ({ to: `/topics/${t.slug}`, label: t.label }))] },
  { title: 'The Natal Chart', items: [
    { to: '/birth-chart', label: 'Birth Chart' }, { to: '/chart-calculator', label: 'Chart Calculator' }, { to: '/planets', label: 'Planets' }, { to: '/houses', label: 'Houses' },
    { to: '/aspects', label: 'Aspects' }, { to: '/star-map', label: 'Fixed-Star Sky Map' }, { to: '/compendium', label: 'Compendium' }] },
  { title: 'Timing & Cycles', items: [
    { to: '/timeline', label: 'Timeline · 1990–2060' }, { to: '/transits', label: 'Transits · 2026–2040' },
    { to: '/profection', label: 'Profection · Age 35' }, { to: '/retrogrades', label: 'Retrogrades' }, { to: '/guides/timeline-retrogrades', label: 'Guide · Timeline & Retrogrades' }] },
  { title: 'Other Systems', items: [
    { to: '/other-systems', label: 'Other Systems · Dashboard' },
    { to: '/numerology', label: 'Numerology · Pinnacles' }, { to: '/purpose', label: 'Purpose & Numerology' },
    { to: '/chinese', label: 'Chinese · Ba Zi' },
    { to: '/other-systems/vedic', label: 'Vedic · Jyotish' }, { to: '/other-systems/mayan-tzolkin', label: 'Maya · Tzolk’in' },
    { to: '/other-systems/tibetan-mewa', label: 'Tibetan Mewa & Parkha' }, { to: '/other-systems/nine-star-ki', label: 'Japanese Nine Star Ki' },
    { to: '/other-systems/chaldean-numerology', label: 'Chaldean Numerology' }, { to: '/other-systems/tarot-birth-cards', label: 'Tarot Birth Cards' },
    { to: '/other-systems/celtic-tree-calendar', label: 'Celtic Tree Calendar' }, { to: '/volume-2', label: 'Volume II · Supplement' }], submenus: [{ label: 'Feng Shui', items: [
      { to: '/feng-shui', label: 'Feng Shui Overview' }, { to: '/guides/birth-chart-feng-shui', label: 'Guide · Birth Chart & Feng Shui' }, { to: '/guides/feng-shui-pages', label: 'Guide · Page by Page & Flying Stars' }, { to: '/feng-shui/bagua', label: 'Bagua & Home' }, { to: '/feng-shui/flying-stars', label: 'Flying Stars' }, { to: '/bagua-reading', label: 'The Bagua Reading' }, { to: '/masterbook/bagua-wheel', label: 'Masterbook · Bagua Wheel' }
    ] }] },
  { title: 'Library', items: [
    { to: '/podcasts', label: 'Podcasts' },
    { to: '/data-quality', label: 'Data Quality' }] },
];

export function AppShell() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setOpen(false); window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }, [location.pathname]);
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
      <div aria-hidden className="pointer-events-none fixed -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-primary/20 blur-3xl float-orb z-0" />
      <div aria-hidden className="pointer-events-none fixed -bottom-40 -right-40 w-[520px] h-[520px] rounded-full bg-accent/15 blur-3xl float-orb z-0" style={{ animationDelay: '-9s' }} />
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-border/60 bg-card/40 backdrop-blur-xl sticky top-0 h-screen z-10">
        <SidebarInner />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 py-3 border-b border-border bg-background/90 backdrop-blur">
        <div className="font-display text-lg">April · Astrological Compendium</div>
        <div className="flex items-center gap-2"><AccountButton compact /><Button ref={menuButtonRef} type="button" size="icon" variant="ghost" onClick={() => setOpen(v => !v)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-menu" className="min-h-11 min-w-11">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button></div>
      </div>
      {open && (
        <div ref={mobileMenuRef} id="mobile-menu" role="dialog" aria-modal="true" aria-label="Site menu" className="lg:hidden fixed inset-0 top-[57px] z-30 bg-background overflow-y-auto">
          <SidebarInner />
        </div>
      )}

      {/* Main */}
      <main id="main-content" tabIndex={-1} className="flex-1 min-w-0 lg:pt-0 pt-[57px] relative z-10 outline-none">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 py-10 lg:py-14">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <PageErrorBoundary key={location.pathname}><Outlet /></PageErrorBoundary>
          </motion.div>
        </div>
        <footer className="border-t border-border mt-16">
          <div className="mx-auto max-w-5xl px-5 sm:px-8 py-10 text-sm text-muted-foreground">
            <div className="gold-rule mb-6" />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="font-smallcaps text-xs">Prepared for {BIRTH.name} · {BIRTH.date} · {BIRTH.place}</div>
              <div className="font-smallcaps text-xs">An Illuminated Compendium · Ink on Vellum · Touched with Gold</div>
            </div>
          </div>
        </footer>
      </main>
    </div>
    </PlayerProvider>
  );
}

function SidebarInner() {
  const location = useLocation();
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
  const baseGroups: NavGroup[] = [...groups.slice(0, 2), { title: 'Our Shared Space', items: [{ to: '/shared', label: 'Shared Dashboard' }, { to: '/shared/conversations', label: 'Conversations', badge: badges.chat }, { to: '/shared/posts', label: 'Posts' }, { to: '/shared/wonderings', label: 'Wonderings', badge: badges.wonderings }, { to: '/shared/reading', label: 'Reading Together' }, { to: '/shared/media', label: 'Media Library' }, { to: '/shared/recommendations', label: 'Recommendations' }, { to: '/shared/notes', label: 'Notes' }, { to: '/shared/later', label: 'Talk Later' }, { to: '/shared/accounts', label: 'Shared Accounts' }] }, { title: 'Relationships', items: [{ to: '/relationships', label: 'All Relationships' }, { to: '/guides/relationships', label: 'Relationships in the Sources' }, ...rels.map(r => ({ to: `/relationships/${r.id}`, label: `↳ ${r.name}${r.relation ? ` · ${r.relation}` : ''}` }))] }, ...groups.slice(2)];
  const allGroups = baseGroups.map(g => ({ ...g, items: [...g.items, ...custom.filter(c => c.menu_group === g.title).map(c => ({ to: `/p/${c.id}`, label: c.status === 'generating' ? `${c.title} · writing…` : c.title, created: true } as NavItem))] }));
  return (
    <div className="p-6 flex flex-col gap-6 h-full overflow-y-auto">
      <div>
        <div className="flex items-center justify-between gap-2"><div className="font-smallcaps text-[10px] text-gold">Companion Document</div><AccountButton /></div>
        <div className="font-display text-2xl leading-tight mt-1">April</div>
        <div className="text-xs text-muted-foreground mt-1">
          {BIRTH.date} · {BIRTH.time}<br />{BIRTH.place}
        </div>
        <div className="gold-rule my-4" />
        <div className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-smallcaps text-[10px] text-foreground">Sun</span> ♍ Virgo H8 &middot;{' '}
          <span className="font-smallcaps text-[10px] text-foreground">Moon</span> ♈ Aries H3 &middot;{' '}
          <span className="font-smallcaps text-[10px] text-foreground">ASC</span> ♐ 29° Sag
        </div>
      </div>

      <div className="pt-1 space-y-2"><CommandPaletteTrigger /><BookmarkButton /></div>

      <nav ref={navRef} aria-label="Site menu" className="flex flex-col gap-4 text-sm">
        {allGroups.map((g, gi) => (
          <div key={g.title} className={`flex flex-col gap-0.5 ${g.title === "April's Workbook" ? 'nav-workbook-section' : ''}`}>
            <div className={`font-smallcaps text-[10px] px-3 py-1 mb-1 rounded border-l-2 font-semibold tracking-wider ${g.title === "April's Workbook" ? 'nav-workbook-title' : ''}`} style={g.title === "April's Workbook" ? undefined : { color: `hsl(var(${GROUP_COLORS[gi % GROUP_COLORS.length]}))`, borderColor: `hsl(var(${GROUP_COLORS[gi % GROUP_COLORS.length]}))`, background: `hsl(var(${GROUP_COLORS[gi % GROUP_COLORS.length]}) / 0.1)` }}>{g.title}</div>
            {g.items.map(n => (
              <NavLink
                key={n.to} to={n.to} data-nav-to={n.to} end={n.to === '/' || n.to === '/masterbook' || n.to === '/relationships' || n.to === '/workbook' || n.to === '/shared'}
                className={({ isActive }) =>
                  `flex items-center justify-between gap-2 px-3 py-1.5 rounded border border-transparent transition-colors ${
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
                        key={n.to} to={n.to} end={n.to === '/feng-shui'}
                        className={({ isActive }) =>
                          `rounded border border-transparent px-3 py-1.5 text-xs transition-colors ${
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
        Every planet, house, aspect and phase in this site is drawn verbatim from April's uploaded reports. Click any element in a chart, table, timeline or bagua for the full interpretation.
      </div>
    </div>
  );
}

// Menu sections a created page can be placed in.
export const MENU_SECTIONS = [groups[0].title, groups[1].title, 'Our Shared Space', 'Relationships', ...groups.slice(2).map(g => g.title)];
