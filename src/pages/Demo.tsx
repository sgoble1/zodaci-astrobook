import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PromoVideo } from '@/components/brand/PromoVideo';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Book3D } from '@/components/books/Book3D';
import { SampleChartDemo } from '@/components/brand/SampleChartDemo';
import { ComicFlipbook } from '@/components/comic/ComicFlipbook';
import { ISSUE_1 } from '@/content/comicIssue1';
import { PLAN_NAME, PLAN_PRICE } from '@/lib/plans';
import episode from '@/assets/zodaci-demo-episode.mp3.asset.json';
import plate2 from '@/assets/plates/plate-02.jpg';
import plate5 from '@/assets/plates/plate-05.jpg';
import plate8 from '@/assets/plates/plate-08.jpg';
import plate11 from '@/assets/plates/plate-11.jpg';
import plate13 from '@/assets/plates/plate-13.jpg';
import plate16 from '@/assets/plates/plate-16.jpg';
import pisces from '@/assets/mystic/pisces-opener.jpg';

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
    <div className="glass rounded-lg p-6 space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2"><p className="font-display text-xl">Your emotional world, Jules</p><p className="text-sm text-muted-foreground">Sample episode · 54 seconds · studio voice</p></div>
      <audio controls preload="none" src={episode.url} className="w-full">Your browser cannot play this sample.</audio>
      <p className="text-sm text-muted-foreground">This is the same voice members hear. Real episodes run 2 to 8 minutes and are written from your own readings, with sources.</p>
      <details className="text-sm"><summary className="cursor-pointer text-primary">Read the script</summary><p className="mt-2 text-muted-foreground">{SCRIPT}</p></details>
    </div>
  );
}

type DemoTier = 'free' | 'full' | 'creator';
const TIER_SHOWS: Record<DemoTier, { sections: number; points: string[] }> = {
  free: { sections: 1, points: ['Your full calculated chart', 'Sun, Moon and Rising explained', 'The opening section of each reading'] },
  full: { sections: 7, points: ['Every section of every reading', 'All planets plus Chiron and the Nodes', 'Your Masterbook to read online'] },
  creator: { sections: 7, points: ['Everything in Pro', 'New Masterbook chapters on any topic you choose', 'Podcast episodes in a studio voice', 'Arabic Parts, profections and deeper timing'] },
};

/** Illustrated six-volume Masterbook, the structure every member book follows. */
const VOLUMES = [
  { n: 'I', title: 'The Celestial Matrix', art: plate2, text: 'Sun, Moon, Rising and every planet, each with its sign, house, dignity and ruler.' },
  { n: 'II', title: 'The Twelve Temples', art: plate5, text: 'All twelve houses: what lives there, who rules it, and how it shows up day to day.' },
  { n: 'III', title: 'Planetary Geometry', art: plate8, text: 'Every aspect and pattern, ranked by how strongly it shapes the chart.' },
  { n: 'IV', title: 'The Esoteric Points', art: plate11, text: 'Chiron, the Nodes, Lilith, the Part of Fortune and the asteroids.' },
  { n: 'V', title: 'World Systems', art: plate13, text: 'Vedic, Chinese Ba Zi, numerology and Feng Shui from the same birth moment.' },
  { n: 'VI', title: 'Cycles of Time', art: plate16, text: 'Saturn and Jupiter returns, profections and the transits ahead.' },
];

const MASTER_SAMPLE = [
  'Volume I · Chapter 2 — The Moon in Pisces in the Twelfth House',
  'Your Moon sits at 18° Pisces in the twelfth house, the most private room in the chart. Pisces is a mutable water sign ruled by Neptune, and the twelfth house is where we keep what we have not yet put into words. Together they describe an emotional life that runs deep and mostly out of sight: you take in atmospheres, other people’s moods and the unspoken weather of a room long before you can name any of it.',
  'The Moon’s ruler, Neptune, decides how this plays out. In Jules’s chart Neptune trines the Virgo Sun, so the softness has a practical outlet: care becomes something you do, not just something you feel. The square from Saturn adds the lesson. Feelings that never get named become tiredness. This chapter ends with three practices matched to these placements, and the next one follows the same Moon through the houses it rules.',
];

export default function Demo() {
  usePageMeta('Try Zodaci Pro — Interactive Demo | Zodaci', 'Explore a full-length sample reading, compare Free and Pro depth, listen to a sample podcast and turn a 3D AstroBook — no sign-up needed.');
  const [full, setFull] = useState(true);
  const shown = full ? SECTIONS : SECTIONS.slice(0, 1);
  const words = shown.reduce((n, s) => n + s.body.split(/\s+/).length + s.title.split(/\s+/).length, 0);

  return (
    <main className="mx-auto max-w-5xl space-y-16 px-5 py-12">
      <header className="space-y-3">
        <div className="font-smallcaps text-xs text-gold">Interactive demo · fictional sample chart</div>
        <h1 className="text-4xl md:text-5xl">See everything Pro unlocks</h1>
        <p className="max-w-2xl text-muted-foreground">This demo uses a made-up person, {SAMPLE.name} ({SAMPLE.facts}). Your own readings are written from your exact birth time and place.</p>
        <div className="flex flex-wrap gap-2"><Button asChild><Link to="/auth">Start free with your chart</Link></Button><Button asChild variant="outline"><Link to="/pricing">Compare plans</Link></Button></div>
      </header>

      <section aria-label="Zodaci in 24 seconds"><PromoVideo /></section>

      <section aria-label="Interactive sample chart"><SampleChartDemo /></section>

      <section className="space-y-5" aria-labelledby="reading-h">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><div className="font-smallcaps text-xs text-gold">Core theme reading</div><h2 id="reading-h" className="text-3xl">Emotional World</h2></div>
          <label className="flex items-center gap-3 text-sm"><span className={!full ? 'text-foreground' : 'text-muted-foreground'}>Free preview</span><Switch checked={full} onCheckedChange={setFull} aria-label="Toggle Pro view" /><span className={full ? 'text-foreground' : 'text-muted-foreground'}>Pro</span></label>
        </div>
        <div className="grid gap-6 md:grid-cols-[200px_1fr]">
          <nav aria-label="Sections" className="space-y-2 text-sm">
            <div className="text-muted-foreground">{shown.length} of {SECTIONS.length} sections · {words} words shown</div>
            <ol className="space-y-1">{SECTIONS.map((s, i) => <li key={s.title} className={i < shown.length ? '' : 'text-muted-foreground line-through'}>{i + 1}. {s.title}</li>)}</ol>
            <p className="text-xs text-muted-foreground">Real member readings run about 900–1,200 words, with placement tables.</p>
          </nav>
          <article className="space-y-6">
            {shown.map(s => <div key={s.title} className="space-y-2"><h3 className="text-xl">{s.title}</h3><p className="leading-relaxed text-muted-foreground">{s.body}</p></div>)}
            {!full && <div className="rounded-lg border border-primary/40 bg-primary/5 p-5"><p className="font-medium">Six more sections are locked on Free.</p><p className="text-sm text-muted-foreground">Pro writes the complete reading for every core theme.</p><Button asChild size="sm" className="mt-3"><Link to="/pricing">Unlock Pro</Link></Button></div>}
          </article>
        </div>
      </section>

      <section className="space-y-5" aria-labelledby="pod-h">
        <div><div className="font-smallcaps text-xs text-gold">Cosmic plan</div><h2 id="pod-h" className="text-3xl">Podcast studio</h2><p className="text-muted-foreground">Turn any reading into a narrated episode saved to your library.</p></div>
        <PodcastSimulator />
      </section>

      <section className="space-y-5" aria-labelledby="book-h">
        <div><div className="font-smallcaps text-xs text-gold">Printed AstroBook</div><h2 id="book-h" className="text-3xl">Hold your chart in your hands</h2></div>
        <Book3D />
        <div className="flex justify-center gap-2"><Button asChild variant="outline"><Link to="/book-preview">Flip through sample pages</Link></Button><Button asChild><Link to="/astrobook">See editions & prices</Link></Button></div>
      </section>
    </main>
  );
}
