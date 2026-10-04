import { supabase } from '@/integrations/supabase/client';

export async function authenticatedFunctionHeaders() {
  let { data } = await supabase.auth.getSession();
  const expiresSoon = !data.session?.expires_at || data.session.expires_at * 1000 <= Date.now() + 30_000;
  if (expiresSoon) {
    const refreshed = await supabase.auth.refreshSession();
    data = refreshed.data;
  }
  const token = data.session?.access_token;
  if (!token) throw new Error('Your sign-in has expired. Please sign in again.');
  return {
    apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${token}`,
  };
}

export function friendlyChatError(error: Error) {
  if (/401|unauthorized|\{\"ok\":false\}/i.test(error.message)) return 'Your sign-in has expired. Please sign in again.';
  try {
    const parsed = JSON.parse(error.message) as { error?: string };
    return parsed.error || error.message;
  } catch {
    return error.message;
  }
}