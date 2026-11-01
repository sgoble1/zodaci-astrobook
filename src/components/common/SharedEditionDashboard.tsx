import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useMyBirth, toChartInput } from '@/lib/myBirth';
import { computeChart, fmtLon } from '@/lib/astro';
import { ChartWheel } from '@/components/chart/ChartWheel';
import { Button } from '@/components/ui/button';
import { viewingSharedEdition } from '@/hooks/useAprilSpace';

/** Only shared chart facts appear here; never the viewer's or owner's private account records. */
export function SharedEditionDashboard() {
  const birth = useMyBirth();
  const edition = viewingSharedEdition();
  const chart = useMemo(() => { if (!birth) return null; try { return computeChart(toChartInput(birth)); } catch { return null; } }, [birth]);
  if (birth === undefined) return <p role="status">Opening the shared chart…</p>;
  if (!birth || !chart) return <div role="alert" className="space-y-4"><h1>Shared chart unavailable</h1><p className="text-muted-foreground">This chart needs verified birth details and permission from its owner.</p><Button asChild><Link to="/shared-with-me">Shared editions</Link></Button></div>;
  const placements = [['Sun', chart.bodies.find(b => b.key === 'sun')?.sign], ['Moon', chart.bodies.find(b => b.key === 'moon')?.sign], ['Rising', chart.asc !== null && birth.time ? fmtLon(chart.asc).sign : 'Time unknown']];
  return <article className="space-y-10">
    <header className="space-y-3 border-b border-border pb-6"><p className="text-sm text-gold">Shared edition · Read only</p><h1 className="text-silver">{birth.name}’s dashboard</h1><p className="text-muted-foreground">{birth.date} · {birth.time ?? 'Time unknown'} · {birth.placeLabel}</p></header>
    <section className="space-y-6"><h2>Chart snapshot</h2><dl className="grid grid-cols-1 gap-6 sm:grid-cols-3">{placements.map(([label, value]) => <div key={label} className="border-l border-gold pl-4"><dt className="text-sm text-muted-foreground">{label}</dt><dd className="font-display text-3xl">{value}</dd></div>)}</dl><ChartWheel r={chart} /></section>
    <nav aria-label="Shared edition pages" className="flex flex-wrap gap-3"><Button asChild><Link to="/my-chart">{birth.name}’s chart</Link></Button><Button asChild variant="outline"><Link to={edition === 'zac' ? '/zac' : '/masterbook'}>Read the edition</Link></Button><Button asChild variant="outline"><Link to={edition === 'zac' ? '/shared/zac' : '/shared/april'}>Reading Together</Link></Button></nav>
  </article>;
}