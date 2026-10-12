import { registerPrivateValue } from '@/lib/privateEditionStore';
// Data-validation & confidence layer. Every insight the site draws is only as
// trustworthy as the inputs it derives from — this module names those inputs,
// grades each one, and lists which downstream insights degrade when an input
// is ambiguous.

import type { SourceRef } from './compendium';

export type ConfidenceLevel = 'confirmed' | 'derived' | 'approximate' | 'ambiguous';

export interface InputRecord {
  id: string;
  field: string;                    // "Birth Time"
  value: string;                    // e.g. a birth time
  status: ConfidenceLevel;
  note: string;                     // one-line summary
  detail?: string;                  // longer explanation
  alternatives?: { value: string; source: SourceRef; note: string }[];
  affects: string[];                // list of insight areas that soften if this is wrong
  source?: SourceRef;
}

const V1: SourceRef = { doc: 'Complete Birth Chart Analysis · Vol I', section: 'Cover · birth data',        page: 'p. 1' };
const V2: SourceRef = { doc: 'Supplementary Volume II',               section: 'Cover · birth data',        page: 'p. 1' };
const TL: SourceRef = { doc: 'Personal Astrological Timeline', section: 'Cover · birth data',    page: 'p. 1' };

export let BIRTH_CONFIDENCE: InputRecord[] = [];

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

registerPrivateValue("confidence", "BIRTH_CONFIDENCE", value => { BIRTH_CONFIDENCE = value as typeof BIRTH_CONFIDENCE; }, []);
