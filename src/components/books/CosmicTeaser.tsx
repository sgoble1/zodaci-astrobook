import { useState } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { computeChart, type ChartInput } from '@/lib/astro';
import { lifePath, LP_MEANING } from '@/lib/synastry';
import { sunFromDate } from '@/components/books/CoverCustomizer';

const SUN_TEASE: Record<string, string> = {
  Aries: 'You were born to begin things. Your chart will show where that spark is meant to land.', Taurus: 'You build slowly and keep what you build. Your chart shows what is worth that patience.',
  Gemini: 'Your mind moves in two directions at once. Your chart shows which conversations change you.', Cancer: 'You carry home with you. Your chart shows who and what makes you feel safe.',
  Leo: 'You were made to be seen, warmly. Your chart shows where your light does the most good.', Virgo: 'You notice what others miss. Your chart shows where that care becomes mastery.',
  Libra: 'You read the balance of every room. Your chart shows what you need in return.', Scorpio: 'You go deeper than most people dare. Your chart shows what you are meant to transform.',
  Sagittarius: 'You are always aiming further. Your chart shows the direction that feels like freedom.', Capricorn: 'You think in decades, not days. Your chart shows the summit that is yours.',
  Aquarius: 'You see the future early. Your chart shows the people you are meant to find.', Pisces: 'You feel the tide before it turns. Your chart shows how to trust that knowing.',
};

/** Free Cosmic Teaser: email in exchange for a short, calculated chart teaser. Deterministic, so it costs no AI credits. */
export function CosmicTeaser() {
  const [email, setEmail] = useState(''); const [date, setDate] = useState(''); const [consent, setConsent] = useState(false); const [website, setWebsite] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle'); const [error, setError] = useState('');
  const [teaser, setTeaser] = useState<{ sun: string; cusp: boolean; animal: string; lp: number } | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    const sun = sunFromDate(date);
    if (!z.string().trim().email().max(254).safeParse(email).success) return setError('Enter a valid email address.');
    if (!sun) return setError('Enter a birth date between 1900 and 2100.');
    if (!consent) return setError('Tick the box to receive your teaser and occasional Zodaci updates.');
    setState('busy');
    try {
      const { data, error: failure } = await supabase.functions.invoke('brand-newsletter', { body: { email: email.trim(), consent: true, website, source: 'astrobook-teaser' } });
      if (failure || !data?.ok) throw new Error(data?.error || 'We could not save your email. Please try again.');
      const c = computeChart({ date, time: '12:00', lat: 0, lon: 0, tz: 'UTC', placeLabel: '', placeSource: 'manual', houseSystem: 'whole' } as ChartInput);
      setTeaser({ sun: sun.sign, cusp: sun.cusp, animal: c.bazi.find(p => p.label === 'Year')?.animal ?? c.bazi[0]?.animal ?? '', lp: lifePath(date).n });
      setState('done');
    } catch (err) { setError(err instanceof Error ? err.message : 'Please try again.'); setState('idle'); }
  };
  if (state === 'done' && teaser) return <div className="space-y-4" role="status">
    <p className="flex items-center gap-2 font-smallcaps text-xs text-gold"><Sparkles className="h-4 w-4" aria-hidden />Your Cosmic Teaser</p>
    <h3 className="font-display text-3xl">Sun in {teaser.sun}</h3>
    <p className="text-muted-foreground">{SUN_TEASE[teaser.sun]}{teaser.cusp ? ' (The Sun changed sign close to your birthday, so your birth time confirms this.)' : ''}</p>
    <dl className="grid grid-cols-2 gap-3 text-sm"><div className="rounded border border-border p-3"><dt className="text-xs text-muted-foreground">Chinese zodiac year</dt><dd className="text-lg">{teaser.animal}</dd></div><div className="rounded border border-border p-3"><dt className="text-xs text-muted-foreground">Life Path number</dt><dd className="text-lg">{teaser.lp} · {LP_MEANING[teaser.lp] ?? ''}</dd></div></dl>
    <p className="text-sm text-muted-foreground">This is calculated from your date alone. Your Moon, Rising sign and houses need your birth time and place.</p>
    <Button asChild><Link to="/auth?mode=signup&next=/start">See my full chart, free<ArrowRight /></Link></Button>
  </div>;
  return <form onSubmit={submit} className="space-y-4" aria-label="Get your free Cosmic Teaser">
    <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="teaser-email">Email</Label><Input id="teaser-email" type="email" autoComplete="email" maxLength={254} required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></div><div><Label htmlFor="teaser-date">Birth date</Label><Input id="teaser-date" type="date" min="1900-01-01" max="2100-12-31" required value={date} onChange={e => setDate(e.target.value)} /></div></div>
    <div className="hidden" aria-hidden="true"><label htmlFor="teaser-website">Website</label><input id="teaser-website" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} /></div>
    <label className="flex items-start gap-3 text-sm text-muted-foreground"><Checkbox checked={consent} onCheckedChange={v => setConsent(v === true)} className="mt-0.5" />Send me my teaser and occasional Zodaci news. Unsubscribe any time.</label>
    <Button type="submit" disabled={state === 'busy'}>{state === 'busy' ? 'Calculating…' : 'Get my free Cosmic Teaser'}<ArrowRight /></Button>
    <p className="text-xs text-muted-foreground">Your birth date is used only in your browser to calculate the teaser. We store your email, not your date.</p>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </form>;
}
