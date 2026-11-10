import { Link } from 'react-router-dom';
import { ArrowRight, Printer, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePageMeta } from '@/hooks/usePageMeta';
import { SAMPLE_ISSUE, SAMPLE_ISSUE_SCRIPTED } from '@/content/sampleComic';
import { COMIC_PLANS, COMIC_SPEC, firstIssueMonth, monthLabel, shipBy } from '@/lib/comic';

/** Print formats for Issue 1. Trim/bleed match comicPrint.ts (5.5 × 8.5 in digest, 0.125 in bleed, 0.25 in safe zone). */
const FORMATS = [
  { name: 'Digest comic', size: '5.5 × 8.5 in (140 × 216 mm)', pages: '24 pages incl. covers', binding: 'Saddle-stitched', file: '5.75 × 8.75 in with bleed · 1725 × 2625 px at 300 DPI' },
  { name: 'Cover art print', size: '11 × 17 in (279 × 432 mm)', pages: 'Single sheet', binding: 'Unbound, matte poster stock', file: '11.25 × 17.25 in with bleed · 3375 × 5175 px at 300 DPI' },
];

/** How the sample Issue #1 fills 24 pages: cover and six story pages drawn, five scripted, the rest from the standard issue map. */
const PLAN: [string, string, 'Drawn' | 'Scripted' | 'Planned'][] = [
  ['1', `Cover — ${SAMPLE_ISSUE.title}`, 'Drawn'],
  ...SAMPLE_ISSUE.pages.map(p => [String(p.pageNumber + 1), `${p.actTitle} (${p.placement})`, 'Drawn'] as [string, string, 'Drawn']),
  ...SAMPLE_ISSUE_SCRIPTED.map(p => [String(p.pageNumber + 1), `${p.title} (${p.placement})`, 'Scripted'] as [string, string, 'Scripted']),
  [`${SAMPLE_ISSUE.pages.length + SAMPLE_ISSUE_SCRIPTED.length + 2}–21`, 'Retrograde Watch, Lunar Calendar, House Focus, Reflection Prompts, Constellation', 'Planned'],
  ['22', 'Next month preview', 'Planned'],
  ['23–24', 'About Zodaci · Back cover', 'Planned'],
];

/** What happens after ordering your own Issue #1. The ship-by date comes from the same rule as checkout. */
function deliverySteps(today = new Date()): [string, string, string][] {
  const first = firstIssueMonth(today);
  const ship = shipBy(first).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  return [
    ['You order', 'Today', 'Sign in with your saved birth details and pay once. Your issue is for your own chart, not the sample.'],
    ['Your story is written', `Before ${monthLabel(first)}`, 'Your Sun, Moon and Rising cast the story; that month’s transits to your chart decide what happens.'],
    ['Drawn and lettered', `Before ${monthLabel(first)}`, 'Pages are drawn in the same golden-age ink style as the sample and checked against your placements.'],
    ['Printed', 'Early in the month', 'Full colour, 5.5 × 8.5 in, saddle-stitched.'],
    ['Ships to you', `By ${ship}`, 'US delivery only, with tracking by email.'],
  ];
}

export default function ComicIssuePrint() {
  usePageMeta(`How AstroComic Issue #1 prints — sample: ${SAMPLE_ISSUE.title} | Zodaci`, `Sizes, page count and print specifications for AstroComic Issue #1, shown with the sample issue ${SAMPLE_ISSUE.title}. Order your own Issue #1, written from your chart, for ${COMIC_PLANS.single.label}.`);
  const delivery = deliverySteps();
  return (
    <article className="space-y-16">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground"><Link to="/astrocomic" className="underline underline-offset-4">AstroComic</Link> / Print Issue #1</nav>
      <section className="grid items-center gap-10 lg:grid-cols-[1fr_340px]">
        <div>
          <p className="font-label text-xs tracking-[0.16em] text-primary">{SAMPLE_ISSUE.banner}</p>
          <h1 className="mt-3 font-display text-5xl leading-[0.95]">How Issue #1 prints</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">A 24-page digest comic, printed in full colour and saddle-stitched. The pages here belong to the sample issue, {SAMPLE_ISSUE.title}, drawn for a fictional reader. The sample isn’t sold; your own Issue #1 is written and drawn from your chart.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg"><Link to="/astrocomic?plan=single"><ShoppingBag />Order my own Issue #1 · {COMIC_PLANS.single.label}</Link></Button>
            <Button asChild variant="outline" size="lg"><Link to="/astrocomic#issue1-h">Read the sample<ArrowRight /></Link></Button>
          </div>
        </div>
        <img src={SAMPLE_ISSUE.cover} alt={SAMPLE_ISSUE.coverAlt} width={1024} height={1536} className="mx-auto w-full max-w-xs rounded-sm border-2 border-foreground/80 shadow-2xl" />
      </section>

      <section aria-labelledby="deliv-h" className="space-y-4">
        <h2 id="deliv-h" className="font-display text-3xl">From order to your door</h2>
        <p className="text-muted-foreground">Dates follow the monthly schedule at checkout. If anything slips we email you the new date.</p>
        <ol className="grid gap-4 md:grid-cols-5">{delivery.map(([t, d, n], i) => <li key={t} className="vellum p-4"><p className="font-label text-xs tracking-[0.16em] text-primary">{d}</p><h3 className="mt-1 text-lg">{t}</h3><p className="mt-1 text-sm text-muted-foreground">{n}</p></li>)}</ol>
      </section>

      <section aria-labelledby="formats-h">
        <h2 id="formats-h" className="font-display text-3xl">Sizes</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">{FORMATS.map(f => (
          <div key={f.name} className="vellum p-6">
            <h3 className="flex items-center gap-2 text-2xl"><Printer aria-hidden className="h-5 w-5 text-gold" />{f.name}</h3>
            <dl className="mt-4 divide-y divide-border text-sm">{([['Trim size', f.size], ['Pages', f.pages], ['Binding', f.binding], ['Print file', f.file]] as const).map(([k, v]) => <div key={k} className="grid grid-cols-[6.5rem_1fr] gap-3 py-2"><dt className="text-muted-foreground">{k}</dt><dd>{v}</dd></div>)}</dl>
          </div>
        ))}</div>
      </section>

      <section aria-labelledby="plan-h" className="grid gap-10 lg:grid-cols-2">
        <div>
          <h2 id="plan-h" className="font-display text-3xl">Page count: 24</h2>
          <p className="mt-2 text-muted-foreground">Saddle-stitched books are printed in multiples of four. Here is how the sample Issue #1 fills its 24 pages; yours follows the same map.</p>
          <ol className="mt-6 divide-y divide-border border-y border-border">{PLAN.map(([n, t, done]) => <li key={n} className="grid grid-cols-[4.5rem_1fr_auto] gap-3 py-2.5 text-sm"><span className="text-gold">p. {n}</span><span>{t}</span><span className={done === 'Drawn' ? 'text-gold' : 'text-muted-foreground'}>{done}</span></li>)}</ol>
        </div>
        <div>
          <h2 className="font-display text-3xl">Print specification</h2>
          <dl className="mt-6 divide-y divide-border border-y border-border text-sm">{COMIC_SPEC.map(([k, v]) => <div key={k} className="grid grid-cols-[7rem_1fr] gap-3 py-2.5"><dt className="text-muted-foreground">{k}</dt><dd>{v}</dd></div>)}</dl>
          <p className="mt-4 text-sm text-muted-foreground">Printed and shipped within the US. Colors are proofed in CMYK, so the printed copy is slightly warmer than what you see on screen.</p>
        </div>
      </section>
    </article>
  );
}
