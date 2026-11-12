import { useMemo } from 'react';
import { useMyBirth, toChartInput } from '@/lib/myBirth';
import { computeChart } from '@/lib/astro';
import { CurrentChapterPanel } from '@/components/observatory/CurrentChapterPanel';
import { DashboardMosaic } from './DashboardMosaic';
import { useOfficialEditions } from '@/lib/officialEditions';
import { viewingSharedEdition } from '@/hooks/useAprilSpace';
import { ChartWheelIcon, TelevisionIcon, LibraryIcon, RingsIcon, StorefrontIcon } from '@/components/icons/RetroIcons';

/** The same Broadcast Studio every account sees, fed by the chart for the open edition. */
export function EditionTV({ opening = false }: { opening?: boolean }) {
  const birth = useMyBirth();
  const chart = useMemo(() => { if (!birth) return null; try { return computeChart(toChartInput(birth)); } catch { return null; } }, [birth]);
  const { rows } = useOfficialEditions();
  const viewing = viewingSharedEdition();
  // The press slide links only to the official edition of the chart on screen (the one being viewed, else the account's own).
  const edition = rows?.find(r => (viewing ? r.edition === viewing : r.is_own))?.edition;
  if (!chart) return null;
  return <>
    {opening && <DashboardMosaic chart={chart} name={birth?.name} hasTime={Boolean(birth?.time)} primary={{ to: '/masterbook', label: 'Read the edition' }} secondary={{ to: '/my-chart', label: 'My chart' }} onAir={{ cta: { to: '#broadcast-studio', label: 'Tune in' } }} press={edition ? { book: { to: '/official-astrobook', label: 'Official AstroBook' }, comic: { to: `/official-astrobook/comic/${edition}`, label: 'Official AstroComic' } } : undefined} destinations={[
      { to: '/my-chart', title: 'My chart', text: '', cta: 'Open', icon: ChartWheelIcon },
      { to: '#broadcast-studio', title: 'Broadcast Studio', text: '', cta: 'Open', icon: TelevisionIcon },
      { to: '/masterbook', title: 'Edition library', text: '', cta: 'Open', icon: LibraryIcon },
      { to: '/shared/april', title: 'Reading Together', text: '', cta: 'Open', icon: RingsIcon },
      { to: '/store', title: 'Gift shop', text: '', cta: 'Open', icon: StorefrontIcon },
    ]} />}
    <div id="broadcast-studio" className="scroll-mt-24"><CurrentChapterPanel chart={chart} name={birth?.name} /></div>
  </>;
}
