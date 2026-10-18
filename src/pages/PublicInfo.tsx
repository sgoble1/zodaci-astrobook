import { Link } from 'react-router-dom';
import { Check, ArrowRight, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useJsonLd } from '@/hooks/useJsonLd';
import { Faq, ASTROBOOK_FAQ, GENERAL_FAQ } from '@/components/brand/Faq';
import { BOOK_PRICES, money } from '@/lib/books';
import cover1 from '@/assets/cover-example-cosmic.jpg';
import cover2 from '@/assets/cover-example-botanical.jpg';
import cover3 from '@/assets/cover-example-atlas.jpg';
import { ThemeArt } from '@/components/common/ThemeArt';
import { SampleBook } from '@/components/books/SampleBookReader';

const CHAPTERS = [
  ['Your Chart Snapshot', 'The full birth chart in one illustrated spread'],
  ['Who You Are', 'Sun, Moon, Rising and dominant element interpreted'],
  ['Love & Connection', 'Venus, Mars, the 7th house and relationship patterns'],
  ['Purpose & Work', 'Midheaven, Saturn, the 10th house and life direction'],
  ['Healing & Growth', 'Chiron, the 12th house and the places that shape you'],
  ['The Year Ahead', 'Current transits and how they meet your chart'],
];

export function AstroBookPublic() {
  usePageMeta('AstroBook — Your Personalized Printed Birth Chart Book | Zodaci', 'A printed book written entirely from your birth chart. Love, purpose, timing and healing in one volume, personalized to your exact placements.');
  useJsonLd('product-schema', { '@type': 'Product', name: 'AstroBook', brand: { '@type': 'Brand', name: 'Zodaci' }, description: 'A printed book written from your own birth chart.', offers: [{ '@type': 'Offer', name: 'Standard softcover', price: (BOOK_PRICES.standard / 100).toFixed(2), priceCurrency: 'USD', availability: 'https://schema.org/InStock', url: 'https://zodaci.com/astrobook' }, { '@type': 'Offer', name: 'Expanded softcover', price: (BOOK_PRICES.expanded / 100).toFixed(2), priceCurrency: 'USD', availability: 'https://schema.org/InStock', url: 'https://zodaci.com/astrobook' }] });
  return (
    <article className="space-y-20">
      <section className="grid items-center gap-10 md:grid-cols-2">
        <div className="space-y-5">
          <p className="text-xs font-medium tracking-[0.12em] text-accent">A PHYSICAL PRODUCT</p>
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">The book that only you could have written.</h1>
          <p className="text-lg text-muted-foreground">AstroBook is a personalized, printed interpretation of your complete birth chart — chapters on love, purpose, timing and healing, all written from your exact placements.</p>
          <p className="text-sm text-muted-foreground">From {money(BOOK_PRICES.standard)} · free US shipping</p>
          <div className="flex flex-wrap items-center gap-4"><Button asChild size="lg"><Link to="/auth?next=/books">Order your AstroBook</Link></Button><Link to="/book-preview" className="text-accent">Read a sample book →</Link></div>
        </div>
        <div className="grid grid-cols-3 gap-3">{[cover1, cover2, cover3].map((c, i) => <img key={i} src={c} alt="Example AstroBook cover design" loading={i ? 'lazy' : 'eager'} className="aspect-[2/3] w-full rounded object-cover shadow-xl" />)}</div>
      </section>
      <section id="inside" className="space-y-6">
        <h2 className="font-display text-3xl">A complete reading, between two covers.</h2>
        <p className="text-muted-foreground">Every AstroBook includes these six chapters. You can add extra sections when you order.</p>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{CHAPTERS.map(([t, d], i) => <li key={t} className="vellum p-5"><ThemeArt label={t} badge={i + 1} /><h3 className="mt-4 text-xl">{t}</h3><p className="mt-2 text-sm text-muted-foreground">{d}</p></li>)}</ol>
      </section>
      <section className="space-y-6">
        <h2 className="font-display text-3xl">How it works.</h2>
        <ol className="grid gap-4 md:grid-cols-4">{[
          ['chart', 'Add your birth details', 'Date, time and place. We calculate your exact chart.'],
          ['self', 'We write your book', 'Every chapter is written from your own placements.'],
          ['sign', 'Preview and choose', 'Read the PDF, pick a cover and any extra sections.'],
          ['year', 'Printed and shipped', 'About 3 days to print, 5–7 days to arrive (US).'],
        ].map(([k, t, d], i) => <li key={t} className="vellum p-5"><ThemeArt kind={k as never} badge={i + 1} className="h-16 w-16" /><h3 className="mt-4 text-lg">{t}</h3><p className="mt-1 text-sm text-muted-foreground">{d}</p></li>)}</ol>
      </section>
      <section className="space-y-6">
        <h2 className="font-display text-3xl">Choose your edition.</h2>
        <div className="grid gap-5 md:grid-cols-2">{[
          { name: 'Standard', price: BOOK_PRICES.standard, pages: '~250 pages', perks: ['All six core chapters', 'Your full chart wheel in colour', 'Softcover, 6×9 in'], featured: false },
          { name: 'Expanded', price: BOOK_PRICES.expanded, pages: '~400 pages', perks: ['Everything in Standard', 'Longer, deeper chapters on every topic', 'Room for your extra sections'], featured: true },
        ].map(e => <div key={e.name} className={`vellum flex flex-col p-7 ${e.featured ? 'border-primary/70 shadow-[var(--shadow-gold)]' : ''}`}>
          <div className="flex items-start justify-between gap-3"><div><p className="font-smallcaps text-xs text-gold">{e.pages}</p><h3 className="mt-1 text-2xl">{e.name} edition</h3></div>{e.featured && <span className="rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">Most complete</span>}</div>
          <p className="mt-4 font-display text-5xl">{money(e.price)}</p><p className="text-sm text-muted-foreground">Free US shipping · extra sections $6.99 each</p>
          <ul className="mt-5 flex-1 space-y-2">{e.perks.map(x => <li key={x} className="flex gap-2 text-sm"><Check className="h-5 w-5 shrink-0 text-accent" aria-hidden />{x}</li>)}</ul>
          <Button asChild size="lg" variant={e.featured ? 'default' : 'outline'} className="mt-6"><Link to="/auth?next=/books">Order {e.name}<ArrowRight /></Link></Button>
        </div>)}</div>
      </section>
      <section id="look-inside" className="space-y-6">
        <h2 className="font-display text-3xl">Look inside before you order.</h2>
        <p className="text-muted-foreground">A real sample book, composed live from a fictional reader's chart — the same layout, voice and depth as your own. Turn the first pages below, or <Link to="/book-preview" className="underline text-accent">read the full sample book</Link>.</p>
        <SampleBook maxPages={6} cta={<Button asChild variant="outline"><Link to="/book-preview">Read the full sample<ArrowRight /></Link></Button>} />
      </section>
      <section className="space-y-6">
        <h2 className="font-display text-3xl">The details.</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[
          ['Binding', 'Softcover, 6×9 in. Hardcover available on request'],
          ['Interior', 'Your chart and illustrations in full colour'],
          ['Preview first', 'Read your full book as a PDF before it prints'],
          ['Timing', 'About 3 business days to produce, 5–7 business days shipping (US)'],
        ].map(([t, d]) => <div key={t} className="vellum p-5"><h3 className="text-xl">{t}</h3><p className="mt-2 text-sm text-muted-foreground">{d}</p></div>)}</div>
      </section>
      <section id="gift" className="rounded-xl border border-primary/30 bg-primary/10 p-10 text-center space-y-4">
        <Gift className="mx-auto h-8 w-8 text-accent" aria-hidden />
        <h2 className="font-display text-3xl">The most personal gift you can give.</h2>
        <p className="mx-auto max-w-xl text-muted-foreground">Order an AstroBook for someone you love. Add their birth details to your account and we'll write the book from their chart.</p>
        <Button asChild size="lg"><Link to="/auth?next=/books">Gift an AstroBook</Link></Button>
      </section>
      <section className="space-y-4"><h2 className="font-display text-3xl">AstroBook questions</h2><Faq items={ASTROBOOK_FAQ} id="faq-astrobook" /></section>
    </article>
  );
}

export function FaqPage() {
  usePageMeta('FAQ — Zodaci Astrology Platform', 'Answers to common questions about Zodaci, your birth chart, AstroBook, pricing, privacy and more.');
  const all = GENERAL_FAQ.flatMap(c => c.items);
  return (
    <article className="mx-auto max-w-3xl space-y-10">
      <header className="space-y-3"><h1 className="font-display text-4xl">Questions, answered.</h1><p className="text-muted-foreground">Everything you might want to know before you begin.</p></header>
      {GENERAL_FAQ.map((c, i) => <section key={c.category} className="space-y-3"><h2 className="text-xl font-semibold">{c.category}</h2><Faq items={c.items} id={`faq-${i}`} /></section>)}
      <FaqSchemaNote count={all.length} />
      <Button asChild><Link to="/auth">Start for free <ArrowRight /></Link></Button>
    </article>
  );
}
const FaqSchemaNote = ({ count }: { count: number }) => <p className="text-xs text-muted-foreground">{count} questions · Still curious? Email <a className="underline" href="mailto:hello@zodaci.com">hello@zodaci.com</a>.</p>;

function Legal({ title, sections }: { title: string; sections: [string, string][] }) {
  return <article className="mx-auto max-w-3xl space-y-6"><h1 className="font-display text-4xl">{title}</h1><p className="text-sm text-muted-foreground">Last updated October 2026</p>{sections.map(([h, b]) => <section key={h} className="space-y-2"><h2 className="text-xl font-semibold">{h}</h2><p className="text-muted-foreground leading-relaxed">{b}</p></section>)}</article>;
}
export function PrivacyPage() {
  usePageMeta('Privacy Policy | Zodaci', 'How Zodaci stores and protects your birth details, readings and account data.');
  return <Legal title="Privacy Policy" sections={[
    ['What we collect', 'Your account email, the birth details you enter, notes and reflections you save, readings generated for you, and basic usage events (pages visited, buttons used) to improve the product. We never record the text you type into private chats in usage logs.'],
    ['How we use it', 'To calculate your chart, write your readings, run the features you choose, process payments and send emails you opted into.'],
    ['Who can see it', 'Only you, unless you share something in a space you created or joined. Payments are handled by our payment processor; we never see your full card number.'],
    ['AI processing', 'To write readings and counselor replies, relevant chart facts and your message are sent to an AI model provider. They are not used to build public profiles of you.'],
    ['Your choices', 'You can edit your birth details, unsubscribe from email at any time, and request deletion of your account and data by emailing hello@zodaci.com.'],
    ['Contact', 'Questions about privacy: hello@zodaci.com.'],
  ]} />;
}
export function TermsPage() {
  usePageMeta('Terms of Service | Zodaci', 'The terms for using Zodaci, its subscriptions and the printed AstroBook.');
  return <Legal title="Terms of Service" sections={[
    ['For reflection, not prediction', 'Zodaci offers astrology for entertainment, reflection and self-inquiry. It is not medical, psychological, legal or financial advice and does not predict events. Counselor features are not therapy; in a crisis, contact local emergency services.'],
    ['Your account', 'You are responsible for your sign-in details and for the accuracy of the birth details you enter.'],
    ['Subscriptions', 'Paid plans renew monthly until cancelled. You can cancel any time and keep access until the end of the paid period.'],
    ['AstroBook orders', 'Printed books are made to order from your readings. Production and shipping times are estimates. Contact us if a book arrives damaged.'],
    ['Community', 'Be kind, keep other people’s private information private and follow the community guidelines. We may remove content that breaks them.'],
    ['Contact', 'hello@zodaci.com'],
  ]} />;
}
