/** First part of a page title ("Reading your chart | Zodaci" → "Reading your chart"), for breadcrumbs. Null when it names only the site. */
export function crumbTitleFrom(title: string | null | undefined): string | null {
  const first = (title ?? '').split(/\s+[·|—–]\s+/)[0]?.trim() ?? '';
  if (!first || /^zodaci$/i.test(first)) return null;
  return first.length > 60 ? `${first.slice(0, 57).trimEnd()}…` : first;
}
