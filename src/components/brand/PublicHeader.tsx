import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronDown, Menu } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ZodaciLogo } from './ZodaciLogo';
import { useSession } from '@/hooks/useLibrary';

/** The four public pillars every signed-out page uses. Items marked member open after sign-in. */
export type PublicPillar = { label: string; to: string; items: { to: string; label: string; description: string }[] };
export const PUBLIC_PILLARS: PublicPillar[] = [
  { label: 'Products', to: '/astrobook', items: [
    { to: '/astrobook', label: 'AstroBooks', description: 'Printed books written from your chart' },
    { to: '/astrocomic', label: 'AstroComics', description: 'A monthly illustrated issue' },
    { to: '/keepsakes', label: 'Gift keepsakes', description: 'Certificates and Star Scrolls' },
    { to: '/store', label: 'Shop', description: 'Posters, stickers and notebooks' },
  ] },
  { label: 'Calculators & Tools', to: '/start', items: [
    { to: '/start', label: 'Birth chart', description: 'Calculate your chart from date, time and place' },
    { to: '/ephemeris', label: 'Ephemeris', description: 'Daily UTC positions, 1800–2100' },
    { to: '/retrogrades', label: 'Retrograde Guide', description: 'Recent, active and upcoming cycles' },
    { to: '/bazi', label: 'BaZi · Four Pillars', description: 'Pillars, five elements and Lo Shu' },
    { to: '/compatibility', label: 'Relationships', description: 'Compare two charts' },
  ] },
  { label: 'Learn & Academy', to: '/learn', items: [
    { to: '/learn', label: 'All of Learn', description: 'Lessons, guides and articles' },
    { to: '/compendium', label: 'Compendium', description: 'Every placement, explained' },
    { to: '/about', label: 'Philosophy', description: 'How Zodaci reads a chart' },
    { to: '/sources', label: 'Source references', description: 'The books and tables behind the readings' },
    { to: '/accuracy', label: 'How we calculate', description: 'Checked against Swiss Ephemeris' },
  ] },
  { label: 'Pricing', to: '/pricing', items: [
    { to: '/pricing', label: 'Plans', description: 'Free, Pro and Cosmic, side by side' },
    { to: '/books', label: 'Book editions', description: 'Every AstroBook version and price' },
    { to: '/pricing#faq', label: 'Redeem a gift', description: 'Gift links arrive by email; questions answered here' },
  ] },
];
/** Flat list of every public header destination (kept for link checks). */
export const PUBLIC_NAV: [string, string][] = PUBLIC_PILLARS.flatMap(p => p.items.map(i => [i.to, i.label] as [string, string]));

export function PublicHeader({ sections }: { sections?: string[] }) {
  const [open, setOpen] = useState(false);
  const session = useSession();
  const { pathname } = useLocation();
  useEffect(() => { setOpen(false); }, [pathname]);
  const account: [string, string] = session ? ['/dashboard', 'My Zodaci'] : ['/auth', 'Sign in'];
  const active = (to: string) => pathname === to || pathname.startsWith(`${to}/`);
  return (
    <header className="voyager-public-header sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-10 lg:h-20">
        <Link to="/welcome" aria-label="Zodaci home" className="shrink-0"><span className="xl:hidden 2xl:inline"><ZodaciLogo /></span><span className="hidden xl:inline 2xl:hidden"><ZodaciLogo compact /></span></Link>
        <nav aria-label="Public pages" className="hidden items-center gap-0 xl:flex">
          {sections?.map(s => <Button key={s} asChild variant="ghost" size="sm"><a href={`#${s.toLowerCase()}`}>{s}</a></Button>)}
          {sections && <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />}
          {PUBLIC_PILLARS.map(p => {
            const on = p.items.some(i => active(i.to.split('#')[0]));
            return (
              <DropdownMenu key={p.label}>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className={`gap-1 px-3 font-label text-sm ${on ? 'text-primary' : ''}`}>{p.label}<ChevronDown aria-hidden className="h-3.5 w-3.5" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-72 border-[hsl(var(--brass)/0.5)] bg-background p-2">
                  {p.items.map(i => <DropdownMenuItem key={i.to} asChild><Link to={i.to} aria-current={active(i.to.split('#')[0]) && !i.to.includes('#') ? 'page' : undefined} className={`flex min-h-11 flex-col items-start gap-0.5 py-2 ${active(i.to.split('#')[0]) && !i.to.includes('#') ? 'bg-accent text-accent-foreground' : ''}`}><span className="block font-label">{i.label}</span><span className="block text-xs text-muted-foreground">{i.description}</span></Link></DropdownMenuItem>)}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex"><Link to={account[0]}>{account[1]}<ArrowUpRight /></Link></Button>
          {!session && <Button asChild variant="signal" size="sm" className="hidden xl:inline-flex"><Link to="/start">Generate your chart<ArrowRight /></Link></Button>}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild><Button variant="ghost" size="icon" className="min-h-11 min-w-11 xl:hidden" aria-label="Open menu"><Menu /></Button></SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm overflow-y-auto bg-background">
              <SheetHeader><SheetTitle className="text-left">Menu</SheetTitle></SheetHeader>
              <nav aria-label="Mobile navigation" className="mt-6 flex flex-col">
                {sections?.map(s => <a key={s} href={`#${s.toLowerCase()}`} onClick={() => setOpen(false)} className="border-b border-border py-3 text-lg">{s}</a>)}
                {PUBLIC_PILLARS.map(p => <section key={p.label} aria-label={p.label} className="border-b border-border py-3">
                  <p className="mb-1 font-label text-xs tracking-[0.16em] text-primary">{p.label}</p>
                  <ul className="grid gap-0.5">{p.items.map(i => <li key={i.to}><Link to={i.to} aria-current={active(i.to.split('#')[0]) && !i.to.includes('#') ? 'page' : undefined} onClick={() => setOpen(false)} className={`flex min-h-11 items-center py-2 text-base ${active(i.to.split('#')[0]) && !i.to.includes('#') ? 'font-semibold text-primary underline underline-offset-4' : ''}`}>{i.label}</Link></li>)}</ul>
                </section>)}
              </nav>
              <div className="mt-8 grid gap-3">
                <Button asChild variant="signal"><Link to="/start" onClick={() => setOpen(false)}>Generate your chart<ArrowRight /></Link></Button>
                <Button asChild variant="outline"><Link to={account[0]} onClick={() => setOpen(false)}>{account[1]}</Link></Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
