const RELOAD_KEY = 'zodaci-chunk-reload';
export function isChunkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /Importing a module script failed|Failed to fetch dynamically imported module|error loading dynamically imported module|Loading chunk .* failed/i.test(message);
}
export function claimChunkReload(storage: Pick<Storage, 'getItem' | 'setItem'>, now: number): boolean {
  try {
    const previous = Number(storage.getItem(RELOAD_KEY));
    if (previous > 0 && now - previous < 60_000) return false;
    storage.setItem(RELOAD_KEY, String(now));
    return true;
  } catch { return false; }
}
export function recoverChunkLoad(error: unknown): boolean {
  if (!isChunkError(error)) return false;
  try {
    if (!claimChunkReload(window.sessionStorage, Date.now())) return false;
    window.location.reload();
    return true;
  } catch { return false; }
}
