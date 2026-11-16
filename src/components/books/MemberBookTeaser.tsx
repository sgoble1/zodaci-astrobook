import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { computeChart } from '@/lib/astro';
import { useMyBirth, toChartInput } from '@/lib/myBirth';
import { buildBookTeaser } from '@/lib/bookTeaser';
import { spineInches } from '@/lib/spine';
import { OpenAstroBook } from '@/components/books/OpenAstroBook';
import { Book3D } from '@/components/books/Book3D';

/** Page count shown on the preview spine (Classic 6 × 9 softcover). */
const BOOK_PAGES = 250;

/** Three calculated AstroBook pages (Sun, Moon, Rising) from the signed-in member's saved chart. No AI. */
export function MemberBookTeaser({ fallback }: { fallback: React.ReactNode }) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => { supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session)); }, []);
  const birth = useMyBirth();
  const pages = useMemo(() => {
    if (!birth) return null;
    try { return buildBookTeaser(computeChart(toChartInput(birth)), !!birth.time); } catch { return null; }
  }, [birth]);
  if (signedIn === null || (signedIn && birth === undefined)) return <Skeleton className="h-64 w-full" />;
  if (!signedIn) return <>{fallback}</>;
  if (!birth || !pages) return <div className="space-y-3"><p className="text-muted-foreground">Add your birth details and your first three AstroBook pages appear here.</p><Button asChild><Link to="/start?next=/astrobook%23teaser">Add my birth details<ArrowRight /></Link></Button></div>;
  const spine = spineInches(BOOK_PAGES);
  return <div className="space-y-8"><h2 className="font-display text-3xl">Open your book.</h2>
    <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <OpenAstroBook next="/astrobook#teaser" />
      <div className="space-y-3 text-center">
        <Book3D pages={BOOK_PAGES} name={birth.name || 'Your AstroBook'} />
        <p className="text-sm text-muted-foreground">6 × 9 in · about {BOOK_PAGES} pages · spine {spine.estimate ? 'about ' : ''}{spine.inches.toFixed(2)} in</p>
      </div>
    </div>
    <div className="space-y-4"><h3 className="font-display text-2xl">Your first three pages</h3>
    <ol className="grid gap-4 lg:grid-cols-3">{pages.map((p, i) => <li key={p.key} className="obs-paper flex flex-col p-5">
      <p className="font-label text-xs tracking-[0.16em] text-muted-foreground">Page {i + 1} of 3</p>
      <h4 className="mt-1 font-display text-2xl">{p.title}</h4>
      {p.position && <p className="text-sm text-muted-foreground">{p.position}</p>}
      <div className="mt-3 space-y-2 text-sm leading-relaxed">{p.body.map(t => <p key={t}>{t}</p>)}</div>
      {p.note && <p className="mt-3 text-xs text-muted-foreground">{p.note}</p>}
    </li>)}</ol></div>
    <p className="text-sm text-muted-foreground">These pages are calculated from your saved chart. The full book continues with every planet, aspect and house across six volumes. Giving it as a gift? Add the recipient's birth details and a dedication page when you order.</p>
    <Button asChild><Link to="/books">Continue in the book<ArrowRight /></Link></Button>
  </div>;
}
