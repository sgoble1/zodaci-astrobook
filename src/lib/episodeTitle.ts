/** Readable episode title: uploads named like "birth-chart-series-v2-part-2.mp3" lose the extension and dashes. Typed titles are left alone. */
export function episodeTitle(raw: string | null | undefined): string {
  const t = (raw ?? '').trim();
  if (!t) return 'Untitled episode';
  const noExt = t.replace(/\.(mp3|m4a|wav|ogg|aac|flac|webm)$/i, '');
  const looksLikeFile = noExt !== t || (/^[\w.-]+$/.test(noExt) && /[-_]/.test(noExt));
  if (!looksLikeFile) return t;
  const spaced = noExt.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()
    .replace(/\bv(\d+)\b/gi, 'v$1').replace(/\bpart (\d+)\b/gi, '· Part $1');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
