/** April's Workbook — guided modules built from her chart. Each question carries a short chart note
 * (why it matters for her placements) and the therapy lens it draws on. */
export type WorkbookQuestion = { key: string; q: string; why: string; lens: string };
export type WorkbookModule = {
  slug: string; title: string; subtitle: string; placements: string; intro: string;
  plainMeaning: string; dailyLife: string;
  questions: WorkbookQuestion[]; explore: { to: string; label: string }[];
};

export const WORKBOOK_MODULES: WorkbookModule[] = [
  {
    slug: 'full-moon-within', title: 'The Full Moon Within', subtitle: 'Say it now vs. perfect it first',
    plainMeaning: 'One side of you reacts quickly and honestly; another wants time to check every detail.', dailyLife: 'You may swing between speaking immediately and holding everything in until the words feel perfect.',
    placements: 'Sun Virgo 8th ☍ Moon Aries 3rd', intro: 'You were born at a Full Moon: a fast, honest Aries flame facing a careful Virgo mind. Neither is wrong. This module helps them work as a team.',
    questions: [
      { key: 'fm-1', q: 'Think of a recent moment you wanted to say something immediately but held back to get it “right”. What happened, and what did it cost you?', why: 'Aries Moon in the 3rd wants to speak; Virgo Sun in the 8th wants to process privately first.', lens: 'CBT — situation, thought, feeling' },
      { key: 'fm-2', q: 'When you do speak on impulse, what usually follows — relief, regret, or both? Describe a specific time.', why: 'The Moon is the bucket handle of your chart: it steers the whole bowl of planets.', lens: 'Self-observation' },
      { key: 'fm-3', q: 'If your fiery side and your careful side each wrote you a one-line note, what would they say?', why: 'Oppositions resolve through dialogue between the two ends, not by choosing one.', lens: 'Internal Family Systems (parts)' },
      { key: 'fm-4', q: 'What would a “good enough” version of speaking up look like for you this week?', why: 'Virgo perfectionism softens when the standard is explicit and reachable.', lens: 'ACT — values-based action' },
      { key: 'fm-5', q: 'Who in your life receives your directness well, and what do they do that makes it safe?', why: 'Moon in the 3rd links feelings with everyday conversation and siblings/neighbours.', lens: 'Attachment & relational safety' },
    ],
    explore: [{ to: '/planets/moon', label: 'Moon in Aries' }, { to: '/planets/sun', label: 'Sun in Virgo' }, { to: '/aspects', label: 'Sun opposite Moon' }],
  },
  {
    slug: 'inner-critic', title: 'Making Peace with the Inner Critic', subtitle: 'Precision without punishment',
    plainMeaning: 'Your mind notices tiny details and reviews things repeatedly. That can help you improve, but it can also become harsh self-judgment.', dailyLife: 'You may replay conversations, spot flaws before strengths, or wait too long because the result does not feel perfect.',
    placements: 'Mercury Rx Virgo 8th (domicile) ☌ Sun', intro: 'Your mind is a superb editor. This module helps you keep the editor and retire the prosecutor.',
    questions: [
      { key: 'ic-1', q: 'Write down, word for word, the harshest thing your inner critic said to you this month.', why: 'Mercury retrograde in its own sign turns analysis inward and replays conversations.', lens: 'CBT — catching automatic thoughts' },
      { key: 'ic-2', q: 'Whose voice does that sentence sound like? When did you first hear something like it?', why: 'The 8th house holds inherited patterns and what was absorbed from others.', lens: 'Narrative therapy' },
      { key: 'ic-3', q: 'What is the critic trying to protect you from? What does it fear would happen if it went quiet?', why: 'Virgo criticism is usually a form of care that has lost its gentleness.', lens: 'IFS — understanding a protector' },
      { key: 'ic-4', q: 'Rewrite the critic’s sentence as a precise, kind editor would — still honest, but useful.', why: 'Domicile Mercury is strongest when it serves rather than judges.', lens: 'Self-compassion (Neff)' },
      { key: 'ic-5', q: 'List three things you did well this week that no one noticed.', why: 'Virgo Suns often overlook their own competence.', lens: 'Positive psychology' },
    ],
    explore: [{ to: '/planets/mercury', label: 'Mercury retrograde in Virgo' }, { to: '/retrogrades', label: 'Retrogrades' }, { to: '/workbook/reframe', label: 'Thought Reframe tool' }],
  },
  {
    slug: 'fire-and-feeling', title: 'Fire & Feeling', subtitle: 'Anger, needs and quick sparks',
    plainMeaning: 'Your feelings can arrive quickly and strongly. The goal is to hear their message before deciding what to do.', dailyLife: 'A small event may create a fast physical reaction, sharp words, or an urgent need to solve the problem now.',
    placements: 'Moon Aries 3rd □ Pluto Scorpio 10th · Mars Gemini 5th', intro: 'Your feelings arrive fast and hot, and they carry information. Here you learn to read them before they read you.',
    questions: [
      { key: 'ff-1', q: 'What reliably makes you angry? List three triggers and the need hiding under each.', why: 'Aries Moon expresses needs as heat; Moon square Pluto adds intensity.', lens: 'Nonviolent Communication — feelings & needs' },
      { key: 'ff-2', q: 'Where in your body do you feel anger first? Describe it like weather.', why: 'Fire Moons move energy physically; noticing the body slows the spark.', lens: 'Somatic awareness' },
      { key: 'ff-3', q: 'What do you do in the first ten minutes after you get upset? What would you like to do instead?', why: 'Aries emotions peak fast and fade fast — the first minutes matter most.', lens: 'DBT — TIPP & opposite action' },
      { key: 'ff-4', q: 'Which of your feelings were not welcome when you were growing up?', why: 'Moon square Pluto can link emotion with control or power struggles in early life.', lens: 'Attachment history' },
      { key: 'ff-5', q: 'How could you use your fire playfully this week — in movement, creativity or debate?', why: 'Mars in Gemini in the 5th loves play, wit and creative outlets.', lens: 'Behavioural activation' },
    ],
    explore: [{ to: '/planets/mars', label: 'Mars in Gemini' }, { to: '/planets/pluto', label: 'Pluto in Scorpio' }, { to: '/houses/3', label: 'Third house' }],
  },
  {
    slug: 'depth-trust-power', title: 'Depth, Trust & Power', subtitle: 'Letting people in safely',
    plainMeaning: 'Trust matters deeply to you, so closeness may feel serious rather than casual.', dailyLife: 'You may take time to trust, protect private feelings, or feel safest when expectations and power are discussed honestly.',
    placements: 'Sun, Mercury, Venus, Vertex in the 8th · Pluto 10th', intro: 'With so much in the 8th house, you live life in the deep end. This module explores trust, control and transformation.',
    questions: [
      { key: 'dt-1', q: 'What does someone have to do to earn your full trust? Be specific.', why: 'An 8th-house emphasis makes trust all-or-nothing and slow to build.', lens: 'Attachment theory' },
      { key: 'dt-2', q: 'Describe a time you felt out of control. What did you do to get control back?', why: 'Moon square Pluto is sensitive to powerlessness.', lens: 'CBT — coping patterns' },
      { key: 'dt-3', q: 'What part of you do you keep most hidden? What would it say if it could speak freely?', why: 'The 8th house is where shadow material waits to be integrated.', lens: 'Jungian shadow work' },
      { key: 'dt-4', q: 'Name an ending in your life that later turned out to be a beginning.', why: 'Pluto and the 8th house are the astrology of death-and-rebirth cycles.', lens: 'Post-traumatic growth' },
      { key: 'dt-5', q: 'Where do you hold power you are not yet using?', why: 'Pluto is your most elevated planet, pointing at power in your public life.', lens: 'Strengths-based coaching' },
    ],
    explore: [{ to: '/houses/8', label: 'Eighth house' }, { to: '/planets/pluto', label: 'Pluto at the apex' }, { to: '/houses/10', label: 'Tenth house' }],
  },
  {
    slug: 'love-and-being-chosen', title: 'Love & Being Chosen', subtitle: 'Giving, receiving and being seen',
    plainMeaning: 'You give love warmly and want to feel clearly chosen, appreciated and emotionally safe in return.', dailyLife: 'You may give extra care hoping it will be returned, or feel hurt when your effort is noticed less than expected.',
    placements: 'Venus Leo 29° 8th · Moon ☍ Venus · Chiron & South Node in the 7th', intro: 'You love loyally and generously. This module looks at how you want to be loved back — and old patterns of over-giving.',
    questions: [
      { key: 'lc-1', q: 'When do you feel most adored? Describe the moment in detail.', why: 'Venus in Leo needs to be seen, celebrated and chosen.', lens: 'Love languages & positive psychology' },
      { key: 'lc-2', q: 'Where do you give more than you receive? What do you hope will happen when you do?', why: 'Chiron in Cancer in the 7th can link love with caretaking.', lens: 'Relational patterns' },
      { key: 'lc-3', q: 'What is the difference between what you need and what you want in love right now?', why: 'Moon opposite Venus sets needs and desires against each other.', lens: 'Emotion-focused therapy' },
      { key: 'lc-4', q: 'Which role do you fall into in relationships — the star, the rescuer, the strong one? Where did it start?', why: 'South Node Leo in the 7th shows a familiar, comfortable relationship role to outgrow.', lens: 'Schema therapy' },
      { key: 'lc-5', q: 'Write the kind of love you are ready for now, as if it already exists.', why: 'Venus at 29° is at a culmination point — a chapter ready to complete.', lens: 'Narrative therapy — preferred story' },
    ],
    explore: [{ to: '/planets/venus', label: 'Venus in Leo' }, { to: '/planets/chiron', label: 'Chiron in Cancer' }, { to: '/relationships', label: 'Relationships' }, { to: '/houses/7', label: 'Seventh house' }],
  },
  {
    slug: 'carrying-the-weight', title: 'Carrying the Weight', subtitle: 'Responsibility, rest and softness',
    plainMeaning: 'You may have learned to be capable and responsible early. Rest can feel harder than carrying one more task.', dailyLife: 'People may rely on you while you quietly postpone your own needs or judge yourself by demanding standards.',
    placements: 'Saturn, Uranus, Neptune in Capricorn, 1st house', intro: 'You probably grew up early and became the dependable one. This module makes room for rest and softness.',
    questions: [
      { key: 'cw-1', q: 'What responsibilities did you take on younger than you should have?', why: 'Saturn in the 1st often brings early maturity and self-reliance.', lens: 'Inner-child work' },
      { key: 'cw-2', q: 'What do you believe would happen if you stopped being the strong one for a week?', why: 'The Capricorn stack can hide softness behind competence.', lens: 'CBT — testing core beliefs' },
      { key: 'cw-3', q: 'What does real rest look like for you, as opposed to just stopping?', why: 'Neptune in the 1st needs dreaming time; Saturn needs permission.', lens: 'Self-care planning' },
      { key: 'cw-4', q: 'Where are you holding yourself to a standard you would never hold a friend to?', why: 'Domicile Saturn sets very high standards.', lens: 'Self-compassion' },
      { key: 'cw-5', q: 'What would you build if you trusted that you had already proven yourself?', why: 'Saturn trine Pluto gives the stamina to build lasting things.', lens: 'ACT — committed action' },
    ],
    explore: [{ to: '/planets/saturn', label: 'Saturn in Capricorn' }, { to: '/houses/1', label: 'First house' }, { to: '/timeline', label: 'Saturn return on the timeline' }],
  },
  {
    slug: 'becoming-your-own-person', title: 'Becoming Your Own Person', subtitle: 'Independence and your unusual path',
    plainMeaning: 'Growth comes from defining yourself instead of performing the version of you that others expect.', dailyLife: 'You may notice tension between belonging to a group and saying what you truly think or choosing your own path.',
    placements: 'North Node Aquarius 1st · Lilith Sagittarius 11th', intro: 'Your growth points toward owning your individuality. This module explores freedom, belonging and your own rules.',
    questions: [
      { key: 'yp-1', q: 'Where are you still living by someone else’s rules?', why: 'North Node in Aquarius in the 1st asks you to define yourself on your own terms.', lens: 'Values clarification' },
      { key: 'yp-2', q: 'What part of you have you been told is “too much”?', why: 'Lilith in Sagittarius is the untamed, truth-telling part of you.', lens: 'Shadow work' },
      { key: 'yp-3', q: 'Which groups or communities feel like home, and which feel like a costume?', why: 'Lilith in the 11th connects your wild side with friendships and groups.', lens: 'Social belonging' },
      { key: 'yp-4', q: 'Describe a choice you made that surprised everyone, including you.', why: 'Uranus in the 1st brings sudden, liberating changes of direction.', lens: 'Narrative therapy' },
      { key: 'yp-5', q: 'What is one small act of independence you can take this week?', why: 'Nodes grow through small repeated steps, not one leap.', lens: 'Behavioural experiment' },
    ],
    explore: [{ to: '/purpose', label: 'Purpose & the Nodes' }, { to: '/compendium', label: 'Compendium: Lilith & asteroids' }, { to: '/houses/1', label: 'First house' }],
  },
  {
    slug: 'meaning-and-calling', title: 'Meaning & Calling', subtitle: 'Truth, purpose and public life',
    plainMeaning: 'Work feels worthwhile when it serves a larger purpose and changes something for the better.', dailyLife: 'You may lose energy in work that feels empty, yet become deeply focused when a problem is meaningful and useful.',
    placements: 'Ascendant Sagittarius 29° · Pluto 10th · Midheaven Libra · Life Path 7', intro: 'You meet life searching for meaning. This module explores calling, work and the truth you are here to tell.',
    questions: [
      { key: 'mc-1', q: 'What questions have you been asking your whole life?', why: 'Life Path 7 and a Sagittarius Ascendant are both seekers of truth.', lens: 'Existential therapy' },
      { key: 'mc-2', q: 'When have you felt most useful and most alive at the same time?', why: 'Virgo service meets Sagittarian meaning.', lens: 'Flow & strengths' },
      { key: 'mc-3', q: 'If your work were a transformation you offered others, what would it be?', why: 'Pluto at the apex suggests a career that changes people or systems.', lens: 'Purpose coaching' },
      { key: 'mc-4', q: 'What would you teach if you knew people would listen?', why: 'Sagittarius rules teaching, publishing and philosophy.', lens: 'Values in action' },
      { key: 'mc-5', q: 'What is ending in your professional life, and what is asking to begin?', why: 'An anaretic 29° Ascendant marks the edge between chapters.', lens: 'Life transitions (Bridges)' },
    ],
    explore: [{ to: '/numerology', label: 'Numerology & Life Path 7' }, { to: '/houses/10', label: 'Tenth house' }, { to: '/purpose', label: 'Purpose' }],
  },
  {
    slug: 'this-year', title: 'This Year: Endings & Inner Work', subtitle: 'Your 12th-house year and Personal Year 7',
    plainMeaning: 'This is framed as a quieter year for finishing old business, understanding yourself and making room for what comes next.', dailyLife: 'You may need more solitude, feel drawn to unfinished emotional matters, or prefer preparation over visible expansion.',
    placements: 'Profection age 35 (12th house) · Personal Year 7 (2026)', intro: 'This year asks for retreat, reflection and closure before a new cycle. Use this module to work with it rather than against it.',
    questions: [
      { key: 'ty-1', q: 'What are you ready to finish, forgive or let go of before your next birthday?', why: 'A 12th-house profection year is about closing a 12-year cycle.', lens: 'Grief & closure work' },
      { key: 'ty-2', q: 'How much solitude do you need right now, honestly?', why: 'Personal Year 7 and the 12th house both call for inward time.', lens: 'Self-care planning' },
      { key: 'ty-3', q: 'Write down a recurring dream or image and what it might be telling you.', why: 'The 12th house rules dreams and the unconscious.', lens: 'Jungian dream work' },
      { key: 'ty-4', q: 'What hidden support — people, practices, spirituality — has been holding you up?', why: 'The 12th house also holds unseen allies.', lens: 'Resource mapping' },
      { key: 'ty-5', q: 'Who do you want to be when your 1st-house year begins at 36?', why: 'The next profection year begins a fresh personal cycle.', lens: 'Future-self journaling' },
    ],
    explore: [{ to: '/profection', label: 'Profection · Age 35' }, { to: '/transits', label: 'Transits 2026–2040' }, { to: '/numerology', label: 'Personal Year 7' }],
  },
];

export const ALL_QUESTIONS = WORKBOOK_MODULES.flatMap(m => m.questions.map(q => ({ ...q, module: m })));

/** A deterministic "question of the day". */
export function questionOfTheDay(date = new Date()) {
  const day = Math.floor(date.getTime() / 86_400_000);
  return ALL_QUESTIONS[day % ALL_QUESTIONS.length];
}

export const EMOTIONS = ['Calm', 'Hopeful', 'Joyful', 'Grateful', 'Tired', 'Anxious', 'Irritable', 'Sad', 'Lonely', 'Overwhelmed', 'Restless', 'Inspired'];
