import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DemoScreen } from '@/components/brand/DemoScreen';
import { usePageMeta } from '@/hooks/usePageMeta';
import { OpenAstroBook, OpenComicDigest } from '@/components/books/OpenAstroBook';
import { SAMPLE_READER } from '@/content/sampleBookLeaves';
import { SampleChartDemo } from '@/components/brand/SampleChartDemo';
import { PLAN_NAME, PLAN_PRICE } from '@/lib/plans';
import { DEMO_PLANS } from '@/content/demoPlans';
import { SAMPLE_EDITION } from '@/content/sampleEdition';
import { PosterHeader } from '@/components/observatory/PosterHeader';
import libraryArt from '@/assets/reading-room/atomic-research-library.jpg';
import episode from '@/assets/rosalind-emotional-world.mp3.asset.json';
import plate2 from '@/assets/plates/plate-02.jpg';
import plate5 from '@/assets/plates/plate-05.jpg';
import plate8 from '@/assets/plates/plate-08.jpg';
import plate11 from '@/assets/plates/plate-11.jpg';
import plate13 from '@/assets/plates/plate-13.jpg';
import plate16 from '@/assets/plates/plate-16.jpg';

/**
 * The demo's one fictional reader: Rosalind Vance from the sample Collector cover. Every placement named below is
 * calculated for her printed birth moment (checked in sampleComic.test.ts and sampleEdition.test.ts); the prose is
 * interpretation, not biography. No member data is used on this page.
 */
const SAMPLE = { name: SAMPLE_READER.name, first: SAMPLE_READER.name.split(' ')[0], facts: 'Sun Taurus · Moon Cancer · Rising Taurus' };

const SECTIONS = [
  { title: 'The shape of your emotional weather', body: 'Your Moon is in Cancer, the sign it rules, at 13°28′. A Moon in its own sign works at full strength: you know what you need to feel safe, and it is usually simple. A lit kitchen, the people you have chosen, a place that stays the same while the rest of the week changes. The Moon sits in your 3rd house, the house of daily talk, short trips, neighbours and siblings. You often understand a feeling only once you have said it out loud, to someone close at hand. A phone call or a letter can settle you faster than an hour alone with your thoughts. When you feel unsure, ask yourself who you have not talked to yet today.' },
  { title: 'How you meet the world', body: 'Taurus was rising when you were born, at 12°47′, and your Sun had cleared the horizon by less than a third of a degree. That puts the Sun almost exactly on your Ascendant. People tend to read you as calm and unhurried before they know you, and with the Sun this close, that first impression is close to the truth. You take a room in before you act in it. Your Moon makes an easy sextile to both the Sun (1.0°) and the Ascendant (0.7°), so your moods, your will and the way you come across tend to agree. People can usually tell how you feel, and they are usually right.' },
  { title: 'Where the Taurus Sun steadies you', body: 'Your Sun is in Taurus but on the 12th-house side of the horizon, with Mercury, Venus and Jupiter beside it. The 12th house is the quiet room before sunrise: rest, solitude and work done out of sight. You may need more time alone than people expect from someone so steady in company, and you may do your best thinking before anyone else is up. Taurus steadies you through the body and the senses. When feelings get large, something concrete brings you back: cooking, gardening, mending a thing that is broken, walking the same route again. Give yourself that hour without having to explain it.' },
  { title: 'Love and closeness', body: 'Venus rules your Taurus Ascendant, which makes it your chart ruler, and it sits in Aries with Jupiter 1.7° away. You know what you like the moment you see it, and you can be generous and quick with affection. Your Moon squares both Venus (0.5°) and Jupiter (1.2°). One part of you wants to stay by the warm window and keep things safe; the other wants to go out and say yes. Neither is wrong. Across the chart, Pluto stands opposite your Ascendant in Scorpio, just short of the house of partners, so the relationships that change you tend to be honest and intense. The ones that last are the ones where neither of you has to pretend.' },
  { title: 'Patterns under pressure', body: 'Mars and Chiron sit together in Gemini, 0.3° apart, in your 2nd house of money, tools and self-worth. In astrology, your drive and your sore spot share one place. Under pressure this can look like doing five things at once to prove you are capable, then doubting the lot. Saturn in Sagittarius stands opposite them (1.9° from Mars) and asks for patience: measure twice, cut once. A useful reset for this chart has three steps. Stop and pick one task. Finish it with your hands. Then tell one person what you got done.' },
  { title: 'Your strengths at work and in daily life', body: 'The tightest aspect in your chart is Mercury trine Neptune, exact to less than a tenth of a degree. Practical Taurus thinking meets imagination with no friction: you can picture something and then work out how to make it. Neptune sits in Capricorn in your 9th house, so big ideas tend to arrive with a plan attached. Your Midheaven is in Capricorn at 26°43′, and its ruler Saturn is in your 8th house of shared resources and commitments. Public progress tends to come step by step and through work you share with others. Work that rewards patience, design and making real things tends to suit this mix.' },
  { title: 'Practices for this chart', body: 'Keep one quiet hour each morning for your 12th-house planets, before messages and plans. Make one call or write one note a day for your 3rd-house Moon; it does more for your mood than you expect. When a decision pulls you two ways, write down what the warm window wants and what the open road wants before choosing. Once a month, finish one repair you have been putting off, for the Mars and Chiron pair. Small, repeatable and matched to your placements.' },
];

const SCRIPT = [
  `Welcome to your Zodaci podcast. Today, ${SAMPLE.first}, we're looking at your emotional world.`,
  'Your Moon is in Cancer, its own sign. So feeling safe comes down to home, and to the people you’ve chosen. It sits in your third house, which means you often understand a feeling only once you’ve said it out loud… a phone call, a letter, a talk on the way somewhere.',
  'Now, here’s the thing. Your Sun rose just a few minutes before you were born, almost exactly on your Taurus Ascendant. What people see first is very close to who you are. And your Moon makes an easy sextile to both of them, within a degree. Your moods, your will and the way you come across tend to agree.',
  'The tension? Your Moon squares Venus and Jupiter in Aries. One part of you wants to stay by the warm window. The other wants to say yes to the road. You don’t have to choose forever. Just notice which one is asking… tonight.',
];

function PodcastPlayer() {
  return (
    <div className="obs-paper p-6 space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2"><p className="font-display text-xl">Your emotional world, {SAMPLE.first}</p><p className="text-sm text-muted-foreground">Sample episode · 1 min 15 sec · studio voice</p></div>
      <audio controls preload="none" src={episode.url} className="w-full">Your browser cannot play this sample.</audio>
      <p className="text-sm text-muted-foreground">This is the same voice members hear, reading {SAMPLE.first}’s calculated placements. Real episodes run 2 to 8 minutes and are written from your own readings, with sources.</p>
      <details className="text-sm"><summary className="cursor-pointer text-primary">Read the script</summary><div className="mt-2 space-y-2 text-muted-foreground">{SCRIPT.map(p => <p key={p.slice(0, 20)}>{p}</p>)}</div></details>
    </div>
  );
}

type DemoTier = 'free' | 'full' | 'creator';
const TIER_SHOWS = DEMO_PLANS;

/** Illustrated six-volume Masterbook, the structure every member book follows. */
const VOLUMES = [
  { n: 'I', title: 'The Celestial Matrix', art: plate2, text: 'Sun, Moon, Rising and every planet, each with its sign, house, dignity and ruler.' },
  { n: 'II', title: 'The Twelve Temples', art: plate5, text: 'All twelve houses: what lives there, who rules it, and how it shows up day to day.' },
  { n: 'III', title: 'Planetary Geometry', art: plate8, text: 'Every aspect and pattern, ranked by how strongly it shapes the chart.' },
  { n: 'IV', title: 'The Esoteric Points', art: plate11, text: 'Chiron, the Nodes, Lilith, the Part of Fortune and the asteroids.' },
  { n: 'V', title: 'World Systems', art: plate13, text: 'Vedic, Chinese Ba Zi, numerology and Feng Shui from the same birth moment.' },
  { n: 'VI', title: 'Cycles of Time', art: plate16, text: 'Saturn and Jupiter returns, profections and the transits ahead.' },
];

const MASTER_SAMPLE = SAMPLE_EDITION.pages[2];

export default function Demo() {
  usePageMeta('Interactive Demo — Free, Pro and Cosmic | Zodaci', 'One fictional reader, one calculated chart: switch between Free, Pro and Cosmic, read an illustrated chapter, hear a studio-voiced podcast and open her AstroComic and AstroBook — no sign-up needed.');
  const [tier, setTier] = useState<DemoTier>('creator');
  const shown = SECTIONS.slice(0, TIER_SHOWS[tier].sections);
  const words = shown.reduce((n, s) => n + s.body.split(/\s+/).length + s.title.split(/\s+/).length, 0);

  return (
    <main className="mx-auto max-w-5xl space-y-16 px-5 py-12">
      <PosterHeader img={libraryArt} alt="Two astronomers studying charts in a mid-century research library" eyebrow="Zodaci · Sample room" title="The Zodaci demo" script="Open a book. Tune into a reading." tall>
        <p>Fictional readers, sample chapters and a calculated chart. None of these examples belongs to a member.</p>
      </PosterHeader>
      <div className="flex flex-wrap gap-2"><Button asChild><Link to="/auth?mode=signup&next=/start">Start free with your chart</Link></Button><Button asChild variant="outline"><Link to="/pricing">Compare plans</Link></Button></div>

      <section aria-label="Walk through Zodaci"><DemoScreen /></section>

      <section aria-label="Interactive sample chart"><SampleChartDemo /></section>

      <section className="space-y-5" aria-labelledby="reading-h">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><div className="font-label text-xs tracking-[0.16em] text-primary">Core theme reading</div><h2 id="reading-h" className="text-3xl">Emotional World</h2></div>
          <div role="group" aria-label="Show the demo as" className="flex flex-wrap gap-1 border border-border p-1">{(['free', 'full', 'creator'] as DemoTier[]).map(t => <Button key={t} size="sm" variant={tier === t ? 'default' : 'ghost'} aria-pressed={tier === t} onClick={() => setTier(t)}>{PLAN_NAME[t]}{t !== 'free' && <span className="ml-1 opacity-75">{PLAN_PRICE[t].month.replace('/month', '')}</span>}</Button>)}</div>
        </div>
        <div className="grid gap-6 md:grid-cols-[200px_1fr]">
          <nav aria-label="Sections" className="space-y-2 text-sm">
            <div className="text-muted-foreground">{shown.length} of {SECTIONS.length} sections · {words} words shown</div>
            <ol className="space-y-1">{SECTIONS.map((s, i) => <li key={s.title} className={i < shown.length ? '' : 'text-muted-foreground line-through'}>{i + 1}. {s.title}</li>)}</ol>
            <p className="text-xs text-muted-foreground">Real member readings run about 900–1,200 words, with placement tables.</p>
            <ul className="space-y-1 border-t border-border pt-3 text-xs">{TIER_SHOWS[tier].points.map(p => <li key={p}>✦ {p}</li>)}</ul>
          </nav>
          <article className="space-y-6">
            <p className="border-b border-border pb-4 text-sm text-muted-foreground">{SAMPLE.name} is a fictional reader ({SAMPLE.facts}). Every placement in this reading is calculated for {SAMPLE_READER.printed.born.replace(/^Born /, '')}; the chart above and the chapter, podcast, comic and book below all use the same birth moment. Pro and Cosmic include the same tools; Cosmic has more monthly credits.</p>
            {shown.map(s => <div key={s.title} className="space-y-2"><h3 className="text-xl">{s.title}</h3><p className="leading-relaxed text-muted-foreground">{s.body}</p></div>)}
            {tier === 'free' && <div className="rounded-lg border border-primary/40 bg-primary/5 p-5"><p className="font-medium">Six more sections are locked on Free.</p><p className="text-sm text-muted-foreground">Pro writes the complete reading for every core theme.</p><Button asChild size="sm" className="mt-3"><Link to="/pricing">Unlock Pro</Link></Button></div>}
          </article>
        </div>
      </section>

      <section className="space-y-6" aria-labelledby="mb-h">
        <div><div className="font-label text-xs tracking-[0.16em] text-primary">AstroBook and Masterbook</div><h2 id="mb-h" className="text-3xl">A whole book about one chart</h2><p className="max-w-2xl text-muted-foreground">Six volumes organize your placements, houses, aspects and timing. Pro and Cosmic both include online chapters and custom topics. Writing uses your available AI credits; a subscription does not automatically write all six volumes.</p></div>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{VOLUMES.map(v => <li key={v.n} className="vellum overflow-hidden"><img src={v.art} alt={`Illustrated plate for Volume ${v.n}, ${v.title}`} width={800} height={1000} loading="lazy" className="aspect-[4/3] w-full object-cover" /><div className="p-4"><p className="font-label text-[10px] tracking-[0.14em] text-primary">Volume {v.n}</p><h3 className="text-xl">{v.title}</h3><p className="mt-1 text-sm text-muted-foreground">{v.text}</p></div></li>)}</ol>
        <article className="obs-paper grid gap-6 p-6 md:grid-cols-[240px_minmax(0,1fr)]" aria-label="Sample Masterbook chapter">
          <img src={MASTER_SAMPLE.image} alt={MASTER_SAMPLE.imageAlt} width={1024} height={1024} loading="lazy" className="w-full border border-border object-cover" />
          <div className="min-w-0 space-y-3"><p className="font-label text-xs text-primary">Sample chapter · {SAMPLE_EDITION.owner}</p><h3 className="text-2xl">{MASTER_SAMPLE.title}</h3><p className="font-label text-sm text-accent">{MASTER_SAMPLE.placement}</p>{MASTER_SAMPLE.body.map(t => <p key={t.slice(0, 20)} className="leading-relaxed">{t}</p>)}<p className="text-xs text-muted-foreground">{SAMPLE.first} is fictional. These positions are calculated from the birth details printed on the sample Collector cover. The prose is interpretation, not a biography.</p></div>
        </article>
      </section>

      <section className="space-y-5" aria-labelledby="pod-h">
        <div><div className="font-label text-xs tracking-[0.16em] text-primary">Pro & Cosmic</div><h2 id="pod-h" className="text-3xl">Podcast studio</h2><p className="text-muted-foreground">Turn a reading into a narrated episode saved to your private library. Both paid plans include the studio; generation uses AI credits.</p></div>
        <PodcastPlayer />
      </section>

      <section className="space-y-5" aria-labelledby="comic-h">
        <div><div className="font-label text-xs tracking-[0.16em] text-primary">AstroComic · sold separately</div><h2 id="comic-h" className="text-3xl">Your month, as a comic</h2></div>
        <p className="max-w-2xl text-muted-foreground">{SAMPLE.first}’s sample issue, The Garden Gate: her Taurus Rising, Cancer Moon and tightest aspects, each drawn as a page. Open the digest and turn it.</p>
        <OpenComicDigest layout="side" />
        <Button asChild variant="outline"><Link to="/astrocomic">See AstroComic plans</Link></Button>
      </section>

      <section className="space-y-5" aria-labelledby="book-h">
        <div><div className="font-label text-xs tracking-[0.16em] text-primary">Printed AstroBook</div><h2 id="book-h" className="text-3xl">Hold your chart in your hands</h2></div>
        <p className="max-w-2xl text-muted-foreground">Open {SAMPLE.first}’s Collector edition: bookplate, birth facts, planets, houses and aspects, then illustrated chapters. Signed in with your birth details, open one built from your own chart.</p>
        <OpenAstroBook next="/demo#book-h" />
        <div className="flex flex-wrap justify-center gap-2"><Button asChild variant="outline"><Link to="/book-preview">Flip through sample pages</Link></Button><Button asChild><Link to="/astrobook">See editions & prices</Link></Button></div>
      </section>
    </main>
  );
}
