import { useEffect, useState } from 'react';
import { PaintedPlate } from '@/components/art/PaintedPlate';
import { PAINTED } from '@/content/paintedArt';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, Package, CalendarDays, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Faq } from '@/components/brand/Faq';
import { StripeEmbeddedCheckout } from '@/components/payments/StripeEmbeddedCheckout';
import { PaymentTestModeBanner } from '@/components/payments/PaymentTestModeBanner';
import { SAMPLE_ISSUE } from '@/content/sampleComic';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useJsonLd } from '@/hooks/useJsonLd';
import { useSession } from '@/hooks/useLibrary';
import { ART_RULES, CAST, COMIC_FAQ, COMIC_PLANS, comicPriceList, COMIC_SPEC, firstIssueMonth, isComicPlan, monthLabel, shipBy, type ComicPlan } from '@/lib/comic';
import cast from '@/assets/astrocomic-cast.jpg';
import { OpenComicDigest } from '@/components/books/OpenAstroBook';
import { SAMPLE_READER } from '@/content/sampleBookLeaves';
import { PersonalizationCallout } from '@/components/books/PersonalizationStory';
import { useNextComicIssue } from '@/hooks/useNextComicIssue';
import { comicIssueTitle } from '@/lib/shopPresentation';


const PAGE_MAP: [string, string][] = [
  ['1', 'Atomic Zodiac cover'], ['2', 'An unfinished message · opening splash'], ['3–12', 'Ten operators, ten environmental choices'], ['13–16', 'Cooperation, crossed routes and repairs'],
  ['17–18', 'An uneven line and a route worth trying'], ['19', 'The hand behind the signal'], ['20–21', 'The final test and morning at the station'], ['22–23', 'Calculation Ledger · placements, exact contacts and uncertainty'], ['24', 'Back cover'],
];

/** Public AstroComic product page: plans, a turnable digest preview, the cast, the art style, print spec and FAQ. */
export default function AstroComic() {
  usePageMeta('AstroComic — your month as a personalized comic | Zodaci', `A printed 24-page comic each month, starring the planets in your birth chart and the transits that touch it. ${comicPriceList()}.`);
  useJsonLd('astrocomic-product', { '@type': 'Product', name: 'AstroComic', brand: { '@type': 'Brand', name: 'Zodaci' }, description: 'A monthly 24-page personalized astrology comic, printed and mailed in the US.', offers: Object.values(COMIC_PLANS).map(p => ({ '@type': 'Offer', priceCurrency: 'USD', price: (p.cents / 100).toFixed(2), name: p.name, availability: 'https://schema.org/InStock' })) });
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const session = useSession();
  const initial = params.get('plan');
  const [plan, setPlan] = useState<ComicPlan>(isComicPlan(initial) ? initial : 'monthly');
  const [checkout, setCheckout] = useState(false);
  const [error, setError] = useState('');
  // Returning from sign-up with a chosen plan opens checkout straight away.
  useEffect(() => { if (session && isComicPlan(initial) && params.get('buy') === '1') setCheckout(true); }, [session?.user.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const first = firstIssueMonth(new Date());
  const issue = useNextComicIssue();
  const nextIssue = comicIssueTitle({ signedIn: !!session, purchased: issue.purchased, next: issue.next });
  const buy = () => {
    setError('');
    if (!session) { navigate(`/auth?mode=signup&next=${encodeURIComponent(`/astrocomic?plan=${plan}&buy=1`)}`); return; }
    setCheckout(true);
  };
  return (
    <article className="space-y-20">
      <PaymentTestModeBanner />
      <section className="product-page-opening obs-panel">
        <div>
          <p className="font-label text-xs tracking-[0.16em] text-primary">AstroComic by Zodaci</p>
          <h1 className="mt-3 hero-headline">AstroComic</h1>
          <p className="mt-3 font-script text-3xl text-primary">Your sky becomes a story.</p>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">A 24-page digest built around your chart. Background operators change the lamps, relays and routes; the protagonist has to decide how to respond. The monthly sky informs the fictional setup, never a prediction of your life.</p>
          <div role="radiogroup" aria-label="Choose a plan" className="comic-product-plans mt-8 grid gap-3">
            {(Object.keys(COMIC_PLANS) as ComicPlan[]).map(k => { const p = COMIC_PLANS[k]; const on = plan === k; return (
              <button key={k} type="button" role="radio" aria-checked={on} onClick={() => { setPlan(k); setCheckout(false); }} className={`rounded-lg border p-4 text-left transition-colors duration-500 ${on ? 'border-primary bg-primary/10' : 'border-border hover:border-foreground/40'}`}>
                <span className="flex items-center justify-between gap-2"><span className="font-semibold">{p.name}</span>{on && <Check aria-hidden className="h-4 w-4 text-gold" />}</span>
                <span className="mt-1 block font-label text-xl">{p.label}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{p.blurb}</span>
              </button>
            ); })}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button size="lg" variant="primary" onClick={buy}>{plan === 'single' ? 'Buy one issue' : 'Subscribe'}<ArrowRight /></Button>
            <Button asChild variant="outline" size="lg"><a href="#preview">See your preview</a></Button>
          </div>
          <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground"><span className="flex items-center gap-1.5"><CalendarDays aria-hidden className="h-4 w-4" />First issue: {monthLabel(first)}, ships by {shipBy(first).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}</span><span className="flex items-center gap-1.5"><Package aria-hidden className="h-4 w-4" />US delivery included</span></p>
          {checkout && session && (
            <div className="parchment mt-6 space-y-3 p-4" aria-label="Checkout">
              <div className="flex items-center justify-between gap-2"><p className="text-sm">AstroComic {COMIC_PLANS[plan].name} · {COMIC_PLANS[plan].label} before applicable tax</p><Button variant="ghost" size="sm" onClick={() => setCheckout(false)}>Close</Button></div>
              {error && <p role="alert" className="text-sm text-destructive">{error} {error.includes('already') && <Link to="/my-comic" className="underline">Open My AstroComic</Link>}</p>}
              <StripeEmbeddedCheckout key={plan} comicPlan={plan} onError={setError} returnUrl={`${window.location.origin}/my-comic?session_id={CHECKOUT_SESSION_ID}`} />
            </div>
          )}
          {session && issue.purchased && <p className="mt-4 rounded-md border border-[hsl(var(--brass)/0.55)] bg-secondary/60 px-3 py-2 text-sm" role="status"><span className="font-label tracking-wider text-primary">Your next issue: {nextIssue.title}</span> · {nextIssue.note}.</p>}
          {session && <p className="mt-4 text-sm"><Link to="/my-comic" className="text-primary underline underline-offset-4">Already subscribed? Open My AstroComic</Link></p>}
          <PersonalizationCallout product="comic" className="mt-6" />
        </div>
        <div id="preview" className="product-art-gallery obs-paper scroll-mt-6 p-3 sm:p-4" aria-label="Sample AstroComic digest"><OpenComicDigest /></div>
      </section>
      <PaintedPlate {...PAINTED.astrocomic} shape="panorama" />

      <section aria-labelledby="issue1-h">
        <h2 id="issue1-h" className="font-display text-3xl">Read the sample issue: The Midnight Signal</h2>
        <p className="mt-2 mb-8 max-w-2xl text-muted-foreground">The digest above contains all 24 pages for {SAMPLE_READER.name}, our fictional sample reader. Its scenes are a creative interpretation, not biography. Your private preview follows your saved chart; its calculation ledger keeps the underlying facts separate from the story.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Button asChild size="lg" variant="outline"><Link to="/astrocomic/print-issue-1">Sizes &amp; page contents<ArrowRight /></Link></Button></div>
      </section>

      <section aria-labelledby="inside-h">
        <h2 id="inside-h" className="font-display text-3xl">What’s in every issue</h2>
        <ol className="mt-6 grid gap-x-10 border-y border-border md:grid-cols-2">{PAGE_MAP.map(([n, t]) => <li key={n} className="grid grid-cols-[4rem_1fr] gap-3 border-b border-border py-3 text-sm"><span className="font-label text-primary">p. {n}</span><span>{t}</span></li>)}</ol>
      </section>

      <section aria-labelledby="comic-method-h" className="space-y-7 border-y border-border py-8"><h2 id="comic-method-h" className="font-display text-3xl">What makes the story yours.</h2><div className="grid gap-8 md:grid-cols-3"><div className="space-y-3"><h3 className="font-label text-2xl text-primary">Placements shape the cast</h3><p className="text-muted-foreground leading-relaxed">The planets’ signs, rulers and measured aspects shape how the characters cooperate or disagree. Retrograde placements bring reconsideration into the action. A date-only chart uses planetary geometry instead of invented houses.</p></div><div className="space-y-3"><h3 className="font-label text-2xl text-primary">The month changes the setting</h3><p className="text-muted-foreground leading-relaxed">Your natal chart stays the foundation. Current transits supply the timing layer. A story can explore an opening or a tension without claiming an event will happen in your life.</p></div><div className="space-y-3"><h3 className="font-label text-2xl text-primary">Your experience is optional</h3><p className="text-muted-foreground leading-relaxed">Private notes and dream entries are used only when you explicitly include them for comics. The story remains fiction, and its calculation ledger separates chart measurements from narrative choices.</p></div></div><p className="max-w-3xl text-sm text-muted-foreground">The preview above is a complete turnable story sample. The monthly issue outline above describes the intended subscriber sections; illustrations in a preview are not a final print proof. Physical printing awaits printer setup.</p></section>

      <section aria-labelledby="cast-h">
        <h2 id="cast-h" className="font-display text-3xl">Meet the cast</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">Ten planets, ten characters. Who leads your issue depends on your chart and the month’s sky.</p>
        <img src={cast} alt="The AstroComic cast lined up: Sovereign, Dreamer, Messenger, Enchantress, Warrior, Philosopher, Elder, Rebel, Mystic and Transformer" width={1920} height={832} loading="lazy" className="comic-frame mt-6 w-full" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{CAST.map(c => <div key={c.key} className="comic-card p-4"><p><span className="comic-tag text-[10px]">{c.planet}</span></p><h3 className="mt-2 font-display text-lg uppercase">{c.name}</h3><p className="mt-2 text-xs text-muted-foreground leading-relaxed">{c.look}; with {c.companion}.</p><p className="mt-2 text-xs leading-relaxed">{c.voice}</p></div>)}</div>
      </section>

      <section aria-labelledby="style-h" className="grid gap-10 lg:grid-cols-2">
        <div><h2 id="style-h" className="font-display text-3xl">Atomic Zodiac</h2><p className="mt-2 text-muted-foreground">The house style: a 1950s golden-age comic, inked and printed like the newsstand digests it remembers.</p><ul className="mt-5 space-y-2 text-sm">{ART_RULES.rules.map(r => <li key={r} className="flex gap-2"><Sparkles aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gold" />{r}</li>)}</ul>
          <div className="mt-6 flex flex-wrap gap-3" aria-label="Print palette">{ART_RULES.palette.map(([name, hex]) => <div key={hex} className="text-center text-[10px]"><span className="block h-10 w-10 rounded-full border-2 border-foreground/80" style={{ backgroundColor: hex }} aria-hidden /><span className="mt-1 block">{name}</span></div>)}</div>
        </div>
        <div><h2 className="font-display text-3xl">Printed to spec</h2><dl className="mt-5 divide-y divide-border border-y border-border text-sm">{COMIC_SPEC.map(([k, v]) => <div key={k} className="grid grid-cols-[7rem_1fr] gap-3 py-2.5"><dt className="text-muted-foreground">{k}</dt><dd>{v}</dd></div>)}</dl><p className="mt-4 text-sm text-muted-foreground">Ships by the 8th of each month, US addresses only. Pause for up to three months or skip any month from My AstroComic.</p></div>
      </section>

      <section aria-labelledby="comic-faq-h" className="max-w-3xl"><h2 id="comic-faq-h" className="font-display text-3xl mb-6">Questions</h2><Faq items={COMIC_FAQ} id="astrocomic-faq" /></section>

      <section className="vellum p-6 text-center sm:p-10"><h2 className="font-display text-3xl">Start with {monthLabel(first)}.</h2><p className="mt-3 text-muted-foreground">{COMIC_PLANS.monthly.label} · {COMIC_PLANS.yearly.label} · single issue {COMIC_PLANS.single.label}</p><Button size="lg" variant="primary" className="mt-6" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); buy(); }}>{plan === 'single' ? 'Buy one issue' : 'Subscribe'}<ArrowRight /></Button><p className="mx-auto mt-6 max-w-xl text-xs text-muted-foreground">AstroComic is a creative reflection on your chart and the month’s sky — not prediction or advice. It is sold separately and does not change your Zodaci plan.</p></section>
    </article>
  );
}
