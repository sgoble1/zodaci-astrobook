import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FlyingStarWheel } from '@/components/fengshui/FlyingStarWheel';
import { BaguaWheel } from '@/components/fengshui/BaguaWheel';
import { loadIndex, type MbEntry } from './Masterbook';
import { RelSourceSection } from '@/components/relationships/RelSourceSection';

export const GUIDES: { slug: string; prefix: string; title: string; blurb: string; match?: RegExp }[] = [
  { slug: 'relationships', prefix: '', match: /love|relationship|partner|venus|7th|seventh|marriage|synastry|romance|compatib/i, title: 'Relationships in the Sources', blurb: 'Every section across April’s documents about love, Venus, the 7th house, compatibility and relationship patterns.' },
  { slug: 'timeline-retrogrades', prefix: 'c-a4bea1f0-', title: 'Timeline Overview', blurb: 'A complete guide to when important themes may become more noticeable in April’s life, including life phases, current cycles, retrogrades, returns and eclipses.' },
  { slug: 'feng-shui-pages', prefix: 'c-ff306540-p', title: 'Feng Shui Guide · Page by Page', blurb: 'Pages 114–180 of the Birth Chart & Feng Shui guide — the home implementation guide, affirmations and the Final Synthesis — each as its own section.' },
  { slug: 'birth-chart-feng-shui', prefix: 'c-ff306540-', title: 'Birth Chart & Feng Shui Guide', blurb: 'Big Three, planets, aspects, houses, purpose, patterns, lessons, love, career, health, shadow work and the full Feng Shui home plan.' },
];

export default function Guide() {
  const { slug } = useParams();
  const g = GUIDES.find(x => x.slug === slug) ?? GUIDES[0];
  const [entries, setEntries] = useState<MbEntry[]>([]);
  useEffect(() => { loadIndex().then(setEntries).catch(() => setEntries([])); }, []);
  const secs = g.match ? entries.filter(e => g.match!.test(e.title)) : entries.filter(e => e.id.startsWith(g.prefix) && (g.prefix.endsWith('-p') || !/-p\d+$/.test(e.id)));
  return (
    <div className="space-y-6">
      <div className="font-smallcaps text-xs text-gold">Source guide · {secs.length} sections</div>
      <h1 className="text-3xl sm:text-4xl">{g.title}</h1>
      <p className="text-muted-foreground max-w-2xl">{g.blurb} Each section opens as a full page with the complete text, links to the PDF page, and a “Summarise from the sources” button.</p>
      {g.slug === 'timeline-retrogrades' && <section className="space-y-4 border-y border-border py-6" aria-labelledby="timing-overview-heading">
        <div>
          <h2 id="timing-overview-heading" className="text-2xl">How to understand April’s timing</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">These pages describe different sizes of time. Start with the long life story, then narrow the view to the current years and the present annual chapter. Retrogrades, returns and eclipses add review periods and turning points. They describe themes and choices, not fixed events.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { to: '/timeline', title: 'Life phases · 1990–2060', text: 'The widest view: ten long chapters showing how April’s priorities and growth may change across her life.' },
            { to: '/transits', title: 'Current cycles · 2026–2040', text: 'A closer look at the years ahead, including longer planetary cycles, returns and periods of change.' },
            { to: '/profection', title: 'This year · Age 35', text: 'The current birthday-to-birthday focus, explained as one life area receiving extra attention.' },
            { to: '/retrogrades', title: 'Retrogrades at birth', text: 'Patterns April may process inwardly, revisit repeatedly or understand better after reflection.' },
          ].map(item => <Link key={item.to} to={item.to} className="parchment block p-4 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <h3 className="font-display text-lg">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
          </Link>)}
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground"><strong className="text-foreground">What else is included below:</strong> Mercury, Venus, Jupiter and Saturn timing guides; major returns; eclipse periods; daily, monthly and annual ways to use the information; plus the original appendices and reference material.</p>
      </section>}
      {!['timeline-retrogrades', 'relationships'].includes(g.slug) && <section className="space-y-3"><h2 className="text-2xl">Bagua wheel · April’s eight directions</h2><BaguaWheel /></section>}
      {g.slug === 'feng-shui-pages' && <section className="space-y-3"><h2 className="text-2xl">Flying Stars wheel</h2><FlyingStarWheel /></section>}
      {g.slug === 'relationships' ? <>
        <nav className="parchment p-4 text-xs flex flex-wrap gap-x-4 gap-y-1"><span className="font-smallcaps text-gold">Jump to</span>{secs.map(e => <a key={e.id} href={`#${e.id}`} className="underline">{e.title}</a>)}</nav>
        <div className="space-y-4">{secs.map(e => <RelSourceSection key={e.id} e={e} />)}</div>
        <p className="text-xs text-muted-foreground">See also <Link to="/relationships" className="underline">your relationships</Link> and the <Link to="/masterbook" className="underline">full Masterbook</Link>.</p>
      </> : <ol className="grid sm:grid-cols-2 gap-3">
        {secs.map(e => (
          <li key={e.id}><Link to={`/masterbook/${e.id}`} className="parchment block p-4 hover:border-primary h-full">
            <div className="font-smallcaps text-[10px] text-gold">{e.label}</div>
            <div className="text-sm mt-1">{e.title}</div>
          </Link></li>
        ))}
      </ol>}
    </div>
  );
}
