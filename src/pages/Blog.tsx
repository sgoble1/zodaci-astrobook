import { usePageMeta } from '@/hooks/usePageMeta';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { PenLine, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import type { Tables } from '@/integrations/supabase/types';
import { PUBLIC_ARTICLES } from '@/content/publicArticles';

export default function Blog() {
  usePageMeta('Zodaci Blog · Astrology guides in plain language', 'Plain-language guides to birth charts, planets, houses and timing from the Zodaci editorial team.');
  const sub = useSubscription(); const [posts,setPosts] = useState<Tables<'blog_posts'>[]>([]);
  const [view,setView] = useState<'feed'|'mine'>('feed'); const [editing,setEditing] = useState<string|null>(null);
  const [compose,setCompose] = useState(false); const [title,setTitle] = useState(''); const [body,setBody] = useState(''); const [name,setName] = useState(''); const [error,setError] = useState(''); const [busy,setBusy] = useState(false);
  const load = async () => { const { data,error:err } = await supabase.from('blog_posts').select('*').order('created_at',{ ascending:false }); if(err) setError(err.message); else setPosts(data || []); };
  useEffect(() => {
    void load(); const timer = window.setInterval(load,10000);
    const channel = supabase.channel(`blog-${crypto.randomUUID()}`).on('postgres_changes',{ event:'*',schema:'public',table:'blog_posts' },load).subscribe();
    return () => { window.clearInterval(timer); void supabase.removeChannel(channel); };
  },[sub.userId]);
  const save = async (published: boolean) => {
    if (!sub.userId) return; setBusy(true); setError('');
    const values = { author_id:sub.userId,author_name:name.trim(),title:title.trim(),body:body.trim(),published,updated_at:new Date().toISOString() };
    const result = editing ? await supabase.from('blog_posts').update(values).eq('id',editing) : await supabase.from('blog_posts').insert(values);
    setBusy(false); if(result.error) return setError(result.error.message);
    setCompose(false); setEditing(null); setTitle(''); setBody(''); setView('mine'); void load();
  };
  return <article className="space-y-8"><header><p className="text-gold font-smallcaps text-xs">Zodaci community</p><h1 className="text-4xl mt-2">The journal</h1><p className="text-muted-foreground mt-3">Reflections, discoveries and stories from the community.</p></header><div className="flex flex-wrap gap-2"><Button variant={view === 'feed' ? 'default':'outline'} onClick={() => setView('feed')}>Latest articles</Button><Button variant={view === 'mine' ? 'default':'outline'} disabled={!sub.userId} onClick={() => setView('mine')}>My posts</Button>{sub.tier !== 'free' && <Button variant="outline" onClick={() => { setCompose(true); setEditing(null); setTitle(''); setBody(''); }}><PenLine />Write article</Button>}</div>{sub.tier === 'free' && <p className="text-sm text-muted-foreground"><Link to="/pricing" className="underline text-gold">Full Access or Creator</Link> members can publish articles.</p>}
    {view === 'feed' && <section aria-labelledby="editorial-title"><div className="flex flex-wrap justify-between gap-3 items-center"><h2 id="editorial-title" className="text-2xl">Start with a little perspective.</h2><Button asChild variant="outline"><Link to="/community">Community discussions</Link></Button></div><div className="grid md:grid-cols-3 gap-5 mt-6">{PUBLIC_ARTICLES.map(a => <Link to={`/blog/learn/${a.slug}`} key={a.slug} className="rounded border border-border bg-card overflow-hidden"><img src={a.image} alt={`${a.category} editorial illustration`} width={1024} height={768} loading="lazy" className="w-full aspect-[4/3] object-cover" /><div className="p-5"><p className="text-xs text-accent">{a.category} · Editorial</p><h3 className="text-xl mt-3">{a.title}</h3><p className="text-sm text-muted-foreground mt-3">{a.summary}</p><p className="text-accent text-sm mt-4">Read article →</p></div></Link>)}</div></section>}
    {compose && <form onSubmit={e => { e.preventDefault(); void save(true); }} className="border-y border-border py-6 space-y-4"><h2 className="text-2xl">{editing ? 'Edit article':'New article'}</h2><p className="text-sm text-muted-foreground">Published articles are visible to everyone. Do not include private birth details or another person’s information without permission.</p><div><Label htmlFor="author">Public author name</Label><Input id="author" required maxLength={80} value={name} onChange={e => setName(e.target.value)} /></div><div><Label htmlFor="post-title">Title</Label><Input id="post-title" required minLength={3} maxLength={180} value={title} onChange={e => setTitle(e.target.value)} /></div><div><Label htmlFor="post-body">Article</Label><Textarea id="post-body" required minLength={20} maxLength={30000} rows={12} value={body} onChange={e => setBody(e.target.value)} /></div><div className="flex gap-2 flex-wrap"><Button disabled={busy || !name.trim()} type="submit">Publish article</Button><Button type="button" variant="outline" disabled={busy || title.trim().length < 3 || body.trim().length < 20 || !name.trim()} onClick={() => save(false)}><Save />Save private draft</Button><Button type="button" variant="ghost" onClick={() => setCompose(false)}>Cancel</Button></div></form>}
    <div className="space-y-6">{posts.filter(p => view === 'mine' ? p.author_id === sub.userId : p.published).map(p => <article key={p.id} className="border-b border-border pb-6"><div className="text-xs text-muted-foreground">{p.author_name} · <time dateTime={p.created_at}>{new Date(p.created_at).toLocaleString()}</time>{!p.published && ' · Private draft'}</div><h2 className="text-2xl mt-2">{p.title}</h2><div className="mb-prose mt-4 break-words"><ReactMarkdown>{p.body}</ReactMarkdown></div>{p.author_id === sub.userId && <div className="flex gap-2 mt-4">{sub.tier !== 'free' && <Button size="sm" variant="outline" onClick={() => { setCompose(true); setEditing(p.id); setTitle(p.title); setBody(p.body); setName(p.author_name); }}>Edit</Button>}<Button size="icon" variant="ghost" aria-label={`Delete ${p.title}`} onClick={async () => { if (!confirm('Delete this article?')) return; const { error:err } = await supabase.from('blog_posts').delete().eq('id',p.id); if(err) setError(err.message); else void load(); }}><Trash2 /></Button></div>}</article>)}{!posts.some(p => view === 'mine' ? p.author_id === sub.userId : p.published) && <p className="text-muted-foreground">{view === 'mine' ? 'You have no posts yet.':'No published articles yet.'}</p>}</div>{error && <p role="alert" className="text-destructive">{error}</p>}</article>;
}