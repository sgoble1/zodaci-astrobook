export type ReadingVisit = { path: string; title: string; section: string; progress: number };
export function readingStatus(status?: string): 'ready' | 'preview' | 'failed' | 'writing' | 'not-created' {
  if (status === 'preview') return 'preview';
  if (status === 'ready' || status === 'published' || status === 'complete' || status === 'completed') return 'ready';
  if (status === 'failed' || status === 'error') return 'failed';
  if (status === 'generating' || status === 'writing' || status === 'queued') return 'writing';
  return 'not-created';
}
export function readingIsOlder(readingDate: string, birthSavedAt: string | null): boolean {
  return !!birthSavedAt && Date.parse(readingDate) < Date.parse(birthSavedAt);
}
export const readingVisitKey = (userId: string) => `zodaci-reading-visit:${userId}`;