import { registerPrivateValue } from '@/lib/privateEditionStore';
import type { LucideIcon } from 'lucide-react';
import { CircleDot, Compass, Feather, Grid3X3, Layers3, Sparkles, Trees } from 'lucide-react';

export type OtherSystem = {
  slug: string;
  name: string;
  tradition: string;
  icon: LucideIcon;
  result: string;
  calculation: string;
  themes: string[];
  interpretation: string[];
  origin: string;
  history: string[];
  practiceToday: string;
  aprilSynthesis: string[];
  references: { label: string; href: string; note: string }[];
  caution: string;
};

export let OTHER_SYSTEMS: OtherSystem[] = [];

export let COMMON_THREADS: { theme: string; systems: string[]; explanation: string; }[] = [];
const icons = [Compass, CircleDot, Grid3X3, Sparkles, Layers3, Feather, Trees];
registerPrivateValue("otherSystems", "OTHER_SYSTEMS", value => { OTHER_SYSTEMS = (value as OtherSystem[]).map((item, index) => ({ ...item, icon: icons[index] ?? Compass })); }, []);
registerPrivateValue("otherSystems", "COMMON_THREADS", value => { COMMON_THREADS = value as typeof COMMON_THREADS; }, []);
