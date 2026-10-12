import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BRAND_COPY } from '@/content/brandCopy';

type Row = { id?: string; slug: string; title: string; headline: string; subheadline: string; body: string; cta_label: string; cta_link: string; published: boolean };
const blank: Row = { slug: '', title: '', headline: '', subheadline: '', body: '', cta_label: 'Create my free chart', cta_link: '/auth', published: false };

/** Admin: create, edit, publish and delete marketing landing pages; copy ready-made brand text. */
export function MarketingPages() {
  const [rows, setRows] = useState<Row[]>([]);
  const [edit, setEdit] = useState<Row | null>(null);
  const load = () => supabase.from('marketing_pages').select('*').order('created_at').then(({ data }) => setRows((data ?? []) as Row[]));
  useEffect(() => { void load(); }, []);
  const save = async () => {
    if (!edit) return;
    const slug = edit.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (!slug || !edit.headline.trim()) return toast.error('Add a web address and a headline.');
    const row = { ...edit, slug, updated_at: new Date().toISOString() };
    const { error } = edit.id ? await supabase.from('marketing_pages').update(row).eq('id', edit.id) : await supabase.from('marketing_pages').insert(row);
    if (error) return toast.error(error.message);
    toast.success('Saved'); setEdit(null); void load();
  };
  const del = async (r: Row) => { if (!confirm(`Delete “${r.title || r.slug}”?`)) return; await supabase.from('marketing_pages').delete().eq('id', r.id!); void load(); };
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex items-center justify-between"><h2 className="font-display text-2xl">Landing pages</h2><Button onClick={() => setEdit({ ...blank })}>New landing page</Button></div>
        {rows.length === 0 && <p className="text-sm text-muted-foreground">No landing pages yet. Each one lives at /lp/your-address and can be shared in ads or social posts.</p>}
        {rows.map(r => <div key={r.id} className="parchment p-4 flex flex-wrap items-center gap-3"><div className="flex-1 min-w-0"><div className="font-display text-lg">{r.title || r.headline}</div><a className="text-xs underline" href={`/lp/${r.slug}`} target="_blank" rel="noreferrer">/lp/{r.slug}</a> <span className="text-xs text-muted-foreground">· {r.published ? 'Published' : 'Draft'}</span></div><Button size="sm" variant="outline" onClick={() => setEdit(r)}>Edit</Button><Button size="sm" variant="ghost" onClick={async () => { await supabase.from('marketing_pages').update({ published: !r.published }).eq('id', r.id!); void load(); }}>{r.published ? 'Unpublish' : 'Publish'}</Button><Button size="sm" variant="ghost" className="text-destructive" onClick={() => del(r)}>Delete</Button></div>)}
        {edit && <div className="parchment p-5 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3"><Input placeholder="Web address, e.g. love-reading" value={edit.slug} onChange={e => setEdit({ ...edit, slug: e.target.value })} /><Input placeholder="Internal title" value={edit.title} onChange={e => setEdit({ ...edit, title: e.target.value })} /></div>
          <Input placeholder="Headline" value={edit.headline} onChange={e => setEdit({ ...edit, headline: e.target.value })} />
          <Input placeholder="Sub-headline" value={edit.subheadline} onChange={e => setEdit({ ...edit, subheadline: e.target.value })} />
          <Textarea rows={10} placeholder="Body text (Markdown: ## headings, - bullets, **bold**)" value={edit.body} onChange={e => setEdit({ ...edit, body: e.target.value })} />
          <div className="grid sm:grid-cols-2 gap-3"><Input placeholder="Button label" value={edit.cta_label} onChange={e => setEdit({ ...edit, cta_label: e.target.value })} /><Input placeholder="Button link, e.g. /auth or /pricing" value={edit.cta_link} onChange={e => setEdit({ ...edit, cta_link: e.target.value })} /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={edit.published} onChange={e => setEdit({ ...edit, published: e.target.checked })} /> Published</label>
          <div className="flex gap-2"><Button onClick={save}>Save</Button><Button variant="ghost" onClick={() => setEdit(null)}>Cancel</Button></div>
        </div>}
      </section>
      <section className="space-y-3">
        <h2 className="font-display text-2xl">Ready-made Zodaci copy</h2>
        <p className="text-sm text-muted-foreground">Copy any block for app stores, social bios, ads, emails or press.</p>
        {BRAND_COPY.map(c => <div key={c.label} className="parchment p-4 space-y-2"><div className="flex justify-between gap-3"><h3 className="font-medium">{c.label}</h3><Button size="sm" variant="outline" onClick={() => { void navigator.clipboard.writeText(c.text); toast.success('Copied'); }}>Copy</Button></div><p className="whitespace-pre-line text-sm text-muted-foreground">{c.text}</p></div>)}
      </section>
    </div>
  );
}
