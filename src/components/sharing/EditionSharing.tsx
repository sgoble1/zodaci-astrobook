import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Share2, UserPlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { Edition } from '@/lib/protectedContent';
import { ownChapterHref, revokeShare, shareEdition, useMyEditionShares, useShareTargets, validShareEmail } from '@/lib/editionSharing';

/** Pick a person: one tap for the other edition owners, or type any email address. */
function RecipientPicker({ edition, busy, onPick, exclude, idPrefix }: { edition: Edition; busy: boolean; onPick: (target: string) => void; exclude: string[]; idPrefix: string }) {
  const targets = useShareTargets(edition, true).filter(t => !exclude.includes(t.target));
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validShareEmail(email)) { setErr('Enter a full email address, like name@example.com.'); return; }
    setErr(''); onPick(email); setEmail('');
  };
  const inputId = `${idPrefix}-email`;
  return (
    <div className="space-y-3">
      {targets.length > 0 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Share with">
          {targets.map(t => (
            <Button key={t.target} type="button" size="sm" variant="outline" disabled={busy} onClick={() => onPick(t.target)}>
              <UserPlus className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />Share with {t.display_name}
            </Button>
          ))}
        </div>
      )}
      <form onSubmit={submit} className="flex flex-wrap items-start gap-2" noValidate>
        <div className="min-w-[14rem] flex-1">
          <Label htmlFor={inputId} className="sr-only">Email address to share with</Label>
          <Input id={inputId} type="email" inputMode="email" autoComplete="off" placeholder="Or type someone’s email" value={email} onChange={e => { setEmail(e.target.value); setErr(''); }} aria-invalid={!!err} aria-describedby={err ? `${inputId}-error` : undefined} />
          {err && <p id={`${inputId}-error`} className="mt-1 text-xs text-destructive">{err}</p>}
        </div>
        <Button type="submit" disabled={busy || !email.trim()}>{busy && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />}Share</Button>
      </form>
      <p className="text-xs text-muted-foreground">They’ll find it under “Shared with me” after signing in with that email. You can stop sharing at any time.</p>
    </div>
  );
}

function useRun() {
  const [busy, setBusy] = useState(false);
  const run = async (fn: () => Promise<void>, done: string) => {
    setBusy(true);
    try { await fn(); toast.success(done); } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };
  return { busy, run };
}

/** Owner panel on an edition's home: who can read the whole book, which chapters are shared, and controls to change it. */
export function EditionSharingPanel({ edition }: { edition: Edition }) {
  const { shares, error } = useMyEditionShares(edition, true);
  const { busy, run } = useRun();
  const whole = (shares ?? []).filter(s => s.scope === 'edition');
  const chapters = (shares ?? []).filter(s => s.scope === 'chapter');
  return (
    <section aria-labelledby={`share-${edition}`} className="glass-card space-y-5 p-5 sm:p-6">
      <div>
        <h2 id={`share-${edition}`} className="flex items-center gap-2 text-2xl"><Share2 className="h-5 w-5 text-gold" aria-hidden="true" />Who can read your Masterbook</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Your Masterbook is private to your account. Share the whole book with someone here, or share a single chapter from that chapter’s page.</p>
      </div>
      {shares === null ? <p role="status" className="text-sm text-muted-foreground">Loading who has access…</p> : (
        <>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div>
            <h3 className="font-smallcaps text-xs text-gold">The whole book</h3>
            {whole.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">Only you can read it.</p> : (
              <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
                {whole.map(s => (
                  <li key={s.key} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                    <span className="min-w-0 truncate font-medium">{s.recipient_label}</span>
                    <Button size="sm" variant="ghost" disabled={busy} onClick={() => run(() => revokeShare(s.ids), `${s.recipient_label} can no longer read your Masterbook`)} aria-label={`Stop sharing your Masterbook with ${s.recipient_label}`}><X className="mr-1 h-3.5 w-3.5" aria-hidden="true" />Stop sharing</Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <RecipientPicker idPrefix={`edition-${edition}`} edition={edition} busy={busy} exclude={whole.map(s => s.recipient)} onPick={t => run(() => shareEdition(edition, t), 'Masterbook shared')} />
          {chapters.length > 0 && (
            <div>
              <h3 className="font-smallcaps text-xs text-gold">Single chapters you’ve shared</h3>
              <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
                {chapters.map(s => (
                  <li key={s.key} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                    <span className="min-w-0">
                      {s.chapter_id ? <Link to={ownChapterHref(edition, s.chapter_id)} className="block truncate font-medium hover:underline">{s.chapter_title || 'Chapter'}</Link> : <span className="block truncate font-medium">{s.chapter_title || 'Chapter'}</span>}
                      <span className="block truncate text-xs text-muted-foreground">with {s.recipient_label}</span>
                    </span>
                    <Button size="sm" variant="ghost" disabled={busy} onClick={() => run(() => revokeShare(s.ids), 'Chapter no longer shared')} aria-label={`Stop sharing ${s.chapter_title || 'this chapter'} with ${s.recipient_label}`}><X className="mr-1 h-3.5 w-3.5" aria-hidden="true" />Stop</Button>
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

/** Owner-only button on a chapter page: share just this chapter, and see who already has it. */
export function ShareChapterButton({ edition, chapter }: { edition: Edition; chapter: { id: string; title: string } }) {
  const [open, setOpen] = useState(false);
  const { shares } = useMyEditionShares(edition, open);
  const { busy, run } = useRun();
  const here = (shares ?? []).filter(s => s.scope === 'chapter' && s.chapter_id === chapter.id);
  const wholeBook = (shares ?? []).filter(s => s.scope === 'edition');
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Share2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />Share this chapter</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Share “{chapter.title}”</DialogTitle>
          <DialogDescription>Only this chapter opens for the person you choose; the rest of your Masterbook stays private.</DialogDescription>
        </DialogHeader>
        {shares === null ? <p role="status" className="text-sm text-muted-foreground">Loading…</p> : (
          <div className="space-y-4">
            {here.length > 0 && (
              <ul className="divide-y divide-border rounded-lg border border-border" aria-label="People who can open this chapter">
                {here.map(s => (
                  <li key={s.key} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                    <span className="truncate">{s.recipient_label}</span>
                    <Button size="sm" variant="ghost" disabled={busy} onClick={() => run(() => revokeShare(s.ids), `${s.recipient_label} can no longer open this chapter`)}>Stop sharing</Button>
                  </li>
                ))}
              </ul>
            )}
            {wholeBook.length > 0 && <p className="text-xs text-muted-foreground">Already reading your whole Masterbook: {wholeBook.map(s => s.recipient_label).join(', ')}.</p>}
            <RecipientPicker idPrefix={`chapter-${chapter.id}`} edition={edition} busy={busy} exclude={[...here, ...wholeBook].map(s => s.recipient)} onPick={t => run(() => shareEdition(edition, t, chapter), 'Chapter shared')} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Attribution shown to someone reading an edition or chapter that was shared with them. */
export function SharedByNote({ ownerName, scope }: { ownerName: string; scope: 'edition' | 'chapter' }) {
  return (
    <p className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-card/60 px-3 py-1 text-xs text-gold">
      <Share2 className="h-3 w-3" aria-hidden="true" />
      {scope === 'chapter' ? `Chapter shared with you by ${ownerName}` : `Shared with you by ${ownerName}`}
    </p>
  );
}
