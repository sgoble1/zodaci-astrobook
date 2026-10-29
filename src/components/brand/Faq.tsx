import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BOOK_VERSIONS, money } from '@/lib/books';
import { CREDIT_ALLOWANCE, PLAN_NAME, REFUND_WINDOW_DAYS, SIGNUP_BONUS_CREDITS } from '@/lib/plans';

export type QA = { q: string; a: string };

/** Publishes one FAQPage schema for a page. Use once per page so search engines see no duplicates. */
export function useFaqSchema(items: QA[], id = 'faq-schema') {
  useEffect(() => {
    if (!items.length) return;
    const el = document.createElement('script');
    el.type = 'application/ld+json'; el.id = id;
    el.text = JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map(i => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })) });
    document.getElementById(id)?.remove(); document.head.appendChild(el);
    return () => el.remove();
  }, [items, id]);
}

/** Accordion FAQ. Publishes FAQPage structured data unless the page publishes a combined schema itself (schema={false}). */
export function Faq({ items, id = 'faq-schema', schema = true }: { items: QA[]; id?: string; schema?: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  useFaqSchema(schema ? items : [], id);
  return (
    <div className="divide-y divide-border border-y border-border">
      {items.map((it, i) => (
        <div key={it.q}>
          <Button type="button" variant="ghost" aria-expanded={open === i} aria-controls={`${id}-answer-${i}`} onClick={() => setOpen(open === i ? null : i)} className="h-auto w-full justify-between gap-4 whitespace-normal px-0 py-4 text-left font-medium">
            {it.q}<ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`} aria-hidden />
          </Button>
          <div id={`${id}-answer-${i}`} aria-hidden={open !== i} className={`grid transition-all duration-500 motion-reduce:transition-none ${open === i ? 'grid-rows-[1fr] pb-4' : 'grid-rows-[0fr]'}`}><p className="overflow-hidden text-muted-foreground leading-relaxed">{it.a}</p></div>
        </div>
      ))}
    </div>
  );
}

const joinNames = (names: string[]) => names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0] ?? '';
const DIGITAL = BOOK_VERSIONS.find(v => v.format === 'digital');
/** "Pocket and Classic ship in 5–7 business days (US). …" — built from the version table so it never drifts. */
const shippingTimes = () => {
  const groups = new Map<string, string[]>();
  BOOK_VERSIONS.filter(v => v.format === 'print').forEach(v => groups.set(v.ship, [...(groups.get(v.ship) ?? []), v.name]));
  return [...groups].map(([ship, names]) => `${joinNames(names)}: ${ship.replace(' (US)', '')}`).join('. ');
};
const SHIPPING_ANSWER = `${DIGITAL ? `The ${DIGITAL.name} is ready as soon as payment is confirmed. ` : ''}Printed books are made to order and ship free within the US. ${shippingTimes()}. We don't ship printed books outside the US yet.`;

export const PRICING_FAQ: QA[] = [
  { q: 'What happens when my free trial ends?', a: `Zodaci doesn't have a time-limited trial — the ${PLAN_NAME.free} plan is free forever. If a friend's invitation gave you 7 days of ${PLAN_NAME.full}, you return to ${PLAN_NAME.free} automatically when it ends and nothing is charged.` },
  { q: 'Can I cancel anytime?', a: 'Yes. Open Manage subscription on the pricing page and cancel in a couple of clicks. You keep access until the end of your billing period.' },
  { q: 'Do you offer refunds?', a: `Yes. Ask within ${REFUND_WINDOW_DAYS} days of your first subscription payment and we refund it in full — email hello@zodaci.com from your account address. After that, cancelling stops future renewals and you keep access until the period ends. AstroBooks are made to order, so they are reprinted free if damaged or misprinted rather than refunded.` },
  { q: 'Is my birth data private?', a: 'Your birth details, chart and readings are visible only to you unless you choose to share them, and we never sell them. To write readings, the relevant chart facts are sent to our AI provider; they are not used to build a public profile of you. Email hello@zodaci.com from your account address to have everything deleted.' },
  { q: "What if I don't know my birth time?", a: 'You can still begin. Planet signs and aspects come from your birth date and place. Your Rising sign and houses depend on the exact time, so Zodaci leaves them out instead of guessing. Add the time later and your chart recalculates.' },
  { q: "What's the difference between Zodaci and AstroBook?", a: 'Zodaci is the digital platform — your chart, readings and community all live here. AstroBook is a printed (or PDF) book made from your Zodaci readings and sold separately from plans. You can order one any time after creating your chart.' },
  { q: 'How does AstroBook shipping work?', a: SHIPPING_ANSWER },
  { q: 'Can I gift a subscription?', a: 'Not yet — each plan belongs to one account. You can send an AstroBook as a gift instead, with a personal message.' },
  { q: 'What are AI credits?', a: `Counselor replies, podcasts, covers and newly written pages are created live by AI and use credits: ${PLAN_NAME.free} ${CREDIT_ALLOWANCE.free}, ${PLAN_NAME.full} ${CREDIT_ALLOWANCE.full} and ${PLAN_NAME.creator} ${CREDIT_ALLOWANCE.creator} each month. New members also get a ${SIGNUP_BONUS_CREDITS}-credit welcome bonus. Saved readings never use credits to reopen.` },
];
export const ASTROBOOK_FAQ: QA[] = [
  { q: 'What exactly will my AstroBook contain?', a: 'Six volumes written from your own chart, in the same structure as our founders’ Masterbooks: I The Celestial Matrix (birth facts, planet table, Big Three, Moon phase), II The Twelve Temples (every house), III Planetary Geometry & Aspect Harmonics (every planet and your aspects), IV Esoteric Points (North Node, Chiron, sensitive points), V World Systems (Vedic, Chinese year, Life Path — from Classic up) and VI Cycles of Time (profection year, solar return, forecast). Readings you have finished in Zodaci are woven into the right volume, and larger versions add chapters. Compare versions on this page for the exact list.' },
  { q: 'How long does it take to receive?', a: SHIPPING_ANSWER },
  { q: 'Do you ship internationally?', a: `Not yet. Printed AstroBooks ship within the US only.${DIGITAL ? ` Readers anywhere can order the ${DIGITAL.name}.` : ''}` },
  { q: 'Is this truly personalized or is it generic content?', a: 'Every chapter in your AstroBook is built from your exact birth data — date, time and location. Your planetary positions, house placements and aspects are mathematically unique to your birth moment.' },
  { q: "What if I don't know my exact birth time?", a: 'You can still order. Planet signs, aspects and the chapters built on them print as normal. Your Rising sign and houses depend on the exact time, so the book marks them as unknown instead of guessing. If you find your time later, update your birth details before you order.' },
  { q: 'Can I order as a gift?', a: 'Yes. Mark your order as a gift, add a personal message and ship it straight to them. Each book is written from the birth details saved in the ordering account, so to give someone a book about their own chart, they create a free account with their birth details first.' },
  { q: "What's the difference between the versions?", a: 'Size, format, content depth and physical finish. See the version comparison table above for a side-by-side breakdown.' },
  { q: 'Can I order more than one?', a: 'Yes. You can order another copy or another version at any time from your account.' },
  { q: 'Is there a digital version?', a: DIGITAL ? `Yes — the ${DIGITAL.name} AstroBook is ${money(DIGITAL.price)} as a one-time purchase. It is full color, downloads from your orders page and can be printed at home.` : 'Not at the moment.' },
  { q: 'What printer do you use?', a: 'Lulu, a professional print-on-demand publisher. Every printed book uses a color interior and binding matched to its version.' },
  { q: 'What is your return / reprint policy?', a: 'If your book arrives damaged or with a print defect, we will reprint it at no charge. Because each book is personalized to your birth data, we do not accept returns for change of mind.' },
];
export const GENERAL_FAQ: { category: string; items: QA[] }[] = [
  { category: 'Getting started', items: [
    { q: 'What is a birth chart?', a: 'A birth chart (natal chart) is a snapshot of the sky at the exact moment you were born — the positions of the Sun, Moon and planets, expressed in zodiac signs and houses. Zodaci calculates yours with astronomy-grade data.' },
    { q: 'Do I need to know my exact birth time?', a: 'An exact time gives your Rising sign and houses. Without it you still get every planet sign and aspect, and Zodaci leaves out what depends on the time instead of guessing. Birth certificates often record the time.' },
    { q: 'Is Zodaci really free to start?', a: 'Yes. Your calculated chart wheel and your Sun, Moon and Rising are free, along with two full readings. You never pay to see your chart.' },
  ] },
  { category: 'About astrology', items: [
    { q: 'Is astrology scientifically accurate?', a: 'Astrology is not a scientifically validated way to predict personality or events, and we say so. The calculations are astronomically precise; the interpretation is a centuries-old symbolic language — useful for reflection, not as a forecast.' },
    { q: "What's the difference between a sun sign and a full birth chart?", a: 'Your sun sign is where the Sun was when you were born — the newspaper horoscope. A full chart includes ten planets, twelve houses and many aspects. Zodaci works with the full picture.' },
  ] },
  { category: 'Pricing & account', items: PRICING_FAQ.filter(i => !['How does AstroBook shipping work?', "What if I don't know my birth time?"].includes(i.q)) },
  { category: 'AstroBook', items: ASTROBOOK_FAQ },
  { category: 'Privacy & data', items: [
    { q: 'What data does Zodaci store?', a: 'Your birth details, account email, notes or reflections you save, and your readings. We never sell this data.' },
    { q: 'Can I delete my account and data?', a: 'Yes. Email hello@zodaci.com from your account address and we will permanently delete your account and associated data.' },
    { q: 'Is my data encrypted?', a: 'Data is encrypted in transit and stored with access rules so your birth details are never visible to other members.' },
  ] },
];
/** Every general question once, for the FAQ page's single combined schema. */
export const ALL_GENERAL_FAQ: QA[] = GENERAL_FAQ.flatMap(c => c.items).filter((it, i, all) => all.findIndex(x => x.q === it.q) === i);
