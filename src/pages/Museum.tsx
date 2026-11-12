import { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarClock, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHead } from '@/components/observatory/PageHead';
import { SpotArt } from '@/components/art/SpotArt';
import { ChartRequired } from '@/components/common/ChartRequired';
import { usePageMeta } from '@/hooks/usePageMeta';
import { buildGallery, GALLERIES, galleryById, type Exhibit, type GalleryId } from '@/lib/museum';
import type { ChartResult } from '@/lib/astro';

const day = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

/** Museum of the Sky: five gallery doors, each hung with the member's own calculated placements. */
export default function Museum() {
  usePageMeta('Museum of the Sky · Zodaci', 'Five galleries exhibiting your own calculated placements: roots and belonging, relationships, purpose, future exhibitions and legacy.');
  return <ChartRequired what="hang your galleries">{({ birth }) => <Lobby name={birth.name} />}</ChartRequired>;
}

function Lobby({ name }: { name: string }) {
  return (
    <article className="mx-auto max-w-5xl space-y-10">
      <PageHead eyebrow="Museum of the Sky" title={name ? `The ${name} Collection` : 'Your collection'} script="Every plate drawn from the sky you were born under." art="sign"
        actions={<Button asChild variant="outline"><Link to="/investigations">Open the case files</Link></Button>}>
        Walk the five galleries. Each exhibit is one of your calculated placements, framed with a plaque in plain words. Nothing on the walls is borrowed from another person’s chart.
      </PageHead>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {GALLERIES.map(g => (
          <li key={g.id}>
            <Link to={`/museum/${g.id}`} className="museum-door group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <div className="obs-paper flex h-full flex-col items-center gap-3 p-6 text-center">
                <p className="font-label text-[11px] tracking-[0.2em] text-primary">{g.wing}</p>
                <div className="museum-arch"><SpotArt kind={g.art} className="h-24 w-24" /></div>
                <h2 className="font-display !text-xl">{g.name}</h2>
                <p className="text-sm leading-relaxed">{g.intro}</p>
                <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary transition-transform duration-700 group-hover:translate-x-1">Enter the gallery <ArrowRight className="h-4 w-4" aria-hidden /></span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function MuseumGalleryPage() {
  const { gallery } = useParams();
  const spec = galleryById(gallery);
  usePageMeta(spec ? `${spec.name} Gallery · Museum of the Sky · Zodaci` : 'Museum of the Sky · Zodaci', spec?.intro ?? 'Galleries drawn from your own chart.');
  if (!spec) return <Navigate to="/museum" replace />;
  return <ChartRequired what={`open the ${spec.name} gallery`}>{({ chart }) => <GalleryView chart={chart} id={spec.id} />}</ChartRequired>;
}

function Plate({ e }: { e: Exhibit }) {
  return (
    <li className="museum-plate">
      <figure className="obs-paper flex h-full flex-col">
        <div className="museum-frame relative flex items-center justify-center gap-4 p-6">
          <SpotArt kind={e.element} className="h-20 w-20 opacity-90" />
          <span aria-hidden className="font-display text-5xl text-primary">{e.glyph}</span>
        </div>
        <figcaption className="flex flex-1 flex-col gap-2 p-5">
          <h3 className="font-display text-lg leading-snug">{e.title}</h3>
          <p className="flex flex-wrap gap-1.5">{e.facts.map(f => <span key={f} className="rounded-sm border border-border px-2 py-0.5 font-label text-[11px] tracking-wide">{f}</span>)}</p>
          <p className="text-sm leading-relaxed">{e.plaque}</p>
        </figcaption>
      </figure>
    </li>
  );
}

function GalleryView({ chart, id }: { chart: ChartResult; id: GalleryId }) {
  const g = useMemo(() => buildGallery(chart, id), [chart, id]);
  const i = GALLERIES.findIndex(x => x.id === id);
  const prev = GALLERIES[(i + GALLERIES.length - 1) % GALLERIES.length], next = GALLERIES[(i + 1) % GALLERIES.length];
  const spec = GALLERIES[i];
  return (
    <article className="mx-auto max-w-5xl space-y-8">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground"><Link to="/museum" className="inline-flex items-center gap-1 hover:text-foreground"><ArrowLeft className="h-4 w-4" aria-hidden /> Museum lobby</Link></nav>
      <PageHead eyebrow={`Museum of the Sky · ${g.wing}`} title={`${g.name} Gallery`} script={g.curatorNote} art={spec.art}>{g.note}</PageHead>
      {g.exhibits.length > 0 && <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{g.exhibits.map(e => <Plate key={e.id} e={e} />)}</ul>}
      {g.coming.length > 0 && (
        <section aria-labelledby="coming" className="obs-panel space-y-4 p-6">
          <h2 id="coming" className="flex items-center gap-2 font-display text-2xl"><CalendarClock className="h-5 w-5 text-primary" aria-hidden /> Coming exhibitions · next 12 months</h2>
          <ol className="grid gap-3 sm:grid-cols-2">{g.coming.map(e => <li key={`${e.title}-${e.date.toISOString()}`} className="rounded-sm border border-border p-3"><p className="font-label text-xs tracking-[0.14em] text-primary">{day(e.date)}</p><p className="font-medium">{e.title}</p><p className="text-sm text-muted-foreground">{e.detail}</p></li>)}</ol>
        </section>
      )}
      {g.milestones.length > 0 && (
        <section aria-labelledby="cycles" className="space-y-4">
          <h2 id="cycles" className="flex items-center gap-2 font-display text-2xl"><Landmark className="h-5 w-5 text-primary" aria-hidden /> {id === 'future' ? 'Long cycles still ahead' : 'The long cycles of your life'}</h2>
          <ol className="museum-timeline space-y-4 border-l-2 border-[hsl(var(--brass)/0.5)] pl-6">
            {g.milestones.map(m => (
              <li key={m.key} className="relative">
                <span aria-hidden className={`absolute -left-[1.95rem] top-1.5 h-3 w-3 rounded-full border-2 border-primary ${m.past ? 'bg-primary' : 'bg-background'}`} />
                <p className="font-label text-xs tracking-[0.14em] text-primary">{day(m.date)} · age {m.age} · {m.past ? 'already passed' : 'ahead'}</p>
                <p className="font-medium">{m.title}</p>
                <p className="text-sm text-muted-foreground">{m.meaning}</p>
              </li>
            ))}
          </ol>
          {id === 'legacy' && <p className="text-sm text-muted-foreground">Want to keep what each cycle meant to you? <Link to="/observation-log?tag=legacy" className="text-primary underline-offset-4 hover:underline">Write it in your Observation Log</Link>.</p>}
        </section>
      )}
      {!g.exhibits.length && !g.coming.length && !g.milestones.length && <p className="obs-paper p-6 text-center text-muted-foreground">This gallery is still being hung: nothing in your chart’s calculation fills it yet.</p>}
      <nav aria-label="Other galleries" className="flex flex-wrap justify-between gap-3 border-t border-border pt-6 text-sm">
        <Link to={`/museum/${prev.id}`} className="inline-flex items-center gap-1 hover:text-primary"><ArrowLeft className="h-4 w-4" aria-hidden /> {prev.name}</Link>
        <Link to={`/museum/${next.id}`} className="inline-flex items-center gap-1 hover:text-primary">{next.name} <ArrowRight className="h-4 w-4" aria-hidden /></Link>
      </nav>
    </article>
  );
}
