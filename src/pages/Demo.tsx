import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PromoVideo } from '@/components/brand/PromoVideo';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Book3D } from '@/components/books/Book3D';
import { PROMO_3D_COVER } from '@/content/productArtwork';
import { SampleChartDemo } from '@/components/brand/SampleChartDemo';
import { ComicFlipbook } from '@/components/comic/ComicFlipbook';
import { ISSUE_1 } from '@/content/comicIssue1';
import { PLAN_NAME, PLAN_PRICE } from '@/lib/plans';
import { DEMO_PLANS } from '@/content/demoPlans';
import { SAMPLE_EDITION } from '@/content/sampleEdition';
import { PosterHeader } from '@/components/observatory/PosterHeader';
import libraryArt from '@/assets/reading-room/atomic-research-library.jpg';
import episode from '@/assets/zodaci-demo-episode.mp3.asset.json';
import plate2 from '@/assets/plates/plate-02.jpg';
import plate5 from '@/assets/plates/plate-05.jpg';
import plate8 from '@/assets/plates/plate-08.jpg';
import plate11 from '@/assets/plates/plate-11.jpg';
import plate13 from '@/assets/plates/plate-13.jpg';
import plate16 from '@/assets/plates/plate-16.jpg';

/** Fictional sample profile — no real member data is used on this page. */
const SAMPLE = { name: 'Jules Harbor', facts: 'Sun Virgo · Moon Pisces · Rising Scorpio' };

const SECTIONS = [
  { title: 'The shape of your emotional weather', body: 'With the Moon in Pisces, feelings arrive like tides rather than headlines. You often know what a room feels before anyone speaks, and you absorb moods long before you can name them. This is a gift for empathy and a challenge for boundaries: the work is learning which feelings are yours to carry. Pisces is a mutable water sign, so your emotional state is fluid and responsive — it shifts with music, weather, the people beside you. On good days this makes you wonderfully attuned; on hard days it can leave you unsure where you end and others begin. A useful question to keep close is simply: "Did I walk in feeling this, or did I pick it up here?"' },
  { title: 'How you protect what matters', body: 'Scorpio rising gives a guarded first impression. You test trust quietly and reveal yourself in layers. People who earn your confidence find a loyalty that is fierce and lasting. This rising sign works like a filter over your Pisces Moon: underneath the composed, watchful exterior is someone who feels everything. The protection is not coldness — it is discernment. You would rather know a few people deeply than be known lightly by many. When you feel safe, your intensity becomes warmth; when you feel exposed, it can turn into silence or sharpness. Naming your need for privacy out loud helps others respect it instead of guessing at it.' },
  { title: 'Where the Virgo Sun steadies you', body: 'Your Virgo Sun turns sensitivity into service. Routines, lists and small acts of care are how you metabolize big emotions. When life feels overwhelming, tending to something concrete brings you back to yourself. The Sun and Moon sit in opposite signs — Virgo and Pisces — which is a classic tension between precision and surrender. Virgo wants to sort and improve; Pisces wants to dissolve and feel. Neither is wrong. Your healthiest rhythm alternates between them: a structured morning, an unstructured evening; a plan for the week with room left open for intuition. When you honor both, you become someone who can hold others\' feelings and still help them take the next practical step.' },
  { title: 'Love and closeness', body: 'In relationships, this combination looks for someone who is both gentle and dependable. You notice small details — how a partner speaks to strangers, whether they remember what you said last week — and these details tell you more than grand gestures do. You may hold back at first, then give generously once trust is established. The risk is over-giving: Pisces can merge, Virgo can over-function, and Scorpio can keep score silently. Healthy closeness for you means saying what you need early, letting others care for you in return, and remembering that being useful is not the same as being loved.' },
  { title: 'Patterns under pressure', body: 'Under stress you may withdraw, overanalyze, or try to fix everyone else first. Noticing this early — a tight jaw, a too-long to-do list, scrolling instead of sleeping — is the cue to rest rather than push. Scorpio rising tends to go underground when hurt, Virgo tends to critique itself, and Pisces tends to escape into daydreams or distraction. None of these are failures; they are signals. A simple three-step reset works well for this chart: step away from people for a short time, do one small physical task with your hands, then speak one honest sentence to someone you trust.' },
  { title: 'Your strengths at work and in daily life', body: 'Your best work combines careful craft with deep care for people. Fields that reward attention to detail and emotional intelligence — healing, editing, research, design, counseling, caregiving — tend to suit this mix. You are often the person who notices what everyone else missed, and you quietly raise the standard of whatever you touch. Guard against perfectionism by deciding in advance what "good enough" looks like for each task.' },
  { title: 'Practices for this chart', body: 'Weekly water-side walks, a written "whose feeling is this?" check-in, and one boundary per week said out loud. Small, repeatable, and matched to your placements. Add a monthly "unscheduled day" to give your Pisces Moon space to drift, and keep a short evening list of three things you did well to soften the Virgo inner critic. Over time, these practices turn sensitivity from something that happens to you into something you can steer.' },
];

const SCRIPT = `Welcome to your Zodaci podcast. Today, ${SAMPLE.name}, we're exploring your emotional world. Your Moon in Pisces means you feel the tide of a room before anyone speaks. Your Scorpio rising guards that softness, and your Virgo Sun turns it into steady, practical care.`;

function PodcastPlayer() {
  return (
    <div className="obs-paper p-6 space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2"><p className="font-display text-xl">Your emotional world, Jules</p><p className="text-sm text-muted-foreground">Sample episode · 54 seconds · studio voice</p></div>
      <audio controls preload="none" src={episode.url} className="w-full">Your browser cannot play this sample.</audio>
      <p className="text-sm text-muted-foreground">This is the same voice members hear. Real episodes run 2 to 8 minutes and are written from your own readings, with sources.</p>
      <details className="text-sm"><summary className="cursor-pointer text-primary">Read the script</summary><p className="mt-2 text-muted-foreground">{SCRIPT}</p></details>
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
  usePageMeta('Interactive Demo — Free, Pro and Cosmic | Zodaci', 'Switch between Free, Pro and Cosmic on a sample chart, read an illustrated Masterbook chapter, hear a studio-voiced podcast and flip through AstroComic and AstroBook — no sign-up needed.');
  const [tier, setTier] = useState<DemoTier>('creator');
  const shown = SECTIONS.slice(0, TIER_SHOWS[tier].sections);
  const words = shown.reduce((n, s) => n + s.body.split(/\s+/).length + s.title.split(/\s+/).length, 0);

  return (
    <main className="mx-auto max-w-5xl space-y-16 px-5 py-12">
      <PosterHeader img={libraryArt} alt="Two astronomers studying charts in a mid-century research library" eyebrow="Zodaci · Sample room" title="The Zodaci demo" script="Open a book. Tune into a reading." tall>
        <p>Fictional readers, sample chapters and a calculated chart. None of these examples belongs to a member.</p>
      </PosterHeader>
      <div className="flex flex-wrap gap-2"><Button asChild><Link to="/auth?mode=signup&next=/start">Start free with your chart</Link></Button><Button asChild variant="outline"><Link to="/pricing">Compare plans</Link></Button></div>

      <section aria-label="Zodaci in 24 seconds"><PromoVideo /></section>

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
            <p className="border-b border-border pb-4 text-sm text-muted-foreground">Jules Harbor is an invented writing example ({SAMPLE.facts}), not a verified full chart. The calculated chart above and Rosalind’s chapter below are separate samples. Pro and Cosmic include the same tools; Cosmic has more monthly credits.</p>
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
          <div className="min-w-0 space-y-3"><p className="font-label text-xs text-primary">Sample chapter · {SAMPLE_EDITION.owner}</p><h3 className="text-2xl">{MASTER_SAMPLE.title}</h3><p className="font-label text-sm text-accent">{MASTER_SAMPLE.placement}</p>{MASTER_SAMPLE.body.map(t => <p key={t.slice(0, 20)} className="leading-relaxed">{t}</p>)}<p className="text-xs text-muted-foreground">Rosalind is fictional. These positions are calculated from the birth details printed on the sample Collector cover. The prose is interpretation, not a biography.</p></div>
        </article>
      </section>

      <section className="space-y-5" aria-labelledby="pod-h">
        <div><div className="font-label text-xs tracking-[0.16em] text-primary">Pro & Cosmic</div><h2 id="pod-h" className="text-3xl">Podcast studio</h2><p className="text-muted-foreground">Turn a reading into a narrated episode saved to your private library. Both paid plans include the studio; generation uses AI credits.</p></div>
        <PodcastPlayer />
      </section>

      <section className="space-y-5" aria-labelledby="comic-h">
        <div><div className="font-label text-xs tracking-[0.16em] text-primary">AstroComic · sold separately</div><h2 id="comic-h" className="text-3xl">Your month, as a comic</h2></div>
        <ComicFlipbook issue={ISSUE_1} />
      </section>

      <section className="space-y-5" aria-labelledby="book-h">
        <div><div className="font-label text-xs tracking-[0.16em] text-primary">Printed AstroBook</div><h2 id="book-h" className="text-3xl">Hold your chart in your hands</h2></div>
        <Book3D coverSrc={PROMO_3D_COVER.src} hardcover label="Collector AstroBook · sample cover for a fictional reader" />
        <div className="flex flex-wrap justify-center gap-2"><Button asChild variant="outline"><Link to="/book-preview">Flip through sample pages</Link></Button><Button asChild><Link to="/astrobook">See editions & prices</Link></Button></div>
      </section>
    </main>
  );
}
