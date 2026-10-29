import { CinematicVideo } from '@/components/fx/CinematicVideo';
import heroPoster from '@/assets/zodaci-brand-hero.jpg';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useJsonLd } from '@/hooks/useJsonLd';
import { Faq, ASTROBOOK_FAQ, GENERAL_FAQ, ALL_GENERAL_FAQ, useFaqSchema } from '@/components/brand/Faq';
import { BOOK_VERSIONS, EXTRA_SECTION_PRICE, money } from '@/lib/books';
import { PLAN_NAME, REFUND_WINDOW_DAYS } from '@/lib/plans';
import { VersionCompare } from '@/components/books/VersionCompare';
import { CoverCustomizer } from '@/components/books/CoverCustomizer';
import { CosmicTeaser } from '@/components/books/CosmicTeaser';
import { useCoverImage } from '@/hooks/useCoverImage';
import { DEFAULT_CROP } from '@/lib/coverLayout';
import { ThemeArt } from '@/components/common/ThemeArt';
import { SampleBook } from '@/components/books/SampleBookReader';
import { VOLUMES } from '@/lib/bookVolumes';
import { EditionPages } from '@/components/book/EditionPages';
import { SAMPLE_EDITION } from '@/content/sampleEdition';

/** The six volumes of every AstroBook, described from what buildVolumes() actually writes. */
const VOLUME_ART = { I: 'chart', II: 'house', III: 'aspect', IV: 'healing', V: 'sign', VI: 'year' } as const;
const VOLUME_DETAIL: Record<string, string> = {
  I: 'Opens with a letter from your chart, then birth facts, the planet table, your Big Three, chart ruler, dignities and Moon phase',
  II: 'All twelve houses, one by one: the sign on each cusp, its ruler and the planets inside',
  III: 'Every planet by sign and house, your aspects with exact orbs, and the aspect patterns they form',
  IV: 'Your North Node, shadow and breakthrough, then Chiron, sensitive points, lots and fixed stars in larger versions',
  V: 'A Vedic sidereal snapshot, your Chinese year pillar and your Life Path number (Classic and up)',
  VI: 'This year’s profection and your life cycles (Jupiter and Saturn returns), then retrogrades, solar return and a 12-month forecast',
};

export function AstroBookPublic() {
  usePageMeta('AstroBook — Your Personalized Birth Chart Book in Five Versions | Zodaci', 'A book written entirely from your birth chart. Digital PDF $24.99, Pocket $34.99, Classic $59.99, Signature Hardcover $97 and Collector’s Linen $149. Free US shipping.');
  useJsonLd('product-schema', { '@type': 'Product', name: 'AstroBook', brand: { '@type': 'Brand', name: 'Zodaci' }, description: 'A personalized book written from your own birth chart, in five versions.', offers: BOOK_VERSIONS.map(v => ({ '@type': 'Offer', name: `AstroBook ${v.name}`, price: (v.price / 100).toFixed(2), priceCurrency: 'USD', availability: 'https://schema.org/InStock', url: 'https://zodaci.com/astrobook' })) });
  const order = (id = 'classic') => `/auth?next=${encodeURIComponent(`/books?version=${id}`)}`;
  return (
    <article className="space-y-20">
      <section className="relative isolate grid items-center gap-10 overflow-hidden rounded p-6 sm:p-10 md:grid-cols-2">
        <CinematicVideo poster={heroPoster} /><div className="absolute inset-0 -z-10 bg-background/70" />
        <div className="space-y-5">
          <p className="text-xs font-medium tracking-[0.12em] text-accent">YOUR CHART, IN PRINT</p>
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">The book that only you could have written.</h1>
          <p className="text-lg text-muted-foreground">AstroBook is your own Masterbook: six volumes interpreting your complete birth chart — who you are, your houses, planets and aspects, the esoteric points, world traditions and timing — all written from your exact placements.</p>
          <p className="text-sm text-muted-foreground">{BOOK_VERSIONS.filter(v => v.id === 'digital' || v.id === 'pocket' || v.id === 'linen').map(v => `${v.name} ${money(v.price)}`).join(' · ')} · free US shipping on printed versions</p>
          <div className="flex flex-wrap items-center gap-4"><Button asChild size="lg"><Link to={order()}>Order your AstroBook</Link></Button><Link to="/book-preview" className="text-accent">Read a sample book →</Link><Link to="/demo" className="text-accent">Try the interactive demo →</Link></div>
        </div>
        <div className="vellum p-6"><h2 className="mb-4 font-display text-2xl">See your cover</h2><CoverCustomizer /></div>
      </section>
      <section id="full-edition" aria-labelledby="fe-h" className="space-y-6">
        <div className="max-w-3xl"><p className="font-smallcaps text-xs text-gold">Open the Collector’s edition</p><h2 id="fe-h" className="mt-1 font-display text-3xl sm:text-4xl">Three full pages from {SAMPLE_EDITION.owner}’s AstroBook</h2><p className="mt-3 text-muted-foreground">Exactly as they print: an illuminated plate for each placement, the calculated facts, then the interpretation. {SAMPLE_EDITION.note} Your book is written the same way from your own chart.</p></div>
        <EditionPages pages={SAMPLE_EDITION.pages} />
        <div className="flex flex-wrap gap-4"><Button asChild size="lg"><Link to={order()}>Start my AstroBook</Link></Button><Link to="/astrocomic" className="self-center text-accent">Read {SAMPLE_EDITION.owner.split(' ')[0]}’s comic issue →</Link></div>
      </section>
      <section id="story" className="grid gap-8 md:grid-cols-2 items-center">
        <div className="space-y-4"><h2 className="font-display text-3xl">Calculated, not guessed.</h2><p className="text-muted-foreground">Every AstroBook starts with astronomy: the exact positions of the Sun, Moon and planets at the moment and place you were born. Interpretation comes second, and the book always tells you which is which.</p><p className="text-muted-foreground">Then we write it for one person. No two AstroBooks are alike, because no two birth moments are.</p></div>
        <div className="grid grid-cols-3 gap-3">{['midnight-stars', 'midnight-ember', 'gradient-violet-dusk'].map(k => <ExampleCover key={k} design={k} />)}</div>
      </section>
      <section id="inside" className="space-y-6">
        <h2 className="font-display text-3xl">Six volumes, one sky.</h2>
        <p className="text-muted-foreground">Every AstroBook follows the same six-volume structure as our founders’ Masterbooks, written from your chart. Every version includes Volumes I–IV and VI; World Systems begins at Classic, and larger versions add chapters inside each volume. Compare them below.</p>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{VOLUMES.map(v => <li key={v.n} className="vellum p-5"><ThemeArt kind={VOLUME_ART[v.n]} /><p className="mt-4 font-smallcaps text-xs text-gold">Volume {v.n}</p><h3 className="mt-1 text-xl">{v.title}</h3><p className="mt-2 text-sm text-muted-foreground">{VOLUME_DETAIL[v.n]}</p></li>)}</ol>
      </section>
      <section className="space-y-6">
        <h2 className="font-display text-3xl">How it works.</h2>
        <ol className="grid gap-4 md:grid-cols-4">{[
          ['chart', 'Add your birth details', 'Date, time and place. We calculate your exact chart.'],
          ['self', 'Your volumes are written', 'Every chapter comes from your own placements; finished readings are woven in.'],
          ['sign', 'Preview and choose', 'Read the real PDF, pick a version, cover and extras.'],
          ['year', 'Printed and shipped', 'Free US shipping on printed versions. Lulu fulfillment is being prepared; delivery estimates are confirmed before production.'],
        ].map(([k, t, d], i) => <li key={t} className="vellum p-5"><ThemeArt kind={k as never} badge={i + 1} className="h-16 w-16" /><h3 className="mt-4 text-lg">{t}</h3><p className="mt-1 text-sm text-muted-foreground">{d}</p></li>)}</ol>
      </section>
      <section id="versions" className="space-y-6">
        <h2 className="font-display text-3xl">Choose your version.</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{BOOK_VERSIONS.map(v => <div key={v.id} className={`vellum flex flex-col p-5 ${v.id === 'classic' ? 'border-primary/70 shadow-[var(--shadow-gold)]' : ''}`}>
          <p className="font-smallcaps text-xs text-gold">{v.trim ?? 'PDF download'}</p><h3 className="mt-1 text-xl">{v.name}</h3>
          <p className="mt-3 font-display text-4xl">{money(v.price)}</p><p className="text-xs text-muted-foreground">{v.format === 'digital' ? 'One-time purchase' : 'Free US shipping'} · {v.pages[0]}–{v.pages[1]} pages</p>
          <p className="mt-3 text-sm text-muted-foreground">{v.tagline}</p>
          <ul className="mt-4 flex-1 space-y-1.5">{v.inside.slice(0, 4).map(x => <li key={x} className="flex gap-2 text-xs"><Check className="h-4 w-4 shrink-0 text-accent" aria-hidden />{x}</li>)}</ul>
          <Button asChild variant={v.id === 'classic' ? 'default' : 'outline'} className="mt-5"><Link to={order(v.id)}>Choose {v.name}<ArrowRight /></Link></Button>
        </div>)}</div>
        <VersionCompare orderLink />
        <p className="text-xs text-muted-foreground">Page ranges are targets; finished readings add pages. Your real page count is shown in the PDF preview before you pay. Extra sections are {money(EXTRA_SECTION_PRICE)} each.</p>
      </section>
      <section id="look-inside" className="space-y-6">
        <h2 className="font-display text-3xl">Look inside before you order.</h2>
        <p className="text-muted-foreground">A short fictional sample for Olivia Chen, born March 14, 1992 in Portland, with calculated chart facts and illustrative passages. Your own book is written from your chart, adds your finished readings, and shows its real page count before payment. Turn the first pages below, or <Link to="/book-preview" className="underline text-accent">read the full sample book</Link>.</p>
        <SampleBook maxPages={6} cta={<Button asChild variant="outline"><Link to="/book-preview">Read the full sample<ArrowRight /></Link></Button>} />
      </section>
      <section id="teaser" className="grid gap-8 rounded-xl border border-gold/30 bg-card p-8 md:grid-cols-2">
        <div className="space-y-3"><h2 className="font-display text-3xl">Free Cosmic Teaser.</h2><p className="text-muted-foreground">Not ready for a book? Enter your email and birth date for a short, calculated teaser: your Sun sign, Chinese zodiac year and Life Path number. Free, instant, no account.</p></div>
        <CosmicTeaser />
      </section>
      <section id="gift" className="rounded-xl border border-primary/30 bg-primary/10 p-10 text-center space-y-4">
        <Gift className="mx-auto h-8 w-8 text-accent" aria-hidden />
        <h2 className="font-display text-3xl">The most personal gift you can give.</h2>
        <p className="mx-auto max-w-xl text-muted-foreground">Mark your order as a gift, add a message and ship it straight to them. Each book is written from the birth details on the ordering account, so to give someone a book about their own chart, ask them to create a free account first.</p>
        <Button asChild size="lg"><Link to={order('signature')}>Give an AstroBook</Link></Button>
      </section>
      <section className="space-y-4"><h2 className="font-display text-3xl">AstroBook questions</h2><Faq items={ASTROBOOK_FAQ} id="faq-astrobook" /></section>
    </article>
  );
}

export function FaqPage() {
  usePageMeta('FAQ — Zodaci Astrology Platform', 'Answers to common questions about Zodaci, your birth chart, AstroBook, pricing, refunds, shipping, privacy and more.');
  useFaqSchema(ALL_GENERAL_FAQ, 'faq-page-schema');
  return (
    <article className="mx-auto max-w-3xl space-y-10">
      <header className="space-y-3"><h1 className="font-display text-4xl">Questions, answered.</h1><p className="text-muted-foreground">Everything you might want to know before you begin.</p></header>
      {GENERAL_FAQ.map(c => <section key={c.category} className="space-y-3"><h2 className="text-xl font-semibold">{c.category}</h2><Faq items={c.items} id={`faq-${c.category.toLowerCase().replace(/[^a-z]+/g, '-')}`} schema={false} /></section>)}
      <FaqSchemaNote count={ALL_GENERAL_FAQ.length} />
      <div className="flex flex-wrap gap-3"><Button asChild><Link to="/auth?mode=signup&next=%2Fstart">Create my free chart <ArrowRight /></Link></Button><Button asChild variant="outline"><Link to="/pricing">Compare plans</Link></Button></div>
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
  usePageMeta('Terms of Service | Zodaci', 'The terms for using Zodaci, its subscriptions, refunds and the printed AstroBook.');
  return <Legal title="Terms of Service" sections={[
    ['For reflection, not prediction', 'Zodaci offers astrology for entertainment, reflection and self-inquiry. It is not medical, psychological, legal or financial advice and does not predict events. Counselor features are not therapy; in a crisis, contact local emergency services.'],
    ['Your account', 'You are responsible for your sign-in details and for the accuracy of the birth details you enter.'],
    ['Subscriptions', `${PLAN_NAME.full} and ${PLAN_NAME.creator} renew each month or each year, depending on the billing period you choose, until cancelled. You can cancel any time and keep access until the end of the paid period.`],
    ['Refunds', `If you ask within ${REFUND_WINDOW_DAYS} days of your first subscription payment, we refund that payment in full. Later renewals are not refunded, but cancelling stops the next one.`],
    ['AstroBook orders', 'Books are made to order from your readings. Printed versions ship within the US only; production and shipping times are estimates. Damaged or misprinted books are reprinted at no charge; because each book is personal, we do not accept change-of-mind returns.'],
    ['Community', 'Be kind, keep other people’s private information private and follow the community guidelines. We may remove content that breaks them.'],
    ['Contact', 'hello@zodaci.com'],
  ]} />;
}

/** A current cover design with a sample name, drawn exactly as a printed AstroBook cover. */
function ExampleCover({ design }: { design: string }) {
  const url = useCoverImage({ source: { kind: 'design', key: design }, crop: DEFAULT_CROP, name: 'Your Name', trimPt: [432, 648] }, 40);
  return <div className="aspect-[2/3] w-full overflow-hidden rounded bg-muted shadow-xl">{url && <img src={url} alt="Example AstroBook cover: your name as the title, “Your exact placement in print” beneath, AstroBook bottom right" className="h-full w-full object-cover" />}</div>;
}
