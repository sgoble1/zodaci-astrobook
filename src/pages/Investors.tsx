import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PLAN_PRICE, PLAN_AMOUNT } from '@/lib/plans';
import { BOOK_VERSIONS, money } from '@/lib/books';
import { Button } from '@/components/ui/button';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PrintPartnerMatrix } from '@/components/common/PrintPartnerMatrix';
import { ThemeArt } from '@/components/common/ThemeArt';
import plate from '@/assets/sample-plate-rising.jpg';
import comic from '@/assets/comic-issue1-cover-v2.jpg';

const low = BOOK_VERSIONS[0]; const high = BOOK_VERSIONS[BOOK_VERSIONS.length - 1];
const PRODUCTS: [string, string, string][] = [
  ['self', 'Memberships', `Free, Pro ${PLAN_PRICE.full.month} and Cosmic ${PLAN_PRICE.creator.month}. Readings, counselors, workbook, podcasts and a Masterbook written from each member’s own calculated chart.`],
  ['sign', 'AstroBook', `A six-volume personal book in five editions, ${money(low.price)} to ${money(high.price)}, printed on demand. Same structure and depth as our founders’ Masterbooks.`],
  ['year', 'AstroComic', 'A monthly illustrated comic in the original Lantern & Ink style, starring the member’s chart. Issue #1 is drawn and on sale in print.'],
  ['chart', 'Shop', 'Posters, sticker sheets and notebooks, sold and fulfilled through a live Shopify storefront.'],
];
const LIVE = [
  'Charts calculated in-app (planets, houses, angles, nodes, Chiron, asteroids) and checked against reference ephemerides in automated tests.',
  'Personal readings by tier, chart-aware AI counselors that replay full sessions, workbook tools and a shared “Reading Together” space for couples.',
  'Studio-voiced personal podcasts written from each member’s chart, saved to a private library.',
  'Other Systems: Vedic, Chinese Ba Zi, numerology, Feng Shui and Flying Stars, Nine Star Ki, Tzolk’in and more — all from the same birth data.',
  'Six-volume AstroBook builder with cover designer, previews and print-ready PDFs; three fully illustrated sample pages on the public site.',
  'AstroComic Issue #1: seven drawn pages, a 3D page-turning preview, a full read-through and a print page with specs and checkout.',
  'Subscriptions with verified webhooks, plan changes and refunds; Shopify checkout; order tracking and a print-dispatch console.',
  'Private editions that open only for their owner and the people they share with — enforced on the server, never by passwords on a device.',
];
const PHASES: { name: string; when: string; status: string; items: string[] }[] = [
  { name: 'Phase 1 · Foundation', when: 'Done', status: 'Live', items: ['Chart engine and accuracy tests', 'Memberships, readings, counselors, podcasts', 'Founder editions, sharing and privacy', 'Shop and AstroBook ordering'] },
  { name: 'Phase 2 · Launch polish', when: 'Now', status: 'In progress', items: ['Automated print fulfilment with the print partner', 'Sending domain for receipts and newsletters (DNS pending)', 'Remaining 17 pages of AstroComic Issue #1', 'Owner sign-off on shop pricing'] },
  { name: 'Phase 3 · Growth', when: 'Next', status: 'Planned', items: ['Chart-matched product recommendations', 'Comic character creator and three illustration styles', 'Gift AstroBooks and referral rewards', 'Monthly comic art pipeline at scale', 'Licensed source texts (Sabian Symbols, asteroid tables)', 'Mobile app wrapper'] },
  { name: 'Phase 4 · Zodaci Social', when: 'Future', status: 'Vision', items: ['Pseudonymous profiles and communities', 'Topic boards with posts, threads and voting', 'Compatibility discovery between members', 'Moderation, safety and privacy controls'] },
];
const SOCIAL = [
  ['Explore people, privately', 'Members choose a made-up handle, like on Reddit, and decide exactly which placements to show. Birth time and place stay hidden by default.'],
  ['Learn together', 'Communities for every sign, planet, house and tradition — posts, questions, threads and voting, with chart badges that show who is speaking from experience.'],
  ['Find highly compatible people', 'Opt-in matching for friendship, collaboration or romance using full synastry: every planet-to-planet aspect, house overlays, composite chart, Kua and element balance — not sun signs.'],
  ['Explain every match', 'Each score shows the exact aspects behind it, so members see why they connect and where they may clash.'],
];
const FUTURE = [
  ['Chart-matched shop', 'Each member sees posters, stickers, notebooks, crystals-style gifts and print editions picked from their own placements — a Leo Rising gets gold-leaf Leo art, a Capricorn Moon a structured planner. Recommendations come from the chart the member already has, so no extra data is needed.'],
  ['Make your own comic hero', 'Members design their AstroComic character: face, hair, skin tone, build, clothing and signature colours, saved once and reused in every monthly issue.'],
  ['Three illustration styles', 'Choose how each issue is drawn: Lantern & Ink (storybook ink and lamplight), Celestial Manga (clean line and screen tones) or Painted Myth (rich painted fantasy). Same chart story, three looks.'],
  ['Creator Studio downloads', 'Members make and keep their own pieces — phone wallpapers, printable chart posters, affirmation cards, journal pages, podcast episodes and comic panels — saved to their library.'],
];
const WHY_TRUST = [
  ['Calculated, not guessed', 'Positions come from a published astronomical engine using the exact birth time, place and historical time zone. Automated tests check planets, angles and houses against professional references to within one degree.'],
  ['Every reading cites its facts', 'Readings separate the chart facts (sign, degree, house, aspect) from the interpretation, so members can see exactly what each sentence is built on.'],
  ['Honest about uncertainty', 'No birth time means no houses or Rising sign claims. Near a sign boundary, the reading says so. Nothing about family or childhood is invented from symbols.'],
  ['Delivered to one person', 'Each reading, book, podcast and comic is written for one saved chart and kept private to that account.'],
];
const ARPU = { pro: PLAN_AMOUNT.full.month, cosmic: PLAN_AMOUNT.creator.month };
const SCENARIOS = [
  { members: 10_000, pro: 0.04, cosmic: 0.01, book: 0.02, shop: 0.03 },
  { members: 100_000, pro: 0.05, cosmic: 0.015, book: 0.025, shop: 0.05 },
  { members: 1_000_000, pro: 0.05, cosmic: 0.02, book: 0.03, shop: 0.08 },
];
const BOOK_AVG = 60; const SHOP_AVG = 25;
const yearly = (x: typeof SCENARIOS[number]) => Math.round(x.members * (x.pro * ARPU.pro * 12 + x.cosmic * ARPU.cosmic * 12 + x.book * BOOK_AVG + x.shop * SHOP_AVG * 2));
const usd = (n: number) => n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : `$${Math.round(n / 1e3)}K`;
type Metrics = { members: number; charts: number; paid: number; readings: number; podcasts: number; book_orders: number; comic_subs: number };

const NEEDS = ['Print-partner API credentials and a proofed physical sample of each edition', 'Verified sending domain for receipts', 'Illustration budget for monthly comics', 'Moderation and trust & safety design before any social features'];

/** Invite-only investor overview. Access is decided by the backend (can_view_investors). */
export default function Investors() {
  usePageMeta('Investor overview · Zodaci', 'Private investor overview.');
  const [ok, setOk] = useState<boolean | null>(null);
  const [m, setM] = useState<Metrics | null>(null);
  useEffect(() => { if (ok) void supabase.rpc('investor_metrics').then(({ data }) => setM((data as Metrics[] | null)?.[0] ?? null)); }, [ok]);
  useEffect(() => { void supabase.rpc('can_view_investors').then(({ data }) => setOk(data === true)); }, []);
  if (ok === null) return <p role="status" className="text-muted-foreground">Checking access…</p>;
  if (!ok) return <article className="mx-auto max-w-xl py-12 text-center"><h1 className="font-display text-3xl">Investor overview</h1><p className="mt-3 text-muted-foreground">This page is invite-only. Ask Shane for access.</p></article>;
  return (
    <article className="space-y-16">
      <header className="grid items-center gap-8 lg:grid-cols-[1fr_22rem]">
        <div>
          <div className="font-smallcaps text-xs text-gold">Private · Investor overview</div>
          <h1 className="text-4xl sm:text-6xl">Zodaci</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">A personal astrology studio. Every reading, book, comic and podcast is written from the member’s own calculated chart — and one day, the place where people find each other by it.</p>
          <div className="mt-6 flex flex-wrap gap-3"><Button asChild><Link to="/astrobook">See the AstroBook pages</Link></Button><Button asChild variant="outline"><Link to="/astrocomic">Read the comic</Link></Button><Button asChild variant="outline"><Link to="/demo">Try the demo</Link></Button></div>
        </div>
        <div className="grid grid-cols-2 gap-3"><img src={plate} alt="Illuminated AstroBook plate" width={1024} height={1280} className="rounded border border-gold/40" /><img src={comic} alt="AstroComic Issue 1 cover" width={1024} height={1536} className="rounded border border-gold/40" /></div>
      </header>

      <section aria-labelledby="inv-p" className="space-y-4"><h2 id="inv-p" className="text-3xl">What we sell</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{PRODUCTS.map(([k, t, d]) => <div key={t} className="vellum p-5"><ThemeArt kind={k as never} className="h-14 w-14" /><h3 className="mt-3 text-xl">{t}</h3><p className="mt-2 text-sm text-muted-foreground">{d}</p></div>)}</div>
      </section>

      <section aria-labelledby="inv-l" className="space-y-4"><h2 id="inv-l" className="text-3xl">What works today</h2>
        <ul className="grid gap-3 md:grid-cols-2">{LIVE.map(m => <li key={m} className="flex gap-3 rounded-lg border border-border/60 bg-card/40 p-4 text-sm"><span aria-hidden className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold" />{m}</li>)}</ul>
      </section>

      <section aria-labelledby="inv-r" className="space-y-4"><h2 id="inv-r" className="text-3xl">Roadmap</h2>
        <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{PHASES.map(p => <li key={p.name} className="vellum flex flex-col p-5"><p className="font-smallcaps text-xs text-gold">{p.when} · {p.status}</p><h3 className="mt-1 text-xl">{p.name}</h3><ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">{p.items.map(i => <li key={i}>{i}</li>)}</ul></li>)}</ol>
      </section>

      <section aria-labelledby="inv-s" className="vellum space-y-6 p-6 sm:p-10">
        <div className="max-w-3xl"><p className="font-smallcaps text-xs text-gold">Future · Phase 4</p><h2 id="inv-s" className="mt-1 text-3xl sm:text-4xl">Zodaci Social: a network built on real charts</h2><p className="mt-3 text-muted-foreground">Reddit-style communities meet precise compatibility. Every member already has a calculated chart, so Zodaci can go where sun-sign apps cannot: explaining, aspect by aspect, why two people fit. This is a plan, not a live feature.</p></div>
        <div className="grid gap-4 sm:grid-cols-2">{SOCIAL.map(([t, d]) => <div key={t} className="rounded-lg border border-border/60 bg-background/40 p-5"><h3 className="text-lg">{t}</h3><p className="mt-2 text-sm text-muted-foreground">{d}</p></div>)}</div>
        <p className="text-xs text-muted-foreground">Privacy first: matching is opt-in, private readings and Masterbooks never become public, and members can leave and delete their profile at any time.</p>
      </section>

      <section aria-labelledby="inv-d" className="space-y-4"><h2 id="inv-d" className="text-3xl">Real numbers today</h2>
        <p className="text-muted-foreground">Counted live from the database. We are pre-launch: these are founders and early testers, not paying customers yet.</p>
        {m ? <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">{([['Accounts', m.members], ['Saved charts', m.charts], ['Readings written', m.readings], ['Podcasts made', m.podcasts], ['Paid memberships', m.paid], ['Books ordered', m.book_orders], ['Comic subscriptions', m.comic_subs]] as [string, number][]).map(([l, v]) => <div key={l} className="vellum p-4"><dt className="text-xs text-muted-foreground">{l}</dt><dd className="font-display text-3xl text-gold">{Number(v).toLocaleString()}</dd></div>)}</dl> : <p role="status" className="text-sm text-muted-foreground">Loading live numbers…</p>}
      </section>

      <section aria-labelledby="inv-t" className="space-y-4"><h2 id="inv-t" className="text-3xl">Why members can trust what they read</h2>
        <div className="grid gap-4 sm:grid-cols-2">{WHY_TRUST.map(([t, d]) => <div key={t} className="rounded-lg border border-border/60 bg-card/40 p-5"><h3 className="text-lg">{t}</h3><p className="mt-2 text-sm text-muted-foreground">{d}</p></div>)}</div>
      </section>

      <section aria-labelledby="inv-f" className="space-y-4"><h2 id="inv-f" className="text-3xl">Coming next for members</h2>
        <div className="grid gap-4 sm:grid-cols-2">{FUTURE.map(([t, d]) => <div key={t} className="vellum p-5"><p className="font-smallcaps text-xs text-gold">Planned</p><h3 className="mt-1 text-xl">{t}</h3><p className="mt-2 text-sm text-muted-foreground">{d}</p></div>)}</div>
      </section>

      <section aria-labelledby="inv-i" className="vellum space-y-5 p-6 sm:p-10">
        <div className="max-w-3xl"><p className="font-smallcaps text-xs text-gold">Projection · not a forecast</p><h2 id="inv-i" className="mt-1 text-3xl sm:text-4xl">Income potential</h2>
          <p className="mt-3 text-muted-foreground">Yearly revenue if Zodaci reaches each audience size, using today’s real prices (Pro {PLAN_PRICE.full.month}, Cosmic {PLAN_PRICE.creator.month}, books {money(low.price)}–{money(high.price)}). Conversion rates are assumptions in line with typical subscription apps, shown so you can judge them.</p></div>
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-muted-foreground"><th className="p-2">Free members</th><th className="p-2">Pro</th><th className="p-2">Cosmic</th><th className="p-2">Buy a book</th><th className="p-2">Shop, 2 orders/yr</th><th className="p-2 text-right">Yearly revenue</th></tr></thead>
          <tbody>{SCENARIOS.map(x => <tr key={x.members} className="border-t border-border/60"><td className="p-2">{x.members.toLocaleString()}</td><td className="p-2">{x.pro * 100}%</td><td className="p-2">{x.cosmic * 100}%</td><td className="p-2">{x.book * 100}%</td><td className="p-2">{x.shop * 100}%</td><td className="p-2 text-right font-display text-xl text-gold">{usd(yearly(x))}</td></tr>)}</tbody></table></div>
        <p className="text-sm text-muted-foreground">Assumes an average book of ${BOOK_AVG} and shop order of ${SHOP_AVG}; excludes comics, gifts and costs. The bigger upside is the combination: a social network gives every member reasons to return daily, and every visit shows products matched to their chart — compatibility gifts, couple’s books, friends’ posters — so community activity turns directly into shop and book sales.</p>
      </section>

      <PrintPartnerMatrix />

      <section aria-labelledby="inv-n" className="grid gap-8 md:grid-cols-2">
        <div className="space-y-3"><h2 id="inv-n" className="text-2xl">What’s needed next</h2><ul className="list-disc space-y-2 pl-5 text-muted-foreground">{NEEDS.map(m => <li key={m}>{m}</li>)}</ul></div>
        <div className="space-y-3"><h2 className="text-2xl">What we don’t claim</h2><p className="text-muted-foreground">No testimonials, invented users or past revenue. The live numbers above are real; the income table is a clearly labelled projection.</p></div>
      </section>

      <div className="flex flex-wrap gap-3"><Button asChild><Link to="/welcome">See the public site</Link></Button><Button asChild variant="outline"><Link to="/store">Visit the shop</Link></Button><Button asChild variant="outline"><a href="mailto:shanegoble@gmail.com">Contact Shane</a></Button></div>
    </article>
  );
}
