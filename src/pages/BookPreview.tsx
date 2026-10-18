import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePageMeta } from '@/hooks/usePageMeta';
import { SampleBook } from '@/components/books/SampleBookReader';

/** Public preview page: read a full sample AstroBook as a PDF before ordering. */
export default function BookPreview() {
  usePageMeta('AstroBook sample — read before you order | Zodaci', 'Read a full sample AstroBook PDF, written from a fictional reader’s chart, so you know exactly what your printed book will look like.');
  return (
    <article className="space-y-10">
      <header className="space-y-4 text-center">
        <p className="text-xs font-medium tracking-[0.12em] text-accent">READ BEFORE YOU ORDER</p>
        <h1 className="font-display text-4xl sm:text-5xl">See inside an AstroBook.</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">This is a complete sample book, composed live in your browser from a fictional reader's birth chart. Turn the pages to see the layout, the depth of the writing and the chart pages. Your own AstroBook is written the same way — from your exact birth details.</p>
      </header>
      <SampleBook />
      <section className="rounded-xl border border-primary/30 bg-primary/10 p-8 text-center space-y-4">
        <h2 className="font-display text-2xl">Ready for your own?</h2>
        <p className="mx-auto max-w-xl text-muted-foreground">Add your birth details, and your full AstroBook is written from your chart — then previewed as a real PDF before anything is printed. From $59 with free US shipping.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild size="lg"><Link to="/astrobook">See editions and order<ArrowRight /></Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/auth?next=/books">Get started</Link></Button>
        </div>
      </section>
    </article>
  );
}
