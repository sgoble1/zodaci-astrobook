import type { ReactNode } from 'react';

/** Shared projection surface; the chart itself remains live, selectable SVG. */
export function ChartProjection({ children }: { children: ReactNode }) {
  return (
    <div className="chart-projection">
      <div className="chart-projection-rail" aria-hidden="true"><span /><i /><span /></div>
      <div className="chart-projection-screen">
        <div className="chart-projection-beam" aria-hidden="true" />
        {children}
        <div className="chart-projection-dust" aria-hidden="true">
          {Array.from({ length: 18 }, (_, i) => <span key={i} />)}
        </div>
      </div>
      <div className="chart-projection-rail chart-projection-rail-bottom" aria-hidden="true"><span /><i /><span /></div>
    </div>
  );
}