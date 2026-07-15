import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { BIRTH } from '@/content/april';
import { CommandPaletteTrigger } from '@/components/common/CommandPalette';

const nav = [
  { to: '/', label: 'Home' },
  { to: '/birth-chart', label: 'Birth Chart' },
  { to: '/planets', label: 'Planets' },
  { to: '/houses', label: 'Houses' },
  { to: '/aspects', label: 'Aspects' },
  { to: '/timeline', label: 'Timeline · 1990–2060' },
  { to: '/retrogrades', label: 'Retrogrades' },
  { to: '/purpose', label: 'Purpose & Numerology' },
  { to: '/feng-shui', label: 'Feng Shui' },
  { to: '/compendium', label: 'Compendium' },
  { to: '/star-map', label: 'Fixed-Star Sky Map' },
  { to: '/profection', label: 'Profection · Age 35' },
  { to: '/art-direction', label: 'Art Direction' },
];

export function AppShell() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }, [location.pathname]);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-border bg-card/60 backdrop-blur-sm sticky top-0 h-screen">
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
      <main className="flex-1 min-w-0 lg:pt-0 pt-[57px]">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 py-10 lg:py-14">
          <Outlet />
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

      <nav className="flex flex-col gap-0.5 text-sm">
        {nav.map(n => (
          <NavLink
            key={n.to} to={n.to} end={n.to === '/'}
            className={({ isActive }) =>
              `px-3 py-2 rounded border border-transparent transition-colors ${
                isActive
                  ? 'bg-accent/15 border-accent/30 text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`
            }
          >
            {n.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto text-[11px] text-muted-foreground leading-relaxed">
        Every planet, house, aspect and phase in this site is drawn verbatim from April's uploaded reports. Click any element in a chart, table, timeline or bagua for the full interpretation.
      </div>
    </div>
  );
}
