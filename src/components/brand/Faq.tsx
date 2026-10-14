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
  { q: 'Is there a time-limited trial?', a: 'No. The Free plan is free forever — your calculated chart and short readings stay yours. You only upgrade when you want more.' },
  { q: 'Can I cancel anytime?', a: 'Yes. Cancel from Manage subscription on the pricing page. You keep access until the end of your billing period, then return to Free.' },
  { q: 'Is my birth data private?', a: 'Yes. Your birth details, chart and readings are visible only to you unless you choose to share them in a space you created. We never sell your data.' },
  { q: "What's the difference between Zodaci and AstroBook?", a: 'Zodaci is the digital platform — your chart, readings and community live here. AstroBook is a printed book made from your Zodaci readings.' },
  { q: 'What are AI credits?', a: 'Counselor replies, podcasts and newly written pages are created live by AI. Paid plans include a monthly allowance.' },
  { q: 'Can I gift a subscription?', a: 'Gift subscriptions are coming soon. For now, an AstroBook makes a personal, physical gift.' },
];
export const ASTROBOOK_FAQ: QA[] = [
  { q: 'Do I need a Zodaci account?', a: 'Yes — a free account lets you enter birth details and preview the chapters before ordering.' },
  { q: 'How long does it take?', a: 'About three business days to produce, then five to seven business days for standard US shipping.' },
  { q: 'Can I preview it before ordering?', a: 'Yes. Your Zodaci readings become the chapters of your book, so you can read them in your account first.' },
  { q: 'What if my birth time is unknown?', a: 'We can still make the book. Sections that depend on an exact time — Rising sign and houses — are clearly marked as uncertain.' },
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
