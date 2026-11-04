import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronDown, Menu } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SpotArt } from '@/components/art/SpotArt';
import { LEARN_SECTIONS } from '@/content/learnSections';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ZodaciLogo } from './ZodaciLogo';
import { useSession } from '@/hooks/useLibrary';

/** The one public menu every signed-out page uses. */
export const PUBLIC_NAV: [string, string][] = [
  ['/start', 'Charts'], ['/astrobook', 'AstroBooks'], ['/compatibility', 'Relationships'],
  ['/learn', 'Learn'], ['/store', 'Shop'], ['/about', 'About'], ['/pricing', 'Pricing'],
];

export function PublicHeader({ sections }: { sections?: string[] }) {
  const [open, setOpen] = useState(false);
  const session = useSession();
  const { pathname } = useLocation();
  const account: [string, string] = session ? ['/dashboard', 'My Zodaci'] : ['/auth', 'Sign in'];
  const active = (to: string) => pathname === to || pathname.startsWith(`${to}/`);
  const learnActive = ['/learn', '/academy', '/reading-room', '/forecast'].some(active);
  return (
    <header className="sticky top-0 z-40 border-b-2 border-[hsl(var(--brass)/0.6)] bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-10 lg:h-20">
        <Link to="/welcome" aria-label="Zodaci home" className="shrink-0"><span className="xl:hidden 2xl:inline"><ZodaciLogo /></span><span className="hidden xl:inline 2xl:hidden"><ZodaciLogo compact /></span></Link>
        <nav aria-label="Public pages" className="hidden items-center gap-0 xl:flex">
          {sections?.map(s => <Button key={s} asChild variant="ghost" size="sm"><a href={`#${s.toLowerCase()}`}>{s}</a></Button>)}
          {sections && <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />}
          {PUBLIC_NAV.map(([to, label]) => to === '/learn' ? (
            <DropdownMenu key={to}>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className={`gap-1 px-2.5 font-label text-sm ${learnActive ? 'text-primary' : ''}`}>{label}<ChevronDown aria-hidden className="h-3.5 w-3.5" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72 border-[hsl(var(--brass)/0.5)] bg-background p-2">
                <DropdownMenuItem asChild><Link to="/learn" className="flex items-center gap-3 py-2"><SpotArt kind="explore" className="h-9 w-9" orbit={false} /><span><span className="block font-label">All of Learn</span><span className="block text-xs text-muted-foreground">Everything in one place</span></span></Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                {LEARN_SECTIONS.map(s => <DropdownMenuItem key={s.id} asChild><Link to={s.id === 'forecasts' ? '/forecast' : `/learn#${s.id}`} className="flex items-center gap-3 py-2"><SpotArt kind={s.art} className="h-9 w-9" orbit={false} /><span><span className="block font-label">{s.label}</span><span className="block text-xs text-muted-foreground">{s.description}</span></span></Link></DropdownMenuItem>)}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : <Button key={to} asChild variant="ghost" size="sm" className={`px-2.5 font-label text-sm ${active(to) ? 'text-primary' : ''}`}><Link to={to} aria-current={active(to) ? 'page' : undefined}>{label}</Link></Button>)}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex"><Link to={account[0]}>{account[1]}<ArrowUpRight /></Link></Button>
          {!session && <Button asChild variant="signal" size="sm" className="hidden 2xl:inline-flex"><Link to="/start">Generate your chart<ArrowRight /></Link></Button>}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild><Button variant="ghost" size="icon" className="xl:hidden" aria-label="Open menu"><Menu /></Button></SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm overflow-y-auto bg-background">
              <SheetHeader><SheetTitle className="text-left">Menu</SheetTitle></SheetHeader>
              <nav aria-label="Mobile navigation" className="mt-6 flex flex-col">
                {sections?.map(s => <a key={s} href={`#${s.toLowerCase()}`} onClick={() => setOpen(false)} className="border-b border-border py-3 text-lg">{s}</a>)}
                {sections && <p className="mb-1 mt-6 font-smallcaps text-xs text-gold">Explore</p>}
                {PUBLIC_NAV.map(([to, label]) => <div key={to} className="border-b border-border">
                  <Link to={to} onClick={() => setOpen(false)} className="block py-3 text-lg">{label}</Link>
                  {to === '/learn' && <ul className="mb-3 grid gap-1 pl-3">{LEARN_SECTIONS.map(s => <li key={s.id}><Link to={s.id === 'forecasts' ? '/forecast' : `/learn#${s.id}`} onClick={() => setOpen(false)} className="flex items-center gap-2 py-1.5 text-muted-foreground"><SpotArt kind={s.art} className="h-6 w-6" orbit={false} />{s.label}</Link></li>)}</ul>}
                </div>)}
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
