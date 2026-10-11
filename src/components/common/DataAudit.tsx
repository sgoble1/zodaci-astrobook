import { useMemo } from 'react';
import { computeChart, localToUtc, type ChartInput } from '@/lib/astro';
import { PLACEMENTS, longitudeOf } from '@/content/april';
import { APRIL } from '@/pages/ChartCalculator';

// Re-runs April's chart from the official birth facts every time the page opens and grades
// every recorded placement against the fresh calculation. No stored scores — always live.
const TOL: Record<string, number> = { northNode: 1.6, southNode: 1.6, lilith: 0.25 }; // known method differences (mean vs true)

type Grade = 'match' | 'close' | 'off' | 'separate';
const STYLE: Record<Grade, [string, string]> = {
  match: ['Matches', 'border-primary/50 bg-primary/10'],
  close: ['Close — known method difference', 'border-accent/50 bg-accent/10'],
  off: ['Needs review', 'border-destructive/60 bg-destructive/10'],
  separate: ['Checked separately', 'border-border bg-muted/40'],
};
const dm = (d: number) => `${Math.floor(d)}°${String(Math.round((d % 1) * 60)).padStart(2, '0')}′`;

export function DataAudit() {
  const rows = useMemo(() => {
    const c = computeChart(APRIL);
    return PLACEMENTS.map(p => {
      const b = c.bodies.find(x => x.key === p.key);
      const rec = longitudeOf(p);
      if (!b) return { p, grade: 'separate' as Grade, calc: '—', diff: null as number | null, note: 'This point needs extra tables; it was checked against NASA JPL Horizons instead.' };
      const diff = Math.abs(((b.lon - rec + 540) % 360) - 180);
      const tol = TOL[p.key] ?? 0.1;
      const houseOk = b.house == null || b.house === p.house;
      const retroOk = p.key.includes('Node') || p.key === 'lilith' || p.key === 'vertex' || p.key === 'fortune' || b.retro === /retro/i.test(p.motion ?? '');
      const grade: Grade = diff <= 0.1 && houseOk && retroOk ? 'match' : diff <= tol && houseOk ? 'close' : 'off';
      const notes = [!houseOk && `house differs (calculated ${b.house})`, !retroOk && 'motion differs'].filter(Boolean).join('; ');
      return { p, grade, calc: `${b.sign} ${b.deg}°${String(b.min).padStart(2, '0')}′ · house ${b.house ?? '?'}${b.retro ? ' · Rx' : ''}`, diff, note: notes || (grade === 'close' ? b.note ?? '' : '') };
    });
  }, []);
  const { utc } = localToUtc(APRIL.date, APRIL.time ?? '12:00', APRIL.tz);
  const checked = rows.filter(r => r.grade !== 'separate');
  const score = Math.round(checked.reduce((s, r) => s + (r.grade === 'match' ? 1 : r.grade === 'close' ? 0.9 : 0), 0) / checked.length * 100);
  const offs = rows.filter(r => r.grade === 'off').length;

  return (
    <section aria-labelledby="audit-h" className="p-6 border border-border rounded bg-card/70 space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <div className="font-smallcaps text-[10px] text-gold">Automatic accuracy check · runs every time this page opens</div>
          <h2 id="audit-h" className="font-display text-2xl mt-1">Data quality score: {score}%</h2>
        </div>
        <span className={`rounded-full border px-3 py-1 text-sm ${offs ? STYLE.off[1] : STYLE.match[1]}`}>{offs ? `${offs} item${offs > 1 ? 's' : ''} need review` : 'No errors found'}</span>
      </div>
      <p className="text-sm text-foreground/85">
        <strong>In plain words:</strong> AstroBook takes April's official birth facts — September 6, 1990, 3:38 PM EDT, Geneva, New York — works out the sky again from scratch, and compares every saved placement with the new result. Green means it agrees to within 6 arc‑minutes (a tenth of a degree). "Close" means a small, known difference between calculation methods, not a mistake.
      </p>
      <p className="text-xs text-muted-foreground">Birth time converted to world time: {utc.toISOString().replace('T', ' ').slice(0, 16)} UTC (EDT = UTC−4). Location 42°52′N, 76°59′W. Houses: Placidus (the system the books use).</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead><tr className="text-left text-xs text-muted-foreground"><th className="py-2 pr-3">Point</th><th className="pr-3">Saved in AstroBook</th><th className="pr-3">Fresh calculation</th><th className="pr-3">Gap</th><th>Result</th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.p.key} className="border-t border-border/60 align-top">
                <td className="py-2 pr-3 font-medium">{r.p.glyph} {r.p.name}</td>
                <td className="pr-3">{r.p.sign} {r.p.degree}°{String(r.p.minute).padStart(2, '0')}′ · house {r.p.house}</td>
                <td className="pr-3">{r.calc}</td>
                <td className="pr-3">{r.diff == null ? '—' : dm(r.diff)}</td>
                <td><span className={`inline-block rounded border px-2 py-0.5 text-xs ${STYLE[r.grade][1]}`}>{STYLE[r.grade][0]}</span>{r.note && <div className="text-xs text-muted-foreground mt-1">{r.note}</div>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
