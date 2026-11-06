import { useEffect, useState, type ReactNode } from 'react';
import { FilmFx, useInkFilter } from '@/components/observatory/FilmFx';

export type ChartLook = 'projector' | 'paper';
export type ChartDevice = 'projector' | 'monitor' | 'classic';
const KEY = 'zodaci.chartLook';
const EVT = 'zodaci-chart-look';

export function readChartLook(): ChartLook {
  try { return localStorage.getItem(KEY) === 'paper' ? 'paper' : 'projector'; } catch { return 'projector'; }
}

/** Per-device preference for projected slides vs print plates; geometry never changes. */
export function useChartLook(): [ChartLook, (l: ChartLook) => void] {
  const [look, setLook] = useState<ChartLook>(readChartLook);
  useEffect(() => {
    const on = () => setLook(readChartLook());
    window.addEventListener(EVT, on);
    window.addEventListener('storage', on);
    return () => { window.removeEventListener(EVT, on); window.removeEventListener('storage', on); };
  }, []);
  const set = (l: ChartLook) => {
    try { localStorage.setItem(KEY, l); } catch { /* storage unavailable */ }
    window.dispatchEvent(new Event(EVT));
  };
  return [look, set];
}

export function ChartLookToggle({ className }: { className?: string }) {
  const [look, setLook] = useChartLook();
  return (
    <div className={`chart-look-toggle ${className ?? ''}`} role="group" aria-label="Chart presentation">
      {(['projector', 'paper'] as const).map(l => (
        <button key={l} type="button" aria-pressed={look === l} onClick={() => setLook(l)}>
          {l === 'projector' ? 'Projector' : 'Ink on paper'}
        </button>
      ))}
    </div>
  );
}

/**
 * Shared presentation surface for every live wheel; the chart itself stays live, selectable SVG.
 * Default: the home hero's dark, lamp-lit astral projection with flicker and drifting dust.
 * Monitor: an automatic variation used by founder charts, with no extra visitor setting.
 * Classic: the original pale tripod slide screen, retained for the public live-chart sample.
 * Paper: a 1950s textbook plate for printing.
 */
export function ChartProjection({ children, variant, device = 'projector', caption }: { children: ReactNode; variant?: ChartLook; device?: ChartDevice; caption?: string }) {
  const [pref] = useChartLook();
  const look = variant ?? pref;
  const ink = useInkFilter(look === 'paper' ? 1.1 : device === 'classic' ? 1.4 : 0.65);
  if (look === 'paper') {
    return (
      <figure className="chart-paper">
        {ink.defs}
        <span className="chart-paper-reg chart-paper-reg-tl" aria-hidden="true" />
        <span className="chart-paper-reg chart-paper-reg-br" aria-hidden="true" />
        <span className="chart-paper-swatch" aria-hidden="true"><i /><i /><i /></span>
        <div className="chart-paper-sheet" style={ink.style}>{children}</div>
        <figcaption className="chart-paper-plate"><b>Plate</b> {caption ?? 'Natal chart · Zodaci Astral Research Authority'}</figcaption>
      </figure>
    );
  }
  if (device === 'monitor') {
    return (
      <figure className="chart-monitor">
        {ink.defs}
        <div className="chart-monitor-case">
          <div className="chart-monitor-brand" aria-hidden="true"><b>Zodaci</b><span>Skyscope 55</span></div>
          <div className="chart-monitor-screen">
            <div className="chart-projection-ink" style={ink.style}>{children}</div>
            <div className="chart-monitor-scan" aria-hidden="true" />
            <FilmFx tone="glow" motes={16} specks={5} />
          </div>
          <div className="chart-monitor-controls" aria-hidden="true"><span>Astral receiver</span><i /><i /><b /></div>
        </div>
        <div className="chart-monitor-foot" aria-hidden="true" />
        <figcaption className="sr-only">{caption ?? 'Natal chart on a retro observatory monitor'}</figcaption>
      </figure>
    );
  }
  if (device === 'classic') {
    return (
      <div className="chart-projection chart-projection-classic">
        {ink.defs}
        <div className="chart-projection-top" aria-hidden="true"><i /></div>
        <div className="chart-projection-screen">
          <div className="chart-projection-ink" style={ink.style}>{children}</div>
          <div className="chart-projection-falloff" aria-hidden="true" />
          <div className="chart-projection-lamp" aria-hidden="true" />
          <FilmFx tone="screen" motes={30} specks={9} />
        </div>
        <div className="chart-projection-case" aria-hidden="true"><b>Zodaci</b></div>
        <svg className="chart-projection-tripod" viewBox="0 0 200 36" preserveAspectRatio="xMidYMin meet" aria-hidden="true" focusable="false">
          <path d="M100 0v20M100 20L58 35M100 20l42 15M100 20v15" />
          <circle cx="100" cy="20" r="2.4" />
        </svg>
      </div>
    );
  }
  return (
    <figure className="chart-projection chart-projection-hero">
      {ink.defs}
      <div className="chart-hero-beam" aria-hidden="true" />
      <div className="chart-projection-screen">
        <div className="chart-projection-ink" style={ink.style}>{children}</div>
        <div className="chart-projection-lamp" aria-hidden="true" />
        <FilmFx tone="glow" motes={24} specks={7} />
      </div>
      <figcaption className="chart-hero-caption"><span aria-hidden="true">✦</span>{caption ?? 'Astral projection · calculated live'}<span aria-hidden="true">✦</span></figcaption>
    </figure>
  );
}
