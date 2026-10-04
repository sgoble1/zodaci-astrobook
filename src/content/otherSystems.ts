import type { LucideIcon } from 'lucide-react';
import { CircleDot, Compass, Feather, Grid3X3, Layers3, Sparkles, Trees } from 'lucide-react';

export type OtherSystem = {
  slug: string;
  name: string;
  tradition: string;
  icon: LucideIcon;
  result: string;
  calculation: string;
  themes: string[];
  interpretation: string[];
  origin: string;
  history: string[];
  practiceToday: string;
  aprilSynthesis: string[];
  references: { label: string; href: string; note: string }[];
  caution: string;
};

export const OTHER_SYSTEMS: OtherSystem[] = [
  {
    slug: 'vedic', name: 'Vedic · Jyotish', tradition: 'India', icon: Compass,
    result: 'Sidereal Leo Sun · Pisces Moon · Sagittarius rising',
    calculation: 'April’s tropical longitudes are shifted by an approximate 23°43′ Lahiri ayanāṃśa for 1990. Houses remain tied to her recorded birth time and place.',
    themes: ['discernment', 'independence', 'meaning'],
    interpretation: [
      'The sidereal Leo Sun emphasizes warm sovereignty and visible creative integrity beneath April’s careful Virgo presentation.',
      'The Pisces Moon reframes emotional speed as sensitivity: quick reactions can be a protective surface over a highly permeable inner life.',
      'Sagittarius rising remains, reinforcing candour, learning, travel of mind, and the need for a life directed toward meaning.'
    ],
    origin: 'Jyotisha developed in South Asia from calendrical astronomy and omen traditions, later absorbing the twelve-sign zodiac and planetary techniques also found around the Hellenistic world. “Vedic astrology” is the common modern English label, although many of its surviving chart methods were developed after the earliest Vedic texts.',
    history: [
      'Sidereal astrology measures planets against a star-based zodiac. Ayanāṃśa is the offset used to account for the slow movement of the equinoxes against the stars.',
      'The Lahiri, or Chitrapaksha, ayanāṃśa became a major Indian standard in the twentieth century. It is one convention among several, so a different school can shift a placement near a sign boundary.',
      'A full Jyotish reading normally includes nakshatras, planetary periods called daśās, dignity, yogas and divisional charts. This AstroBook page is deliberately narrower.'
    ],
    practiceToday: 'People use Jyotish for reflection on temperament, duties, relationships and timing. Practitioners differ in lineage, house method and ayanāṃśa, so the name of the method matters.',
    aprilSynthesis: [
      'April’s sidereal Leo Sun does not erase her tropical Virgo Sun. It adds a second symbolic angle: careful analysis may serve a strong need to create, lead and be recognised for work she respects.',
      'Her sidereal Pisces Moon may describe emotional permeability beneath her fast Aries-Moon response. In practice, she may react quickly and still need quiet time afterward to sort out what she absorbed.',
      'Because her Sagittarius rising remains Sagittarius in this comparison, direct truth, learning and a meaningful direction are unusually consistent themes across both zodiacs.'
    ],
    references: [
      { label: 'Encyclopaedia Britannica · Astrology', href: 'https://www.britannica.com/topic/astrology', note: 'Historical overview and scientific status.' },
      { label: 'Government of India · Positional Astronomy Centre', href: 'https://mausam.imd.gov.in/imd_latest/contents/positional-astronomy.php', note: 'Institution responsible for the Indian Astronomical Ephemeris and calendar data.' }
    ],
    caution: 'This is a Lahiri-style sidereal comparison, not a full daśā or divisional-chart consultation. Astrology has not been shown to predict personality or events reliably in controlled tests.'
  },
  {
    slug: 'mayan-tzolkin', name: 'Maya · Tzolk’in', tradition: 'Mesoamerica', icon: CircleDot,
    result: 'Birth-day cycle: 13 Etz’nab’',
    calculation: 'Using the proleptic Gregorian date and the widely used GMT 584283 correlation, the 260-day ritual cycle resolves to tone 13 with the Etz’nab’ day sign.',
    themes: ['beginnings', 'instinct', 'nurture'],
    interpretation: [
      'Etz’nab’ is associated with flint, clarity, reflection, and the capacity to cut through confusion.',
      'Tone thirteen is often read as completion and transition: insight becomes a threshold into the next cycle.',
      'The overlap with April’s chart is discernment—the Virgo impulse to separate what is useful and true from what is not.'
    ],
    origin: 'The Tzolk’in is a 260-day sacred count used by Maya communities. It interlocks twenty named days with thirteen numbers. It is a living Indigenous calendar, not merely a modern personality system.',
    history: [
      'The 260-day count is attested in ancient Mesoamerica and continues in some Maya communities for ceremony, naming, divination and choosing significant days.',
      'Converting a Gregorian birthday requires a correlation constant. AstroBook uses the widely adopted Goodman–Martínez–Thompson value 584283, but correlation remains a scholarly question.',
      'Modern “Mayan astrology” websites often add personality language that should not be confused with one universal or unchanged Maya teaching.'
    ],
    practiceToday: 'Daykeepers in living Maya traditions use the count in community and ceremonial settings. This page offers a limited calendar comparison and does not claim to reproduce a daykeeper’s cultural interpretation.',
    aprilSynthesis: [
      'Etz’nab’ gives April a reflection about clean discernment: distinguish what was actually said from what fear or hope added to it.',
      'Tone thirteen can be used as a finishing question: what has this experience taught her, and what can now be completed rather than repeatedly reopened?',
      'That symbolic pair echoes her Virgo Mercury’s precision and eighth-house willingness to investigate, without proving those systems share an origin.'
    ],
    references: [
      { label: 'Smithsonian NMAI · Maya Calendar', href: 'https://maya.nmai.si.edu/calendar/maya-calendar-converter', note: 'Educational calendar explanation and GMT-based converter.' },
      { label: 'Encyclopaedia Britannica · Mayan calendar', href: 'https://www.britannica.com/topic/Mayan-calendar', note: 'Overview of the interconnected Maya calendar cycles.' }
    ],
    caution: 'Calendar correlations and day-sign readings vary. This is a respectful calendar lens, not a personality diagnosis or a substitute for teaching from a Maya daykeeper.'
  },
  {
    slug: 'tibetan-mewa', name: 'Tibetan Mewa & Parkha', tradition: 'Tibet and Himalayan astrology', icon: Grid3X3,
    result: 'White 1 Mewa · Water emphasis',
    calculation: 'The birth-year cycle is reduced through the traditional nine-number sequence; April’s 1990 birth resolves to Mewa 1, echoing her source-led Kua 1.',
    themes: ['depth', 'adaptability', 'inner knowing'],
    interpretation: [
      'White 1 is associated with water: movement, depth, intuition, and the ability to find a route around fixed obstacles.',
      'Its strongest resonance is with April’s Life Path 7 and eighth-house emphasis—private inquiry before public certainty.',
      'Water symbolism can balance her earth-heavy natal chart by valuing responsiveness alongside structure.'
    ],
    origin: 'Tibetan astrology is a layered Himalayan tradition combining Indian astronomical astrology, Chinese elemental and calendrical methods, and Tibetan religious practice. Mewa numbers and Parkha trigrams belong to its elemental-calculation stream.',
    history: [
      'Mewa uses nine numbers arranged through a nine-palace pattern, with colour, element and direction correspondences. Parkha uses eight trigrams related to the Chinese bagua.',
      'Historically these calculations supported calendars, medical timing, compatibility and ritual decisions; they were not designed as a stand-alone Western-style personality quiz.',
      'Kua and Mewa are related through shared nine-palace cosmology but are not identical systems. AstroBook shows April’s source-led Kua 1 as a comparison, not as proof that the calculations are interchangeable.'
    ],
    practiceToday: 'Tibetan medical and astrological institutes continue to train practitioners in larger systems that include elemental cycles, lunar calendars and individual calculations.',
    aprilSynthesis: [
      'White 1 Water offers April a practical counterweight to her strong earth symbolism: stay responsive without losing structure.',
      'Its inward quality fits her private eighth-house processing, while the directional emphasis suggests that environment and timing can affect how easily she thinks.',
      'The safest use is reflective: ask whether flexibility or a firmer boundary is needed now, rather than treating Water as a fixed personality verdict.'
    ],
    references: [
      { label: 'Men-Tsee-Khang · Tibetan Astrology', href: 'https://mentseekhang.org/astrology/', note: 'Living institutional overview from the Tibetan medical and astro institute.' },
      { label: 'Rubin Museum · Verbalizing the Visual', href: 'https://rubinmuseum.org/verbalizing-the-visual/', note: 'Museum context for reading Tibetan cultural and symbolic material carefully.' }
    ],
    caution: 'Full Tibetan astrology uses lunar-calendar, elemental and time calculations beyond this focused Mewa comparison. Kua 1 is shown separately because April’s source guide specifies it.'
  },
  {
    slug: 'nine-star-ki', name: 'Japanese Nine Star Ki', tradition: 'Japan', icon: Sparkles,
    result: '1 Water star',
    calculation: 'For a 1990 birth after the early-February solar-year boundary, the annual-star method subtracts the reduced year sum from 11 and reduces again: 11 − 1 = 10 → 1 Water.',
    themes: ['flow', 'listening', 'quiet influence'],
    interpretation: [
      'One Water often works through observation and timing rather than force, giving April a quieter complement to her Aries Moon.',
      'It supports depth, research, and indirect influence—qualities already visible in her eighth-house Virgo placements.',
      'The caution is diffusion: clear limits help sensitivity become discernment rather than over-absorption.'
    ],
    origin: 'Nine Star Ki is a Japanese system built from older Chinese nine-palace, yin–yang and five-phase ideas. Its recognisable modern form was organised in Japan during the early twentieth century rather than transmitted unchanged from remote antiquity.',
    history: [
      'The underlying Lo Shu diagram is an old Chinese three-by-three number pattern. Numbers rotate through nine positions and are associated with the five phases: Water, Wood, Fire, Earth and Metal.',
      'Japanese teachers developed the modern personality-and-timing system often called Nine Star Ki. Different schools calculate annual, monthly and energetic numbers somewhat differently.',
      'The solar year usually begins around 4 February, not 1 January, which matters for people born near that boundary. April’s September birthday is not borderline.'
    ],
    practiceToday: 'People use Nine Star Ki to reflect on temperament, timing, movement and relationships. It is often taught alongside feng shui or macrobiotic traditions in modern Western practice.',
    aprilSynthesis: [
      'One Water describes influence through timing and observation. For April, that can mean waiting until she knows her exact point rather than spending energy on every provocation.',
      'This complements, rather than cancels, her Aries Moon: the feeling can be immediate while the response remains chosen.',
      'The boundary lesson is especially useful beside her relationship-heavy chart—empathy does not require taking responsibility for another adult’s feelings.'
    ],
    references: [
      { label: 'Encyclopaedia Britannica · magic square', href: 'https://www.britannica.com/science/magic-square', note: 'Mathematical and historical context for the Lo Shu form.' },
      { label: 'Britannica · yin-yang', href: 'https://www.britannica.com/topic/yinyang', note: 'Background on the Chinese cosmology later used by many East Asian systems.' }
    ],
    caution: 'Nine Star Ki is a modern Japanese synthesis, and schools differ in formulas. The displayed result follows April’s documented Kua 1 while naming that source choice.'
  },
  {
    slug: 'chaldean-numerology', name: 'Chaldean Numerology', tradition: 'Mesopotamian-derived modern numerology', icon: Layers3,
    result: 'Birth number 6 · destiny rhythm 7',
    calculation: 'Birth day 6 gives the primary birth number. The full date 9 + 6 + 1 + 9 + 9 + 0 = 34, reduced to 7, matches April’s documented Life Path.',
    themes: ['care', 'truth-seeking', 'selectivity'],
    interpretation: [
      'Six brings responsibility, beauty, care, and a desire to make relationships and surroundings more coherent.',
      'Seven adds privacy, research, testing, and the need to reach understanding personally rather than accept consensus.',
      'Together they describe care guided by discernment: April gives most fully when trust and meaning are present.'
    ],
    origin: 'Modern “Chaldean numerology” is a Western esoteric letter-and-number method. Despite the ancient-sounding name, historians have not established its familiar Latin-letter chart as an intact system inherited from ancient Babylonia.',
    history: [
      'Ancient Mesopotamia did contain sophisticated mathematics, astronomy and divination, but that does not authenticate every later practice marketed as Chaldean.',
      'The modern method became popular through nineteenth- and twentieth-century occult writing, including the work of Cheiro.',
      'Name calculations depend on spelling, alphabet and the table a school uses. Date reduction is simpler, but its meaning remains symbolic rather than scientific.'
    ],
    practiceToday: 'Practitioners assign numbers to names and dates, then interpret compound and reduced numbers. AstroBook avoids a name-number claim because no chosen full name and spelling were supplied for that purpose.',
    aprilSynthesis: [
      'The 6 and 7 pairing gives April a useful tension to observe: caring for others versus protecting enough privacy to reach her own conclusions.',
      'Her healthiest “6” is chosen care, not automatic responsibility. Her healthiest “7” is thoughtful inquiry, not withdrawing until certainty is impossible.',
      'This echoes chart themes but does not independently verify them; repeated language across symbolic systems can also reflect broad statements that fit many people.'
    ],
    references: [
      { label: 'Encyclopaedia Britannica · Numerology', href: 'https://www.britannica.com/topic/numerology', note: 'History and definition of number divination.' },
      { label: 'Encyclopaedia Britannica · Chaldea', href: 'https://www.britannica.com/place/Chaldea', note: 'Historical context for the ancient people whose name was later borrowed.' }
    ],
    caution: 'This is a modern symbolic practice, not a verified ancient Chaldean personality system. Name-number work also requires an explicitly chosen name and spelling, so this page uses birth-date numbers only.'
  },
  {
    slug: 'tarot-birth-cards', name: 'Tarot Birth Cards', tradition: 'Western esoteric tarot', icon: Feather,
    result: 'VII · The Chariot',
    calculation: '9 + 6 + 1 + 9 + 9 + 0 = 34; 3 + 4 = 7. Major Arcana VII is The Chariot.',
    themes: ['direction', 'self-command', 'integration'],
    interpretation: [
      'The Chariot is not speed for its own sake; it is the ability to hold contrary forces in one chosen direction.',
      'That mirrors April’s need to coordinate Aries immediacy with Virgo and Capricorn control, even though her calculated Sun–Moon angle is not a standard opposition.',
      'The useful question is not “Which side wins?” but “What purpose is strong enough to coordinate both sides?”'
    ],
    origin: 'Tarot began as a fifteenth-century European card game. Divinatory and occult meanings developed later; birth-card formulas that reduce a birth date to Major Arcana are modern practices, not part of tarot’s earliest history.',
    history: [
      'The earliest surviving tarot decks were made for play in Renaissance Italy. Claims of an ancient Egyptian origin are not supported by the historical record.',
      'French occultists in the eighteenth and nineteenth centuries recast tarot as an esoteric system. The Hermetic Order of the Golden Dawn later organised influential links among cards, astrology, Hebrew letters and Kabbalah.',
      'Modern birth-card teachers use more than one reduction rule, so someone using another method may give a card pair rather than only The Chariot.'
    ],
    practiceToday: 'Birth cards are used as recurring images for journaling, values and decision-making. They are most useful as prompts that reveal what April thinks—not as authorities that decide for her.',
    aprilSynthesis: [
      'The Chariot asks April to define the destination before trying to control every moving part.',
      'Its paired forces offer a clean image for her fast Aries response and exacting Virgo review: both can contribute when neither is allowed to seize the reins alone.',
      'A practical question is: “What choice would still feel self-respecting tomorrow, after the immediate charge has passed?”'
    ],
    references: [
      { label: 'The Metropolitan Museum of Art · Tarot Cards', href: 'https://www.metmuseum.org/art/collection/search/475513', note: 'Museum record for early Italian tarot as playing cards.' },
      { label: 'Encyclopaedia Britannica · Tarot', href: 'https://www.britannica.com/topic/tarot', note: 'Concise history of the cards and later fortune-telling use.' }
    ],
    caution: 'Birth-card arithmetic is a modern reflective tarot practice with competing formulas, not a prediction, diagnosis or fixed verdict.'
  },
  {
    slug: 'celtic-tree-calendar', name: 'Celtic Tree Calendar', tradition: 'Modern Celtic revival', icon: Trees,
    result: 'Vine · gathering and discernment',
    calculation: 'In the commonly circulated thirteen-tree calendar, September 2–29 corresponds to Vine.',
    themes: ['harvest', 'discernment', 'sensory wisdom'],
    interpretation: [
      'Vine symbolism concerns ripening: knowing what is ready, what needs more time, and what should be released.',
      'This closely parallels April’s Virgo Sun—selection, refinement, and care with what enters the system.',
      'Its relational lesson is to let pleasure and receptivity stand beside evaluation rather than making either one the enemy.'
    ],
    origin: 'The popular thirteen-month “Celtic Tree Calendar” is a modern reconstruction inspired chiefly by Robert Graves’s 1948 book The White Goddess. It should not be presented as a documented ancient Celtic birth calendar.',
    history: [
      'Ogham is a real early medieval Irish writing system, and later manuscript traditions associated some letter names with trees.',
      'Robert Graves arranged selected tree associations into a poetic calendar. His proposal was imaginative and influential in modern spirituality, but it is not accepted as an ancient calendar by Celtic scholars.',
      'Date ranges and assigned trees vary among modern authors, which is why AstroBook labels the September result as the commonly circulated version.'
    ],
    practiceToday: 'Modern Pagan and nature-based practitioners may use the tree calendar for seasonal reflection. Its value here is poetic and ecological, not archaeological proof or personality measurement.',
    aprilSynthesis: [
      'Vine is a metaphor for evaluating what has ripened. For April, it supports reviewing visible results before investing more effort.',
      'That image pairs naturally with Virgo discernment, but the resemblance is an interpretation created here—not evidence of a historical connection between Celtic lore and astrology.',
      'The practical use is simple: name what is nourishing, what is unfinished and what can be pruned without turning the symbol into fate.'
    ],
    references: [
      { label: 'British Museum · Ogham inscribed stone', href: 'https://www.britishmuseum.org/collection/object/H_1853-0314-1', note: 'Material evidence for the historical ogham script.' },
      { label: 'Encyclopaedia Britannica · Robert Graves', href: 'https://www.britannica.com/biography/Robert-Graves', note: 'Context for the twentieth-century author of The White Goddess.' }
    ],
    caution: 'The tree calendar is a twentieth-century revival framework, not a securely attested ancient Celtic birth system. Its use here is explicitly poetic.'
  },
];

export const COMMON_THREADS = [
  { theme: 'Discernment before commitment', systems: ['Vedic', 'Chaldean', 'Tarot', 'Celtic'], explanation: 'Several lenses describe April as someone who tests meaning and coherence before investing fully. Her Virgo Sun and Life Path 7 provide the clearest source-backed anchor.' },
  { theme: 'Instinct held by structure', systems: ['Tzolk’in', 'Tarot', 'Nine Star Ki', 'Natal chart'], explanation: 'Fast instinct appears repeatedly, but so does the need to direct it. The shared lesson is integration—not suppressing immediacy, and not letting it steer without reflection.' },
  { theme: 'Private depth, selective intimacy', systems: ['Tibetan Mewa', 'Chaldean', 'Vedic', 'Natal chart'], explanation: 'Water and seven symbolism converge with April’s eighth-house emphasis: trust grows through depth, honesty, privacy, and sustained inquiry.' },
  { theme: 'Meaning as orientation', systems: ['Vedic', 'Tarot', 'Tzolk’in', 'Natal chart'], explanation: 'Sagittarius rising, Chariot direction, tone-seven reflection, and Jyotish’s dharmic framing all prioritize a meaningful trajectory over activity for its own sake.' },
];