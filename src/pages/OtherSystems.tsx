import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight, Globe2 } from 'lucide-react';
import { OTHER_SYSTEMS, COMMON_THREADS } from '@/content/otherSystems';
import { Button } from '@/components/ui/button';

export function OtherSystemsDashboard() {
  return <div className="space-y-12">
    <header className="max-w-3xl">
      <div className="font-smallcaps text-xs text-gold">Cross-cultural comparison</div>
      <h1 className="mt-2 text-4xl sm:text-5xl">Other Systems</h1>
      <p className="mt-4 text-lg text-muted-foreground">Seven additional traditions read April’s birth data through different symbolic languages. Their agreements are useful as prompts for reflection, not scientific proof.</p>
    </header>

    <section aria-labelledby="common-threads"><h2 id="common-threads" className="text-3xl">Where the systems meet</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">{COMMON_THREADS.map(item => <article key={item.theme} className="parchment p-5">
        <div className="font-smallcaps text-[10px] text-gold">{item.systems.join(' · ')}</div><h3 className="mt-2 text-xl">{item.theme}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.explanation}</p>
      </article>)}</div>
    </section>

    <section aria-labelledby="systems-list"><h2 id="systems-list" className="text-3xl">Explore each lens</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{OTHER_SYSTEMS.map(system => { const Icon = system.icon; return <Link key={system.slug} to={`/other-systems/${system.slug}`} className="group border border-border bg-card/60 p-5 transition-colors hover:border-gold focus-visible:border-gold">
        <Icon className="h-6 w-6 text-accent" aria-hidden="true"/><div className="mt-4 text-xs text-muted-foreground">{system.tradition}</div><h3 className="mt-1 text-xl">{system.name}</h3><p className="mt-2 text-sm">{system.result}</p><span className="mt-4 inline-flex items-center gap-1 text-xs text-gold">Open interpretation <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true"/></span>
      </Link>; })}</div>
    </section>

    <aside className="border-l-2 border-accent pl-4 text-sm text-muted-foreground"><Globe2 className="mb-2 h-5 w-5 text-accent" aria-hidden="true"/>These systems arose in different places and eras. Similar wording does not mean shared historical origins; the dashboard compares themes without collapsing the traditions into one.</aside>
  </div>;
}

export function OtherSystemDetail() {
  const { slug } = useParams();
  const system = OTHER_SYSTEMS.find(item => item.slug === slug);
  if (!system) return <Navigate to="/other-systems" replace />;
  const Icon = system.icon;
  return <article className="space-y-10">
    <header className="max-w-3xl"><div className="font-smallcaps text-xs text-gold">{system.tradition} · A symbolic lens for April</div><div className="mt-4 flex items-center gap-3"><Icon className="h-8 w-8 text-accent" aria-hidden="true"/><h1 className="text-4xl sm:text-5xl">{system.name}</h1></div><p className="mt-4 text-xl">{system.result}</p></header>
    <section className="parchment p-6"><h2 className="text-2xl">How this was derived</h2><p className="mt-3 leading-relaxed">{system.calculation}</p></section>
    <section><h2 className="text-2xl">Interpretation</h2><div className="mt-4 space-y-4">{system.interpretation.map((text, index) => <p key={index} className="border-l border-gold/60 pl-4 leading-relaxed text-foreground/90">{text}</p>)}</div></section>
    <section><h2 className="text-2xl">Themes to explore</h2><ul className="mt-3 flex flex-wrap gap-2">{system.themes.map(theme => <li key={theme} className="rounded border border-border bg-card px-3 py-1 text-sm">{theme}</li>)}</ul></section>
    <aside className="border border-border bg-muted/30 p-4 text-sm text-muted-foreground"><strong className="text-foreground">Scope:</strong> {system.caution}</aside>
    <Button asChild variant="outline"><Link to="/other-systems">← Compare all systems</Link></Button>
  </article>;
}