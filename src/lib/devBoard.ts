/**
 * Developer board rules (pure, tested): error wording, safe layout read, column order, draft validation and undo copies.
 * The database enforces who may change items (is_developer RLS); these helpers only explain outcomes honestly.
 */
export type DevKind = 'feature' | 'bug' | 'gap' | 'plan';
export type DevStatus = 'todo' | 'doing' | 'blocked' | 'done';
export type DevItem = { id: string; title: string; details: string; kind: DevKind; status: DevStatus; area: string; priority: number; blocker: string; cost_cents: number | null; done_at: string | null; created_at: string; updated_at: string };

export const DEV_KINDS: Record<DevKind, string> = { feature: 'Feature', bug: 'Bug', gap: 'Gap', plan: 'Future plan' };
export const DEV_STATUSES: Record<DevStatus, string> = { todo: 'To do', doing: 'In progress', blocked: 'Blocked', done: 'Done' };
export const DEV_ORDER: DevStatus[] = ['todo', 'doing', 'blocked', 'done'];
export const DEV_PRIORITY: Record<number, string> = { 1: 'High', 2: 'Medium', 3: 'Low' };
/** Finished items load in pages of this size; open items always load in full. */
export const DONE_PAGE = 25;
export const LAYOUT_KEY = 'zodaci-dev-layout';

export type DevFailure = 'permission' | 'invalid' | 'network';
type DbError = { code?: string | null; message?: string | null } | null | undefined;

/** Classifies a write result. RLS hides rows instead of erroring on update/delete, so zero affected rows means no permission. */
export function devFailure(error: DbError, affectedRows?: number | null): DevFailure | null {
  if (error) {
    if (error.code === '42501' || /row-level security|permission denied|not allowed/i.test(error.message ?? '')) return 'permission';
    if (error.code === '23514' || error.code === '22001' || error.code === '23502' || error.code === '22P02') return 'invalid';
    return 'network';
  }
  if (affectedRows === 0) return 'permission';
  return null;
}

const VERB = { save: 'save that change', add: 'add that item', delete: 'delete that item', restore: 'restore that item' } as const;
export function devFailureMessage(failure: DevFailure, action: keyof typeof VERB): string {
  if (failure === 'permission') return `Only the developer can ${VERB[action]}. Your account can read the board but not change it.`;
  if (failure === 'invalid') return `Couldn't ${VERB[action]}: one of the fields is too long or not allowed. Check the details and try again.`;
  return `Couldn't ${VERB[action]} — the connection dropped or the server didn't answer. Try again in a moment.`;
}

/** Saved board/list choice; never throws (private browsing can block storage). */
export function readLayout(storage: Pick<Storage, 'getItem'> | null | undefined): 'board' | 'list' {
  try { return storage?.getItem(LAYOUT_KEY) === 'list' ? 'list' : 'board'; } catch { return 'board'; }
}
export function writeLayout(storage: Pick<Storage, 'setItem'> | null | undefined, layout: 'board' | 'list'): void {
  try { storage?.setItem(LAYOUT_KEY, layout); } catch { /* storage blocked */ }
}

/** High priority first, then most recently changed. */
export function sortColumn<T extends Pick<DevItem, 'priority' | 'updated_at'>>(items: T[]): T[] {
  return [...items].sort((a, b) => a.priority - b.priority || Date.parse(b.updated_at) - Date.parse(a.updated_at));
}

export type DevDraft = { title: string; details?: string; kind: DevKind; status?: DevStatus; area?: string; priority?: number; blocker?: string; cost?: string };
export type DevFields = { title: string; details: string; kind: DevKind; status: DevStatus; area: string; priority: number; blocker: string; cost_cents: number | null };
export type DraftErrors = Partial<Record<'title' | 'area' | 'details' | 'blocker' | 'cost', string>>;

/** Validates an add/edit form; cost is typed in dollars and stored in cents. */
export function validateDraft(d: DevDraft): { ok: true; value: DevFields } | { ok: false; errors: DraftErrors } {
  const errors: DraftErrors = {};
  const title = d.title.trim(); const area = (d.area ?? '').trim() || 'General';
  const details = (d.details ?? '').trim(); const blocker = (d.blocker ?? '').trim();
  if (title.length < 3) errors.title = 'Give the item a title of at least 3 characters.';
  else if (title.length > 200) errors.title = 'Keep the title under 200 characters.';
  if (area.length > 40) errors.area = 'Keep the area under 40 characters.';
  if (details.length > 4000) errors.details = 'Keep the details under 4,000 characters.';
  if (blocker.length > 300) errors.blocker = 'Keep the blocker under 300 characters.';
  let cost_cents: number | null = null;
  const raw = (d.cost ?? '').replace(/[$,\s]/g, '');
  if (raw) {
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0 || n > 1_000_000) errors.cost = 'Enter a cost in dollars between 0 and 1,000,000, or leave it empty.';
    else cost_cents = Math.round(n * 100);
  }
  const priority = [1, 2, 3].includes(Number(d.priority)) ? Number(d.priority) : 2;
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { title, details, kind: d.kind, status: d.status ?? 'todo', area, priority, blocker, cost_cents } };
}

export const centsToDollars = (c: number | null | undefined) => (c == null ? '' : (c / 100).toFixed(2));

/** Row to re-insert when a delete is undone: same id and history, so links and done dates survive. */
export function restoreRow(item: DevItem): DevItem {
  const { id, title, details, kind, status, area, priority, blocker, cost_cents, done_at, created_at, updated_at } = item;
  return { id, title, details, kind, status, area, priority, blocker, cost_cents, done_at, created_at, updated_at };
}

/** Status patch with matching done date (set when finishing, cleared when reopening). */
export function statusPatch(status: DevStatus, now = new Date()): { status: DevStatus; done_at: string | null } {
  return { status, done_at: status === 'done' ? now.toISOString() : null };
}
