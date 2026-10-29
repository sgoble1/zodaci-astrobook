import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PLAN_PRICE } from '@/lib/plans';
import { Button } from '@/components/ui/button';
import { usePageMeta } from '@/hooks/usePageMeta';

const PRODUCTS = [
  ['Subscriptions', `Pro ${PLAN_PRICE.full.month} and Cosmic ${PLAN_PRICE.creator.month}: personal readings, counselors, workbook, podcasts and a Masterbook written from each member’s own chart.`],
  ['AstroBook', 'A printed, personalised book of the member’s chart in several editions, printed and shipped on demand through a print partner.'],
  ['AstroComic', 'A monthly illustrated comic in the original Lantern & Ink style, starring the member’s chart.'],
  ['Shop', 'Astrological posters, sticker sheets and notebooks, sold through a Shopify storefront.'],
];
const MOAT = ['Charts calculated in-app and checked against Swiss Ephemeris reference values.', 'Private data enforced by the backend, not the browser: owner-only readings, and private Masterbooks that open only for their owner and the people they choose.', 'One source library behind readings, chat, podcasts and print — built once, sold in several formats.'];
const STATUS = ['Live: member site, subscriptions, readings, counselors, podcasts and the shop.', 'In progress: automated print fulfilment, email sender domain, licensed source texts.', 'Not yet claimed: user counts, revenue or testimonials — none are shown until they are real.'];

/** Invite-only investor overview. Access is decided by the backend (can_view_investors). */
export default function Investors() {
  usePageMeta('Investor overview · Zodaci', 'Private investor overview.');
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => { void supabase.rpc('can_view_investors').then(({ data }) => setOk(data === true)); }, []);
  if (ok === null) return <p role="status" className="text-muted-foreground">Checking access…</p>;
  if (!ok) return <article className="mx-auto max-w-xl py-12 text-center"><h1 className="font-display text-3xl">Investor overview</h1><p className="mt-3 text-muted-foreground">This page is invite-only. Ask Shane for access.</p></article>;
  return (
    <article className="space-y-10">
      <header>
        <div className="font-smallcaps text-xs text-gold">Private · Investor overview</div>
        <h1 className="text-4xl sm:text-5xl">Zodaci</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">A personal astrology studio: every reading, book, comic and podcast is written from the member’s own calculated chart.</p>
      </header>
      <section aria-labelledby="inv-p" className="space-y-4"><h2 id="inv-p" className="text-2xl">What we sell</h2>
        <div className="grid gap-4 sm:grid-cols-2">{PRODUCTS.map(([t, d]) => <div key={t} className="parchment p-5"><h3 className="text-xl">{t}</h3><p className="mt-2 text-sm text-muted-foreground">{d}</p></div>)}</div>
      </section>
      <section aria-labelledby="inv-m" className="space-y-3"><h2 id="inv-m" className="text-2xl">Why it’s hard to copy</h2><ul className="list-disc space-y-2 pl-5 text-muted-foreground">{MOAT.map(m => <li key={m}>{m}</li>)}</ul></section>
      <section aria-labelledby="inv-s" className="space-y-3"><h2 id="inv-s" className="text-2xl">Where things stand</h2><ul className="list-disc space-y-2 pl-5 text-muted-foreground">{STATUS.map(m => <li key={m}>{m}</li>)}</ul></section>
      <div className="flex flex-wrap gap-3"><Button asChild><Link to="/welcome">See the public site</Link></Button><Button asChild variant="outline"><Link to="/store">Visit the shop</Link></Button><Button asChild variant="outline"><a href="mailto:shanegoble@gmail.com">Contact Shane</a></Button></div>
    </article>
  );
}
