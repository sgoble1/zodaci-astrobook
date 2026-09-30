import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ParticleField from '@/components/fx/ParticleField';
import ScrollProgress from '@/components/fx/ScrollProgress';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { BIRTH } from '@/content/april';
import { TOPICS } from '@/content/topics';
import { useRelationships } from '@/hooks/useRelationships';
import { CommandPaletteTrigger } from '@/components/common/CommandPalette';

const groups: { title: string; items: { to: string; label: string }[] }[] = [
  { title: 'Begin', items: [{ to: '/', label: 'Home' }, { to: '/masterbook', label: 'The Masterbook · Full Text' }, { to: '/masterbook/index', label: 'Document Index' }, { to: '/guides/timeline-retrogrades', label: 'Guide · Timeline & Retrogrades' }, { to: '/guides/birth-chart-feng-shui', label: 'Guide · Birth Chart & Feng Shui' }, { to: '/guides/feng-shui-pages', label: 'Guide · Feng Shui Page by Page + Flying Stars Wheel' }, { to: '/masterbook/upload', label: 'Upload to the Masterbook' },{ to: '/admin', label: 'Admin Dashboard' }, { to: '/ask', label: 'Ask the Sources' }, { to: '/reading', label: 'The Complete Reading' }, { to: '/chart-elements', label: 'Chart Elements & Meanings' }, { to: '/bagua-reading', label: 'The Bagua Reading' }, { to: '/masterbook/bagua-wheel', label: 'Masterbook · Bagua Wheel' }] },
  { title: 'Themes & Topics', items: [{ to: '/topics', label: 'All Themes' }, ...TOPICS.map(t => ({ to: `/topics/${t.slug}`, label: t.label }))] },
  { title: 'The Natal Chart', items: [
    { to: '/birth-chart', label: 'Birth Chart' }, { to: '/chart-calculator', label: 'Chart Calculator' }, { to: '/planets', label: 'Planets' }, { to: '/houses', label: 'Houses' },
    { to: '/aspects', label: 'Aspects' }, { to: '/star-map', label: 'Fixed-Star Sky Map' }, { to: '/compendium', label: 'Compendium' }] },
  { title: 'Timing & Cycles', items: [
    { to: '/timeline', label: 'Timeline · 1990–2060' }, { to: '/transits', label: 'Transits · 2026–2040' },
    { to: '/profection', label: 'Profection · Age 35' }, { to: '/retrogrades', label: 'Retrogrades' }] },
  { title: 'Other Systems', items: [
    { to: '/numerology', label: 'Numerology · Pinnacles' }, { to: '/purpose', label: 'Purpose & Numerology' },
    { to: '/chinese', label: 'Chinese · Ba Zi' }, { to: '/feng-shui', label: 'Feng Shui' }, { to: '/feng-shui/bagua', label: 'Feng Shui · Bagua & Home' }, { to: '/feng-shui/flying-stars', label: 'Feng Shui · Flying Stars' }, { to: '/volume-2', label: 'Volume II · Supplement' }] },
  { title: 'Library', items: [
    { to: '/podcasts', label: 'Podcasts' }, { to: '/sources', label: 'Source Files' },
    { to: '/data-quality', label: 'Data Quality' }] },
];

export function AppShell() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }, [location.pathname]);

  return (
    <div className="min-h-screen flex text-foreground relative">
      <ScrollProgress />
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
        <button onClick={() => setOpen(v => !v)} aria-label="Toggle navigation" className="p-2 rounded hover:bg-muted">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden fixed inset-0 top-[57px] z-30 bg-background overflow-y-auto">
          <SidebarInner />
        </div>
      )}

      {/* Main */}
      <main className="flex-1 min-w-0 lg:pt-0 pt-[57px] relative z-10">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 py-10 lg:py-14">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <Outlet />
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
  );
}

function SidebarInner() {
  const { items: rels } = useRelationships();
  const allGroups = [...groups.slice(0, 1), { title: 'Relationships', items: [{ to: '/relationships', label: 'All Relationships' }, { to: '/guides/relationships', label: 'Relationships in the Sources' }, ...rels.map(r => ({ to: `/relationships/${r.id}`, label: `↳ ${r.name}${r.relation ? ` · ${r.relation}` : ''}` }))] }, ...groups.slice(1)];
  return (
    <div className="p-6 flex flex-col gap-6 h-full overflow-y-auto">
      <div>
        <div className="font-smallcaps text-[10px] text-gold">Companion Document</div>
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

      <div className="pt-1"><CommandPaletteTrigger /></div>

      <nav className="flex flex-col gap-4 text-sm">
        {allGroups.map(g => (
          <div key={g.title} className="flex flex-col gap-0.5">
            <div className="font-smallcaps text-[10px] text-gold px-3 mb-1">{g.title}</div>
            {g.items.map(n => (
              <NavLink
                key={n.to} to={n.to} end={n.to === '/' || n.to === '/masterbook' || n.to === '/relationships'}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded border border-transparent transition-colors ${
                    isActive ? 'bg-accent/15 border-accent/30 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`
                }
              >{n.label}</NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="mt-auto text-[11px] text-muted-foreground leading-relaxed">
        Every planet, house, aspect and phase in this site is drawn verbatim from April's uploaded reports. Click any element in a chart, table, timeline or bagua for the full interpretation.
      </div>
    </div>
  );
}
