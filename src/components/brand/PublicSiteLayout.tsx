import { Link, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ZodaciLogo } from './ZodaciLogo';
import { GlobalFooter } from './GlobalFooter';

export function PublicSiteLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#public-main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:p-3">Skip to content</a>
      <header className="border-b border-border"><div className="max-w-7xl mx-auto px-5 sm:px-10 py-5 flex flex-wrap justify-between items-center gap-4"><Link to="/welcome"><ZodaciLogo /></Link><nav aria-label="Public pages" className="flex flex-wrap gap-1">{[['/welcome', 'Zodaci'], ['/about', 'About'], ['/blog', 'Blog'], ['/community', 'Community'], ['/astrobook', 'AstroBook'], ['/pricing', 'Pricing']].map(([to, label]) => <Button asChild variant="ghost" key={to}><Link to={to}>{label}</Link></Button>)}<Button asChild variant="outline"><Link to="/auth">Sign in</Link></Button></nav></div></header>
      <main id="public-main" className="max-w-6xl mx-auto px-5 sm:px-10 py-12"><Outlet /></main>
      <GlobalFooter />
    </div>
  );
}

export default PublicSiteLayout;
