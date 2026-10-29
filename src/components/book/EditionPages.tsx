import type { EditionPage } from '@/content/sampleEdition';

/** Full book pages: illuminated plate beside calculated facts, interpretation and a reflection prompt. */
export function EditionPages({ pages, images }: { pages: EditionPage[]; images?: Record<string, string> }) {
  return (
    <div className="space-y-12">
      {pages.map((p, i) => (
        <article key={p.n} aria-labelledby={`ep-${p.n}`} className="vellum grid overflow-hidden lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <figure className={`relative bg-background/60 ${i % 2 ? 'lg:order-2' : ''}`}>
            <img src={images?.[p.image] ?? p.image} alt={p.imageAlt} width={1024} height={1280} loading="lazy" className="h-full w-full object-cover" />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 to-transparent p-4 font-smallcaps text-xs text-gold">Plate {p.n} · {p.placement}</figcaption>
          </figure>
          <div className="space-y-5 p-6 sm:p-10">
            <div>
              <p className="font-smallcaps text-xs text-gold">{p.volume}</p>
              <h3 id={`ep-${p.n}`} className="mt-1 font-display text-3xl sm:text-4xl">{p.title}</h3>
            </div>
            <dl className="grid gap-x-6 gap-y-2 border-y border-border/60 py-4 text-sm sm:grid-cols-2">
              {p.facts.map(f => <div key={f.label}><dt className="text-xs text-muted-foreground">{f.label}</dt><dd className="text-foreground">{f.value}</dd></div>)}
            </dl>
            <div className="space-y-4 leading-relaxed text-foreground/90">
              {p.body.map((t, k) => <p key={k} className={k === 0 ? 'first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-5xl first-letter:leading-none first-letter:text-gold' : ''}>{t}</p>)}
            </div>
            <p className="border-l-2 border-gold/60 pl-4 italic text-muted-foreground">{p.reflection}</p>
            <p className="text-right text-xs text-muted-foreground">— {p.n} —</p>
          </div>
        </article>
      ))}
    </div>
  );
}
