import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
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
import ArtDirection from './pages/ArtDirection';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
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
          <Route path="/art-direction" element={<ArtDirection />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
