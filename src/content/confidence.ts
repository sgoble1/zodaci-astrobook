// Data-validation & confidence layer. Every insight the site draws is only as
// trustworthy as the inputs it derives from — this module names those inputs,
// grades each one, and lists which downstream insights degrade when an input
// is ambiguous.

import type { SourceRef } from './compendium';

export type ConfidenceLevel = 'confirmed' | 'derived' | 'approximate' | 'ambiguous';

export interface InputRecord {
  id: string;
  field: string;                    // "Birth Time"
  value: string;                    // "3:38 PM EDT"
  status: ConfidenceLevel;
  note: string;                     // one-line summary
  detail?: string;                  // longer explanation
  alternatives?: { value: string; source: SourceRef; note: string }[];
  affects: string[];                // list of insight areas that soften if this is wrong
  source?: SourceRef;
}

const V1: SourceRef = { doc: 'Complete Birth Chart Analysis · Vol I', section: 'Cover · birth data',        page: 'p. 1' };
const V2: SourceRef = { doc: 'Supplementary Volume II',               section: 'Cover · birth data',        page: 'p. 1' };
const TL: SourceRef = { doc: 'Personal Astrological Timeline 1990–2060', section: 'Cover · birth data',    page: 'p. 1' };

export const BIRTH_CONFIDENCE: InputRecord[] = [
  {
    id: 'in-date',   field: 'Birth Date', value: 'September 6, 1990',
    status: 'confirmed',
    note: 'Same across every uploaded source document.',
    affects: [], source: V1,
  },
  {
    id: 'in-time',   field: 'Birth Time', value: '3:38 PM EDT (15:38 local)',
    status: 'ambiguous',
    note: 'Volumes I & II and the Timeline Guide all state 3:38 PM EDT. An earlier working draft cited 11:14 AM. Every angle-based reading uses 3:38 PM until the birth certificate is provided.',
    detail:
      'The Ascendant, Midheaven, all house cusps, the Moon degree, the Ba Zi hour pillar and the profection lord all depend on the exact minute of birth. A 4-hour spread produces a completely different Ascendant sign (Scorpio at 11:14 AM vs. Sagittarius at 3:38 PM) and shifts every planet by 1–2 houses. Until the birth certificate is uploaded, the 3:38 PM figure — the value carried in all three finished PDFs — is used and every derived angle carries a "3:38 PM assumed" badge.',
    alternatives: [
      { value: '3:38 PM EDT · Sag ASC 29°28′', source: V2, note: 'Used by every finished document.' },
      { value: '11:14 AM EDT · Sco ASC ~19°',  source: { doc: 'Working draft', section: 'Earlier note', page: '—' }, note: 'Appears in an early planning note; not present in any finalized report.' },
    ],
    affects: ['Ascendant', 'Midheaven', 'House cusps', 'Aries Moon degree', 'Ba Zi Hour Pillar', 'Profection Lord', 'Solar Return Ascendant'],
    source: V1,
  },
  {
    id: 'in-tz',     field: 'Time Zone', value: 'EDT · UTC−4',
    status: 'confirmed',
    note: 'September 6 1990 in Geneva NY is inside DST (US spring-fall rules); UTC−4 is correct.',
    affects: [], source: TL,
  },
  {
    id: 'in-place',  field: 'Birth Place', value: 'Geneva, New York · 42°52′N 76°59′W',
    status: 'confirmed',
    note: 'Consistent across every source.',
    affects: [], source: V1,
  },
  {
    id: 'in-ephem',  field: 'Ephemeris', value: 'Documentary (hand-transcribed from source PDFs)',
    status: 'derived',
    note: 'Positions come from the PDFs, not from a live ephemeris compute in the browser.',
    detail:
      'Every planetary longitude, transit date and progressed position on the site is transcribed verbatim from the uploaded reports (which were themselves cast against Swiss Ephemeris). Expect ±0.5° drift on degrees printed to the arc-minute, and ±3 days on transit peak dates.',
    affects: ['Exact transit peak dates', 'Progressed position precision'],
  },
  {
    id: 'in-name',   field: 'Full Legal Name', value: 'Not on file',
    status: 'ambiguous',
    note: 'Numerology Expression / Soul-Urge / Personality numbers require the exact legal birth name.',
    affects: ['Expression number', 'Soul-Urge number', 'Personality number'],
  },
];

export const CONFIDENCE_STYLE: Record<ConfidenceLevel, { label: string; className: string }> = {
  confirmed:   { label: 'Confirmed',   className: 'border-emerald-500/60 text-emerald-500 bg-emerald-500/10' },
  derived:     { label: 'Derived',     className: 'border-gold/60 text-gold bg-gold/10' },
  approximate: { label: 'Approximate', className: 'border-amber-500/60 text-amber-500 bg-amber-500/10' },
  ambiguous:   { label: 'Ambiguous',   className: 'border-oxblood/70 text-oxblood bg-oxblood/10' },
};

// A helper to look up how a given topic tag is affected by input ambiguity.
// Returns the *worst* confidence across matching inputs.
export function confidenceFor(topic: string): ConfidenceLevel {
  const rank: Record<ConfidenceLevel, number> = { confirmed: 0, derived: 1, approximate: 2, ambiguous: 3 };
  let worst: ConfidenceLevel = 'confirmed';
  for (const r of BIRTH_CONFIDENCE) {
    if (r.affects.some(a => a.toLowerCase().includes(topic.toLowerCase())) && rank[r.status] > rank[worst]) {
      worst = r.status;
    }
  }
  return worst;
}
