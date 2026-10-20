import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useMemo, type ReactNode } from 'react';
import { AppShell } from './components/layout/AppShell';
import { DetailDrawerProvider, type DrawerPayload } from './components/common/DetailDrawer';
import { CommandPalette } from './components/common/CommandPalette';
import { ActivityTracker } from './components/common/ActivityTracker';
import { MemberSearch } from './components/common/MemberSearch';
import {
  SABIAN_SYMBOLS, FIXED_STARS, ASTEROIDS, SPECIAL_ASPECTS, ARABIC_PARTS,
  PROFECTION_35, PRENATAL_ECLIPSE, PROFECTION_BEATS,
} from './content/compendium';
import { useAprilSpace } from './hooks/useAprilSpace';
import { AutomaticChapters } from './components/payments/AutomaticChapters';
import { PublicSiteLayout } from './components/brand/PublicSiteLayout';
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MasterbookSources = lazy(() => import('./pages/MasterbookSources'));
const MyUploads = lazy(() => import('./pages/MyUploads'));
const Admin = lazy(() => import('./pages/Admin'));
const UploadedDoc = lazy(() => import('./pages/UploadedDoc'));
const PublicLibrary = lazy(() => import('./pages/PublicLibrary').then(m => ({ default: m.PublicLibrary })));
const PublicReader = lazy(() => import('./pages/PublicLibrary').then(m => ({ default: m.PublicReader })));
const PublicDocument = lazy(() => import('./pages/PublicLibrary').then(m => ({ default: m.PublicDocument })));
const MasterbookContents = lazy(() => import('./pages/MasterbookContents').then(m => ({ default: m.MasterbookContents })));
const MasterbookContentsEntry = lazy(() => import('./pages/MasterbookContents').then(m => ({ default: m.MasterbookContentsEntry })));
const CreatePage = lazy(() => import('./pages/CreatePage'));
const CustomPageView = lazy(() => import('./pages/CustomPageView'));
const Home = lazy(() => import('./pages/Home'));
const BirthChart = lazy(() => import('./pages/BirthChart'));
const Planets = lazy(() => import('./pages/Planets'));
const PlanetDetail = lazy(() => import('./pages/PlanetDetail'));
const Houses = lazy(() => import('./pages/Houses'));
const HouseDetail = lazy(() => import('./pages/HouseDetail'));
const AspectsPage = lazy(() => import('./pages/Aspects'));
const TimelinePage = lazy(() => import('./pages/Timeline'));
const Retrogrades = lazy(() => import('./pages/Retrogrades'));
const Purpose = lazy(() => import('./pages/Purpose'));
const FengShui = lazy(() => import('./pages/FengShui'));
const Compendium = lazy(() => import('./pages/Compendium'));
const StarMap = lazy(() => import('./pages/StarMap'));
const Profection = lazy(() => import('./pages/Profection'));
const Numerology = lazy(() => import('./pages/Numerology'));
const Transits = lazy(() => import('./pages/Transits'));
const Chinese = lazy(() => import('./pages/Chinese'));
const Volume2 = lazy(() => import('./pages/Volume2'));
const DataQuality = lazy(() => import('./pages/DataQuality'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Masterbook = lazy(() => import('./pages/Masterbook'));
const MasterbookChapter = lazy(() => import('./pages/MasterbookChapter'));
const ShaneEdition = lazy(() => import('./pages/ShaneEdition'));
const Podcasts = lazy(() => import('./pages/Podcasts'));
const Sources = lazy(() => import('./pages/Sources'));
const SourceReader = lazy(() => import('./pages/SourceReader'));
const Ask = lazy(() => import('./pages/Ask'));
const Chat = lazy(() => import('./pages/Chat'));
const Topic = lazy(() => import('./pages/Topic'));
const TopicsIndex = lazy(() => import('./pages/Topic').then(m => ({ default: m.TopicsIndex })));
const Guide = lazy(() => import('./pages/Guides'));
const FlyingStars = lazy(() => import('./pages/FlyingStars'));
const Bagua = lazy(() => import('./pages/Bagua'));
const PdfViewer = lazy(() => import('./pages/PdfViewer'));
const ChartCalculator = lazy(() => import('./pages/ChartCalculator'));
const ChartElements = lazy(() => import('./pages/ChartElements'));
const BaguaWheelPage = lazy(() => import('./pages/BaguaWheelPage'));
const BaguaReading = lazy(() => import('./pages/BaguaReading'));
const RelationshipReading = lazy(() => import('./pages/RelationshipReading'));
const RelationshipTimeline = lazy(() => import('./pages/RelationshipTimeline'));
const Relationships = lazy(() => import('./pages/Relationships'));
const RelationshipDetail = lazy(() => import('./pages/RelationshipDetail'));
const Reading = lazy(() => import('./pages/Reading'));
const SharedSpace = lazy(() => import('./pages/SharedSpace'));
const Verify = lazy(() => import('./pages/Verify'));
const OtherSystemsDashboard = lazy(() => import('./pages/OtherSystems').then(m => ({ default: m.OtherSystemsDashboard })));
const OtherSystemDetail = lazy(() => import('./pages/OtherSystems').then(m => ({ default: m.OtherSystemDetail })));
const WorkbookHome = lazy(() => import('./pages/Workbook').then(m => ({ default: m.WorkbookHome })));
const WorkbookModulePage = lazy(() => import('./pages/Workbook').then(m => ({ default: m.WorkbookModulePage })));
const WorkbookCheckIn = lazy(() => import('./pages/Workbook').then(m => ({ default: m.WorkbookCheckIn })));
const WorkbookReframe = lazy(() => import('./pages/Workbook').then(m => ({ default: m.WorkbookReframe })));
const WorkbookJournal = lazy(() => import('./pages/Workbook').then(m => ({ default: m.WorkbookJournal })));
const Companion = lazy(() => import('./pages/Companion'));
const ExploreDiscover = lazy(() => import('./pages/ExploreDiscover'));
const SocialIntegration = lazy(() => import('./pages/SocialIntegration'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const MyTopicReading = lazy(() => import('./pages/MyTopicReading'));
const MyChart = lazy(() => import('./pages/MyChart'));
const RetroGood = lazy(() => import('./pages/RetroGood'));
const OurCharts = lazy(() => import('./pages/OurCharts'));
const Deductions = lazy(() => import('./pages/Deductions'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const About = lazy(() => import('./pages/About'));
const MyReadings = lazy(() => import('./pages/MyReadings'));
const MyLibrary = lazy(() => import('./pages/MyLibrary'));
const Auth = lazy(() => import('./pages/Auth'));
const Pricing = lazy(() => import('./pages/Pricing'));
const CheckoutReturn = lazy(() => import('./pages/CheckoutReturn'));
const MyMasterbook = lazy(() => import('./pages/MyMasterbook'));
const Books = lazy(() => import('./pages/Books'));
const Orders = lazy(() => import('./pages/Orders'));
const Dispatch = lazy(() => import('./pages/Dispatch'));
const Blog = lazy(() => import('./pages/Blog'));
const PersonalContext = lazy(() => import('./pages/PersonalContext'));
const Workspaces = lazy(() => import('./pages/Workspaces'));
const Wonderings = lazy(() => import('./pages/Wonderings'));
const CounselorsIndex = lazy(() => import('./pages/Counselors').then(m => ({ default: m.CounselorsIndex })));
const CounselorProfile = lazy(() => import('./pages/Counselors').then(m => ({ default: m.CounselorProfile })));
const CounselorSession = lazy(() => import('./pages/Counselors').then(m => ({ default: m.CounselorSession })));
const ChartGuide = lazy(() => import('./pages/ChartGuide'));
const Instructions = lazy(() => import('./pages/Instructions'));
const BrandLanding = lazy(() => import('./pages/BrandLanding'));
const BrandLaunch = lazy(() => import('./pages/BrandLaunch'));
const PublicArticle = lazy(() => import('./pages/PublicArticle'));
const Community = lazy(() => import('./pages/Community'));
const CommunityGuidelines = lazy(() => import('./pages/Community').then(m => ({ default: m.CommunityGuidelines })));
const CreatorDashboard = lazy(() => import('./pages/CreatorDashboard'));
const AstroBookPublic = lazy(() => import('./pages/PublicInfo').then(m => ({ default: m.AstroBookPublic })));
const BookPreview = lazy(() => import('./pages/BookPreview'));
const Demo = lazy(() => import('./pages/Demo'));
const AprilEdition = lazy(() => import('./pages/AprilEdition'));
const ThemesIndex = lazy(() => import('./pages/PublicThemes').then(m => ({ default: m.ThemesIndex })));
const ThemeDetail = lazy(() => import('./pages/PublicThemes').then(m => ({ default: m.ThemeDetail })));
const FaqPage = lazy(() => import('./pages/PublicInfo').then(m => ({ default: m.FaqPage })));
const PrivacyPage = lazy(() => import('./pages/PublicInfo').then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/PublicInfo').then(m => ({ default: m.TermsPage })));


/** Build a single registry of every drawer-openable Compendium item. Used so
 * deep links (#sabian-sun) and the ⌘K palette can hydrate the drawer on any
 * page that renders <DetailDrawerProvider>. */
function useDrawerRegistry(): Record<string, DrawerPayload> {
  const april = useAprilSpace();
  return useMemo(() => {
    const reg: Record<string, DrawerPayload> = {};
    const p = (payload: DrawerPayload) => { reg[payload.id] = payload; };

    SABIAN_SYMBOLS.forEach(s => p({
      id: s.id, eyebrow: `Sabian Symbol · ${s.degree}`, title: `"${s.symbol}"`,
      subtitle: s.point,
      body: (<>
        <p>{s.interpretation}</p>
        {s.notes && <><div className="font-smallcaps text-[10px] text-gold mt-4 mb-1">Notes</div><p className="italic text-foreground/75">{s.notes}</p></>}
      </>),
      source: s.source,
    }));
    FIXED_STARS.forEach(s => p({
      id: s.id, eyebrow: `Fixed Star · orb ${s.orb}`, title: s.name,
      subtitle: `${s.degree} · conj. ${s.conjunct}`,
      body: (<>
        <div className="font-smallcaps text-[10px] text-gold mb-1">Meaning</div>
        <p className="italic">{s.meaning}</p>
        <div className="font-smallcaps text-[10px] text-gold mt-4 mb-1">Natal activation</div>
        <p>{s.activation}</p>
      </>),
      source: s.source,
    }));
    ASTEROIDS.forEach(a => p({
      id: a.id, eyebrow: `Asteroid Goddess · ${a.placement}`,
      title: `${a.glyph}  ${a.name}`, subtitle: a.archetype,
      body: <p>{a.expression}</p>, source: a.source,
    }));
    SPECIAL_ASPECTS.forEach(a => p({
      id: a.id, eyebrow: `Special Aspect · orb ${a.orb}`, title: a.name,
      subtitle: a.planets, body: <p>{a.significance}</p>, source: a.source,
    }));
    ARABIC_PARTS.forEach(part => p({
      id: part.id, eyebrow: `Arabic Part · ${part.position}`, title: part.name,
      body: <p>{part.meaning}</p>, source: part.source,
    }));
    p({
      id: PROFECTION_35.id, eyebrow: `Profection · Age ${PROFECTION_35.age}`,
      title: '12th House Profection Year', subtitle: PROFECTION_35.window,
      body: (<>
        <p>{PROFECTION_35.interpretation}</p>
        <div className="font-smallcaps text-[10px] text-gold mt-4 mb-1">Alchemical theme</div>
        <p className="italic">{PROFECTION_35.alchemicalTheme}</p>
      </>),
      source: PROFECTION_35.source,
    });
    p({
      id: PRENATAL_ECLIPSE.id, eyebrow: `Prenatal Eclipse · ${PRENATAL_ECLIPSE.date}`,
      title: PRENATAL_ECLIPSE.position,
      body: <p>{PRENATAL_ECLIPSE.interpretation}</p>,
      source: PRENATAL_ECLIPSE.source,
    });
    PROFECTION_BEATS.forEach(b => p({
      id: b.id, eyebrow: `Profection Beat · ${b.window}`, title: b.label,
      subtitle: b.focus, body: <p>{b.detail}</p>, source: PROFECTION_35.source,
    }));

    return reg;
  }, [april]);
}

function Providers({ children }: { children: ReactNode }) {
  const registry = useDrawerRegistry();
  const april = useAprilSpace();
  if (april === undefined) return <div role="status" className="p-8 text-muted-foreground">Opening your library…</div>;
  return (
    <DetailDrawerProvider registry={registry}>
      {april ? <CommandPalette /> : <MemberSearch />}
      {children}
    </DetailDrawerProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
    <>
      <Providers>
        <ActivityTracker />
        <AutomaticChapters />
        <Suspense fallback={<div role="status" aria-label="Loading page" className="mx-auto mt-10 h-40 max-w-3xl animate-pulse rounded-lg bg-muted" />}>
        <Routes>
          <Route path="/welcome" element={<BrandLanding />} />
          <Route path="/april" element={<AprilEdition />} />
          <Route element={<PublicSiteLayout />}>
            <Route path="/about" element={<About />} />
            <Route path="/lp/:slug" element={<LandingPage />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/learn/:slug" element={<PublicArticle />} />
            <Route path="/community" element={<Community />} />
            <Route path="/community/guidelines" element={<CommunityGuidelines />} />
            <Route path="/community/:id" element={<Community />} />
            <Route path="/astrobook" element={<AstroBookPublic />} />
            <Route path="/book-preview" element={<BookPreview />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/themes" element={<ThemesIndex />} />
            <Route path="/themes/:slug" element={<ThemeDetail />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
          </Route>
          <Route path="/brand-launch" element={<div className="max-w-5xl mx-auto p-5 sm:p-10"><BrandLaunch /></div>} />
          <Route path="/contents" element={<MasterbookContents />} />
          <Route path="/contents/:id" element={<MasterbookContentsEntry />} />
          <Route path="/read" element={<PublicLibrary />} />
          <Route path="/read/document/:slug" element={<PublicDocument />} />
          <Route path="/read/:id" element={<PublicReader />} />
          <Route element={<AppShell />}>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<ExploreDiscover />} />
            <Route path="/personal-context" element={<PersonalContext />} />
            <Route path="/workspaces" element={<Workspaces />} />
            <Route path="/wonderings" element={<Wonderings />} />
            <Route path="/start" element={<Onboarding />} />
            <Route path="/my-chart" element={<MyChart />} />
            <Route path="/retrogood" element={<RetroGood />} />
            <Route path="/our-charts" element={<OurCharts />} />
            <Route path="/findings" element={<Deductions />} />
            <Route path="/my-readings" element={<MyReadings />} />
            <Route path="/my-readings/topic/:slug" element={<MyTopicReading />} />
            <Route path="/my-astrobook" element={<MyLibrary />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/creator" element={<CreatorDashboard />} />
            <Route path="/checkout/return" element={<CheckoutReturn />} />
            <Route path="/my-masterbook" element={<MyMasterbook />} />
            <Route path="/books" element={<Books />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/dispatch" element={<Dispatch />} />
            <Route path="/instructions" element={<Instructions />} />
            <Route path="/birth-chart" element={<BirthChart />} />
            <Route path="/chart-guide" element={<ChartGuide />} />
            <Route path="/planets" element={<Planets />} />
            <Route path="/planets/:key" element={<PlanetDetail />} />
            <Route path="/houses" element={<Houses />} />
            <Route path="/houses/:num" element={<HouseDetail />} />
            <Route path="/aspects" element={<AspectsPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/retrogrades" element={<Retrogrades />} />
            <Route path="/purpose" element={<Purpose />} />
            <Route path="/feng-shui" element={<FengShui />} />
            <Route path="/compendium" element={<Compendium />} />
            <Route path="/star-map" element={<StarMap />} />
            <Route path="/profection" element={<Profection />} />
            <Route path="/numerology" element={<Numerology />} />
            <Route path="/transits" element={<Transits />} />
            <Route path="/chinese" element={<Chinese />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/other-systems" element={<OtherSystemsDashboard />} />
            <Route path="/other-systems/:slug" element={<OtherSystemDetail />} />
            <Route path="/volume-2" element={<Volume2 />} />
            <Route path="/data-quality" element={<DataQuality />} />
            <Route path="/masterbook" element={<Masterbook />} />
            <Route path="/masterbook/index" element={<MasterbookSources />} />
            <Route path="/masterbook/upload" element={<MyUploads />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/masterbook/u/:id" element={<UploadedDoc />} />
            <Route path="/masterbook/pdf/:id" element={<PdfViewer />} />
            <Route path="/feng-shui/flying-stars" element={<FlyingStars />} />
            <Route path="/feng-shui/bagua" element={<Bagua />} />
            <Route path="/chart-calculator" element={<ChartCalculator />} />
            <Route path="/reading" element={<Reading />} />
            <Route path="/bagua-reading" element={<BaguaReading />} />
            <Route path="/relationships" element={<Relationships />} />
            <Route path="/relationships/:id/reading" element={<RelationshipReading />} />
            <Route path="/relationships/:id/timeline" element={<RelationshipTimeline />} />
            <Route path="/relationships/:id" element={<RelationshipDetail />} />
            <Route path="/chart-elements" element={<ChartElements />} />
            <Route path="/masterbook/bagua-wheel" element={<BaguaWheelPage />} />
            <Route path="/masterbook/:id" element={<MasterbookChapter />} />
            <Route path="/shane" element={<ShaneEdition />} />
            <Route path="/shane/:id" element={<ShaneEdition />} />
            <Route path="/podcasts" element={<Podcasts />} />
            <Route path="/sources" element={<Sources />} />
            <Route path="/sources/read/:id" element={<SourceReader />} />
            <Route path="/ask" element={<Ask />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/:id" element={<Chat />} />
            <Route path="/shared" element={<SharedSpace section="overview" />} />
            <Route path="/shared/conversations" element={<SharedSpace />} />
            <Route path="/shared/chat/:id" element={<SharedSpace />} />
            <Route path="/shared/posts" element={<SharedSpace section="posts" />} />
            <Route path="/shared/wonderings" element={<SharedSpace section="wonderings" />} />
            <Route path="/shared/reading" element={<SharedSpace section="reading" />} />
            <Route path="/shared/media" element={<SharedSpace section="media" />} />
            <Route path="/shared/recommendations" element={<SharedSpace section="recs" />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/workbook" element={<WorkbookHome />} />
            <Route path="/workbook/module/:slug" element={<WorkbookModulePage />} />
            <Route path="/workbook/check-in" element={<WorkbookCheckIn />} />
            <Route path="/workbook/reframe" element={<WorkbookReframe />} />
            <Route path="/workbook/journal" element={<WorkbookJournal />} />
            <Route path="/workbook/companion" element={<Companion />} />
            <Route path="/counselors" element={<CounselorsIndex />} />
            <Route path="/counselors/:key" element={<CounselorProfile />} />
            <Route path="/counselors/:key/sessions/:sessionId" element={<CounselorSession />} />
            <Route path="/workbook/companion/:sessionId" element={<Companion />} />
            <Route path="/workbook/social-integration" element={<SocialIntegration />} />
            <Route path="/workbook/social-integration/:sessionId" element={<SocialIntegration />} />
            <Route path="/p/:id" element={<CustomPageView />} />
            <Route path="/shared/notes" element={<SharedSpace section="notes" />} />
            <Route path="/shared/later" element={<SharedSpace section="later" />} />
            <Route path="/shared/accounts" element={<SharedSpace section="accounts" />} />
            <Route path="/topics" element={<TopicsIndex />} />
            <Route path="/guides/:slug" element={<Guide />} />
            <Route path="/topics/:slug" element={<Topic />} />
            <Route path="*" element={<NotFound />} />

          </Route>
        </Routes>
        </Suspense>
      </Providers>
    </>
    </BrowserRouter>
  );
}
