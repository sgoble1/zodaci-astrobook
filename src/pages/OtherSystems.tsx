import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight, Globe2 } from 'lucide-react';
import { OTHER_SYSTEMS, COMMON_THREADS } from '@/content/otherSystems';
import { calculateOtherSystem } from '@/lib/otherSystems';
import { Button } from '@/components/ui/button';

export function OtherSystemsDashboard() {
  return <div className="space-y-12">
    <header className="max-w-3xl">
      <div className="font-smallcaps text-xs text-gold">Cross-cultural comparison</div>
      <h1 className="mt-2 text-4xl sm:text-5xl">Other Systems</h1>
      <p className="mt-4 text-lg text-muted-foreground">Seven additional traditions read April’s birth data through different symbolic languages. Their agreements are useful as prompts for reflection, not scientific proof.</p>
    </header>

    <section aria-labelledby="common-threads"><h2 id="common-threads" className="text-3xl">Where the systems meet</h2><p className="mt-2 max-w-2xl text-sm text-muted-foreground">This compares repeated ideas in everyday language. Agreement means several traditions describe a similar pattern; it does not prove that any prediction is certain.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">{COMMON_THREADS.map(item => <article key={item.theme} className="parchment p-5">
        <div className="font-smallcaps text-[10px] text-gold">{item.systems.join(' · ')}</div><h3 className="mt-2 text-xl">{item.theme}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.explanation}</p>
      </article>)}</div>
    </section>

    <section aria-labelledby="systems-list"><h2 id="systems-list" className="text-3xl">Explore each lens</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{OTHER_SYSTEMS.map(system => { const Icon = system.icon; const calculated = calculateOtherSystem(system.slug); return <Link key={system.slug} to={`/other-systems/${system.slug}`} className="group border border-border bg-card/60 p-5 transition-colors hover:border-gold focus-visible:border-gold">
        <Icon className="h-6 w-6 text-accent" aria-hidden="true"/><div className="mt-4 text-xs text-muted-foreground">{system.tradition}</div><h3 className="mt-1 text-xl">{system.name}</h3><p className="mt-2 text-sm">{calculated.summary}</p><span className="mt-4 inline-flex items-center gap-1 text-xs text-gold">Open chart and interpretation <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true"/></span>
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
  const calculated = calculateOtherSystem(system.slug);
  return <article className="space-y-10">
    <header className="max-w-3xl"><div className="font-smallcaps text-xs text-gold">{system.tradition} · A symbolic lens for April</div><div className="mt-4 flex items-center gap-3"><Icon className="h-8 w-8 text-accent" aria-hidden="true"/><h1 className="text-4xl sm:text-5xl">{system.name}</h1></div><p className="mt-4 text-xl">{calculated.summary}</p></header>
    <section aria-labelledby="system-chart"><h2 id="system-chart" className="text-2xl">April’s calculated chart</h2><p className="mt-2 text-sm text-muted-foreground">Each spoke is one part of this system’s result. The labels below keep the exact placement and then explain what it could look like in April’s ordinary life.</p><div className="mt-5 grid items-center gap-6 md:grid-cols-[16rem,1fr]"><div className="relative mx-auto aspect-square w-full max-w-64 rounded-full border border-accent/40 bg-card" role="img" aria-label={`${system.name} chart showing ${calculated.placements.map(p => `${p.label}: ${p.value}`).join(', ')}`}><div className="absolute inset-[18%] rounded-full border border-gold/40" />{calculated.values.map((value,index) => { const angle=(index/calculated.values.length)*Math.PI*2-Math.PI/2; const left=50+Math.cos(angle)*(28+value*10); const top=50+Math.sin(angle)*(28+value*10); return <span key={index} className="absolute grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-accent bg-background text-xs text-accent" style={{left:`${left}%`,top:`${top}%`}}>{index+1}</span>; })}<span className="absolute inset-0 grid place-items-center px-12 text-center text-sm font-medium">{calculated.summary}</span></div><dl className="space-y-3">{calculated.placements.map((placement,index)=><div key={placement.label} className="border-l border-gold/60 pl-4"><dt className="font-medium"><span className="text-gold">{index+1}.</span> {placement.label} · {placement.value}</dt><dd className="mt-1 text-sm text-muted-foreground"><strong className="text-foreground">What this may mean for April:</strong> {placement.meaning}.</dd></div>)}</dl></div></section>
    <section aria-labelledby="system-aspects"><h2 id="system-aspects" className="text-2xl">How the placements work together</h2><p className="mt-2 text-sm text-muted-foreground">An “aspect” or relationship means two parts of the result are being read together. The technical wording stays visible, followed by a plain explanation for April.</p><div className="mt-4 grid gap-4 sm:grid-cols-2">{calculated.aspects.map(aspect => <article key={aspect.title} className="border border-border bg-card/50 p-5"><h3 className="text-lg">{aspect.title}</h3><p className="mt-1 text-xs text-muted-foreground">Technical detail: {aspect.technical}</p><p className="mt-3 text-sm leading-relaxed"><strong>In April’s everyday life:</strong> {aspect.plain}</p></article>)}</div></section>
    <section className="parchment p-6"><h2 className="text-2xl">How this was calculated</h2><p className="mt-3 leading-relaxed">{calculated.method}</p></section>
    <section><h2 className="text-2xl">Interpretation</h2><p className="mt-2 text-sm text-muted-foreground">In plain terms: this is what the result may suggest about April’s habits, strengths, tensions, and choices.</p><div className="mt-4 space-y-4">{system.interpretation.map((text, index) => <p key={index} className="border-l border-gold/60 pl-4 leading-relaxed text-foreground/90">{text}</p>)}</div></section>
    <section><h2 className="text-2xl">Themes to explore</h2><p className="mt-2 text-sm text-muted-foreground">Use these as questions for reflection, not labels April has to fit.</p><ul className="mt-3 flex flex-wrap gap-2">{system.themes.map(theme => <li key={theme} className="rounded border border-border bg-card px-3 py-1 text-sm">{theme}</li>)}</ul></section>
    <aside className="border border-border bg-muted/30 p-4 text-sm text-muted-foreground"><strong className="text-foreground">Scope:</strong> {system.caution}</aside>
    <Button asChild variant="outline"><Link to="/other-systems">← Compare all systems</Link></Button>
  </article>;
}