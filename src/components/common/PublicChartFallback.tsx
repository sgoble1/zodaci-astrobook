import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useMyBirth } from '@/lib/myBirth';
import MyChart from '@/pages/MyChart';
import MyReadings from '@/pages/MyReadings';
import { MemberSystem, MemberSystemsDashboard } from '@/pages/MemberSystem';
import PersonalTiming from '@/pages/PersonalTiming';
import MyTopicReading from '@/pages/MyTopicReading';
import MemberWorkbook from '@/pages/MemberWorkbook';
import { LIBRARY_TOPICS } from '@/content/libraryTopics';

const TIMING = { '/transits': 'transits', '/retrogrades': 'retrogrades', '/timeline': 'timeline', '/profection': 'profection' } as const;
const TOPIC_ROUTES: Record<string, string> = { '/numerology': 'numerology', '/purpose': 'purpose', '/family-home': 'family-home', '/love': 'love', '/career': 'career', '/health': 'health' };
const WORKBOOK: Record<string, string> = { '/workbook': '', '/workbook/check-in': 'check-in', '/workbook/reframe': 'reframe', '/workbook/journal': 'tension', '/workbook/social-integration': 'social', '/workbook/companion': 'check-in', '/counselors': '' };
// Library topic slugs that map onto a member's own in-depth reading.
const LIB_TO_READING: Record<string, string> = { love: 'love', career: 'career', money: 'money', health: 'health', mind: 'mind', 'family-home': 'family-home', shadow: 'shadow-work', karma: 'past-lives', spirituality: 'spiritual-gifts', purpose: 'purpose' };

const PUBLIC = ['/', '/explore', '/start', '/my-chart', '/my-readings', '/my-astrobook', '/auth', '/instructions', '/pricing', '/checkout', '/my-masterbook', '/podcasts', '/dashboard', '/books', '/orders', '/blog', '/personal-context', '/workspaces', '/wonderings', '/shared/wonderings', '/chat', '/create', '/verify', '/relationships', '/p', '/about'];
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
  const timing = TIMING[pathname as keyof typeof TIMING];
  if (timing) return <PersonalTiming birth={birth} focus={timing} />;
  if (pathname === '/other-systems') return <MemberSystemsDashboard birth={birth} />;
  if (pathname === '/chinese') return <MemberSystem birth={birth} slug="chinese" />;
  const sys = pathname.match(/^\/other-systems\/([\w-]+)$/)?.[1];
  if (sys) return <MemberSystem birth={birth} slug={sys} />;
  if (pathname in WORKBOOK || pathname.startsWith('/workbook/')) return <MemberWorkbook birth={birth} focus={WORKBOOK[pathname] || undefined} />;
  const lib = pathname.match(/^\/topics\/([\w-]+)$/)?.[1];
  if (lib) { const t = LIBRARY_TOPICS.find(x => x.slug === lib); const guess = LIB_TO_READING[lib] ?? (t ? Object.entries(LIB_TO_READING).find(([k]) => t.slug.includes(k))?.[1] : undefined); return <MyTopicReading slugOverride={guess ?? 'recurring-themes'} />; }
  if (TOPIC_ROUTES[pathname]) return <MyTopicReading slugOverride={TOPIC_ROUTES[pathname]} />;
  return CHART.some(c => pathname === c || pathname.startsWith(`${c}/`)) ? <MyChart /> : <MyReadings />;
}
