import { CinematicVideo } from '@/components/fx/CinematicVideo';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BoxArt } from '@/components/common/BoxArt';
import { useMyBirth } from '@/lib/myBirth';
import { useAprilSpace } from '@/hooks/useAprilSpace';
import AprilHome from '@/pages/AprilHome';
import heroImg from '@/assets/astrobook-public.jpg';

const steps = [
  { n: '1', title: 'Enter your birth details', desc: 'Date, time and place. No birth time? There is a mode for that too — your chart still works.' },
  { n: '2', title: 'We calculate your real chart', desc: 'Planets, houses, aspects and angles are computed live from astronomical data — never copied from a template.' },
  { n: '3', title: 'Your readings grow with you', desc: 'Every reading is generated from your placements only, in plain words, with the technical details kept alongside.' },
];

const features = [
  { seed: 'chart', to: '/my-chart', title: 'Your Birth Chart', desc: 'A full interactive wheel — planets, houses and aspects calculated from your actual birth moment.' },
  { seed: 'planets', to: '/planets', title: 'Planets & Houses', desc: 'Every placement explained twice: the technical reading, and what it means in everyday words.' },
  { seed: 'systems', to: '/my-chart', title: 'Chart Details', desc: 'Inspect calculated positions and compare house systems while keeping uncertainty visible.' },
  { seed: 'timing', to: '/my-readings', title: 'Growth & Patterns', desc: 'Consider the patterns in your chart as prompts for reflection, not fixed predictions.' },
  { seed: 'counselor', to: '/personal-context', title: 'Your Life, In Context', desc: 'Keep your own examples private and choose which ones inform your readings.' },
  { seed: 'podcast', to: '/podcasts', title: 'Personal Podcasts', desc: 'Turn your readings into audio episodes you can listen to anywhere, saved to your library.' },
  { seed: 'shared', to: '/workspaces', title: 'Shared Spaces', desc: 'Create a workspace, invite someone with an email-bound link, and share selected podcasts.' },
  { seed: 'relationships', to: '/relationships', title: 'Relationships', desc: 'Add anyone’s birth details and see how your charts meet — shared placements and real synastry.' },
  { seed: 'create', to: '/my-masterbook', title: 'Create Your Own Chapters', desc: 'Cosmic members can request a detailed chart-based chapter, organized in their personal library.' },
];

const faqs = [
  { q: 'Is my birth data private?', a: 'Yes. Your birth details and readings belong to your account. Shared spaces only include the people you invite, and private chats are never visible to anyone else — not even an admin.' },
  { q: 'How accurate is the chart?', a: 'Positions use astronomical calculations. Your birth time, location and chosen house system affect the results. Astrological interpretations are not scientifically verified predictions.' },
  { q: 'What if I don’t know my birth time?', a: 'You can still get your planets, signs and aspects. Houses and the Rising sign need a time, so those sections explain what changes without one.' },
  { q: 'Is this a prediction service?', a: 'No. Zodaci interprets your birth chart as a mirror for reflection. It never invents facts about your family, past or future.' },
];

export default function Home() {
  const april = useAprilSpace();
  const myBirth = useMyBirth();
  if (april) return <AprilHome />;
  if (april === false) return <Navigate to="/dashboard" replace />;
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative isolate overflow-hidden rounded min-h-[540px] gentle-fade">
        <CinematicVideo poster={heroImg} />
        <div className="absolute inset-0 -z-10 bg-background/65" />
        <div className="max-w-2xl p-6 sm:p-10">
          <div className="font-smallcaps text-[11px] text-gold mb-4">Zodaci · A Personal Chart Library</div>
          <h1 className="font-display leading-[0.95]">
            Zodaci
          </h1>
          <div className="gold-rule my-6 max-w-md" />
          <p className="text-lg leading-relaxed text-foreground/85 max-w-xl">
            Explore your calculated birth chart and personal readings. Paid plans add six foundational chapters; Cosmic adds custom chapters and podcasts, informed by life examples you choose to share.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="outline"><Link to="/demo" className="font-smallcaps text-xs">Try the interactive demo</Link></Button>
            {myBirth ? (
              <>
                <Button asChild><Link to="/my-chart" className="font-smallcaps text-xs">Open my chart</Link></Button>
                <Button asChild variant="outline" className="h-auto min-h-10 whitespace-normal"><Link to="/explore" className="font-smallcaps text-xs">Explore & Discover</Link></Button>
                <Button asChild variant="ghost" className="h-auto min-h-10"><Link to="/pricing" className="font-smallcaps text-xs">Plans & pricing</Link></Button>
                <Button asChild variant="ghost"><Link to="/welcome">Discover Zodaci</Link></Button>
              </>
            ) : (
              <>
                <Button asChild><Link to="/start" className="font-smallcaps text-xs">See your chart free</Link></Button>
                <Button asChild variant="outline" className="h-auto min-h-10 whitespace-normal"><Link to="/explore" className="font-smallcaps text-xs">Explore & Discover</Link></Button>
                <Button asChild variant="ghost" className="h-auto min-h-10"><Link to="/pricing" className="font-smallcaps text-xs">Plans & pricing</Link></Button>
                <Button asChild variant="ghost"><Link to="/welcome">Discover Zodaci</Link></Button>
              </>
            )}
          </div>
          <p className="mt-6 text-xs text-muted-foreground">Free to start · No birth time needed · Your data stays yours</p>
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 border-y border-border py-6"><div><h2 className="text-2xl">Your sky, in print.</h2><p className="text-muted-foreground mt-2">Personal softcover books from $59. Free US shipping.</p></div><div className="flex gap-2"><Button asChild><Link to="/books">Create my printed book</Link></Button><Button asChild variant="outline"><Link to="/blog">Community journal</Link></Button></div></section>

      {/* How it works */}
      <section className="gentle-fade">
        <div className="font-smallcaps text-[11px] text-gold mb-2">How it works</div>
        <h2 className="font-display mb-8">Three steps to your personal chart.</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {steps.map(s => (
            <div key={s.n} className="p-5 rounded border border-border bg-card/60">
              <div className="font-display text-3xl text-gold">{s.n}</div>
              <div className="font-display text-xl leading-tight mt-2">{s.title}</div>
              <div className="gold-rule my-3 w-12" />
              <div className="text-sm text-muted-foreground leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section className="gentle-fade">
        <div className="font-smallcaps text-[11px] text-gold mb-2">Inside Zodaci</div>
        <h2 className="font-display mb-8">The complete compendium.</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(m => (
            <Link key={m.to} to={m.to} className="group block rounded border border-border bg-card/60 hover:border-gold hover:shadow-[var(--shadow-gold)] transition-all overflow-hidden">
              <BoxArt seed={m.seed} label={m.title} className="h-28 w-full object-cover" />
              <div className="p-5">
                <div className="font-display text-xl leading-tight">{m.title}</div>
                <div className="gold-rule my-3 w-12" />
                <div className="text-sm text-muted-foreground leading-relaxed">{m.desc}</div>
                <div className="mt-4 font-smallcaps text-[10px] text-gold opacity-0 group-hover:opacity-100 transition-opacity">Open →</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Accuracy promise */}
      <section className="vellum deckle p-6 sm:p-10 gentle-fade">
        <div className="max-w-2xl mx-auto text-center">
          <div className="font-smallcaps text-[11px] text-gold">Our promise</div>
          <h2 className="font-display mt-2">Calculated, not copied.</h2>
          <p className="text-muted-foreground text-sm mt-3 leading-relaxed">
            Your chart is calculated from your saved birth moment. Compare house systems and inspect the measured positions. Readings distinguish chart facts, your own reports and reflective interpretations—without treating symbolism as biography.
          </p>
          <Button asChild variant="outline" className="mt-6"><Link to="/my-chart" className="font-smallcaps text-xs">Inspect your chart</Link></Button>
        </div>
      </section>

      {/* FAQ */}
      <section className="gentle-fade">
        <div className="font-smallcaps text-[11px] text-gold mb-2">Questions</div>
        <h2 className="font-display mb-8">Before you begin.</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {faqs.map(f => (
            <div key={f.q} className="p-5 rounded border border-border bg-card/60">
              <div className="font-display text-lg leading-tight">{f.q}</div>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center gentle-fade">
        <h2 className="font-display">Ready when you are.</h2>
        <p className="text-muted-foreground text-sm mt-3">Two minutes of birth details, a lifetime of reading.</p>
        <Button asChild className="mt-6"><Link to={myBirth ? '/my-chart' : '/start'} className="font-smallcaps text-xs">{myBirth ? 'Open my chart' : 'See your chart free'}</Link></Button>
      </section>
    </div>
  );
}
