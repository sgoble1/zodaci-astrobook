import { computeChart } from '@/lib/astro';
import { toChartInput, type MyBirth } from '@/lib/myBirth';
import { composeManuscript } from '@/lib/bookManuscript';
import { buildVolumes } from '@/lib/bookVolumes';
import fontUrl from '@/assets/fonts/manuscript.ttf?url';
import sampleCover from '@/assets/cover-design-midnight-stars-hd.jpg';

/** A fictional reader used for the public sample book, so visitors can see the real format. */
export const SAMPLE_BIRTH: MyBirth = {
  name: 'Olivia Chen',
  date: '1992-03-14',
  time: '07:23',
  placeLabel: 'Portland, Oregon, USA',
  lat: 45.5152,
  lon: -122.6784,
  tz: 'America/Los_Angeles',
  houseSystem: 'placidus',
};

const SIGN_NAMES = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

function chartFactsFor(birth: MyBirth) {
  const c = computeChart(toChartInput(birth));
  const chartFacts = [
    ...c.bodies.map(b => `${b.name}: ${b.sign} ${b.deg}°${String(b.min).padStart(2, '0')}′${birth.time && b.house ? ` · house ${b.house}` : ''}`),
    ...c.aspects.map(a => `${a.a} ${a.type} ${a.b} · orb ${a.orb.toFixed(2)}°`),
  ].join('\n\n');
  const sign = (n: string) => c.bodies.find(b => b.name === n)?.sign;
  const rising = c.asc != null ? `${SIGN_NAMES[Math.floor(c.asc / 30)]} Rising` : '';
  const bigThree = [sign('Sun') && `Sun in ${sign('Sun')}`, sign('Moon') && `Moon in ${sign('Moon')}`, rising].filter(Boolean).join(' · ');
  return { chartFacts, bigThree, chart: c };
}

/** Sample chapters written for the fictional reader — a real sample of the AstroBook's voice, depth and layout. */
const SAMPLE_CHAPTERS = [
  {
    title: 'Your Big Three',
    content: `## A sample from a real AstroBook
This is a genuine AstroBook, written for a fictional reader ("Olivia Chen", born March 14, 1992 at 7:23 am in Portland, Oregon) so you can see exactly how your book is laid out, formatted and written. Your own book will be written entirely from your chart.

## The Sun: your core self
The Sun describes the center of the chart: the self that grows more visible over a lifetime. In this sample chart, the Sun's sign colors everything else — the ambitions, the way love is given, even the way rest is taken. Read the Sun as a promise rather than a task: it is what a person is becoming, and the chart's other placements show the tools they have for the journey.

Where the Sun sits by house shows the stage on which that growth plays out — work, home, learning, service. A Sun in an angular house (1, 4, 7, 10) tends to live loudly; a Sun in a cadent house (3, 6, 9, 12) grows more privately, through skill and reflection.

## The Moon: the inner tide
The Moon governs feeling, memory and the conditions a person needs in order to feel safe. Its sign describes the emotional weather; its house describes where that weather is most often felt. A Moon in an air sign processes feeling by talking it through; an earth Moon needs routine and touch; a fire Moon needs movement and play; a water Moon feels everything and remembers all of it.

The Moon also shows what restores a person. The rituals that genuinely work — the walk, the journal page, the long call with a friend — are usually the ones that match the Moon's element and house.

## The Rising sign: the threshold
The Ascendant is the mask with a true face behind it: the instinctive style a person meets the world with. It is the first impression, the way a room is entered, the defense used when surprised. The rising sign is not a costume; over time it becomes a genuine part of the self, refined rather than shed.

Together, these three — Sun, Moon and Rising — are the skeleton of the book. Every later chapter is a closer look at one limb of this figure.`,
  },
  {
    title: 'Mind & Communication',
    content: `## Mercury: the shape of thought
Mercury describes how a person collects information, forms opinions and gives them away again. Its sign shows the style of thought — quick and speculative, careful and practical, imaginative and symbolic. Its house shows the subjects the mind keeps returning to.

In this sample chart, Mercury's placement suggests a mind that is at its best when it has a genuine puzzle in front of it. Boredom, for this mind, is not a mood — it is a signal that the current problem is too small.

## Speaking and listening
The third house, and any planets gathered there, describe the everyday traffic of language: siblings, neighbors, errands, small exchanges that add up to a life. A busy third house often means a person who thinks out loud, who discovers what they mean by saying it.

The ninth house is the other end of the axis: what a person believes, what they travel toward, the larger frame they hold their life against. When the third and ninth are both strong, there is a gift for teaching — the ability to take something vast and make it sayable.

## A practical reflection
Notice which conversations leave you energized and which drain you. That pattern, more than any horoscope column, is the living Mercury of your chart — and it can be trained, strengthened and trusted.`,
  },
  {
    title: 'Love & Relationships',
    content: `## Venus and Mars
Venus describes what a person values and how they give and receive affection; Mars describes desire, drive and the way conflict is handled. Read together, they are the mechanics of attraction: Venus says what is beautiful, Mars says what is wanted, and the relationship between the two signs shows whether wanting and valuing agree with each other or pull in different directions.

A sample distinction worth keeping: attraction is the opening move, but the seventh house — the house of partnership — is where a relationship lives over years. A chart can be drawn to fireworks in the fifth house and steadiness in the seventh, or the reverse.

## The seventh house
The seventh house describes the partner a person keeps choosing: not a fantasy, but the shape of the people who actually become close. Its sign and any planets there often mirror something the person is learning to accept in themselves.

## Boundaries and repair
Saturn's contacts to Venus and the Moon show where love asks for patience rather than intensity. This is not a defect in the chart; it is the location of the deepest reliability, the kind of love that is built rather than found. The reflection exercises in the printed edition walk through this one page at a time.`,
  },
  {
    title: 'Purpose & Work',
    content: `## The Midheaven: the public direction
The Midheaven (the tenth house cusp) is the chart's arrow: it points at the work a life is pulled toward, the reputation that forms around a person whether they plan it or not. Its ruler — the planet that governs the Midheaven's sign — shows the vehicle: the talent, the trade, the mode of service through which the direction becomes real.

## Saturn: the long apprenticeship
Saturn marks the place where mastery is earned slowly and kept permanently. Early on, Saturn's house can feel like the room where a person is sent to grow up. Later in life it becomes the room they are trusted to run. The planets aspecting Saturn describe whether the apprenticeship is collaborative or solitary.

## The sixth house: the daily practice
Purpose is not only a mountaintop; it is also a Tuesday. The sixth house covers work habits, health routines and service. A person whose sixth house is strong keeps promises to themselves the way other people keep promises to friends.

## Closing reflection
Take the single sentence from this chapter that felt most true and copy it somewhere you will see it tomorrow. The AstroBook is designed to be marked up, folded and returned to — a book you write in as much as read.`,
  },
];

/** Compose the sample AstroBook PDF (a real book from the fictional chart above). */
export async function composeSampleBook() {
  const { chartFacts, bigThree, chart } = chartFactsFor(SAMPLE_BIRTH);
  const fontBuffer: ArrayBuffer = await (await fetch(fontUrl)).arrayBuffer();
  const coverBuffer: ArrayBuffer = await (await fetch(sampleCover)).arrayBuffer();
  const result = await composeManuscript({
    name: SAMPLE_BIRTH.name,
    birthFacts: `${SAMPLE_BIRTH.date} · ${SAMPLE_BIRTH.time} · ${SAMPLE_BIRTH.placeLabel} · ${SAMPLE_BIRTH.tz} · ${SAMPLE_BIRTH.houseSystem}`,
    chartFacts,
    chapters: SAMPLE_CHAPTERS,
    edition: 'classic',
    volumes: buildVolumes({ edition: 'classic', chart, name: SAMPLE_BIRTH.name, saved: SAMPLE_CHAPTERS, facts: chartFacts, today: new Date('2026-01-01T00:00:00Z') }),
    chart,
    extras: [],
    fontBytes: new Uint8Array(fontBuffer),
    cover: new Uint8Array(coverBuffer),
    bigThree,
  });
  return { blob: new Blob([result.bytes as BlobPart], { type: 'application/pdf' }), pages: result.pages };
}
