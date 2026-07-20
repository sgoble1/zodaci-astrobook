// Volume II — Supplementary Astrological Guide. Transcribed / paraphrased from
// the uploaded PDF. Each entry cites its exact section + page so the reader
// can audit against the original.

import type { SourceRef } from './compendium';

const V2 = 'Supplementary Volume II';

export interface Vol2Entry {
  id: string;
  section: string;      // ToC section number/name for grouping
  title: string;
  eyebrow: string;
  body: string;
  extras?: { label: string; detail: string }[];
  source: SourceRef;
}

export const VOL2_ENTRIES: Vol2Entry[] = [
  // ------------- 1 · Past Lives & Karmic Inheritance -------------
  {
    id: 'v2-past-lives',
    section: '1 · Past Lives & Karmic Inheritance',
    title: 'South Node in Leo H7 — the completed performer',
    eyebrow: 'Karmic axis · Leo ⇄ Aquarius',
    body:
      "The primary past-life indicator: incarnations of extraordinary creative visibility and relational centrality — royalty, celebrated performers, high priest/priestesses whose presence commanded the room. The soul was the sun others orbited. The residue in this life is the compulsive need to be the one who gives, dazzles, and keeps the partner adored — even at the cost of the self's replenishment. The Aquarius NN H1 asks her to stop being kept and start becoming who she actually is.",
    extras: [
      { label: 'Jupiter conjunct South Node', detail: 'At least one past life as a teacher / philosopher / priest whose interpretations shaped a community. Ancient wisdom already installed; the temptation is to pour it back into others rather than claim it for the self.' },
    ],
    source: { doc: V2, section: '1 · Past Lives — Leo SN + Jupiter', page: 'pp. 2–4' },
  },
  // ------------- 5 · Secondary Progressions -------------
  {
    id: 'v2-prog-sun',
    section: '5 · Secondary Progressions (2026)',
    title: 'Progressed Sun · ~18°–19° Libra · 9th house',
    eyebrow: 'Day-per-year progression',
    body:
      "The natal Sun in Virgo has walked into Libra and now lives in the 9th house. The identity is no longer being built primarily through Virgoan analysis — it is being built through relationship, aesthetics, philosophy, and the search for a lived worldview. The 9th-house Sun wants publication, teaching, foreign horizons.",
    source: { doc: V2, section: '5 · Progressed Sun', page: 'p. 25' },
  },
  {
    id: 'v2-prog-venus',
    section: '5 · Secondary Progressions (2026)',
    title: 'Progressed Venus · Virgo',
    eyebrow: 'Love-style ingress',
    body:
      "Venus has crossed from Leo to Virgo. The love-style is moving from grand theatrical Leo generosity toward quietly devoted, practically attentive love — show me you care in the details. Progressed Venus now shares Virgo with natal Sun and Mercury, integrating who she loves with who she is.",
    source: { doc: V2, section: '5 · Progressed Venus', page: 'p. 27' },
  },
  {
    id: 'v2-prog-asc',
    section: '5 · Secondary Progressions (2026)',
    title: 'Progressed Ascendant · ~4°–5° Aquarius',
    eyebrow: 'Conjunct natal North Node',
    body:
      "The progressed Ascendant has arrived within one degree of the natal North Node at 5°17′ Aquarius. The identity is literally arriving at the soul's destination. This is one of the rarest and most exact 'you are becoming who you were meant to be' progressions in the technique.",
    source: { doc: V2, section: '5 · Progressed Ascendant', page: 'pp. 27–28' },
  },
  // ------------- 6 · Solar Return 2026 -------------
  {
    id: 'v2-sr-convergence',
    section: '6 · Solar Return 2026',
    title: 'The convergence of September 6, 2026',
    eyebrow: 'Four rare layers stacked on one birthday',
    body:
      "The 2026 birthday opens the H1 profection year with Jupiter as Time Lord; Jupiter is simultaneously in Leo (Jupiter Return in the natal H7 sign); the progressed Ascendant sits within one degree of the natal NN; and Saturn in Aries has been pressing the bucket-handle Moon since spring. The words spoken and choices made in the weeks around this birthday are the seed declaration of the next 12-year cycle.",
    source: { doc: V2, section: '6 · SR 2026 · The Convergence', page: 'p. 30' },
  },
  {
    id: 'v2-sr-saturn-moon',
    section: '6 · Solar Return 2026',
    title: 'Saturn conjunct natal Moon at SR time',
    eyebrow: 'A discipline of speech',
    body:
      "Saturn in Aries still sits near the natal 6°37′ Aries Moon at the SR. The year's blueprint mandates precise, weighted, intentional communication. Words are structural materials. Ideal use: writing practice, formal documentation, and articulating the Process Guide vision in writing.",
    source: { doc: V2, section: '6 · SR · Saturn on Moon', page: 'pp. 30–31' },
  },
  {
    id: 'v2-sr-pluto-nn',
    section: '6 · Solar Return 2026',
    title: 'Pluto in Aquarius approaching the North Node',
    eyebrow: 'Destiny pressure',
    body:
      "By 6 Sept 2026 Pluto sits at ~2–3° Aquarius, within 2–3° of the NN at 5°17′. Situations that feel too significant to be coincidence begin to appear; the terrain ahead of the NN is being burned clear. Every difficulty is Pluto's way of asking: is this authentically yours?",
    source: { doc: V2, section: '6 · SR · Pluto → NN', page: 'p. 31' },
  },
  // ------------- 7 · Decan Analysis -------------
  {
    id: 'v2-decan-sun',
    section: '7 · Decan Analysis',
    title: 'Sun · 2nd Decan Virgo · ruled by Saturn',
    eyebrow: 'The architect–analyst kinship',
    body:
      "The Saturn-ruled decan explains why the Virgo Sun and Saturn Rx H1 are not merely aspecting — they share planetary kinship. This is the analyst who moves into design: sees the problem with Virgoan precision, applies Saturnian discipline to the solution that will actually hold. Shadow: perfectionism so deep the blueprint never breaks ground.",
    source: { doc: V2, section: '7 · Decan · Sun', page: 'p. 33' },
  },
  {
    id: 'v2-decan-moon',
    section: '7 · Decan Analysis',
    title: 'Moon · 1st Decan Aries · ruled by Mars',
    eyebrow: 'Double-Mars bucket handle',
    body:
      "Mars rules Aries and Mars rules this decan — the most undiluted Aries Moon possible. When the bucket-chart handle fires, the output is Mars-through-Mars: direct, urgent, not naturally softened for audience comfort. Gift: the emotional body is never confused about what it wants. Wound: the world sometimes punishes this clarity.",
    source: { doc: V2, section: '7 · Decan · Moon', page: 'p. 33' },
  },
  {
    id: 'v2-decan-venus',
    section: '7 · Decan Analysis',
    title: 'Venus · 3rd Decan Leo · ruled by Mars · at 29°20′',
    eyebrow: 'Anaretic completed love',
    body:
      "The most action-driven decan of Leo, at the very final degree before the threshold. Loves with body and heart in the same moment; would rather burn completely than protect herself from loving. The anaretic exhaustion is completion, not disillusion — she is waiting for a container worthy of what she brings.",
    source: { doc: V2, section: '7 · Decan · Venus', page: 'pp. 34–35' },
  },
  {
    id: 'v2-decan-mars',
    section: '7 · Decan Analysis',
    title: 'Mars · 1st Decan Gemini · ruled by Jupiter',
    eyebrow: 'Creative drive routed through chart ruler',
    body:
      "Physical drive filters straight through Jupiter. Conversations become philosophies, projects become systems, tasks become teachings. The H5 placement adds joy; the Process Guide work at its best uses exactly this cross-functional, systems-thinking, multi-track creative energy.",
    source: { doc: V2, section: '7 · Decan · Mars', page: 'p. 35' },
  },
  {
    id: 'v2-decan-saturn',
    section: '7 · Decan Analysis',
    title: 'Saturn · 2nd Decan Capricorn · ruled by Venus',
    eyebrow: 'The architect cares about beauty',
    body:
      "Venus rules this decan, which reveals what the stern Capricorn Saturn Rx H1 exterior might conceal: the structures she builds are aesthetically intentional and relationally warm. Discipline is not cold, authority is not harsh. When the internal architecture becomes visible, others will find it both rigorous and genuinely beautiful.",
    source: { doc: V2, section: '7 · Decan · Saturn', page: 'p. 36' },
  },
  // ------------- 8 · Dispositor Chain -------------
  {
    id: 'v2-dispositor',
    section: '8 · Dispositor Chain',
    title: 'Final Dispositor · Mercury Rx in Virgo H8',
    eyebrow: 'Every planet ultimately reports here',
    body:
      "Follow every ruler-of-sign chain and it terminates at Mercury Rx in Virgo H8 — Mercury is in its own sign, self-disposing. The entire chart is governed by the internalized analyst. Practical implication: mental habits are the leverage point for everything. Fix the mind's relationship to itself and the whole chart shifts.",
    source: { doc: V2, section: '8 · Dispositor Chain — Final', page: 'p. 38' },
  },
  // ------------- 10 · Gene Keys -------------
  {
    id: 'v2-gk-51',
    section: '10 · Gene Keys · Hologenetic Profile',
    title: 'Gene Key 51 · at the Aries Moon · Life\'s Work',
    eyebrow: 'Shadow Agitation → Gift Initiative → Siddhi Awakening',
    body:
      "The bucket-handle Moon activates Gene Key 51. Shadow: agitation — the fire with nowhere to go, backed-up restlessness. Gift: initiative — the one who moves first and changes the room with an honest action. Siddhi: awakening — presence and communication that arrive as a genuine wake-up jolt. She does not mean to wake people up; she speaks what is real and the reality itself is the shock.",
    source: { doc: V2, section: '10 · Gene Key 51', page: 'pp. 44–45' },
  },
  {
    id: 'v2-gk-26',
    section: '10 · Gene Keys · Hologenetic Profile',
    title: 'Gene Key 26 · at the anaretic Sag Ascendant · Purpose',
    eyebrow: 'Shadow Pride → Gift Artfulness → Siddhi Invisibility',
    body:
      "The Galactic Center Ascendant activates GK 26. Shadow: pride — armor shaped like confidence but hollow at the center, defending against the mother wound's message. Gift: artfulness — masterful, effortless engagement, being exactly what the moment needs through genuine alignment. Siddhi: invisibility — so fully the transmission that the messenger's ego disappears behind the light.",
    source: { doc: V2, section: '10 · Gene Key 26', page: 'p. 45' },
  },
  // ------------- 11 · Chakra Alignment -------------
  {
    id: 'v2-chakra-root',
    section: '11 · Chakra Alignment',
    title: 'Root · Capricorn stellium H1 · gift + wound in same place',
    eyebrow: 'Healing: rest without guilt',
    body:
      "Triple Capricorn H1 makes the Root simultaneously the most architecturally developed centre and the site of the earliest wound. Healing is not more building — it is accepting the structure she has already built. The mantra: my foundation holds.",
    source: { doc: V2, section: '11 · Root Chakra', page: 'p. 46' },
  },
  {
    id: 'v2-chakra-throat',
    section: '11 · Chakra Alignment',
    title: 'Throat · Mercury Rx + Aries Moon handle · primary healing site',
    eyebrow: 'Every truth spoken opens the channel',
    body:
      "The dispositor chain terminates at Mercury (voice), and the bucket handle is in H3 (speech). Every truth spoken opens the throat another degree; the Saturn-on-Moon transit is both the greatest challenge and the greatest opportunity this chakra will ever have. The voice that speaks under Saturn's pressure becomes a voice that holds.",
    source: { doc: V2, section: '11 · Throat Chakra', page: 'pp. 48–49' },
  },
  {
    id: 'v2-chakra-crown',
    section: '11 · Chakra Alignment',
    title: 'Crown · Galactic Center on the Ascendant · most activated',
    eyebrow: 'The channel: Crown → Third Eye → Throat',
    body:
      "The crown has been oriented at the most information-dense point in the known universe since birth. Downloads are not imagination — they are the crown doing what this specific birth was designed to do. Integration: receive through the crown, analyse through the third eye, articulate through the throat.",
    source: { doc: V2, section: '11 · Crown Chakra', page: 'p. 49' },
  },
];

// Group by section for the page layout.
export const VOL2_SECTIONS = Array.from(
  VOL2_ENTRIES.reduce((m, e) => {
    (m.get(e.section) ?? m.set(e.section, []).get(e.section)!).push(e);
    return m;
  }, new Map<string, Vol2Entry[]>())
).map(([section, entries]) => ({ section, entries }));

export const VOL2_SOURCE: SourceRef = {
  doc: V2, section: 'Full Supplementary Guide (19 sections)', page: 'pp. 1–50',
};
