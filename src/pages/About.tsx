import { usePageMeta } from '@/hooks/usePageMeta';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import rooftop from '@/assets/home/rooftop-astronomers.jpg';
import chartMakers from '@/assets/pages/chart-makers.jpg';
import { SpotArt, type SpotKind } from '@/components/art/SpotArt';
import { PlateHead } from '@/components/observatory/Mosaic';
import { HOUSE_SYSTEMS } from '@/lib/astro';

const fade = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 1.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } };

const PILLARS: [SpotKind, string, string][] = [
  ['chart', 'Calculated, not guessed', 'Every planet, house and aspect is worked out from your birth minute and place. Each one is then explained in everyday words.'],
  ['written', 'Written for one person', 'Each reading uses the sign, house, aspects and ruler of a placement together. Two people rarely get the same paragraph.'],
  ['honest', 'Honest about limits', 'We show sources and flag an uncertain birth time. Astrology here is for reflection. It does not predict events or replace professional help.'],
  ['private', 'Private by design', 'Only you can see your birth details, notes and conversations. Shared spaces open by invitation only.'],
  ['compass', 'Your context, your call', 'You can add an experience or a question in private and choose whether later chapters may use it. Your chart facts stay the same, and we never guess at your life story from the chart.'],
];

/** What the engine actually does (see src/lib/astro.ts); described, not exposed as formulas. */
const CALCULATE: [string, string][] = [
  ['Planet positions', 'The Sun, Moon and planets come from a published astronomical model for births between 1900 and 2100. We check it against the Swiss Ephemeris on our accuracy page.'],
  ['Your clock, in universal time', 'Your local birth time is converted with the historical time-zone record for your birthplace, including past daylight-saving rules.'],
  ['Angles and houses', `The Ascendant and Midheaven come from sidereal time at your longitude. Houses default to Placidus; ${HOUSE_SYSTEMS.filter(h => h.id !== 'placidus').map(h => h.label).join(', ')} are one click away.`],
  ['Chiron and the Nodes', 'Chiron is read from a NASA JPL Horizons table (1940–2060). The North Node is the mean node; the true node can differ by up to about 1.5°, and we say so.'],
  ['Unknown birth time', 'Without a time we calculate for noon, flag that the Moon may be off by up to about 6.5°, and leave the Ascendant, Midheaven and houses out rather than guess.'],
  ['Every point labelled', 'Each position carries a note on how it was derived, and readings keep calculated facts, interpretation and your own notes visibly separate.'],
];

const DIFFERENCE: { row: string; generic: string | null; report: string | null; zodaci: string }[] = [
  { row: 'Built from', generic: 'Your birth month', report: 'A few headline placements', zodaci: 'Every placement: sign, exact degree, house, ruler and aspect' },
  { row: 'Written for', generic: 'Everyone born that month', report: 'Template paragraphs per placement', zodaci: 'One person, naming the placement behind each sentence' },
  { row: 'Your real life', generic: null, report: null, zodaci: 'Private, opt-in context you add — never inferred from the chart' },
  { row: 'Honest about limits', generic: null, report: null, zodaci: 'Birth-time uncertainty, sources and calculated vs interpreted shown' },
  { row: 'In your hands', generic: null, report: 'A PDF', zodaci: 'AstroBook in five versions and a monthly AstroComic' },
];

const FOUNDER_EDITIONS: [string, string][] = [
  ['April’s Masterbook', 'The first complete edition, organised by life topic.'],
  ['Shane’s Masterbook', 'Sixty-three chapters, organised by life topic.'],
  ['Zac’s Astrological Library', 'A library of chapters with its own workbook.'],
];

const Cell = ({ v }: { v: string | null }) => v ? <span>{v}</span> : <span className="inline-flex items-center gap-1 text-muted-foreground"><Minus className="h-4 w-4" aria-hidden />Not included</span>;

export default function About() {
  usePageMeta('About Zodaci · Astronomy-grade precision, plain-language depth', 'Why Zodaci exists and how we calculate: birth charts worked out from your exact birth minute, readings in plain language that name their placements, and private context you control.');
  return (
    <article className="space-y-16 sm:space-y-20">
      <header className="obs-panel hero-night rivets about-hero">
        <div className="about-hero-copy">
          <p className="font-label text-sm tracking-[0.2em] text-primary">Our craft</p>
          <h1 className="hero-headline"><span className="whitespace-nowrap">Astronomy-grade</span> precision.<br /><span className="whitespace-nowrap">Plain-language</span> depth.</h1>
          <p className="font-script text-3xl text-primary">Accurate first, warm second.</p>
          <p className="max-w-xl text-lg leading-relaxed text-foreground/90">Zodaci is a personal observatory. We calculate your birth chart from the minute and place you were born, then write every reading in plain language you can use, naming the placement each line comes from.</p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Button asChild size="lg" variant="signal"><Link to="/start">Start your chart<ArrowRight /></Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/astrobook">Get your AstroBook</Link></Button>
          </div>
        </div>
        <figure className="about-hero-art">
          <img src={rooftop} alt="Two 1950s astronomers on an observatory rooftop at night: a man at a brass telescope and a woman with a clipboard beside an easel showing a zodiac wheel" width={1400} height={933} {...{ fetchpriority: 'high' }} />
        </figure>
      </header>

      <motion.section {...fade} aria-labelledby="why-h" className="obs-paper rivets about-why">
        <p className="text-center font-label text-sm tracking-[0.2em] text-accent">Why Zodaci exists</p>
        <h2 id="why-h" className="mt-2 text-center font-display text-3xl uppercase leading-tight sm:text-4xl">Same skies. Brighter answers.</h2>
        <div className="about-why-body">
          <p>We spent years with thick astrology books, hand-drawn charts and long talks about what a Moon in one sign or a Saturn in one house meant for a real person. The books were full of useful ideas. They were also full of jargon, spread across many sources, and rarely about <em>you</em>.</p>
          <p>So we built the tool we wanted. Zodaci calculates your chart, explains each symbol in plain language, and writes longer chapters on love, work, healing and timing from your own placements.</p>
          <p>We love the craft and its history. Most of all, we like the moment someone reads a page and says, “that’s me.”</p>
        </div>
        <figure className="mt-8 overflow-hidden rounded-[var(--cut-card)] shadow-[0_0_0_1.5px_hsl(var(--comic-navy)/0.6)]">
          <img src={chartMakers} alt="Two 1950s chart makers: a woman drafting a zodiac wheel with a compass, and a man checking planet tables with a magnifying glass under a brass lamp" width={1400} height={700} loading="lazy" className="w-full" />
        </figure>
      </motion.section>

      <motion.section {...fade} aria-label="What we stand for" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PILLARS.map(([art, t, d]) => <div key={t} className="atomic-box p-6"><SpotArt kind={art} className="atomic-box-art" /><h3 className="font-label text-xl tracking-[0.06em]">{t}</h3><p className="mt-2 text-muted-foreground">{d}</p></div>)}
      </motion.section>

      <motion.section {...fade} aria-labelledby="calc-h" className="obs-paper p-5 sm:p-8">
        <PlateHead id="calc-h" title="How we calculate" sub="What happens between your birth details and your chart" />
        <ul className="grid gap-x-8 gap-y-6 md:grid-cols-2">
          {CALCULATE.map(([t, d], i) => <li key={t} className="flex gap-4"><span aria-hidden className="calc-step">{i + 1}</span><div><h3 className="font-label text-lg tracking-[0.08em]">{t}</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{d}</p></div></li>)}
        </ul>
        <p className="mt-6 text-sm text-muted-foreground">Members can check any chart themselves: <Link to="/chart-calculator" className="text-accent underline underline-offset-4">Open the chart calculator</Link> and compare house systems side by side, or <Link to="/accuracy" className="text-accent underline underline-offset-4">see our accuracy checks</Link>.</p>
      </motion.section>

      <motion.section {...fade} aria-labelledby="diff-h" className="obs-panel p-5 sm:p-8">
        <PlateHead id="diff-h" title="Why this is different" sub="The same birthday, three very different depths" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <caption className="sr-only">Comparison of a sun-sign horoscope, a generic report and Zodaci</caption>
            <thead><tr className="border-b border-[hsl(var(--brass)/0.5)] font-label tracking-[0.12em]"><th scope="col" className="py-3 pr-4" /><th scope="col" className="py-3 pr-4 text-muted-foreground">Sun-sign horoscope</th><th scope="col" className="py-3 pr-4 text-muted-foreground">Generic chart report</th><th scope="col" className="py-3 text-primary">Zodaci</th></tr></thead>
            <tbody>{DIFFERENCE.map(d => <tr key={d.row} className="border-b border-border/60 align-top"><th scope="row" className="py-3 pr-4 font-label tracking-[0.08em]">{d.row}</th><td className="py-3 pr-4"><Cell v={d.generic} /></td><td className="py-3 pr-4"><Cell v={d.report} /></td><td className="py-3"><span className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />{d.zodaci}</span></td></tr>)}</tbody>
          </table>
        </div>
      </motion.section>

      <motion.section {...fade} aria-labelledby="founders-h" className="space-y-6">
        <div className="mx-auto max-w-3xl text-center"><h2 id="founders-h" className="plate-title">Built from three founder editions</h2><p className="mt-3 text-muted-foreground">Before anyone else could order one, Zodaci wrote complete editions for its founders. Those books set the depth every member’s AstroBook follows. They stay private to their owners; nothing from them appears on this site. What we learned writing all three now shapes every member’s book.</p></div>
        <ul className="grid gap-5 md:grid-cols-3">{FOUNDER_EDITIONS.map(([t, d]) => <li key={t} className="atomic-box p-6 text-center"><SpotArt kind="astrobook" className="mx-auto h-20 w-20" /><h3 className="mt-3 font-label text-xl tracking-[0.06em]">{t}</h3><p className="mt-1 text-sm text-muted-foreground">{d}</p></li>)}</ul>
      </motion.section>

      <motion.section {...fade} className="mx-auto max-w-3xl space-y-4">
        <h2 className="plate-title">Our inspirations</h2>
        <p className="text-lg text-muted-foreground">We draw on Hellenistic and modern psychological astrology, Vedic Jyotish, Chinese Ba Zi, the Maya Tzolk’in and other traditions, and we credit where each idea comes from. The astronomy is calculated. The writing aims to be clear and kind. We compare what several traditions say about the same placement and combine them in your readings. You can add private context, and it shapes what a reading focuses on. It never changes your chart facts.</p>
      </motion.section>

      <motion.section {...fade} className="obs-paper space-y-4 p-8 text-center sm:p-10">
        <h2 className="plate-title">Meet your chart</h2>
        <p className="text-muted-foreground">Your first chart is free. You need your birth date, place and, if you know it, your birth time.</p>
        <div className="flex flex-wrap justify-center gap-3"><Button asChild size="lg" variant="signal"><Link to="/auth?mode=signup&next=%2Fstart">Create my chart</Link></Button><Button asChild size="lg" variant="outline"><Link to="/pricing">See plans</Link></Button></div>
      </motion.section>
    </article>
  );
}
