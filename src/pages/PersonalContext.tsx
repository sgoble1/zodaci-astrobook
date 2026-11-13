import { ContextQuestions } from '@/components/context/ContextQuestions';
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
import { PageHead } from '@/components/observatory/PageHead';
import { toast } from 'sonner';

export default function PersonalContext() {
  const session=useSession(); const uid=session?.user.id;
  const [rows,setRows]=useState<Tables<'personal_context'>[]>([]);
  const [title,setTitle]=useState(''); const [body,setBody]=useState(''); const [consent,setConsent]=useState(false); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  const [editing,setEditing]=useState<string|null>(null);
  const load=useCallback(async()=>{ if(!uid){setRows([]);return;} const r=await supabase.from('personal_context').select('*').eq('owner_id',uid).order('created_at',{ascending:false}); const current=await supabase.auth.getSession(); if(current.data.session?.user.id!==uid)return; if(r.error)setError('Your examples could not load. Refresh to try again.');else setRows(r.data ?? []); },[uid]);
  useEffect(()=>{setRows([]);setTitle('');setBody('');setConsent(false);setEditing(null);setError('');void load();},[load]);
  return <article className="space-y-8 max-w-3xl"><PageHead eyebrow="Private to you" title="Your life, in context" script="The examples only you can supply." art="written">Your experiences are facts you supply. They do not change your calculated chart. Choose which examples may inform future chapters and podcasts.</PageHead>
    {!uid ? <Button asChild><Link to="/auth">Sign in to save your examples</Link></Button> : <><form className="obs-paper space-y-4 p-5 sm:p-6" onSubmit={async e=>{e.preventDefault();if(!uid)return;setBusy(true);setError('');const values={title:title.trim(),body:body.trim(),use_in_generation:consent,updated_at:new Date().toISOString()};const r=editing?await supabase.from('personal_context').update(values).eq('id',editing).eq('owner_id',uid):await supabase.from('personal_context').insert({owner_id:uid,...values});setBusy(false);if(r.error){setError('Your example was not saved. Please try again.');return;}toast.success(editing?'Example updated':'Example saved');setEditing(null);setTitle('');setBody('');setConsent(false);void load();}}><h2 className="font-display text-2xl">{editing?'Edit example':'New example'}</h2><div><Label htmlFor="context-title">Topic or situation</Label><Input id="context-title" required maxLength={160} value={title} onChange={e=>setTitle(e.target.value)}/></div><div><Label htmlFor="context-body">Your experience</Label><Textarea id="context-body" required maxLength={6000} rows={5} value={body} onChange={e=>setBody(e.target.value)}/></div><label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>Use this example in future AI-generated chapters and podcasts. Shared podcasts may mention it.</label><div className="flex gap-2"><Button disabled={busy||!title.trim()||!body.trim()}><Plus/>{busy?'Saving…':editing?'Update example':'Save example'}</Button>{editing&&<Button type="button" variant="outline" onClick={()=>{setEditing(null);setTitle('');setBody('');setConsent(false);}}>Cancel edit</Button>}</div></form>
    <section className="space-y-4"><h2 className="text-2xl">Saved examples & suggested chapters</h2>{rows.map(r=><div key={r.id} className="obs-paper p-5 space-y-3"><div className="flex justify-between gap-3"><h3 className="text-xl">{r.title}</h3><Button size="icon" variant="ghost" aria-label={`Delete ${r.title}`} onClick={async()=>{const x=await supabase.from('personal_context').delete().eq('id',r.id).eq('owner_id',uid);if(x.error)setError('Your example was not deleted. Please try again.');else {toast.success('Example deleted');void load();}}}><Trash2/></Button></div><p className="whitespace-pre-wrap text-sm text-muted-foreground">{r.body}</p><label className="flex gap-2 text-sm"><input type="checkbox" checked={r.use_in_generation} onChange={async e=>{const x=await supabase.from('personal_context').update({use_in_generation:e.target.checked,updated_at:new Date().toISOString()}).eq('id',r.id).eq('owner_id',uid);if(x.error)setError('Consent was not updated. Please try again.');else {toast.success('Consent updated');void load();}}}/>Include in future generation</label><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={()=>{setEditing(r.id);setTitle(r.title);setBody(r.body);setConsent(r.use_in_generation);window.scrollTo({top:0,behavior:'auto'});}}>Edit example</Button><Button asChild variant="outline"><Link to={`/my-masterbook?topic=${encodeURIComponent(r.title)}`}><BookOpen/>Create a chapter about this</Link></Button></div></div>)}{!rows.length&&<p className="text-muted-foreground">No personal examples saved yet.</p>}</section></>}
    {uid&&<ContextQuestions />}
    {error&&<p role="alert" className="text-destructive">{error}</p>}
  </article>;
}