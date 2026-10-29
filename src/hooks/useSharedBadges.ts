import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { onAccountChange } from '@/lib/authEvents';

let badgeSubscriberNumber = 0;

/** Unread counts for the shared space menu: conversations (server RPC) and new wonderings since last visit. */
export function useSharedBadges() {
  const [badges, setBadges] = useState({ chat: 0, wonderings: 0 });
  useEffect(() => {
    let live = true;
    const channelName = `shared-badges-${++badgeSubscriberNumber}`;
    const load = async () => {
      const { data: s } = await supabase.auth.getSession();
      const uid = s.session?.user.id; if (!uid) { if (live) setBadges({ chat: 0, wonderings: 0 }); return; }
      const [{ data: unread }, { data: read }] = await Promise.all([
        supabase.rpc('shared_unread_counts'),
        supabase.from('shared_wondering_reads').select('last_read_at').eq('user_id', uid).maybeSingle(),
      ]);
      let q = supabase.from('shared_wonderings').select('id', { count: 'exact', head: true }).neq('author_id', uid);
      if (read?.last_read_at) q = q.gt('created_at', read.last_read_at);
      const { count } = await q;
      if (live) setBadges({ chat: (unread ?? []).reduce((a: number, r: { unread_count: number }) => a + Number(r.unread_count), 0), wonderings: count ?? 0 });
    };
    load();
    // Desktop and mobile navigation can be mounted together. Each needs its own channel name.
    const ch = supabase.channel(channelName)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'shared_messages' }, load)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'shared_wonderings' }, load).subscribe();
    const t = window.setInterval(load, 60000);
    const stop = onAccountChange(() => load());
    return () => { live = false; supabase.removeChannel(ch); clearInterval(t); stop(); };
  }, []);
  return badges;
}
