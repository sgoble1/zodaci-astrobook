import { skyToday } from './skyToday';

/** One owner-only sky observation as stored. */
export type Observation = { id: string; observed_at: string; location: string; notes: string; tags: string[]; created_at: string };

/** Tags typed as "moon, Saturn ,  clear sky" → ['moon', 'saturn', 'clear sky']: trimmed, lower-case, unique, at most 12. */
export function parseTags(raw: string): string[] {
  const seen = new Set<string>();
  for (const t of raw.split(/[,#\n]/)) {
    const tag = t.trim().replace(/\s+/g, ' ').toLowerCase().slice(0, 32);
    if (tag) seen.add(tag);
  }
  return [...seen].slice(0, 12);
}

/** The measured sky at the moment of an observation: Moon phase and sign, and which planets were retrograde. */
export function skyAt(observedAt: string | Date) {
  const s = skyToday(new Date(observedAt));
  const moon = s.bodies.find(b => b.key === 'moon');
  return { phase: s.phase, moonSign: moon?.sign ?? '', retrograde: s.retrograde.map(b => b.name), bodies: s.bodies };
}

export type ObservationPatterns = {
  count: number;
  topTags: { tag: string; n: number }[];
  /** Share (0–100) of observations made while the Moon was waxing. */
  waxingShare: number;
  phases: { name: string; n: number }[];
  moonSigns: { sign: string; n: number }[];
  /** Observations made while Mercury was retrograde. */
  mercuryRx: number;
};

const ranked = (m: Map<string, number>) => [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

/**
 * Patterns in the owner's own log, counted from their entries and the calculated sky on those days. No AI and no
 * interpretation of the person: only what they wrote down and what the sky measurably was.
 */
export function observationPatterns(entries: Pick<Observation, 'observed_at' | 'tags'>[]): ObservationPatterns {
  const tags = new Map<string, number>(), phases = new Map<string, number>(), signs = new Map<string, number>();
  let waxing = 0, mercuryRx = 0;
  for (const e of entries) {
    e.tags.forEach(t => tags.set(t, (tags.get(t) ?? 0) + 1));
    const s = skyAt(e.observed_at);
    phases.set(s.phase.name, (phases.get(s.phase.name) ?? 0) + 1);
    if (s.moonSign) signs.set(s.moonSign, (signs.get(s.moonSign) ?? 0) + 1);
    if (s.phase.waxing) waxing++;
    if (s.retrograde.includes('Mercury')) mercuryRx++;
  }
  return {
    count: entries.length,
    topTags: ranked(tags).slice(0, 5).map(([tag, n]) => ({ tag, n })),
    waxingShare: entries.length ? Math.round((waxing / entries.length) * 100) : 0,
    phases: ranked(phases).map(([name, n]) => ({ name, n })),
    moonSigns: ranked(signs).slice(0, 3).map(([sign, n]) => ({ sign, n })),
    mercuryRx,
  };
}

/** Local date-time input value ("2026-11-06T21:30") → ISO timestamp, or null when the value isn't a real moment. */
export function localInputToIso(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
