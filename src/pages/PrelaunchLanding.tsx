import { useEffect, useState } from 'react';
import { BookOpen, KeyRound, Lock, Orbit, Telescope, Moon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ZodaciMark } from '@/components/brand/ZodaciMark';
import { grantDeviceAccess } from '@/lib/prelaunch';
import art from '@/assets/prelaunch/couple-observatory.jpg';

const FEATURES = [
  { icon: Telescope, title: 'Your birth chart', body: 'Worked out from the real sky at your birth, with the time zone rules of that day.' },
  { icon: BookOpen, title: 'The AstroBook', body: 'Your chart as a printed book, from a digital edition to a linen hardcover.' },
  { icon: Orbit, title: 'The AstroComic', body: 'A monthly 1950s-style comic built from the planets moving through your chart.' },
  { icon: Moon, title: 'Dream journal', body: 'Log a dream and see what the sky was doing that night.' },
];

/** Pre-launch landing: collects launch emails (double opt-in) and holds the hidden passcode entry. */
export default function PrelaunchLanding({ onUnlock, openAccess = false }: { onUnlock: () => void; openAccess?: boolean }) {
  const [email, setEmail] = useState(''); const [consent, setConsent] = useState(false);
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle'); const [msg, setMsg] = useState('');
  const [access, setAccess] = useState(openAccess); const [code, setCode] = useState(''); const [codeErr, setCodeErr] = useState(''); const [checking, setChecking] = useState(false);

  useEffect(() => {
    document.title = 'Zodaci — Opening soon';
    const onKey = (e: KeyboardEvent) => { if (e.shiftKey && e.key.toLowerCase() === 'p' && !(e.target instanceof HTMLInputElement)) setAccess(true); };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg('');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setState('error'); setMsg('Enter a full email address, like name@example.com.'); return; }
    if (!consent) { setState('error'); setMsg('Tick the box so we can email you.'); return; }
    setState('sending');
    const { data, error } = await supabase.functions.invoke('brand-newsletter', { body: { email: email.trim(), consent: true, source: 'prelaunch', path: '/' } });
    if (error || data?.error) { setState('error'); setMsg(data?.error ?? 'We could not save your email. Please try again.'); return; }
    setState('done');
    setMsg(data?.existing ? 'You are already on the list.' : 'Check your inbox and click the link to confirm.');
  };

  const unlock = async (e: React.FormEvent) => {
    e.preventDefault(); setCodeErr(''); setChecking(true);
    const { data, error } = await supabase.functions.invoke('brand-newsletter', { body: { action: 'prelaunch-access', code } });
    setChecking(false);
    if (error || !data?.ok) { setCodeErr('That code is not right. Check it and try again.'); return; }
    grantDeviceAccess(); setAccess(false); onUnlock();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-6 sm:px-10">
        <header className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-primary">
            <ZodaciMark className="h-11 w-11 sm:h-14 sm:w-14" />
            <div className="leading-none"><p className="font-display text-3xl uppercase text-foreground sm:text-4xl">Zodaci</p><p className="font-label text-sm tracking-wide text-primary">Astral Research Authority</p></div>
          </div>
          <div className="ml-6 hidden h-px flex-1 bg-primary/70 md:block" aria-hidden />
          <p className="hidden font-label text-base tracking-wide text-foreground lg:block">Same skies. Brighter answers.</p>
        </header>

        <main id="main" className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[1fr_1.05fr]">
          <section className="relative z-10 order-2 lg:order-1">
            <p className="font-label text-xl tracking-wide text-primary">A new chapter is coming</p>
            <h1 className="mt-2 font-display text-4xl uppercase leading-[1.02] sm:text-6xl">Same skies.<br /><span className="text-primary">A brighter home.</span></h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed">We are finishing the new Zodaci. Your chart is worked out from the real sky, and it can become a printed book, a monthly comic and a dream journal.</p>
            <p className="mt-4 font-script text-2xl text-primary">Be the first to know when we open.</p>

            {state === 'done' ? (
              <div role="status" className="mt-6 max-w-xl border-2 border-primary bg-foreground p-5 text-background">
                <p className="font-label text-xl tracking-wide">You're on the list</p>
                <p className="mt-1">{msg}</p>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="mt-6 max-w-xl">
                <Label htmlFor="pl-email" className="sr-only">Email address</Label>
                <div className="flex flex-col border-2 border-primary/80 sm:flex-row">
                  <Input id="pl-email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address" aria-invalid={state === 'error'} aria-describedby="pl-msg" className="h-14 rounded-none border-0 bg-foreground text-lg text-background placeholder:text-background/60 focus-visible:ring-offset-0" />
                  <Button type="submit" disabled={state === 'sending'} className="h-14 rounded-none bg-accent px-8 font-label text-2xl tracking-wide text-accent-foreground hover:bg-accent/90">{state === 'sending' ? 'Sending…' : 'Keep me posted'}</Button>
                </div>
                <label className="mt-3 flex items-start gap-2 text-sm">
                  <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-primary" />
                  <span>Email me when Zodaci opens and with occasional product news. I can unsubscribe at any time.</span>
                </label>
                <p id="pl-msg" role={state === 'error' ? 'alert' : undefined} className="mt-2 min-h-5 text-sm text-accent">{state === 'error' ? msg : ''}</p>
                <p className="flex items-center gap-2 text-sm text-muted-foreground"><Lock className="h-4 w-4 text-primary" aria-hidden /> Launch news only. We never share or sell your address.</p>
              </form>
            )}
          </section>

          <div className="relative order-1 -mx-5 sm:mx-0 lg:order-2">
            <img src={art} alt="A man and a woman in 1950s clothes look up at Saturn and a rocket above a hilltop observatory" width={1536} height={1152} className="w-full [mask-image:linear-gradient(to_bottom,black_80%,transparent)]" />
          </div>
        </main>

        <section aria-label="What's coming" className="grid grid-cols-1 gap-6 border-t border-primary/50 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {FEATURES.map((f, i) => (
            <div key={f.title} className={`text-center lg:px-6 ${i > 0 ? 'lg:border-l lg:border-primary/50' : ''}`}>
              <f.icon className="mx-auto h-12 w-12 text-primary" strokeWidth={1.4} aria-hidden />
              <h2 className="mt-3 font-label text-2xl tracking-wide">{f.title}</h2>
              <p className="mx-auto mt-1 max-w-xs text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </section>

        <footer className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-primary/50 pt-4 font-label text-sm tracking-wide">
          <span>Zodaci ★ Astral Research Authority</span>
          <a href="/privacy" className="underline-offset-4 hover:underline">Privacy Policy</a>
          <a href="/terms" className="underline-offset-4 hover:underline">Terms of Service</a>
          <span className="normal-case text-muted-foreground">Astrological insights provided for entertainment and self-reflection purposes only.</span>
          <button type="button" onClick={() => setAccess(true)} aria-label="Team access" className="ml-auto rounded p-1 text-muted-foreground/60 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"><KeyRound className="h-4 w-4" /></button>
        </footer>
      </div>

      <Dialog open={access} onOpenChange={setAccess}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display uppercase">Team access</DialogTitle><DialogDescription>Enter the access code to open the full site on this device.</DialogDescription></DialogHeader>
          <form onSubmit={unlock} className="space-y-3">
            <Label htmlFor="pl-code">Access code</Label>
            <Input id="pl-code" type="password" autoComplete="off" value={code} onChange={e => setCode(e.target.value)} aria-invalid={!!codeErr} aria-describedby="pl-code-err" />
            <p id="pl-code-err" role="alert" className="min-h-5 text-sm text-accent">{codeErr}</p>
            <Button type="submit" disabled={checking || !code} className="w-full">{checking ? 'Checking…' : 'Open the site'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
