import Dashboard from "./pages/Dashboard";
import MasterbookSources from './pages/MasterbookSources';
import MyUploads from './pages/MyUploads';
import Admin from './pages/Admin';
import UploadedDoc from './pages/UploadedDoc';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useMemo, type ReactNode } from 'react';
import { AppShell } from './components/layout/AppShell';
import { PublicLibrary, PublicReader } from './pages/PublicLibrary';
import { SitePasswordGate } from './components/common/SitePasswordGate';
import { DetailDrawerProvider, type DrawerPayload } from './components/common/DetailDrawer';
import { CommandPalette } from './components/common/CommandPalette';
import {
  SABIAN_SYMBOLS, FIXED_STARS, ASTEROIDS, SPECIAL_ASPECTS, ARABIC_PARTS,
  PROFECTION_35, PRENATAL_ECLIPSE, PROFECTION_BEATS,
} from './content/compendium';
import Home from './pages/Home';
import BirthChart from './pages/BirthChart';
import Planets from './pages/Planets';
import PlanetDetail from './pages/PlanetDetail';
import Houses from './pages/Houses';
import HouseDetail from './pages/HouseDetail';
import AspectsPage from './pages/Aspects';
import TimelinePage from './pages/Timeline';
import Retrogrades from './pages/Retrogrades';
import Purpose from './pages/Purpose';
import FengShui from './pages/FengShui';
import Compendium from './pages/Compendium';
import StarMap from './pages/StarMap';
import Profection from './pages/Profection';
import Numerology from './pages/Numerology';
import Transits from './pages/Transits';
import Chinese from './pages/Chinese';
import Volume2 from './pages/Volume2';
import DataQuality from './pages/DataQuality';
import NotFound from './pages/NotFound';
import Masterbook from './pages/Masterbook';
import MasterbookChapter from './pages/MasterbookChapter';
import Podcasts from './pages/Podcasts';
import Sources from './pages/Sources';
import SourceReader from './pages/SourceReader';
import Ask from './pages/Ask';
import Chat from './pages/Chat';
import Topic, { TopicsIndex } from './pages/Topic';
import Guide from './pages/Guides';
import FlyingStars from './pages/FlyingStars';
import Bagua from './pages/Bagua';
import PdfViewer from './pages/PdfViewer';
import ChartCalculator from './pages/ChartCalculator';
import ChartElements from './pages/ChartElements';
import BaguaWheelPage from './pages/BaguaWheelPage';
import BaguaReading from './pages/BaguaReading';
import RelationshipReading from './pages/RelationshipReading';
import RelationshipTimeline from './pages/RelationshipTimeline';
import Relationships from './pages/Relationships';
import RelationshipDetail from './pages/RelationshipDetail';
import Reading from './pages/Reading';
import SharedSpace from './pages/SharedSpace';


/** Build a single registry of every drawer-openable Compendium item. Used so
 * deep links (#sabian-sun) and the ⌘K palette can hydrate the drawer on any
 * page that renders <DetailDrawerProvider>. */
function useDrawerRegistry(): Record<string, DrawerPayload> {
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
  }, []);
}

function Providers({ children }: { children: ReactNode }) {
  const registry = useDrawerRegistry();
  return (
    <DetailDrawerProvider registry={registry}>
      <CommandPalette />
      {children}
    </DetailDrawerProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
    <SitePasswordGate>
      <Providers>
        <Routes>
          <Route path="/read" element={<PublicLibrary />} />
          <Route path="/read/:id" element={<PublicReader />} />
          <Route element={<AppShell />}>
            <Route path="/" element={<Home />} />
            <Route path="/birth-chart" element={<BirthChart />} />
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
            <Route path="/shared/notes" element={<SharedSpace section="notes" />} />
            <Route path="/shared/later" element={<SharedSpace section="later" />} />
            <Route path="/shared/accounts" element={<SharedSpace section="accounts" />} />
            <Route path="/topics" element={<TopicsIndex />} />
            <Route path="/guides/:slug" element={<Guide />} />
            <Route path="/topics/:slug" element={<Topic />} />
            <Route path="*" element={<NotFound />} />

          </Route>
        </Routes>
      </Providers>
    </SitePasswordGate>
    </BrowserRouter>
  );
}
