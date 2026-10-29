import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ZodaciLogo } from './ZodaciLogo';
import { useSession } from '@/hooks/useLibrary';

/** The one public menu every signed-out page uses. */
export const PUBLIC_NAV: [string, string][] = [
  ['/academy', 'Learn'], ['/reading-room', 'Reading Room'], ['/compatibility', 'Compatibility'],
  ['/astrobook', 'AstroBook'], ['/astrocomic', 'AstroComic'], ['/store', 'Shop'], ['/pricing', 'Pricing'],
];

export function PublicHeader({ sections }: { sections?: string[] }) {
  const [open, setOpen] = useState(false);
  const session = useSession();
  const { pathname } = useLocation();
  const account: [string, string] = session ? ['/dashboard', 'Open my Zodaci'] : ['/auth', 'Sign in'];
  const active = (to: string) => pathname === to || pathname.startsWith(`${to}/`);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-10 lg:h-20">
        <Link to="/welcome" aria-label="Zodaci home" className="shrink-0"><ZodaciLogo /></Link>
        <nav aria-label="Public pages" className="hidden items-center gap-1 xl:flex">
          {sections?.map(s => <Button key={s} asChild variant="ghost" size="sm"><a href={`#${s.toLowerCase()}`}>{s}</a></Button>)}
          {sections && <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />}
          {PUBLIC_NAV.map(([to, label]) => <Button key={to} asChild variant="ghost" size="sm" className={active(to) ? 'text-gold' : ''}><Link to={to} aria-current={active(to) ? 'page' : undefined}>{label}</Link></Button>)}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex"><Link to={account[0]}>{account[1]}<ArrowUpRight /></Link></Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild><Button variant="ghost" size="icon" className="xl:hidden" aria-label="Open menu"><Menu /></Button></SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm overflow-y-auto bg-background">
              <SheetHeader><SheetTitle className="text-left">Menu</SheetTitle></SheetHeader>
              <nav aria-label="Mobile navigation" className="mt-6 flex flex-col">
                {sections?.map(s => <a key={s} href={`#${s.toLowerCase()}`} onClick={() => setOpen(false)} className="border-b border-border py-3 text-lg">{s}</a>)}
                {sections && <p className="mb-1 mt-6 font-smallcaps text-xs text-gold">Explore</p>}
                {PUBLIC_NAV.map(([to, label]) => <Link key={to} to={to} onClick={() => setOpen(false)} className="border-b border-border py-3 text-lg">{label}</Link>)}
              </nav>
              <div className="mt-8 grid gap-3">
                <Button asChild><Link to="/start" onClick={() => setOpen(false)}>Explore your chart<ArrowRight /></Link></Button>
                <Button asChild variant="outline"><Link to={account[0]} onClick={() => setOpen(false)}>{account[1]}</Link></Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
