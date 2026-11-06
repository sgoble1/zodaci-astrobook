import { SAMPLE_EDITION } from '@/content/sampleEdition';

/**
 * "A horoscope says / Your chapter says": concrete depth taken from the public sample edition
 * (a fictional reader's birth moment, calculated like a real order). No private founder
 * text is used; the context example is labelled as an illustration of the feature.
 */
const [rising, sun] = SAMPLE_EDITION.pages;
const fact = (page: typeof rising, label: string) => page.facts.find(f => f.label === label)?.value ?? '';

export const SPECIFICITY_ROWS: { generic: string; specific: string; facts: string }[] = [
  {
    generic: 'Leo rising: confident, warm, loves attention.',
    specific: 'Your Ascendant is 12° Leo, so the Sun rules the whole chart, and it sits in Aries in the 9th house. Your warmth wants to start something: an idea, a trip, a course of study. Chiron, five degrees behind the Ascendant, can make being seen feel exposing at first; the chapter explains how that turns into a skill.',
    facts: `${fact(rising, 'Ascendant')} · ruler ${fact(rising, 'Chart ruler')} · ${fact(rising, 'In the 1st house')}`,
  },
  {
    generic: 'Venus retrograde people struggle in love.',
    specific: 'Venus was retrograde at 15° Aries in your 9th house, so what you value tends to be decided privately and revisited often. Two of your tightest aspects involve this Venus: a trine to the North Node within 0.1° and a square to Mars within 0.3°. One ties what you love to where your life is heading; the other puts desire and drive at odds.',
    facts: `Venus ${fact(sun, 'Venus')} · ${fact(sun, 'Tightest aspects')}`,
  },
];

export function SpecificityExamples({ className }: { className?: string }) {
  return (
    <section aria-labelledby="specificity-h" className={className}>
      <h3 id="specificity-h" className="font-label text-xl tracking-[0.1em]">The difference, side by side</h3>
      <p className="mt-1 text-sm text-muted-foreground">From our public sample edition: a real calculated chart printed under the invented name {SAMPLE_EDITION.owner}.</p>
      <ul className="mt-4 space-y-4">
        {SPECIFICITY_ROWS.map(r => (
          <li key={r.generic} className="specific-row">
            <div className="specific-generic"><p className="font-label text-xs tracking-[0.16em] text-muted-foreground">A sun-sign horoscope says</p><p className="mt-1 text-sm italic">“{r.generic}”</p></div>
            <div className="specific-zodaci"><p className="font-label text-xs tracking-[0.16em] text-primary">Your chapter says</p><p className="mt-1 text-sm leading-relaxed">{r.specific}</p><p className="mt-2 font-label text-[0.68rem] tracking-[0.12em] text-muted-foreground">Calculated: {r.facts}</p></div>
          </li>
        ))}
        <li className="specific-row">
          <div className="specific-generic"><p className="font-label text-xs tracking-[0.16em] text-muted-foreground">Example context you add</p><p className="mt-1 text-sm italic">“I’m deciding whether to go back to school next year.”</p></div>
          <div className="specific-zodaci"><p className="font-label text-xs tracking-[0.16em] text-primary">A new chapter can then explore</p><p className="mt-1 text-sm leading-relaxed">How the Aries Sun in the 9th house (study, belief, travel) and the retrograde Venus beside it (choosing something twice) bear on that decision, with the timing over the next year. The decision, and the facts of your life, stay yours.</p><p className="mt-2 font-label text-[0.68rem] tracking-[0.12em] text-muted-foreground">Illustration of the feature · your context is private and opt-in</p></div>
        </li>
      </ul>
    </section>
  );
}
