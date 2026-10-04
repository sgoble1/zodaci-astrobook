/** Generated images for the Birth Chart Book illustration plates; replaces each plate's text description when chapters render. */
const files = import.meta.glob('@/assets/plates/plate-*.jpg', { eager: true, import: 'default' }) as Record<string, string>;
const NUM = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI'];
const byNumeral: Record<string, string> = {};
for (const [p, url] of Object.entries(files)) { const n = Number(p.match(/plate-(\d+)/)?.[1]); if (NUM[n]) byNumeral[NUM[n]] = url; }

export function withPlates(md: string): string {
  return md.replace(/^\|\s*Illustration ([IVX]+) — (.+?)\s*\|\s*\n\|---\|\s*$/gm, (all, num: string, rest: string) => {
    const url = byNumeral[num]; if (!url) return all;
    const title = (rest.split(/\s{2,}|\s(?=Pen-and-ink|Full-page|Final closing)/)[0] ?? rest).trim();
    return `![Plate ${num} — ${title}](${url})\n\n*Plate ${num} — ${title}*`;
  });
}
