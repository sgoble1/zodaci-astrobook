import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/** Public site settings (allowlisted by the database): maintenance notice and feature switches. */
export type SiteFlags = { astrocomic: boolean; referrals: boolean; academy: boolean; compatibility: boolean; community: boolean };
export type SiteSettings = { loaded: boolean; maintenance: { enabled: boolean; message: string }; flags: SiteFlags; general: { display_name: string; tagline: string; support_email: string } };

export const DEFAULT_SETTINGS: SiteSettings = {
  loaded: false,
  maintenance: { enabled: false, message: '' },
  flags: { astrocomic: true, referrals: true, academy: true, compatibility: true, community: true },
  general: { display_name: 'Zodaci', tagline: 'Your sky. Your story.', support_email: '' },
};

/** Merge raw rows into settings; unknown or malformed values fall back to safe defaults (features on, no notice). */
export function parseSiteSettings(rows: { key: string; value: unknown }[]): SiteSettings {
  const by = Object.fromEntries(rows.map(r => [r.key, (r.value && typeof r.value === 'object' ? r.value : {}) as Record<string, unknown>]));
  const m = by['site.maintenance'] ?? {}; const f = by['site.flags'] ?? {}; const g = by['site.general'] ?? {};
  const flag = (k: keyof SiteFlags) => typeof f[k] === 'boolean' ? f[k] as boolean : true;
  const str = (v: unknown, d: string) => typeof v === 'string' ? v.slice(0, 500) : d;
  return {
    loaded: true,
    maintenance: { enabled: m.enabled === true, message: str(m.message, '') },
    flags: { astrocomic: flag('astrocomic'), referrals: flag('referrals'), academy: flag('academy'), compatibility: flag('compatibility'), community: flag('community') },
    general: { display_name: str(g.display_name, 'Zodaci'), tagline: str(g.tagline, DEFAULT_SETTINGS.general.tagline), support_email: str(g.support_email, '') },
  };
}

let cache: SiteSettings | null = null;
let pending: Promise<SiteSettings> | null = null;
const listeners = new Set<(s: SiteSettings) => void>();

export function refreshSiteSettings(): Promise<SiteSettings> {
  pending = (async () => {
    const { data, error } = await supabase.rpc('public_site_settings');
    const next = error ? { ...(cache ?? DEFAULT_SETTINGS), loaded: true } : parseSiteSettings((data ?? []) as { key: string; value: unknown }[]);
    cache = next; listeners.forEach(l => l(next)); pending = null;
    return next;
  })();
  return pending;
}

export function useSiteSettings(): SiteSettings {
  const [s, setS] = useState<SiteSettings>(cache ?? DEFAULT_SETTINGS);
  useEffect(() => {
    listeners.add(setS);
    if (!cache && !pending) void refreshSiteSettings();
    else if (cache) setS(cache);
    return () => { listeners.delete(setS); };
  }, []);
  return s;
}
