import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Archive, Check, FileText, Heart, Link2, MessageCircle, MoreHorizontal, Paperclip, Pencil, Plus, Reply, Send, StickyNote, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useLibrary';
import { AuthGate } from '@/components/common/AuthGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Conversation as ChatConversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from '@/components/ai-elements/conversation';
import { Message as ChatMessage, MessageActions, MessageAction, MessageContent } from '@/components/ai-elements/message';
import { SharedReading } from '@/components/shared/SharedReading';
import { MediaLibrary, Recommendations } from '@/components/shared/SharedExtras';
import { Image as ImageIcon, Clapperboard } from 'lucide-react';
import { BookOpen } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

type Conversation = { id: string; title: string; kind: 'main' | 'topic'; created_by: string; created_at: string; updated_at: string };
type Message = { id: string; conversation_id: string; sender_id: string; body: string; created_at: string; edited_at: string | null; reply_to_id: string | null };
type Reaction = { id: string; message_id: string; user_id: string; emoji: string };
type Attachment = { id: string; message_id: string | null; post_id: string | null; uploaded_by: string; file_path: string; file_name: string; mime_type: string | null; size_bytes: number | null; url?: string };
type Post = { id: string; author_id: string; title: string; body: string; created_at: string; updated_at: string };
type Note = { id: string; title: string; body: string; updated_at: string };
type FutureTopic = { id: string; title: string; details: string; status: 'open' | 'done'; updated_at: string };
type AccountRef = { id: string; service_name: string; url: string; username: string; account_owner: string; notes: string; updated_at: string };
type Wondering = { id: string; author_id: string; target_user_id: string; body: string; status: 'open' | 'discussed'; created_at: string; updated_at: string };
type WonderingComment = { id: string; wondering_id: string; author_id: string; body: string; created_at: string; edited_at: string | null };
type WonderingReaction = { id: string; wondering_id: string; user_id: string; emoji: string };
type Directory = Record<string, string>;

const ALLOWED = new Set(['shanealecompte@gmail.com', 'shanegoble@gmail.com', 'babybluepuppet@gmail.com']);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = (name: string): any => supabase.from(name as never); // generated table names are runtime-safe; helper keeps CRUD concise.
const person = (directory: Directory, id: string) => directory[id] ?? 'Shared member';
const stamp = (value: string) => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
const safeName = (name: string) => name.replace(/[^\w.-]+/g, '_');

async function uploadAttachments(files: File[], parent: { message_id?: string; post_id?: string }, userId: string) {
  for (const file of files) {
    const path = `${userId}/${Date.now()}-${crypto.randomUUID()}-${safeName(file.name)}`;
    const uploaded = await supabase.storage.from('shared-space').upload(path, file, { contentType: file.type });
    if (uploaded.error) throw uploaded.error;
    const inserted = await db('shared_attachments').insert({ ...parent, file_path: path, file_name: file.name, mime_type: file.type || null, size_bytes: file.size, uploaded_by: userId });
    if (inserted.error) throw inserted.error;
  }
}

function SharedSpaceGate({ children }: { children: (userId: string) => React.ReactNode }) {
  const session = useSession();
  if (!session) return <AuthGate what="open your private shared space">{children}</AuthGate>;
  const email = session.user.email?.toLowerCase() ?? '';
  if (!ALLOWED.has(email)) return <div className="parchment p-6 max-w-xl"><h2 className="text-2xl">Private shared space</h2><p className="mt-2 text-sm text-muted-foreground">This area is only available to April and Shane.</p></div>;
  return <>{children(session.user.id)}</>;
}

function useDirectory() {
  const [directory, setDirectory] = useState<Directory>({});
  useEffect(() => { supabase.rpc('shared_member_directory').then(({ data }) => setDirectory(Object.fromEntries((data ?? []).map(row => [row.user_id, row.display_name])))); }, []);
  return directory;
}

function SharedNav({ value }: { value: string }) {
  const links = [
    ['overview', '/shared', 'Dashboard', Users], ['chat', '/shared/conversations', 'Conversations', MessageCircle], ['posts', '/shared/posts', 'Posts', FileText], ['notes', '/shared/notes', 'Notes', StickyNote],
    ['wonderings', '/shared/wonderings', 'Wonderings', Heart], ['reading', '/shared/reading', 'Reading Together', BookOpen], ['media', '/shared/media', 'Media Library', ImageIcon], ['recs', '/shared/recommendations', 'Recommendations', Clapperboard], ['later', '/shared/later', 'Talk Later', Archive], ['accounts', '/shared/accounts', 'Accounts', Link2],
  ] as const;
  return <nav className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap" aria-label="Shared space sections">{links.map(([id, to, label, Icon]) => <Button key={id} asChild variant={value === id ? 'default' : 'outline'} size="sm"><Link to={to}><Icon className="h-4 w-4" />{label}</Link></Button>)}</nav>;
}

export default function SharedSpace({ section = 'chat' }: { section?: 'overview' | 'media' | 'recs' | 'chat' | 'posts' | 'wonderings' | 'reading' | 'notes' | 'later' | 'accounts' }) {
  return <div className="space-y-6"><header className="space-y-2"><div className="font-smallcaps text-xs text-gold">Private · April & Shane</div><h1 className="text-4xl sm:text-5xl">Our Shared Space</h1><p className="max-w-2xl text-muted-foreground">Messages, posts, notes, files, things to revisit, and useful account references in one private place.</p></header><SharedNav value={section} /><SharedSpaceGate>{userId => section === 'overview' ? <div className="space-y-5"><SharedOverview /><Recommendations userId={userId} compact /></div> : section === 'media' ? <MediaLibrary userId={userId} /> : section === 'recs' ? <Recommendations userId={userId} /> : section === 'chat' ? <Conversations userId={userId} /> : section === 'posts' ? <Posts userId={userId} /> : section === 'wonderings' ? <Wonderings userId={userId} /> : section === 'reading' ? <SharedReading userId={userId} /> : section === 'notes' ? <Notes userId={userId} /> : section === 'later' ? <TalkLater userId={userId} /> : <Accounts userId={userId} />}</SharedSpaceGate></div>;
}

function SharedOverview() {
  const directory = useDirectory();
  const [messages, setMessages] = useState<Message[]>([]); const [posts, setPosts] = useState<Post[]>([]); const [notes, setNotes] = useState<Note[]>([]); const [topics, setTopics] = useState<FutureTopic[]>([]); const [wonderings, setWonderings] = useState<Wondering[]>([]);
  const load = useCallback(async () => { const [m, p, n, t, w] = await Promise.all([db('shared_messages').select('*').order('created_at', { ascending: false }).limit(6), db('shared_posts').select('*').order('created_at', { ascending: false }).limit(4), db('shared_notes').select('*').order('updated_at', { ascending: false }).limit(4), db('shared_future_topics').select('*').eq('status', 'open').order('updated_at', { ascending: false }).limit(6), db('shared_wonderings').select('*').order('updated_at', { ascending: false }).limit(4)]); setMessages((m.data ?? []) as Message[]); setPosts((p.data ?? []) as Post[]); setNotes((n.data ?? []) as Note[]); setTopics((t.data ?? []) as FutureTopic[]); setWonderings((w.data ?? []) as Wondering[]); }, []);
  useEffect(() => { load(); const channel = supabase.channel('shared-overview').on('postgres_changes', { event: '*', schema: 'public', table: 'shared_messages' }, load).on('postgres_changes', { event: '*', schema: 'public', table: 'shared_posts' }, load).on('postgres_changes', { event: '*', schema: 'public', table: 'shared_notes' }, load).on('postgres_changes', { event: '*', schema: 'public', table: 'shared_future_topics' }, load).on('postgres_changes', { event: '*', schema: 'public', table: 'shared_wonderings' }, load).subscribe(); return () => { supabase.removeChannel(channel); }; }, [load]);
  return <div className="grid gap-5 md:grid-cols-2"><section className="parchment p-5 space-y-3"><div className="flex justify-between"><h2 className="text-2xl">Latest messages</h2><Link className="text-xs underline" to="/shared/conversations">Open chat</Link></div>{messages.map(m => <div key={m.id} className="border-t border-border/60 pt-2"><div className="text-[10px] text-gold">{person(directory, m.sender_id)} · {stamp(m.created_at)}</div><p className="text-sm line-clamp-2">{m.body || 'Shared an attachment'}</p></div>)}</section><section className="parchment p-5 space-y-3"><div className="flex justify-between"><h2 className="text-2xl">Recent posts</h2><Link className="text-xs underline" to="/shared/posts">View posts</Link></div>{posts.map(p => <div key={p.id} className="border-t border-border/60 pt-2"><b>{p.title || 'Shared post'}</b><p className="text-sm text-muted-foreground line-clamp-2">{p.body}</p></div>)}</section><section className="parchment p-5 space-y-3"><div className="flex justify-between"><h2 className="text-2xl">Wonderings about you</h2><Link className="text-xs underline" to="/shared/wonderings">Open wonderings</Link></div>{wonderings.length === 0 ? <p className="text-sm text-muted-foreground">No wonderings yet.</p> : wonderings.map(w => <div key={w.id} className="border-t border-border/60 pt-2"><div className="text-[10px] text-gold">{person(directory, w.author_id)} → {person(directory, w.target_user_id)} · {stamp(w.updated_at)}</div><p className="text-sm line-clamp-2">{w.body}</p></div>)}</section><section className="parchment p-5 space-y-3"><div className="flex justify-between"><h2 className="text-2xl">Shared notes</h2><Link className="text-xs underline" to="/shared/notes">Open notes</Link></div>{notes.map(n => <div key={n.id} className="border-t border-border/60 pt-2"><b>{n.title}</b><p className="text-sm text-muted-foreground line-clamp-2">{n.body}</p></div>)}</section><section className="parchment p-5 space-y-3"><div className="flex justify-between"><h2 className="text-2xl">Talk later</h2><Link className="text-xs underline" to="/shared/later">Open list</Link></div>{topics.map(t => <div key={t.id} className="border-t border-border/60 pt-2"><b>{t.title}</b><p className="text-sm text-muted-foreground line-clamp-2">{t.details}</p></div>)}</section></div>;
}

function Conversations({ userId }: { userId: string }) {
  const { id } = useParams();
  const nav = useNavigate();
  const directory = useDirectory();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [body, setBody] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [topic, setTopic] = useState('');
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editing, setEditing] = useState<Message | null>(null);
  const [editBody, setEditBody] = useState('');
  const [deleting, setDeleting] = useState<Message | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    const main = await supabase.rpc('ensure_shared_main_conversation');
    if (main.error) { toast.error(main.error.message); return; }
    const { data } = await db('shared_conversations').select('*').order('kind').order('updated_at', { ascending: false });
    const rows = (data ?? []) as Conversation[];
    setConversations(rows);
    const { data: unreadRows } = await supabase.rpc('shared_unread_counts');
    const counts = Object.fromEntries((unreadRows ?? []).map(row => [row.conversation_id, Number(row.unread_count)]));
    setUnread(counts);
    if (!id && main.data) nav(`/shared/chat/${main.data}`, { replace: true });
  }, [id, nav, userId]);

  const loadMessages = useCallback(async () => {
    if (!id) return;
    const { data: messageRows } = await db('shared_messages').select('*').eq('conversation_id', id).order('created_at');
    const messageIds = (messageRows ?? []).map((row: Message) => row.id);
    const [{ data: attachmentRows }, { data: reactionRows }] = messageIds.length ? await Promise.all([
      db('shared_attachments').select('*').in('message_id', messageIds).order('created_at'),
      db('shared_message_reactions').select('*').in('message_id', messageIds),
    ]) : [{ data: [] }, { data: [] }];
    setMessages((messageRows ?? []) as Message[]);
    const rows = (attachmentRows ?? []) as Attachment[];
    if (rows.length) {
      const signed = await supabase.storage.from('shared-space').createSignedUrls(rows.map(row => row.file_path), 60 * 60);
      rows.forEach((row, index) => { row.url = signed.data?.[index]?.signedUrl; });
    }
    setAttachments(rows);
    setReactions((reactionRows ?? []) as Reaction[]);
    await db('shared_conversation_reads').upsert({ conversation_id: id, user_id: userId, last_read_at: new Date().toISOString() });
    setUnread(current => ({ ...current, [id]: 0 }));
  }, [id, userId]);

  useEffect(() => { loadConversations(); }, [loadConversations]);
  useEffect(() => { loadMessages(); }, [loadMessages]);
  useEffect(() => {
    const channel = supabase.channel(`shared-space:${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shared_conversations' }, () => loadConversations())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'shared_messages' }, payload => {
        const incoming = payload.new as Message;
        if (incoming.conversation_id === id) loadMessages();
        else if (incoming.sender_id !== userId) setUnread(current => ({ ...current, [incoming.conversation_id]: (current[incoming.conversation_id] ?? 0) + 1 }));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shared_attachments' }, () => loadMessages())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shared_message_reactions' }, () => loadMessages())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, loadConversations, loadMessages, userId]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); textRef.current?.focus(); }, [messages, id]);

  const addTopic = async () => {
    if (!topic.trim()) return;
    const { data, error } = await db('shared_conversations').insert({ title: topic.trim(), kind: 'topic', created_by: userId }).select('*').single();
    if (error) return toast.error(error.message);
    setTopic(''); await loadConversations(); nav(`/shared/chat/${data.id}`);
  };
  const send = async () => {
    if ((!body.trim() && files.length === 0) || !id || sending) return;
    setSending(true);
    const { data, error } = await db('shared_messages').insert({ conversation_id: id, body: body.trim(), sender_id: userId, reply_to_id: replyTo?.id ?? null }).select('*').single();
    if (error) { toast.error(error.message); setSending(false); return; }
    try { await uploadAttachments(files, { message_id: data.id }, userId); setBody(''); setFiles([]); setReplyTo(null); await loadMessages(); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'File upload failed'); }
    setSending(false); textRef.current?.focus();
  };

  const active = conversations.find(c => c.id === id);
  const filesFor = (messageId: string) => attachments.filter(file => file.message_id === messageId);
  const toggleReaction = async (messageId: string, emoji: string) => { const existing = reactions.find(r => r.message_id === messageId && r.user_id === userId && r.emoji === emoji); const { error } = existing ? await db('shared_message_reactions').delete().eq('id', existing.id) : await db('shared_message_reactions').insert({ message_id: messageId, user_id: userId, emoji }); if (error) toast.error('Reaction could not be saved.'); else await loadMessages(); };
  const saveEdit = async () => { if (!editing || !editBody.trim()) return; const { error } = await db('shared_messages').update({ body: editBody.trim(), edited_at: new Date().toISOString() }).eq('id', editing.id).eq('sender_id', userId); if (error) toast.error(error.message); else { setEditing(null); loadMessages(); } };
  const confirmDelete = async () => { if (!deleting) return; const { error } = await db('shared_messages').delete().eq('id', deleting.id).eq('sender_id', userId); if (error) toast.error(error.message); else { setDeleting(null); loadMessages(); } };
  return <><div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
    <aside className={`parchment p-3 space-y-3 ${id ? 'hidden lg:block' : ''}`}><div className="flex items-center gap-2 px-1"><Users className="h-4 w-4 text-accent"/><span className="font-smallcaps text-[10px] text-gold">April & Shane</span></div><div className="flex gap-2"><Input value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTopic()} placeholder="New topic" aria-label="New conversation topic"/><Button size="icon" onClick={addTopic} aria-label="Add topic"><Plus /></Button></div><div className="space-y-1">{conversations.map(c => <Link key={c.id} to={`/shared/chat/${c.id}`} className={`flex items-center justify-between rounded px-3 py-2 text-sm ${c.id === id ? 'bg-accent/15 text-foreground' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}`}><span className="truncate">{c.kind === 'main' ? 'Main conversation' : c.title}</span>{unread[c.id] ? <span className="min-w-5 rounded-full bg-primary px-1.5 text-center text-xs text-primary-foreground">{unread[c.id]}</span> : null}</Link>)}</div></aside>
    {id && <section className="parchment flex min-h-[70dvh] min-w-0 flex-col overflow-hidden lg:h-[70vh] lg:min-h-0"><div className="border-b border-border px-4 py-3"><Button asChild variant="link" className="h-auto p-0 lg:hidden"><Link to="/shared/conversations">← Conversations</Link></Button><h2 className="text-xl">{active?.kind === 'main' ? 'Main conversation' : active?.title ?? 'Conversation'}</h2><p className="text-xs text-muted-foreground">Live and private to the two of you</p></div><ChatConversation className="min-h-0 flex-1"><ConversationContent className="gap-4">{messages.length === 0 && <ConversationEmptyState icon={<MessageCircle className="h-8 w-8"/>} title="Start the conversation" description="Messages and attachments appear instantly for both of you."/>}{messages.map(message => { const own = message.sender_id === userId; const replied = messages.find(item => item.id === message.reply_to_id); const counts = reactions.filter(r => r.message_id === message.id).reduce<Record<string, number>>((all, reaction) => ({ ...all, [reaction.emoji]: (all[reaction.emoji] ?? 0) + 1 }), {}); return <ChatMessage key={message.id} from={own ? 'user' : 'assistant'}><MessageContent className={own ? 'bg-primary text-primary-foreground' : 'rounded-lg border border-border bg-card/70 px-4 py-3'}><div className={`text-[10px] font-semibold ${own ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}>{person(directory, message.sender_id)} · {stamp(message.created_at)}{message.edited_at ? ' · edited' : ''}</div>{replied && <div className="border-l-2 border-current/30 pl-2 text-xs opacity-75 line-clamp-2">{person(directory, replied.sender_id)}: {replied.body || 'Attachment'}</div>}{message.body && <p className="whitespace-pre-wrap text-sm">{message.body}</p>}<div className="grid gap-2 sm:grid-cols-2">{filesFor(message.id).map(file => file.mime_type?.startsWith('image/') && file.url ? <a key={file.id} href={file.url} target="_blank" rel="noreferrer"><img src={file.url} alt={file.file_name} className="max-h-64 w-full rounded object-cover"/></a> : <a key={file.id} href={file.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded border border-current/20 p-2 text-xs"><Paperclip className="h-4 w-4"/><span className="truncate">{file.file_name}</span></a>)}</div></MessageContent><MessageActions className={own ? 'justify-end' : ''}><MessageAction tooltip="Reply" onClick={() => setReplyTo(message)}><Reply/></MessageAction>{own && <><MessageAction tooltip="Edit" onClick={() => { setEditing(message); setEditBody(message.body); }}><Pencil/></MessageAction><MessageAction tooltip="Delete" onClick={() => setDeleting(message)}><Trash2/></MessageAction></>}{['❤️', '👍', '✨', '😂'].map(emoji => <Button key={emoji} type="button" variant={counts[emoji] ? 'secondary' : 'ghost'} size="sm" onClick={() => toggleReaction(message.id, emoji)}>{emoji}{counts[emoji] ? ` ${counts[emoji]}` : ''}</Button>)}</MessageActions></ChatMessage>; })}<div ref={endRef}/></ConversationContent><ConversationScrollButton/></ChatConversation><form onSubmit={e => { e.preventDefault(); send(); }} className="border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">{replyTo && <div className="mb-2 flex items-center justify-between rounded border border-border bg-muted/40 px-3 py-2 text-xs"><span className="line-clamp-1">Replying to {person(directory, replyTo.sender_id)}: {replyTo.body || 'Attachment'}</span><Button type="button" size="icon" variant="ghost" onClick={() => setReplyTo(null)} aria-label="Cancel reply"><Trash2/></Button></div>}<div className="mb-2 flex flex-wrap gap-2">{files.map(file => <span key={file.name} className="rounded bg-muted px-2 py-1 text-xs">{file.name}</span>)}</div><div className="flex items-end gap-2"><input ref={fileRef} type="file" multiple className="hidden" onChange={e => setFiles(Array.from(e.target.files ?? []))}/><Button type="button" size="icon" variant="outline" onClick={() => fileRef.current?.click()} aria-label="Attach images or files"><Paperclip/></Button><Textarea ref={textRef} value={body} onChange={e => setBody(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} rows={2} placeholder="Write a message…" className="flex-1"/><Button type="submit" size="icon" disabled={sending || (!body.trim() && files.length === 0)} aria-label="Send message"><Send/></Button></div></form></section>}
  </div><Dialog open={!!editing} onOpenChange={open => !open && setEditing(null)}><DialogContent><DialogHeader><DialogTitle>Edit message</DialogTitle></DialogHeader><Textarea value={editBody} onChange={e => setEditBody(e.target.value)} rows={5}/><DialogFooter><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={saveEdit} disabled={!editBody.trim()}>Save</Button></DialogFooter></DialogContent></Dialog><AlertDialog open={!!deleting} onOpenChange={open => !open && setDeleting(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this message?</AlertDialogTitle><AlertDialogDescription>This removes the message and its attachments for both of you.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></>;
}

function Posts({ userId }: { userId: string }) {
  const directory = useDirectory(); const [items, setItems] = useState<Post[]>([]); const [attachments, setAttachments] = useState<Attachment[]>([]); const [title, setTitle] = useState(''); const [body, setBody] = useState(''); const [files, setFiles] = useState<File[]>([]);
  const load = useCallback(async () => { const [{ data }, { data: a }] = await Promise.all([db('shared_posts').select('*').order('created_at', { ascending: false }), db('shared_attachments').select('*').not('post_id', 'is', null).order('created_at')]); const rows = (a ?? []) as Attachment[]; if (rows.length) { const s = await supabase.storage.from('shared-space').createSignedUrls(rows.map(r => r.file_path), 3600); rows.forEach((r, i) => r.url = s.data?.[i]?.signedUrl); } setItems((data ?? []) as Post[]); setAttachments(rows); }, []);
  useEffect(() => { load(); const c = supabase.channel('shared-posts').on('postgres_changes', { event: '*', schema: 'public', table: 'shared_posts' }, load).subscribe(); return () => { supabase.removeChannel(c); }; }, [load]);
  const submit = async () => { if (!body.trim()) return; const { data, error } = await db('shared_posts').insert({ title: title.trim(), body: body.trim(), author_id: userId }).select('*').single(); if (error) return toast.error(error.message); try { await uploadAttachments(files, { post_id: data.id }, userId); setTitle(''); setBody(''); setFiles([]); load(); } catch (error) { toast.error(error instanceof Error ? error.message : 'Upload failed'); } };
  return <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]"><section className="space-y-4">{items.length === 0 && <p className="text-sm text-muted-foreground">No posts yet.</p>}{items.map(post => <article key={post.id} className="parchment p-5 space-y-3"><div><h2 className="text-2xl">{post.title || 'Shared post'}</h2><p className="text-xs text-muted-foreground">{person(directory, post.author_id)} · {stamp(post.created_at)}</p></div><p className="whitespace-pre-wrap text-sm leading-relaxed">{post.body}</p><div className="grid gap-3 sm:grid-cols-2">{attachments.filter(a => a.post_id === post.id).map(a => a.mime_type?.startsWith('image/') && a.url ? <a key={a.id} href={a.url} target="_blank" rel="noreferrer"><img className="max-h-72 w-full rounded object-cover" src={a.url} alt={a.file_name}/></a> : <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded border border-border p-3 text-sm"><Paperclip/>{a.file_name}</a>)}</div></article>)}</section><aside className="parchment p-4 space-y-3 h-fit lg:sticky lg:top-6"><h2 className="text-xl">New post</h2><Input placeholder="Title (optional)" value={title} onChange={e => setTitle(e.target.value)}/><Textarea rows={6} placeholder="Share an update, idea, memory…" value={body} onChange={e => setBody(e.target.value)}/><Input type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt" onChange={e => setFiles(Array.from(e.target.files ?? []))}/><Button onClick={submit} disabled={!body.trim()}><Send/>Publish</Button></aside></div>;
}

function Wonderings({ userId }: { userId: string }) {
  const directory = useDirectory();
  const [items, setItems] = useState<Wondering[]>([]);
  const [comments, setComments] = useState<WonderingComment[]>([]);
  const [reactions, setReactions] = useState<WonderingReaction[]>([]);
  const [body, setBody] = useState('');
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const otherId = Object.keys(directory).find(id => id !== userId && directory[id] !== directory[userId]) ?? '';
  const load = useCallback(async () => {
    const [w, c, r] = await Promise.all([db('shared_wonderings').select('*').order('updated_at', { ascending: false }), db('shared_wondering_comments').select('*').order('created_at'), db('shared_wondering_reactions').select('*')]);
    if (w.error || c.error || r.error) toast.error('Wonderings could not be refreshed.');
    setItems((w.data ?? []) as Wondering[]); setComments((c.data ?? []) as WonderingComment[]); setReactions((r.data ?? []) as WonderingReaction[]);
    await db('shared_wondering_reads').upsert({ user_id: userId, last_read_at: new Date().toISOString() });
  }, [userId]);
  useEffect(() => { load(); const channel = supabase.channel(`shared-wonderings:${userId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'shared_wonderings' }, load).on('postgres_changes', { event: '*', schema: 'public', table: 'shared_wondering_comments' }, load).on('postgres_changes', { event: '*', schema: 'public', table: 'shared_wondering_reactions' }, load).subscribe(); return () => { supabase.removeChannel(channel); }; }, [load, userId]);
  const add = async () => { if (!body.trim() || !otherId) return; const { error } = await db('shared_wonderings').insert({ body: body.trim(), author_id: userId, target_user_id: otherId }); if (error) toast.error(error.message); else { setBody(''); load(); } };
  const addComment = async (wonderingId: string) => { const value = commentDrafts[wonderingId]?.trim(); if (!value) return; const { error } = await db('shared_wondering_comments').insert({ wondering_id: wonderingId, author_id: userId, body: value }); if (error) toast.error(error.message); else { setCommentDrafts(current => ({ ...current, [wonderingId]: '' })); await db('shared_wonderings').update({ updated_at: new Date().toISOString() }).eq('id', wonderingId); load(); } };
  const react = async (wonderingId: string, emoji: string) => { const existing = reactions.find(r => r.wondering_id === wonderingId && r.user_id === userId && r.emoji === emoji); const { error } = existing ? await db('shared_wondering_reactions').delete().eq('id', existing.id) : await db('shared_wondering_reactions').insert({ wondering_id: wonderingId, user_id: userId, emoji }); if (error) toast.error('Reaction could not be saved.'); else load(); };
  const toggle = async (item: Wondering) => { const { error } = await db('shared_wonderings').update({ status: item.status === 'open' ? 'discussed' : 'open', updated_at: new Date().toISOString() }).eq('id', item.id); if (error) toast.error(error.message); else load(); };
  const remove = async (item: Wondering) => { const { error } = await db('shared_wonderings').delete().eq('id', item.id).eq('author_id', userId); if (error) toast.error(error.message); else load(); };
  return <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]"><section className="space-y-4">{items.length === 0 && <p className="text-sm text-muted-foreground">Nothing has been added yet.</p>}{items.map(item => { const itemComments = comments.filter(c => c.wondering_id === item.id); const counts = reactions.filter(r => r.wondering_id === item.id).reduce<Record<string, number>>((all, reaction) => ({ ...all, [reaction.emoji]: (all[reaction.emoji] ?? 0) + 1 }), {}); return <article key={item.id} className={`parchment p-5 space-y-4 ${item.status === 'discussed' ? 'opacity-75' : ''}`}><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-[10px] text-gold">{person(directory, item.author_id)} wondered about {person(directory, item.target_user_id)} · {stamp(item.created_at)}</div><p className="mt-2 whitespace-pre-wrap leading-relaxed">{item.body}</p></div><div className="flex gap-1"><Button size="sm" variant="outline" onClick={() => toggle(item)}>{item.status === 'open' ? 'Mark discussed' : 'Reopen'}</Button>{item.author_id === userId && <Button size="icon" variant="ghost" onClick={() => remove(item)} aria-label="Delete wondering"><Trash2/></Button>}</div></div><div className="flex flex-wrap gap-1">{['❤️', '👍', '✨', '😂'].map(emoji => <Button key={emoji} size="sm" variant={counts[emoji] ? 'secondary' : 'ghost'} onClick={() => react(item.id, emoji)}>{emoji}{counts[emoji] ? ` ${counts[emoji]}` : ''}</Button>)}</div><div className="space-y-2 border-t border-border/60 pt-3">{itemComments.map(comment => <div key={comment.id} className="rounded bg-muted/40 p-3"><div className="text-[10px] text-gold">{person(directory, comment.author_id)} · {stamp(comment.created_at)}</div><p className="mt-1 whitespace-pre-wrap text-sm">{comment.body}</p></div>)}<form onSubmit={e => { e.preventDefault(); addComment(item.id); }} className="flex gap-2"><Input value={commentDrafts[item.id] ?? ''} onChange={e => setCommentDrafts(current => ({ ...current, [item.id]: e.target.value }))} placeholder="Add a comment…"/><Button type="submit" size="icon" disabled={!commentDrafts[item.id]?.trim()} aria-label="Send comment"><Send/></Button></form></div></article>; })}</section><aside className="parchment h-fit space-y-3 p-4 lg:sticky lg:top-6"><h2 className="text-xl">Something I wondered</h2><p className="text-sm text-muted-foreground">Share a question, thought, or realization about {person(directory, otherId)}.</p><Textarea rows={7} value={body} onChange={e => setBody(e.target.value)} placeholder={`Something I was wondering about ${person(directory, otherId)}…`}/><Button onClick={add} disabled={!body.trim() || !otherId}><Plus/>Add wondering</Button></aside></div>;
}

function Notes({ userId }: { userId: string }) {
  const [items, setItems] = useState<Note[]>([]); const [selected, setSelected] = useState<Note | null>(null); const [title, setTitle] = useState(''); const [body, setBody] = useState('');
  const load = useCallback(async () => { const { data } = await db('shared_notes').select('*').order('updated_at', { ascending: false }); setItems((data ?? []) as Note[]); }, []); useEffect(() => { load(); }, [load]);
  const choose = (note: Note | null) => { setSelected(note); setTitle(note?.title ?? ''); setBody(note?.body ?? ''); };
  const save = async () => { if (!title.trim()) return; const patch = { title: title.trim(), body, updated_by: userId, updated_at: new Date().toISOString() }; const result = selected ? await db('shared_notes').update(patch).eq('id', selected.id) : await db('shared_notes').insert({ ...patch, created_by: userId }); if (result.error) return toast.error(result.error.message); toast.success('Note saved'); choose(null); load(); };
  return <div className="grid gap-4 md:grid-cols-[260px_1fr]"><aside className="parchment p-3"><Button className="w-full" variant="outline" onClick={() => choose(null)}><Plus/>New note</Button><div className="mt-3 space-y-1">{items.map(n => <button key={n.id} onClick={() => choose(n)} className={`w-full rounded p-3 text-left ${selected?.id === n.id ? 'bg-accent/15' : 'hover:bg-muted/60'}`}><span className="block truncate text-sm font-medium">{n.title}</span><span className="text-[10px] text-muted-foreground">Updated {stamp(n.updated_at)}</span></button>)}</div></aside><section className="parchment p-5 space-y-3"><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Note title"/><Textarea value={body} onChange={e => setBody(e.target.value)} rows={18} placeholder="Write a shared note…"/><div className="flex justify-end"><Button onClick={save} disabled={!title.trim()}><Check/>Save note</Button></div></section></div>;
}

function TalkLater({ userId }: { userId: string }) {
  const [items, setItems] = useState<FutureTopic[]>([]); const [title, setTitle] = useState(''); const [details, setDetails] = useState('');
  const load = useCallback(async () => { const { data } = await db('shared_future_topics').select('*').order('status').order('created_at', { ascending: false }); setItems((data ?? []) as FutureTopic[]); }, []); useEffect(() => { load(); }, [load]);
  const add = async () => { if (!title.trim()) return; const { error } = await db('shared_future_topics').insert({ title: title.trim(), details: details.trim(), created_by: userId }); if (error) return toast.error(error.message); setTitle(''); setDetails(''); load(); };
  const toggle = async (item: FutureTopic) => { await db('shared_future_topics').update({ status: item.status === 'open' ? 'done' : 'open', updated_at: new Date().toISOString() }).eq('id', item.id); load(); };
  return <div className="grid gap-5 lg:grid-cols-[1fr_320px]"><section className="space-y-3">{items.map(item => <div key={item.id} className={`parchment flex gap-3 p-4 ${item.status === 'done' ? 'opacity-60' : ''}`}><Button size="icon" variant="outline" onClick={() => toggle(item)} aria-label={item.status === 'done' ? 'Reopen topic' : 'Mark discussed'}>{item.status === 'done' ? <Check/> : <MoreHorizontal/>}</Button><div><h3 className={item.status === 'done' ? 'line-through' : ''}>{item.title}</h3>{item.details && <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{item.details}</p>}<span className="text-[10px] text-muted-foreground">{item.status === 'done' ? 'Discussed' : 'For later'}</span></div></div>)}</section><aside className="parchment h-fit p-4 space-y-3"><h2 className="text-xl">Add for later</h2><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="What should we discuss?"/><Textarea rows={5} value={details} onChange={e => setDetails(e.target.value)} placeholder="Context or questions…"/><Button onClick={add} disabled={!title.trim()}><Plus/>Add topic</Button></aside></div>;
}

function Accounts({ userId }: { userId: string }) {
  const [items, setItems] = useState<AccountRef[]>([]); const [form, setForm] = useState({ service_name: '', url: '', username: '', account_owner: 'Shared', notes: '' });
  const load = useCallback(async () => { const { data } = await db('shared_account_refs').select('*').order('service_name'); setItems((data ?? []) as AccountRef[]); }, []); useEffect(() => { load(); }, [load]);
  const add = async () => { if (!form.service_name.trim()) return; if (form.url) { try { const parsed = new URL(form.url); if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error(); } catch { toast.error('Use a complete http or https link.'); return; } } const { error } = await db('shared_account_refs').insert({ ...form, created_by: userId }); if (error) return toast.error(error.message); setForm({ service_name: '', url: '', username: '', account_owner: 'Shared', notes: '' }); load(); };
  const remove = async (id: string) => { const { error } = await db('shared_account_refs').delete().eq('id', id); if (error) toast.error(error.message); else load(); };
  const field = (key: keyof typeof form, placeholder: string) => <Input value={form[key]} onChange={e => setForm(current => ({ ...current, [key]: e.target.value }))} placeholder={placeholder}/>;
  return <div className="space-y-5"><div className="rounded border border-candle/40 bg-candle/10 p-3 text-sm"><strong>Keep this safe:</strong> save links, usernames, ownership, and context here—never passwords, recovery codes, or security answers.</div><div className="parchment grid gap-3 p-4 md:grid-cols-2">{field('service_name', 'Service name')}{field('url', 'https://…')}{field('username', 'Username or account email')}{field('account_owner', 'Owner: Shared, April, or Shane')}<Textarea className="md:col-span-2" rows={3} value={form.notes} onChange={e => setForm(current => ({ ...current, notes: e.target.value }))} placeholder="Notes (never passwords)"/><div className="md:col-span-2"><Button onClick={add} disabled={!form.service_name.trim()}><Plus/>Add account reference</Button></div></div><div className="grid gap-3 sm:grid-cols-2">{items.map(item => <article key={item.id} className="parchment p-4 space-y-2"><div className="flex items-start justify-between gap-2"><h2 className="text-xl">{item.service_name}</h2><Button size="icon" variant="ghost" onClick={() => remove(item.id)} aria-label={`Remove ${item.service_name}`}><Trash2/></Button></div><div className="text-sm"><span className="text-muted-foreground">Owner:</span> {item.account_owner}</div>{item.username && <div className="break-all text-sm"><span className="text-muted-foreground">Username:</span> {item.username}</div>}{item.url && <a className="inline-flex items-center gap-1 break-all text-sm underline" href={item.url} target="_blank" rel="noreferrer"><Link2 className="h-3.5 w-3.5"/>{item.url}</a>}{item.notes && <p className="whitespace-pre-wrap text-sm text-muted-foreground">{item.notes}</p>}</article>)}</div></div>;
}
