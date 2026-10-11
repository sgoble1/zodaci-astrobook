import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useMyBirth } from '@/lib/myBirth';
import MyChart from '@/pages/MyChart';
import MyReadings from '@/pages/MyReadings';

const PUBLIC = ['/', '/explore', '/start', '/my-chart', '/my-readings', '/my-astrobook', '/auth', '/instructions', '/pricing', '/checkout', '/my-masterbook', '/podcasts', '/dashboard', '/books', '/orders', '/blog', '/personal-context', '/workspaces', '/wonderings', '/shared/wonderings'];
export const isPublicPath = (p: string) => PUBLIC.some(x => p === x || (x !== '/' && p.startsWith(`${x}/`)));
const CHART = ['/birth-chart', '/planets', '/houses', '/aspects', '/star-map', '/chart-elements', '/reading', '/compendium', '/chart-guide', '/chart-calculator'];

/** Public visitors never see the private edition's pages: they get their own chart or readings instead. */
export function PublicChartFallback() {
  const { pathname } = useLocation();
  const birth = useMyBirth();
  if (birth === undefined) return null;
  if (!birth) return (
    <article className="mx-auto max-w-xl space-y-4 py-12 text-center">
      <h1 className="font-display text-3xl">This page is built from your own chart</h1>
      <p className="text-muted-foreground">Add your birth date, time and place, and this page will show your own placements and recommendations.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild><Link to="/start">Enter my birth details</Link></Button>
        <Button asChild variant="outline"><Link to="/auth">Create a free account</Link></Button>
      </div>
    </article>
  );
  return CHART.some(c => pathname === c || pathname.startsWith(`${c}/`)) ? <MyChart /> : <MyReadings />;
}
