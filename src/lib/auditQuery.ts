/** Server-side audit log filters: safe search text and local-day bounds, so paging never hides older entries. */
export const AUDIT_PAGE = 200;
export const AUDIT_EXPORT_MAX = 20000;

export type AuditFilters = { from: string; to: string; action: string; table: string; admin: string; text: string };

/** Text usable inside a PostgREST or-filter: drops characters that would change the filter's meaning. */
export function auditSearchTerm(text: string): string {
  return text.replace(/[,()%*\\:"']/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
}

/** ISO bounds for a From/To pair of local dates (To is inclusive, so the upper bound is the next local midnight). */
export function auditDateBounds(from: string, to: string): { gte?: string; lt?: string } {
  const out: { gte?: string; lt?: string } = {};
  const valid = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d);
  if (valid(from)) out.gte = new Date(`${from}T00:00:00`).toISOString();
  if (valid(to)) { const end = new Date(`${to}T00:00:00`); end.setDate(end.getDate() + 1); out.lt = end.toISOString(); }
  return out;
}

/** Keeps every action/table/admin choice seen so far, so filtering never empties the dropdowns. */
export function mergeOptions(prev: string[], next: (string | null | undefined)[]): string[] {
  return [...new Set([...prev, ...next.filter((v): v is string => !!v)])].sort();
}
