import { usePageMeta } from '@/hooks/usePageMeta';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import workshop from '@/assets/pages/about-atomic-zodiac.jpg';
import { SpotArt, type SpotKind } from '@/components/art/SpotArt';

const PILLAR_ART: SpotKind[] = ['chart', 'written', 'honest', 'private'];

const fade = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } };

const PILLARS = [
  ['Calculated, not guessed', 'Every planet, house and aspect is computed from your exact birth moment with an astronomy-grade engine — then explained in words anyone can follow.'],
  ['Written for one person', 'Your readings combine sign, house, aspects and rulers so they could only belong to your chart. No copy-paste horoscopes.'],
  ['Honest about limits', 'We show our sources, flag uncertain birth times, and never claim astrology can predict your life or replace professional help.'],
  ['Private by design', 'Your birth details, notes and conversations belong to you. Shared spaces are invitation-only.'],
];

export default function About() {
  usePageMeta('About Zodaci · Why we built it', 'The story behind Zodaci: calculated birth charts, honest interpretation and readings written for one person.');
  return (
    <article className="space-y-20">
      <motion.header {...fade} className="mx-auto max-w-3xl space-y-5 text-center">
        <p className="font-smallcaps text-xs tracking-widest text-gold">About Zodaci</p>
        <h1 className="text-silver font-display text-5xl sm:text-7xl leading-[0.98]">An encyclopedia, one sky at a time.</h1>
        <p className="text-lg text-muted-foreground">Zodaci began when we calculated our own charts in full detail and read the results. They described things we had tried to put into words for years. We built it so anyone can have that same careful, complete account of their sky — accurate first, warm second.</p>
      </motion.header>

      <motion.img {...fade} src={workshop} alt="Atomic-age zodiac mural with twelve illustrated signs, a golden Sun, crescent Moon, ringed Saturn and an observatory in cream, indigo, yellow and red." width={1536} height={768} loading="lazy" className="w-full rounded-lg border border-border" />
      <motion.section {...fade} className="mx-auto max-w-3xl space-y-5 text-lg leading-relaxed">
        <h2 className="font-display text-3xl">Why we built it</h2>
        <p>We spent years with thick astrology books, hand-drawn charts and late-night conversations about what a Moon in one sign or a Saturn in one house really meant for a real life. The insight was extraordinary — but it was locked inside jargon, scattered across sources, and rarely about <em>you</em>.</p>
        <p>So we built the companion we wished existed: a place that calculates your chart precisely, translates every symbol into plain language, and then goes deep — chapters on love, purpose, healing and timing written from your own placements.</p>
        <p>This is our passion. We love the craft, the history and the moments when a reading makes someone say, "that's exactly me." Every page here is made with that feeling in mind.</p>
      </motion.section>

      <motion.section {...fade} className="grid gap-5 sm:grid-cols-2">
        {PILLARS.map(([t, d], i) => <div key={t} className="atomic-box sm:flex-row sm:items-start sm:gap-5 p-6"><SpotArt kind={PILLAR_ART[i]} className="atomic-box-art" /><div><h3 className="font-display text-xl mb-2">{t}</h3><p className="text-muted-foreground">{d}</p></div></div>)}
      </motion.section>

      <motion.section {...fade} className="mx-auto max-w-3xl space-y-4">
        <h2 className="font-display text-3xl">Our inspirations</h2>
        <p className="text-muted-foreground text-lg">Hellenistic and modern psychological astrology, Vedic Jyotish, Chinese Ba Zi, the Maya Tzolk’in and other traditions — read with curiosity and respect for where each comes from. Astronomy keeps us exact; psychology keeps us humane; good writing keeps it all readable.</p>
      </motion.section>

      <motion.section {...fade} className="rounded-xl border border-primary/30 bg-primary/10 p-10 text-center space-y-4">
        <h2 className="font-display text-3xl">Meet your chart</h2>
        <p className="text-muted-foreground">Free to start. Your first chart and readings take about two minutes.</p>
        <div className="flex flex-wrap justify-center gap-3"><Button asChild size="lg"><Link to="/auth">Create my chart</Link></Button><Button asChild size="lg" variant="outline"><Link to="/pricing">See plans</Link></Button></div>
      </motion.section>
    </article>
  );
}
