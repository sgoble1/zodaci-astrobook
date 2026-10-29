import { Link } from 'react-router-dom';
import { ArrowRight, Printer, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ISSUE_1 } from '@/content/comicIssue1';
import { COMIC_SPEC } from '@/lib/comic';

/** Print formats for Issue 1. Trim/bleed match comicPrint.ts (5.5 × 8.5 in digest, 0.125 in bleed, 0.25 in safe zone). */
const FORMATS = [
  { name: 'Digest comic', size: '5.5 × 8.5 in (140 × 216 mm)', pages: '24 pages incl. covers', binding: 'Saddle-stitched', file: '5.75 × 8.75 in with bleed · 1725 × 2625 px at 300 DPI' },
  { name: 'Cover art print', size: '11 × 17 in (279 × 432 mm)', pages: 'Single sheet', binding: 'Unbound, matte poster stock', file: '11.25 × 17.25 in with bleed · 3375 × 5175 px at 300 DPI' },
];

/** Issue 1 page plan: cover drawn, three acts scripted with one finished illustration each; the rest follow the standard 24-page issue map. */
const PLAN: [string, string, 'Drawn' | 'Scripted' | 'Planned'][] = [
  ['1', 'Cover — The Alchemist of the Mill Valley', 'Drawn'],
  ['2–3', 'Act I · The Lantern at the Gate (Leo Rising)', 'Scripted'],
  ['4–7', 'Act II · The Cardinal Spark (Sun in Aries)', 'Scripted'],
  ['8–10', 'Act III · The Steady Hearth (Moon in Taurus)', 'Scripted'],
  ['11–21', 'Retrograde Watch, Lunar Calendar, House Focus, Reflection Prompts, Constellation', 'Planned'],
  ['22', 'Next issue: The Starry Compass', 'Planned'],
  ['23–24', 'About Zodaci · Back cover', 'Planned'],
];

export default function ComicIssuePrint() {
  usePageMeta(`Print AstroComic Issue #${ISSUE_1.issueNumber} — ${ISSUE_1.title} | Zodaci`, 'Sizes, page count and print specifications for AstroComic Issue 1, The Alchemist of the Mill Valley, with a link to order a printed copy.');
  return (
    <article className="space-y-16">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground"><Link to="/astrocomic" className="underline underline-offset-4">AstroComic</Link> / Print Issue #1</nav>
      <section className="grid items-center gap-10 lg:grid-cols-[1fr_340px]">
        <div>
          <p className="font-smallcaps text-xs text-gold">{ISSUE_1.banner}</p>
          <h1 className="mt-3 font-display text-5xl leading-[0.95]">Print Issue #1:<br />{ISSUE_1.title}</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">A 24-page digest comic in the Lantern &amp; Ink style, printed in full color and saddle-stitched. Choose a format below, then order it from the shop.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg"><Link to="/product/astrocomic-issue-1-the-alchemist-of-williamsville"><ShoppingBag />Order a printed copy · $18.99</Link></Button>
            <Button asChild variant="outline" size="lg"><Link to="/astrocomic">Read the preview<ArrowRight /></Link></Button>
          </div>
        </div>
        <img src={ISSUE_1.cover} alt={ISSUE_1.coverAlt} width={1024} height={1536} className="mx-auto w-full max-w-xs rounded-sm border-2 border-foreground/80 shadow-2xl" />
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
          <p className="mt-2 text-muted-foreground">Saddle-stitched books are printed in multiples of four. Here is how Issue #1 fills its 24 pages.</p>
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
