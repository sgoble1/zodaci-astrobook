import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePageMeta } from '@/hooks/usePageMeta';
import { SampleBook } from '@/components/books/SampleBookReader';
import { BOOK_VERSIONS, EXTRA_SECTION_PRICE, money } from '@/lib/books';

/** Public preview page: read a full sample AstroBook as a PDF before ordering. */
export default function BookPreview() {
  usePageMeta('AstroBook sample — read before you order | Zodaci', 'Explore a short fictional AstroBook PDF sample with calculated chart facts and illustrative passages before ordering.');
  return (
    <article className="space-y-10">
      <header className="space-y-4 text-center">
        <p className="text-xs font-medium tracking-[0.12em] text-accent">READ BEFORE YOU ORDER</p>
        <h1 className="font-display text-4xl sm:text-5xl">See inside an AstroBook.</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">Explore a short fictional sample with calculated birth-chart facts and illustrative passages. Your own book uses your saved chart and finished readings; review its actual contents and page count before payment.</p>
      </header>
      <SampleBook />
      <section className="rounded-xl border border-primary/30 bg-primary/10 p-8 text-center space-y-4">
        <h2 className="font-display text-2xl">Ready for your own?</h2>
        <ul aria-label="AstroBook versions and prices" className="mx-auto flex max-w-2xl flex-wrap justify-center gap-x-4 gap-y-1 text-sm">{BOOK_VERSIONS.map(v => <li key={v.id}><span className="text-foreground">{v.name}</span> <span className="text-muted-foreground">{money(v.price)}</span></li>)}</ul>
        <p className="mx-auto max-w-xl text-sm text-muted-foreground">Optional extra sections {money(EXTRA_SECTION_PRICE)} each; any tax is calculated at checkout. Printed versions ship free within the US.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild size="lg"><Link to="/astrobook">See editions and order<ArrowRight /></Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/auth?next=/books">Get started</Link></Button>
        </div>
      </section>
    </article>
  );
}
