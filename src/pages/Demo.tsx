import { lazy, Suspense, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, BookOpen, Headphones, Lock, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { ClassicFrame } from '@/components/layout/ClassicFrame';
import { ZodaciLogo } from '@/components/brand/ZodaciLogo';
import { ChartWheel } from '@/components/chart/ChartWheel';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useReadingTone } from '@/hooks/useReadingTone';
import { TONES } from '@/lib/perception';
import { fmtLon } from '@/lib/astro';
import { CREDIT_ALLOWANCE, PLAN_NAME, type Tier } from '@/lib/plans';
import { SAMPLE_READER, sampleReaderChart, type BookLeaf } from '@/content/sampleBookLeaves';
import { SAMPLE_EDITION } from '@/content/sampleEdition';
import { DEMO_TABS, demoAllows, demoChapter, type DemoTab } from '@/content/demoSession';
import { SpecificityExamples } from '@/components/books/SpecificityExamples';
import episode from '@/assets/rosalind-emotional-world.mp3.asset.json';
import { resolveBookArtwork } from '@/content/bookArtwork';
import { bookPlateSpec, renderBookPlate } from '@/lib/bookPlate';

const PlacementsTab = lazy(() => import('@/components/results/PlacementsTab').then(m => ({ default: m.PlacementsTab })));
const DemoTiming = lazy(() => import('@/components/demo/DemoTiming'));
const DemoSynastry = lazy(() => import('@/components/demo/DemoSynastry'));
const DemoBook = lazy(() => import('@/components/books/OpenBook').then(m => ({ default: m.OpenBook })));
const demoLeaves = () => import('@/content/sampleBookLeaves');

function Locked({ title, onPreview }: { title: string; onPreview: () => void }) {
  return <aside className="space-y-3 border-y border-border py-6" aria-label={`${title} locked`}>
    <h3 className="flex items-center gap-2 text-xl"><Lock className="h-5 w-5 text-primary" />{title}</h3>
    <p className="text-sm text-muted-foreground">Included in Pro and Cosmic. Free keeps your chart overview and the opening reading.</p>
    <div className="flex flex-wrap gap-2"><Button onClick={onPreview}>Preview Pro<ArrowRight className="h-4 w-4" /></Button><Button asChild variant="outline"><Link to="/pricing">Compare plans</Link></Button></div>
  </aside>;
}

export default function Demo() {
  usePageMeta('Classic member demo · Zodaci', 'Explore Rosalind Vance’s calculated fictional chart in the Classic member view. Switch plans, read specific chapters, compare charts and hear sample audio without signing in.');
  const [params, setParams] = useSearchParams();
  const tab: DemoTab = DEMO_TABS.find(t => t.id === params.get('tab'))?.id ?? 'wheel';
  const [tier, setTier] = useState<Tier>('free');
  const [tone, setTone] = useReadingTone({ demo: true });
  const [comparison, setComparison] = useState(false);
  const [chapter, setChapter] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const [audioAttempt, setAudioAttempt] = useState(0);
  const chart = useMemo(sampleReaderChart, []);
  const art = useMemo(() => resolveBookArtwork(chart), [chart]);
  const chapterArt = useMemo(() => renderBookPlate(bookPlateSpec(chart, ['sun', 'moon', 'venus', 'mercury'][chapter] ?? art.ruler, art.element)), [chart, chapter, art]);
  const [bookLeaves, setBookLeaves] = useState<BookLeaf[] | null>(null);
  const page = SAMPLE_EDITION.pages[chapter] ?? SAMPLE_EDITION.pages[0];
  const effectiveTone = tier === 'free' ? 'oracle' : tone;
  useEffect(() => { let active = true; if (tab === 'edition') demoLeaves().then(m => { if (active) setBookLeaves(m.sampleBookLeaves({ tone: effectiveTone })); }); return () => { active = false; }; }, [tab, effectiveTone]);
  const paragraphs = demoChapter(page, effectiveTone);
  const pro = () => setTier('full');
  const select = (id: string) => { const next = new URLSearchParams(params); next.set('tab', id); setParams(next, { replace: true }); };
  useEffect(() => { document.getElementById('demo-heading')?.focus({ preventScroll: true }); }, [tab]);
  const big3 = chart.bodies.filter(b => ['sun', 'moon'].includes(b.key)).map(b => ({ label: b.name, value: fmtLon(b.lon).text }));
  if (chart.asc !== null) big3.push({ label: 'Rising', value: fmtLon(chart.asc).text });
  const gated = (feature: Parameters<typeof demoAllows>[1], title: string, content: ReactNode) => demoAllows(tier, feature) ? content : <Locked title={title} onPreview={pro} />;
  return <ClassicFrame>
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/demo" aria-label="Zodaci demo home"><ZodaciLogo compact /></Link>
        <span className="font-label text-sm text-primary">Classic · Rosalind Vance · Fictional sample</span>
        <Button asChild size="sm" variant="outline"><Link to="/auth?mode=signup&next=/start">Create my chart</Link></Button>
      </div>
    </header>
    <main id="main-content" className="demo-atomic relative z-10 flex-1 pb-44 sm:pb-32">
      <div className="mx-auto max-w-5xl space-y-7 px-4 py-6 sm:px-8 sm:py-10 lg:py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="font-label text-sm text-primary">Your chart · Classic view</p><h1 id="demo-heading" tabIndex={-1} className="text-3xl outline-none sm:text-4xl">Rosalind’s observatory</h1><p className="mt-2 text-sm text-muted-foreground">{SAMPLE_READER.printed.born} · Placidus houses</p></div>
          <Button variant="ghost" size="sm" onClick={() => { setTier('free'); setTone('oracle'); setChapter(0); setComparison(false); select('wheel'); }}><RotateCcw className="h-4 w-4" />Reset demo</Button>
        </div>
        <Tabs value={tab} onValueChange={select} className="space-y-6">
          <TabsList aria-label="Classic member sections" className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted p-1">
            {DEMO_TABS.map(t => <TabsTrigger key={t.id} value={t.id} className="min-h-11 whitespace-normal text-left">{t.label}</TabsTrigger>)}
          </TabsList>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div role="group" aria-label="Reading tone" className="flex flex-wrap items-center gap-1"><span className="mr-2 text-sm text-muted-foreground">Reading tone</span>{TONES.map(t => <Button key={t.id} size="sm" variant={effectiveTone === t.id ? 'default' : 'ghost'} disabled={!demoAllows(tier, 'tone')} aria-pressed={effectiveTone === t.id} title={tier === 'free' ? 'Tone choices open on Pro and Cosmic' : t.note} onClick={() => setTone(t.id)}>{t.label}</Button>)}{tier === 'free' && <Lock aria-label="Tone choices locked on Free" className="h-4 w-4 text-muted-foreground" />}</div>
            <label htmlFor="demo-comparison" className="flex items-center gap-2 text-sm"><Switch id="demo-comparison" checked={comparison} onCheckedChange={setComparison} />Generic vs. specific</label>
          </div>
          {comparison && <SpecificityExamples />}
          <TabsContent value="wheel" className="space-y-7">
            <ul className="grid gap-3 sm:grid-cols-3">{big3.map(b => <li key={b.label} className="border border-border bg-card p-4"><p className="font-label text-sm text-primary">{b.label}</p><p className="text-xl">{b.value}</p></li>)}</ul>
            <ChartWheel r={chart} presentation="paper" />
            <section className="space-y-3 border-t border-border pt-6"><h2 className="text-2xl">The Garden Gate</h2><p className="leading-relaxed">{demoChapter(SAMPLE_EDITION.pages[0], effectiveTone)[tier === 'free' ? 0 : 1]}</p><Button variant="outline" onClick={() => select('edition')}><BookOpen className="h-4 w-4" />Continue reading</Button></section>
          </TabsContent>
          <TabsContent value="placements"><Suspense fallback={<p role="status">Opening placements…</p>}><PlacementsTab chart={chart} timeKnown plan={tier} loading={false} /></Suspense></TabsContent>
          <TabsContent value="transits">{gated('transits', 'Daily transits and deeper timing', <Suspense fallback={<p role="status">Calculating transits…</p>}><DemoTiming chart={chart} tone={effectiveTone} /></Suspense>)}</TabsContent>
          <TabsContent value="edition" className="space-y-8">
            <header><h2 className="text-2xl">The Masterbook · {SAMPLE_EDITION.owner}</h2><p className="mt-2 text-sm text-muted-foreground">Shane’s narrative approach, demonstrated with Rosalind’s public sample—not Shane’s private edition.</p></header>
            <div role="group" aria-label="Sample chapters" className="flex flex-wrap gap-2">{SAMPLE_EDITION.pages.map((p, i) => <Button key={p.n} variant={chapter === i ? 'default' : 'outline'} aria-pressed={chapter === i} onClick={() => setChapter(i)}>{p.title}{tier === 'free' && i > 0 && <Lock className="h-3 w-3" />}</Button>)}</div>
            {tier === 'free' && chapter > 0 ? <Locked title={page.title} onPreview={pro} /> : <article className="grid items-start gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
              <img src={chapterArt} alt={`Calculated ${art.sign} Sun and ${art.element} planetary engraving for this chapter; symbolic illustration`} width={900} height={1100} loading="lazy" className="mx-auto w-full max-w-64 object-contain" />
              <div className="min-w-0 space-y-4"><p className="font-label text-sm text-primary">{page.volume}</p><h3 className="text-2xl">{page.title}</h3><p className="text-sm text-accent">{page.placement}</p>
                <dl className="space-y-2 border-y border-border py-4 text-sm">{page.facts.map(f => <div key={f.label}><dt className="font-medium">{f.label}</dt><dd className="text-muted-foreground">{f.value}</dd></div>)}</dl>
                <div aria-live="polite" className="space-y-4">{(tier === 'free' ? paragraphs.slice(0, 1) : paragraphs).map((p, i) => <p key={`${effectiveTone}-${i}`} className="leading-relaxed">{p}</p>)}</div>
                {tier === 'free' ? <Locked title="The rest of this chapter" onPreview={pro} /> : <p className="border-l-2 border-primary pl-4 italic">{page.reflection}</p>}
              </div>
            </article>}
            <section className="space-y-4 border-t border-border pt-6"><h3 className="text-2xl">Rosalind’s AstroBook chapters</h3>{gated('transits', 'The complete AstroBook preview', bookLeaves ? <Suspense fallback={<p role="status">Opening the book…</p>}><DemoBook leaves={bookLeaves} label="Rosalind Vance · AstroBook chapters" layout="side" /></Suspense> : <p role="status">Preparing the book…</p>)}</section>
            <section className="space-y-4 border-t border-border pt-6"><h3 className="flex items-center gap-2 text-2xl"><Headphones className="h-6 w-6" />Your emotional world, Rosalind</h3>
              {gated('audio', 'Sample podcast', <div className="space-y-4"><p className="text-sm text-muted-foreground">Pre-recorded sample · Cancer Moon in house 3, sextile Sun and Rising, square Venus and Jupiter.</p>
                <audio key={audioAttempt} aria-label="Rosalind sample episode" controls preload="none" src={episode.url} onError={() => setAudioError(true)} className="w-full">Audio playback is not supported by this browser.</audio>
                {audioError && <div role="alert"><p>The sample could not load.</p><Button variant="outline" onClick={() => { setAudioError(false); setAudioAttempt(n => n + 1); }}>Retry audio</Button></div>}
                <details className="text-sm"><summary className="cursor-pointer text-primary">Episode transcript</summary><div className="mt-3 space-y-3"><p>Welcome to your Zodaci podcast. Today, Rosalind, we’re looking at your emotional world.</p><p>Your Moon is in Cancer, its own sign. So feeling safe comes down to home, and to the people you’ve chosen. It sits in your third house, which means you often understand a feeling only once you’ve said it out loud… a phone call, a letter, a talk on the way somewhere.</p><p>Now, here’s the thing. Your Sun rose just a few minutes before you were born, almost exactly on your Taurus Ascendant. What people see first is very close to who you are. And your Moon makes an easy sextile to both of them, within a degree. Your moods, your will and the way you come across tend to agree.</p><p>The tension? Your Moon squares Venus and Jupiter in Aries. One part of you wants to stay by the warm window. The other wants to say yes to the road. You don’t have to choose forever. Just notice which one is asking… tonight.</p></div></details>
              </div>)}
            </section>
          </TabsContent>
          <TabsContent value="synastry">{gated('synastry', 'Chart-to-chart synastry', <Suspense fallback={<p role="status">Comparing sample charts…</p>}><DemoSynastry chart={chart} /></Suspense>)}</TabsContent>
        </Tabs>
        <p className="border-t border-border pt-5 text-xs text-muted-foreground">Fictional sample only. Interpretations are reflections, not personal history or predictions. This demo uses no AI credits and changes no account data.</p>
      </div>
      <footer className="mx-auto max-w-5xl space-y-3 border-t border-border px-4 py-6 text-xs text-muted-foreground sm:px-8"><p>Astrological insights provided for entertainment and self-reflection purposes only</p><nav aria-label="Demo footer" className="flex gap-4"><Link to="/privacy">Privacy Policy</Link><Link to="/terms">Terms of Service</Link><Link to="/pricing">Pricing</Link></nav></footer>
    </main>
    <aside aria-label="Membership simulator" className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 rounded-md border-2 border-primary bg-background p-3 shadow-lg sm:p-4">
      <div><p className="font-label text-lg text-primary">Demo session · {PLAN_NAME[tier]}</p><p aria-live="polite" className="text-xs text-muted-foreground">{CREDIT_ALLOWANCE[tier]} monthly credits · {tier === 'free' ? 'Chart + opening reading' : 'All tools, chapters and audio'}</p></div>
      <div role="group" aria-label="Simulate membership tier" className="flex gap-1">{(['free', 'full', 'creator'] as Tier[]).map(t => <Button key={t} size="sm" variant={tier === t ? 'default' : 'outline'} aria-pressed={tier === t} onClick={() => setTier(t)}>{PLAN_NAME[t]}</Button>)}</div>
      <p className="w-full text-xs text-muted-foreground">Pro and Cosmic have the same features. Cosmic includes more credits.</p>
    </aside>
  </ClassicFrame>;
}
