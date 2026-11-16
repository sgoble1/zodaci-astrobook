import { fmtLon, type ChartResult } from '@/lib/astro';
import { dreamSky, MOTIF_FACTORS, type DreamContact } from '@/lib/dreamSky';

export type DreamDeductionStep = { title: string; text: string };
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
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon', Leo: 'Sun', Virgo: 'Mercury',
  Libra: 'Venus', Scorpio: 'Mars', Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter',
};
const MOTIF_RULERS: Record<string, string[]> = {
  water: ['Moon', 'Neptune', '12th house'], flying: ['Jupiter', 'Neptune'], falling: ['Saturn'], teeth: ['Saturn'],
  'house or rooms': ['Moon', '4th house'], 'old place': ['Moon', 'South Node'],
  'familiar person': ['Moon', '7th house'], afraid: ['Pluto', '8th house'], calm: ['Moon', 'Venus'], chased: ['Mars', 'Pluto'],
};
const ordinal = (n: number) => `${n}${n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'}`;
const unique = <T,>(items: T[]) => [...new Set(items)];

function cuspSign(chart: ChartResult, house: 4 | 7 | 8 | 12): string | null {
  if (!chart.input.time || chart.cusps?.length !== 12) return null;
  return fmtLon(chart.cusps[house - 1]).sign;
}

function resolveNatalPlacement(chart: ChartResult, factor: string): string | null {
  const bodyKeys: Record<string, string> = {
    Moon: 'moon', Neptune: 'neptune', Pluto: 'pluto', Saturn: 'saturn', Jupiter: 'jupiter',
    Mars: 'mars', 'South Node': 'southNode', Venus: 'venus', Sun: 'sun',
  };
  const bodyKey = bodyKeys[factor];
  if (bodyKey) {
    const body = chart.bodies.find(b => b.key === bodyKey);
    if (!body) return null;
    // Houses and the Moon's exact placement are time-dependent; do not imply precision without a birth time.
    const uncertainMoon = bodyKey === 'moon' && !chart.input.time;
    return `${body.name}${uncertainMoon ? ' (birth time unknown)' : ` in ${body.sign}`}${body.house && chart.input.time ? `, ${ordinal(body.house)} house` : ''}`;
  }

  const houseByFactor: Record<string, 4 | 7 | 8 | 12> = {
    '4th house': 4, '7th house': 7, '8th house': 8, '12th house': 12,
  };
  const house = houseByFactor[factor];
  if (house) {
    const sign = cuspSign(chart, house);
    // Do not return an unqualified house placeholder when birth time is unknown.
    if (!sign) return null;
    return `${ordinal(house)} house cusp in ${sign}, ruled by ${SIGN_RULERS[sign]}`;
  }
  return null;
}

const ARCHETYPES: Record<string, string> = {
  water: 'Water dreams tend to reach toward Neptune and the 12th house: the realm of feeling without a hard edge, dream-memory, and what the conscious mind does not yet have a sentence for.',
  flying: 'Flying usually points to Jupiter expanding the field and Neptune softening the edges, so the psyche reaches for release, perspective, and a sense of being carried beyond ordinary pressure.',
  falling: 'Falling often arrives with Saturn’s authority: the mind senses a lost boundary, a drop in control, or the shock of realizing how little is under one’s command.',
  teeth: 'Teeth speak in Saturnian language: structure, containment, self-protection, and the sharp discomfort of a boundary being tested or crossed.',
  'house or rooms': 'Rooms and houses pull the dream toward the Moon and the 4th house, where memory, refuge, and the feeling of being inside a private interior take the lead.',
  'old place': 'An old place or familiar setting often revives the Moon and South Node: memory, learned patterns, and the feeling that the dream is revisiting an emotionally familiar scene.',
  'familiar person': 'A familiar person often activates the Moon and the 7th house, where the dream is asking what relationship pattern feels emotionally charged and repeatable.',
  afraid: 'Fear in the night mind often reaches for Pluto and the 8th house, where the unspoken, the intimate, and the thing we cannot quite regulate rise into view.',
  calm: 'A calm dream often asks the psyche to listen gently; here the Moon and Venus suggest the feeling is being carried by safety, beauty, or emotional steadiness rather than urgency.',
  chased: 'Being chased often reaches for Mars and Pluto, where the dream is tracking active pressure, threat, and the part of the self that feels pursued or unable to stop moving.',
};
const PROMPTS: Record<string, string> = {
  water: 'What feeling has been hard to hold without it spilling into everything around it?',
  flying: 'What part of your waking life feels ready to rise above a pressure that has been too close for too long?',
  falling: 'Where do you feel the ground under your feet has become uncertain or too thin to trust?',
  teeth: 'What boundary feels like it is being tested, worn down, or spoken about indirectly?',
  'house or rooms': 'What room, routine, or inner environment is asking for more honesty before it can feel safe?',
  'old place': 'Which old scene, habit, or emotional memory keeps returning in a new coat?',
  'familiar person': 'Who in your life seems to carry a familiar emotional script, even when the situation looks new?',
  afraid: 'What feels too close, too intense, or too unspoken to leave alone?',
  calm: 'What part of your inner life feels held, settled, and quietly ready to be understood?',
  chased: 'What pressure are you trying to outrun, and what might it need you to notice?',
};
function moodPhrase(tone: string): string {
  const t = tone.toLowerCase();
  if (t.includes('dread') || t.includes('afraid') || t.includes('fear')) return 'The mood carries a protective edge of vigilance';
  if (t.includes('excit') || t.includes('alive') || t.includes('elated') || t.includes('exhilar')) return 'The mood feels buoyant and charged';
  if (t.includes('confus') || t.includes('unclear')) return 'The mood is unsettled and searching';
  if (t.includes('grief') || t.includes('loss') || t.includes('sad')) return 'The mood is tender and reflective';
  return 'The mood is steady and observant';
}

/** Deterministic chart-grounded reading; it does not call an AI service or consume credits. */
export function dreamDeduction(
  natalChart: ChartResult,
  dreamDate: string,
  motifs: string[] = [],
  emotionalTone = 'calm',
  dreamTime = '03:00',
): DreamDeductionResult {
  const sky = dreamSky(natalChart, dreamDate, motifs, dreamTime);
  const selected = unique(motifs.filter(m => MOTIF_RULERS[m] || MOTIF_FACTORS[m]));
  const motifList = selected.length ? selected : ['calm'];
  const keyTransit = sky.contacts[0] ?? null;
  const houseRulerSign = cuspSign(natalChart, 12);
  const houseRuler = houseRulerSign ? `${SIGN_RULERS[houseRulerSign]} rules the 12th house` : null;
  const resonanceMotifs = motifList.map(motif => {
    const rulers = MOTIF_RULERS[motif] ?? [];
    const natalPlacements = unique(rulers.map(r => resolveNatalPlacement(natalChart, r)).filter((p): p is string => !!p));
    return { motif, rulers, natalPlacements };
  });
  const trigger = keyTransit
    ? `${keyTransit.moving} ${keyTransit.aspect} natal ${keyTransit.target}, orb ${keyTransit.orb.toFixed(1)}°`
    : `the Moon's ${sky.moonPhase} phase; no close contact to the selected natal dream points was found`;
  const primaryMotif = motifList[0];
  const placements = unique(resonanceMotifs.flatMap(m => m.natalPlacements)).slice(0, 3);
  const natalHook = placements.length
    ? `The lasting chart reference is ${placements.join('; ')}. These are symbolic points for reflection, not a biography.${!natalChart.input.time ? ' House-dependent natal details are omitted because a reliable birth time is unavailable.' : ''}`
    : 'House-dependent natal details are omitted because a reliable birth time is unavailable; the symbol can still be explored through your own associations.';
  return {
    nightSkyContacts: sky.contacts,
    templeTraffic: sky.houses,
    natalResonance: { motifs: resonanceMotifs, moonPhase: sky.moonPhase, houseRuler, keyTransit },
    deductionSteps: [
      { title: 'The Trigger', text: `The night mind was activated by ${trigger}. ${moodPhrase(emotionalTone)}; it describes the sky and your reported tone, not a proven cause.` },
      { title: 'The Archetype', text: `${ARCHETYPES[primaryMotif] ?? 'The selected image offers a familiar symbolic language for exploring the feelings around it.'} The symbol is a prompt, not a fixed meaning.` },
      { title: 'The Natal Hook', text: `${natalHook}${houseRuler ? ` ${houseRuler}.` : ''}` },
      { title: 'The Inquiry Prompt', text: PROMPTS[primaryMotif] ?? 'What in the dream would you like to understand better, in light of your waking experience?' },
    ],
  };
}

export const dreamMotifRulers = MOTIF_RULERS;
export const dreamMotifGuide = MOTIF_FACTORS;
