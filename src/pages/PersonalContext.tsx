import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, BookOpen, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useLibrary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Tables } from '@/integrations/supabase/types';

export default function PersonalContext() {
  const session=useSession(); const uid=session?.user.id;
  const [rows,setRows]=useState<Tables<'personal_context'>[]>([]);
  const [title,setTitle]=useState(''); const [body,setBody]=useState(''); const [consent,setConsent]=useState(false); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  const load=useCallback(async()=>{ if(!uid){setRows([]);return;} const r=await supabase.from('personal_context').select('*').eq('owner_id',uid).order('created_at',{ascending:false}); if(r.error)setError(r.error.message);else setRows(r.data ?? []); },[uid]);
  useEffect(()=>{void load();},[load]);
  return <article className="space-y-8 max-w-3xl"><header><p className="text-xs text-gold font-smallcaps">Private to you</p><h1 className="text-4xl mt-2">Your life, in context</h1><p className="mt-3 text-muted-foreground">Your experiences are facts you supply—not facts inferred from astrology. Choose which examples may inform future chapters and podcasts.</p></header>
    {!uid ? <Button asChild><Link to="/auth">Sign in to save your examples</Link></Button> : <><form className="space-y-4 border-y border-border py-6" onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');const r=await supabase.from('personal_context').insert({owner_id:uid,title:title.trim(),body:body.trim(),use_in_generation:consent});setBusy(false);if(r.error){setError(r.error.message);return;}setTitle('');setBody('');setConsent(false);void load();}}><div><Label htmlFor="context-title">Topic or situation</Label><Input id="context-title" required maxLength={160} value={title} onChange={e=>setTitle(e.target.value)}/></div><div><Label htmlFor="context-body">Your experience</Label><Textarea id="context-body" required maxLength={6000} rows={5} value={body} onChange={e=>setBody(e.target.value)}/></div><label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>Use this example in future AI-generated chapters and podcasts. Shared podcasts may mention it.</label><Button disabled={busy||!title.trim()||!body.trim()}><Plus/>Save example</Button></form>
    <section className="space-y-4"><h2 className="text-2xl">Saved examples & suggested chapters</h2>{rows.map(r=><div key={r.id} className="border-b border-border pb-5 space-y-3"><div className="flex justify-between gap-3"><h3 className="text-xl">{r.title}</h3><Button size="icon" variant="ghost" aria-label={`Delete ${r.title}`} onClick={async()=>{const x=await supabase.from('personal_context').delete().eq('id',r.id);if(x.error)setError(x.error.message);else void load();}}><Trash2/></Button></div><p className="whitespace-pre-wrap text-sm text-muted-foreground">{r.body}</p><label className="flex gap-2 text-sm"><input type="checkbox" checked={r.use_in_generation} onChange={async e=>{const x=await supabase.from('personal_context').update({use_in_generation:e.target.checked,updated_at:new Date().toISOString()}).eq('id',r.id);if(x.error)setError(x.error.message);else void load();}}/>Include in future generation</label><Button asChild variant="outline"><Link to={`/my-masterbook?topic=${encodeURIComponent(r.title)}`}><BookOpen/>Create a chapter about this</Link></Button></div>)}{!rows.length&&<p className="text-muted-foreground">No personal examples saved yet.</p>}</section></>}
    {error&&<p role="alert" className="text-destructive">{error}</p>}
  </article>;
}