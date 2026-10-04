import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';
import { BookHeart, CalendarHeart, Check, Feather, Loader2, NotebookPen, Scale, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AuthGate } from '@/components/common/AuthGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { GuideMarkdown, PassageList, type CitedPassage } from '@/components/workbook/GuideMarkdown';
import { WORKBOOK_MODULES, ALL_QUESTIONS, EMOTIONS, questionOfTheDay, type WorkbookModule, type WorkbookQuestion } from '@/content/workbook';
import { listEntries, requestFeedback, WORKBOOK_CHANGED, type WorkbookEntry } from '@/lib/workbook';
import oracle from '@/assets/oracle-within.png';

const fmt = (v: string) => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(v));

function WorkbookNav() {
  const links: [string, string][] = [['/workbook', 'Overview'], ['/workbook/social-integration', 'Social Integration'], ['/workbook/check-in', 'Daily Check-in'], ['/workbook/reframe', 'Thought Reframe'], ['/workbook/journal', 'Journal & Patterns'], ['/workbook/companion', 'The Oracle Within']];
  return (
    <nav aria-label="Workbook sections" className="flex flex-wrap gap-2">
      {links.map(([to, label]) => (
        <NavLink key={to} to={to} end={to === '/workbook'} className={({ isActive }) => `min-h-10 rounded-full border px-4 py-2 text-sm transition-colors ${isActive ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'}`}>{label}</NavLink>
      ))}
    </nav>
  );
}

function Shell({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: (userId: string) => React.ReactNode }) {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="font-smallcaps text-xs text-gold">{eyebrow}</div>
        <h1 className="text-4xl sm:text-5xl">{title}</h1>
        <p className="max-w-2xl text-muted-foreground">{intro}</p>
        <p role="note" className="max-w-2xl text-sm text-accent">🔒 Private to your account — your answers, check-ins and journal are never shared with Shane or anyone else.</p>
      </header>
      <WorkbookNav />
      <AuthGate what="use your private workbook">{children}</AuthGate>
    </div>
  );
}

function useEntries(userId: string) {
  const [entries, setEntries] = useState<WorkbookEntry[] | null>(null);
  const load = useCallback(() => { listEntries().then(setEntries).catch(() => { setEntries([]); toast.error('Your workbook could not be loaded.'); }); }, []);
  useEffect(() => { load(); window.addEventListener(WORKBOOK_CHANGED, load); return () => window.removeEventListener(WORKBOOK_CHANGED, load); }, [load, userId]);
  return entries;
}

const changed = () => window.dispatchEvent(new Event(WORKBOOK_CHANGED));

/** Save an entry; optionally fetch chart-aware feedback and store it with the entry. */
async function saveEntry(userId: string, entry: Partial<WorkbookEntry> & { kind: WorkbookEntry['kind'] }, existingId?: string) {
  const row = { owner_id: userId, kind: entry.kind, module: entry.module ?? '', prompt_key: entry.prompt_key ?? '', question: entry.question ?? '', answer: entry.answer ?? '', data: (entry.data ?? {}) as never, feedback: entry.feedback ?? '', updated_at: new Date().toISOString() };
  const res = existingId
    ? await supabase.from('workbook_entries').update(row).eq('id', existingId).select('*').single()
    : await supabase.from('workbook_entries').insert(row).select('*').single();
  if (res.error) throw res.error;
  return res.data as unknown as WorkbookEntry;
}

function Feedback({ entry, prefix }: { entry: WorkbookEntry; prefix: string }) {
  if (!entry.feedback) return null;
  const passages = ((entry.data?.passages as CitedPassage[] | undefined) ?? []);
  return (
    <div className="mt-4 rounded-lg border border-gold/30 bg-card/60 p-4">
      <div className="mb-2 flex items-center gap-2 font-smallcaps text-[10px] text-gold"><img src={oracle} alt="" width={20} height={20} className="h-5 w-5" />Guidance from your chart</div>
      <GuideMarkdown text={entry.feedback} idPrefix={prefix} />
      <PassageList passages={passages} text={entry.feedback} idPrefix={prefix} />
    </div>
  );
}

function QuestionCard({ userId, module, question, existing, index }: { userId: string; module: WorkbookModule; question: WorkbookQuestion; existing?: WorkbookEntry; index: number }) {
  const [answer, setAnswer] = useState(existing?.answer ?? '');
  const [busy, setBusy] = useState<'' | 'save' | 'feedback'>('');
  useEffect(() => { setAnswer(existing?.answer ?? ''); }, [existing?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const id = `q-${question.key}`;
  const run = async (withFeedback: boolean) => {
    if (!answer.trim()) return;
    setBusy(withFeedback ? 'feedback' : 'save');
    try {
      let feedback = existing?.answer === answer.trim() ? existing?.feedback ?? '' : '';
      let data: Record<string, unknown> = existing?.data ?? {};
      if (withFeedback) {
        const r = await requestFeedback({ tool: 'prompt', module: module.title, question: question.q, answer: answer.trim(), chartNote: `${question.why} (${module.placements})`, query: `${module.placements} ${question.why} ${answer}` });
        feedback = r.feedback; data = { ...data, passages: r.passages };
      }
      await saveEntry(userId, { kind: 'prompt', module: module.slug, prompt_key: question.key, question: question.q, answer: answer.trim(), feedback, data }, existing?.id);
      toast.success(withFeedback ? 'Saved with guidance.' : 'Answer saved.');
      changed();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Could not save.'); }
    setBusy('');
  };
  return (
    <li className="parchment p-5">
      <div className="flex items-start gap-3">
        <span className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs ${existing ? 'border-accent bg-accent text-accent-foreground' : 'border-border'}`} aria-hidden>{existing ? <Check className="h-4 w-4" /> : index + 1}</span>
        <div className="min-w-0 flex-1 space-y-2">
          <label htmlFor={id} className="block text-lg leading-snug">{question.q}</label>
          <p className="text-xs text-muted-foreground"><span className="text-gold">Why for you:</span> {question.why} <span className="ml-1 rounded bg-muted px-1.5 py-0.5">{question.lens}</span></p>
          <Textarea id={id} rows={5} value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Write freely — there are no wrong answers. Only you can see this." />
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => run(false)} disabled={!answer.trim() || !!busy}>{busy === 'save' ? <Loader2 className="animate-spin" /> : null}Save answer</Button>
            <Button onClick={() => run(true)} disabled={!answer.trim() || !!busy}>{busy === 'feedback' ? <Loader2 className="animate-spin" /> : <Feather />}{busy === 'feedback' ? 'Reading your chart…' : 'Save & get guidance'}</Button>
            {existing && <span className="text-xs text-muted-foreground">Last saved {fmt(existing.updated_at)}</span>}
          </div>
          <div aria-live="polite">{existing && <Feedback entry={existing} prefix={`c-${question.key}`} />}</div>
        </div>
      </div>
    </li>
  );
}

export function WorkbookHome() {
  return (
    <Shell eyebrow="April's Workbook" title="Your Workbook" intro="A private, guided space built from your chart. Answer questions that make you think, get chart-aware feedback, check in each day, reframe hard moments and talk things through with The Oracle Within.">
      {userId => <HomeInner userId={userId} />}
    </Shell>
  );
}

function HomeInner({ userId }: { userId: string }) {
  const entries = useEntries(userId);
  const today = questionOfTheDay();
  const answered = useMemo(() => new Set((entries ?? []).filter(e => e.kind === 'prompt').map(e => e.prompt_key)), [entries]);
  const checkins = (entries ?? []).filter(e => e.kind === 'checkin');
  const streak = useMemo(() => {
    const days = new Set(checkins.map(e => new Date(e.created_at).toDateString()));
    let n = 0; const d = new Date();
    while (days.has(d.toDateString())) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }, [checkins]);
  const total = ALL_QUESTIONS.length;
  const tools = [
    { to: '/workbook/social-integration', title: 'Social Integration', body: 'Understand human situations from an outside view, then get useful scripts, boundaries and next steps.', Icon: Users },
    { to: '/workbook/check-in', title: 'Daily Check-in', body: 'Mood, energy and body in one minute, with care suggestions for today.', Icon: CalendarHeart },
    { to: '/workbook/reframe', title: 'Thought Reframe', body: 'Untangle a hard moment step by step, CBT-style, through your chart.', Icon: Scale },
    { to: '/workbook/journal', title: 'Journal & Patterns', body: 'Everything you have written, your mood over time and what keeps returning.', Icon: NotebookPen },
    { to: '/workbook/companion', title: 'The Oracle Within', body: 'A therapy companion that knows your whole chart and how you respond.', Icon: BookHeart },
  ];
  return (
    <div className="space-y-8">
      <section className="grid gap-3 sm:grid-cols-3" aria-label="Your progress">
        <div className="parchment p-4"><div className="text-3xl font-display">{answered.size}<span className="text-base text-muted-foreground">/{total}</span></div><div className="text-xs text-muted-foreground">questions answered</div><div className="mt-2 h-1.5 rounded bg-muted" aria-hidden><div className="h-full rounded bg-accent" style={{ width: `${(answered.size / total) * 100}%` }} /></div></div>
        <div className="parchment p-4"><div className="text-3xl font-display">{streak}</div><div className="text-xs text-muted-foreground">day check-in streak</div></div>
        <div className="parchment p-4"><div className="text-3xl font-display">{entries?.length ?? '…'}</div><div className="text-xs text-muted-foreground">entries in your journal</div></div>
      </section>

      <section className="parchment deckle p-5 space-y-2" aria-labelledby="qotd">
        <div className="font-smallcaps text-[10px] text-gold">Question of the day · {today.module.title}</div>
        <h2 id="qotd" className="text-2xl leading-snug">{today.q}</h2>
        <p className="text-sm text-muted-foreground">{today.why}</p>
        <Button asChild><Link to={`/workbook/module/${today.module.slug}#q-${today.key}`}>Answer it now</Link></Button>
      </section>

      <section aria-labelledby="tools-h" className="space-y-3">
        <h2 id="tools-h" className="text-2xl">Tools</h2>
        <p className="text-sm text-muted-foreground">Simple places to record how you feel, challenge an unhelpful thought, notice patterns, or talk privately.</p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {tools.map(({ to, title, body, Icon }) => (
            <li key={to}><Link to={to} className="parchment flex h-full gap-3 p-4 transition-colors hover:border-primary/50"><Icon className="mt-1 h-5 w-5 shrink-0 text-accent" aria-hidden /><span><span className="block font-medium">{title}</span><span className="block text-sm text-muted-foreground">{body}</span></span></Link></li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="mods-h" className="space-y-3">
        <h2 id="mods-h" className="text-2xl">Guided chapters</h2>
        <p className="text-sm text-muted-foreground">Each chapter turns a chart idea into ordinary questions about your real life. You do not need to know astrology to answer them.</p>
        <ul className="grid gap-3 md:grid-cols-2">
          {WORKBOOK_MODULES.map(m => {
            const done = m.questions.filter(q => answered.has(q.key)).length;
            return (
              <li key={m.slug}>
                <Link to={`/workbook/module/${m.slug}`} className="parchment block h-full p-4 transition-colors hover:border-primary/50">
                  <div className="font-smallcaps text-[10px] text-gold">{m.placements}</div>
                  <div className="mt-1 text-lg">{m.title}</div>
                  <div className="text-sm text-muted-foreground">{m.subtitle}</div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><div className="h-1.5 flex-1 rounded bg-muted" aria-hidden><div className="h-full rounded bg-accent" style={{ width: `${(done / m.questions.length) * 100}%` }} /></div>{done}/{m.questions.length} answered</div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

export function WorkbookModulePage() {
  const { slug } = useParams();
  const m = WORKBOOK_MODULES.find(x => x.slug === slug);
  if (!m) return <p>That chapter was not found. <Link className="underline" to="/workbook">Back to the Workbook</Link></p>;
  const i = WORKBOOK_MODULES.indexOf(m); const next = WORKBOOK_MODULES[i + 1];
  return (
    <Shell eyebrow={`Workbook · ${m.placements}`} title={m.title} intro={m.intro}>
      {userId => <ModuleInner userId={userId} m={m} next={next} />}
    </Shell>
  );
}

function ModuleInner({ userId, m, next }: { userId: string; m: WorkbookModule; next?: WorkbookModule }) {
  const entries = useEntries(userId);
  useEffect(() => {
    if (!entries || !window.location.hash) return;
    const el = document.getElementById(window.location.hash.slice(1));
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); (el as HTMLElement).focus({ preventScroll: true }); }
  }, [entries]);
  if (!entries) return <p role="status" className="text-muted-foreground">Opening your workbook…</p>;
  const latest = (key: string) => entries.find(e => e.kind === 'prompt' && e.prompt_key === key);
  return (
    <div className="space-y-6">
      <section className="parchment p-5" aria-labelledby="workbook-steps">
        <h2 id="workbook-steps" className="text-2xl">How to use this chapter</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ['1', 'Understand', m.plainMeaning],
            ['2', 'Recognize', m.dailyLife],
            ['3', 'Notice', 'Think of one recent, specific moment when this pattern appeared.'],
            ['4', 'Write', 'Answer one question honestly. A few sentences are enough.'],
            ['5', 'Choose', 'Use the guidance to pick one small action you can try next.'],
          ].map(([number, title, body]) => <li key={number} className="border-l border-gold/60 pl-3"><div className="text-xs text-gold">Step {number}</div><h3 className="font-medium">{title}</h3><p className="mt-1 text-xs text-muted-foreground">{body}</p></li>)}
        </ol>
      </section>
      <ol className="space-y-4">{m.questions.map((q, i) => <QuestionCard key={q.key} userId={userId} module={m} question={q} existing={latest(q.key)} index={i} />)}</ol>
      <section className="parchment p-5" aria-labelledby="explore-h">
        <h2 id="explore-h" className="text-xl">Explore this further</h2>
        <p className="mt-1 text-sm text-muted-foreground">Open a related explanation, or bring what you wrote into a private conversation with the Oracle.</p>
        <ul className="mt-2 flex flex-wrap gap-2">{m.explore.map(x => <li key={x.to}><Button asChild variant="outline" size="sm"><Link to={x.to}>{x.label}</Link></Button></li>)}<li><Button asChild variant="outline" size="sm"><Link to={`/workbook/companion`}>Talk it through with The Oracle Within</Link></Button></li></ul>
      </section>
      {next && <Button asChild><Link to={`/workbook/module/${next.slug}`}>Next chapter: {next.title} →</Link></Button>}
    </div>
  );
}

export function WorkbookCheckIn() {
  return <Shell eyebrow="Workbook · Daily" title="Daily Check-in" intro="One minute a day. Notice your mood, energy and body, and get care suggestions matched to your chart.">{userId => <CheckInInner userId={userId} />}</Shell>;
}

function CheckInInner({ userId }: { userId: string }) {
  const entries = useEntries(userId);
  const [mood, setMood] = useState(6); const [energy, setEnergy] = useState(6);
  const [emotions, setEmotions] = useState<string[]>([]); const [body, setBody] = useState(''); const [mind, setMind] = useState('');
  const [busy, setBusy] = useState(false);
  const last = entries?.find(e => e.kind === 'checkin');
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const answer = `Mood ${mood}/10, energy ${energy}/10. Feeling: ${emotions.join(', ') || 'not named'}. Body: ${body || '—'}. On my mind: ${mind || '—'}.`;
    try {
      const r = await requestFeedback({ tool: 'checkin', module: 'Daily check-in', answer, query: `moon emotions ${emotions.join(' ')} ${mind} ${body} self-care` });
      await saveEntry(userId, { kind: 'checkin', module: 'check-in', question: 'Daily check-in', answer, feedback: r.feedback, data: { mood, energy, emotions, body, mind, passages: r.passages } });
      setEmotions([]); setBody(''); setMind(''); toast.success('Check-in saved.'); changed();
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Could not save.'); }
    setBusy(false);
  };
  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="parchment space-y-5 p-5">
        <div className="space-y-2"><div id="mood-l" className="text-sm font-medium">Mood: <span className="text-gold">{mood}/10</span></div><Slider aria-labelledby="mood-l" min={1} max={10} step={1} value={[mood]} onValueChange={v => setMood(v[0])} /></div>
        <div className="space-y-2"><div id="energy-l" className="text-sm font-medium">Energy: <span className="text-gold">{energy}/10</span></div><Slider aria-labelledby="energy-l" min={1} max={10} step={1} value={[energy]} onValueChange={v => setEnergy(v[0])} /></div>
        <fieldset><legend className="text-sm font-medium mb-2">What are you feeling? (choose any)</legend>
          <div className="flex flex-wrap gap-2">{EMOTIONS.map(x => { const on = emotions.includes(x); return <button type="button" key={x} aria-pressed={on} onClick={() => setEmotions(v => on ? v.filter(y => y !== x) : [...v, x])} className={`min-h-10 rounded-full border px-3 text-sm ${on ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'}`}>{x}</button>; })}</div>
        </fieldset>
        <div className="space-y-1"><label htmlFor="ci-body" className="text-sm font-medium">How does your body feel?</label><Input id="ci-body" value={body} onChange={e => setBody(e.target.value)} placeholder="e.g. tight shoulders, rested, headache…" /></div>
        <div className="space-y-1"><label htmlFor="ci-mind" className="text-sm font-medium">What's on your mind?</label><Textarea id="ci-mind" rows={3} value={mind} onChange={e => setMind(e.target.value)} placeholder="One line is enough." /></div>
        <Button type="submit" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <CalendarHeart />}{busy ? 'Reading today…' : 'Save check-in & get guidance'}</Button>
      </form>
      <div aria-live="polite">{last && <section className="parchment p-5"><h2 className="text-xl">Latest check-in · {fmt(last.created_at)}</h2><p className="mt-1 text-sm text-muted-foreground">{last.answer}</p><Feedback entry={last} prefix="ci" /></section>}</div>
    </div>
  );
}

export function WorkbookReframe() {
  return <Shell eyebrow="Workbook · CBT" title="Thought Reframe" intro="When something stings, walk it through five steps. Your chart helps explain why it hit so hard, and what a balanced view looks like.">{userId => <ReframeInner userId={userId} />}</Shell>;
}

function ReframeInner({ userId }: { userId: string }) {
  const entries = useEntries(userId);
  const empty = { situation: '', thought: '', feeling: '', intensity: 7, evidenceFor: '', evidenceAgainst: '', balanced: '' };
  const [f, setF] = useState(empty); const [busy, setBusy] = useState(false);
  const last = entries?.find(e => e.kind === 'reframe');
  const field = (key: keyof typeof empty, label: string, hint: string, rows = 3) => (
    <div className="space-y-1"><label htmlFor={`rf-${key}`} className="text-sm font-medium">{label}</label><p id={`rf-${key}-h`} className="text-xs text-muted-foreground">{hint}</p><Textarea id={`rf-${key}`} aria-describedby={`rf-${key}-h`} rows={rows} value={String(f[key])} onChange={e => setF(v => ({ ...v, [key]: e.target.value }))} /></div>
  );
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!f.situation.trim() || !f.thought.trim()) return; setBusy(true);
    const answer = `Situation: ${f.situation}\nAutomatic thought: ${f.thought}\nFeelings: ${f.feeling} (intensity ${f.intensity}/10)\nEvidence for: ${f.evidenceFor || '—'}\nEvidence against: ${f.evidenceAgainst || '—'}\nMy balanced thought so far: ${f.balanced || '—'}`;
    try {
      const r = await requestFeedback({ tool: 'reframe', module: 'Thought reframe', answer, query: `${f.situation} ${f.thought} ${f.feeling} moon mercury pluto` });
      await saveEntry(userId, { kind: 'reframe', module: 'reframe', question: f.situation.slice(0, 200), answer, feedback: r.feedback, data: { ...f, passages: r.passages } });
      setF(empty); toast.success('Reframe saved.'); changed();
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Could not save.'); }
    setBusy(false);
  };
  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="parchment space-y-4 p-5">
        {field('situation', '1. What happened?', 'Just the facts — who, what, where.')}
        {field('thought', '2. What went through your mind?', 'The first, unedited thought. Quote it.')}
        {field('feeling', '3. What did you feel?', 'Name the emotions, e.g. hurt, angry, ashamed.', 2)}
        <div className="space-y-2"><div id="rf-int" className="text-sm font-medium">How strong? <span className="text-gold">{f.intensity}/10</span></div><Slider aria-labelledby="rf-int" min={1} max={10} step={1} value={[f.intensity]} onValueChange={v => setF(x => ({ ...x, intensity: v[0] }))} /></div>
        <div className="grid gap-4 sm:grid-cols-2">{field('evidenceFor', '4a. Evidence the thought is true', 'What facts support it?')}{field('evidenceAgainst', '4b. Evidence it is not the whole story', 'What doesn’t fit?')}</div>
        {field('balanced', '5. A more balanced thought (optional)', 'Try one — the guide will build on it.', 2)}
        <Button type="submit" disabled={busy || !f.situation.trim() || !f.thought.trim()}>{busy ? <Loader2 className="animate-spin" /> : <Scale />}{busy ? 'Untangling…' : 'Save & reframe with my chart'}</Button>
      </form>
      <div aria-live="polite">{last && <section className="parchment p-5"><h2 className="text-xl">Latest reframe · {fmt(last.created_at)}</h2><p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{last.answer}</p><Feedback entry={last} prefix="rf" /></section>}</div>
    </div>
  );
}

export function WorkbookJournal() {
  return <Shell eyebrow="Workbook · Journal" title="Journal & Patterns" intro="Everything you have written, how your mood has moved, and which themes keep returning.">{userId => <JournalInner userId={userId} />}</Shell>;
}

function JournalInner({ userId }: { userId: string }) {
  const entries = useEntries(userId);
  const [kind, setKind] = useState<'all' | WorkbookEntry['kind']>('all');
  const [q, setQ] = useState('');
  if (!entries) return <p role="status" className="text-muted-foreground">Opening your journal…</p>;
  const checkins = entries.filter(e => e.kind === 'checkin').slice(0, 14).reverse();
  const shown = entries.filter(e => (kind === 'all' || e.kind === kind) && (!q || `${e.question} ${e.answer}`.toLowerCase().includes(q.toLowerCase())));
  const byModule = WORKBOOK_MODULES.map(m => ({ m, n: entries.filter(e => e.kind === 'prompt' && e.module === m.slug).length })).filter(x => x.n);
  const counts = entries.reduce<Record<string, number>>((a, e) => { ((e.data?.emotions as string[] | undefined) ?? []).forEach(x => { a[x] = (a[x] ?? 0) + 1; }); return a; }, {});
  const remove = async (id: string) => { const { error } = await supabase.from('workbook_entries').delete().eq('id', id); if (error) toast.error(error.message); else { toast.success('Entry deleted.'); changed(); } };
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2" aria-label="Patterns">
        <div className="parchment p-4">
          <h2 className="text-lg">Mood & energy · last {checkins.length} check-ins</h2>
          {checkins.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">No check-ins yet. <Link className="underline" to="/workbook/check-in">Do your first one</Link>.</p> : (
            <>
              <div className="mt-3 flex h-28 items-end gap-1" role="img" aria-label={`Mood scores: ${checkins.map(c => c.data?.mood).join(', ')}`}>
                {checkins.map(c => <div key={c.id} className="flex flex-1 items-end gap-0.5"><div className="flex-1 rounded-t bg-primary" style={{ height: `${Number(c.data?.mood ?? 0) * 10}%` }} /><div className="flex-1 rounded-t bg-accent" style={{ height: `${Number(c.data?.energy ?? 0) * 10}%` }} /></div>)}
              </div>
              <div className="mt-2 flex gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-primary" aria-hidden />Mood</span><span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-accent" aria-hidden />Energy</span></div>
            </>
          )}
        </div>
        <div className="parchment p-4 space-y-3">
          <h2 className="text-lg">What keeps returning</h2>
          {Object.keys(counts).length > 0 && <div className="flex flex-wrap gap-2">{Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([k, n]) => <span key={k} className="rounded-full bg-muted px-3 py-1 text-xs">{k} · {n}</span>)}</div>}
          {byModule.length > 0 ? <ul className="text-sm space-y-1">{byModule.map(({ m, n }) => <li key={m.slug}><Link className="underline" to={`/workbook/module/${m.slug}`}>{m.title}</Link> — {n} answer{n === 1 ? '' : 's'}</li>)}</ul> : <p className="text-sm text-muted-foreground">Answer a few guided questions to see your themes.</p>}
        </div>
      </section>
      <div className="flex flex-wrap items-center gap-2">
        <Input aria-label="Search your journal" placeholder="Search your journal…" value={q} onChange={e => setQ(e.target.value)} className="max-w-xs" />
        {(['all', 'prompt', 'checkin', 'reframe'] as const).map(k => <Button key={k} size="sm" variant={kind === k ? 'default' : 'outline'} aria-pressed={kind === k} onClick={() => setKind(k)}>{k === 'all' ? 'All' : k === 'prompt' ? 'Guided answers' : k === 'checkin' ? 'Check-ins' : 'Reframes'}</Button>)}
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">{shown.length} entr{shown.length === 1 ? 'y' : 'ies'}</p>
      <ul className="space-y-3">
        {shown.map(e => (
          <li key={e.id}>
            <details className="parchment p-4 group">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3 [&::-webkit-details-marker]:hidden">
                <span className="min-w-0"><span className="block text-[10px] font-smallcaps text-gold">{e.kind === 'prompt' ? WORKBOOK_MODULES.find(m => m.slug === e.module)?.title ?? 'Guided' : e.kind === 'checkin' ? 'Check-in' : 'Reframe'} · {fmt(e.created_at)}</span><span className="block truncate">{e.question}</span></span>
                <span className="text-xs text-muted-foreground group-open:hidden">Open</span>
              </summary>
              <p className="mt-3 whitespace-pre-wrap text-sm">{e.answer}</p>
              <Feedback entry={e} prefix={`j-${e.id.slice(0, 8)}`} />
              <Button variant="ghost" size="sm" className="mt-3" onClick={() => remove(e.id)}><Trash2 />Delete entry</Button>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
