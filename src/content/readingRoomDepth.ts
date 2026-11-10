import type { RoomArticle } from './readingRoom';
import library from '@/assets/reading-room/atomic-research-library.jpg';
import chart from '@/assets/reading-room/reading-room-birth-chart-book.jpg';
import transits from '@/assets/forecast/forecast-sky-calendar.jpg';

export const ADDITIONAL_GUIDES: RoomArticle[] = [
  {
    slug: 'birth-time-and-chart-uncertainty', title: 'When Your Birth Time Is Unknown', category: 'Chart basics', minutes: 4, image: library,
    glance: 'An unknown birth time limits houses and the Ascendant. It does not make every planetary position unusable.',
    paras: [
      'Start by separating a recorded time from an estimate. A birth certificate or hospital record can help, but even recorded times may be rounded. Keep the source and uncertainty beside the time rather than replacing an estimate with a confident-looking minute.',
      'The Ascendant depends on local time, latitude and longitude. House boundaries depend on those inputs and the house system. An hour or two can change the Rising sign or move a planet into a different house; there is no universal two-hour rule that works at every latitude.',
      'The Moon moves roughly 12 to 15 degrees per day. If it changes signs on your birth date, its sign may also be uncertain. The Sun can change signs during a day near a sign boundary. Slower planets usually move less, but exact degrees and tight aspects still need checking across the possible time window.',
      'Compare a chart at the earliest plausible time with one at the latest. Keep only the facts that remain stable. A reading without known time should omit confident house and Rising-sign claims rather than silently using noon as your actual birth time.',
      'Some astrologers offer rectification, estimating a time from life events. This is an interpretive method, not documentary proof. A convincing story is not evidence that a particular minute is correct.',
    ],
    words: [{ term: 'Time window', meaning: 'The earliest and latest plausible birth times' }, { term: 'Rectification', meaning: 'An interpretive estimate of birth time using reported events' }],
    tryThis: 'List which birth details you know, where each came from, and which are estimated. Keep uncertain houses and angles out of your conclusions.',
  },
  {
    slug: 'aspects-and-orbs', title: 'Aspects and Orbs: Read the Angle First', category: 'Chart basics', minutes: 4, image: chart,
    glance: 'An aspect is an angular relationship. The orb tells you how far it is from exact.',
    paras: [
      'Astrologers compare two positions along the zodiac. The shortest separation is between zero and 180 degrees. A conjunction is near zero, a sextile near 60, a square near 90, a trine near 120 and an opposition near 180. These are calculated angles before any meaning is assigned.',
      'Suppose one planet is at 10 degrees Taurus and another at 12 degrees Leo. Their separation is 92 degrees, so they form a square with a two-degree orb. The orb is the distance from the exact aspect angle, not the distance between the two planets.',
      'Allowed orbs vary by tradition, planet and technique. A natal reading may use wider orbs than a short-term transit calendar. Two programs can disagree about whether an aspect counts while agreeing on the positions. Check their settings before calling one chart wrong.',
      'An applying aspect is moving toward exactness; a separating aspect is moving away. Retrograde motion can bring a transit back over the same degree several times. A list of three contacts may describe one extended period rather than three unrelated events.',
      'Interpret the whole contact: both planets, their signs, reliable houses and the closeness of the angle. A square alone cannot establish an illness, a family event or a relationship outcome. Use it as a question about a theme, not as a factual claim about someone.',
    ],
    words: [{ term: 'Orb', meaning: 'Distance in degrees from an exact aspect angle' }, { term: 'Applying', meaning: 'Moving toward an exact aspect' }, { term: 'Separating', meaning: 'Moving away from an exact aspect' }],
    tryThis: 'Choose one aspect in your chart. Write the two placements, angle and orb before writing an interpretation. Keep the calculation and interpretation on separate lines.',
  },
  {
    slug: 'checking-a-forecast', title: 'How to Check a Forecast Against Real Life', category: 'Timing', minutes: 4, image: transits,
    glance: 'Record what happened as well as what did not. A useful reflection leaves room for a mismatch.',
    paras: [
      'A personal forecast compares moving planets with your saved birth chart. A public sky bulletin describes the same sky for everybody. Before reading a forecast, check which kind it is, when it was calculated and whether your birth time is known.',
      'Write down the actual contact and its date range. The exact date is the moment the angle becomes exact, not a promise that an event will happen that day. Slow planets can stay within an allowed orb for weeks or months, and retrogrades can repeat a contact.',
      'Before the period begins, record what the interpretation suggests in ordinary words. Avoid predictions so broad that any event would fit them. “I will review my workload” is something you can track. “A powerful transformation is coming” is much harder to check.',
      'During the period, note ordinary events, choices and feelings without forcing them into the reading. Include quiet days and contrary examples. Compare with other weeks, too: work stress, sleep and relationships have explanations that do not depend on a transit.',
      'A matching observation can be meaningful to you without proving astrology caused it. An interpretation that misses is worth keeping in the record. Use the forecast for reflection; medical, financial and legal decisions need qualified advice and real-world evidence.',
    ],
    words: [{ term: 'Exact contact', meaning: 'The instant a transit reaches the aspect angle' }, { term: 'Confirmation bias', meaning: 'Noticing matching examples while overlooking contrary ones' }],
    tryThis: 'Choose one upcoming contact. Record the theme beforehand, then return after the period and note one match, one mismatch and any ordinary explanations.',
  },
];

export function roomReadingContent(a: RoomArticle): string {
  return [`## At a glance\n\n${a.glance}`, `## Read the chart\n\n${a.paras.join('\n\n')}`, `## Words to know\n\n${a.words.map(w => `- **${w.term}**: ${w.meaning}`).join('\n')}`, `## Try this\n\n${a.tryThis}`, '## Keep the limits in view\n\nPlanetary positions and angles are calculated. Their personal meanings are interpretations, not evidence of a biography or a guaranteed event. Unknown birth times limit houses and angles.'].join('\n\n');
}