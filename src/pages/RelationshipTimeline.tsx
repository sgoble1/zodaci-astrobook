import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { computeChart } from '@/lib/astro';
import { APRIL } from './ChartCalculator';
import { toInput } from './RelationshipDetail';
import { useRelationships, type Relationship } from '@/hooks/useRelationships';
import { AuthGate } from '@/components/common/AuthGate';
import { ConfidenceBadge } from '@/components/common/ConfidenceBadge';
import { relationshipTimeline } from '@/lib/relTimeline';
import { loadIndex, type MbEntry } from './Masterbook';

export default function RelationshipTimeline() {
  const { id } = useParams();
  const { items, loading } = useRelationships();
  const rel = items.find(r => r.id === id);
  return <AuthGate what="view relationship timelines">{() => loading ? <p>Loading…</p> : !rel ? <p>Not found. <Link className="underline" to="/relationships">All relationships</Link></p> : <Body rel={rel} />}</AuthGate>;
}

const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

function Body({ rel }: { rel: Relationship }) {
  const [years, setYears] = useState(10);
  const [planet, setPlanet] = useState('all');
  const [idx, setIdx] = useState<MbEntry[]>([]);
  useEffect(() => { loadIndex().then(setIdx).catch(() => setIdx([])); }, []);
  const A = useMemo(() => computeChart(APRIL), []);
  const B = useMemo(() => computeChart(toInput(rel)), [rel]);
  const start = useMemo(() => { const d = new Date(); d.setDate(1); return d; }, []);
  const list = useMemo(() => relationshipTimeline(A, B, 'April', rel.name, start, years), [A, B, rel.name, start, years]);
  const shown = list.filter(w => planet === 'all' || w.planetKey === planet);
  // Masterbook sections about each transiting planet (April's Timeline guide + transit chapters)
  const srcFor = (p: string) => idx.filter(e => new RegExp(p, 'i').test(e.title) && /transit|return|retrograde|guide|timeline|cycle/i.test(e.title)).slice(0, 2);
  const byYear = shown.reduce<Record<string, typeof shown>>((a, w) => { (a[w.exact.getFullYear()] ??= []).push(w); return a; }, {});

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="font-smallcaps text-xs text-gold">Relationship timeline</div>
        <h1 className="text-4xl">April & {rel.name} · Key transits</h1>
        <p className="text-muted-foreground max-w-3xl">When Jupiter, Saturn, Uranus, Neptune and Pluto make exact contacts (within 1°) to the combined chart and to each person’s Sun, Moon and Venus. Dates come from the ephemeris; meanings are app-written. Each entry links to the matching sections of April’s Masterbook.</p>
        <div className="flex flex-wrap gap-3 text-sm items-center">
          <label>Years ahead <select className="border rounded px-2 py-1 bg-background" value={years} onChange={e => setYears(+e.target.value)}>{[5, 10, 20].map(y => <option key={y}>{y}</option>)}</select></label>
          <label>Planet <select className="border rounded px-2 py-1 bg-background" value={planet} onChange={e => setPlanet(e.target.value)}><option value="all">All</option>{['jupiter', 'saturn', 'uranus', 'neptune', 'pluto'].map(p => <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>)}</select></label>
          <Link to={`/relationships/${rel.id}`} className="underline">← Relationship</Link><Link to={`/relationships/${rel.id}/reading`} className="underline">Reading</Link>
          {!rel.birth_time && <ConfidenceBadge level="ambiguous" note="No birth time: the other person's Moon and the composite Moon/Ascendant are left out." />}
        </div>
      </header>
      {shown.length === 0 && <p>No exact contacts in this period.</p>}
      {Object.entries(byYear).map(([y, ws]) => (
        <section key={y} className="space-y-2">
          <h2 className="text-3xl border-b border-gold/40">{y}</h2>
          <ol className="space-y-2">{ws.map((w, i) => (
            <li key={i} className="parchment p-3 text-sm">
              <div className="flex flex-wrap gap-2 items-baseline"><b className="font-display text-lg">{w.planet} {w.symbol} {w.whose === 'Composite' ? 'composite' : `${w.whose}’s`} {w.target}</b><span className="text-xs text-muted-foreground">{fmt(w.start)}{w.end.getTime() !== w.start.getTime() && ` – ${fmt(w.end)}`} · exact ~{fmt(w.exact)} ({w.minOrb.toFixed(2)}°)</span><ConfidenceBadge compact level="derived" note="Sampled every 5 days; dates accurate to about a week. Retrograde loops can create several windows." /></div>
              <p>{w.text}</p>
              <div className="flex flex-wrap gap-3 text-xs mt-1">{srcFor(w.planet).map(e => <Link key={e.id} to={`/masterbook/${e.id}`} className="underline">Source: {e.title}</Link>)}<Link to={`/ask?q=${encodeURIComponent(`What do the sources say about transiting ${w.planet} to April's ${w.target}?`)}`} className="underline">Ask the Sources</Link></div>
            </li>))}</ol>
        </section>
      ))}
    </div>
  );
}
