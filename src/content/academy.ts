/** Zodaci Academy: short public lessons in four learning paths. Astronomy facts and symbolic tradition are kept distinct. */
export type Lesson = { slug: string; title: string; summary: string; minutes: number; sections: { title: string; text: string }[]; tryIt: { to: string; label: string } };
export type Path = { slug: string; title: string; intro: string; lessons: Lesson[] };

export const ACADEMY: Path[] = [
  { slug: 'foundations', title: 'Chart foundations', intro: 'The four building blocks of every birth chart, and how they fit together.', lessons: [
    { slug: 'planets', title: 'The planets: who is acting', summary: 'Ten bodies, ten kinds of energy — and why the Sun and Moon count as planets here.', minutes: 4, tryIt: { to: '/results', label: 'See your planets' }, sections: [
      { title: 'What is measured', text: 'A chart places the Sun, the Moon and the eight planets from Mercury to Pluto at their apparent positions along the ecliptic — the Sun’s yearly path against the stars — for one moment and one place. These positions are astronomy: they can be calculated to a fraction of a degree.' },
      { title: 'What astrologers read into it', text: 'In the tradition, each body stands for a kind of motivation. The Sun is identity and purpose, the Moon is needs and feelings, Mercury is thinking and talking, Venus is attraction and values, Mars is drive. Jupiter and Saturn describe growth and structure; Uranus, Neptune and Pluto move slowly and describe generational and deep change.' },
      { title: 'How to use it', text: 'Treat each planet as a question: where in my life does this motivation show up? A reading that names the planet behind each sentence lets you test it against your own experience instead of taking it on trust.' } ] },
    { slug: 'signs', title: 'The signs: how they act', summary: 'Twelve 30° slices of the sky, each with an element and a mode.', minutes: 4, tryIt: { to: '/results', label: 'Open your Blueprint' }, sections: [
      { title: 'Signs are not constellations', text: 'Tropical astrology divides the ecliptic into twelve equal 30° signs starting at the March equinox. Because Earth’s axis slowly wobbles, these signs no longer line up with the constellations of the same names — that is expected, not an error.' },
      { title: 'Element and mode', text: 'Each sign combines an element — fire, earth, air or water — with a mode: cardinal (starting), fixed (sustaining) or mutable (adapting). Aries is cardinal fire, Taurus fixed earth, Gemini mutable air, and so on around the wheel. Counting elements and modes across your chart gives a quick sense of its overall temperament.' },
      { title: 'Reading a placement', text: 'Put planet and sign together: Venus in Taurus describes attraction (Venus) expressed in a steady, sensory way (fixed earth). The sign is the style, not the subject.' } ] },
    { slug: 'houses', title: 'The houses: where it happens', summary: 'Twelve areas of life, set by your birth time and place.', minutes: 5, tryIt: { to: '/houses', label: 'Explore your houses' }, sections: [
      { title: 'Why the time matters', text: 'Houses divide the sky relative to your local horizon at birth. The Earth turns about one degree every four minutes, so the Rising sign and every house boundary depend on an accurate birth time and location.' },
      { title: 'Different house systems', text: 'Placidus, Whole Sign, Equal and Porphyry are different ways to draw those boundaries. They can place the same planet in different houses. Zodaci lets you compare systems so the uncertainty stays visible instead of hidden.' },
      { title: 'What each house covers', text: 'The 1st house is self and first impressions; the 4th home and roots; the 7th partnership; the 10th career and public life. A planet in a house suggests where its motivation tends to play out.' } ] },
    { slug: 'aspects', title: 'Aspects: how planets talk', summary: 'Angles between planets — conjunctions, trines, squares and oppositions.', minutes: 4, tryIt: { to: '/aspects', label: 'See your aspect grid' }, sections: [
      { title: 'Measured angles', text: 'An aspect is the angle between two planets along the zodiac. The main ones are 0° (conjunction), 60° (sextile), 90° (square), 120° (trine) and 180° (opposition). An orb is how far from exact the angle is allowed to be.' },
      { title: 'Easy and hard', text: 'Trines and sextiles are traditionally called flowing; squares and oppositions create friction. Friction is not bad — it is often where effort and growth live. A tight aspect (small orb) is felt more strongly than a wide one.' },
      { title: 'Patterns', text: 'Several aspects can lock into shapes such as a grand trine or a T-square. Zodaci detects these automatically from the calculated positions.' } ] },
  ] },
  { slug: 'timing', title: 'Timing and the moving sky', intro: 'How the planets keep moving after you were born, and how astrologers read that motion.', lessons: [
    { slug: 'transits', title: 'Transits', summary: 'Today’s planets touching the planets in your chart.', minutes: 4, tryIt: { to: '/transits', label: 'See today’s transits' }, sections: [
      { title: 'What a transit is', text: 'A transit happens when a planet in today’s sky forms an aspect to a planet or angle in your birth chart. Fast planets like the Moon pass by in hours; slow planets like Saturn can stay in orb for months.' },
      { title: 'Which ones matter', text: 'Slow planets to personal points (Sun, Moon, Rising, Midheaven) carry the most weight. Applying transits — still moving toward exact — are usually read as building, separating ones as easing.' },
      { title: 'A reflective use', text: 'Use a transit as a prompt: what is being asked of this part of my life right now? It describes a theme, not a guaranteed event.' } ] },
    { slug: 'retrogrades', title: 'Retrogrades, reframed', summary: 'Why planets appear to move backwards, and why it isn’t bad luck.', minutes: 4, tryIt: { to: '/retrogood', label: 'Open RetroGOOD' }, sections: [
      { title: 'The astronomy', text: 'From Earth, a planet appears to reverse for a while when Earth overtakes it (outer planets) or it overtakes Earth (Mercury and Venus). Nothing actually changes direction; it is a matter of viewpoint.' },
      { title: 'The tradition', text: 'Astrologers read retrograde periods as times to review, revise and return. In a birth chart, a retrograde planet is often described as working inward first — thinking before speaking, reconsidering before acting.' },
      { title: 'RetroGOOD', text: 'Zodaci’s RetroGOOD scores each retrograde planet in your chart by dignity and placement and frames it as a strength to understand, never a malfunction.' } ] },
    { slug: 'moon-cycle', title: 'The lunar cycle', summary: 'New, quarter and full Moons — a monthly rhythm for reflection.', minutes: 3, tryIt: { to: '/blog/learn/moon-phases-explained', label: 'Read the Moon phases guide' }, sections: [
      { title: 'What changes', text: 'Moon phases come from the changing angle between the Sun and Moon as seen from Earth: about 29.5 days from one New Moon to the next.' },
      { title: 'A simple practice', text: 'Many people use the New Moon to set an intention and the Full Moon to notice what has come to light. The phases are measured; the practice is a reflective habit, not a mechanism.' } ] },
    { slug: 'solar-return', title: 'Solar returns and profections', summary: 'Two traditional ways to frame your year ahead.', minutes: 4, tryIt: { to: '/profection', label: 'See your profection year' }, sections: [
      { title: 'Solar return', text: 'A solar return chart is cast for the moment the Sun returns to its exact birth position each year — usually within a day of your birthday. Astrologers read it as the tone of the year ahead.' },
      { title: 'Annual profections', text: 'Profections are a Hellenistic technique: each year of life activates the next house in order, starting with the 1st at birth. At 12, 24 and 36 the cycle begins again. The ruler of that house is treated as the year’s lead planet.' } ] },
  ] },
  { slug: 'traditions', title: 'Other traditions', intro: 'Chinese astrology, numerology and Feng Shui — calculated, and kept separate from Western astrology.', lessons: [
    { slug: 'ba-zi', title: 'Ba Zi: the Four Pillars', summary: 'Year, month, day and hour, each with a stem and branch.', minutes: 4, tryIt: { to: '/chinese', label: 'See your pillars' }, sections: [
      { title: 'The structure', text: 'Ba Zi (“eight characters”) describes a birth moment with four pillars — year, month, day and hour. Each pillar pairs one of ten Heavenly Stems with one of twelve Earthly Branches, the branches being the familiar animals.' },
      { title: 'Day Master', text: 'The stem of the day pillar, called the Day Master, is read as the self. The balance of the five elements — wood, fire, earth, metal and water — across all eight characters is the core of a reading.' },
      { title: 'The year boundary', text: 'The Chinese solar year begins around February 4 (Li Chun), not January 1, so people born in January or early February often belong to the previous year’s animal.' } ] },
    { slug: 'numerology', title: 'Numerology basics', summary: 'Life Path, Expression and Soul Urge — numbers from your date and name.', minutes: 3, tryIt: { to: '/numerology', label: 'Calculate your numbers' }, sections: [
      { title: 'Life Path', text: 'The Life Path number reduces your full birth date to a single digit (keeping the master numbers 11, 22 and 33). It is the most-used number in Western numerology.' },
      { title: 'Name numbers', text: 'Expression (all letters of your birth name), Soul Urge (vowels) and Personality (consonants) come from assigning numbers 1–9 to letters. Zodaci shows each calculation step so you can check it.' } ] },
    { slug: 'feng-shui', title: 'Feng Shui and your Kua number', summary: 'Personal directions from your birth year.', minutes: 3, tryIt: { to: '/feng-shui', label: 'Find your Kua number' }, sections: [
      { title: 'Kua number', text: 'In the Eight Mansions school, a Kua number is calculated from the birth year (using the solar year) and birth sex. It places you in the East or West group, each with four favorable and four less favorable compass directions.' },
      { title: 'Using it at home', text: 'Practitioners suggest facing a favorable direction at a desk or sleeping with your head toward one. Treat it as a design prompt for arranging a space you already enjoy.' } ] },
  ] },
  { slug: 'practice', title: 'Reading responsibly', intro: 'Getting real value from a reading without letting it write your story for you.', lessons: [
    { slug: 'reflection', title: 'Reflection, not prediction', summary: 'A grounded way to work with any reading.', minutes: 3, tryIt: { to: '/blog/learn/reflection-not-prediction', label: 'Read the full guide' }, sections: [
      { title: 'Ask, don’t accept', text: 'Read each statement as a question: does this fit? Where does it not? The parts that don’t fit are as informative as the parts that do.' },
      { title: 'What astrology is not', text: 'Astrology is not a scientifically validated way to predict personality or events, and it is never a substitute for medical, legal, financial or mental-health advice.' } ] },
    { slug: 'birth-time', title: 'When you don’t know your birth time', summary: 'What still works, what changes, and how to find it.', minutes: 3, tryIt: { to: '/start', label: 'Start your chart' }, sections: [
      { title: 'What still works', text: 'Planet signs (except sometimes the fast-moving Moon), most aspects, Chinese year and month pillars and all numerology work without a time.' },
      { title: 'What needs a time', text: 'The Rising sign, houses, the Midheaven and the Ba Zi hour pillar all depend on the exact time. Birth certificates, hospital records or a parent’s memory are the usual sources.' } ] },
    { slug: 'compatibility', title: 'Compatibility, honestly', summary: 'What comparing two charts can and can’t tell you.', minutes: 3, tryIt: { to: '/compatibility', label: 'Try the compatibility score' }, sections: [
      { title: 'Synastry', text: 'Synastry compares two charts planet by planet. Zodaci’s quick score compares the signs of the Sun, Moon, Venus, Mars and Rising by element and mode; the full relationship tools add the exact aspects between your charts.' },
      { title: 'A conversation starter', text: 'No score decides whether a relationship works. The most useful part of a comparison is the vocabulary it gives you to talk about differences.' } ] },
  ] },
];

export const ALL_LESSONS = ACADEMY.flatMap(p => p.lessons.map(l => ({ ...l, path: p })));
export const lessonBySlug = (slug?: string) => ALL_LESSONS.find(l => l.slug === slug);
