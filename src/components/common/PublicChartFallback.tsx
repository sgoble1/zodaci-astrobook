import { Link, Navigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useMyBirth } from '@/lib/myBirth';
import MyChart from '@/pages/MyChart';
import MyReadings from '@/pages/MyReadings';
import { MemberSystem, MemberSystemsDashboard } from '@/pages/MemberSystem';
import PersonalTiming from '@/pages/PersonalTiming';
import MyTopicReading from '@/pages/MyTopicReading';
import MemberStarMap from '@/pages/MemberStarMap';
import MemberWorkbook from '@/pages/MemberWorkbook';
import MemberChartSection, { type ChartFocus } from '@/pages/MemberChartSection';
const CHART_FOCUS: Record<string, ChartFocus> = { '/planets': 'planets', '/houses': 'houses', '/aspects': 'aspects', '/chart-elements': 'elements', '/chart-calculator': 'calculator' };
import { LIBRARY_TOPICS } from '@/content/libraryTopics';
import { FounderSourcePanel } from '@/components/readings/FounderSourcePanel';
import { Fragment } from 'react';
import FounderTopics from '@/pages/FounderTopics';
import { useShaneAccount } from '@/hooks/useShaneAccount';
import ShaneEdition from '@/pages/ShaneEdition';
import { MemberHouseDetail, MemberPlanetDetail } from '@/pages/MemberPlacement';
import MemberFengShui from '@/pages/MemberFengShui';
import MemberDataQuality from '@/pages/MemberDataQuality';
import BaguaReading from '@/pages/BaguaReading';
import { kuaSex, toChartInput } from '@/lib/myBirth';
import { useZacAccount } from '@/hooks/useZacAccount';

const TIMING = { '/transits': 'transits', '/retrogrades': 'retrogrades', '/timeline': 'timeline', '/profection': 'profection' } as const;
const TOPIC_ROUTES: Record<string, string> = { '/numerology': 'numerology', '/purpose': 'purpose', '/family-home': 'family-home', '/love': 'love', '/career': 'career', '/health': 'health' };
const WORKBOOK: Record<string, string> = { '/workbook': '', '/workbook/check-in': 'check-in', '/workbook/reframe': 'reframe', '/workbook/journal': 'tension', };
// Library topic slugs that map onto a member's own in-depth reading.
const LIB_TO_READING: Record<string, string> = { love: 'love', career: 'career', money: 'money', health: 'health', mind: 'mind', 'family-home': 'family-home', shadow: 'shadow-work', karma: 'past-lives', spirituality: 'spiritual-gifts', purpose: 'purpose' };

const PUBLIC = ['/shane', '/zac', '/official-astrobook', '/investors', '/credits', '/developer', '/admin', '/shared', '/dispatch', '/creator', '/', '/explore', '/start', '/my-chart', '/my-readings', '/my-astrobook', '/auth', '/instructions', '/pricing', '/checkout', '/my-masterbook', '/podcasts', '/dashboard', '/books', '/orders', '/blog', '/personal-context', '/workspaces', '/wonderings', '/shared/wonderings', '/chat', '/create', '/verify', '/relationships', '/p', '/about', '/counselors', '/workbook/companion', '/workbook/social-integration', '/retrogood', '/findings', '/results', '/our-charts', '/referrals', '/my-comic', '/shared-with-me'];
export const isPublicPath = (p: string) => PUBLIC.some(x => p === x || (x !== '/' && p.startsWith(`${x}/`)));
const CHART = ['/birth-chart', '/planets', '/houses', '/aspects', '/star-map', '/chart-elements', '/reading', '/compendium', '/chart-guide', '/chart-calculator'];

/** Public visitors never see the private edition's pages: they get their own chart or readings instead. */
export function PublicChartFallback() {
  const { pathname } = useLocation();
  const birth = useMyBirth();
  const shane = useShaneAccount();
  const zac = useZacAccount();
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
  if (shane && pathname === '/topics') return <FounderTopics />;
  if (zac && !shane && pathname === '/masterbook') return <Navigate to="/zac" replace />;
  if (shane && (pathname === '/masterbook' || pathname === '/reading' || pathname === '/compendium')) return <ShaneEdition />;
  if (timing) return <><PersonalTiming birth={birth} focus={timing} /><FounderSourcePanel theme="timing" /></>;
  // Detail pages come before the overview fallbacks so /planets/venus never collapses into the planet list.
  const planet = pathname.match(/^\/planets\/([\w-]+)$/)?.[1];
  if (planet) return <MemberPlanetDetail birth={birth} planetKey={planet} />;
  const house = pathname.match(/^\/houses\/(\d+)$/)?.[1];
  if (house) return <MemberHouseDetail birth={birth} house={+house} />;
  if (pathname === '/data-quality') return <MemberDataQuality birth={birth} />;
  if (pathname === '/bagua-reading') return <BaguaReading input={{ ...toChartInput(birth), sex: kuaSex(birth.sex) }} />;
  if (pathname === '/feng-shui/flying-stars') return <MemberFengShui birth={birth} focus="stars" />;
  if (pathname === '/feng-shui' || pathname.startsWith('/feng-shui/') || pathname === '/bagua' || pathname === '/masterbook/bagua-wheel') return <MemberFengShui birth={birth} />;
  if (pathname === '/other-systems') return <MemberSystemsDashboard birth={birth} />;
  if (pathname === '/chinese') return <MemberSystem birth={birth} slug="chinese" />;
  const sys = pathname.match(/^\/other-systems\/([\w-]+)$/)?.[1];
  if (sys) return <MemberSystem birth={birth} slug={sys} />;
  if (pathname === '/star-map') return <MemberStarMap birth={birth} />;
  if (pathname in WORKBOOK || pathname.startsWith('/workbook/')) return <MemberWorkbook birth={birth} focus={WORKBOOK[pathname] || undefined} />;
  const lib = pathname.match(/^\/topics\/([\w-]+)$/)?.[1];
  if (lib) { const t = LIBRARY_TOPICS.find(x => x.slug === lib); const guess = LIB_TO_READING[lib] ?? (t ? Object.entries(LIB_TO_READING).find(([k]) => t.slug.includes(k))?.[1] : undefined); return <MyTopicReading slugOverride={guess ?? 'recurring-themes'} />; }
  const cf = CHART_FOCUS[pathname] ?? (pathname.startsWith('/planets/') ? 'planets' : pathname.startsWith('/houses/') ? 'houses' : undefined);
  if (cf) return <Fragment><MemberChartSection birth={birth} focus={cf} /><FounderSourcePanel theme={cf} /></Fragment>;
  if (TOPIC_ROUTES[pathname]) return <MyTopicReading slugOverride={TOPIC_ROUTES[pathname]} />;
  return CHART.some(c => pathname === c || pathname.startsWith(`${c}/`)) ? <MyChart /> : <MyReadings />;
}
