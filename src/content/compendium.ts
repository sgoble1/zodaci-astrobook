// Additional reference material for April's chart, transcribed verbatim from
// "April — The Complete Master Astrological Compendium" (PDF) and
// "April — Supplementary Volume II" where noted.
// Every entry carries a `source` pointer to the underlying PDF section/page
// so accuracy can be verified against the originals.

export interface SourceRef {
  doc: string;      // short document name
  section: string;  // section / chapter title
  page?: string;    // page number or range in the PDF
}

export interface SabianEntry {
  id: string;
  point: string;
  degree: string;
  symbol: string;
  interpretation: string;
  notes?: string;
  source: SourceRef;
}

const SRC_MASTER = 'Master Astrological Compendium';

export const SABIAN_SYMBOLS: SabianEntry[] = [
  { id: 'sabian-sun', point: 'Sun ☉', degree: 'Virgo 14°', symbol: 'A Family Tree',
    interpretation: "You are not just yourself — you are the culminating expression of every ancestor who came before. The family tree is your H8: inheritance, hidden legacy, ancestral karma. Your purpose is partly to alchemize what your lineage could not complete. The roots that entangle are also the roots that feed.",
    notes: "Rounded up from Virgo 13°33′. The tree image reinforces the 8th-house inheritance theme running through the entire chart.",
    source: { doc: SRC_MASTER, section: 'II · Sabian Symbols — The Luminaries', page: 'p. 41' } },
  { id: 'sabian-moon', point: 'Moon ☽', degree: 'Aries 7°', symbol: 'A Woman Veiled',
    interpretation: "She knows what she knows. The veil is not ignorance — it is discretion. Your emotional intelligence is vast, but you have learned, through necessity, when to reveal it and when to hold it close. The veil is also protection: the Aries Moon wants to charge forward, but something wiser in you knows to wait for the right moment of disclosure. When you speak from your emotional truth, the veil drops — and what is revealed is extraordinary.",
    notes: "Also cross-referenced with the Moon-Square-Uranus special aspect.",
    source: { doc: SRC_MASTER, section: 'II · Sabian Symbols — The Luminaries', page: 'p. 42' } },
  { id: 'sabian-mercury', point: 'Mercury ☿ Rx', degree: 'Virgo 17°', symbol: 'A Volcano in Eruption',
    interpretation: "Your mind does not trickle. It builds pressure underground — in the H8 of secrecy and depth — and when it speaks, it erupts. This is why your words have changed people. Mercury Rx in Virgo as final dispositor means this volcanic mind is the engine of everything. Trust the slow build. The eruption, when it comes, moves mountains.",
    source: { doc: SRC_MASTER, section: 'II · Sabian Symbols — Personal Planets', page: 'p. 43' } },
  { id: 'sabian-venus', point: 'Venus ♀', degree: 'Leo 29°', symbol: 'An Aging Man Gazes at Eternal Realities',
    interpretation: "Your Venus is ancient. Not old in a tired way — old in the way that has seen through every distraction and knows now what matters. Love, for you, is not decoration. It is the gaze at eternity. This Venus at the anaretic 29° has a quality of completion: as if you have loved before, many times, across many lifetimes, and now you love with the wisdom of all those iterations.",
    notes: "Anaretic 29° — a degree of completion. Also touched by Regulus (see Fixed Stars).",
    source: { doc: SRC_MASTER, section: 'II · Sabian Symbols — Personal Planets', page: 'p. 44' } },
  { id: 'sabian-mars', point: 'Mars ♂', degree: 'Gemini 3°', symbol: 'Holly and Mistletoe',
    interpretation: "Sacred and celebratory. Holly and mistletoe are plants of the solstice — the turning point, the threshold of light returning. Your Mars drives you toward that which is both beautiful and meaningful. Mistletoe grows between worlds, neither fully rooted in earth nor free of it. Your creative drive (H5) operates exactly this way — between the earthly and the transcendent.",
    source: { doc: SRC_MASTER, section: 'II · Sabian Symbols — Personal Planets', page: 'p. 45' } },
  { id: 'sabian-jupiter', point: 'Jupiter ♃', degree: 'Leo 4°', symbol: 'A Seagull Braving a Storm',
    interpretation: "Your chart ruler is not sheltered. Jupiter in Leo H7 conjunct the South Node means you have always known how to be magnificent in difficult conditions. The soul's inheritance is resilience. You don't just survive the storm — you look extraordinary doing it.",
    source: { doc: SRC_MASTER, section: 'II · Sabian Symbols — Social Planets', page: 'p. 46' } },
  { id: 'sabian-saturn', point: 'Saturn ♄ Rx', degree: 'Capricorn 19°', symbol: 'A Five-Year-Old Child Carrying a Bag',
    interpretation: "There is no more precise image in your entire chart. The weight — structural, ancestral, karmic — arrived before you had the musculature for it. Saturn Rx in H1 means you have spent your life becoming strong enough to carry what was handed to you at birth. By now, at 35, you are strong enough. The bag is still there, but your arms no longer tremble.",
    source: { doc: SRC_MASTER, section: 'II · Sabian Symbols — Social Planets', page: 'p. 46' } },
  { id: 'sabian-neptune', point: 'Neptune ♆ Rx', degree: 'Capricorn 12°', symbol: 'An Ancient Cathedral',
    interpretation: "You contain centuries of accumulated spiritual longing in your physical body. The ancient cathedral is Neptune Rx in H1 — not a building outside you, but an interior architecture of almost unbearable beauty. The vaulted ceiling of your inner life is higher than most people ever look.",
    source: { doc: SRC_MASTER, section: 'II · Sabian Symbols — Outer Planets', page: 'p. 47' } },
  { id: 'sabian-pluto', point: 'Pluto ♇', degree: 'Scorpio 15°', symbol: 'Children Playing Around Five Mounds of Sand',
    interpretation: "Pluto in domicile H10: the deep, regenerative force expressed through public life and career. The five mounds suggest elemental play — the unconscious structures that hold civilizations. What you build professionally will outlast the builder.",
    source: { doc: SRC_MASTER, section: 'II · Sabian Symbols — Outer Planets', page: 'p. 47' } },
  { id: 'sabian-asc', point: 'Ascendant', degree: 'Sagittarius 29°', symbol: 'The Pope Blessing the Faithful',
    interpretation: "The anaretic Ascendant carries a frequency of sacred authority — not institutional power, but the kind that arrives through genuine spiritual wisdom. You bless people by being yourself. Your presence, when you are fully in it, has a quality of grace that others feel in ways they cannot explain.",
    notes: "Anaretic 29° Sag — one of the most fateful ascendants possible.",
    source: { doc: SRC_MASTER, section: 'II · Sabian Symbols — Angles', page: 'p. 48' } },
  { id: 'sabian-mc', point: 'Midheaven', degree: 'Libra 25°', symbol: 'The Sight of an Autumn Leaf Brings to a Pilgrim the Sudden Consciousness of Beauty',
    interpretation: "Your career reaches its highest expression through beauty, sudden awareness, and the capacity to make people stop and see what they had always been walking past. Spica conjunct this MC confirms: your public life is touched by the divine gift of revelation.",
    notes: "Cross-reference: Spica conjunct MC (see Fixed Stars).",
    source: { doc: SRC_MASTER, section: 'II · Sabian Symbols — Angles', page: 'p. 48' } },
];

export interface FixedStar {
  id: string;
  name: string;
  degree: string;
  conjunct: string;
  orb: string;
  meaning: string;
  activation: string;
  // Approximate sky-map coordinates (0..100 for both), for the interactive diagram.
  x: number;
  y: number;
  magnitude: number; // visual brightness for the diagram (1 = brightest)
  source: SourceRef;
}

export const FIXED_STARS: FixedStar[] = [
  { id: 'star-spica', name: 'Spica', degree: 'Libra 24°08′', conjunct: 'Midheaven 24°59′', orb: "0°51′",
    meaning: "The luckiest star in astrology. Gift of brilliance, success, artistic talent. Associated with Virgo's wheat sheaf — the harvest of extraordinary effort.",
    activation: "You were born with the luckiest career star in the zodiac conjunct your Midheaven. The effort you put into your genuine life's work will be recognized and rewarded in ways that feel almost disproportionate. Spica's blessing is particularly strong for writers, healers, teachers, and those who work with invisible truths. The harvest will come. Trust the growing season.",
    x: 62, y: 28, magnitude: 1,
    source: { doc: SRC_MASTER, section: 'III · Fixed Stars — Royal Contacts', page: 'p. 52' } },
  { id: 'star-zubenelgenubi', name: 'Zubenelgenubi', degree: 'Scorpio 15°05′', conjunct: 'Pluto 15°28′ H10', orb: "0°23′",
    meaning: "Once the southern claw of Scorpio, now the northern scale of Libra. Star of karmic debts, injustice acknowledged, scales that must be balanced.",
    activation: "Your public life carries the frequency of justice. You are here, in part, to address what was unjust — in your lineage, in your communities, in the structures you encounter. What is hidden will surface through your career. What was silent will speak through your voice.",
    x: 74, y: 46, magnitude: 3,
    source: { doc: SRC_MASTER, section: 'III · Fixed Stars — Karmic Stars', page: 'p. 53' } },
  { id: 'star-gc', name: 'Galactic Center', degree: 'Sagittarius 27°00′', conjunct: 'Ascendant 29°28′', orb: "2°28′",
    meaning: "The supermassive black hole at the center of our galaxy. In astrology: the source of cosmic downloads, universal intelligence, information from beyond ordinary human frequency.",
    activation: "Your very body — your first house of self — is tuned to the universe's central broadcast. People born with this contact are often the ones who 'just know things,' who receive information in dreams, who have insights that arrive fully formed. When the download arrives, your Mercury Rx Virgo refines it into language the rest of us can use.",
    x: 50, y: 62, magnitude: 1,
    source: { doc: SRC_MASTER, section: 'III · Fixed Stars — Galactic Points', page: 'p. 54' } },
  { id: 'star-regulus', name: 'Regulus', degree: 'Leo 29°50′ (now Virgo)', conjunct: 'Venus 29°20′ H8', orb: "0°30′",
    meaning: "The Royal Star of the Lion. Star of royalty, ambition, leadership, and honor. Also carries the warning: avoid revenge and the petty use of power.",
    activation: "Regulus on your anaretic Venus in Leo H8 is astonishing. The star of kings and queens touches the planet of love at its most urgent degree, in the house of deep transformation. You have a regal quality in love — genuinely magnetic in a way others recognize as uncommon. Regulus's warning is particularly relevant for your Venus: when love has wounded you, the temptation is to wound back. The star says: don't. Your power is most magnificent when it rises above.",
    x: 32, y: 34, magnitude: 1,
    source: { doc: SRC_MASTER, section: 'III · Fixed Stars — Royal Contacts', page: 'p. 55' } },
  { id: 'star-achernar', name: 'Achernar', degree: 'Pisces ~15°', conjunct: 'H3 vicinity', orb: "Wide",
    meaning: "End of the river Eridanus. Star of success after great trials. Also associated with religious inspiration and spiritual authority.",
    activation: "In the vicinity of your third house of communication and mind, Achernar whispers of a long river journey that ends in success — not easy success, but the earned kind, the kind that comes after the long and winding river of your life's early trials. Your communication and voice, after the trials, arrive at something extraordinary.",
    x: 18, y: 72, magnitude: 2,
    source: { doc: SRC_MASTER, section: 'III · Fixed Stars — Southern Sky', page: 'p. 56' } },
];

export interface Asteroid {
  id: string;
  name: string;
  glyph: string;
  placement: string;
  archetype: string;
  expression: string;
  source: SourceRef;
}

export const ASTEROIDS: Asteroid[] = [
  { id: 'ast-juno', name: 'Juno', glyph: '⚵', placement: 'Cancer · H7',
    archetype: 'The Committed Partner. Queen of sacred marriage. What the soul needs to feel fully partnered.',
    expression: "Juno in Cancer in your seventh house is unambiguous: emotional safety is a requirement in partnership. You cannot open fully to a partner who does not make you feel held, protected, and emotionally met. Juno sits near your Part of Fortune in Cancer H7: your greatest luck in partnership comes through relationships that offer this emotional harbor. Partnerships built on performance (South Node Leo H7) will always feel hungry. Partnerships built on genuine care are where your fortune flows.",
    source: { doc: SRC_MASTER, section: 'IV · Asteroid Goddesses — Juno', page: 'p. 60' } },
  { id: 'ast-vesta', name: 'Vesta', glyph: '⚶', placement: 'Leo/Virgo · H8',
    archetype: 'The Sacred Flame. Devotion, focus, spiritual dedication.',
    expression: "Vesta in the H8 area speaks of a deep, burning devotion to the interior work — the hidden craft, the sacred study, the discipline of transformation itself. Your sacred flame burns brightest in private, in depth, in the kind of focus that requires solitude. For you the depth work is not draining — it is the source. Vesta in Leo brings creativity to the devotion: you are not merely a scholar at the altar, you are also an artist. The craft is beautiful and the dedication is total.",
    source: { doc: SRC_MASTER, section: 'IV · Asteroid Goddesses — Vesta', page: 'p. 61' } },
  { id: 'ast-ceres', name: 'Ceres', glyph: '⚳', placement: 'Pisces · H3',
    archetype: 'The Great Mother. Nourishment, loss and return, the cycle of giving and receiving care.',
    expression: "Ceres in Pisces H3 tells the story of a mother — and of your experience of being mothered — through the lens of infinite compassion and boundaries that dissolved before they were fully formed. The nourishment you received was sometimes ungrounded, sometimes sacrificial in ways that confused love with martyrdom. Your own nurturing intelligence is profound and empathic — you feed people through your words, your ideas, your ability to dissolve barriers between souls. The work is learning to nourish yourself with the same boundless compassion you offer others.",
    source: { doc: SRC_MASTER, section: 'IV · Asteroid Goddesses — Ceres', page: 'p. 62' } },
  { id: 'ast-pallas', name: 'Pallas Athena', glyph: '⚴', placement: 'Capricorn · H1',
    archetype: 'Strategic Wisdom. Pattern recognition, justice, the warrior mind in service of civilization.',
    expression: "Pallas in Capricorn H1 joins your stellium of Saturn, Uranus, and Neptune — adding strategic intelligence expressed through identity and presence. You have the warrior goddess's gift of pattern recognition. You see the structure beneath the surface of situations with extraordinary precision. In Capricorn, this intelligence is disciplined, patient, and long-game oriented. You do not miss things. You may choose not to name what you see, but you see it.",
    source: { doc: SRC_MASTER, section: 'IV · Asteroid Goddesses — Pallas', page: 'p. 63' } },
];

export interface SpecialAspect {
  id: string;
  name: string;
  planets: string;
  orb: string;
  significance: string;
  source: SourceRef;
}

export const SPECIAL_ASPECTS: SpecialAspect[] = [
  { id: 'aspect-triseptile', name: 'Sun–Moon Triseptile', planets: 'Sun ☉ / Moon ☽', orb: "0°02′ — EXTRAORDINARY",
    significance: "The 7th harmonic series. Triseptiles (154°17′) are among the rarest and most fated of aspects. An orb of 0°02′ is essentially exact. This aspect speaks of a life touched by fate in the most literal sense. The 7 harmonic resonates with your Life Path 7, your Personal Year 7 in 2026, and your Tarot Chariot (VII). Seven is your number.",
    source: { doc: SRC_MASTER, section: 'V · Rare & Minor Aspects — Harmonic 7', page: 'p. 71' } },
  { id: 'aspect-mars-saturn', name: 'Mars Sesquiquadrate Saturn', planets: 'Mars ♂ / Saturn ♄ Rx', orb: "0°53′",
    significance: "Tightest minor aspect in the chart. Creative drive in perpetual negotiation with structural discipline. The tension that produces mastery — if you don't let it produce paralysis instead. The builder perpetually frustrated by the pace of building.",
    source: { doc: SRC_MASTER, section: 'V · Rare & Minor Aspects — Sesquiquadrates', page: 'p. 72' } },
  { id: 'aspect-moon-uranus', name: 'Moon Square Uranus', planets: 'Moon ☽ / Uranus ♅ Rx', orb: "~1°",
    significance: "Emotional lightning. The inner life can change direction instantly. Sudden insights, unexpected emotional breakthroughs, and a nervous system that responds with more voltage than most. Uranus Rx in H1 means the lightning runs inward — revolutionary energy lives in your nervous system.",
    source: { doc: SRC_MASTER, section: 'V · Rare & Minor Aspects — Major Squares', page: 'p. 73' } },
  { id: 'aspect-jupiter-uranus', name: 'Jupiter Quincunx Uranus', planets: 'Jupiter ♃ / Uranus ♅ Rx', orb: "~1°38′",
    significance: "Chart ruler in perpetual adjustment with the internalized revolutionary. The quincunx requires constant recalibration — your need for expansion and your need for revolution operate at different frequencies. Part of why your life has felt like it keeps redirecting: that is not instability, it is accurate navigation.",
    source: { doc: SRC_MASTER, section: 'V · Rare & Minor Aspects — Quincunxes', page: 'p. 74' } },
  { id: 'aspect-mars-chiron', name: 'Antiscion of Mars → Chiron', planets: 'Mars ♂ / Chiron ⚷', orb: "2°28′",
    significance: "Mars and Chiron are in shadow-contact. Your creative drive and your deepest wound are secretly linked. Healing the Chiron Cancer H7 wound directly energizes the Mars Gemini H5 creative force — and vice versa. Creative expression is medicine for the wound.",
    source: { doc: SRC_MASTER, section: 'V · Rare & Minor Aspects — Antiscia', page: 'p. 75' } },
];

export interface ArabicPart {
  id: string;
  name: string;
  position: string;
  meaning: string;
  source: SourceRef;
}

export const ARABIC_PARTS: ArabicPart[] = [
  { id: 'lot-fortune', name: 'Lot of Fortune', position: 'Cancer 22°08′ · H7',
    meaning: "Your fortune, flow, and peak vitality are found through the themes of Cancer (emotional depth, nurturing, belonging, the mother-principle) expressed in the house of partnership. You are luckiest when you are emotionally authentic in relationship — when you let yourself be seen and held. Natural luck increases near water, near home environments, near anything that triggers safe belonging.",
    source: { doc: SRC_MASTER, section: 'VI · Arabic Parts — Lot of Fortune', page: 'p. 80' } },
  { id: 'lot-spirit', name: 'Lot of Spirit', position: '~Gemini 6°47′ · H5',
    meaning: "The soul's active purpose. Gemini 6°47′ H5 is conjunct natal Mars (3°45′ orb). Your soul's purpose is creative expression, communication, the play of ideas. The fifth house is the house of creativity, play, love affairs — not just romantic ones but love affairs with ideas, projects, vocations. Your spirit came here to create. Actively, generatively, joyfully.",
    source: { doc: SRC_MASTER, section: 'VI · Arabic Parts — Lot of Spirit', page: 'p. 81' } },
  { id: 'lot-marriage', name: 'Lot of Marriage', position: '~Leo 9–11° · H7–H8',
    meaning: "Falls near your Vertex at Leo 10°38′ H8 — the fated encounter point. Your most fated partnership encounters carry a Leo-H8 quality — they arrive with a sense of recognition, they transform you, they involve someone of genuine creative radiance or self-expressive power. When the Lot of Marriage and the Vertex are so close, partnerships arrive with the quality of destiny. They feel inevitable.",
    source: { doc: SRC_MASTER, section: 'VI · Arabic Parts — Lot of Marriage', page: 'p. 82' } },
];

export const PROFECTION_35 = {
  id: 'profection-35',
  age: 35,
  window: 'September 2025 – September 2026',
  house: 12,
  houseSign: 'Scorpio (from Sag ASC in Whole Signs)',
  traditionalLord: 'Mars (traditional ruler of Scorpio)',
  modernLord: 'Pluto (modern ruler of Scorpio, natal H10 domicile)',
  lordPosition: 'Pluto Scorpio 15°28′ H10 — in domicile',
  interpretation:
    "The Twelfth House Profection Year is one of the most misunderstood in all of astrology. The shadow reading calls it self-undoing and isolation; the depth reading names it the house of the unconscious made conscious — the work done in solitude that becomes the foundation for public emergence, of the dissolution of what no longer serves before the next first-house year of rebirth. With Scorpio ruling your 12th and Pluto in domicile Scorpio H10 as Time Lord, this year's theme is excavation of what is hidden, transformation of power structures, and the underground work that makes the next public emergence possible. September 2025 – September 2026 is a year to go deep — not to perform, but to excavate. The hidden material of your career — the work you haven't shown anyone, the ideas you haven't voiced, the power you haven't yet claimed — all of it is surfacing now. The 12th house profection year is preparation. The first house year that follows (age 36, beginning September 2026) will be the emergence.",
  alchemicalTheme:
    "What was hidden becomes above-ground. What was carried in secret becomes the offering. The underground becomes the cathedral floor everyone else will eventually walk on. This is not a year to rush the surface. This is a year to honor the deep.",
  source: { doc: SRC_MASTER, section: 'VII · Annual Profection — Age 35', page: 'p. 90' } as SourceRef,
} as const;

export const PRENATAL_ECLIPSE = {
  id: 'prenatal-eclipse',
  date: 'July 22, 1990 (46 days before birth)',
  position: '29°04′ Cancer · H7',
  interpretation:
    "An anaretic degree eclipse in the house of partnership and Chiron Cancer. Prenatal eclipses seed the soul's most important unfinished business from before birth. The 29° Cancer eclipse seeded the mother wound — the question of emotional belonging, of whether it is safe to need, of whether home is a place you are allowed to inhabit fully. The entire Chiron Cancer H7 story was already written in the sky before you arrived. You came ready to heal it.",
  source: { doc: SRC_MASTER, section: 'VII · Prenatal Solar Eclipse', page: 'p. 92' } as SourceRef,
} as const;

// Quarterly beats within the age-35 profection year, used by the interactive
// profection module. Kept short and interpretive — verbatim excerpts sit in
// the main `interpretation` above.
export interface ProfectionBeat {
  id: string;
  label: string;
  window: string;
  focus: string;
  detail: string;
}

export const PROFECTION_BEATS: ProfectionBeat[] = [
  { id: 'beat-q1', label: 'Descent',      window: 'Sep – Nov 2025',
    focus: 'Entering the underground.',
    detail: 'The birthday activates the 12th house. Old identifications begin to dissolve. Expect increased need for solitude, sleep, dreams. Do not force visibility. This is the descent into Pluto\'s domicile — Time Lord in H10 pulling from below.' },
  { id: 'beat-q2', label: 'Excavation',   window: 'Dec 2025 – Feb 2026',
    focus: 'What was hidden surfaces.',
    detail: 'Hidden material of the career — unspoken ideas, uncredited work, buried power — begins to rise. Mars (traditional lord) transits sensitive points; small conflicts illuminate large truths. Keep a private journal; it is a magical text this year.' },
  { id: 'beat-q3', label: 'Alchemy',      window: 'Mar – May 2026',
    focus: 'Transmuting the material.',
    detail: 'The extracted material is worked in secret — refined, edited, distilled. Personal Year 7 (numerology) resonates: introspection, mastery, the sacred laboratory. Pluto by transit continues to accompany the Time Lord\'s themes.' },
  { id: 'beat-q4', label: 'Threshold',    window: 'Jun – Sep 2026',
    focus: 'Preparing the emergence.',
    detail: 'The 12th-house year hands off to the 1st. What has been excavated and refined is now approaching the surface. September 2026 opens a new profection cycle — the offering is ready to be given.' },
];

// -----------------------------------------------------------------------------
// A single searchable index used by the ⌘K command palette. Every entry knows
// its title, body text, route, and (optionally) which drawer item to open.
// -----------------------------------------------------------------------------

export interface SearchDoc {
  id: string;
  kind: 'sabian' | 'star' | 'asteroid' | 'aspect' | 'part' | 'profection' | 'eclipse' | 'number' | 'transit' | 'pillar';
  title: string;
  subtitle: string;
  body: string;
  route: string;   // where to navigate on select
  drawer?: string; // optional drawer/hash id to open (e.g. `#sabian-sun`)
  source: SourceRef;
}

export const SEARCH_INDEX: SearchDoc[] = [
  ...SABIAN_SYMBOLS.map(s => ({
    id: s.id, kind: 'sabian' as const, title: `${s.point} — ${s.symbol}`,
    subtitle: `Sabian · ${s.degree}`,
    body: `${s.symbol} ${s.interpretation} ${s.notes ?? ''}`,
    route: '/compendium', drawer: `#${s.id}`, source: s.source,
  })),
  ...FIXED_STARS.map(s => ({
    id: s.id, kind: 'star' as const, title: s.name,
    subtitle: `Fixed Star · ${s.degree} · conj. ${s.conjunct}`,
    body: `${s.meaning} ${s.activation}`,
    route: '/star-map', drawer: `#${s.id}`, source: s.source,
  })),
  ...ASTEROIDS.map(a => ({
    id: a.id, kind: 'asteroid' as const, title: a.name,
    subtitle: `Asteroid Goddess · ${a.placement}`,
    body: `${a.archetype} ${a.expression}`,
    route: '/compendium', drawer: `#${a.id}`, source: a.source,
  })),
  ...SPECIAL_ASPECTS.map(a => ({
    id: a.id, kind: 'aspect' as const, title: a.name,
    subtitle: `Special Aspect · ${a.planets} · orb ${a.orb}`,
    body: a.significance,
    route: '/compendium', drawer: `#${a.id}`, source: a.source,
  })),
  ...ARABIC_PARTS.map(p => ({
    id: p.id, kind: 'part' as const, title: p.name,
    subtitle: `Arabic Part · ${p.position}`,
    body: p.meaning,
    route: '/compendium', drawer: `#${p.id}`, source: p.source,
  })),
  {
    id: PROFECTION_35.id, kind: 'profection', title: `Age ${PROFECTION_35.age} Profection — 12th House`,
    subtitle: `Profection · ${PROFECTION_35.window}`,
    body: `${PROFECTION_35.interpretation} ${PROFECTION_35.alchemicalTheme}`,
    route: '/profection', source: PROFECTION_35.source,
  },
  {
    id: PRENATAL_ECLIPSE.id, kind: 'eclipse', title: 'Prenatal Solar Eclipse',
    subtitle: `Eclipse · ${PRENATAL_ECLIPSE.position} · ${PRENATAL_ECLIPSE.date}`,
    body: PRENATAL_ECLIPSE.interpretation,
    route: '/profection', drawer: '#prenatal-eclipse', source: PRENATAL_ECLIPSE.source,
  },
];
