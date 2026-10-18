import { describe, expect, it } from 'vitest';
import { readingJobIsCurrent } from '../../supabase/functions/_shared/reading-job-rules';
describe('reading publication safety', () => {
  it('stopped charts cannot publish or spend another correction call', () => expect(readingJobIsCurrent({ generation_cancelled: true, onboarded_at: '2026-10-18' }, '2026-10-18')).toBe(false));
  it('editing birth details invalidates an in-flight chart job', () => expect(readingJobIsCurrent({ generation_cancelled: false, onboarded_at: '2026-10-19' }, '2026-10-18')).toBe(false));
  it('unchanged active charts may finish', () => expect(readingJobIsCurrent({ generation_cancelled: false, onboarded_at: '2026-10-18' }, '2026-10-18')).toBe(true));
  it('unavailable chart state fails closed', () => expect(readingJobIsCurrent(null, '2026-10-18')).toBe(false));
});