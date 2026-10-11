import { computeChart, type ChartInput } from '@/lib/astro';
import type { Relationship } from '@/hooks/useRelationships';

export function wonderingSuggestions(person?: Relationship): string[] {
  const base = ['What helps you feel heard when we disagree?', 'How do you prefer to receive support?', 'What would you like us to understand better about each other?', 'Which boundaries would make our connection more comfortable?'];
  if (!person) return base;
  try {
    const input: ChartInput = { date: person.birth_date, time: person.birth_time, lat: person.lat, lon: person.lon, tz: person.tz, placeLabel: person.place_label, placeSource: 'geocoded' };
    const c = computeChart(input);
    const mercury = c.bodies.find(b => b.key === 'mercury');
    const venus = c.bodies.find(b => b.key === 'venus');
    return [mercury ? `Your calculated Mercury is in ${mercury.sign}. Does that communication symbolism resonate with you, or not?` : base[0], venus ? `Your calculated Venus is in ${venus.sign}. What actually makes you feel appreciated, regardless of that symbolism?` : base[1], ...base];
  } catch { return base; }
}