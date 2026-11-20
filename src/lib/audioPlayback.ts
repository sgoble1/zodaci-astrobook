export type AudioBookmark = { seconds: number; label: string };
export const PLAYBACK_SPEEDS = [1, 1.25, 1.5] as const;
export function clampSeek(seconds: number, duration: number) { return Number.isFinite(seconds) && Number.isFinite(duration) ? Math.max(0, Math.min(seconds, duration)) : 0; }
export function tapeCounter(seconds: number) { const n = Math.max(0, Math.floor(seconds || 0)); return `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`; }
export function addAudioBookmark(items: AudioBookmark[], seconds: number, duration: number): AudioBookmark[] {
  const time = Math.floor(clampSeek(seconds, duration));
  return items.some(b => b.seconds === time) ? items : [...items, { seconds: time, label: `Bookmark ${tapeCounter(time)}` }].sort((a, b) => a.seconds - b.seconds).slice(0, 100);
}
export function storedJson<T>(key: string, fallback: T): T { try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback; } catch { return fallback; } }