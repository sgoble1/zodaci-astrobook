import { fmtLon, type ChartResult } from '@/lib/astro';
import { dreamSky, MOTIF_FACTORS, type DreamContact } from '@/lib/dreamSky';

export type DreamDeductionStep = {
  title: string;
  text: string;
};

export type DreamDeductionResult = {
  nightSkyContacts: DreamContact[];
  templeTraffic: { house: 8 | 12; planets: string[] }[];
  natalResonance: {
    motifs: { motif: string; rulers: string[]; natalPlacements: string[] }[];
    moonPhase: string;
    houseRuler: string | null;
    keyTransit: DreamContact | null;
  };
  deductionSteps: DreamDeductionStep[];
};

const SIGN_RULERS: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon', Leo: 'Sun',
  Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars', Sagittarius: 'Jupiter',
  Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter',
};

const MOTIF_RULERS: Record<string, string[]> = {
  water: ['Moon', 'Neptune', '12th house'],
  flying: ['Jupiter', 'Neptune'],
  falling: ['Saturn'],
  teeth: ['Saturn'],
  'house or rooms': ['Moon', '4th house'],
  'old place': ['Moon', 'South Node'],
  'familiar person': ['Moon', '7th house'],
  afraid: ['Pluto', '8th house'],
  calm: ['Moon', 'Venus'],
  chased: ['Mars', 'Pluto'],
};

const ordinal = (n: number) => `${n}${n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'}`;
const sep = (a: number, b: number) => { const d = Math.abs(((a - b) % 360 + 360) % 360); return d > 180 ? 360 - d : d; };
const unique = <T>(items: T[]) => [...new Set(items.filter(Boolean))];

function phaseLabel(chart: ChartResult): string {
  const sun = chart.bodies.find(b => b.key === 'sun');
  const moon = chart.bodies.find(b => b.key === 'moon');
  if (!sun || !moon) return 'unknown';
  const angle = sep(sun.lon, moon.lon);
  if (angle <= 22.5 || angle >= 337.5) return 'new moon';
  if (angle <= 67.5) return 'waxing crescent';
  if (angle <= 112.5) return 'first quarter';
  if (angle <= 157.5) return 'waxing gibbous';
  if (angle <= 202.5) return 'full moon';
  if (angle <= 247.5) return 'waning gibbous';
  if (angle <= 292.5) return 'last quarter';
  return 'waning crescent';
}

function cuspSign(chart: ChartResult, house: 8 | 12 | 4 | 7): string | null {
  if (!chart.input.time || !chart.cusps) return null;
  const lon = chart.cusps[house - 1];
  return fmtLon(lon).sign;
}

function resolveNatalPlacement(chart: ChartResult, factor: string): string | null {
  const bodyKey = {
    Moon: 'moon', Neptune: 'neptune', Pluto: 'pluto', Saturn: 'saturn', Jupiter: 'jupiter',
    Mars: 'mars', South: 'southNode', Venus: 'venus', Sun: 'sun',
  }[factor] ?? null;

  if (bodyKey) {
    const body = chart.bodies.find(b => b.key === bodyKey);
    if (body) return `${body.name} in ${body.sign}${body.house ? `, ${ordinal(body.house)} house` : ''}`;
  }

  if (factor === '12th house') {
    const sign = cuspSign(chart, 12);
    if (!sign) return '12th house';
    return `12th house cusp in ${sign}${chart.input.time ? `, ruled by ${SIGN_RULERS[sign]}` : ''}`;
  }
  if (factor === '4th house') {
    const sign = cuspSign(chart, 4);
    if (!sign) return '4th house';
    return `4th house cusp in ${sign}${chart.input.time ? `, ruled by ${SIGN_RULERS[sign]}` : ''}`;
  }
  if (factor === '7th house') {
    const sign = cuspSign(chart, 7);
    if (!sign) return '7th house';
    return `7th house cusp in ${sign}${chart.input.time ? `, ruled by ${SIGN_RULERS[sign]}` : ''}`;
  }
  if (factor === '8th house') {
    const sign = cuspSign(chart, 8);
    if (!sign) return '8th house';
    return `8th house cusp in ${sign}${chart.input.time ? `, ruled by ${SIGN_RULERS[sign]}` : ''}`;
  }

  return null;
}

function archetypeText(motif: string): string {
  const map: Record<string, string> = {
    water: 'Water dreams tend to reach toward Neptune and the 12th house: the realm of feeling without a hard edge, dream-memory, and what the conscious mind does not yet have a sentence for.',
    flying: 'Flying usually points to Jupiter expanding the field and Neptune softening the edges, so the psyche reaches for release, perspective, and a sense of being carried beyond ordinary pressure.',
    falling: 'Falling often arrives with Saturn’s authority: the mind senses a lost boundary, a drop in control, or the shock of realizing how little is under one’s command.',
    teeth: 'Teeth speak in Saturnian language: structure, containment, self-protection, and the sharp discomfort of a boundary being tested or crossed.',
    'house or rooms': 'Rooms and houses pull the dream toward the Moon and the 4th house, where memory, refuge, and the feeling of being inside a private interior take the lead.',
    'old place': 'An old place or familiar setting often revives the Moon and South Node: memory, inherited patterns, and the feeling that the dream is revisiting a scene the soul already knows.',
    'familiar person': 'A familiar person often activates the Moon and the 7th house, where the dream is asking what relationship pattern feels emotionally charged and repeatable.',
    afraid: 'Fear in the night mind often reaches for Pluto and the 8th house, where the unspoken, the intimate, and the thing we cannot quite regulate rise into view.',
    calm: 'A calm dream often asks the psyche to listen gently; here the Moon and Venus suggest the feeling is being carried by safety, beauty, or emotional steadiness rather than urgency.',
    chased: 'Being chased often reaches for Mars and Pluto, where the dream is tracking active pressure, threat, and the part of the self that feels pursued or unable to stop moving.',
  };

  return map[motif] ?? 'The symbol is drawing on the emotional pattern that repeats in the chart, asking the mind to notice what keeps returning in a new form.';
}

function inquiryPrompt(motif: string): string {
  const prompts: Record<string, string> = {
    water: 'What feeling has been hard to hold without it spilling into everything around it?',
    flying: 'What part of your waking life feels ready to rise above a pressure that has been too close for too long?',
    falling: 'Where do you feel the ground under your feet has become uncertain or too thin to trust?',
    teeth: 'What boundary feels like it is being tested, worn down, or spoken about indirectly?',
    'house or rooms': 'What room, routine, or inner environment is asking for more honesty before it can feel safe?',
    'old place': 'Which old scene, habit, or emotional memory keeps returning in a new coat?',
    'familiar person': 'Who in your life seems to carry a familiar emotional script, even when the situation looks new?',
    afraid: 'What feels too close, too intense, or too unspoken to leave alone?',
    calm: 'What part of your inner life feels held, settled, and quietly ready to be understood?',
    chased: 'What is the pressure you keep trying to outrun, even when you know the answer is closer than the fear allows?',
  };

  return prompts[motif] ?? 'What in the dream is asking to be named before it can become useful guidance?';
}

function moodPhrase(emotionalTone: string): string {
  const t = emotionalTone.toLowerCase();
  if (t.includes('dread') || t.includes('afraid') || t.includes('fear')) return 'the mood carries a brisk edge of protective vigilance';
  if (t.includes('excit') || t.includes('alive') || t.includes('elated') || t.includes('exhilar')) return 'the mood feels buoyant and charged';
  if (t.includes('confus') || t.includes('unclear')) return 'the mood is unsettled and searching';
  if (t.includes('grief') || t.includes('loss') || t.includes('sad')) return 'the mood is tender and haunted';
  return 'the mood is steady and observant';
}

function formatStep(title: string, text: string): DreamDeductionStep { return { title, text }; }

export function dreamDeduction(
  natalChart: ChartResult,
  dreamDate: string,
  motifs: string[] = [],
  emotionalTone = 'calm',
): DreamDeductionResult {
  const sky = dreamSky(natalChart, dreamDate, motifs);
  const nightSkyContacts = sky.contacts;
  const templeTraffic = sky.houses.filter(h => h.house === 8 || h.house === 12) as { house: 8 | 12; planets: string[] }[];

  const selectedMotifs = unique(motifs.filter(m => MOTIF_RULERS[m] || MOTIF_FACTORS[m]));
  const motifList = selectedMotifs.length ? selectedMotifs : ['calm'];

  const moonPhase = phaseLabel(natalChart);
  const strongestTransit = nightSkyContacts[0] ?? null;

  const thisHouseRuler = natalChart.input.time && natalChart.cusps ? (() => {
    const sign = cuspSign(natalChart, 12);
    return sign ? `${SIGN_RULERS[sign]} rules the 12th house` : null;
  })() : null;

  const natalResonance = {
    motifs: motifList.map(motif => {
      const rulers = MOTIF_RULERS[motif] ?? [motif];
      const natalPlacements = unique(rulers.map(r => resolveNatalPlacement(natalChart, r)).filter(Boolean) as string[]);
      return { motif, rulers, natalPlacements };
    }),
    moonPhase,
    houseRuler: thisHouseRuler,
    keyTransit: strongestTransit,
  };

  const triggerText = strongestTransit
    ? `${strongestTransit.moving} ${strongestTransit.aspect} natal ${strongestTransit.target}, orb ${strongestTransit.orb.toFixed(1)}°`
    : `The Moon is in a ${moonPhase}, and the night's sky is quiet enough for the inner image to move without a sharp transit.`;

  const primaryMotif = motifList[0] ?? 'calm';
  const archetype = archetypeText(primaryMotif);
  const placementLines = natalResonance.motifs.flatMap(item => item.natalPlacements).slice(0, 3);
  const natalHook = placementLines.length
    ? `The permanent hook is ${placementLines.join('; ')}, which gives this dream a repeatable home in the natal chart.`
    : 'The recurring dream image is not tied to a strongly visible house pattern in this chart, so the dream is reading more from the emotional atmosphere than from a fixed house axis.';

  const steps: DreamDeductionStep[] = [
    formatStep('The Trigger', `The night mind was activated by ${triggerText}. ${moodPhrase(emotionalTone)}; this is the atmosphere through which the dream image was able to sharpen.`),
    formatStep('The Archetype', `${archetype} This is why the symbol arrived as ${primaryMotif.replace(/\b\w/g, c => c.toUpperCase())} rather than as a random scene.`),
    formatStep('The Natal Hook', `${natalHook}${thisHouseRuler ? ` ${thisHouseRuler}.` : '.'}`),
    formatStep('The Inquiry Prompt', inquiryPrompt(primaryMotif)),
  ];

  return {
    nightSkyContacts,
    templeTraffic,
    natalResonance,
    deductionSteps: steps,
  };
}

export const dreamMotifRulers = MOTIF_RULERS;
export const dreamMotifGuide = MOTIF_FACTORS;
