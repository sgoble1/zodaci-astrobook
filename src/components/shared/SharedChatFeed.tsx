import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useLibrary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type FeedMessage = { id: string; body: string; sender_id: string; created_at: string };
const ALLOWED = new Set(['shanealecompte@gmail.com', 'babybluepuppet@gmail.com']);
const names: Record<string, string> = {
  'shanealecompte@gmail.com': 'Shane',
  'babybluepuppet@gmail.com': 'April',
};

export function SharedChatFeed() {
  const session = useSession();
  const [conversationId, setConversationId] = useState('');
  const [messages, setMessages] = useState<FeedMessage[]>([]);
  const [directory, setDirectory] = useState<Record<string, string>>({});
  const [body, setBody] = useState('');
  const email = session?.user.email?.toLowerCase() ?? '';

  const load = useCallback(async (id: string) => {
    const [{ data }, { data: people }] = await Promise.all([
      supabase.from('shared_messages').select('id,body,sender_id,created_at').eq('conversation_id', id).order('created_at', { ascending: false }).limit(5),
      supabase.rpc('shared_member_directory'),
    ]);
    setMessages(((data ?? []) as FeedMessage[]).reverse());
    setDirectory(Object.fromEntries((people ?? []).map(row => [row.user_id, row.display_name])));
  }, []);

  useEffect(() => {
    if (!session || !ALLOWED.has(email)) return;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    supabase.rpc('ensure_shared_main_conversation').then(({ data }) => {
      if (!data) return;
      setConversationId(data);
      load(data);
      channel = supabase.channel(`shared-feed:${session.user.id}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'shared_messages', filter: `conversation_id=eq.${data}` }, () => load(data)).subscribe();
    });
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [email, load, session]);

  if (!session || !ALLOWED.has(email)) return null;
  const send = async () => {
    if (!body.trim() || !conversationId) return;
    const value = body.trim(); setBody('');
    const { error } = await supabase.from('shared_messages').insert({ conversation_id: conversationId, body: value, sender_id: session.user.id });
    if (error) setBody(value);
  };
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3"><div><div className="font-smallcaps text-[10px] text-gold">Private · April & Shane</div><h2 className="font-display text-2xl">Our conversation</h2></div><Button asChild variant="outline" size="sm"><Link to={`/shared/chat/${conversationId || ''}`}><MessageCircle/>Open chat</Link></Button></div>
      <div className="parchment divide-y divide-border/60">
        {messages.length === 0 ? <p className="p-4 text-sm text-muted-foreground">No messages yet.</p> : messages.map(message => <div key={message.id} className="p-3"><div className="text-[10px] font-semibold text-gold">{directory[message.sender_id] ?? 'Shared member'} · {new Date(message.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</div><p className="mt-1 whitespace-pre-wrap text-sm">{message.body}</p></div>)}
        <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2 p-3"><Input value={body} onChange={e => setBody(e.target.value)} placeholder={`Message ${email === 'shanealecompte@gmail.com' ? names['babybluepuppet@gmail.com'] : names['shanealecompte@gmail.com']}…`} maxLength={10000}/><Button type="submit" size="icon" disabled={!body.trim() || !conversationId} aria-label="Send private message"><Send/></Button></form>
      </div>
    </section>
  );
}