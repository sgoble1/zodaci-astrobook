/**
 * Reader's Compass: plain-language front matter for the AstroBook. Only terms that actually appear in that book are
 * explained, and each calculated chapter opens with "In this chapter" outcomes in ordinary words. No AI, no new claims.
 */
export const GLOSSARY: { term: string; plain: string; match: RegExp }[] = [
  { term: 'Sign', plain: 'One of twelve 30° slices of the sky. It describes the style a planet works in.', match: /\bsigns?\b/i },
  { term: 'House', plain: 'One of twelve life areas (home, work, love…) worked out from your birth time and place.', match: /\bhouses?\b/i },
  { term: 'Rising sign (Ascendant)', plain: 'The sign coming up over the eastern horizon when you were born: your first impression and approach.', match: /\b(rising|ascendant)\b/i },
  { term: 'Aspect', plain: 'An angle between two planets. It shows how those two parts of you get along.', match: /\baspects?\b/i },
  { term: 'Orb', plain: 'How many degrees an aspect is from exact. Smaller means stronger.', match: /\borbs?\b/i },
  { term: 'Conjunction', plain: 'Two planets side by side: their themes blend.', match: /\bconjunct(ion)?s?\b/i },
  { term: 'Square', plain: 'Planets 90° apart: friction that pushes you to act.', match: /\bsquares?\b/i },
  { term: 'Trine', plain: 'Planets 120° apart: an easy, natural flow.', match: /\btrines?\b/i },
  { term: 'Opposition', plain: 'Planets 180° apart: a balancing act between two sides.', match: /\boppositions?\b/i },
  { term: 'Sextile', plain: 'Planets 60° apart: an opening that rewards effort.', match: /\bsextiles?\b/i },
  { term: 'Retrograde (℞)', plain: 'A planet that looked like it moved backward from Earth. It tends to work more inwardly.', match: /retrograde|℞/i },
  { term: 'Dignity', plain: 'How at home a planet is in its sign: strong, comfortable, or working against the grain.', match: /\bdignit(y|ies)\b/i },
  { term: 'Cusp', plain: 'The starting line of a house.', match: /\bcusps?\b/i },
  { term: 'Ruler', plain: 'The planet linked to a sign. A house is "ruled" by the planet of the sign on its cusp.', match: /\brul(er|ers|ership)\b/i },
  { term: 'North Node', plain: 'A calculated point showing the direction of growth your chart points toward.', match: /north node|\bnodes?\b/i },
  { term: 'Chiron', plain: 'A small body linked to old hurts and the way you help others with them.', match: /\bchiron\b/i },
  { term: 'Profection', plain: 'An old timing method: each birthday moves your focus to the next house, one per year.', match: /profection/i },
  { term: 'Solar return', plain: 'The chart for the moment the Sun returns to its birth place each year, near your birthday.', match: /solar return/i },
  { term: 'Midpoint', plain: 'The halfway point between two planets, read as a place where they combine.', match: /midpoints?/i },
  { term: 'Lot (Hermetic lot)', plain: 'A point calculated from three chart positions, such as the Lot of Fortune.', match: /\blots?\b|lot of/i },
  { term: 'Fixed star', plain: 'A bright star whose position barely moves, read when it sits on a planet or angle.', match: /fixed[- ]stars?/i },
  { term: 'Tropical / sidereal', plain: 'Two ways to measure the zodiac: by the seasons (tropical, used here) or by the stars (sidereal, used in Vedic).', match: /tropical|sidereal/i },
];

/** Glossary entries for terms that appear in the given text, in glossary order. */
export function compassFor(text: string) {
  return GLOSSARY.filter(g => g.match.test(text)).map(({ term, plain }) => ({ term, plain }));
}

/** Plain outcomes for calculated chapters, keyed by chapter title. Readings and drawn pages are left as written. */
export const CHAPTER_OUTCOMES: Record<string, [string, string, string]> = {
  'Your Big Three': ['How your Sun, Moon and Rising sign work together', 'What you show first, what you need, and what drives you', 'Where they agree and where they pull apart'],
  'Your Birth Moon Phase': ['The Moon phase on the day you were born', 'How much of the Moon was lit, and what that phase stands for', 'A plain reading of that rhythm in you'],
  'Dignities and Chart Emphasis': ['Which planets are strong or uneasy in their signs', 'Where your chart puts most of its weight', 'What that means in everyday terms'],
  'The Twelve Houses': ['All twelve life areas, one by one', 'Which sign and planets sit in each', 'Where most of your energy goes'],
  'Rulership Summary': ['Which planet looks after each life area', 'How your houses link to each other', 'The chain that runs your chart'],
  'Your Planets, One by One': ['Every planet by sign and house', 'What each one wants and how it goes after it', 'Exact degrees for each'],
  'Your Aspects': ['The closest angles between your planets', 'Which parts of you cooperate and which argue', 'How strong each one is (the orb)'],
  'Aspect Patterns': ['Larger shapes your planets make together', 'What each shape tends to feel like', 'Where it shows up in your life areas'],
  'Your North Node': ['The direction of growth your chart points to', 'The habit it asks you to loosen', 'Small, practical ways to lean into it'],
  'Shadow and Breakthrough': ['The pattern that tends to trip you up', 'What it is protecting', 'The turn that gets you past it'],
  'Your Profection Year': ['Which life area this year focuses on', 'Which planet is "in charge" this year', 'What to pay attention to'],
  'Life Cycles: Returns and Turning Points': ['The dates planets return to or challenge their birth places', 'Your age at each one', 'Which ones have passed and which are coming'],
  'RetroGOOD: Your Retrograde Planets': ['Which planets were retrograde when you were born', 'The inward strength each one gives', 'How to use it on purpose'],
  'Your Birth Moment Across Traditions': ['Your Vedic sidereal snapshot', 'Your Chinese year pillar', 'Your Life Path number'],
};

/** A chapter's content with its "In this chapter" block in front, when it has outcomes. */
export function withOutcomes(title: string, content: string): string {
  const o = CHAPTER_OUTCOMES[title];
  return o ? `**In this chapter**\n\n${o.map(x => `- ${x}`).join('\n')}\n\n${content}` : content;
}
