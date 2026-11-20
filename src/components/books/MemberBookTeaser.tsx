import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PreviewFeedback } from '@/components/books/PreviewFeedback';
import { GIFT_MESSAGE_MAX, readDedicationDraft, saveDedicationDraft } from '@/lib/bookGift';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from '@/hooks/useLibrary';
import { useMyBirthState } from '@/lib/myBirth';
import { OpenAstroBook } from '@/components/books/OpenAstroBook';
import { BOOK_VERSIONS, type Edition } from '@/lib/books';

const PRINTED = BOOK_VERSIONS.filter(v => v.format === 'print');


/** A 28-page calculated preview from the signed-in member's saved chart. No AI. */
export function MemberBookTeaser({ fallback }: { fallback: React.ReactNode }) {
  const session = useSession();
  const signedIn = Boolean(session);
  const { birth, error, retry } = useMyBirthState();
  const [note, setNote] = useState(readDedicationDraft);
  const [ed, setEd] = useState<Edition>('classic');
  const [sample, setSample] = useState(false);
  if (error) return <PreviewFeedback error onRetry={retry} />;
  if (birth === undefined) return <PreviewFeedback loadingMessage="Loading your saved birth details…" />;
  if (!signedIn) return <>{fallback}</>;
  if (!birth) return <div className="space-y-3"><p className="text-muted-foreground">Add your birth details to open the 28-page preview of your own AstroBook here.</p><Button asChild><Link to="/start?next=/astrobook%23teaser">Add my birth details<ArrowRight /></Link></Button></div>;
  return <div className="space-y-8"><div className="space-y-3"><h2 className="font-display text-3xl">{sample ? 'The fictional sample AstroBook.' : 'Your AstroBook, open to read.'}</h2><p className="max-w-2xl text-muted-foreground">28 numbered pages from {sample ? 'the fictional reader’s' : 'your saved'} chart. Choose a format and try a dedication; both update this book.</p></div>
    <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="AstroBook reader"><Button size="sm" role="radio" aria-checked={!sample} variant={!sample ? 'default' : 'outline'} onClick={() => setSample(false)}>My saved chart</Button><Button size="sm" role="radio" aria-checked={sample} variant={sample ? 'default' : 'outline'} onClick={() => setSample(true)}>Fictional sample</Button></div>
    <div role="radiogroup" aria-label="Book size" className="flex flex-wrap gap-2">{PRINTED.map(x => <Button key={x.id} variant={x.id === ed ? 'default' : 'outline'} size="sm" type="button" role="radio" aria-checked={x.id === ed} onClick={() => setEd(x.id)}>{x.name}</Button>)}</div>
    <OpenAstroBook next="/astrobook#teaser" startMine previewBirth={sample ? null : birth} edition={ed} dedication={note.trim() || undefined} layout="side" />
    <section aria-labelledby="dedication-h" className="max-w-2xl border-t border-border pt-6">
      <div className="space-y-3"><h3 id="dedication-h" className="font-display text-2xl">Giving it as a gift?</h3><p className="text-sm text-muted-foreground">A printed gift adds a dedication page after the title page. Try yours here; your draft is kept on this device and carried to the order form.</p>
        <Textarea aria-label="Dedication note" maxLength={GIFT_MESSAGE_MAX} rows={3} value={note} onChange={e => { setNote(e.target.value); saveDedicationDraft(e.target.value); }} placeholder="For you, under the same sky." />
        <p className="text-xs text-muted-foreground">{note.length}/{GIFT_MESSAGE_MAX} characters{note.trim() ? ' · carried to the order form when you continue' : ''}</p>{note.trim() && <Button asChild variant="outline" size="sm"><Link to="/books#book-for">Order it as a gift<ArrowRight /></Link></Button>}</div>
    </section>
    <p className="text-sm text-muted-foreground">These pages are calculated from your saved chart. The full book continues with every planet, aspect and house across six volumes. For a gift, add the recipient's birth details when you order and the book is written from their chart.</p>
    <Button asChild><Link to="/books">Continue in the book<ArrowRight /></Link></Button>
  </div>;
}
