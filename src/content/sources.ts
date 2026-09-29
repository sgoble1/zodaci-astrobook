const mods = import.meta.glob('../assets/sources/*.asset.json', { eager: true, import: 'default' }) as Record<string, { url: string; original_filename: string; size: number; content_type: string }>;

export type BuiltInSource = { id: string; title: string; fileName: string; url: string; size: number; type: string; ext: string; usedIn: string };

const used: [RegExp, string, string][] = [
  [/Masterbook/, 'April’s Astrological Masterbook', 'Masterbook reader (all chapters, verbatim)'],
  [/Master_Astrological_Compendium/, 'The Complete Master Astrological Compendium', 'Compendium, Star Map, Profection'],
  [/Volume_2.*\.docx/, 'Volume II — Supplementary Guide (Word)', 'Volume II'],
  [/Volume_2.*\.pdf/, 'Volume II — Supplementary Guide (PDF)', 'Volume II'],
  [/Birth_Chart_Analysis.*-2/, 'Birth Chart Analysis & Feng Shui Guide (copy 2)', 'Birth Chart, Planets, Houses, Feng Shui'],
  [/Birth_Chart_Analysis/, 'Birth Chart Analysis & Feng Shui Guide', 'Birth Chart, Planets, Houses, Feng Shui'],
  [/Timeline.*_2\.pdf/, 'Personal Timeline, Retrogrades & Purpose 1990–2060 (copy 2)', 'Timeline, Retrogrades, Purpose'],
  [/Timeline/, 'Personal Timeline, Retrogrades & Purpose 1990–2060', 'Timeline, Retrogrades, Purpose'],
  [/Illustration_Reference/, 'Illustration Reference Guide — Brett Helquist Style', 'Art Direction'],
  [/Art_Direction_Deck/, 'Print-Ready Art Direction Deck', 'Art Direction'],
];

export const BUILT_IN_SOURCES: BuiltInSource[] = Object.values(mods).map((m) => {
  const f = m.original_filename;
  const hit = used.find(([r]) => r.test(f));
  const ext = f.split('.').pop()!.toLowerCase();
  return { id: f, title: hit?.[1] ?? f, fileName: f, url: m.url, size: m.size, type: m.content_type, ext, usedIn: hit?.[2] ?? '—' };
}).sort((a, b) => a.title.localeCompare(b.title));

export const fmtSize = (n?: number | null) => !n ? '' : n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.round(n / 1e3)} KB`;
