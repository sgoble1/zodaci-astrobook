import { Outlet } from 'react-router-dom';
import { GlobalFooter } from './GlobalFooter';
import { PublicHeader } from './PublicHeader';

export function PublicSiteLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#public-main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:p-3">Skip to content</a>
      <PublicHeader />
      <main id="public-main" className="max-w-6xl mx-auto px-5 sm:px-10 py-12"><Outlet /></main>
      <GlobalFooter />
    </div>
  );
}

export default PublicSiteLayout;
