import { registerPrivateValue } from '@/lib/privateEditionStore';
// Chinese astrology · Four Pillars of Destiny (Ba Zi) for
// Recorded birth data (private edition).

import type { SourceRef } from './compendium';
import type { Reasoning } from '@/components/common/ReasoningPanel';

const SRC: SourceRef = {
  doc: 'Chinese Astrology · Four Pillars of Destiny',
  section: 'Ba Zi for the recorded birth data',
  page: 'cross-checked against Astro.com',
};

export interface Pillar {
  id: string;
  label: string;
  stem: string;
  branch: string;
  romanized: string;
  element: string;
  animal: string;
  meaning: string;
  reasoning: Reasoning;
}

export let PILLARS: Pillar[] = [];

export interface ElementBalance { element: string; count: number; note: string; }

export let ELEMENT_BALANCE: ElementBalance[] = [];

export let LIFE_LESSON: { readonly headline: string; readonly body: string; } = {"headline":"","body":""};

export let LUCK_PILLARS: { id: string; window: string; pillar: string; note: string; }[] = [];

export let CHINESE_SOURCE: SourceRef = {"doc":"","section":"","page":""};

registerPrivateValue("chinese", "PILLARS", value => { PILLARS = value as typeof PILLARS; }, []);
registerPrivateValue("chinese", "ELEMENT_BALANCE", value => { ELEMENT_BALANCE = value as typeof ELEMENT_BALANCE; }, []);
registerPrivateValue("chinese", "LIFE_LESSON", value => { LIFE_LESSON = value as typeof LIFE_LESSON; }, {"headline":"","body":""});
registerPrivateValue("chinese", "LUCK_PILLARS", value => { LUCK_PILLARS = value as typeof LUCK_PILLARS; }, []);
registerPrivateValue("chinese", "CHINESE_SOURCE", value => { CHINESE_SOURCE = value as typeof CHINESE_SOURCE; }, {"doc":"","section":"","page":""});
