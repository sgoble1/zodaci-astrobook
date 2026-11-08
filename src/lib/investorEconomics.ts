import { CREDIT_ALLOWANCE, CREDIT_PACKS, PLAN_AMOUNT } from '@/lib/plans';
import { BOOK_COSTING, BOOK_VERSIONS } from '@/lib/books';
import { COMIC_PLANS } from '@/lib/comic';

/**
 * Investor unit economics and scenarios, computed from the live price lists (plans.ts, books.ts, comic.ts) so the
 * investor page can never drift from what members are charged. Every cost below that is not a saved real cost is a
 * labelled assumption; nothing here is a result.
 */
export const ASSUMPTIONS = {
  /** Stripe standard US card pricing. */
  card: { pct: 0.029, fixed: 0.3 },
  /** Shopify checkout adds a transaction fee on top of card processing (plan-dependent). */
  shopExtraPct: 0.006,
  /** Estimated AI model cost per member AI credit (not the $0.35 build credit). */
  aiPerCredit: 0.01,
  /** Print cost per printed comic issue (digest, ~24 colour pages), before shipping. */
  comicPrint: 5,
  /** Average shop order and fulfilment cost per order. */
  shopOrder: 35, shopFulfil: 15,
  /** Share of the monthly allowance the average paying member actually spends. */
  allowanceUsed: 0.6,
} as const;

const round2 = (n: number) => Math.round(n * 100) / 100;
export const cardFee = (amount: number, extraPct = 0) => round2(amount * (ASSUMPTIONS.card.pct + extraPct) + ASSUMPTIONS.card.fixed);

export type UnitRow = { group: string; item: string; price: number; fees: number; cost: number; costNote: string; net: number };
const row = (group: string, item: string, price: number, cost: number, costNote: string, extraPct = 0): UnitRow => {
  const fees = cardFee(price, extraPct);
  return { group, item, price, fees, cost: round2(cost), costNote, net: round2(price - fees - cost) };
};

const aiMonth = (tier: 'full' | 'creator') => CREDIT_ALLOWANCE[tier] * ASSUMPTIONS.allowanceUsed * ASSUMPTIONS.aiPerCredit;

export function unitEconomics(): UnitRow[] {
  const rows: UnitRow[] = [
    row('Membership', 'Pro, monthly', PLAN_AMOUNT.full.month, aiMonth('full'), `AI: ${CREDIT_ALLOWANCE.full} credits, ${ASSUMPTIONS.allowanceUsed * 100}% used`),
    row('Membership', 'Cosmic, monthly', PLAN_AMOUNT.creator.month, aiMonth('creator'), `AI: ${CREDIT_ALLOWANCE.creator} credits, ${ASSUMPTIONS.allowanceUsed * 100}% used`),
    row('Membership', 'Pro, yearly', PLAN_AMOUNT.full.year, aiMonth('full') * 12, 'AI for 12 months'),
    row('Membership', 'Cosmic, yearly', PLAN_AMOUNT.creator.year, aiMonth('creator') * 12, 'AI for 12 months'),
  ];
  for (const v of BOOK_VERSIONS) {
    const c = BOOK_COSTING.find(x => x.edition === v.id);
    if (!c) continue;
    const price = c.price / 100;
    rows.push({ group: 'AstroBook', item: v.name, price, fees: c.fees / 100, cost: (c.print + c.shipping) / 100, costNote: c.print ? 'Print + shipping (saved costing)' : 'Digital, no print', net: round2((c.price - c.fees - c.print - c.shipping) / 100) });
  }
  rows.push(
    row('AstroComic', 'Monthly, per issue', COMIC_PLANS.monthly.cents / 100, ASSUMPTIONS.comicPrint, 'Print, before shipping'),
    row('AstroComic', 'Yearly, 12 issues', COMIC_PLANS.yearly.cents / 100, ASSUMPTIONS.comicPrint * 12, 'Print ×12, before shipping'),
    row('AstroComic', 'Single issue', COMIC_PLANS.single.cents / 100, ASSUMPTIONS.comicPrint, 'Print, before shipping'),
  );
  for (const p of CREDIT_PACKS) rows.push(row('Credit pack', `${p.credits} credits`, p.price, p.credits * ASSUMPTIONS.aiPerCredit, 'AI cost if every credit is used'));
  rows.push(row('Shop', 'Average order', ASSUMPTIONS.shopOrder, ASSUMPTIONS.shopFulfil, 'Print-on-demand fulfilment', ASSUMPTIONS.shopExtraPct));
  return rows;
}

/** Conversion assumptions per audience size (shares of registered members). */
export const SCENARIOS = [
  { members: 10_000, pro: 0.04, cosmic: 0.01, book: 0.02, comic: 0.01, shop: 0.03, packs: 0.02, infraMonth: 750 },
  { members: 100_000, pro: 0.05, cosmic: 0.015, book: 0.025, comic: 0.015, shop: 0.05, packs: 0.03, infraMonth: 3_500 },
  { members: 1_000_000, pro: 0.05, cosmic: 0.02, book: 0.03, comic: 0.02, shop: 0.08, packs: 0.04, infraMonth: 20_000 },
] as const;
export type Scenario = typeof SCENARIOS[number];
export type ScenarioLine = { line: string; buyers: number; gross: number; costs: number; net: number };

/**
 * Yearly gross, costs and net for one scenario. Members pay monthly (12 card charges); the average book is the
 * Classic edition; comic subscribers take the monthly plan for 12 issues; pack buyers buy one $20 pack a year.
 */
export function scenario(s: Scenario): { lines: ScenarioLine[]; gross: number; costs: number; net: number; arpu: number } {
  const units = unitEconomics();
  const u = (group: string, item: string) => units.find(r => r.group === group && r.item === item)!;
  const classic = units.find(r => r.group === 'AstroBook' && /classic/i.test(r.item)) ?? units.find(r => r.group === 'AstroBook')!;
  const pack = units.find(r => r.group === 'Credit pack' && r.price === 20) ?? units.find(r => r.group === 'Credit pack')!;
  const mk = (line: string, share: number, unit: UnitRow, times = 1): ScenarioLine => {
    const buyers = Math.round(s.members * share);
    const gross = buyers * unit.price * times, costs = buyers * (unit.fees + unit.cost) * times;
    return { line, buyers, gross: Math.round(gross), costs: Math.round(costs), net: Math.round(gross - costs) };
  };
  const lines = [
    mk('Pro members', s.pro, u('Membership', 'Pro, monthly'), 12),
    mk('Cosmic members', s.cosmic, u('Membership', 'Cosmic, monthly'), 12),
    mk('AstroBook orders', s.book, classic),
    mk('AstroComic subscribers', s.comic, u('AstroComic', 'Monthly, per issue'), 12),
    mk('Shop orders', s.shop, u('Shop', 'Average order')),
    mk('Credit packs', s.packs, pack),
  ];
  const infra = s.infraMonth * 12;
  lines.push({ line: 'Hosting & infrastructure', buyers: 0, gross: 0, costs: infra, net: -infra });
  const gross = lines.reduce((a, l) => a + l.gross, 0), costs = lines.reduce((a, l) => a + l.costs, 0);
  return { lines, gross, costs, net: gross - costs, arpu: round2(gross / s.members) };
}

/** Third-party market context, each with its source. Estimates vary widely between research firms. */
export const MARKET = [
  { figure: '$4.73B → $5.69B', text: 'Global astrology-app market, 2025 to 2026 (about 20% a year), projected at $11.71B by 2030.', source: 'The Business Research Company, Astrology App Market Report 2026', url: 'https://www.researchandmarkets.com/reports/6090017/astrology-app-market-report' },
  { figure: '$1.26B – $8.28B', text: 'Range of 2026 market sizes from four research firms: they count different things, so no single number deserves much weight.', source: 'AstrologyAPI, Astrology app statistics 2026', url: 'https://astrologyapi.com/blog/astrology-app-statistics' },
  { figure: '30%', text: 'of U.S. adults consult astrology, tarot cards or fortune tellers at least once a year; most say they do it for fun.', source: 'Pew Research Center, May 2025 (survey of 9,593 adults)', url: 'https://www.pewresearch.org/religion/2025/05/21/3-in-10-americans-consult-astrology-tarot-cards-or-fortune-tellers/' },
  { figure: '$50M ARR', text: 'Nebula (OBRIO) in 2023, with about 30 million users after roughly 250% growth that year.', source: 'Tech.eu, December 2023', url: 'https://tech.eu/2023/12/05/obrio/' },
] as const;
