import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useLibrary';
import { loadCorpus, rank } from '@/lib/corpus';
import { CUSTOM_PAGES_CHANGED } from '@/hooks/useCustomPages';
import { MENU_SECTIONS } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const STEPS = ['Searching the Masterbook and sources…', 'Gathering the most relevant passages…', 'Analysing and calculating…', 'Reasoning through your questions…', 'Writing and citing the page…', 'Saving it to the menu…'];

function Compiling() {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => Math.min(s + 1, STEPS.length - 1)), 4500); return () => clearInterval(t); }, []);
  return (
    <div role="status" aria-live="polite" className="flex min-h-[60vh] flex-col items-center justify-center gap-8 text-center">
      <div className="relative h-32 w-32" aria-hidden>
        <motion.div className="absolute inset-0 rounded-full border-2 border-primary/40" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: 'linear' }} style={{ borderTopColor: 'hsl(var(--primary))' }} />
        <motion.div className="absolute inset-4 rounded-full border border-accent/50" animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 12, ease: 'linear' }} style={{ borderRightColor: 'hsl(var(--accent))' }} />
        <motion.div className="absolute inset-[42%] rounded-full bg-primary" animate={{ scale: [1, 1.6, 1], opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 2.4 }} />
      </div>
      <div>
        <h1 className="text-3xl">Compiling your page</h1>
        <motion.p key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-muted-foreground">{STEPS[step]}</motion.p>
      </div>
      <div className="h-1 w-64 overflow-hidden rounded bg-muted"><motion.div className="h-full bg-primary" initial={{ width: '5%' }} animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }} transition={{ duration: 1.2 }} /></div>
    </div>
  );
}

export default function CreatePage() {
  const { user } = useSession();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [brief, setBrief] = useState('');
  const [group, setGroup] = useState(MENU_SECTIONS[0]);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error('Please sign in to create pages.');
    if (!title.trim()) return;
    setBusy(true);
    const { data: row, error } = await supabase.from('custom_pages').insert({ owner_id: user.id, title: title.trim(), brief: brief.trim(), menu_group: group }).select().single();
    if (error || !row) { setBusy(false); return toast.error(error?.message ?? 'Could not save the page.'); }
    window.dispatchEvent(new Event(CUSTOM_PAGES_CHANGED));
    try {
      const corpus = await loadCorpus().catch(() => []);
      const passages = rank(corpus, `${title} ${brief}`, 14).map((p, i) => ({ n: i + 1, source: p.source, loc: p.loc, text: p.text }));
      const { data, error: fnErr } = await supabase.functions.invoke('generate-page', { body: { title: title.trim(), brief: brief.trim(), passages } });
      if (fnErr || !data?.content) throw new Error(data?.error ?? 'The page could not be written right now.');
      await supabase.from('custom_pages').update({ content: data.content, status: 'ready', updated_at: new Date().toISOString() }).eq('id', row.id);
      window.dispatchEvent(new Event(CUSTOM_PAGES_CHANGED));
      navigate(`/p/${row.id}`);
    } catch (err) {
      await supabase.from('custom_pages').update({ status: 'failed' }).eq('id', row.id);
      window.dispatchEvent(new Event(CUSTOM_PAGES_CHANGED));
      setBusy(false);
      toast.error(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  if (busy) return <Compiling />;
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="font-smallcaps text-xs text-gold">New page</div>
        <h1 className="text-4xl sm:text-5xl">Create a Topic & Page</h1>
        <p className="max-w-2xl text-muted-foreground">Describe what to research, analyse or calculate. A full page is written from the Masterbook and sources, saved, and added to the menu where you choose.</p>
      </header>
      {!user && <p className="parchment p-4 text-sm">Sign in with the button at the top to create pages.</p>}
      <form onSubmit={submit} className="parchment space-y-4 p-5">
        <div className="space-y-1"><label htmlFor="cp-title" className="text-sm font-medium">Page title</label><Input id="cp-title" required maxLength={200} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Saturn Return 2019–2021" /></div>
        <div className="space-y-1"><label htmlFor="cp-brief" className="text-sm font-medium">What to research, analyse and answer</label><Textarea id="cp-brief" rows={7} maxLength={6000} value={brief} onChange={e => setBrief(e.target.value)} placeholder="Questions to answer, things to calculate or compare, content to include…" /></div>
        <div className="space-y-1"><label htmlFor="cp-group" className="text-sm font-medium">Menu location</label>
          <select id="cp-group" value={group} onChange={e => setGroup(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            {MENU_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <Button type="submit" disabled={!user || !title.trim()}>Create page</Button>
      </form>
    </div>
  );
}
