import { ContentLockedError } from './protectedContent';

/**
 * Runs a private-content load and, if it fails for any reason other than access, tries once more after a short pause.
 * Access denials (signed out / not shared) never retry: they are answers, not glitches.
 */
export async function retryOnce<T>(load: () => Promise<T>, waitMs = 700): Promise<T> {
  try { return await load(); }
  catch (e) {
    if (e instanceof ContentLockedError) throw e;
    await new Promise(r => setTimeout(r, waitMs));
    return load();
  }
}
