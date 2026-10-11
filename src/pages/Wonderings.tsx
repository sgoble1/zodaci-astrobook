import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useLibrary';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useRelationships } from '@/hooks/useRelationships';
import { wonderingSuggestions } from '@/lib/wonderingSuggestions';
import { SaveWondering } from '@/components/relationships/SaveWondering';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Tables } from '@/integrations/supabase/types';

export default function Wonderings() {
  const session = useSession(); const spaces = useWorkspaces(); const { items: people } = useRelationships(); const [params] = useSearchParams();
  const [space, setSpace] = useState(params.get('workspace') ?? ''); const [target, setTarget] = useState(''); const [body, setBody] = useState('');
  const [members, setMembers] = useState<{ user_id: string; display_name: string }[]>([]); const [items, setItems] = useState<Tables<'workspace_wonderings'>[]>([]); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const person = people.find(p => `person:${p.id}` === target);
  const load = useCallback(async () => {
    if (!space || !session) { setMembers([]); setItems([]); return; }
    const [directory, questions] = await Promise.all([supabase.rpc('workspace_member_directory', { _space_id: space }), supabase.from('workspace_wonderings').select('*').eq('workspace_id', space).order('created_at', { ascending: false })]);
    if (directory.error || questions.error) { setError('This workspace could not be opened.'); return; }
    setMembers(directory.data ?? []); setItems(questions.data ?? []);
  }, [space, session?.user.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); const timer = window.setInterval(load, 10000); return () => window.clearInterval(timer); }, [load]);
  useEffect(() => { setTarget(''); }, [space]);
  if (!session) return <article className="space-y-4"><h1 className="text-4xl">Wonderings</h1><Button asChild><Link to="/auth">Sign in</Link></Button></article>;
  return <article className="space-y-8"><header><p className="text-xs text-gold font-smallcaps">Connection & curiosity</p><h1 className="text-4xl mt-2">Wonderings</h1><p className="mt-3 text-muted-foreground">Questions for invited people, and private reflections about people you have added. A suggestion is an invitation to ask, not a claim about someone.</p></header>
    <div className="grid gap-6 md:grid-cols-2"><section className="space-y-4"><div><Label htmlFor="wonder-space">Workspace</Label><select id="wonder-space" value={space} onChange={e => setSpace(e.target.value)} className="w-full rounded border border-input bg-background p-3"><option value="">Private reflection only</option>{spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div><div><Label htmlFor="wonder-person">Who are you wondering about?</Label><select id="wonder-person" value={target} onChange={e => setTarget(e.target.value)} className="w-full rounded border border-input bg-background p-3"><option value="">Choose a person</option>{members.filter(m => m.user_id !== session.user.id).map(m => <option key={m.user_id} value={m.user_id}>{m.display_name} · workspace member</option>)}{people.map(p => <option key={p.id} value={`person:${p.id}`}>{p.name} · your relationship</option>)}</select></div>
    <Textarea aria-label="Your wondering" rows={5} value={body} maxLength={10000} onChange={e => setBody(e.target.value)} placeholder="Something I would like to understand…" />
    {person ? <SaveWondering text={body} /> : <Button disabled={!space || !target || !body.trim() || busy} onClick={async () => { setBusy(true); setError(''); const result = await supabase.from('workspace_wonderings').insert({ workspace_id: space, author_id: session.user.id, target_user_id: target, body: body.trim() }); if (result.error) setError(result.error.message); else { setBody(''); void load(); } setBusy(false); }}><Plus />Ask in workspace</Button>}
    <p className="text-xs text-muted-foreground">Workspace questions are visible to every invited member. Saving to relationship notes is private to your account. Other members’ birth data is not accessed for suggestions.</p></section>
    <section className="space-y-3"><h2 className="text-2xl flex gap-2 items-center"><Sparkles />Suggested questions & topics</h2>{wonderingSuggestions(person).map(q => <Button key={q} variant="outline" onClick={() => setBody(q)} className="h-auto w-full whitespace-normal justify-start text-left p-4">{q}</Button>)}<Button asChild variant="link"><Link to="/my-readings#sex-attraction">Explore Sex & Attraction</Link></Button></section></div>
    <section className="space-y-4"><h2 className="text-2xl">Workspace questions</h2>{items.map(item => <article key={item.id} className="rounded border border-border p-4 space-y-3"><p className="text-xs text-muted-foreground">{members.find(m => m.user_id === item.author_id)?.display_name ?? 'Member'} → {members.find(m => m.user_id === item.target_user_id)?.display_name ?? 'Member'} · {new Date(item.created_at).toLocaleString()}</p><p className="whitespace-pre-wrap">{item.body}</p><SaveWondering text={item.body} />{item.author_id === session.user.id && <Button size="sm" variant="ghost" onClick={async () => { const r = await supabase.from('workspace_wonderings').delete().eq('id', item.id); if (r.error) setError(r.error.message); else void load(); }}><Trash2 />Delete</Button>}</article>)}{!items.length && <p className="text-muted-foreground">No shared questions in this workspace yet.</p>}</section>{error && <p role="alert" className="text-destructive">{error}</p>}</article>;
}