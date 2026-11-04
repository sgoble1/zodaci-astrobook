import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useLibrary';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Button } from '@/components/ui/button';
import { PanelTitle, Stamp } from '@/components/observatory/Observatory';
import { MEMBER_CHARACTERS, STAFF } from '@/lib/observatory';
import { toast } from 'sonner';
import members from '@/assets/observatory-members.jpg';
import staff from '@/assets/observatory-staff.jpg';

/** Portrait from the 4×3 member card sheet, in MEMBER_CHARACTERS order. */
function Portrait({ index, className }: { index: number; className?: string }) {
  const col = index % 4, row = Math.floor(index / 4);
  return <div role="img" aria-hidden className={className} style={{ backgroundImage: `url(${members})`, backgroundSize: '400% 300%', backgroundPosition: `${(col / 3) * 100}% ${(row / 2) * 100}%` }} />;
}

/** Character selection: pick the member character who appears in your observatory. Owner-only choice. */
export default function Characters() {
  usePageMeta('Choose your character — Zodaci', 'Meet the Astral Research Authority staff and choose the observatory character who represents you.');
  const session = useSession();
  const [chosen, setChosen] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!session) { setChosen(null); return; }
    let on = true;
    supabase.from('member_characters').select('character_id').eq('user_id', session.user.id).maybeSingle().then(({ data }) => { if (on) setChosen(data?.character_id ?? null); });
    return () => { on = false; };
  }, [session?.user.id]);
  const choose = async (id: string) => {
    if (!session) { window.location.assign(`/auth?next=${encodeURIComponent('/characters')}`); return; }
    setSaving(true);
    const { error } = await supabase.from('member_characters').upsert({ user_id: session.user.id, character_id: id, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) { toast.error('Your character could not be saved. Please try again.'); return; }
    setChosen(id); toast.success('Character saved to your observatory.');
  };
  return (
    <div className="space-y-6">
      <header className="obs-panel p-6"><p className="font-label text-xs text-primary">Grand Observatory · Personnel office</p><h1 className="mt-2 font-display text-4xl">Choose your character</h1><p className="mt-2 max-w-2xl text-muted-foreground">Pick the observatory member who represents you. They appear across your observatory, and later in your AstroComics and books.</p></header>
      <section aria-labelledby="mem-h" className="obs-panel p-5 sm:p-6">
        <PanelTitle eyebrow="Twelve members"><span id="mem-h">Observatory members</span></PanelTitle>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MEMBER_CHARACTERS.map((c, i) => {
            const on = chosen === c.id;
            return <li key={c.id} className={`obs-paper overflow-hidden ${'featured' in c ? 'sm:col-span-2 lg:col-span-2' : ''} ${on ? 'ring-4 ring-primary' : ''}`}>
              <Portrait index={i} className={`w-full bg-no-repeat ${'featured' in c ? 'aspect-[16/9]' : 'aspect-[4/3]'}`} />
              <div className="p-4"><div className="flex items-center justify-between gap-2"><h3 className="font-label text-lg">{c.name}</h3>{'featured' in c && <Stamp>Featured</Stamp>}</div><p className="mt-1 text-sm text-muted-foreground">{c.blurb}</p>
                <Button size="sm" className="mt-3" variant={on ? 'primary' : 'signal'} disabled={saving} aria-pressed={on} onClick={() => choose(c.id)}>{on ? <><Check />Your character</> : 'Choose'}</Button></div>
            </li>;
          })}
        </ul>
      </section>
      <section aria-labelledby="staff-h" className="obs-panel p-5 sm:p-6">
        <PanelTitle eyebrow="Astral Research Authority"><span id="staff-h">Observatory staff</span></PanelTitle>
        <img src={staff} alt="The nine observatory staff standing before the Grand Observatory" width={1920} height={1088} loading="lazy" className="w-full rounded-md" />
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-3">{Object.values(STAFF).map(s => <li key={s.title}><span className="font-label">{s.title}</span> <span className="text-muted-foreground">· {s.department}</span></li>)}</ul>
      </section>
    </div>
  );
}
