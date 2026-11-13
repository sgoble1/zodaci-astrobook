/** The server's own `{ error }` message from a failed backend function call, or the fallback (never a raw status code). */
export async function functionErrorMessage(error: unknown, data: unknown, fallback: string): Promise<string> {
  const own = (data as { error?: unknown } | null)?.error;
  if (typeof own === 'string' && own) return own;
  const ctx = (error as { context?: unknown } | null)?.context;
  if (typeof Response !== 'undefined' && ctx instanceof Response) {
    const body = await ctx.clone().json().catch(() => null) as { error?: unknown } | null;
    if (typeof body?.error === 'string' && body.error) return body.error;
  }
  return fallback;
}
