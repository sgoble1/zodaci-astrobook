import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from '@/hooks/useLibrary';

export function MemberAnswer({ module, question }: { module: string; question: string }) {
  const session = useSession();
  const [answer, setAnswer] = useState('');
  const [id, setId] = useState<string | null>(null);
  const [state, setState] = useState('');
  const [busy, setBusy] = useState(false);
  const key = `member-${module}`;
  useEffect(() => {
    let active = true; setAnswer(''); setId(null); setState('');
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
    else { setId(result.data.id); setState('Saved privately to your account.'); }
    setBusy(false);
  };
  return <div className="space-y-3 border-t border-border pt-4"><label htmlFor={key} className="text-sm font-medium">Your reflection</label><Textarea id={key} rows={5} value={answer} onChange={e => setAnswer(e.target.value)} /><Button onClick={() => void save()} disabled={busy || !session || !answer.trim()}>{busy ? 'Saving…' : 'Save my reflection'}</Button><p role="status" className="text-xs text-muted-foreground">{state}</p></div>;
}