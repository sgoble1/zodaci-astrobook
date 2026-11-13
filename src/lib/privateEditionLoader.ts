import { supabase } from '@/integrations/supabase/client';
import { ContentLockedError } from '@/lib/protectedContent';

import { retryOnce } from './retryOnce';

/** A denied download is an access state, never a private payload or an unhandled rejection. */

/** Downloads the caller's authorized private edition; a non-access failure is retried once automatically. */
export function downloadPrivateEdition(): Promise<Record<string, Record<string, unknown>>> {
  return retryOnce(attemptDownload);
}

async function attemptDownload(): Promise<Record<string, Record<string, unknown>>> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) throw new ContentLockedError(true);
  const { data, error } = await supabase.functions.invoke('private-edition', {
    body: {}, headers: { Authorization: `Bearer ${session.session.access_token}` },
  });
  const context = (error as { context?: Response } | null)?.context;
  const detail = context ? await context.clone().json().catch(() => null) : data;
  if (context?.status === 401 || detail?.code === 'SIGNED_OUT') throw new ContentLockedError(true);
  if (context?.status === 403 || detail?.code === 'NO_ACCESS') throw new ContentLockedError();
  if (error || typeof data?.url !== 'string') throw new Error(detail?.error ?? 'The private edition could not load.');
  const download = await fetch(data.url, { signal: AbortSignal.timeout(20000) });
  if (!download.ok || !download.body) throw new Error('The private edition download failed.');
  const stream = download.body.pipeThrough(new DecompressionStream('gzip'));
  return JSON.parse(await new Response(stream).text());
}