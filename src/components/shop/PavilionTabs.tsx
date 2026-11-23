import { NavLink } from 'react-router-dom';

/** Publication Archive: one shop entry with tabs; each tab keeps its own address so old links still work. */
export const PAVILION_TABS = [
  { to: '/store', label: 'Publication shelf' },
  { to: '/books', label: 'AstroBooks' },
  { to: '/astrocomic', label: 'AstroComics' },
] as const;

export function PavilionTabs() {
  return (
    <nav aria-label="Publication Archive" className="flex flex-wrap items-center gap-2 border-b border-border pb-3 print:hidden">
      <span className="mr-2 font-label text-xs tracking-[0.16em] text-primary">Publication Archive</span>
      {PAVILION_TABS.map(t => (
        <NavLink key={t.to} to={t.to} end className={({ isActive }) => `inline-flex min-h-11 items-center rounded-full border px-4 text-sm transition-colors duration-500 ${isActive ? 'border-primary bg-primary/15 text-foreground' : 'border-border text-muted-foreground hover:bg-muted'}`}>{t.label}</NavLink>
      ))}
    </nav>
  );
}
