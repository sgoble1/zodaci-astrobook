import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePageMeta } from '@/hooks/usePageMeta';
import { SampleBook } from '@/components/books/SampleBookReader';
import { OpenAstroBook } from '@/components/books/OpenAstroBook';
import { BOOK_VERSIONS, EXTRA_SECTION_PRICE, money } from '@/lib/books';

/** Public preview page: read a full sample AstroBook as a PDF before ordering. */
export default function BookPreview() {
  usePageMeta('AstroBook sample — read before you order | Zodaci', 'Explore a short fictional AstroBook PDF sample with calculated chart facts and illustrative passages before ordering.');
  return (
    <article className="space-y-10">
      <header className="space-y-4 text-center">
        <p className="text-xs font-medium tracking-[0.12em] text-accent">READ BEFORE YOU ORDER</p>
        <h1 className="font-display text-4xl sm:text-5xl">See inside an AstroBook.</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">Read 28 pages of chart facts, personal reflections and clearly stated methods. The public sample is fictional; sign in to open the same preview from your saved birth details. Your final manuscript and page count are reviewed before payment.</p>
      </header>
      <section aria-labelledby="turn-h" className="space-y-4">
        <h2 id="turn-h" className="font-display text-2xl text-center">Turn the pages</h2>
        <div className="obs-paper p-4 sm:p-6"><OpenAstroBook next="/book-preview" /></div>
      </section>
      <section aria-labelledby="pdf-h" className="space-y-4">
        <h2 id="pdf-h" className="font-display text-2xl text-center">Read the sample PDF</h2>
        <SampleBook />
      </section>
      <section className="rounded-xl border border-primary/30 bg-primary/10 p-8 text-center space-y-4">
        <h2 className="font-display text-2xl">Ready for your own?</h2>
        <ul aria-label="AstroBook versions and prices" className="mx-auto flex max-w-2xl flex-wrap justify-center gap-x-4 gap-y-1 text-sm">{BOOK_VERSIONS.map(v => <li key={v.id}><span className="text-foreground">{v.name}</span> <span className="text-muted-foreground">{money(v.price)}</span></li>)}</ul>
        <p className="mx-auto max-w-xl text-sm text-muted-foreground">Optional extra sections {money(EXTRA_SECTION_PRICE)} each; any tax is calculated at checkout. Printed versions ship free within the US.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild size="lg"><Link to="/auth?next=%2Fbooks">Start my AstroBook<ArrowRight /></Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/astrobook#versions">Compare the five versions</Link></Button>
        </div>
      </section>
    </article>
  );
}
