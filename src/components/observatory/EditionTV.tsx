import { useMemo } from 'react';
import { useMyBirth, toChartInput } from '@/lib/myBirth';
import { computeChart } from '@/lib/astro';
import { CurrentChapterPanel } from '@/components/observatory/CurrentChapterPanel';
import { DashboardMosaic } from './DashboardMosaic';
import { ChartWheelIcon, TelevisionIcon, LibraryIcon, RingsIcon, StorefrontIcon } from '@/components/icons/RetroIcons';

/** The same Broadcast Studio every account sees, fed by the chart for the open edition. */
export function EditionTV({ opening = false }: { opening?: boolean }) {
  const birth = useMyBirth();
  const chart = useMemo(() => { if (!birth) return null; try { return computeChart(toChartInput(birth)); } catch { return null; } }, [birth]);
  if (!chart) return null;
  return <>
    {opening && <DashboardMosaic chart={chart} name={birth?.name} hasTime={Boolean(birth?.time)} primary={{ to: '/masterbook', label: 'Read the edition' }} secondary={{ to: '/my-chart', label: 'My chart' }} onAir={{ cta: { to: '#broadcast-studio', label: 'Tune in' } }} destinations={[
      { to: '/my-chart', title: 'My chart', text: '', cta: 'Open', icon: ChartWheelIcon },
      { to: '#broadcast-studio', title: 'Broadcast Studio', text: '', cta: 'Open', icon: TelevisionIcon },
      { to: '/masterbook', title: 'Edition library', text: '', cta: 'Open', icon: LibraryIcon },
      { to: '/shared/april', title: 'Reading Together', text: '', cta: 'Open', icon: RingsIcon },
      { to: '/store', title: 'Gift shop', text: '', cta: 'Open', icon: StorefrontIcon },
    ]} />}
    <div id="broadcast-studio" className="scroll-mt-24"><CurrentChapterPanel chart={chart} name={birth?.name} /></div>
  </>;
}
