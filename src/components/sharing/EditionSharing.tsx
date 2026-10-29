import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Share2, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import type { Edition } from '@/lib/protectedContent';
import { revokeShare, shareEdition, useMyEditionShares, useShareTargets, validShareEmail, type EditionShare } from '@/lib/editionSharing';

const who = (s: Pick<EditionShare, 'recipient_name' | 'recipient_email'>) => s.recipient_name || s.recipient_email;

/** Pick a person: one tap for the other edition owners, or type any email. */
function RecipientPicker({ busy, onPick, exclude }: { busy: boolean; onPick: (email: string) => void; exclude: string[] }) {
  const targets = useShareTargets(true).filter(t => !exclude.includes(t.email.toLowerCase()));
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validShareEmail(email)) { setErr('Enter a full email address, like name@example.com.'); return; }
    setErr(''); onPick(email); setEmail('');
  };
  return (
    <div className="space-y-3">
      {targets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {targets.map(t => (
            <Button key={t.email} type="button" size="sm" variant="outline" disabled={busy} onClick={() => onPick(t.email)}>
              <UserPlus className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />{t.display_name}
            </Button>
          ))}
        </div>
      )}
      <form onSubmit={submit} className="flex flex-wrap items-start gap-2" noValidate>
        <div className="min-w-[14rem] flex-1">
          <Label htmlFor="share-email" className="sr-only">Email address</Label>
          <Input id="share-email" type="email" inputMode="email" autoComplete="email" placeholder="Or type an email address" value={email} onChange={e => { setEmail(e.target.value); setErr(''); }} aria-invalid={!!err} aria-describedby={err ? 'share-email-error' : undefined} />
          {err && <p id="share-email-error" className="mt-1 text-xs text-destructive">{err}</p>}
        </div>
        <Button type="submit" disabled={busy || !email.trim()}>{busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" /> : null}Share</Button>
      </form>
      <p className="text-xs text-muted-foreground">They’ll see it under “Shared with me” after signing in with that email. You can stop sharing at any time.</p>
    </div>
  );
}

/** Owner panel on an edition's home: who can read the whole book, which single chapters are shared, and controls to change it. */
export function EditionSharingPanel({ edition, ownerName }: { edition: Edition; ownerName: string }) {
  const { shares, error } = useMyEditionShares(edition, true);
  const [busy, setBusy] = useState(false);
  const whole = (shares ?? []).filter(s => s.scope === 'edition');
  const chapters = (shares ?? []).filter(s => s.scope === 'chapter');
  const run = async (fn: () => Promise<void>, done: string) => {
    setBusy(true);
    try { await fn(); toast({ title: done }); } catch (e) { toast({ title: 'Not saved', description: (e as Error).message, variant: 'destructive' }); } finally { setBusy(false); }
  };
  return (
    <section aria-labelledby={`share-${edition}`} className="glass-card space-y-5 p-5 sm:p-6">
      <div>
        <h2 id={`share-${edition}`} className="flex items-center gap-2 text-2xl"><Share2 className="h-5 w-5 text-gold" aria-hidden="true" />Who can read your edition</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {ownerName === 'You' ? 'Your' : `${ownerName}’s`} Masterbook is private to your account. Share the whole book with someone, or share single chapters from any chapter page.
        </p>
      </div>
      {shares === null ? <p role="status" className="text-sm text-muted-foreground">Loading who has access…</p> : (
        <>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div>
            <h3 className="font-smallcaps text-xs text-gold">The whole edition</h3>
            {whole.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">Only you can read it.</p> : (
              <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
                {whole.map(s => (
                  <li key={s.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                    <span className="min-w-0"><span className="block truncate font-medium">{who(s)}</span>{s.recipient_name && <span className="block truncate text-xs text-muted-foreground">{s.recipient_email}</span>}</span>
                    <Button size="sm" variant="ghost" disabled={busy} onClick={() => run(() => revokeShare(s.id), `${who(s)} can no longer read your edition`)} aria-label={`Stop sharing with ${who(s)}`}><X className="mr-1 h-3.5 w-3.5" aria-hidden="true" />Stop sharing</Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <RecipientPicker busy={busy} exclude={whole.map(s => s.recipient_email)} onPick={email => run(() => shareEdition(edition, email), 'Edition shared')} />
          {chapters.length > 0 && (
            <div>
              <h3 className="font-smallcaps text-xs text-gold">Single chapters you’ve shared</h3>
              <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
                {chapters.map(s => (
                  <li key={s.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                    <span className="min-w-0"><Link to={`/${edition === 'april' ? 'masterbook' : edition}/${s.chapter_id}`} className="block truncate font-medium hover:underline">{s.chapter_title || s.chapter_id}</Link><span className="block truncate text-xs text-muted-foreground">with {who(s)}</span></span>
                    <Button size="sm" variant="ghost" disabled={busy} onClick={() => run(() => revokeShare(s.id), 'Chapter no longer shared')} aria-label={`Stop sharing ${s.chapter_title || 'this chapter'} with ${who(s)}`}><X className="mr-1 h-3.5 w-3.5" aria-hidden="true" />Stop</Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}

/** Owner-only button on a chapter page: share just this chapter with someone, and see who already has it. */
export function ShareChapterButton({ edition, chapter }: { edition: Edition; chapter: { id: string; title: string } }) {
  const [open, setOpen] = useState(false);
  const { shares } = useMyEditionShares(edition, open);
  const [busy, setBusy] = useState(false);
  const here = (shares ?? []).filter(s => s.scope === 'chapter' && s.chapter_id === chapter.id);
  const wholeBook = (shares ?? []).filter(s => s.scope === 'edition');
  const run = async (fn: () => Promise<void>, done: string) => {
    setBusy(true);
    try { await fn(); toast({ title: done }); } catch (e) { toast({ title: 'Not saved', description: (e as Error).message, variant: 'destructive' }); } finally { setBusy(false); }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Share2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />Share this chapter</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Share “{chapter.title}”</DialogTitle>
          <DialogDescription>Only this chapter opens for the person you choose; the rest of your edition stays private.</DialogDescription>
        </DialogHeader>
        {shares === null ? <p role="status" className="text-sm text-muted-foreground">Loading…</p> : (
          <div className="space-y-4">
            {here.length > 0 && (
              <ul className="divide-y divide-border rounded-lg border border-border">
                {here.map(s => (
                  <li key={s.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                    <span className="truncate">{who(s)}</span>
                    <Button size="sm" variant="ghost" disabled={busy} onClick={() => run(() => revokeShare(s.id), `${who(s)} can no longer open this chapter`)}>Stop sharing</Button>
                  </li>
                ))}
              </ul>
            )}
            {wholeBook.length > 0 && <p className="text-xs text-muted-foreground">Already reading your whole edition: {wholeBook.map(who).join(', ')}.</p>}
            <RecipientPicker busy={busy} exclude={[...here, ...wholeBook].map(s => s.recipient_email)} onPick={email => run(() => shareEdition(edition, email, chapter), 'Chapter shared')} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Small attribution shown to someone reading a chapter or edition that was shared with them. */
export function SharedByNote({ ownerName, scope }: { ownerName: string; scope: 'edition' | 'chapter' }) {
  return (
    <p className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-card/60 px-3 py-1 text-xs text-gold">
      <Share2 className="h-3 w-3" aria-hidden="true" />
      {scope === 'chapter' ? `Chapter shared with you by ${ownerName}` : `Shared with you by ${ownerName}`}
    </p>
  );
}
