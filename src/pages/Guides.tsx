import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FlyingStarWheel } from '@/components/fengshui/FlyingStarWheel';
import { loadIndex, type MbEntry } from './Masterbook';

export const GUIDES = [
  { slug: 'timeline-retrogrades', prefix: 'c-a4bea1f0-', title: 'Timeline & Retrograde Guide', blurb: 'Life phases 1990–2060, Mercury, Venus, Jupiter and Saturn guides, eclipses, daily-to-annual strategies and appendices.' },
  { slug: 'feng-shui-pages', prefix: 'c-ff306540-p', title: 'Feng Shui Guide · Page by Page', blurb: 'Pages 114–180 of the Birth Chart & Feng Shui guide — the home implementation guide, affirmations and the Final Synthesis — each as its own section.' },
  { slug: 'birth-chart-feng-shui', prefix: 'c-ff306540-', title: 'Birth Chart & Feng Shui Guide', blurb: 'Big Three, planets, aspects, houses, purpose, patterns, lessons, love, career, health, shadow work and the full Feng Shui home plan.' },
];

export default function Guide() {
  const { slug } = useParams();
  const g = GUIDES.find(x => x.slug === slug) ?? GUIDES[0];
  const [entries, setEntries] = useState<MbEntry[]>([]);
  useEffect(() => { loadIndex().then(setEntries); }, []);
  const secs = entries.filter(e => e.id.startsWith(g.prefix) && (g.prefix.endsWith('-p') || !/-p\d+$/.test(e.id)));
  return (
    <div className="space-y-6">
      <div className="font-smallcaps text-xs text-gold">Source guide · {secs.length} sections</div>
      <h1 className="text-3xl sm:text-4xl">{g.title}</h1>
      <p className="text-muted-foreground max-w-2xl">{g.blurb} Each section opens as a full page with the complete text, links to the PDF page, and a “Summarise from the sources” button.</p>
      {g.slug === 'feng-shui-pages' && <section className="space-y-3"><h2 className="text-2xl">Flying Stars wheel</h2><FlyingStarWheel /></section>}
      <ol className="grid sm:grid-cols-2 gap-3">
        {secs.map(e => (
          <li key={e.id}><Link to={`/masterbook/${e.id}`} className="parchment block p-4 hover:border-primary h-full">
            <div className="font-smallcaps text-[10px] text-gold">{e.label}</div>
            <div className="text-sm mt-1">{e.title}</div>
          </Link></li>
        ))}
      </ol>
    </div>
  );
}
