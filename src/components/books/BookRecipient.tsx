import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Gift, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { PersonForm, EMPTY } from '@/components/relationships/PersonForm';
import { saveRelationship, type Relationship } from '@/hooks/useRelationships';
import { GIFT_MESSAGE_MAX, type BookFor } from '@/lib/bookGift';

const longDate = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

/** Chooses whether the book is about the buyer or about someone else (a gift written from the recipient's own chart). */
export function BookRecipient({ value, onChange, digital, people, loading, signedIn }: { value: BookFor; onChange: (v: BookFor) => void; digital: boolean; people: Relationship[]; loading: boolean; signedIn: boolean }) {
  const [adding, setAdding] = useState(false);
  const set = (patch: Partial<BookFor>) => onChange({ ...value, ...patch });
  const other = value.mode === 'other';
  const showNote = other || (!digital && value.giftForMe);
  const card = (on: boolean) => `flex flex-col rounded-lg border p-4 text-left transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${on ? 'border-gold bg-gold/10 ring-1 ring-gold/40' : 'border-border hover:border-primary/60'}`;
  return <section id="book-for" aria-labelledby="book-for-title" className="space-y-5">
    <div><h2 id="book-for-title" className="text-2xl">Who is this book about?</h2><p className="mt-2 text-sm text-muted-foreground">Every AstroBook is written from one person's birth chart. Choose yours, or give someone a book written from their own birth details.</p></div>
    <div role="radiogroup" aria-label="Who the book is about" className="grid gap-3 sm:grid-cols-2">
      <button type="button" role="radio" aria-checked={!other} onClick={() => set({ mode: 'me' })} className={card(!other)}><span className="flex items-center justify-between font-display text-lg">Me{!other && <Check className="h-4 w-4 text-gold" aria-hidden />}</span><span className="mt-1 text-sm text-muted-foreground">Written from your saved chart, with any readings you've finished woven in.</span></button>
      <button type="button" role="radio" aria-checked={other} onClick={() => set({ mode: 'other' })} className={card(other)}><span className="flex items-center justify-between font-display text-lg"><span className="flex items-center gap-2"><Gift className="h-4 w-4 text-gold" aria-hidden />Someone else, as a gift</span>{other && <Check className="h-4 w-4 text-gold" aria-hidden />}</span><span className="mt-1 text-sm text-muted-foreground">Written from their birth details only. Your readings and notes stay out of it.</span></button>
    </div>

    {other && <div className="space-y-4 rounded border border-border p-4">
      <h3 className="text-lg">Choose the person</h3>
      {!signedIn ? <p className="text-sm text-muted-foreground"><Link to="/auth?next=/books%23book-for" className="underline text-accent">Sign in</Link> to choose someone from your saved people.</p>
        : loading ? <Skeleton className="h-20 w-full" />
        : <>
          {people.length > 0 ? <div role="radiogroup" aria-label="Recipient" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{people.map(p => { const on = value.recipientId === p.id; return <button key={p.id} type="button" role="radio" aria-checked={on} onClick={() => set({ recipientId: p.id })} className={card(on)}>
            <span className="flex items-center justify-between">{p.name}{on && <Check className="h-4 w-4 text-gold" aria-hidden />}</span>
            <span className="mt-1 text-xs text-muted-foreground">{longDate(p.birth_date)} · {p.birth_time ? p.birth_time.slice(0, 5) : 'time unknown'} · {p.place_label}</span>
          </button>; })}</div> : <p className="text-sm text-muted-foreground">You haven't saved anyone yet. Add the person below.</p>}
          {adding ? <div className="space-y-2"><p className="text-xs text-muted-foreground">They're saved to your Relationships, visible only to you.</p><PersonForm initial={{ ...EMPTY, relation: 'Friend' }} submitLabel="Save and choose" onSave={async d => { const r = await saveRelationship(d); setAdding(false); set({ recipientId: r.id }); }} /><Button type="button" variant="ghost" size="sm" onClick={() => setAdding(false)}>Cancel</Button></div>
            : <Button type="button" variant="outline" onClick={() => setAdding(true)}><UserPlus />Add someone new</Button>}
          {people.find(p => p.id === value.recipientId && !p.birth_time) && <p className="text-xs text-muted-foreground">No birth time saved for them, so chapters that need one (houses, Rising sign) say so instead of guessing. You can add it in Relationships.</p>}
        </>}
    </div>}

    {!other && !digital && <label className="flex items-center gap-3 text-sm"><Checkbox checked={value.giftForMe} onCheckedChange={v => set({ giftForMe: v === true })} />Send my book to someone else as a gift, with a note</label>}

    {showNote && <div className="grid gap-4 rounded border border-border p-4 sm:grid-cols-2">
      <div className="sm:col-span-2"><Label htmlFor="gift-message">Gift note (optional, up to {GIFT_MESSAGE_MAX} characters)</Label><Textarea id="gift-message" maxLength={GIFT_MESSAGE_MAX} value={value.message} onChange={e => set({ message: e.target.value })} placeholder="Happy birthday. Here is the sky on the day you arrived." /><p className="mt-1 text-xs text-muted-foreground">Printed on its own page after the title page. {value.message.length}/{GIFT_MESSAGE_MAX}</p></div>
      <div><Label htmlFor="gift-from">Sign it as (optional)</Label><Input id="gift-from" maxLength={80} value={value.from} onChange={e => set({ from: e.target.value })} placeholder="Sam" /></div>
      {other && <div><Label htmlFor="gift-email">Their email (optional)</Label><Input id="gift-email" type="email" maxLength={254} autoComplete="off" value={value.email} onChange={e => set({ email: e.target.value })} placeholder="them@example.com" /><p className="mt-1 text-xs text-muted-foreground">After payment you choose when to send them a gift notice from My orders.{digital ? ' Signed in with this email, they can download the PDF themselves.' : ''}</p></div>}
    </div>}
  </section>;
}
