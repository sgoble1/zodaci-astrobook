/**
 * Shared interpretation vocabulary from the Unified Master Specification: sign expressions (§4) and house arenas (§5).
 * Every library block and the Opening Letter use these, so a sign or house always reads the same way.
 */
export type SignExpression = { element: string; mode: string; ruler: string; core: string; gift: string; shadow: string };
export const SIGN_EXPRESSIONS: Record<string, SignExpression> = {
  Aries: { element: 'Fire', mode: 'cardinal', ruler: 'Mars', core: 'initiates, claims, moves first', gift: 'courage and clean starts', shadow: 'impatience, aggression' },
  Taurus: { element: 'Earth', mode: 'fixed', ruler: 'Venus', core: 'builds, steadies, savors', gift: 'reliability and sensual presence', shadow: 'stubbornness, possessiveness' },
  Gemini: { element: 'Air', mode: 'mutable', ruler: 'Mercury', core: 'questions, connects, translates', gift: 'curiosity and quick learning', shadow: 'scattered focus, surface living' },
  Cancer: { element: 'Water', mode: 'cardinal', ruler: 'Moon', core: 'protects, nurtures, remembers', gift: 'emotional intelligence', shadow: 'clinging, moods as weather' },
  Leo: { element: 'Fire', mode: 'fixed', ruler: 'Sun', core: 'radiates, creates, leads with heart', gift: 'warmth and generosity', shadow: 'need for applause, pride' },
  Virgo: { element: 'Earth', mode: 'mutable', ruler: 'Mercury', core: 'refines, serves, discerns', gift: 'skill and practical care', shadow: 'over-criticism, worry' },
  Libra: { element: 'Air', mode: 'cardinal', ruler: 'Venus', core: 'balances, relates, harmonizes', gift: 'grace and fairness', shadow: 'indecision, people-pleasing' },
  Scorpio: { element: 'Water', mode: 'fixed', ruler: 'Mars and Pluto', core: 'probes, transforms, commits', gift: 'depth and resilience', shadow: 'control, suspicion' },
  Sagittarius: { element: 'Fire', mode: 'mutable', ruler: 'Jupiter', core: 'explores, believes, teaches', gift: 'optimism and vision', shadow: 'preaching, restlessness' },
  Capricorn: { element: 'Earth', mode: 'cardinal', ruler: 'Saturn', core: 'structures, endures, achieves', gift: 'discipline and mastery', shadow: 'coldness, over-work' },
  Aquarius: { element: 'Air', mode: 'fixed', ruler: 'Saturn and Uranus', core: 'questions norms, innovates, belongs to the whole', gift: 'originality and independence', shadow: 'detachment, contrarianism' },
  Pisces: { element: 'Water', mode: 'mutable', ruler: 'Jupiter and Neptune', core: 'dissolves boundaries, imagines, feels with others', gift: 'compassion and imagination', shadow: 'escapism, blurred boundaries' },
};

export type HouseArena = { arena: string; question: string; themes: string };
/** Index 1–12. Angular houses (1, 4, 7, 10) add to a planet's significance. */
export const HOUSE_ARENAS: HouseArena[] = [
  { arena: '', question: '', themes: '' },
  { arena: 'self and presence', question: 'Who am I becoming?', themes: 'identity, body, first impressions, how you begin things' },
  { arena: 'resources and worth', question: 'What do I value and have?', themes: 'money, possessions, talents, self-worth' },
  { arena: 'mind and environment', question: 'How do I learn and connect?', themes: 'siblings, neighbors, study, everyday communication' },
  { arena: 'roots and home', question: 'Where do I belong?', themes: 'family, home, private emotional life' },
  { arena: 'creation and joy', question: 'What do I love to make?', themes: 'romance, children, play, self-expression' },
  { arena: 'craft and care', question: 'How do I serve and maintain?', themes: 'daily work, routines, health habits, skills' },
  { arena: 'partnership', question: 'Who meets me as an equal?', themes: 'marriage, close partners, open contracts' },
  { arena: 'merging and transformation', question: 'What do I share and release?', themes: 'intimacy, shared resources, loss, rebirth' },
  { arena: 'meaning and horizons', question: 'What do I believe?', themes: 'travel, higher learning, philosophy, publishing' },
  { arena: 'vocation and legacy', question: 'What will I be known for?', themes: 'career, reputation, public role, authority' },
  { arena: 'community and future', question: 'Whom do I build with?', themes: 'friends, groups, causes, long-range hopes' },
  { arena: 'hidden life and release', question: 'What lies beneath the surface?', themes: 'solitude, the unconscious, retreat, spiritual practice' },
];
