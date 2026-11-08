import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from '@/hooks/useLibrary';

/** Saves a member's reflection; once saved, they can choose to add it to their personal context for future readings. */
export function MemberAnswer({ module, question, title }: { module: string; question: string; title?: string }) {
  const session = useSession();
  const [answer, setAnswer] = useState('');
  const [id, setId] = useState<string | null>(null);
  const [state, setState] = useState('');
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);
  const key = `member-${module}`;
  useEffect(() => {
    let active = true; setAnswer(''); setId(null); setState(''); setAdded(false);
    if (session) void supabase.from('workbook_entries').select('id,answer').eq('owner_id', session.user.id).eq('prompt_key', key).order('created_at', { ascending: false }).limit(1).maybeSingle().then(({ data, error }) => {
      if (!active) return;
      if (error) setState('Your saved answer could not load.');
      else if (data) { setAnswer(data.answer); setId(data.id); }
    });
    return () => { active = false; };
  }, [session?.user.id, key]);
  const save = async () => {
    if (!session || !answer.trim()) return;
    const uid = session.user.id; setBusy(true); setState('');
    const row = { owner_id: uid, kind: 'prompt', module, prompt_key: key, question, answer: answer.trim(), updated_at: new Date().toISOString() };
    const result = id ? await supabase.from('workbook_entries').update(row).eq('id', id).eq('owner_id', uid).select('id').single() : await supabase.from('workbook_entries').insert(row).select('id').single();
    const current = await supabase.auth.getSession();
    if (current.data.session?.user.id !== uid) return;
    if (result.error) setState('Your answer could not save. Please try again.');
    else { setId(result.data.id); setAdded(false); setState('Saved privately to your account.'); }
    setBusy(false);
  };
  // Explicit opt-in: copying a reflection into personal context is what lets future readings use it.
  const addToContext = async () => {
    if (!session || !answer.trim()) return;
    const uid = session.user.id; setBusy(true);
    const { error } = await supabase.from('personal_context').insert({ owner_id: uid, title: (title ?? 'Workbook reflection').slice(0, 160), body: answer.trim().slice(0, 4000), use_in_generation: true });
    setBusy(false);
    if (error) setState('It could not be added to your personal context. Please try again.');
    else { setAdded(true); setState('Added to your personal context. New readings can use it; switch it off any time on the Personal context page.'); }
  };
  return <div className="space-y-3 border-t border-border pt-4"><label htmlFor={key} className="text-sm font-medium">Your reflection</label><Textarea id={key} rows={5} value={answer} onChange={e => { setAnswer(e.target.value); setAdded(false); }} /><div className="flex flex-wrap gap-2"><Button onClick={() => void save()} disabled={busy || !session || !answer.trim()}>{busy ? 'Saving…' : 'Save my reflection'}</Button>{id && !added && <Button variant="outline" onClick={() => void addToContext()} disabled={busy || !answer.trim()}>Add to my personal context</Button>}</div><p role="status" className="text-xs text-muted-foreground">{state}</p></div>;
}
