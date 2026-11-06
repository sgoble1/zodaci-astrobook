import { SAMPLE_EDITION } from '@/content/sampleEdition';

/**
 * "A horoscope says / Your chapter says": concrete depth taken from the public sample edition
 * (a fictional reader's birth moment, calculated like a real order). No private founder
 * text is used; the context example is labelled as an illustration of the feature.
 */
const [rising, twelfth] = SAMPLE_EDITION.pages;
const fact = (page: typeof rising, label: string) => page.facts.find(f => f.label === label)?.value ?? '';

export const SPECIFICITY_ROWS: { generic: string; specific: string; facts: string }[] = [
  {
    generic: 'Taurus: calm, stubborn, loves comfort.',
    specific: 'Your Ascendant is 12° Taurus and your Sun is less than a third of a degree from it, so you were born just after sunrise. Who you are and how you come across are hard to separate. Because the Sun is still on the 12th-house side, you also need more quiet time than people expect; the chapter explains why.',
    facts: `${fact(rising, 'Ascendant')} · ${fact(rising, 'On the Ascendant')} · ruler ${fact(rising, 'Chart ruler')}`,
  },
  {
    generic: 'Venus in Aries people rush into love.',
    specific: 'Venus rules your chart and stands at 13° Aries in the 12th house, less than two degrees from Jupiter and three from the North Node. You may look unhurried but choose in an instant, and what you love tends to point where your life is growing. The tightest aspect in your chart, Mercury trine Neptune within 0.04°, lets you make a feeling concrete.',
    facts: `Venus ${fact(twelfth, 'Venus')} · ${fact(twelfth, 'Tightest aspect')}`,
  },
];

export function SpecificityExamples({ className }: { className?: string }) {
  return (
    <section aria-labelledby="specificity-h" className={className}>
      <h3 id="specificity-h" className="font-label text-xl tracking-[0.1em]">The difference, side by side</h3>
      <p className="mt-1 text-sm text-muted-foreground">From our public sample edition for {SAMPLE_EDITION.owner}, a fictional reader whose birth moment is calculated like a real order.</p>
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
