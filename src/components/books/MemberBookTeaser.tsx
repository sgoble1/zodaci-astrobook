import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { GIFT_MESSAGE_MAX, readDedicationDraft, saveDedicationDraft } from '@/lib/bookGift';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { computeChart } from '@/lib/astro';
import { useMyBirth, toChartInput } from '@/lib/myBirth';
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
  const [note, setNote] = useState(readDedicationDraft);
  const ok = useMemo(() => {
    if (!birth) return false;
    try { computeChart(toChartInput(birth)); return true; } catch { return false; }
  }, [birth]);
  if (signedIn === null || (signedIn && birth === undefined)) return <Skeleton className="h-64 w-full" />;
  if (!signedIn) return <>{fallback}</>;
  if (!birth || !ok) return <div className="space-y-3"><p className="text-muted-foreground">Add your birth details and the first pages of your own AstroBook open here.</p><Button asChild><Link to="/start?next=/astrobook%23teaser">Add my birth details<ArrowRight /></Link></Button></div>;
  const spine = spineInches(BOOK_PAGES);
  return <div className="space-y-8"><h2 className="font-display text-3xl">Open your book.</h2>
    <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <OpenAstroBook next="/astrobook#teaser" startMine />
      <div className="space-y-3 text-center">
        <Book3D pages={BOOK_PAGES} name={birth.name || 'Your AstroBook'} />
        <p className="text-sm text-muted-foreground">6 × 9 in · about {BOOK_PAGES} pages · spine {spine.estimate ? 'about ' : ''}{spine.inches.toFixed(2)} in</p>
      </div>
    </div>
    <section aria-labelledby="dedication-h" className="grid items-center gap-6 md:grid-cols-2">
      <div className="space-y-3"><h3 id="dedication-h" className="font-display text-2xl">Giving it as a gift?</h3><p className="text-sm text-muted-foreground">A printed gift adds a dedication page after the title page. Try yours here; nothing is saved until you order.</p>
        <Textarea aria-label="Dedication note" maxLength={GIFT_MESSAGE_MAX} rows={3} value={note} onChange={e => { setNote(e.target.value); saveDedicationDraft(e.target.value); }} placeholder="For you, under the same sky." />
        <p className="text-xs text-muted-foreground">{note.length}/{GIFT_MESSAGE_MAX} characters{note.trim() ? ' · carried to the order form when you continue' : ''}</p>{note.trim() && <Button asChild variant="outline" size="sm"><Link to="/books#book-for">Order it as a gift<ArrowRight /></Link></Button>}</div>
      <figure className="obs-paper mx-auto flex aspect-[2/3] w-full max-w-[16rem] flex-col items-center justify-center p-6 text-center" aria-label="Dedication page preview">
        <p className="font-label text-xs tracking-[0.16em] text-muted-foreground">Dedication</p>
        <p className="mt-4 font-script text-2xl leading-snug text-primary break-words">{note.trim() || 'For you, under the same sky.'}</p>
      </figure>
    </section>
    <p className="text-sm text-muted-foreground">These pages are calculated from your saved chart. The full book continues with every planet, aspect and house across six volumes. For a gift, add the recipient's birth details when you order and the book is written from their chart.</p>
    <Button asChild><Link to="/books">Continue in the book<ArrowRight /></Link></Button>
  </div>;
}
