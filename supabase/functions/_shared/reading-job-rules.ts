export function readingJobIsCurrent(current: { generation_cancelled: boolean | null; onboarded_at: string | null } | null, birthSavedAt: string | null) {
  return !!current && !current.generation_cancelled && current.onboarded_at === birthSavedAt;
}