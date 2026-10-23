import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BRAND_COPY } from '@/content/brandCopy';
import { PromoVideo } from '@/components/brand/PromoVideo';
import { PROMO_VIDEO, FILM_MARKER } from '@/content/promoVideo';
import promo1080 from '@/assets/videos/zodaci-promo-1080.mp4.asset.json';
import promo720 from '@/assets/videos/zodaci-promo-720.mp4.asset.json';

type Row = { id?: string; slug: string; title: string; headline: string; subheadline: string; body: string; cta_label: string; cta_link: string; published: boolean };
const blank: Row = { slug: '', title: '', headline: '', subheadline: '', body: '', cta_label: 'Create my free chart', cta_link: '/auth', published: false };

/** Admin: create, edit, publish and delete marketing landing pages; copy ready-made brand text. */
export function MarketingPages() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [edit, setEdit] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const load = () => supabase.from('marketing_pages').select('*').order('created_at').then(({ data, error }) => {
    if (error) { setLoadFailed(true); return; }
    setLoadFailed(false); setRows((data ?? []) as Row[]);
  }, () => setLoadFailed(true));
  useEffect(() => { void load(); }, []);
  const togglePublished = async (r: Row) => {
    if (busyId) return;
    setBusyId(r.id!);
    const { error } = await supabase.from('marketing_pages').update({ published: !r.published }).eq('id', r.id!);
    setBusyId(null);
    if (error) { toast.error(`Couldn’t ${r.published ? 'unpublish' : 'publish'} “${r.title || r.slug}”. Nothing changed — please try again.`); return; }
    toast.success(r.published ? 'Moved back to draft' : 'Published'); void load();
  };
  const save = async () => {
    if (!edit || saving) return;
    const slug = edit.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (!slug || !edit.headline.trim()) return toast.error('Add a web address and a headline.');
    const row = { ...edit, slug, updated_at: new Date().toISOString() };
    setSaving(true);
    const { error } = edit.id ? await supabase.from('marketing_pages').update(row).eq('id', edit.id) : await supabase.from('marketing_pages').insert(row);
    setSaving(false);
    if (error) return toast.error(error.code === '23505' ? 'That web address is already used by another page. Choose a different one.' : 'The page couldn’t be saved. Your edits are still here — please try again.');
    toast.success('Saved'); setEdit(null); void load();
  };
  const del = async (r: Row) => {
    if (!confirm(`Delete “${r.title || r.slug}”?`)) return;
    const { error } = await supabase.from('marketing_pages').delete().eq('id', r.id!);
    if (error) return toast.error(`Couldn’t delete: ${error.message}`);
    toast.success('Deleted'); void load();
  };
  const copy = (text: string, what: string) => navigator.clipboard.writeText(text).then(() => toast.success(`${what} copied`), () => toast.error('Copy didn’t work — select the text and copy it instead.'));
  return (
    <div className="space-y-8">
      <section aria-labelledby="film-admin-h" className="space-y-4">
        <h2 id="film-admin-h" className="font-display text-2xl">Brand film</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">The {PROMO_VIDEO.lengthLabel} promo film plays on the welcome page, the public home page and the demo. Add it to any landing page by putting <code className="rounded bg-muted px-1">{FILM_MARKER}</code> on its own line in the body.</p>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <PromoVideo />
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">For social posts and ads:</p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm"><a href={promo1080.url} download="zodaci-promo-1080p.mp4">Download 1080p MP4</a></Button>
              <Button asChild variant="outline" size="sm"><a href={promo720.url} download="zodaci-promo-720p.mp4">Download 720p MP4</a></Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" onClick={() => copy('https://zodaci.com/welcome', 'Welcome page link')}>Copy welcome page link</Button>
              <Button variant="ghost" size="sm" onClick={() => copy(PROMO_VIDEO.summary, 'Film description')}>Copy film description</Button>
            </div>
            <p className="text-xs text-muted-foreground">Music only, no narration. Its numbers (readings, house systems, Academy lessons) match the site today; update the film if those change.</p>
          </div>
        </div>
      </section>
      <section className="space-y-3">
        <div className="flex items-center justify-between"><h2 className="font-display text-2xl">Landing pages</h2><Button onClick={() => setEdit({ ...blank })}>New landing page</Button></div>
        {loadFailed && <div role="alert" className="parchment p-4 text-sm"><p className="font-medium">Landing pages couldn’t load.</p><p className="mt-1 text-muted-foreground">Your pages are safe — the list just didn’t arrive.</p><Button size="sm" variant="outline" className="mt-3" onClick={() => void load()}>Try again</Button></div>}
        {!loadFailed && rows === null && <p role="status" className="text-sm text-muted-foreground">Loading landing pages…</p>}
        {!loadFailed && rows?.length === 0 && <p className="text-sm text-muted-foreground">No landing pages yet. Each one lives at /lp/your-address and can be shared in ads or social posts.</p>}
        {(rows ?? []).map(r => <div key={r.id} className="parchment p-4 flex flex-wrap items-center gap-3"><div className="flex-1 min-w-0"><div className="font-display text-lg">{r.title || r.headline}</div><a className="text-xs underline" href={`/lp/${r.slug}`} target="_blank" rel="noreferrer">/lp/{r.slug}</a> <span className="text-xs text-muted-foreground">· {r.published ? 'Published' : 'Draft'}</span></div><Button size="sm" variant="outline" onClick={() => setEdit(r)}>Edit</Button><Button size="sm" variant="ghost" disabled={busyId === r.id} onClick={() => void togglePublished(r)}>{busyId === r.id ? 'Saving…' : r.published ? 'Unpublish' : 'Publish'}</Button><Button size="sm" variant="ghost" className="text-destructive" onClick={() => del(r)}>Delete</Button></div>)}
        {edit && <div className="parchment p-5 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1"><Label htmlFor="lp-slug">Web address</Label><Input id="lp-slug" placeholder="e.g. love-reading" value={edit.slug} onChange={e => setEdit({ ...edit, slug: e.target.value })} /><p className="text-xs text-muted-foreground">Lives at /lp/{edit.slug || 'your-address'}</p></div>
            <div className="space-y-1"><Label htmlFor="lp-title">Internal title</Label><Input id="lp-title" value={edit.title} onChange={e => setEdit({ ...edit, title: e.target.value })} /></div>
          </div>
          <div className="space-y-1"><Label htmlFor="lp-headline">Headline</Label><Input id="lp-headline" value={edit.headline} onChange={e => setEdit({ ...edit, headline: e.target.value })} /></div>
          <div className="space-y-1"><Label htmlFor="lp-sub">Sub-headline</Label><Input id="lp-sub" value={edit.subheadline} onChange={e => setEdit({ ...edit, subheadline: e.target.value })} /></div>
          <div className="space-y-1"><Label htmlFor="lp-body">Body text</Label><Textarea id="lp-body" rows={10} aria-describedby="lp-body-hint" value={edit.body} onChange={e => setEdit({ ...edit, body: e.target.value })} /><p id="lp-body-hint" className="text-xs text-muted-foreground">Markdown: ## headings, - bullets, **bold**. Put {FILM_MARKER} on its own line to show the film.</p></div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1"><Label htmlFor="lp-cta">Button label</Label><Input id="lp-cta" value={edit.cta_label} onChange={e => setEdit({ ...edit, cta_label: e.target.value })} /></div>
            <div className="space-y-1"><Label htmlFor="lp-link">Button link</Label><Input id="lp-link" placeholder="e.g. /auth or /pricing" value={edit.cta_link} onChange={e => setEdit({ ...edit, cta_link: e.target.value })} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={edit.published} onChange={e => setEdit({ ...edit, published: e.target.checked })} /> Published</label>
          <div className="flex gap-2"><Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button><Button variant="ghost" onClick={() => setEdit(null)} disabled={saving}>Cancel</Button></div>
        </div>}
      </section>
      <section className="space-y-3">
        <h2 className="font-display text-2xl">Ready-made Zodaci copy</h2>
        <p className="text-sm text-muted-foreground">Copy any block for app stores, social bios, ads, emails or press.</p>
        {BRAND_COPY.map(c => <div key={c.label} className="parchment p-4 space-y-2"><div className="flex justify-between gap-3"><h3 className="font-medium">{c.label}</h3><Button size="sm" variant="outline" onClick={() => copy(c.text, c.label)}>Copy</Button></div><p className="whitespace-pre-line text-sm text-muted-foreground">{c.text}</p></div>)}
      </section>
    </div>
  );
}
