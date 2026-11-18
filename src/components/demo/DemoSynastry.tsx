import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { ChartResult } from '@/lib/astro';
import { interAspects, overlays } from '@/lib/synastry';
import { COVER_SAMPLES } from '@/content/coverSamples';
import { demoPartner } from '@/content/demoSession';

export default function DemoSynastry({ chart }: { chart: ChartResult }) {
  const [id, setId] = useState('signature');
  const [selected, setSelected] = useState(0);
  const { reader, chart: other } = useMemo(() => demoPartner(id), [id]);
  const aspects = useMemo(() => interAspects(chart, other, 'Rosalind', reader.name.split(' ')[0]), [chart, other, reader]);
  const houses = useMemo(() => overlays(other, chart), [chart, other]);
  const hit = aspects[selected] ?? aspects[0];
  return <section className="space-y-5"><h2 className="text-2xl">Two charts, one conversation</h2>
    <div role="group" aria-label="Sample comparison partner" className="flex flex-wrap gap-2">{COVER_SAMPLES.filter(s => s.id !== 'collector').map(s => <Button key={s.id} variant={id === s.id ? 'default' : 'outline'} aria-pressed={id === s.id} onClick={() => { setId(s.id); setSelected(0); }}>{s.name}</Button>)}</div>
    <p className="text-sm text-muted-foreground">{reader.printed.born} · Both people are fictional. No saved relationships are accessed.</p>
    <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"><ul className="space-y-2">{aspects.slice(0, 12).map((a, i) => <li key={`${a.aKey}-${a.bKey}-${a.type}`}><Button variant={hit === a ? 'default' : 'outline'} className="h-auto min-h-11 w-full justify-start whitespace-normal py-3 text-left" aria-pressed={hit === a} onClick={() => setSelected(i)}>Rosalind’s {a.aName} {a.symbol} {reader.name.split(' ')[0]}’s {a.bName} · {a.orb.toFixed(2)}°</Button></li>)}</ul><article aria-live="polite" className="space-y-4 border-t border-border pt-4">{hit ? <><h3 className="text-xl">{hit.aName} {hit.type.toLowerCase()} {hit.bName}</h3><p className="leading-relaxed">{hit.text}</p><p className="text-sm text-muted-foreground">The orb is {hit.orb.toFixed(2)}°. This describes a symbolic interaction, not a relationship verdict.</p></> : <p>No major cross-chart contacts within the selected orbs.</p>}</article></div>
    <details className="border-t border-border pt-4"><summary className="cursor-pointer font-label text-lg text-primary">Where their planets fall in Rosalind’s houses</summary><ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">{houses?.map(h => <li key={h.body.key}>{reader.name.split(' ')[0]}’s {h.body.name} · house {h.house} · {h.theme}</li>)}</ul></details>
  </section>;
}