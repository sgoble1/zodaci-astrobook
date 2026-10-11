import { registerPrivateValue } from '@/lib/privateEditionStore';
// Outer-planet transits to April's natal points, 2026–2040.
// Interpretations sourced from the Personal Astrological Timeline PDF;
// each event carries a `reasoning` panel showing which natal degree the
// transit meets and why it lands in the stated window.

import type { SourceRef } from './compendium';
import type { Reasoning } from '@/components/common/ReasoningPanel';

const SRC: SourceRef = {
  doc: 'Personal Astrological Timeline 1990–2060',
  section: 'V · Outer-Planet Transits',
  page: 'passim',
};

const TL = (section: string, page: string): SourceRef =>
  ({ doc: 'Personal Astrological Timeline 1990–2060', section, page });

export interface TransitEvent {
  id: string;
  window: string;
  startYear: number;
  endYear: number;
  transiting: string;
  aspect: string;
  natalPoint: string;
  title: string;
  body: string;
  intensity: 'era-defining' | 'major' | 'notable';
  reasoning: Reasoning;
  sources: SourceRef[];
}

const orb = (deg: string) => ({ label: 'Orb applied', value: `≤ ${deg}` });

export let TRANSITS: TransitEvent[] = [];

export let TRANSITS_SOURCE: SourceRef = {"doc":"","section":"","page":""};

registerPrivateValue("transits", "TRANSITS", value => { TRANSITS = value as typeof TRANSITS; }, []);
registerPrivateValue("transits", "TRANSITS_SOURCE", value => { TRANSITS_SOURCE = value as typeof TRANSITS_SOURCE; }, {"doc":"","section":"","page":""});
