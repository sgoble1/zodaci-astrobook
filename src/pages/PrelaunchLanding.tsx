import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, KeyRound, Lock, Orbit, Telescope, Moon, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ZodaciMark } from '@/components/brand/ZodaciMark';
import { grantDeviceAccess } from '@/lib/prelaunch';
import { functionErrorMessage } from '@/lib/functionError';
import art from '@/assets/prelaunch/couple-observatory.jpg';
import cosmos from '@/assets/voyager/home-cosmos.png.asset.json';
import './VoyagerHome.css';

const FEATURES = [
  { icon: Telescope, title: 'Your birth chart', body: 'Calculated degrees, rulers and aspects, with historical time zones and public Swiss Ephemeris benchmark checks.' },
  { icon: BookOpen, title: 'The AstroBook', body: 'Six volumes of chart-specific writing, engraved plates and reflections. Read full calculated chapters in ordinary language before choosing your edition.' },
  { icon: Orbit, title: 'The AstroComic', body: 'An illustrated 24-page story shaped by a calculated chart, with natural dialogue and a separate calculation ledger.' },
  { icon: Moon, title: 'Dream journal', body: 'Keep private observations beside the calculated sky that night. You choose whether readings may use them.' },
];

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/** Pre-launch landing: collects launch emails (double opt-in) and holds the hidden passcode entry. */
export default function PrelaunchLanding({ onUnlock, openAccess = false }: { onUnlock: () => void; openAccess?: boolean }) {
  const [email, setEmail] = useState('');
  const [portalOpen, setPortalOpen] = useState(false);
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const [access, setAccess] = useState(openAccess);
  const [code, setCode] = useState('');
  const [codeErr, setCodeErr] = useState('');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    document.title = 'Zodaci — Opening soon';
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === 'p' && !(e.target instanceof HTMLInputElement)) {
        setAccess(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');

    if (website.trim()) {
      setState('done');
      setMsg('Thanks — we are almost ready to open.');
      return;
    }

    const trimmedEmail = email.trim();
    if (!EMAIL_RE.test(trimmedEmail)) {
      setState('error');
      setMsg('Enter a full email address, like name@example.com.');
      return;
    }

    if (!consent) {
      setState('error');
      setMsg('Tick the box so we can email you.');
      return;
    }

    setState('sending');
    try {
      const { data, error } = await supabase.functions.invoke('brand-newsletter', {
        body: {
          email: trimmedEmail,
          consent: true,
          website: '',
          source: 'astrobook-teaser',
          path: window.location.pathname.slice(0, 200),
        },
      });

      if (error || data?.error) {
        setState('error');
        setMsg(await functionErrorMessage(error, data, 'We could not save your email. Please try again.'));
        return;
      }

      setState('done');
      setMsg(data?.existing ? 'You are already on the list.' : 'Check your inbox and click the link to confirm.');
    } catch (err) {
      setState('error');
      setMsg(err instanceof Error && err.message ? err.message : 'We could not save your email. Please try again.');
    }
  };

  const unlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = code.trim();
    setCodeErr('');
    if (!trimmedCode) {
      setCodeErr('Enter the team access code.');
      return;
    }

    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('brand-newsletter', {
        body: { action: 'prelaunch-access', code: trimmedCode },
      });

      if (error || !data?.ok) {
        setCodeErr(await functionErrorMessage(error, data, 'That code is not right. Check it and try again.'));
        return;
      }

      grantDeviceAccess();
      setAccess(false);
      onUnlock();
    } catch (err) {
      setCodeErr(err instanceof Error && err.message ? err.message : 'That code is not right. Check it and try again.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="voyager-home">
      <a href="#main" className="sr-only focus:not-sr-only">Skip to main content</a>
      <header className="voyager-header">
        <a href="/" className="voyager-brand" aria-label="Zodaci home">
          <ZodaciMark className="h-10 w-10" />
          <div><strong>ZODACI</strong><span>Astral Research Authority</span></div>
        </a>
        <nav className="voyager-nav" aria-label="Home navigation">
          <a href="#discover">Discover Zodaci</a>
          <a href="/demo">The sample observatory</a>
          <Button asChild variant="outline" className="min-h-11 rounded-sm"><a href="#join">Join the waitlist <ArrowRight aria-hidden /></a></Button>
        </nav>
      </header>
      <main id="main">
        <section className="voyager-hero" aria-labelledby="voyager-title">
          <img className="voyager-scene" src={cosmos.url} width={1672} height={941} alt="Engraved Saturn and celestial portals frame a Black woman studying the sky and an East Asian man at a telescope" />
          <div className="voyager-hero-copy">
            <p className="voyager-kicker">A personal observatory. Opening soon.</p>
            <h1 id="voyager-title" className="voyager-title">Zodaci.<br />Your whole<br />sky.</h1>
            <p className="voyager-subtitle">Map the stars. Understand yourself.</p>
            <p className="voyager-intro">You are more than a Sun sign. See how your whole birth chart fits together, through thoughtful readings, illustrated books and tools you can actually explore.</p>
            <div className="voyager-actions">
              <Button asChild variant="primary" className="voyager-cta"><a href="#join">Keep me posted <ArrowRight aria-hidden /></a></Button>
              <Button variant="outline" className="voyager-cta" onClick={() => setPortalOpen(v => !v)} aria-expanded={portalOpen} aria-controls="voyager-portal">{portalOpen ? 'Close the field notes' : 'Look a little closer'} <Orbit aria-hidden /></Button>
            </div>
            <p className="voyager-footnote">Built around calculated placements. Written in ordinary language.</p>
            <div id="voyager-portal" className="voyager-portal" data-open={portalOpen} aria-hidden={!portalOpen}>
              <div className="voyager-portal-inner"><div className="voyager-portal-content">
                <h2>The detail is in the connections.</h2>
                <p>Your Sun, Moon and planets are read together with their degrees, rulers and aspects. A known birth time adds houses and angles. Without one, those details are left out and the Moon is clearly marked provisional.</p>
                <a href="/demo" tabIndex={portalOpen ? 0 : -1}>Step inside the interactive sample <ArrowRight className="ml-2 h-4 w-4" aria-hidden /></a>
              </div></div>
            </div>
          </div>
        </section>
        <div className="voyager-proof" aria-label="Our approach">
          <span><Telescope className="h-4 w-4" aria-hidden /> Calculations you can inspect</span>
          <span><BookOpen className="h-4 w-4" aria-hidden /> Whole-chart readings</span>
          <span><ShieldCheck className="h-4 w-4" aria-hidden /> Personal observations stay private</span>
        </div>
        <section id="discover" className="voyager-band" aria-labelledby="discover-title">
          <div className="voyager-band-heading">
            <h2 id="discover-title">A little wonder.<br />A lot to discover.</h2>
            <p>Start with a chart. Follow the connections that interest you. The deeper details are there when you want them.</p>
          </div>
          <div className="voyager-features">
            {FEATURES.map((f, i) => (
              <article key={f.title} className="voyager-feature">
                <f.icon className="h-9 w-9" strokeWidth={1.2} aria-hidden />
                <h3>{f.title}</h3><p>{f.body}</p>
                <a href={i === 0 ? '/accuracy' : '/demo'}>{i === 0 ? 'See the calculation checks' : 'Explore the sample'} <ArrowRight className="h-4 w-4" aria-hidden /></a>
              </article>
            ))}
          </div>
        </section>
        <section id="join" className="voyager-band voyager-signup" aria-labelledby="join-title">
          <img src={art} alt="A mid-century couple watching Saturn above the Zodaci observatory" width={1536} height={1152} loading="lazy" />
          <div>
            <p className="voyager-kicker">A seat at the observatory</p>
            <h2 id="join-title">See you under<br />the same sky.</h2>
            <p>We are putting the finishing touches on Zodaci. Leave your email and we’ll let you know when the doors open.</p>
            {state === 'done' ? (
              <div role="status" className="mt-6 max-w-xl border-2 border-primary bg-foreground p-5 text-background">
                <p className="font-label text-xl tracking-wide">You're on the list</p>
                <p className="mt-1">{msg}</p>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="mt-6 max-w-xl">
                <Label htmlFor="pl-email" className="sr-only">Email address</Label>
                <div className="flex flex-col border-2 border-primary/80 sm:flex-row">
                  <Input
                    id="pl-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Your email address"
                    aria-invalid={state === 'error'}
                    aria-describedby="pl-msg"
                    className="h-14 rounded-none border-0 bg-background text-base text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-0"
                  />
                  <Button type="submit" disabled={state === 'sending'} className="h-14 shrink-0 rounded-none bg-accent px-5 font-label text-2xl tracking-wide text-accent-foreground hover:bg-accent/90">
                    {state === 'sending' ? 'Sending…' : 'Keep me posted'}
                  </Button>
                </div>
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="pl-website">Website</label>
                  <input
                    id="pl-website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                  />
                </div>
                <label className="mt-3 flex items-start gap-2 text-sm">
                  <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-primary" />
                  <span>Email me when Zodaci opens and with occasional product news. I can unsubscribe at any time.</span>
                </label>
                <p id="pl-msg" role={state === 'error' ? 'alert' : undefined} className="mt-2 min-h-5 text-sm text-accent">
                  {state === 'error' ? msg : ''}
                </p>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4 text-primary" aria-hidden /> Launch news only. No birth details needed here. We never share or sell your email.
                </p>
              </form>
            )}
          </div>
        </section>
      </main>
      <footer className="voyager-footer">
        <span className="font-label text-base">Zodaci · Astral Research Authority</span>
        <a href="/privacy">Privacy Policy</a><a href="/terms">Terms of Service</a>
        <span>Astrological insights provided for entertainment and self-reflection purposes only.</span>
        <Button type="button" variant="ghost" size="icon" className="ml-auto min-h-11 min-w-11" onClick={() => setAccess(true)} aria-label="Team access" title="Team access"><KeyRound aria-hidden /></Button>
      </footer>
      <Dialog open={access} onOpenChange={setAccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display uppercase">Team access</DialogTitle>
            <DialogDescription>Enter the access code to open the full site on this device.</DialogDescription>
          </DialogHeader>
          <form onSubmit={unlock} className="space-y-3">
            <Label htmlFor="pl-code">Access code</Label>
            <Input id="pl-code" type="password" autoComplete="off" value={code} onChange={e => setCode(e.target.value)} aria-invalid={!!codeErr} aria-describedby="pl-code-err" />
            <p id="pl-code-err" role="alert" className="min-h-5 text-sm text-accent">{codeErr}</p>
            <Button type="submit" disabled={checking || !code.trim()} className="w-full">
              {checking ? 'Checking…' : 'Open the site'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
