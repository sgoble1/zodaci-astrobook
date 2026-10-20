import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';

type Source = 'welcome' | 'sky-notes' | 'pricing' | 'astrobook-teaser' | 'astrocomic';

/** Email capture. Weekly Sky Notes is the public homepage variant; every variant needs explicit consent. */
export function NewsletterSignup({ source = 'welcome', button = 'Keep me in the loop', consentLabel }: { source?: Source; button?: string; consentLabel?: string }) {
  const [email, setEmail] = useState(''); const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(''); const [state, setState] = useState<'idle'|'busy'|'done'>('idle');
  const [error, setError] = useState('');
  const skyNotes = source === 'sky-notes';
  return <form className="max-w-xl space-y-4" onSubmit={async e => {
    e.preventDefault(); setError('');
    if (!z.string().trim().email().max(254).safeParse(email).success || !consent) { setError('Enter a valid email and tick the box to agree.'); return; }
    setState('busy');
    try {
      const { data, error: failure } = await supabase.functions.invoke('brand-newsletter', { body: { email: email.trim(), consent, website, source } });
      if (failure || !data?.ok) throw new Error(data?.error || 'Signup could not be saved. Please try again.');
      setState('done'); setEmail('');
    } catch (err) { setError(err instanceof Error ? err.message : 'Please try again.'); setState('idle'); }
  }}>
    {state === 'done' ? <p role="status" className="flex items-center gap-2 text-accent"><Check />{skyNotes ? 'You’re on the interest list. We’ll email when Sky Notes launches.' : 'You’re on the Zodaci update list.'}</p> : <>
      <label htmlFor={`brand-email-${source}`} className="text-sm">Email address</label>
      <div className="flex flex-col sm:flex-row gap-3"><Input id={`brand-email-${source}`} type="email" autoComplete="email" maxLength={254} required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="h-12" /><Button type="submit" size="lg" disabled={state === 'busy' || !consent}>{state === 'busy' ? 'Saving…' : button}<ArrowRight /></Button></div>
      <div className="hidden" aria-hidden="true"><label htmlFor={`brand-website-${source}`}>Website</label><input id={`brand-website-${source}`} tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} /></div>
      <label className="flex items-start gap-3 text-sm text-muted-foreground"><Checkbox checked={consent} onCheckedChange={v => setConsent(v === true)} className="mt-0.5" />{consentLabel ?? (skyNotes ? 'Email me when Sky Notes launches, and send me future notes.' : 'I agree to receive Zodaci launch news, new readings and product updates by email.')}</label>
      {skyNotes
        ? <p className="text-xs text-muted-foreground">By signing up you agree to our <Link to="/privacy" className="underline underline-offset-2">Privacy Policy</Link>. Unsubscribe anytime.</p>
        : <p className="text-xs text-muted-foreground">Optional. Your email is kept private and is not shared with workspace members. No account is created.</p>}
    </>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </form>;
}
