import { useEffect, useState, type ReactNode } from 'react';

export type ChartLook = 'projector' | 'paper';
const KEY = 'zodaci.chartLook';
const EVT = 'zodaci-chart-look';

export function readChartLook(): ChartLook {
  try { return localStorage.getItem(KEY) === 'paper' ? 'paper' : 'projector'; } catch { return 'projector'; }
}

/** Per-device preference for how live wheels are shown; geometry never changes. */
export function useChartLook(): [ChartLook, (l: ChartLook) => void] {
  const [look, setLook] = useState<ChartLook>(readChartLook);
  useEffect(() => {
    const on = () => setLook(readChartLook());
    window.addEventListener(EVT, on);
    return () => window.removeEventListener(EVT, on);
  }, []);
  const set = (l: ChartLook) => {
    try { localStorage.setItem(KEY, l); } catch { /* storage unavailable */ }
    window.dispatchEvent(new Event(EVT));
  };
  return [look, set];
}

export function ChartLookToggle() {
  const [look, setLook] = useChartLook();
  return (
    <div className="chart-look-toggle" role="group" aria-label="Chart presentation">
      {(['projector', 'paper'] as const).map(l => (
        <button key={l} type="button" aria-pressed={look === l} onClick={() => setLook(l)}>
          {l === 'projector' ? 'Projector' : 'Ink on paper'}
        </button>
      ))}
    </div>
  );
}

/** Shared presentation surface; the chart itself remains live, selectable SVG. */
export function ChartProjection({ children, variant, caption }: { children: ReactNode; variant?: ChartLook; caption?: string }) {
  const [pref] = useChartLook();
  const look = variant ?? pref;
  if (look === 'paper') {
    return (
      <figure className="chart-paper">
        <span className="chart-paper-reg chart-paper-reg-tl" aria-hidden="true" />
        <span className="chart-paper-reg chart-paper-reg-br" aria-hidden="true" />
        <div className="chart-paper-sheet">{children}</div>
        <figcaption className="chart-paper-plate"><b>Plate</b> {caption ?? 'Natal chart · Zodaci Astral Research Authority'}</figcaption>
      </figure>
    );
  }
  return (
    <div className="chart-projection">
      <div className="chart-projection-rail" aria-hidden="true"><span /><i /><span /></div>
      <div className="chart-projection-screen">
        <div className="chart-projection-beam" aria-hidden="true" />
        <div className="chart-projection-flicker" aria-hidden="true" />
        {children}
        <div className="chart-projection-dust" aria-hidden="true">
          {Array.from({ length: 24 }, (_, i) => <span key={i} />)}
        </div>
      </div>
      <div className="chart-projection-rail chart-projection-rail-bottom" aria-hidden="true"><span /><i /><span /></div>
    </div>
  );
}
