import { describe, it, expect } from 'vitest';
import { draftChanged, duplicateDraft, scheduleError } from './newsletterRules';

const now = new Date('2026-11-13T12:00:00Z');
describe('newsletter scheduling', () => {
  it('refuses a send time less than 15 minutes ahead', () => {
    expect(scheduleError('2026-11-13T12:14:00Z', now)).toMatch(/15 minutes/);
  });
  it('accepts a send time 15 minutes or more ahead', () => {
    expect(scheduleError('2026-11-13T12:15:00Z', now)).toBeNull();
  });
  it('a duplicate is an unscheduled draft', () => {
    const d = duplicateDraft({ title: 'Nov notes', subject: 's', preview_text: '', body_md: 'b', segment: 'subscribers', scheduled_at: '2026-12-01T10:00:00Z' });
    expect(d).toMatchObject({ title: 'Nov notes (copy)', status: 'draft', scheduled_at: null, sent_at: null });
  });
  it('notices unsaved edits', () => {
    const base = { title: 't', subject: 's', preview_text: '', body_md: 'b', segment: 'all', scheduled_at: null };
    expect(draftChanged(base, { ...base })).toBe(false);
    expect(draftChanged(base, { ...base, body_md: 'b!' })).toBe(true);
  });
});
