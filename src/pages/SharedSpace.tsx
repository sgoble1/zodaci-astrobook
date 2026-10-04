import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Archive, Check, FileText, Image, Link2, MessageCircle, MoreHorizontal, Paperclip, Plus, Send, StickyNote, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useLibrary';
import { AuthGate } from '@/components/common/AuthGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Conversation = { id: string; title: string; kind: 'main' | 'topic'; created_by: string; created_at: string; updated_at: string };
type Message = { id: string; conversation_id: string; sender_id: string; body: string; created_at: string; edited_at: string | null };
type Attachment = { id: string; message_id: string | null; post_id: string | null; uploaded_by: string; file_path: string; file_name: string; mime_type: string | null; size_bytes: number | null; url?: string };
type Post = { id: string; author_id: string; title: string; body: string; created_at: string; updated_at: string };
type Note = { id: string; title: string; body: string; updated_at: string };
type FutureTopic = { id: string; title: string; details: string; status: 'open' | 'done'; updated_at: string };
type AccountRef = { id: string; service_name: string; url: string; username: string; account_owner: string; notes: string; updated_at: string };
type Directory = Record<string, string>;

const ALLOWED = new Set(['shanealecompte@gmail.com', 'babybluepuppet@gmail.com']);
const db = (name: string) => supabase.from(name as never) as any; // generated table names are runtime-safe; helper keeps CRUD concise.
const person = (directory: Directory, id: string) => directory[id] ?? 'Shared member';
const stamp = (value: string) => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
const safeName = (name: string) => name.replace(/[^\w.\-]+/g, '_');

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
    ['chat', '/shared', 'Conversations', MessageCircle], ['posts', '/shared/posts', 'Posts', FileText], ['notes', '/shared/notes', 'Notes', StickyNote],
    ['later', '/shared/later', 'Talk Later', Archive], ['accounts', '/shared/accounts', 'Accounts', Link2],
  ] as const;
  return <nav className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap" aria-label="Shared space sections">{links.map(([id, to, label, Icon]) => <Button key={id} asChild variant={value === id ? 'default' : 'outline'} size="sm"><Link to={to}><Icon className="h-4 w-4" />{label}</Link></Button>)}</nav>;
}

export default function SharedSpace({ section = 'chat' }: { section?: 'chat' | 'posts' | 'notes' | 'later' | 'accounts' }) {
  return <div className="space-y-6"><header className="space-y-2"><div className="font-smallcaps text-xs text-gold">Private · April & Shane</div><h1 className="text-4xl sm:text-5xl">Our Shared Space</h1><p className="max-w-2xl text-muted-foreground">Messages, posts, notes, files, things to revisit, and useful account references in one private place.</p></header><SharedNav value={section} /><SharedSpaceGate>{userId => section === 'chat' ? <Conversations userId={userId} /> : section === 'posts' ? <Posts userId={userId} /> : section === 'notes' ? <Notes userId={userId} /> : section === 'later' ? <TalkLater userId={userId} /> : <Accounts userId={userId} />}</SharedSpaceGate></div>;
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
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    const main = await supabase.rpc('ensure_shared_main_conversation');
    if (main.error) { toast.error(main.error.message); return; }
    const { data } = await db('shared_conversations').select('*').order('kind').order('updated_at', { ascending: false });
    const rows = (data ?? []) as Conversation[];
    setConversations(rows);
    const [{ data: messageRows }, { data: readRows }] = await Promise.all([
      db('shared_messages').select('conversation_id,sender_id,created_at').neq('sender_id', userId),
      db('shared_conversation_reads').select('conversation_id,last_read_at').eq('user_id', userId),
    ]);
    const readAt = new Map((readRows ?? []).map((row: { conversation_id: string; last_read_at: string }) => [row.conversation_id, row.last_read_at]));
    const counts: Record<string, number> = {};
    for (const row of messageRows ?? []) {
      const lastRead = readAt.get(row.conversation_id);
      if (!lastRead || row.created_at > lastRead) counts[row.conversation_id] = (counts[row.conversation_id] ?? 0) + 1;
    }
    setUnread(counts);
    if (!id && main.data) nav(`/shared/chat/${main.data}`, { replace: true });
  }, [id, nav, userId]);

  const loadMessages = useCallback(async () => {
    if (!id) return;
    const [{ data: messageRows }, { data: attachmentRows }] = await Promise.all([
      db('shared_messages').select('*').eq('conversation_id', id).order('created_at'),
      db('shared_attachments').select('*').not('message_id', 'is', null).order('created_at'),
    ]);
    setMessages((messageRows ?? []) as Message[]);
    const rows = (attachmentRows ?? []) as Attachment[];
    if (rows.length) {
      const signed = await supabase.storage.from('shared-space').createSignedUrls(rows.map(row => row.file_path), 60 * 60);
      rows.forEach((row, index) => { row.url = signed.data?.[index]?.signedUrl; });
    }
    setAttachments(rows);
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
    const { data, error } = await db('shared_messages').insert({ conversation_id: id, body: body.trim(), sender_id: userId }).select('*').single();
    if (error) { toast.error(error.message); setSending(false); return; }
    try { await uploadAttachments(files, { message_id: data.id }, userId); setBody(''); setFiles([]); await loadMessages(); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'File upload failed'); }
    setSending(false); textRef.current?.focus();
  };

  const active = conversations.find(c => c.id === id);
  const filesFor = (messageId: string) => attachments.filter(file => file.message_id === messageId);
  return <div className="grid min-h-[620px] gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
    <aside className="parchment p-3 space-y-3"><div className="flex items-center gap-2 px-1"><Users className="h-4 w-4 text-accent"/><span className="font-smallcaps text-[10px] text-gold">April & Shane</span></div><div className="flex gap-2"><Input value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTopic()} placeholder="New topic" aria-label="New conversation topic"/><Button size="icon" onClick={addTopic} aria-label="Add topic"><Plus /></Button></div><div className="space-y-1">{conversations.map(c => <Link key={c.id} to={`/shared/chat/${c.id}`} className={`flex items-center justify-between rounded px-3 py-2 text-sm ${c.id === id ? 'bg-accent/15 text-foreground' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}`}><span className="truncate">{c.kind === 'main' ? 'Main conversation' : c.title}</span>{unread[c.id] ? <span className="min-w-5 rounded-full bg-primary px-1.5 text-center text-xs text-primary-foreground">{unread[c.id]}</span> : null}</Link>)}</div></aside>
    <section className="parchment flex min-h-[620px] min-w-0 flex-col overflow-hidden"><div className="border-b border-border px-4 py-3"><h2 className="text-xl">{active?.kind === 'main' ? 'Main conversation' : active?.title ?? 'Conversation'}</h2><p className="text-xs text-muted-foreground">Live and private to the two of you</p></div><div className="flex-1 space-y-4 overflow-y-auto p-4 max-h-[58vh]">{messages.length === 0 && <div className="py-20 text-center text-sm text-muted-foreground"><MessageCircle className="mx-auto mb-3 h-8 w-8 text-accent"/>Start the conversation.</div>}{messages.map(message => { const own = message.sender_id === userId; return <article key={message.id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] space-y-2 rounded-lg px-4 py-3 ${own ? 'bg-primary text-primary-foreground' : 'border border-border bg-card/70'}`}><div className={`text-[10px] font-semibold ${own ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}>{person(directory, message.sender_id)} · {stamp(message.created_at)}</div>{message.body && <p className="whitespace-pre-wrap text-sm">{message.body}</p>}<div className="grid gap-2 sm:grid-cols-2">{filesFor(message.id).map(file => file.mime_type?.startsWith('image/') && file.url ? <a key={file.id} href={file.url} target="_blank" rel="noreferrer"><img src={file.url} alt={file.file_name} className="max-h-64 w-full rounded object-cover"/></a> : <a key={file.id} href={file.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded border border-current/20 p-2 text-xs"><Paperclip className="h-4 w-4"/><span className="truncate">{file.file_name}</span></a>)}</div></div></article>; })}<div ref={endRef}/></div><form onSubmit={e => { e.preventDefault(); send(); }} className="border-t border-border p-3"><div className="mb-2 flex flex-wrap gap-2">{files.map(file => <span key={file.name} className="rounded bg-muted px-2 py-1 text-xs">{file.name}</span>)}</div><div className="flex items-end gap-2"><input ref={fileRef} type="file" multiple className="hidden" onChange={e => setFiles(Array.from(e.target.files ?? []))}/><Button type="button" size="icon" variant="outline" onClick={() => fileRef.current?.click()} aria-label="Attach images or files"><Paperclip/></Button><Textarea ref={textRef} value={body} onChange={e => setBody(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} rows={2} placeholder="Message April…" className="flex-1"/><Button type="submit" size="icon" disabled={sending || (!body.trim() && files.length === 0)} aria-label="Send message"><Send/></Button></div></form></section>
  </div>;
}

function Posts({ userId }: { userId: string }) {
  const directory = useDirectory(); const [items, setItems] = useState<Post[]>([]); const [attachments, setAttachments] = useState<Attachment[]>([]); const [title, setTitle] = useState(''); const [body, setBody] = useState(''); const [files, setFiles] = useState<File[]>([]);
  const load = useCallback(async () => { const [{ data }, { data: a }] = await Promise.all([db('shared_posts').select('*').order('created_at', { ascending: false }), db('shared_attachments').select('*').not('post_id', 'is', null).order('created_at')]); const rows = (a ?? []) as Attachment[]; if (rows.length) { const s = await supabase.storage.from('shared-space').createSignedUrls(rows.map(r => r.file_path), 3600); rows.forEach((r, i) => r.url = s.data?.[i]?.signedUrl); } setItems((data ?? []) as Post[]); setAttachments(rows); }, []);
  useEffect(() => { load(); const c = supabase.channel('shared-posts').on('postgres_changes', { event: '*', schema: 'public', table: 'shared_posts' }, load).subscribe(); return () => { supabase.removeChannel(c); }; }, [load]);
  const submit = async () => { if (!body.trim()) return; const { data, error } = await db('shared_posts').insert({ title: title.trim(), body: body.trim(), author_id: userId }).select('*').single(); if (error) return toast.error(error.message); try { await uploadAttachments(files, { post_id: data.id }, userId); setTitle(''); setBody(''); setFiles([]); load(); } catch (error) { toast.error(error instanceof Error ? error.message : 'Upload failed'); } };
  return <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]"><section className="space-y-4">{items.length === 0 && <p className="text-sm text-muted-foreground">No posts yet.</p>}{items.map(post => <article key={post.id} className="parchment p-5 space-y-3"><div><h2 className="text-2xl">{post.title || 'Shared post'}</h2><p className="text-xs text-muted-foreground">{person(directory, post.author_id)} · {stamp(post.created_at)}</p></div><p className="whitespace-pre-wrap text-sm leading-relaxed">{post.body}</p><div className="grid gap-3 sm:grid-cols-2">{attachments.filter(a => a.post_id === post.id).map(a => a.mime_type?.startsWith('image/') && a.url ? <a key={a.id} href={a.url} target="_blank" rel="noreferrer"><img className="max-h-72 w-full rounded object-cover" src={a.url} alt={a.file_name}/></a> : <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded border border-border p-3 text-sm"><Paperclip/>{a.file_name}</a>)}</div></article>)}</section><aside className="parchment p-4 space-y-3 h-fit lg:sticky lg:top-6"><h2 className="text-xl">New post</h2><Input placeholder="Title (optional)" value={title} onChange={e => setTitle(e.target.value)}/><Textarea rows={6} placeholder="Share an update, idea, memory…" value={body} onChange={e => setBody(e.target.value)}/><Input type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt" onChange={e => setFiles(Array.from(e.target.files ?? []))}/><Button onClick={submit} disabled={!body.trim()}><Send/>Publish</Button></aside></div>;
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
