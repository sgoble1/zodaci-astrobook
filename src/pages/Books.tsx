import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Check, Truck, Plus, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { useMyBirth } from '@/lib/myBirth';
import { streamImage } from '@/lib/streamImage';
import { BOOK_SECTIONS, COVER_STYLES, bookTotal, money } from '@/lib/books';
import bookPhoto from '@/assets/astrobook-public.jpg';
import { ManuscriptPreview } from '@/components/books/ManuscriptPreview';
import { BOOK_EXAMPLES } from '@/content/bookExamples';

export default function Books() {
  const sub = useSubscription(); const birth = useMyBirth(); const nav = useNavigate();
  const [edition, setEdition] = useState<'standard'|'expanded'>('standard');
  const [extras, setExtras] = useState<string[]>([]);
  const [covers, setCovers] = useState<Record<string,{ url: string; final: boolean }>>({});
  const [selected, setSelected] = useState(''); const [busy, setBusy] = useState(''); const [error, setError] = useState('');
  const [address, setAddress] = useState({ name: '', line1: '', line2: '', city: '', state: '', postal_code: '', country: 'US' });
  const [manuscript, setManuscript] = useState<{ blob: Blob; pages: number; config: string } | null>(null);
  const config = JSON.stringify([edition, extras, selected, birth]);
  const manuscriptReady = manuscript?.config === config;
  const generate = async () => {
    setError(''); setBusy('Generating covers');
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error('Sign in and save your birth details before creating covers.');
      for (const style of COVER_STYLES) {
        if (covers[style]?.final) continue;
        setBusy(`Creating ${style.toLowerCase()}…`);
        await streamImage(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/book-cover`, { style }, (url, final) => setCovers(c => ({ ...c, [style]: { url, final } })), undefined, { Authorization: `Bearer ${data.session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY });
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Cover generation failed.'); }
    finally { setBusy(''); }
  };
  const order = async () => {
    setBusy('Saving your book…'); setError('');
    try {
      const cover = covers[selected];
      if (!sub.userId || !cover?.final || !manuscript || !manuscriptReady) throw new Error('Choose a finished cover and compose your manuscript first.');
      const id = crypto.randomUUID(); const path = `${sub.userId}/book-covers/${id}.png`;
      const blob = await fetch(cover.url).then(r => r.blob());
      const upload = await supabase.storage.from('library').upload(path, blob, { contentType: 'image/png' });
      if (upload.error) throw upload.error;
      const manuscriptPath = `${sub.userId}/manuscripts/${id}.pdf`;
      const uploadedPdf = await supabase.storage.from('library').upload(manuscriptPath, manuscript.blob, { contentType: 'application/pdf' });
      if (uploadedPdf.error) throw uploadedPdf.error;
      const { error: err } = await supabase.from('book_orders').insert({ id, user_id: sub.userId, edition, base_price_cents: edition === 'expanded' ? 8000 : 4500, extra_sections: extras.map(s => s.trim()).filter(Boolean), cover_path: path, cover_style: selected, shipping_address: address, manuscript_path: manuscriptPath, manuscript_pages: manuscript.pages });
      if (err) throw err;
      nav(`/orders?order=${id}`);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save your order.'); }
    finally { setBusy(''); }
  };
  return <article className="space-y-10">
    <header className="relative isolate overflow-hidden rounded min-h-[360px] flex items-end"><img src={bookPhoto} alt="AstroBook softcover and sample chart pages" width={1536} height={1024} className="absolute inset-0 -z-20 h-full w-full object-cover" /><div className="absolute inset-0 -z-10 bg-background/65" /><div className="p-6 sm:p-10"><p className="font-smallcaps text-gold text-xs">Made for your birth chart</p><h1 className="text-4xl mt-2">AstroBook, in print.</h1><p className="mt-4 max-w-lg">Your personal chart, thoughtful interpretations and space for reflection. Locally printed, softcover, delivered to your door.</p><p className="text-sm text-muted-foreground mt-3">Illustrative sample · your cover is previewed below.</p></div></header>
    <section aria-labelledby="edition-title"><h2 id="edition-title" className="text-2xl mb-4">Choose your edition</h2><div className="grid sm:grid-cols-2 gap-4">{(['standard','expanded'] as const).map(e => <Button key={e} variant="outline" aria-pressed={edition === e} onClick={() => setEdition(e)} className={`h-auto whitespace-normal p-5 text-left justify-between ${edition === e ? 'border-primary bg-primary/10' : ''}`}><span><span className="block text-xl capitalize">{e}</span><span className="block text-muted-foreground mt-2">About {e === 'standard' ? 250 : 400} pages · softcover</span></span><span className="text-xl">{e === 'standard' ? '$45' : '$80'}{edition === e && <Check className="mt-2" />}</span></Button>)}</div><p className="text-sm text-muted-foreground mt-3">Expanded includes deeper treatment of the same four foundations. Final page count depends on layout and added sections.</p></section>
    <section aria-labelledby="example-covers"><h2 id="example-covers" className="text-2xl">A few possible covers</h2><p className="mt-3 text-sm text-muted-foreground">Placeholder examples only — these are not based on your chart or anyone else’s. Your personal cover previews are generated separately below.</p><div className="grid sm:grid-cols-3 gap-5 mt-5">{BOOK_EXAMPLES.map(example => <figure key={example.style}><div className="relative rounded overflow-hidden aspect-[2/3] bg-card"><img src={example.image} alt={`${example.style} placeholder AstroBook cover`} width={768} height={1152} loading="lazy" className="w-full h-full object-cover" /><div className="absolute bottom-0 inset-x-0 bg-background/80 p-5"><p className="text-xs text-accent">Zodaci</p><p className="text-2xl font-display mt-2">AstroBook</p><p className="text-xs text-muted-foreground mt-2">Example artwork</p></div></div><figcaption className="mt-3"><h3 className="text-lg">{example.style}</h3><p className="text-sm text-muted-foreground mt-1">{example.detail}</p></figcaption></figure>)}</div></section>
    <section><h2 className="text-2xl">Your table of contents</h2><ol className="mt-4 divide-y divide-border">{BOOK_SECTIONS.map((s,i) => <li key={s.title} className="py-4 flex gap-4"><span className="text-gold">0{i+1}</span><div><h3 className="text-lg">{s.title}</h3><p className="text-sm text-muted-foreground mt-1">{s.description}</p></div></li>)}</ol><p className="text-sm text-muted-foreground">Includes a table of contents, your calculated chart and clear distinctions between astronomical facts and symbolic interpretation.</p></section>
    <section><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl">Make it more yours</h2><Button variant="outline" disabled={extras.length >= 2} onClick={() => setExtras(e => [...e,''])}><Plus />Add section · $6.99</Button></div><p className="text-sm text-muted-foreground mt-2">Up to two extra sections. For example, creativity, communication or a specific life theme.</p>{extras.map((s,i) => <div className="flex gap-2 mt-3" key={i}><Input aria-label={`Extra section ${i+1}`} maxLength={160} value={s} onChange={e => setExtras(x => x.map((v,n) => n === i ? e.target.value : v))} placeholder="Section topic" /><Button size="icon" variant="ghost" aria-label={`Remove extra section ${i+1}`} onClick={() => setExtras(x => x.filter((_,n) => n !== i))}><Trash2 /></Button></div>)}</section>
    <section><div className="flex flex-wrap justify-between gap-3"><h2 className="text-2xl">Choose your personal cover</h2><Button disabled={!!busy || !sub.userId || !birth} onClick={generate}><Sparkles />Create three cover previews</Button></div><p className="text-sm text-muted-foreground mt-3">Artwork draws on your saved planetary signs; it is symbolic, not a calculated chart diagram. The printed title is added separately.</p><div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">{COVER_STYLES.map(style => <Button key={style} variant="outline" disabled={!covers[style]?.final || !!busy} aria-pressed={selected === style} onClick={() => setSelected(style)} className={`h-auto flex-col p-0 overflow-hidden ${selected === style ? 'ring-2 ring-primary' : ''}`}><div className="aspect-[2/3] w-full bg-muted flex items-center justify-center relative">{covers[style] ? <img src={covers[style].url} alt={`${style} personal book cover`} className={`w-full h-full object-cover ${covers[style].final ? '' : 'blur-lg'}`} /> : <BookOpen className="w-12 h-12 text-muted-foreground" />}<span className="absolute top-5 inset-x-2 font-display text-xl text-foreground bg-background/70 py-2">{birth?.name ? `${birth.name}’s AstroBook` : 'My AstroBook'}</span></div><span className="p-4 whitespace-normal">{style}{selected === style && ' · Selected'}</span></Button>)}</div>{!sub.userId && <p className="mt-3"><Link to="/auth" className="underline text-gold">Sign in</Link> to create your covers and order.</p>}{sub.userId && !birth && <Link to="/start" className="underline text-gold">Add your birth details first</Link>}</section>
    {birth && <ManuscriptPreview key={config} birth={birth} edition={edition} extras={extras} coverUrl={covers[selected]?.final ? covers[selected].url : undefined} onReady={file => setManuscript({ ...file, config })} />}
    <section><h2 className="text-2xl">US delivery</h2><div className="flex gap-3 mt-4"><Truck className="text-gold shrink-0" /><p>Free shipping within the United States. Approximately 3 days to produce after your book is approved, then approximately 5–7 days in transit. Estimates are not guaranteed.</p></div><ul className="text-sm text-muted-foreground mt-4 space-y-2"><li><a href="https://www.usps.com/ship/" target="_blank" rel="noreferrer" className="underline">USPS</a> · Priority Mail and Ground Advantage; service depends on destination.</li><li><a href="https://www.ups.com/us/en/support/shipping-support/shipping-services" target="_blank" rel="noreferrer" className="underline">UPS</a> · Ground delivery; timing varies by distance.</li><li><a href="https://www.fedex.com/en-us/shipping/ground.html" target="_blank" rel="noreferrer" className="underline">FedEx</a> · Ground / Home Delivery; availability varies.</li><li>Carrier chosen during fulfillment. Tracking appears in My Orders when shipped. No expedited or international service at launch.</li></ul></section>
    <form onSubmit={e => { e.preventDefault(); void order(); }} className="space-y-4 border-t border-border pt-6"><h2 className="text-2xl">Where should we send it?</h2><p className="text-sm text-muted-foreground">Save a draft now. Payment is closed until the full manuscript and printer specifications are ready; a short preview is not a 250- or 400-page book.</p><div className="grid sm:grid-cols-2 gap-4">{Object.entries(address).filter(([k]) => k !== 'country').map(([k,v]) => <div key={k} className={k === 'line1' || k === 'line2' ? 'sm:col-span-2' : ''}><Label htmlFor={`ship-${k}`}>{({ name:'Full name',line1:'Street address',line2:'Apartment / suite (optional)',city:'City',state:'State',postal_code:'ZIP code' } as Record<string,string>)[k]}</Label><Input id={`ship-${k}`} value={v} required={k !== 'line2'} maxLength={k === 'state' ? 2 : 120} pattern={k === 'postal_code' ? '[0-9]{5}(-[0-9]{4})?' : undefined} onChange={e => setAddress(a => ({ ...a,[k]: e.target.value }))} /></div>)}</div><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-2xl font-display">{money(bookTotal(edition,extras.length))}</p><p className="text-sm text-muted-foreground">Free US shipping · applicable tax at checkout when ordering opens</p></div><Button type="submit" disabled={!!busy || !sub.userId || !covers[selected]?.final || !manuscriptReady || extras.some(s => !s.trim())}>Save book draft</Button></div></form>
    {busy && <p role="status" className="text-gold">{busy}</p>}{error && <p role="alert" className="text-destructive break-words">{error}</p>}
  </article>;
}