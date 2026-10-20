import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export type QA = { q: string; a: string };

/** Accordion FAQ that also publishes FAQPage structured data for search engines. */
export function Faq({ items, id = 'faq-schema' }: { items: QA[]; id?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  useEffect(() => {
    const el = document.createElement('script');
    el.type = 'application/ld+json'; el.id = id;
    el.text = JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map(i => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })) });
    document.getElementById(id)?.remove(); document.head.appendChild(el);
    return () => el.remove();
  }, [items, id]);
  return (
    <div className="divide-y divide-border border-y border-border">
      {items.map((it, i) => (
        <div key={it.q}>
          <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 py-4 text-left font-medium">
            {it.q}<ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`} aria-hidden />
          </button>
          <div className={`grid transition-all duration-500 ${open === i ? 'grid-rows-[1fr] pb-4' : 'grid-rows-[0fr]'}`}><p className="overflow-hidden text-muted-foreground leading-relaxed">{it.a}</p></div>
        </div>
      ))}
    </div>
  );
}

export const PRICING_FAQ: QA[] = [
  { q: 'What happens when my free trial ends?', a: "Zodaci doesn't have a time-limited trial — the Free plan is free forever. You only upgrade when you're ready for more." },
  { q: 'Can I cancel anytime?', a: 'Yes. Open Manage subscription on the pricing page and cancel in a couple of clicks. You keep access until the end of your billing period.' },
  { q: 'Is my birth data private?', a: 'Absolutely. Your birth details, chart, and readings are never shared or sold. You can ask us to delete your data at any time by emailing hello@zodaci.com from your account address.' },
  { q: "What's the difference between Zodaci and AstroBook?", a: 'Zodaci is the digital platform — your chart, readings, and community all live here. AstroBook is a physical printed book we make for you, based on your Zodaci readings. You can order one anytime after creating your chart.' },
  { q: 'Do you offer refunds?', a: "Yes. If you're not satisfied within the first seven days of a paid subscription, contact us for a full refund — no questions asked." },
  { q: 'Can I gift a subscription?', a: "Gifting is coming soon. For now, AstroBook makes an excellent gift — it's personalized and physical." },
  { q: 'What are AI credits?', a: 'Counselor replies, podcasts, covers and newly written pages are created live by AI and use credits: Free 5, Pro 60 and Cosmic 150 each month. New members also get a 10-credit welcome bonus. Saved readings never use credits to reopen.' },
];
export const ASTROBOOK_FAQ: QA[] = [
  { q: 'What exactly will my AstroBook contain?', a: 'A fully personalized natal chart reading: birth chart wheel, all planet/sign/house interpretations, aspect grid, Chiron, North Node, birth sky map, Moon phase, journal prompts, and more. Specific contents vary by version — see the version comparison table.' },
  { q: 'How long does it take to receive?', a: "PDFs are ready as soon as payment is confirmed. Pocket and Classic editions ship in 5–7 business days (US). Signature Hardcover: 7–10 days. Collector's Linen: 10–14 days. We currently ship printed books within the US." },
  { q: 'Is this truly personalized or is it generic content?', a: 'Every chapter in your AstroBook is built from your exact birth data — date, time, and location. No two AstroBooks are alike. Your planetary positions, house placements, and aspects are mathematically unique to your birth moment.' },
  { q: "What if I don't know my exact birth time?", a: "You can still receive a meaningful AstroBook — we'll calculate with a noon birth time and note the limitation. For Rising Sign, houses, and time-sensitive placements, knowing your birth time gives the most accurate reading. Check your birth certificate or ask a parent." },
  { q: 'Can I order as a gift?', a: "Yes — it is one of the most personal gifts you can give. Mark your order as a gift, add a personal message, and ship it straight to them. Each book is written from the birth details saved in the ordering account, so to give someone a book about their own chart, they create a free account with their birth details. Collector's Linen arrives in its gift box." },
  { q: "What's the difference between the versions?", a: 'Size, format, content depth, and physical finish. See the full version comparison table above for a side-by-side breakdown.' },
  { q: 'Can I order more than one?', a: 'Yes — each book is unique to the birth data entered. You can order another copy or another version at any time from your account.' },
  { q: 'Is there a digital version?', a: 'Yes — the Digital PDF AstroBook is $24.99 as a one-time purchase. It is full color, downloads from your orders page, and can be printed at home.' },
  { q: 'What printer do you use?', a: 'Lulu — one of the leading professional print-on-demand publishers. Every printed book uses a color interior and professional binding matched to its version.' },
  { q: 'What is your return / reprint policy?', a: 'If your book arrives damaged or with a print defect, we will reprint it at no charge. Because each book is personalized to your birth data, we do not accept returns for change of mind — but we stand behind the quality of every print.' },
];
export const GENERAL_FAQ: { category: string; items: QA[] }[] = [
  { category: 'Getting started', items: [
    { q: 'What is a birth chart?', a: 'A birth chart (natal chart) is a snapshot of the sky at the exact moment you were born — the positions of the Sun, Moon and planets, expressed in zodiac signs and houses. Zodaci calculates yours with astronomy-grade data.' },
    { q: 'Do I need to know my exact birth time?', a: 'An exact time gives the most accurate Rising sign and houses. Without it you still get a chart, and Zodaci clearly flags what is uncertain. Birth certificates often record the time.' },
    { q: 'Is Zodaci really free to start?', a: 'Yes. Your full calculated chart — every planet, house and major aspect — is free. You never pay to see your chart.' },
  ] },
  { category: 'About astrology', items: [
    { q: 'Is astrology scientifically accurate?', a: 'Astrology is not a scientifically validated way to predict personality or events, and we say so. The calculations are astronomically precise; the interpretation is a centuries-old symbolic language — useful for reflection, not as a forecast.' },
    { q: "What's the difference between a sun sign and a full birth chart?", a: 'Your sun sign is where the Sun was when you were born — the newspaper horoscope. A full chart includes ten planets, twelve houses and many aspects. Zodaci works with the full picture.' },
  ] },
  { category: 'Pricing & account', items: PRICING_FAQ },
  { category: 'AstroBook', items: ASTROBOOK_FAQ },
  { category: 'Privacy & data', items: [
    { q: 'What data does Zodaci store?', a: 'Your birth details, account email, notes or reflections you save, and your readings. We do not share or sell this data.' },
    { q: 'Can I delete my account and data?', a: 'Yes. Email hello@zodaci.com from your account address and we will permanently delete your account and associated data.' },
    { q: 'Is my data encrypted?', a: 'Data is encrypted in transit and stored with access rules so your birth details are never visible to other members.' },
  ] },
];
