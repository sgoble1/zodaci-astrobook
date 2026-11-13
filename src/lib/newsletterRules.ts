/** Campaign scheduling rules for Admin → Newsletter. */
export const MIN_SCHEDULE_LEAD_MINUTES = 15;

/** A scheduled send must be at least 15 minutes ahead, so there is time to review and cancel. */
export function scheduleError(when: string | null, now = new Date()): string | null {
  if (!when) return 'Choose a send time.';
  const t = new Date(when).getTime();
  if (Number.isNaN(t)) return 'That send time is not a valid date.';
  if (t < now.getTime() + MIN_SCHEDULE_LEAD_MINUTES * 60_000) return `Choose a send time at least ${MIN_SCHEDULE_LEAD_MINUTES} minutes from now.`;
  return null;
}

type Draftish = { title: string; subject: string; preview_text: string; body_md: string; segment: string; scheduled_at: string | null };
/** True when the editor holds changes that are not saved yet. */
export const draftChanged = (a: Draftish, b: Draftish) => (['title', 'subject', 'preview_text', 'body_md', 'segment'] as const).some(k => (a[k] ?? '') !== (b[k] ?? '')) || (a.scheduled_at ?? '').slice(0, 16) !== (b.scheduled_at ?? '').slice(0, 16);

/** A copy of a campaign as a new draft: same content, "(copy)" title, never scheduled or sent. */
export const duplicateDraft = <T extends Draftish>(c: T) => ({ title: `${c.title} (copy)`.slice(0, 150), subject: c.subject, preview_text: c.preview_text, body_md: c.body_md, segment: c.segment, status: 'draft' as const, scheduled_at: null, sent_at: null });
