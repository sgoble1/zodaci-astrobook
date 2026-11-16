import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SAMPLE_READER } from '@/content/sampleBookLeaves';

/**
 * The Observatory Console on /demo: a 1950s instrument panel walking through a member's first visit with the
 * fictional sample reader only. Every readout is fixed text from her calculated chart; nothing calls AI.
 */
const BORN = SAMPLE_READER.printed.born;

export const DEMO_STEPS = [
  { label: 'Birth details', station: 'Intake', title: 'Start with the birth moment', body: 'Date, time and town. If the time is unknown, Zodaci says so and leaves out the parts that depend on it.', rows: [['Born', BORN]] },
  { label: 'Your chart', station: 'Cartography', to: '#sample-chart', title: 'Every placement, calculated', body: 'Planets, houses and angles are worked out from astronomical data, not picked from a list.', rows: [['Sun', 'Taurus · 12th house'], ['Moon', 'Cancer 13°28′ · 3rd house'], ['Rising', 'Taurus 12°47′']] },
  { label: 'A reading', station: 'Reading room', to: '#reading-h', title: 'Readings that show their working', body: 'Each paragraph names the placement it comes from, so you can check it against your chart.', rows: [['Chapter', 'Emotional World'], ['Based on', 'Moon in Cancer, 3rd house'], ['Length', 'About 1,000 words']] },
  { label: 'Your book', station: 'Print dispatch', to: '#book-h', title: 'Keep it on the shelf', body: 'Readings can be gathered into an AstroBook or an AstroComic issue, previewed before anything is printed.', rows: [['Format', 'AstroBook or AstroComic'], ['Preview', 'Before you order'], ['Printed', 'Only when you say so']] },
] as const;

/** A short relay click drawn with Web Audio; no sound files, silent until the visitor turns sound on. */
function relayClick() {
  if (typeof window === 'undefined' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  const ctx = new Ctx(); const o = ctx.createOscillator(); const g = ctx.createGain();
  o.type = 'square'; o.frequency.value = 180; g.gain.setValueAtTime(0.05, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.06);
  o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.07); o.onended = () => void ctx.close();
}

export function DemoScreen() {
  const [idx, setIdx] = useState(0);
  const [sound, setSound] = useState(false);
  const i = idx;
  const setI = (n: number) => { if (sound) relayClick(); setIdx(n); };
  const s = DEMO_STEPS[i];
  return (
    <div className="obs-console p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gold/40 pb-3">
        <p className="font-label text-sm tracking-[0.18em] text-gold">Observatory console</p>
        <div className="flex items-center gap-3"><p className="font-label text-xs tracking-[0.14em] text-muted-foreground">Fictional subject · {SAMPLE_READER.name}</p><button type="button" aria-pressed={sound} onClick={() => setSound(v => !v)} className="font-label text-xs tracking-[0.12em] text-gold underline underline-offset-4">Sound {sound ? 'on' : 'off'}</button></div>
      </div>
      <div className="mt-4 grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="space-y-4">
          <div role="tablist" aria-label="Console stations" className="grid grid-cols-2 gap-2">
            {DEMO_STEPS.map((d, n) => (
              <button key={d.label} type="button" role="tab" aria-selected={n === i} onClick={() => setI(n)} className="obs-console-key" data-on={n === i}>
                <span className="obs-console-lamp" aria-hidden />
                <span className="block font-label text-xs tracking-[0.12em]">Station {n + 1}</span>
                <span className="block text-sm">{d.station}</span>
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl">{s.title}</h3>
            <p className="leading-relaxed text-muted-foreground">{s.body}</p>
            {'to' in s && <a href={s.to} className="text-sm text-primary underline underline-offset-4">See the real one below</a>}
          </div>
        </div>
        <div role="tabpanel" aria-label={s.station} className="obs-console-screen p-4 sm:p-5">
          <p className="font-label text-xs tracking-[0.16em] opacity-75">Readout · {s.label}</p>
          <dl className="mt-3 space-y-2 font-mono text-sm">
            {s.rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4 border-b border-current/20 pb-2 last:border-0"><dt className="opacity-75">{k}</dt><dd className="text-right">{v}</dd></div>)}
          </dl>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {i < DEMO_STEPS.length - 1 ? <Button onClick={() => setI(i + 1)}>Next station</Button> : <Button asChild><Link to="/auth?mode=signup&next=/start">Start with your own chart</Link></Button>}
        {i > 0 && <Button variant="outline" onClick={() => setI(i - 1)}>Back</Button>}
      </div>
    </div>
  );
}
