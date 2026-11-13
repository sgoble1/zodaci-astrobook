import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { questionsForVisit, type ContextRow } from '@/lib/contextQuestions';

type Row = ContextRow & { id: string; answer: string | null; general: boolean; use_in_readings: boolean; use_in_book: boolean; use_in_comic: boolean };
const VISIT_KEY = 'zodaci-context-asked';
const asked = () => Number(sessionStorage.getItem(VISIT_KEY) ?? 0);

/** One question at a time, clickable answers, skip / ask later always visible. Answers stay owner-only. */
export function ContextQuestions() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [count, setCount] = useState(asked);
  const load = async () => { const { data } = await supabase.from('context_flags').select('*').order('created_at'); setRows((data ?? []) as Row[]); };
  useEffect(() => { void load(); }, []);
  const save = async (topic: string, status: Row['status'], answer: string | null) => {
    const { data: u } = await supabase.auth.getUser(); if (!u.user) return;
    await supabase.from('context_flags').upsert({ user_id: u.user.id, topic, status, answer }, { onConflict: 'user_id,topic' });
    const n = count + 1; sessionStorage.setItem(VISIT_KEY, String(n)); setCount(n); void load();
  };
  const set = async (r: Row, patch: Partial<Row>) => { await supabase.from('context_flags').update(patch).eq('id', r.id); void load(); };
  if (!rows) return null;
  const q = questionsForVisit(rows, count)[0];
  const answered = rows.filter(r => r.status === 'answered');
  const later = rows.filter(r => r.status === 'later');
  return (
    <section aria-labelledby="ctx-q" className="obs-paper space-y-4 p-5 sm:p-6">
      <h2 id="ctx-q" className="text-2xl">A few quick questions</h2>
      {q ? (
        <div className="space-y-3">
          <p className="text-lg">{q.question}</p>
          <div className="flex flex-wrap gap-2">{q.answers.map(a => <Button key={a} variant="outline" size="sm" onClick={() => save(q.topic, 'answered', a)}>{a}</Button>)}</div>
          <div className="flex gap-3 text-sm"><Button variant="ghost" size="sm" onClick={() => save(q.topic, 'later', null)}>Ask me later</Button><Button variant="ghost" size="sm" onClick={() => save(q.topic, 'skipped', null)}>Skip</Button></div>
        </div>
      ) : <p className="text-sm text-muted-foreground">That’s all for this visit. Your answers are private and you can change them below.</p>}
      {later.length > 0 && <p className="text-sm text-muted-foreground">Saved for later: {later.map(r => r.topic.replace('-', ' ')).join(', ')}</p>}
      {answered.length > 0 && <ul className="divide-y divide-border border-y border-border text-sm">{answered.map(r => (
        <li key={r.id} className="flex flex-wrap items-center gap-3 py-2">
          <span className="min-w-32 font-medium capitalize">{r.topic.replace('-', ' ')}</span><span>{r.general ? 'Kept general' : r.answer}</span>
          <label className="flex items-center gap-1"><input type="checkbox" checked={r.general} onChange={() => set(r, { general: !r.general })} />Keep it general</label>
          <label className="flex items-center gap-1"><input type="checkbox" checked={r.use_in_readings} onChange={() => set(r, { use_in_readings: !r.use_in_readings })} />Readings</label>
          <label className="flex items-center gap-1"><input type="checkbox" checked={r.use_in_book} onChange={() => set(r, { use_in_book: !r.use_in_book })} />Printed book</label>
          <label className="flex items-center gap-1"><input type="checkbox" checked={r.use_in_comic} onChange={() => set(r, { use_in_comic: !r.use_in_comic })} />Comic</label>
        </li>))}</ul>}
    </section>
  );
}

/** Before a book is frozen: every context answer and dream allowed in print, with remove / keep-general controls. */
export function PrintContextReview() {
  const [items, setItems] = useState<{ id: string; kind: 'context' | 'dream'; label: string; general?: boolean }[] | null>(null);
  const load = async () => {
    const [c, d] = await Promise.all([
      supabase.from('context_flags').select('id,topic,answer,general').eq('use_in_book', true).eq('status', 'answered'),
      supabase.from('dream_entries').select('id,dream_date,body').eq('use_in_book', true),
    ]);
    setItems([
      ...(c.data ?? []).map(r => ({ id: r.id, kind: 'context' as const, label: `${r.topic.replace('-', ' ')}: ${r.general ? 'kept general' : r.answer}`, general: r.general })),
      ...(d.data ?? []).map(r => ({ id: r.id, kind: 'dream' as const, label: `Dream, ${r.dream_date}: ${r.body.slice(0, 80)}${r.body.length > 80 ? '…' : ''}` })),
    ]);
  };
  useEffect(() => { void load(); }, []);
  if (!items) return null;
  const off = async (i: NonNullable<typeof items>[number]) => { await supabase.from(i.kind === 'dream' ? 'dream_entries' : 'context_flags').update({ use_in_book: false }).eq('id', i.id); void load(); };
  const general = async (i: NonNullable<typeof items>[number]) => { await supabase.from('context_flags').update({ general: true }).eq('id', i.id); void load(); };
  return (
    <section className="rounded border border-border p-4" aria-labelledby="print-ctx">
      <h3 id="print-ctx" className="text-xl">Personal details that will be printed</h3>
      {!items.length ? <p className="mt-2 text-sm text-muted-foreground">None. Your book uses your chart only. You can allow answers or dreams in print from Personal context or the Dream Ledger.</p>
        : <ul className="mt-3 space-y-2 text-sm">{items.map(i => <li key={i.id} className="flex flex-wrap items-center gap-2"><span className="flex-1 capitalize">{i.label}</span>{i.kind === 'context' && !i.general && <Button type="button" size="sm" variant="ghost" onClick={() => general(i)}>Make general</Button>}<Button type="button" size="sm" variant="outline" onClick={() => off(i)}>Leave out</Button></li>)}</ul>}
    </section>
  );
}
