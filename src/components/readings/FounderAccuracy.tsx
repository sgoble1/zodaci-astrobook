import { useMemo } from 'react';
import { computeChart, fmtLon } from '@/lib/astro';
import { toChartInput, useMyBirth } from '@/lib/myBirth';
import { useShaneAccount } from '@/hooks/useShaneAccount';

export function FounderAccuracy() {
  const own = useShaneAccount();
  const birth = useMyBirth();
  const chart = useMemo(() => birth ? computeChart(toChartInput(birth)) : null, [birth]);
  if (!own || !birth || !chart) return null;
  return <section className="space-y-4 border-b border-border pb-6" data-keep-wording>
    <h2 className="text-2xl">Your calculated chart · source cross-check</h2>
    <p className="text-sm text-muted-foreground">{birth.date} · {birth.time ?? 'Time unknown'} · {birth.placeLabel} · {birth.houseSystem}. The uploaded Masterbook contains conflicting planetary signs, degrees and motion. Preserve it as an original document, not a verified natal report. Current interpretations must use these calculated placements.</p>
    <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border text-left"><th className="p-2">Point</th><th className="p-2">Calculated position</th><th className="p-2">House</th><th className="p-2">Motion</th></tr></thead><tbody>{chart.bodies.map(b => <tr key={b.key} className="border-b border-border"><td className="p-2">{b.name}</td><td className="p-2">{fmtLon(b.lon).text}</td><td className="p-2">{birth.time ? b.house ?? '—' : 'Unknown'}</td><td className="p-2">{b.retro ? 'Retrograde' : 'Direct'}</td></tr>)}</tbody></table></div>
    <p className="text-xs text-muted-foreground">For the saved birth inputs, Sun, Moon, Mercury, Venus, Mars, Saturn, Ascendant and Midheaven were independently cross-checked with Swiss Ephemeris. Minor points and other traditions retain their own calculation limitations. Symbolic interpretations are not proven biography or medical advice.</p>
  </section>;
}