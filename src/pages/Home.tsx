import { Link } from 'react-router-dom';
import { NatalWheel } from '@/components/chart/NatalWheel';
import { BIRTH, PHASES, PLACEMENTS } from '@/content/april';
import { UpdatesFeed } from '@/components/common/UpdatesFeed';
import heroImg from '@/assets/hero-threshold.jpg';

const modules = [
  { to: '/birth-chart', title: 'The Birth Chart', desc: "The full snapshot — chart shape, elemental balance, chart rulers, most-elevated planet, the Full Moon opposition." },
  { to: '/planets', title: 'The Planets', desc: 'All ten bodies plus Chiron, the Nodes, Vertex, Lilith and the Part of Fortune. Every glyph on the wheel is clickable.' },
  { to: '/houses', title: 'The Houses', desc: 'All twelve houses — cusps, rulers, tenants, and the story each one is telling in her life.' },
  { to: '/aspects', title: 'The Aspects', desc: 'Full Moon opposition, Saturn-Pluto trine, chart-ruler conjunction — the geometric grammar of the chart.' },
  { to: '/timeline', title: 'The Timeline · 1990–2060', desc: 'Ten life phases from Early Life Foundation to the Second Saturn Return. Currently: The Great Opening.' },
  { to: '/retrogrades', title: 'Retrogrades', desc: 'Mercury Rx in domicile, Saturn Rx in the first, Uranus and Neptune Rx — the interior planets that shape her.' },
  { to: '/purpose', title: 'Purpose & Numerology', desc: 'Life Path 7, Personal Year 7 (2026), Kua 1 Water, Metal Horse — the numerical harmonics of the chart.' },
  { to: '/feng-shui', title: 'Feng Shui · Kua 1', desc: 'Interactive bagua overlay tuned to a Water Kua in the East group.' },
  { to: '/compendium', title: 'The Master Compendium', desc: 'Reference tables, dignities, karmic axis and past-life notation, tarot and fixed stars.' },
];

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="grid lg:grid-cols-[1.05fr,0.95fr] gap-10 items-center gentle-fade">
        <div>
          <div className="font-smallcaps text-[11px] text-gold mb-4">A Premium Personal Astrology Report · Rendered Live</div>
          <h1 className="font-display leading-[0.95]">
            April.
            <br />
            <span className="italic text-muted-foreground">A complete map of the sky at 3:38pm.</span>
          </h1>
          <div className="gold-rule my-6 max-w-md" />
          <p className="text-lg leading-relaxed text-foreground/85 max-w-xl">
            An interactive companion to the twenty-section birth chart report, the 1990–2060 timeline, the retrograde navigation guide and the feng shui implementation manual. Every planet, house, aspect, life phase and gua is explorable. Every panel is drawn directly from the uploaded source documents.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/birth-chart" className="px-5 py-2.5 bg-primary text-primary-foreground rounded font-smallcaps text-xs">Begin the Report</Link>
            <Link to="/timeline" className="px-5 py-2.5 border border-border rounded font-smallcaps text-xs hover:border-gold">Current Window · The Great Opening</Link>
          </div>
          <dl className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            {[
              ['Born', BIRTH.date],
              ['Time', BIRTH.time],
              ['Place', BIRTH.place],
              ['Chart Shape', 'Bucket · Moon Handle'],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="font-smallcaps text-[10px] text-muted-foreground">{k}</dt>
                <dd className="mt-1 text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="deckle p-2 bg-vellum">
          <img src={heroImg} alt="A woman viewed from behind stands at the threshold of a great celestial doorway; above her a natal chart in antique gold." width={1600} height={1024} className="w-full h-auto" />
        </div>
      </section>

      {/* Wheel */}
      <section className="vellum deckle p-6 sm:p-10 gentle-fade">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="font-smallcaps text-[11px] text-gold">The Natal Wheel</div>
          <h2 className="font-display mt-2">Every glyph is a doorway.</h2>
          <p className="text-muted-foreground text-sm mt-3">
            Hover any planet to see its placement. Click a planet or house to open its complete interpretation.
          </p>
        </div>
        <NatalWheel />
      </section>

      {/* Module grid */}
      <section className="gentle-fade">
        <div className="font-smallcaps text-[11px] text-gold mb-2">Explore</div>
        <h2 className="font-display mb-8">The complete compendium.</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map(m => (
            <Link key={m.to} to={m.to} className="group block p-5 rounded border border-border bg-card/60 hover:border-gold hover:shadow-[var(--shadow-gold)] transition-all">
              <div className="font-display text-xl leading-tight">{m.title}</div>
              <div className="gold-rule my-3 w-12" />
              <div className="text-sm text-muted-foreground leading-relaxed">{m.desc}</div>
              <div className="mt-4 font-smallcaps text-[10px] text-gold opacity-0 group-hover:opacity-100 transition-opacity">Open →</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Current window */}
      <section className="gentle-fade">
        <div className="font-smallcaps text-[11px] text-gold mb-2">Current Window · 2022–2027</div>
        <h2 className="font-display mb-6">You are standing at the threshold.</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {PHASES.filter(p => p.current).map(p => (
            <div key={p.id} className="p-6 border border-gold/40 rounded bg-card">
              <div className="font-smallcaps text-[10px] text-gold">Phase {p.number} · {p.years}</div>
              <h3 className="font-display mt-2">{p.title}</h3>
              <p className="text-sm text-foreground/85 mt-3 leading-relaxed">{p.interpretation}</p>
            </div>
          ))}
          <div className="p-6 border border-border rounded bg-card/60">
            <div className="font-smallcaps text-[10px] text-muted-foreground">Chart apex</div>
            <h3 className="font-display mt-2">Pluto · Scorpio · House 10</h3>
            <p className="text-sm text-foreground/85 mt-3 leading-relaxed">
              {PLACEMENTS.find(p => p.key === 'pluto')?.interpretation.slice(0, 380)}…
            </p>
            <Link to="/planets/pluto" className="ink-link text-xs mt-4 inline-block font-smallcaps">Read the full Pluto chapter</Link>
          </div>
        </div>
      </section>
      <UpdatesFeed />
    </div>
  );
}
