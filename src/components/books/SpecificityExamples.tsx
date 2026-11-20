import { SAMPLE_EDITION } from '@/content/sampleEdition';

/**
 * "A sign-only summary says / Your chapter says": concrete depth taken from the public sample edition
 * (a fictional reader's birth moment, calculated like a real order). No private founder
 * text is used; the context example is labelled as an illustration of the feature.
 */
const [rising, twelfth] = SAMPLE_EDITION.pages;
const fact = (page: typeof rising, label: string) => page.facts.find(f => f.label === label)?.value ?? '';

export const SPECIFICITY_ROWS: { generic: string; specific: string; facts: string; use: string }[] = [
  {
    generic: 'Taurus: calm, stubborn, loves comfort.',
    specific: 'People may see your steadiness before they see how much preparation it takes. Your Taurus Sun is just 0.3° from your Taurus Ascendant, but on its private, 12th-house side. That combination can describe someone who is visible while still needing room to work quietly. Venus, your rising sign’s ruler, also works behind the scenes in Aries: composure does not necessarily mean indecision, and privacy does not mean you have nothing to say. You don’t have to be available every time somebody notices you. Before a meeting, give yourself ten minutes to decide what you actually want to contribute. Then compare how you feel with the days when you arrive without that pause. The chart supplies the question; only your experience tells us whether the experiment helps.',
    facts: `${fact(rising, 'Ascendant')} · ${fact(rising, 'On the Ascendant')} · ruler ${fact(rising, 'Chart ruler')}`,
    use: 'A concrete question about boundaries and preparation, rather than a fixed personality label.',
  },
  {
    generic: 'Venus in Aries people rush into love.',
    specific: 'You can look unhurried and still know what you want immediately. Venus rules your Taurus Ascendant but sits in Aries in the 12th house, beside Jupiter within 1.7°. The symbolism combines private desire with a generous, quick yes. Your Cancer Moon in the 3rd house squares Venus within 0.5°: saying yes may also need a conversation about what feels safe. Neither need is the enemy. A useful reading holds the excitement and the need for reassurance in the same sentence, instead of calling one impulsive and the other needy. Before committing, tell someone you trust what attracts you and what worries you. Ask what the agreement will look like on an ordinary Tuesday. Both the wish and the practical answer deserve a place in your decision.',
    facts: `Venus ${fact(twelfth, 'Venus')} · ${fact(twelfth, 'Tightest aspect')}`,
    use: 'A way to think through enthusiasm and emotional needs together, without predicting a relationship outcome.',
  },
  {
    generic: 'Taurus people are practical, not imaginative.',
    specific: 'You may need to put an idea on paper before you can explain why it matters. Mercury at 7°49′ Taurus trines Neptune at 7°51′ Capricorn, with a measured orb of 0.04°. This is a particularly close link between concrete thinking and imagination. Mercury also sits in the 12th house: the idea may benefit from a private draft before a public conversation. That is a proposed working method, not a claim that you are secretly an artist. Sketch the room, write the conversation, build a small version. Then ask another person what they understood and check whether the real thing matches the feeling. A close aspect gives the reading focus; it doesn’t certify a talent you haven’t observed, or make your first impression immune to correction.',
    facts: fact(twelfth, 'Tightest aspect'),
    use: 'A practical experiment for creative work, grounded in a precise connection rather than praise that could fit anyone.',
  },
];

export function SpecificityExamples({ className }: { className?: string }) {
  return (
    <section aria-labelledby="specificity-h" className={className}>
      <h3 id="specificity-h" className="font-label text-xl tracking-[0.1em]">The difference, side by side</h3>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">For {SAMPLE_EDITION.owner}, our fictional sample reader. Each passage connects several measured placements, explains the interpretation and offers something she could try. These are reading examples, not testimonials or evidence that astrology predicts events.</p>
      <ul className="mt-4 space-y-4">
        {SPECIFICITY_ROWS.map(r => (
          <li key={r.generic} className="specific-row">
            <div className="specific-generic"><p className="font-label text-xs tracking-[0.16em] text-muted-foreground">A sign-only summary says</p><p className="mt-1 text-sm italic">“{r.generic}”</p></div>
            <div className="specific-zodaci"><p className="font-label text-xs tracking-[0.16em] text-primary">Your chapter says</p><p className="mt-2 text-base leading-relaxed">{r.specific}</p><p className="mt-3 text-sm text-muted-foreground">Calculated: {r.facts}</p><p className="mt-3 border-t border-border pt-3 text-sm leading-relaxed">{r.use}</p></div>
          </li>
        ))}
        <li className="specific-row">
          <div className="specific-generic"><p className="font-label text-xs tracking-[0.16em] text-muted-foreground">Example context you add</p><p className="mt-1 text-sm italic">“I’m deciding whether to go back to school next year.”</p></div>
          <div className="specific-zodaci"><p className="font-label text-xs tracking-[0.16em] text-primary">A new chapter can then explore</p><p className="mt-2 text-base leading-relaxed">For Rosalind’s chart, this question can connect Mercury’s close trine to Neptune with her Cancer Moon in the house of everyday learning. What kind of study lets her turn an idea into something tangible? What schedule leaves room for the conversations and familiar routines she values? The chapter can help her name those needs; it cannot know her budget, choose a school or promise success. Those facts come from her, if she chooses to include them.</p><p className="mt-3 text-sm text-muted-foreground">Illustrative context, not a saved personal report · private and opt-in</p></div>
        </li>
      </ul>
    </section>
  );
}
