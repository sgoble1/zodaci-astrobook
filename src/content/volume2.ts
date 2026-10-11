import { registerPrivateValue } from '@/lib/privateEditionStore';
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

export let VOL2_ENTRIES: Vol2Entry[] = [];

// Group by section for the page layout.
export let VOL2_SECTIONS: { section: string; entries: Vol2Entry[]; }[] = [];

export let VOL2_SOURCE: SourceRef = {"doc":"","section":"","page":""};

registerPrivateValue("volume2", "VOL2_ENTRIES", value => { VOL2_ENTRIES = value as typeof VOL2_ENTRIES; }, []);
registerPrivateValue("volume2", "VOL2_SECTIONS", value => { VOL2_SECTIONS = value as typeof VOL2_SECTIONS; }, []);
registerPrivateValue("volume2", "VOL2_SOURCE", value => { VOL2_SOURCE = value as typeof VOL2_SOURCE; }, {"doc":"","section":"","page":""});
